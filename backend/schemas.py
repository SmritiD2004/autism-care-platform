from __future__ import annotations
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, EmailStr, field_validator
from models import RoleEnum


# Auth 
class RegisterRequest(BaseModel):
    email:     EmailStr
    full_name: str
    password:  str
    role:      RoleEnum

    @field_validator("password")
    @classmethod
    def strong_enough(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

    @field_validator("full_name")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Full name cannot be blank")
        return v.strip()


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class UserOut(BaseModel):
    id:         int
    email:      str
    full_name:  str
    role:       RoleEnum
    is_active:  bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         UserOut


# Screening 
class ScreeningResult(BaseModel):
    """What the API returns after running a video screening."""
    screening_log_id:  Optional[int]   = None
    saved_to_database: bool            = False
    risk:              float           = 0.0
    indicators:        dict[str, Any]  = {}
    gaze_metrics:      dict[str, Any]  = {}
    shap_importance:   dict[str, Any]  = {}
    heatmap_base64:    Optional[str]   = None
    error:             Optional[str]   = None


class ScreeningHistoryItem(BaseModel):
    id:           int
    risk_score:   float
    created_at:   datetime
    indicators:   dict[str, Any] = {}
    clinician_id: Optional[int]  = None

    model_config = {"from_attributes": True}


class ScreeningHistoryResponse(BaseModel):
    count:      int
    screenings: list[ScreeningHistoryItem]
