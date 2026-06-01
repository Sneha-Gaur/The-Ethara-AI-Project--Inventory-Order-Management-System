from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginResponse,
    PasswordReset,
    PasswordResetRequest,
    SignupResponse,
    Token,
    UserLogin,
    UserResponse,
    UserSignup,
)
from app.services import auth_service
from app.utils.deps import get_current_user
from app.utils.security import create_access_token, get_password_hash

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _issue_token(user: User) -> str:
    return create_access_token(data={"sub": str(user.id), "role": user.role.value})


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(data: UserSignup, db: Session = Depends(get_db)):
    if auth_service.get_user_by_username(db, data.username):
        raise HTTPException(status_code=400, detail="Username is already taken")
    if auth_service.get_user_by_email(db, str(data.email)):
        raise HTTPException(status_code=400, detail="Email is already registered")

    try:
        user = auth_service.create_user(db, data)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Username or email already exists")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Could not create account: {str(e)}")

    token = _issue_token(user)
    return SignupResponse(access_token=token, user=user)


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username/email or password")
    return Token(access_token=_issue_token(user))


@router.post("/login/json", response_model=LoginResponse)
def login_json(data: UserLogin, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, data.username_or_email, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username/email or password")
    return LoginResponse(access_token=_issue_token(user), user=user)


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
def logout():
    return {"message": "Logged out"}


@router.post("/forgot-password")
def forgot_password(data: PasswordResetRequest, db: Session = Depends(get_db)):
    user = auth_service.get_user_by_email(db, str(data.email))
    if not user:
        return {"message": "If an account exists, reset instructions were sent."}
    return {"message": "Use the reset tab with your email to set a new password."}


@router.post("/reset-password")
def reset_password(data: PasswordReset, db: Session = Depends(get_db)):
    user = auth_service.get_user_by_email(db, str(data.email))
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")
    user.password_hash = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Password updated. You can sign in now."}
