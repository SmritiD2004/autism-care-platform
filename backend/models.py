"""
NeuroThrive — SQLAlchemy Models (PostgreSQL)
============================================

Table map (grouped by PRD module):

  AUTH
  ├── users                  core auth (one row per account)
  ├── clinicians             clinician profile
  ├── parents                parent profile
  ├── therapists             therapist profile
  └── admins                 admin profile

  CLINICAL (existing, extended)
  ├── patients               anonymised child record
  └── screening_logs         ASD video screening results

  PREDICTIVE INTERVENTION ENGINE
  └── intervention_plans     AI-recommended therapy plan per patient

  THERAPY MANAGEMENT
  ├── therapy_goals          one goal per row (linked to plan + therapist)
  └── therapy_sessions       individual session logs

  CONTINUOUS MONITORING
  ├── daily_checkins         parent daily check-in data
  └── crisis_events          detected/logged crisis episodes

  PARENT MENTAL HEALTH CO-PILOT
  └── parent_journal_entries free-text entries + NLP scores
"""

import enum
import hashlib
from datetime import datetime

from sqlalchemy import (
    Boolean, Column, DateTime, Enum as SAEnum,
    Float, ForeignKey, Integer, SmallInteger, String, Text,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def hash_child_id(raw_id: str) -> str:
    """SHA-256 → 16-char hex.  Used to anonymise filenames / child IDs."""
    return hashlib.sha256(str(raw_id).encode()).hexdigest()[:16]


# ─────────────────────────────────────────────────────────────────────────────
# Enums
# ─────────────────────────────────────────────────────────────────────────────

class RoleEnum(str, enum.Enum):
    admin     = "admin"
    clinician = "clinician"
    parent    = "parent"
    therapist = "therapist"


class SeverityEnum(str, enum.Enum):
    mild     = "mild"
    moderate = "moderate"
    severe   = "severe"


class GoalStatusEnum(str, enum.Enum):
    not_started = "not_started"
    in_progress = "in_progress"
    on_track    = "on_track"
    achieved    = "achieved"
    behind      = "behind"


class TherapyTypeEnum(str, enum.Enum):
    speech       = "speech"
    aba          = "aba"
    occupational = "occupational"
    behavioral   = "behavioral"
    social       = "social"
    other        = "other"


class CrisisStatusEnum(str, enum.Enum):
    predicted = "predicted"   # AI flagged risk, no event yet
    occurred  = "occurred"    # meltdown/crisis happened
    resolved  = "resolved"    # marked resolved by parent/clinician


class RiskLevelEnum(str, enum.Enum):
    low      = "low"       # 0-30 %
    medium   = "medium"    # 31-60 %
    high     = "high"      # 61-85 %
    critical = "critical"  # 86-100 %


# ═════════════════════════════════════════════════════════════════════════════
# MODULE 0 — AUTH
# ═════════════════════════════════════════════════════════════════════════════

class User(Base):
    """Core authentication record — every account lives here."""
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    email           = Column(String(255), unique=True, index=True, nullable=False)
    full_name       = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role            = Column(SAEnum(RoleEnum), nullable=False)
    is_active       = Column(Boolean, default=True, nullable=False)
    created_at      = Column(DateTime, default=datetime.utcnow)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Role profiles — at most one will be populated
    clinician_profile = relationship("ClinicianProfile", back_populates="user",
                                     uselist=False, cascade="all, delete-orphan")
    parent_profile    = relationship("ParentProfile",    back_populates="user",
                                     uselist=False, cascade="all, delete-orphan")
    therapist_profile = relationship("TherapistProfile", back_populates="user",
                                     uselist=False, cascade="all, delete-orphan")
    admin_profile     = relationship("AdminProfile",     back_populates="user",
                                     uselist=False, cascade="all, delete-orphan")

    # Activity
    screening_logs       = relationship("ScreeningLog",         back_populates="clinician",
                                        foreign_keys="ScreeningLog.clinician_user_id")
    intervention_plans   = relationship("InterventionPlan",     back_populates="created_by_user",
                                        foreign_keys="InterventionPlan.created_by")
    therapy_sessions     = relationship("TherapySession",       back_populates="therapist_user",
                                        foreign_keys="TherapySession.therapist_user_id")
    journal_entries      = relationship("ParentJournalEntry",   back_populates="parent_user",
                                        foreign_keys="ParentJournalEntry.parent_user_id")


class ClinicianProfile(Base):
    __tablename__ = "clinicians"

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                            unique=True, nullable=False)
    specialty      = Column(String(120), nullable=True)   # e.g. "Pediatric Neurology"
    license_number = Column(String(80),  nullable=True)
    clinic_name    = Column(String(180), nullable=True)
    phone          = Column(String(30),  nullable=True)
    notes          = Column(Text,        nullable=True)
    created_at     = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="clinician_profile")


