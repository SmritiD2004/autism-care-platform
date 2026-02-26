from datetime import datetime, timedelta, timezone
from typing import Optional
from types import SimpleNamespace

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import text

from config import settings
from database import get_db
import models

pwd_context  = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer()


class _RoleValue(str):
    @property
    def value(self) -> str:
        return str(self)


def _legacy_user_from_row(row: dict) -> SimpleNamespace:
    return SimpleNamespace(
        id=row.get("id"),
        email=row.get("email"),
        full_name=row.get("full_name") or "",
        hashed_password=row.get("hashed_password"),
        role=_RoleValue((row.get("role") or "").lower()),
        is_active=True if row.get("is_active") is None else bool(row.get("is_active")),
        created_at=row.get("created_at") or datetime.utcnow(),
    )


def get_user_by_email(db: Session, email: str):
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        return user

    row = db.execute(
        text(
            """
            SELECT id, email, full_name, hashed_password, role, is_active, created_at
            FROM public.proto_users
            WHERE lower(email) = lower(:email)
            LIMIT 1
            """
        ),
        {"email": email},
    ).mappings().first()
    return _legacy_user_from_row(row) if row else None


def get_user_by_id(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user:
        return user

    row = db.execute(
        text(
            """
            SELECT id, email, full_name, hashed_password, role, is_active, created_at
            FROM public.proto_users
            WHERE id = :uid
            LIMIT 1
            """
        ),
        {"uid": int(user_id)},
    ).mappings().first()
    return _legacy_user_from_row(row) if row else None


# ── Password ──────────────────────────────────────────────────────────────────
def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── JWT ───────────────────────────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    payload = data.copy()
    expire  = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload["exp"] = expire
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def _decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── FastAPI dependencies ──────────────────────────────────────────────────────
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    payload = _decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Token is missing subject")

    user = get_user_by_id(db, int(user_id))
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or deactivated")
    return user


def require_roles(*roles: str):
    """
    Factory for role-gated endpoints.

    Usage:
        @router.get("/admin-only")
        def view(user = Depends(require_roles("admin"))):
            ...
    """
    def _guard(current_user: models.User = Depends(get_current_user)):
        role_value = getattr(current_user.role, "value", str(current_user.role))
        if role_value not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Allowed roles: {list(roles)}",
            )
        return current_user
    return _guard
