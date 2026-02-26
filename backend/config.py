from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Postgres ──────────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/neurothrive"

    # ── JWT ───────────────────────────────────────────────────────────────────
    SECRET_KEY: str = "CHANGE_ME_run_openssl_rand_hex_32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24   # 24 h

    # ── CORS ──────────────────────────────────────────────────────────────────
    FRONTEND_ORIGINS: list[str] = [
        "http://localhost:5173",   # Vite
        "http://localhost:3000",   # CRA
    ]

    class Config:
        # Always resolve env file from backend directory, not current working directory.
        env_file = str(Path(__file__).resolve().parent / ".env")


settings = Settings()