class ParentProfile(Base):
    __tablename__ = "parents"

    id                = Column(Integer, primary_key=True, index=True)
    user_id           = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                               unique=True, nullable=False)
    child_name        = Column(String(120), nullable=True)
    child_age         = Column(Integer,     nullable=True)
    preferred_contact = Column(String(20),  nullable=True)  # email | phone | sms
    phone             = Column(String(30),  nullable=True)
    notes             = Column(Text,        nullable=True)
    created_at        = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="parent_profile")


class TherapistProfile(Base):
    __tablename__ = "therapists"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                              unique=True, nullable=False)
    therapy_type     = Column(SAEnum(TherapyTypeEnum), nullable=True)
    certification    = Column(String(120), nullable=True)
    years_experience = Column(Integer,     nullable=True)
    phone            = Column(String(30),  nullable=True)
    notes            = Column(Text,        nullable=True)
    created_at       = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="therapist_profile")


class AdminProfile(Base):
    __tablename__ = "admins"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                          unique=True, nullable=False)
    department   = Column(String(120), nullable=True)
    access_level = Column(SmallInteger, default=1)   # 1=standard, 2=super
    created_at   = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="admin_profile")


# ═════════════════════════════════════════════════════════════════════════════
# MODULE 1 — SCREENING ENGINE  (existing tables, extended)
# ═════════════════════════════════════════════════════════════════════════════

class Patient(Base):
    """
    Anonymised child record.
    No PII stored directly — all identifying data is hashed or stored
    in the parent's profile (linked via parent_user_id).
    """
    __tablename__ = "patients"

    id              = Column(Integer, primary_key=True, autoincrement=True)
    # Anonymised identifier (SHA-256 of real child ID / name)
    child_id_hashed = Column(String(64), unique=True, nullable=False)
    # Optional link to the parent user account
    parent_user_id  = Column(Integer, ForeignKey("users.id"), nullable=True)
    # Minimal, non-PII metadata (age-band, gender, diagnosis date, etc.)
    metadata_json   = Column(Text,    nullable=True)
    created_at      = Column(DateTime, default=datetime.utcnow)

    # Relationships
    parent          = relationship("User", foreign_keys=[parent_user_id])
    screening_logs  = relationship("ScreeningLog",     back_populates="patient",
                                   cascade="all, delete-orphan")
    intervention_plans = relationship("InterventionPlan", back_populates="patient",
                                      cascade="all, delete-orphan")
    therapy_goals   = relationship("TherapyGoal",      back_populates="patient",
                                   cascade="all, delete-orphan")
    daily_checkins  = relationship("DailyCheckin",     back_populates="patient",
                                   cascade="all, delete-orphan")
    crisis_events   = relationship("CrisisEvent",      back_populates="patient",
                                   cascade="all, delete-orphan")


