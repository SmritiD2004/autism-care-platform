"""
Minimal prototype models — isolated from production models.py.

Table names are prefixed with `proto_` to guarantee zero conflict
with the production tables (users, patients, daily_checkins, etc.)
even when both sets of models are loaded in the same SQLAlchemy session.

Tables created here:
  proto_users
  proto_patients
  proto_daily_checkins
  proto_screening_results
"""

import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class User(Base):
    __tablename__ = "proto_users"

    id              = Column(Integer, primary_key=True, index=True)
    email           = Column(String(255), unique=True, index=True, nullable=False)
    full_name       = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=True)
    role            = Column(String(50), default="parent")
    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime, default=datetime.datetime.utcnow)

    patients = relationship("Patient", back_populates="parent")


class Patient(Base):
    __tablename__ = "proto_patients"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(255), nullable=False)
    dob        = Column(DateTime, nullable=True)
    parent_id  = Column(Integer, ForeignKey("proto_users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    parent    = relationship("User", back_populates="patients")
    checkins  = relationship("DailyCheckin",    back_populates="patient")
    screenings = relationship("ScreeningResult", back_populates="patient")


class DailyCheckin(Base):
    __tablename__ = "proto_daily_checkins"

    id         = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("proto_patients.id"), nullable=False)
    mood       = Column(String(50), nullable=True)
    notes      = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="checkins")


class ScreeningResult(Base):
    __tablename__ = "proto_screening_results"

    id             = Column(Integer, primary_key=True, index=True)
    patient_id     = Column(Integer, ForeignKey("proto_patients.id"), nullable=False)
    score          = Column(Integer, nullable=False)
    interpretation = Column(String(255), nullable=True)
    created_at     = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="screenings")
