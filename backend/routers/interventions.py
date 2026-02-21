"""
Interventions Router
====================
Handles the Predictive Intervention Engine (PRD §3).

Endpoints
---------
POST   /api/interventions/generate/{patient_id}  — AI generates Plan A + B for a patient
GET    /api/interventions/{patient_id}           — list all plans for a patient
GET    /api/interventions/plan/{plan_id}         — get a single plan in detail
PATCH  /api/interventions/plan/{plan_id}/accept  — clinician accepts / modifies a plan
PATCH  /api/interventions/plan/{plan_id}/reject  — clinician rejects a plan

Access rules
------------
- Clinicians / admins : full read + write
- Therapists          : read-only
- Parents             : read-only (their child's active plan only)
"""

import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth_utils import get_current_user, require_roles
from database import get_db
from models import (
    InterventionPlan, Patient,
    ScreeningLog,
    TherapyGoal, TherapyTypeEnum,
    GoalStatusEnum, User,
)

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _get_patient_or_404(patient_id: int, db: Session) -> Patient:
    p = db.query(Patient).filter(Patient.id == patient_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    return p


def _get_plan_or_404(plan_id: int, db: Session) -> InterventionPlan:
    p = db.query(InterventionPlan).filter(InterventionPlan.id == plan_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Intervention plan not found")
    return p


def _assert_can_read(patient: Patient, user: User) -> None:
    if user.role.value == "parent" and patient.parent_user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied to this patient")


# ─────────────────────────────────────────────────────────────────────────────
# Rule-based plan generator
# (Replace _generate_plans() body with your ML model call when ready —
#  the interface and return format stay identical.)
# ─────────────────────────────────────────────────────────────────────────────

def _build_input_features(patient: Patient, latest_screening: Optional[ScreeningLog]) -> dict:
    """Collect all available signals into a single features dict."""
    meta = {}
    if patient.metadata_json:
        try:
            meta = json.loads(patient.metadata_json)
        except Exception:
            pass

    indicators = {}
    severity   = "moderate"
    risk_score = 0.5

    if latest_screening:
        risk_score = latest_screening.risk_score or 0.5
        severity   = (
            latest_screening.severity.value
            if latest_screening.severity else "moderate"
        )
        if latest_screening.indicators_json:
            try:
                indicators = json.loads(latest_screening.indicators_json)
            except Exception:
                pass

    return {
        "age_months":         meta.get("age_months"),
        "gender":             meta.get("gender"),
        "severity":           severity,
        "risk_score":         risk_score,
        "co_conditions":      meta.get("co_conditions", []),
        "family_resources":   meta.get("family_resources", "moderate"),
        "location":           meta.get("location"),
        "eye_contact":        indicators.get("eye_contact"),
        "joint_attention":    indicators.get("joint_attention"),
        "motor_patterns":     indicators.get("motor_patterns"),
        "social_responsiveness": indicators.get("social_responsiveness"),
    }


def _generate_plans(features: dict) -> list[dict]:
    """
    Rule-based plan generator — produces Plan A (intensive) and Plan B (balanced).

    Swap this function body with real ML inference when available.
    Input/output contract must stay the same.
    """
    severity   = features.get("severity", "moderate")
    risk_score = features.get("risk_score", 0.5)

    # ── Severity multipliers ─────────────────────────────────────────────────
    if severity == "severe":
        speech_freq, aba_hours, ot_freq = "5x/week", 25, "3x/week"
        speech_prob, social_prob = 0.75, 0.60
        milestone_a, milestone_b = 9.0, 11.0
        cost_a, cost_b           = 520000, 390000
    elif severity == "mild":
        speech_freq, aba_hours, ot_freq = "2x/week", 10, "1x/week"
        speech_prob, social_prob = 0.88, 0.75
        milestone_a, milestone_b = 5.5, 7.0
        cost_a, cost_b           = 280000, 210000
    else:   # moderate (default)
        speech_freq, aba_hours, ot_freq = "4x/week", 20, "2x/week"
        speech_prob, social_prob = 0.82, 0.67
        milestone_a, milestone_b = 7.2, 9.5
        cost_a, cost_b           = 420000, 290000

    plan_a = {
        "plan_option": "A",
        "plan_name":   "Intensive Communication Focus",
        "therapies": [
            {"type": "speech",       "frequency": speech_freq, "duration_min": 45},
            {"type": "aba",          "frequency": f"{aba_hours} hrs/week", "duration_min": 60},
            {"type": "occupational", "frequency": ot_freq,     "duration_min": 45},
        ],
        "predicted_outcomes": {
            "verbal_communication":       round(speech_prob, 2),
            "social_skills_improvement":  round(social_prob, 2),
            "behavioral_reduction":       round(social_prob - 0.12, 2),
        },
        "milestone_months": milestone_a,
        "milestone_std":    1.8,
        "estimated_cost":   cost_a,
        "reasoning": (
            f"Children with {severity} ASD severity and risk score "
            f"{risk_score:.2f} show {int(speech_prob*100)}% better communication "
            f"outcomes with intensive speech focus in the first 6 months, "
            f"followed by ABA introduction."
        ),
    }

    plan_b = {
        "plan_option": "B",
        "plan_name":   "Balanced Development",
        "therapies": [
            {"type": "speech",  "frequency": "3x/week",           "duration_min": 45},
            {"type": "aba",     "frequency": f"{aba_hours//2} hrs/week", "duration_min": 60},
            {"type": "social",  "frequency": "1x/week",           "duration_min": 60},
        ],
        "predicted_outcomes": {
            "verbal_communication":       round(speech_prob - 0.17, 2),
            "social_skills_improvement":  round(social_prob - 0.10, 2),
            "behavioral_reduction":       round(social_prob - 0.20, 2),
        },
        "milestone_months": milestone_b,
        "milestone_std":    2.2,
        "estimated_cost":   cost_b,
        "reasoning": (
            "A lower-intensity balanced approach suits families with moderate "
            "time/resource constraints. Outcomes are good but take longer to achieve."
        ),
    }

    return [plan_a, plan_b]


def _auto_create_goals(
    plan: InterventionPlan,
    patient_id: int,
    db: Session,
) -> None:
    """
    Seed a set of starter TherapyGoal rows from the plan's therapies list.
    Clinicians can edit or delete these after review.
    """
    if not plan.therapies_json:
        return

    try:
        therapies = json.loads(plan.therapies_json)
    except Exception:
        return

    # Map therapy type string → TherapyTypeEnum
    type_map = {t.value: t for t in TherapyTypeEnum}

    for therapy in therapies:
        ttype_str = therapy.get("type", "other")
        ttype     = type_map.get(ttype_str, TherapyTypeEnum.other)
        freq      = therapy.get("frequency", "")
        dur       = therapy.get("duration_min")

        goal = TherapyGoal(
            patient_id           = patient_id,
            intervention_plan_id = plan.id,
            therapy_type         = ttype,
            goal_text            = f"{ttype_str.capitalize()} therapy — {freq}",
            status               = GoalStatusEnum.not_started,
            notes                = f"Auto-created from Plan {plan.plan_option}. Duration: {dur} min/session.",
        )
        db.add(goal)


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic schemas
# ─────────────────────────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    """
    Optional overrides the clinician can pass before generation.
    If omitted the engine reads from the patient's latest screening + metadata.
    """
    severity:         Optional[str]       = None   # mild | moderate | severe
    co_conditions:    Optional[list[str]] = None   # ["adhd", "sleep_issues"]
    family_resources: Optional[str]       = None   # low | moderate | high
    auto_create_goals: bool               = True   # seed TherapyGoal rows?


class PlanOut(BaseModel):
    id:                     int
    patient_id:             int
    created_by:             Optional[int]
    plan_name:              Optional[str]
    plan_option:            Optional[str]
    therapies:              list[dict]        = []
    predicted_outcomes:     dict              = {}
    milestone_months:       Optional[float]
    milestone_std:          Optional[float]
    estimated_cost:         Optional[float]
    reasoning:              Optional[str]
    accepted:               Optional[bool]
    clinician_notes:        Optional[str]
    is_active:              bool
    input_features:         dict              = {}
    created_at:             datetime
    updated_at:             datetime

    model_config = {"from_attributes": True}


class AcceptRequest(BaseModel):
    clinician_notes: Optional[str] = None
    # Clinician can tweak the plan before accepting
    override_therapies:        Optional[list[dict]] = None
    override_predicted_outcomes: Optional[dict]    = None


class RejectRequest(BaseModel):
    clinician_notes: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# Serialise ORM → PlanOut
# ─────────────────────────────────────────────────────────────────────────────

def _plan_out(plan: InterventionPlan) -> PlanOut:
    def _load(field) -> any:
        if not field:
            return {} if isinstance(field, str) else []
        try:
            return json.loads(field)
        except Exception:
            return {}

    return PlanOut(
        id                 = plan.id,
        patient_id         = plan.patient_id,
        created_by         = plan.created_by,
        plan_name          = plan.plan_name,
        plan_option        = plan.plan_option,
        therapies          = _load(plan.therapies_json) or [],
        predicted_outcomes = _load(plan.predicted_outcomes_json) or {},
        milestone_months   = plan.milestone_months,
        milestone_std      = plan.milestone_std,
        estimated_cost     = plan.estimated_cost,
        reasoning          = plan.reasoning,
        accepted           = plan.accepted,
        clinician_notes    = plan.clinician_notes,
        is_active          = plan.is_active,
        input_features     = _load(plan.input_features_json) or {},
        created_at         = plan.created_at,
        updated_at         = plan.updated_at,
    )


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/interventions/generate/{patient_id}
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/generate/{patient_id}", response_model=list[PlanOut], status_code=201)
def generate_plans(
    patient_id:   int,
    payload:      GenerateRequest,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(require_roles("admin", "clinician")),
):
    """
    Generate Plan A + Plan B for a patient using the AI engine.

    Steps:
      1. Pull latest screening result for this patient
      2. Build input features (screening + metadata + any overrides)
      3. Run plan generator (rule-based now, ML later)
      4. Deactivate any previous plans
      5. Persist both plans
      6. Optionally seed starter TherapyGoal rows
    """
    patient = _get_patient_or_404(patient_id, db)

    # 1. Latest screening
    latest_screening = (
        db.query(ScreeningLog)
        .filter(ScreeningLog.patient_id == patient_id)
        .order_by(ScreeningLog.created_at.desc())
        .first()
    )

    # 2. Build features + apply any overrides from request
    features = _build_input_features(patient, latest_screening)
    if payload.severity:
        features["severity"] = payload.severity
    if payload.co_conditions:
        features["co_conditions"] = payload.co_conditions
    if payload.family_resources:
        features["family_resources"] = payload.family_resources

    # 3. Generate plans
    raw_plans = _generate_plans(features)

    # 4. Deactivate previous active plans for this patient
    db.query(InterventionPlan).filter(
        InterventionPlan.patient_id == patient_id,
        InterventionPlan.is_active  == True,        # noqa: E712
    ).update({"is_active": False})

    # 5. Persist + optionally seed goals
    created = []
    for raw in raw_plans:
        plan = InterventionPlan(
            patient_id              = patient_id,
            created_by              = current_user.id,
            plan_name               = raw["plan_name"],
            plan_option             = raw["plan_option"],
            input_features_json     = json.dumps(features),
            therapies_json          = json.dumps(raw["therapies"]),
            predicted_outcomes_json = json.dumps(raw["predicted_outcomes"]),
            milestone_months        = raw["milestone_months"],
            milestone_std           = raw["milestone_std"],
            estimated_cost          = raw["estimated_cost"],
            reasoning               = raw["reasoning"],
            is_active               = True,
            accepted                = None,   # pending clinician review
        )
        db.add(plan)
        db.flush()   # need plan.id for goal seeding

        if payload.auto_create_goals:
            _auto_create_goals(plan, patient_id, db)

        created.append(plan)

    db.commit()
    for p in created:
        db.refresh(p)

    return [_plan_out(p) for p in created]


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/interventions/{patient_id}
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{patient_id}", response_model=list[PlanOut])
def list_plans(
    patient_id:   int,
    active_only:  bool = False,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    """List all intervention plans for a patient."""
    patient = _get_patient_or_404(patient_id, db)
    _assert_can_read(patient, current_user)

    q = db.query(InterventionPlan).filter(
        InterventionPlan.patient_id == patient_id
    )
    if active_only:
        q = q.filter(InterventionPlan.is_active == True)   # noqa: E712

    plans = q.order_by(InterventionPlan.created_at.desc()).all()
    return [_plan_out(p) for p in plans]


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/interventions/plan/{plan_id}
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/plan/{plan_id}", response_model=PlanOut)
def get_plan(
    plan_id:      int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    """Get a single intervention plan in full detail."""
    plan    = _get_plan_or_404(plan_id, db)
    patient = _get_patient_or_404(plan.patient_id, db)
    _assert_can_read(patient, current_user)
    return _plan_out(plan)


# ─────────────────────────────────────────────────────────────────────────────
# PATCH /api/interventions/plan/{plan_id}/accept
# ─────────────────────────────────────────────────────────────────────────────

@router.patch("/plan/{plan_id}/accept", response_model=PlanOut)
def accept_plan(
    plan_id:      int,
    payload:      AcceptRequest,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(require_roles("admin", "clinician")),
):
    """
    Clinician accepts a plan (optionally with tweaks).
    Automatically rejects the sibling plan (A rejects B and vice versa).
    Implements the 'Clinician Override & Feedback Loop' from PRD §2e.
    """
    plan = _get_plan_or_404(plan_id, db)

    plan.accepted       = True
    plan.clinician_notes = payload.clinician_notes

    # Apply any clinician overrides
    if payload.override_therapies:
        plan.therapies_json = json.dumps(payload.override_therapies)
    if payload.override_predicted_outcomes:
        plan.predicted_outcomes_json = json.dumps(payload.override_predicted_outcomes)

    plan.updated_at = datetime.utcnow()

    # Auto-reject the other plan option for the same patient + generation batch
    sibling_option = "B" if plan.plan_option == "A" else "A"
    sibling = (
        db.query(InterventionPlan)
        .filter(
            InterventionPlan.patient_id  == plan.patient_id,
            InterventionPlan.plan_option == sibling_option,
            InterventionPlan.is_active   == True,            # noqa: E712
            InterventionPlan.id          != plan.id,
        )
        .first()
    )
    if sibling:
        sibling.accepted        = False
        sibling.clinician_notes = f"Auto-rejected — Plan {plan.plan_option} was accepted."
        sibling.updated_at      = datetime.utcnow()

    db.commit()
    db.refresh(plan)
    return _plan_out(plan)


# ─────────────────────────────────────────────────────────────────────────────
# PATCH /api/interventions/plan/{plan_id}/reject
# ─────────────────────────────────────────────────────────────────────────────

@router.patch("/plan/{plan_id}/reject", response_model=PlanOut)
def reject_plan(
    plan_id:      int,
    payload:      RejectRequest,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(require_roles("admin", "clinician")),
):
    """Clinician explicitly rejects a plan with optional notes."""
    plan = _get_plan_or_404(plan_id, db)

    plan.accepted        = False
    plan.clinician_notes = payload.clinician_notes
    plan.updated_at      = datetime.utcnow()

    db.commit()
    db.refresh(plan)
    return _plan_out(plan)