class ScreeningLog(Base):
    """
    One row per ASD video screening run.
    Stores raw scores, SHAP importances, and the annotated heatmap PNG.
    """
    __tablename__ = "screening_logs"

    id                = Column(Integer, primary_key=True, autoincrement=True)
    patient_id        = Column(Integer, ForeignKey("patients.id"), nullable=True)
    # Which clinician / user submitted the video
    clinician_user_id = Column(Integer, ForeignKey("users.id"),    nullable=True)

    # Video reference (anonymised)
    video_path_hashed = Column(String(64),  nullable=True)

    # ── Core screening output ────────────────────────────────────────────────
    risk_score        = Column(Float,   nullable=False)        # 0.0 – 1.0
    confidence        = Column(Float,   nullable=True)         # model confidence
    severity          = Column(SAEnum(SeverityEnum), nullable=True)

    # JSON blobs from the ML pipeline
    indicators_json   = Column(Text, nullable=True)   # behavioral_markers dict
    gaze_metrics_json = Column(Text, nullable=True)   # eye-tracking metrics
    shap_json         = Column(Text, nullable=True)   # SHAP feature importances
    evidence_clips_json = Column(Text, nullable=True) # timestamped evidence clips

    # Visualisation
    heatmap_base64    = Column(Text, nullable=True)   # PNG as base64

    # Clinician review
    clinician_notes   = Column(Text,    nullable=True)
    clinician_override = Column(Boolean, default=False)  # doctor overrode AI
    recommended_action = Column(String(120), nullable=True)  # e.g. "clinical_evaluation_advised"

    consent_given     = Column(Boolean,  default=False)
    created_at        = Column(DateTime, default=datetime.utcnow)

    patient   = relationship("Patient", back_populates="screening_logs")
    clinician = relationship("User",    back_populates="screening_logs",
                             foreign_keys=[clinician_user_id])


# ═════════════════════════════════════════════════════════════════════════════
# MODULE 2 — PREDICTIVE INTERVENTION ENGINE
# ═════════════════════════════════════════════════════════════════════════════

class InterventionPlan(Base):
    """
    AI-generated therapy recommendation plan for a patient.
    Stores multiple plan options (Plan A, Plan B …) as JSON.
    """
    __tablename__ = "intervention_plans"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    patient_id  = Column(Integer, ForeignKey("patients.id"), nullable=False)
    created_by  = Column(Integer, ForeignKey("users.id"),    nullable=True)  # clinician

    # Plan metadata
    plan_name   = Column(String(120), nullable=True)   # e.g. "Intensive Communication Focus"
    plan_option = Column(String(10),  default="A")     # A | B | C

    # Input features used by the ML model
    input_features_json = Column(Text, nullable=True)  # age, severity, co-conditions …

    # Recommended therapies
    # Format: [{"type": "speech", "frequency": "4x/week", "duration_min": 45}, …]
    therapies_json      = Column(Text, nullable=True)

    # Predicted outcomes (6-month horizon)
    # Format: {"verbal_communication": 0.82, "social_skills": 0.67, …}
    predicted_outcomes_json = Column(Text, nullable=True)

    # Time-to-milestone prediction
    milestone_months    = Column(Float, nullable=True)   # e.g. 7.2
    milestone_std       = Column(Float, nullable=True)   # ± months

    # Cost estimate (in local currency units)
    estimated_cost      = Column(Float, nullable=True)

    # Why this plan was chosen
    reasoning           = Column(Text,    nullable=True)

    # Clinician accepted or modified the plan?
    accepted            = Column(Boolean, nullable=True)
    clinician_notes     = Column(Text,    nullable=True)

    is_active           = Column(Boolean, default=True)
    created_at          = Column(DateTime, default=datetime.utcnow)
    updated_at          = Column(DateTime, default=datetime.utcnow,
                                 onupdate=datetime.utcnow)

    patient        = relationship("Patient", back_populates="intervention_plans")
    created_by_user = relationship("User",  back_populates="intervention_plans",
                                   foreign_keys=[created_by])
    therapy_goals  = relationship("TherapyGoal", back_populates="intervention_plan",
                                  cascade="all, delete-orphan")


# ═════════════════════════════════════════════════════════════════════════════
# MODULE 3 — THERAPY MANAGEMENT & COLLABORATION
# ═════════════════════════════════════════════════════════════════════════════

