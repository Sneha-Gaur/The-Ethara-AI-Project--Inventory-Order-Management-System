"""

Database bootstrap: verify connection, create DB/tables, run migrations, seed data.

"""

import logging

from urllib.parse import urlparse



from sqlalchemy import create_engine, inspect, text

from sqlalchemy.engine import Engine

from sqlalchemy.exc import OperationalError



from app.config import settings



logger = logging.getLogger(__name__)





def _set_active_url(url: str) -> None:

    import app.config as cfg



    cfg.ACTIVE_DATABASE_URL = url





_engine: Engine | None = None

_db_status: dict = {"connected": False, "url": "", "backend": "unknown", "error": None}





def get_status() -> dict:

    return dict(_db_status)





def _test_engine(url: str) -> Engine | None:

    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}

    try:

        eng = create_engine(

            url,

            connect_args=connect_args,

            pool_pre_ping=not url.startswith("sqlite"),

            future=True,

        )

        with eng.connect() as conn:

            conn.execute(text("SELECT 1"))

        return eng

    except Exception as e:

        logger.warning("Database connection failed for %s: %s", url.split("@")[-1], e)

        return None





def _ensure_postgres_database_exists(url: str) -> bool:

    """Create PostgreSQL database if it does not exist."""

    if not url.startswith("postgresql"):

        return True

    try:

        parsed = urlparse(url.replace("postgresql://", "postgres://", 1))

        db_name = (parsed.path or "").lstrip("/")

        if not db_name:

            return True

        admin_url = url.rsplit("/", 1)[0] + "/postgres"

        admin_engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")

        with admin_engine.connect() as conn:

            exists = conn.execute(

                text("SELECT 1 FROM pg_database WHERE datname = :name"),

                {"name": db_name},

            ).scalar()

            if not exists:

                conn.execute(text(f'CREATE DATABASE "{db_name}"'))

                logger.info("Created PostgreSQL database: %s", db_name)

        admin_engine.dispose()

        return True

    except Exception as e:

        logger.warning("Could not auto-create PostgreSQL database: %s", e)

        return False





def _migrate_users_table(engine: Engine) -> None:

    inspector = inspect(engine)

    if "users" not in inspector.get_table_names():

        return

    columns = {c["name"] for c in inspector.get_columns("users")}

    is_sqlite = str(engine.url).startswith("sqlite")



    with engine.begin() as conn:

        if "password_hash" not in columns and "hashed_password" in columns:

            conn.execute(text("ALTER TABLE users RENAME COLUMN hashed_password TO password_hash"))



        if "username" not in columns:

            conn.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR(50)"))

            if is_sqlite:

                conn.execute(

                    text(

                        "UPDATE users SET username = lower(substr(email, 1, "

                        "case when instr(email, '@') > 0 then instr(email, '@') - 1 else length(email) end)) "

                        "WHERE username IS NULL OR username = ''"

                    )

                )

            else:

                conn.execute(

                    text(

                        "UPDATE users SET username = lower(split_part(email, '@', 1)) "

                        "WHERE username IS NULL OR username = ''"

                    )

                )



        if "full_name" not in columns:

            conn.execute(text("ALTER TABLE users ADD COLUMN full_name VARCHAR(255) DEFAULT ''"))

            conn.execute(

                text("UPDATE users SET full_name = COALESCE(username, '') WHERE full_name IS NULL OR full_name = ''")

            )



        if "role" not in columns:

            conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'staff'"))

        if "is_active" not in columns:

            default = "1" if is_sqlite else "true"

            conn.execute(text(f"ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT {default}"))





def _migrate_products_table(engine: Engine) -> None:

    inspector = inspect(engine)

    if "products" not in inspector.get_table_names():

        return

    columns = {c["name"] for c in inspector.get_columns("products")}

    is_sqlite = str(engine.url).startswith("sqlite")



    with engine.begin() as conn:

        if "is_featured" not in columns:

            default = "0" if is_sqlite else "FALSE"

            conn.execute(

                text(f"ALTER TABLE products ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT {default}")

            )

        if "image_url" not in columns:

            conn.execute(text("ALTER TABLE products ADD COLUMN image_url VARCHAR(500)"))





def resolve_database_engine() -> Engine:

    """Use DATABASE_URL first; fall back to SQLite only when Postgres is unreachable."""

    global _db_status



    primary = settings.DATABASE_URL



    if primary.startswith("sqlite"):

        engine = _test_engine(primary)

        if engine:

            _db_status = {"connected": True, "url": primary, "backend": "sqlite", "error": None}

            _set_active_url(primary)

            logger.info("Database connected: sqlite (%s)", primary)

            return engine



    if primary.startswith("postgresql"):

        _ensure_postgres_database_exists(primary)

        engine = _test_engine(primary)

        if engine:

            _db_status = {

                "connected": True,

                "url": primary.split("@")[-1],

                "backend": "postgresql",

                "error": None,

            }

            _set_active_url(primary)

            logger.info("Database connected: postgresql")

            return engine



        if settings.SQLITE_FALLBACK:

            fallback = settings.SQLITE_PATH

            logger.warning("PostgreSQL unavailable — using SQLite fallback: %s", fallback)

            engine = _test_engine(fallback)

            if engine:

                _db_status = {

                    "connected": True,

                    "url": fallback,

                    "backend": "sqlite",

                    "error": "PostgreSQL unreachable; using SQLite fallback",

                }

                _set_active_url(fallback)

                return engine



    _db_status = {

        "connected": False,

        "url": primary,

        "backend": "none",

        "error": "Cannot connect. For local dev use DATABASE_URL=sqlite:///./inventory.db",

    }

    raise OperationalError(

        "Database connection failed. Set DATABASE_URL=sqlite:///./inventory.db or start PostgreSQL.",

        None,

        None,

    )





def get_engine() -> Engine:

    global _engine

    if _engine is None:

        _engine = resolve_database_engine()

    return _engine





def init_schema_and_seed() -> None:

    import app.models  # noqa: F401

    from app.database.base import Base



    engine = get_engine()

    Base.metadata.create_all(bind=engine)

    _migrate_users_table(engine)

    _migrate_products_table(engine)



    from app.models.user import User, UserRole

    from app.utils.security import get_password_hash

    from sqlalchemy.orm import sessionmaker



    Session = sessionmaker(bind=engine)

    db = Session()

    try:

        if db.query(User).count() == 0:

            db.add_all(

                [

                    User(

                        username="admin",

                        email="admin@inventory.com",

                        full_name="Admin",

                        password_hash=get_password_hash("admin123"),

                        role=UserRole.admin,

                    ),

                    User(

                        username="staffuser",

                        email="staff@inventory.com",

                        full_name="Staff",

                        password_hash=get_password_hash("staff123"),

                        role=UserRole.staff,

                    ),

                ]

            )

            db.commit()

            logger.info("Seeded demo users (admin / staffuser)")

    finally:

        db.close()





def setup_database() -> None:

    """Full database setup — call on application startup."""

    init_schema_and_seed()


