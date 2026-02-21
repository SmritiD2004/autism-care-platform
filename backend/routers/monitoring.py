"""
Monitoring Router
=================
Handles the Continuous Monitoring & Crisis Prediction module (PRD §4).

Endpoints
---------
POST   /api/monitoring/checkin                  — parent submits daily check-in
GET    /api/monitoring/checkin/{patient_id}     — list check-ins for a patient
GET    /api/monitoring/checkin/{patient_id}/latest — most recent check-in

GET    /api/monitoring/crisis/{patient_id}      — list crisis events for a patient
POST   /api/monitoring/crisis/{patient_id}/log  — manually log a crisis that occurred
PATCH  /api/monitoring/crisis/{event_id}/resolve — mark a crisis event resolved

GET    /api/monitoring/trends/{patient_id}      — aggregated weekly trend summary

Access rules
------------
- Parents can only submit/view check-ins for their own child (patient_id matched
  via patient.parent_user_id == current_user.id)
- Clinicians, therapists, admins can read any patient's data
- Only clinicians and admins can resolve crisis events
"""

import json
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import (
    CrisisEvent, CrisisStatusEnum,
    DailyCheckin, Patient,
    RiskLevelEnum, User,
)
from auth_utils import get_current_user, require_roles

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _get_patient_or_404(patient_id: int, db: Session) -> Patient:
    p = db.query(Patient).filter(Patient.id == patient_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    return p


def _assert_parent_owns(patient: Patient, user: User) -> None:
    """Raise 403 if a parent-role user tries to access another child's data."""
    if user.role.value == "parent" and patient.parent_user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied to this patient")


def _risk_level_from_score(score: float) -> RiskLevelEnum:
    if score <= 0.30:
        return RiskLevelEnum.low
    if score <= 0.60:
        return RiskLevelEnum.medium
    if score <= 0.85:
        return RiskLevelEnum.high
    return RiskLevelEnum.critical


# ─────────────────────────────────────────────────────────────────────────────
# Crisis prediction (rule-based stub — replace with LSTM model later)
# ─────────────────────────────────────────────────────────────────────────────

def _compute_crisis_risk(checkin: "CheckinRequest", recent: list[DailyCheckin]) -> tuple[float, list[str]]:
    """
    Lightweight rule-based crisis risk scorer.

    Returns (risk_score 0.0–1.0, list_of_trigger_signals).

    Each rule contributes a weight; final score is clamped to [0, 1].
    Replace this function body with your LSTM inference call when ready —
    the interface stays the same.
    """
    score   = 0.0
    signals = []

    # ── Current check-in signals ─────────────────────────────────────────────
    if checkin.sleep_disturbances is not None and checkin.sleep_disturbances >= 2:
        score += 0.20
        signals.append(f"Sleep disrupted ({checkin.sleep_disturbances} wakings last night)")

    if checkin.mood_morning in ("irritable", "very_irritable", "agitated"):
        score += 0.18
        signals.append(f"Morning mood: {checkin.mood_morning}")

    if checkin.appetite in ("poor", "refused"):
        score += 0.08
        signals.append(f"Appetite: {checkin.appetite}")

    if checkin.sensory_avoidance_count is not None and checkin.sensory_avoidance_count >= 3:
        score += 0.15
        signals.append(f"Sensory avoidance incidents: {checkin.sensory_avoidance_count}")

    if checkin.self_harm_incidents and checkin.self_harm_incidents > 0:
        score += 0.25
        signals.append(f"Self-harm incidents reported: {checkin.self_harm_incidents}")

    # ── Trend signals (compare against recent history) ────────────────────────
    if recent:
        avg_comm = sum(
            r.communication_attempts for r in recent
            if r.communication_attempts is not None
        ) / max(len(recent), 1)

        if (
            checkin.communication_attempts is not None
            and avg_comm > 0
            and checkin.communication_attempts < avg_comm * 0.70
        ):
            drop_pct = int((1 - checkin.communication_attempts / avg_comm) * 100)
            score += 0.14
            signals.append(f"Communication attempts dropped {drop_pct}% vs recent average")

        # Yesterday's meltdown count
        if recent and recent[0].meltdowns and recent[0].meltdowns >= 2:
            score += 0.10
            signals.append("Multiple meltdowns recorded yesterday")

    return min(round(score, 3), 1.0), signals


def _build_prevention_steps(risk_level: RiskLevelEnum, signals: list[str]) -> list[str]:
    """Return role-appropriate prevention guidance based on risk level."""
    base = [
        "Maintain a calm, predictable environment today",
        "Communicate in short, clear sentences",
        "Have child's preferred comfort item accessible",
    ]
    if risk_level in (RiskLevelEnum.high, RiskLevelEnum.critical):
        base = [
            "Identify and prepare a quiet safe space now",
            "Pack noise-canceling headphones if leaving home",
            "Reduce non-essential demands and transitions today",
            "Inform school/daycare about elevated risk — request lower-stimulation setting",
            "Offer preferred calming activity proactively (weighted blanket, puzzle, etc.)",
            "Have de-escalation protocol ready",
        ] + base
    elif risk_level == RiskLevelEnum.medium:
        base = [
            "Monitor closely for escalating signs",
            "Offer a calming activity mid-morning",
        ] + base
    return base


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic schemas (local — only what this router needs)
# ─────────────────────────────────────────────────────────────────────────────

class CheckinRequest(BaseModel):
    patient_id: int

    # Sleep
    sleep_hours:        Optional[float] = None
    sleep_quality:      Optional[str]   = None   # good | interrupted_1x | interrupted_2x | poor
    sleep_disturbances: Optional[int]   = None

    # Morning
    mood_morning: Optional[str] = None   # happy | calm | irritable | very_irritable | agitated
    appetite:     Optional[str] = None   # good | poor | refused

    # Throughout day
    communication_attempts:  Optional[int]       = None
    new_words:               Optional[list[str]] = None
    social_interactions:     Optional[int]       = None
    sensory_avoidance_count: Optional[int]       = None

    # Behavioural
    meltdowns:             Optional[int] = 0
    meltdown_trigger:      Optional[str] = None
    meltdown_duration_min: Optional[int] = None
    self_harm_incidents:   Optional[int] = 0

    # Positive
    positive_moments: Optional[list[str]] = None

    # Evening
    therapy_completed:   bool           = False
    skill_practice_done: bool           = False
    overall_day_rating:  Optional[int]  = Field(None, ge=1, le=10)


class CheckinOut(BaseModel):
    id:               int
    patient_id:       int
    checkin_date:     datetime
    crisis_risk_score: Optional[float]
    crisis_risk_level: Optional[str]
    prevention_steps: Optional[list[str]] = None

    model_config = {"from_attributes": True}


class CrisisLogRequest(BaseModel):
    """Manually log a crisis that already occurred."""
    occurred_at:          Optional[datetime] = None
    duration_minutes:     Optional[int]      = None
    trigger_description:  Optional[str]      = None
    de_escalation_used:   Optional[str]      = None
    notes:                Optional[str]      = None


class CrisisResolveRequest(BaseModel):
    notes: Optional[str] = None


class CrisisOut(BaseModel):
    id:                    int
    patient_id:            int
    status:                str
    risk_score:            Optional[float]
    risk_level:            Optional[str]
    trigger_signals:       list[str] = []
    prevention_steps:      list[str] = []
    occurred_at:           Optional[datetime]
    duration_minutes:      Optional[int]
    trigger_description:   Optional[str]
    de_escalation_used:    Optional[str]
    resolved_at:           Optional[datetime]
    created_at:            datetime

    model_config = {"from_attributes": True}


class TrendOut(BaseModel):
    patient_id:              int
    period_days:             int
    avg_sleep_hours:         Optional[float]
    avg_communication:       Optional[float]
    avg_meltdowns:           Optional[float]
    avg_day_rating:          Optional[float]
    avg_crisis_risk:         Optional[float]
    therapy_adherence_pct:   Optional[float]
    total_crisis_events:     int
    checkin_count:           int


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/monitoring/checkin
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/checkin", response_model=CheckinOut, status_code=201)
def submit_checkin(
    payload: CheckinRequest,
    db:      Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Parent submits daily check-in.
    Automatically computes crisis risk score and creates a CrisisEvent
    if risk >= medium.
    """
    patient = _get_patient_or_404(payload.patient_id, db)
    _assert_parent_owns(patient, current_user)

    # Fetch the 7 most recent check-ins for trend analysis
    recent = (
        db.query(DailyCheckin)
        .filter(DailyCheckin.patient_id == payload.patient_id)
        .order_by(DailyCheckin.checkin_date.desc())
        .limit(7)
        .all()
    )

    # Compute crisis risk
    risk_score, signals = _compute_crisis_risk(payload, recent)
    risk_level = _risk_level_from_score(risk_score)
    prevention = _build_prevention_steps(risk_level, signals)

    # Persist check-in
    checkin = DailyCheckin(
        patient_id           = payload.patient_id,
        parent_user_id       = current_user.id,
        checkin_date         = datetime.utcnow(),
        sleep_hours          = payload.sleep_hours,
        sleep_quality        = payload.sleep_quality,
        sleep_disturbances   = payload.sleep_disturbances,
        mood_morning         = payload.mood_morning,
        appetite             = payload.appetite,
        communication_attempts   = payload.communication_attempts,
        new_words_json           = json.dumps(payload.new_words or []),
        social_interactions      = payload.social_interactions,
        sensory_avoidance_count  = payload.sensory_avoidance_count,
        meltdowns                = payload.meltdowns,
        meltdown_trigger         = payload.meltdown_trigger,
        meltdown_duration_min    = payload.meltdown_duration_min,
        self_harm_incidents      = payload.self_harm_incidents or 0,
        positive_moments_json    = json.dumps(payload.positive_moments or []),
        therapy_completed        = payload.therapy_completed,
        skill_practice_done      = payload.skill_practice_done,
        overall_day_rating       = payload.overall_day_rating,
        crisis_risk_score        = risk_score,
        crisis_risk_level        = risk_level,
    )
    db.add(checkin)
    db.flush()   # get checkin.id before creating crisis event

    # Auto-create a CrisisEvent if risk is medium or above
    if risk_level != RiskLevelEnum.low:
        event = CrisisEvent(
            patient_id            = payload.patient_id,
            checkin_id            = checkin.id,
            status                = CrisisStatusEnum.predicted,
            risk_score            = risk_score,
            risk_level            = risk_level,
            trigger_signals_json  = json.dumps(signals),
            prevention_steps_json = json.dumps(prevention),
        )
        db.add(event)

    db.commit()
    db.refresh(checkin)

    # Attach prevention steps to response (not stored on checkin row)
    out = CheckinOut.model_validate(checkin)
    out.prevention_steps = prevention if risk_level != RiskLevelEnum.low else []
    return out


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/monitoring/checkin/{patient_id}
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/checkin/{patient_id}", response_model=list[CheckinOut])
def list_checkins(
    patient_id: int,
    days:       int  = 30,
    db:         Session = Depends(get_db),
    current_user: User  = Depends(get_current_user),
):
    """Return check-ins for a patient over the last N days (default 30)."""
    patient = _get_patient_or_404(patient_id, db)
    _assert_parent_owns(patient, current_user)

    since = datetime.utcnow() - timedelta(days=days)
    rows = (
        db.query(DailyCheckin)
        .filter(
            DailyCheckin.patient_id   == patient_id,
            DailyCheckin.checkin_date >= since,
        )
        .order_by(DailyCheckin.checkin_date.desc())
        .all()
    )
    return [CheckinOut.model_validate(r) for r in rows]


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/monitoring/checkin/{patient_id}/latest
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/checkin/{patient_id}/latest", response_model=CheckinOut)
def latest_checkin(
    patient_id: int,
    db:         Session = Depends(get_db),
    current_user: User  = Depends(get_current_user),
):
    patient = _get_patient_or_404(patient_id, db)
    _assert_parent_owns(patient, current_user)

    row = (
        db.query(DailyCheckin)
        .filter(DailyCheckin.patient_id == patient_id)
        .order_by(DailyCheckin.checkin_date.desc())
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="No check-ins found for this patient")
    return CheckinOut.model_validate(row)


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/monitoring/crisis/{patient_id}
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/crisis/{patient_id}", response_model=list[CrisisOut])
def list_crisis_events(
    patient_id: int,
    db:         Session = Depends(get_db),
    current_user: User  = Depends(get_current_user),
):
    patient = _get_patient_or_404(patient_id, db)
    _assert_parent_owns(patient, current_user)

    rows = (
        db.query(CrisisEvent)
        .filter(CrisisEvent.patient_id == patient_id)
        .order_by(CrisisEvent.created_at.desc())
        .all()
    )

    out = []
    for r in rows:
        item = CrisisOut(
            id                  = r.id,
            patient_id          = r.patient_id,
            status              = r.status.value if r.status else "predicted",
            risk_score          = r.risk_score,
            risk_level          = r.risk_level.value if r.risk_level else None,
            trigger_signals     = json.loads(r.trigger_signals_json)   if r.trigger_signals_json   else [],
            prevention_steps    = json.loads(r.prevention_steps_json)  if r.prevention_steps_json  else [],
            occurred_at         = r.occurred_at,
            duration_minutes    = r.duration_minutes,
            trigger_description = r.trigger_description,
            de_escalation_used  = r.de_escalation_used,
            resolved_at         = r.resolved_at,
            created_at          = r.created_at,
        )
        out.append(item)
    return out


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/monitoring/crisis/{patient_id}/log
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/crisis/{patient_id}/log", response_model=CrisisOut, status_code=201)
def log_crisis(
    patient_id: int,
    payload:    CrisisLogRequest,
    db:         Session = Depends(get_db),
    current_user: User  = Depends(get_current_user),
):
    """Manually record a meltdown/crisis episode that actually occurred."""
    patient = _get_patient_or_404(patient_id, db)
    _assert_parent_owns(patient, current_user)

    event = CrisisEvent(
        patient_id          = patient_id,
        status              = CrisisStatusEnum.occurred,
        occurred_at         = payload.occurred_at or datetime.utcnow(),
        duration_minutes    = payload.duration_minutes,
        trigger_description = payload.trigger_description,
        de_escalation_used  = payload.de_escalation_used,
        notes               = payload.notes,
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    return CrisisOut(
        id                  = event.id,
        patient_id          = event.patient_id,
        status              = event.status.value,
        risk_score          = event.risk_score,
        risk_level          = None,
        trigger_signals     = [],
        prevention_steps    = [],
        occurred_at         = event.occurred_at,
        duration_minutes    = event.duration_minutes,
        trigger_description = event.trigger_description,
        de_escalation_used  = event.de_escalation_used,
        resolved_at         = event.resolved_at,
        created_at          = event.created_at,
    )


# ─────────────────────────────────────────────────────────────────────────────
# PATCH /api/monitoring/crisis/{event_id}/resolve
# ─────────────────────────────────────────────────────────────────────────────

@router.patch("/crisis/{event_id}/resolve", response_model=CrisisOut)
def resolve_crisis(
    event_id: int,
    payload:  CrisisResolveRequest,
    db:       Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "clinician")),
):
    """Mark a crisis event as resolved (clinicians and admins only)."""
    event = db.query(CrisisEvent).filter(CrisisEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Crisis event not found")

    event.status      = CrisisStatusEnum.resolved
    event.resolved_at = datetime.utcnow()
    event.resolved_by_user_id = current_user.id
    if payload.notes:
        event.notes = payload.notes

    db.commit()
    db.refresh(event)

    return CrisisOut(
        id                  = event.id,
        patient_id          = event.patient_id,
        status              = event.status.value,
        risk_score          = event.risk_score,
        risk_level          = event.risk_level.value if event.risk_level else None,
        trigger_signals     = json.loads(event.trigger_signals_json)  if event.trigger_signals_json  else [],
        prevention_steps    = json.loads(event.prevention_steps_json) if event.prevention_steps_json else [],
        occurred_at         = event.occurred_at,
        duration_minutes    = event.duration_minutes,
        trigger_description = event.trigger_description,
        de_escalation_used  = event.de_escalation_used,
        resolved_at         = event.resolved_at,
        created_at          = event.created_at,
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/monitoring/trends/{patient_id}
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/trends/{patient_id}", response_model=TrendOut)
def get_trends(
    patient_id:  int,
    days:        int = 30,
    db:          Session = Depends(get_db),
    current_user: User   = Depends(get_current_user),
):
    """
    Aggregate weekly/monthly trend summary.
    Used by the frontend to draw progress charts and correlation heatmaps.
    """
    patient = _get_patient_or_404(patient_id, db)
    _assert_parent_owns(patient, current_user)

    since = datetime.utcnow() - timedelta(days=days)

    checkins = (
        db.query(DailyCheckin)
        .filter(
            DailyCheckin.patient_id   == patient_id,
            DailyCheckin.checkin_date >= since,
        )
        .all()
    )

    crisis_count = (
        db.query(func.count(CrisisEvent.id))
        .filter(
            CrisisEvent.patient_id == patient_id,
            CrisisEvent.created_at >= since,
        )
        .scalar()
    )

    def avg(values):
        clean = [v for v in values if v is not None]
        return round(sum(clean) / len(clean), 2) if clean else None

    adherence_vals = [1 if c.therapy_completed else 0 for c in checkins]

    return TrendOut(
        patient_id            = patient_id,
        period_days           = days,
        avg_sleep_hours       = avg([c.sleep_hours        for c in checkins]),
        avg_communication     = avg([c.communication_attempts for c in checkins]),
        avg_meltdowns         = avg([c.meltdowns          for c in checkins]),
        avg_day_rating        = avg([c.overall_day_rating  for c in checkins]),
        avg_crisis_risk       = avg([c.crisis_risk_score   for c in checkins]),
        therapy_adherence_pct = round(avg(adherence_vals) * 100, 1) if adherence_vals else None,
        total_crisis_events   = crisis_count or 0,
        checkin_count         = len(checkins),
    )