class TherapyGoal(Base):
    """
    One measurable goal within a therapy plan.
    e.g. "50-word vocabulary by April" — Speech Therapy.
    """
    __tablename__ = "therapy_goals"

    id                   = Column(Integer, primary_key=True, autoincrement=True)
    patient_id           = Column(Integer, ForeignKey("patients.id"),        nullable=False)
    intervention_plan_id = Column(Integer, ForeignKey("intervention_plans.id"), nullable=True)
    # The therapist responsible for this goal
    therapist_user_id    = Column(Integer, ForeignKey("users.id"),            nullable=True)

    therapy_type  = Column(SAEnum(TherapyTypeEnum), nullable=False)
    goal_text     = Column(Text,          nullable=False)   # human-readable goal
    target_date   = Column(DateTime,      nullable=True)
    status        = Column(SAEnum(GoalStatusEnum), default=GoalStatusEnum.not_started)

    # Progress tracking
    baseline_value  = Column(Float,  nullable=True)   # starting measurement
    current_value   = Column(Float,  nullable=True)   # latest measurement
    target_value    = Column(Float,  nullable=True)   # e.g. 50 (words)
    unit            = Column(String(40), nullable=True)  # e.g. "words", "minutes", "%"

    notes           = Column(Text,    nullable=True)
    created_at      = Column(DateTime, default=datetime.utcnow)
    updated_at      = Column(DateTime, default=datetime.utcnow,
                             onupdate=datetime.utcnow)

    patient           = relationship("Patient",          back_populates="therapy_goals")
    intervention_plan = relationship("InterventionPlan", back_populates="therapy_goals")
    therapist_user    = relationship("User", foreign_keys=[therapist_user_id])
    sessions          = relationship("TherapySession",   back_populates="goal",
                                     cascade="all, delete-orphan")


class TherapySession(Base):
    """
    Individual therapy session log.
    Linked to a goal and recorded by the therapist.
    """
    __tablename__ = "therapy_sessions"

    id                = Column(Integer, primary_key=True, autoincrement=True)
    goal_id           = Column(Integer, ForeignKey("therapy_goals.id"),  nullable=False)
    therapist_user_id = Column(Integer, ForeignKey("users.id"),          nullable=True)

    session_date      = Column(DateTime, nullable=False, default=datetime.utcnow)
    duration_minutes  = Column(Integer,  nullable=True)
    therapy_type      = Column(SAEnum(TherapyTypeEnum), nullable=True)

    # What happened
    progress_note     = Column(Text,  nullable=True)   # therapist's session notes
    value_recorded    = Column(Float, nullable=True)   # measurement this session
    adherence         = Column(Boolean, default=True)  # did patient attend/cooperate?

    # Shared notes visible across care team
    shared_notes      = Column(Text, nullable=True)

    created_at        = Column(DateTime, default=datetime.utcnow)

    goal           = relationship("TherapyGoal", back_populates="sessions")
    therapist_user = relationship("User",        back_populates="therapy_sessions",
                                  foreign_keys=[therapist_user_id])


# ═════════════════════════════════════════════════════════════════════════════
# MODULE 4 — CONTINUOUS MONITORING & CRISIS PREDICTION
# ═════════════════════════════════════════════════════════════════════════════

