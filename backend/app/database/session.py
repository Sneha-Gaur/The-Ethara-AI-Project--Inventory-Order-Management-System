from sqlalchemy.orm import sessionmaker

from app.database.bootstrap import get_engine, get_status, setup_database

engine = None
SessionLocal = None


def ensure_session_factory():
    global engine, SessionLocal
    if SessionLocal is None:
        engine = get_engine()
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    ensure_session_factory()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    setup_database()


def database_health() -> dict:
    try:
        ensure_session_factory()
        with engine.connect() as conn:
            from sqlalchemy import text

            conn.execute(text("SELECT 1"))
        status = get_status()
        status["connected"] = True
        return status
    except Exception as e:
        s = get_status()
        s["connected"] = False
        s["error"] = str(e)
        return s
