import re
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.user import UserRole

USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9_]{3,30}$")


class UserSignup(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        username = v.strip().lower().replace(" ", "_")
        username = re.sub(r"[^a-z0-9_]", "_", username).strip("_")
        if len(username) < 3:
            raise ValueError("Username must be at least 3 characters")
        return username[:30]

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class UserLogin(BaseModel):
    username_or_email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=128)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SignupResponse(Token):
    user: UserResponse


class LoginResponse(Token):
    user: UserResponse


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    email: EmailStr
    new_password: str = Field(min_length=6, max_length=128)


SignupResponse.model_rebuild()
LoginResponse.model_rebuild()