class DailyCheckin(Base):
    """
    Parent's daily check-in record (5-minute mobile form).
    Matches the JSON structure from PRD section 4a exactly.
    """
    __tablename__ = "daily_checkins"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    # The parent who submitted
    parent_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    checkin_date = Column(DateTime, nullable=False, default=datetime.utcnow)

    # ── Sleep ────────────────────────────────────────────────────────────────
    sleep_hours          = Column(Float,   nullable=True)
    sleep_quality        = Column(String(40), nullable=True)  # good|interrupted_1x|…
    sleep_disturbances   = Column(Integer, nullable=True)     # number of wakings

    # ── Morning ──────────────────────────────────────────────────────────────
    mood_morning         = Column(String(30), nullable=True)  # happy|irritable|calm|…
    appetite             = Column(String(30), nullable=True)  # good|poor|refused

    # ── Throughout day ───────────────────────────────────────────────────────
    communication_attempts = Column(Integer, nullable=True)
    new_words_json         = Column(Text,    nullable=True)  # ["juice", "more"]
    social_interactions    = Column(Integer, nullable=True)
    sensory_avoidance_count = Column(Integer, nullable=True)  # covered ears N times

    # ── Behavioural ──────────────────────────────────────────────────────────
    meltdowns              = Column(Integer, nullable=True)
    meltdown_trigger       = Column(String(120), nullable=True)
    meltdown_duration_min  = Column(Integer,     nullable=True)
    self_harm_incidents    = Column(Integer, default=0)

    # ── Positive ─────────────────────────────────────────────────────────────
    positive_moments_json  = Column(Text, nullable=True)  # ["smiled_at_sibling"]

    # ── Evening ──────────────────────────────────────────────────────────────
    therapy_completed      = Column(Boolean, default=False)
    skill_practice_done    = Column(Boolean, default=False)
    overall_day_rating     = Column(SmallInteger, nullable=True)  # 1-10

    # ── AI-computed crisis score for this checkin ─────────────────────────────
    crisis_risk_score      = Column(Float, nullable=True)          # 0.0-1.0
    crisis_risk_level      = Column(SAEnum(RiskLevelEnum), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    patient     = relationship("Patient", back_populates="daily_checkins")
    parent_user = relationship("User",    foreign_keys=[parent_user_id])


class CrisisEvent(Base):
    """
    A detected or logged crisis/meltdown episode.
    Created by:
      • AI (status=predicted) when risk crosses threshold, OR
      • Parent/clinician (status=occurred) after the fact.
    """
    __tablename__ = "crisis_events"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    checkin_id = Column(Integer, ForeignKey("daily_checkins.id"), nullable=True)

    status          = Column(SAEnum(CrisisStatusEnum), default=CrisisStatusEnum.predicted)
    risk_score      = Column(Float, nullable=True)        # 0.0-1.0 at time of prediction
    risk_level      = Column(SAEnum(RiskLevelEnum), nullable=True)

    # Pre-crisis signals that triggered the alert (JSON list)
    trigger_signals_json   = Column(Text, nullable=True)

    # AI-generated prevention steps
    prevention_steps_json  = Column(Text, nullable=True)

    # If it actually happened
    occurred_at            = Column(DateTime, nullable=True)
    duration_minutes       = Column(Integer,  nullable=True)
    trigger_description    = Column(Text,     nullable=True)
    de_escalation_used     = Column(Text,     nullable=True)  # what worked

    resolved_at            = Column(DateTime, nullable=True)
    resolved_by_user_id    = Column(Integer, ForeignKey("users.id"), nullable=True)

    notes      = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient      = relationship("Patient",    back_populates="crisis_events")
    checkin      = relationship("DailyCheckin", foreign_keys=[checkin_id])
    resolved_by  = relationship("User",       foreign_keys=[resolved_by_user_id])


# ═════════════════════════════════════════════════════════════════════════════
# MODULE 5 — PARENT MENTAL HEALTH CO-PILOT
# ═════════════════════════════════════════════════════════════════════════════

class ParentJournalEntry(Base):
    """
    Free-text journal entry written by a parent.
    NLP pipeline runs sentiment, emotion, and burnout analysis
    and stores results here alongside the raw text.
    """
    __tablename__ = "parent_journal_entries"

    id             = Column(Integer, primary_key=True, autoincrement=True)
    parent_user_id = Column(Integer, ForeignKey("users.id"),    nullable=False)
    patient_id     = Column(Integer, ForeignKey("patients.id"), nullable=True)

    # Raw entry
    entry_text     = Column(Text, nullable=False)
    entry_date     = Column(DateTime, default=datetime.utcnow)

    # ── NLP output ───────────────────────────────────────────────────────────
    # Sentiment: -1.0 (very negative) → +1.0 (very positive)
    sentiment_score     = Column(Float,       nullable=True)

    # Detected emotions JSON: {"exhaustion": 0.9, "hopelessness": 0.7, "guilt": 0.6}
    emotions_json       = Column(Text,        nullable=True)

    # Burnout risk 0-100
    burnout_score       = Column(Float,       nullable=True)
    burnout_risk_level  = Column(SAEnum(RiskLevelEnum), nullable=True)

    # Key triggers extracted by NLP (JSON list of strings)
    triggers_json       = Column(Text,        nullable=True)

    # Whether the system sent a proactive support message
    support_sent        = Column(Boolean,     default=False)
    support_message     = Column(Text,        nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    parent_user = relationship("User",    back_populates="journal_entries",
                               foreign_keys=[parent_user_id])
    patient     = relationship("Patient", foreign_keys=[patient_id])
