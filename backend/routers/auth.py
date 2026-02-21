"""
Auth router
  POST /api/auth/register  — create account + role profile row
  POST /api/auth/login     — verify credentials → JWT
  GET  /api/auth/me        — return current user info
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import (
    User, RoleEnum,
    ClinicianProfile, ParentProfile, TherapistProfile, AdminProfile,
)
from schemas import RegisterRequest, LoginRequest, TokenResponse, UserOut
from auth_utils import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()

# Map role → profile model
_PROFILE_MAP = {
    RoleEnum.clinician: ClinicianProfile,
    RoleEnum.parent:    ParentProfile,
    RoleEnum.therapist: TherapistProfile,
    RoleEnum.admin:     AdminProfile,
}


def _create_role_profile(db: Session, user: User) -> None:
    """Insert an empty profile row in the correct role table."""
    ProfileModel = _PROFILE_MAP.get(user.role)
    if ProfileModel:
        db.add(ProfileModel(user_id=user.id))
        db.commit()


# ── POST /api/auth/register ───────────────────────────────────────────────────
@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    _create_role_profile(db, user)

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


# ── POST /api/auth/login ──────────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


# ── GET /api/auth/me ──────────────────────────────────────────────────────────
@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)
