from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # SQLite works immediately (no PostgreSQL install required)
    DATABASE_URL: str = "sqlite:///./inventory.db"
    SQLITE_FALLBACK: bool = True
    SQLITE_PATH: str = "sqlite:///./inventory.db"

    SECRET_KEY: str = "change-me-in-production"
    JWT_SECRET: str = "change-me-jwt-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    FRONTEND_URL: str = "http://localhost:5173"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def cors_origins_list(self) -> list[str]:
        origins = [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]
        if self.FRONTEND_URL:
            url = self.FRONTEND_URL.rstrip("/")
            if url not in origins:
                origins.append(url)
        return origins

    @property
    def is_sqlite(self) -> bool:
        return ACTIVE_DATABASE_URL.startswith("sqlite")


settings = Settings()
# Updated at runtime when bootstrap connects (Postgres or SQLite fallback)
ACTIVE_DATABASE_URL: str = settings.DATABASE_URL
