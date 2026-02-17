"""
SQLAlchemy models: Patient, ScreeningLog.
For therapy logs and screening history.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def hash_child_id(raw_id: str) -> str:
    """Anonymize child ID (hash for privacy)."""
    import hashlib
    return hashlib.sha256(str(raw_id).encode()).hexdigest()[:16]


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, autoincrement=True)
    child_id_hashed = Column(String(64), unique=True, nullable=False)  # Hashed for privacy
    created_at = Column(DateTime, default=datetime.utcnow)
    metadata_json = Column(Text, nullable=True)  # Encrypted / minimal PII

    screening_logs = relationship("ScreeningLog", back_populates="patient")


class ScreeningLog(Base):
    __tablename__ = "screening_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    video_path_hashed = Column(String(64), nullable=True)  # Anonymized
    risk_score = Column(Float, nullable=False)
    indicators_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    consent_given = Column(Integer, default=0)  # 0=no, 1=yes

    patient = relationship("Patient", back_populates="screening_logs")
