"""Add username column — use bootstrap migrations instead when possible."""
from app.database.bootstrap import get_engine, init_schema_and_seed


if __name__ == "__main__":
    init_schema_and_seed()
    print("User table migrations applied via bootstrap.")
