"""Add is_featured column — works on SQLite and PostgreSQL."""
from sqlalchemy import inspect, text

from app.database.bootstrap import get_engine


def migrate():
    engine = get_engine()
    inspector = inspect(engine)
    if "products" not in inspector.get_table_names():
        print("No products table yet — run init_database.py first.")
        return
    columns = {c["name"] for c in inspector.get_columns("products")}
    if "is_featured" in columns:
        print("is_featured already exists.")
        return
    is_sqlite = str(engine.url).startswith("sqlite")
    default = "0" if is_sqlite else "FALSE"
    with engine.begin() as conn:
        conn.execute(text(f"ALTER TABLE products ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT {default}"))
    print("Migration complete: is_featured column added.")


if __name__ == "__main__":
    migrate()
