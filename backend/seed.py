"""Seed sample data — run: python seed.py"""
import sys
from decimal import Decimal

from app.database.session import SessionLocal, init_db
from app.models.customer import Customer
from app.models.product import Product
from app.models.user import User, UserRole
from app.utils.security import get_password_hash


def seed_users(db):
    if db.query(User).first():
        return
    db.add_all(
        [
            User(
                username="admin",
                email="admin@inventory.com",
                full_name="System Admin",
                password_hash=get_password_hash("admin123"),
                role=UserRole.admin,
            ),
            User(
                username="staffuser",
                email="staff@inventory.com",
                full_name="Staff User",
                password_hash=get_password_hash("staff123"),
                role=UserRole.staff,
            ),
        ]
    )


def seed():
    init_db()
    from app.database.session import ensure_session_factory

    ensure_session_factory()
    db = SessionLocal()
    try:
        seed_users(db)
        if not db.query(Product).first():
            db.add_all(
                [
                    Product(
                        name="Wireless Mouse",
                        sku="WM-001",
                        description="Ergonomic wireless mouse",
                        price=Decimal("29.99"),
                        quantity=150,
                        category="Electronics",
                        is_featured=True,
                    ),
                ]
            )
        db.commit()
        print("Seed OK")
    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
