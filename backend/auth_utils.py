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

pwd_context   = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer()


# Password 

def _truncate_bcrypt_secret(plain: str) -> str:
    """
    Bcrypt has a hard 72-byte limit. Truncate by bytes (utf-8) to avoid errors.
    """
    raw = plain.encode("utf-8")
    if len(raw) <= 72:
        return plain
    return raw[:72].decode("utf-8", errors="ignore")


def hash_password(plain: str) -> str:
    # Bcrypt has a 72-byte limit; truncate if necessary
    truncated = _truncate_bcrypt_secret(plain)
    return pwd_context.hash(truncated)


def verify_password(plain: str, hashed: str) -> bool:
    # Bcrypt has a 72-byte limit; truncate if necessary
    truncated = _truncate_bcrypt_secret(plain)
    return pwd_context.verify(truncated, hashed)


# JWT 

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:
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


#  FastAPI dependencies 

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    payload = _decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Token is missing subject")

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()

    # bool() cast resolves Pylance's Column[bool] false positive
    if not user or not bool(user.is_active):
        raise HTTPException(status_code=401, detail="User not found or deactivated")

    return user


def require_roles(*roles: str):
    """
    Role-gated dependency factory.

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


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()
