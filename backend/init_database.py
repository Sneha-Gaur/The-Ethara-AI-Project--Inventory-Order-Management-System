"""Run once to initialize database, tables, and seed data."""
from app.database.bootstrap import get_status, setup_database

if __name__ == "__main__":
    print("Initializing database...")
    setup_database()
    print("Done:", get_status())
