from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.schemas.auth import UserSignup
from app.utils.security import get_password_hash, verify_password


def normalize_email(email: str) -> str:
    return email.strip().lower()


def normalize_username(username: str) -> str:
    return username.strip().lower()


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(func.lower(User.email) == normalize_email(email)).first()


def get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(func.lower(User.username) == normalize_username(username)).first()


def get_user_by_username_or_email(db: Session, identifier: str) -> User | None:
    identifier = identifier.strip()
    if "@" in identifier:
        return get_user_by_email(db, identifier)
    return get_user_by_username(db, identifier)


def create_user(db: Session, data: UserSignup) -> User:
    username = normalize_username(data.username)
    email = normalize_email(str(data.email))

    user = User(
        username=username,
        email=email,
        full_name=username.replace("_", " ").title(),
        password_hash=get_password_hash(data.password),
        role=UserRole.staff,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, username_or_email: str, password: str) -> User | None:
    user = get_user_by_username_or_email(db, username_or_email)
    if not user or not user.is_active:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user
