"""
Therapy Router
==============
Handles Therapy Management & Collaboration (PRD §6).

Endpoints
---------
GOALS
  POST   /api/therapy/goals                        — create a new therapy goal
  GET    /api/therapy/goals/{patient_id}           — list all goals for a patient
  GET    /api/therapy/goals/{patient_id}/summary   — goal progress summary (dashboard card)
  PATCH  /api/therapy/goals/{goal_id}              — update goal status / progress
  DELETE /api/therapy/goals/{goal_id}              — delete a goal (admin/clinician only)

SESSIONS
  POST   /api/therapy/sessions                     — log a therapy session
  GET    /api/therapy/sessions/{goal_id}           — list sessions for a goal
  GET    /api/therapy/sessions/{goal_id}/progress  — value_recorded over time (chart data)

COLLABORATION
  GET    /api/therapy/team/{patient_id}            — all therapists assigned to this patient

Access rules
------------
- Clinicians / admins : full read + write on all patients
- Therapists          : read all, write only on goals assigned to them
- Parents             : read-only on their own child's goals and sessions
"""

import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from models import (
    GoalStatusEnum, InterventionPlan,
    Patient, TherapyGoal, TherapySession,
    TherapyTypeEnum, User,
)
from auth_utils import get_current_user, require_roles

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# Shared helpers
# ─────────────────────────────────────────────────────────────────────────────

def _get_patient_or_404(patient_id: int, db: Session) -> Patient:
    p = db.query(Patient).filter(Patient.id == patient_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    return p


def _get_goal_or_404(goal_id: int, db: Session) -> TherapyGoal:
    g = db.query(TherapyGoal).filter(TherapyGoal.id == goal_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Therapy goal not found")
    return g


def _assert_can_read(patient: Patient, user: User) -> None:
    """Parents can only read their own child's data."""
    if user.role.value == "parent" and patient.parent_user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied to this patient")


def _assert_can_write_goal(goal: TherapyGoal, user: User) -> None:
    """
    Therapists can only modify goals assigned to them.
    Clinicians and admins can modify any goal.
    """
    if user.role.value == "therapist" and goal.therapist_user_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="Therapists can only update goals assigned to them",
        )
    if user.role.value == "parent":
        raise HTTPException(status_code=403, detail="Parents cannot modify therapy goals")


def _auto_update_goal_status(goal: TherapyGoal) -> None:
    """
    Recalculate GoalStatusEnum from current_value vs target_value.
    Called after every session log so the dashboard stays in sync.
    """
    if goal.target_value is None or goal.current_value is None:
        return

    pct = goal.current_value / goal.target_value if goal.target_value != 0 else 0

    if pct >= 1.0:
        goal.status = GoalStatusEnum.achieved
    elif pct >= 0.6:
        goal.status = GoalStatusEnum.on_track
    elif pct >= 0.2:
        goal.status = GoalStatusEnum.in_progress
    else:
        goal.status = GoalStatusEnum.behind

    # Check if past target date and not achieved
    if (
        goal.target_date
        and datetime.utcnow() > goal.target_date
        and goal.status != GoalStatusEnum.achieved
    ):
        goal.status = GoalStatusEnum.behind


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic schemas
# ─────────────────────────────────────────────────────────────────────────────

class GoalCreateRequest(BaseModel):
    patient_id:           int
    intervention_plan_id: Optional[int]  = None
    therapist_user_id:    Optional[int]  = None
    therapy_type:         TherapyTypeEnum
    goal_text:            str
    target_date:          Optional[datetime] = None
    baseline_value:       Optional[float]   = None
    target_value:         Optional[float]   = None
    unit:                 Optional[str]     = None   # "words" | "minutes" | "%"
    notes:                Optional[str]     = None


class GoalUpdateRequest(BaseModel):
    goal_text:        Optional[str]            = None
    status:           Optional[GoalStatusEnum] = None
    current_value:    Optional[float]          = None
    target_value:     Optional[float]          = None
    target_date:      Optional[datetime]       = None
    therapist_user_id: Optional[int]           = None
    notes:            Optional[str]            = None


class GoalOut(BaseModel):
    id:                   int
    patient_id:           int
    intervention_plan_id: Optional[int]
    therapist_user_id:    Optional[int]
    therapy_type:         str
    goal_text:            str
    target_date:          Optional[datetime]
    status:               str
    baseline_value:       Optional[float]
    current_value:        Optional[float]
    target_value:         Optional[float]
    unit:                 Optional[str]
    progress_pct:         Optional[float]      # computed, not stored
    notes:                Optional[str]
    created_at:           datetime
    updated_at:           datetime

    model_config = {"from_attributes": True}


class GoalSummaryItem(BaseModel):
    therapy_type:   str
    total:          int
    achieved:       int
    on_track:       int
    behind:         int
    not_started:    int
    in_progress:    int


class SessionCreateRequest(BaseModel):
    goal_id:          int
    session_date:     Optional[datetime]     = None
    duration_minutes: Optional[int]         = None
    therapy_type:     Optional[TherapyTypeEnum] = None
    progress_note:    Optional[str]         = None
    value_recorded:   Optional[float]       = None   # the measurement this session
    adherence:        bool                  = True
    shared_notes:     Optional[str]         = None   # visible to whole care team


class SessionOut(BaseModel):
    id:               int
    goal_id:          int
    therapist_user_id: Optional[int]
    session_date:     datetime
    duration_minutes: Optional[int]
    therapy_type:     Optional[str]
    progress_note:    Optional[str]
    value_recorded:   Optional[float]
    adherence:        bool
    shared_notes:     Optional[str]
    created_at:       datetime

    model_config = {"from_attributes": True}


class ProgressPoint(BaseModel):
    session_date:   datetime
    value_recorded: Optional[float]
    progress_note:  Optional[str]


class TeamMember(BaseModel):
    user_id:      int
    full_name:    str
    therapy_type: Optional[str]
    goal_count:   int


# ─────────────────────────────────────────────────────────────────────────────
# GOALS
# ─────────────────────────────────────────────────────────────────────────────

# POST /api/therapy/goals
@router.post("/goals", response_model=GoalOut, status_code=201)
def create_goal(
    payload:      GoalCreateRequest,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(require_roles("admin", "clinician", "therapist")),
):
    """Create a measurable therapy goal for a patient."""
    patient = _get_patient_or_404(payload.patient_id, db)

    # Validate intervention plan belongs to this patient (if provided)
    if payload.intervention_plan_id:
        plan = db.query(InterventionPlan).filter(
            InterventionPlan.id         == payload.intervention_plan_id,
            InterventionPlan.patient_id == payload.patient_id,
        ).first()
        if not plan:
            raise HTTPException(
                status_code=400,
                detail="Intervention plan not found for this patient",
            )

    goal = TherapyGoal(
        patient_id           = payload.patient_id,
        intervention_plan_id = payload.intervention_plan_id,
        therapist_user_id    = payload.therapist_user_id or current_user.id,
        therapy_type         = payload.therapy_type,
        goal_text            = payload.goal_text,
        target_date          = payload.target_date,
        baseline_value       = payload.baseline_value,
        current_value        = payload.baseline_value,   # start at baseline
        target_value         = payload.target_value,
        unit                 = payload.unit,
        notes                = payload.notes,
        status               = GoalStatusEnum.not_started,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return _goal_out(goal)


# GET /api/therapy/goals/{patient_id}
@router.get("/goals/{patient_id}", response_model=list[GoalOut])
def list_goals(
    patient_id:   int,
    therapy_type: Optional[str] = None,   # optional filter
    status:       Optional[str] = None,   # optional filter
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    """List all therapy goals for a patient, with optional filters."""
    patient = _get_patient_or_404(patient_id, db)
    _assert_can_read(patient, current_user)

    q = db.query(TherapyGoal).filter(TherapyGoal.patient_id == patient_id)

    if therapy_type:
        q = q.filter(TherapyGoal.therapy_type == therapy_type)
    if status:
        q = q.filter(TherapyGoal.status == status)

    goals = q.order_by(TherapyGoal.created_at.desc()).all()
    return [_goal_out(g) for g in goals]


# GET /api/therapy/goals/{patient_id}/summary
@router.get("/goals/{patient_id}/summary", response_model=list[GoalSummaryItem])
def goals_summary(
    patient_id:   int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    """
    Return goal counts grouped by therapy type and status.
    Powers the dashboard 'Therapy Plan' card (PRD §6a).
    """
    patient = _get_patient_or_404(patient_id, db)
    _assert_can_read(patient, current_user)

    goals = db.query(TherapyGoal).filter(TherapyGoal.patient_id == patient_id).all()

    # Group by therapy_type
    buckets: dict[str, dict] = {}
    for g in goals:
        ttype = g.therapy_type.value if g.therapy_type else "other"
        if ttype not in buckets:
            buckets[ttype] = {
                "therapy_type": ttype,
                "total": 0,
                "achieved": 0,
                "on_track": 0,
                "behind": 0,
                "not_started": 0,
                "in_progress": 0,
            }
        b = buckets[ttype]
        b["total"] += 1
        s = g.status.value if g.status else "not_started"
        if s in b:
            b[s] += 1

    return list(buckets.values())


# PATCH /api/therapy/goals/{goal_id}
@router.patch("/goals/{goal_id}", response_model=GoalOut)
def update_goal(
    goal_id:      int,
    payload:      GoalUpdateRequest,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    """Update a goal's text, status, current value, or assigned therapist."""
    goal = _get_goal_or_404(goal_id, db)
    _assert_can_write_goal(goal, current_user)

    if payload.goal_text        is not None: goal.goal_text         = payload.goal_text
    if payload.status           is not None: goal.status            = payload.status
    if payload.current_value    is not None: goal.current_value     = payload.current_value
    if payload.target_value     is not None: goal.target_value      = payload.target_value
    if payload.target_date      is not None: goal.target_date       = payload.target_date
    if payload.therapist_user_id is not None: goal.therapist_user_id = payload.therapist_user_id
    if payload.notes            is not None: goal.notes             = payload.notes

    # Recompute status from values if status not explicitly set
    if payload.status is None:
        _auto_update_goal_status(goal)

    goal.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(goal)
    return _goal_out(goal)


# DELETE /api/therapy/goals/{goal_id}
@router.delete("/goals/{goal_id}", status_code=204)
def delete_goal(
    goal_id:      int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(require_roles("admin", "clinician")),
):
    """Delete a therapy goal and all its sessions (cascade)."""
    goal = _get_goal_or_404(goal_id, db)
    db.delete(goal)
    db.commit()


# ─────────────────────────────────────────────────────────────────────────────
# SESSIONS
# ─────────────────────────────────────────────────────────────────────────────

# POST /api/therapy/sessions
@router.post("/sessions", response_model=SessionOut, status_code=201)
def log_session(
    payload:      SessionCreateRequest,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(require_roles("admin", "clinician", "therapist")),
):
    """
    Log a completed therapy session.
    Automatically updates the parent goal's current_value and recalculates status.
    """
    goal = _get_goal_or_404(payload.goal_id, db)
    _assert_can_write_goal(goal, current_user)

    session = TherapySession(
        goal_id           = payload.goal_id,
        therapist_user_id = current_user.id,
        session_date      = payload.session_date or datetime.utcnow(),
        duration_minutes  = payload.duration_minutes,
        therapy_type      = payload.therapy_type or goal.therapy_type,
        progress_note     = payload.progress_note,
        value_recorded    = payload.value_recorded,
        adherence         = payload.adherence,
        shared_notes      = payload.shared_notes,
    )
    db.add(session)

    # Update goal's current_value with the latest measurement
    if payload.value_recorded is not None:
        goal.current_value = payload.value_recorded
        _auto_update_goal_status(goal)
        goal.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(session)
    return SessionOut.model_validate(session)


# GET /api/therapy/sessions/{goal_id}
@router.get("/sessions/{goal_id}", response_model=list[SessionOut])
def list_sessions(
    goal_id:      int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    """List all sessions logged for a specific goal."""
    goal = _get_goal_or_404(goal_id, db)

    # Check read access via patient
    patient = _get_patient_or_404(goal.patient_id, db)
    _assert_can_read(patient, current_user)

    sessions = (
        db.query(TherapySession)
        .filter(TherapySession.goal_id == goal_id)
        .order_by(TherapySession.session_date.asc())
        .all()
    )
    return [SessionOut.model_validate(s) for s in sessions]


# GET /api/therapy/sessions/{goal_id}/progress
@router.get("/sessions/{goal_id}/progress", response_model=list[ProgressPoint])
def goal_progress_chart(
    goal_id:      int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    """
    Return (date, value_recorded) pairs for a goal — used by frontend
    to draw the progress line chart (PRD §6 progress analytics).
    """
    goal = _get_goal_or_404(goal_id, db)
    patient = _get_patient_or_404(goal.patient_id, db)
    _assert_can_read(patient, current_user)

    sessions = (
        db.query(TherapySession)
        .filter(TherapySession.goal_id == goal_id)
        .order_by(TherapySession.session_date.asc())
        .all()
    )
    return [
        ProgressPoint(
            session_date   = s.session_date,
            value_recorded = s.value_recorded,
            progress_note  = s.progress_note,
        )
        for s in sessions
    ]


# ─────────────────────────────────────────────────────────────────────────────
# COLLABORATION — care team per patient
# ─────────────────────────────────────────────────────────────────────────────

# GET /api/therapy/team/{patient_id}
@router.get("/team/{patient_id}", response_model=list[TeamMember])
def get_care_team(
    patient_id:   int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    """
    Return all therapists who have at least one goal assigned for this patient.
    Powers the 'Therapist Collaboration Portal' view (PRD §6c).
    """
    patient = _get_patient_or_404(patient_id, db)
    _assert_can_read(patient, current_user)

    goals = (
        db.query(TherapyGoal)
        .filter(
            TherapyGoal.patient_id      == patient_id,
            TherapyGoal.therapist_user_id != None,          # noqa: E711
        )
        .all()
    )

    # Aggregate by therapist
    team: dict[int, dict] = {}
    for g in goals:
        uid = g.therapist_user_id
        if uid not in team:
            therapist = db.query(User).filter(User.id == uid).first()
            if not therapist:
                continue
            team[uid] = {
                "user_id":      uid,
                "full_name":    therapist.full_name,
                "therapy_type": (
                    therapist.therapist_profile.therapy_type.value
                    if therapist.therapist_profile and therapist.therapist_profile.therapy_type
                    else None
                ),
                "goal_count": 0,
            }
        team[uid]["goal_count"] += 1

    return list(team.values())


# ─────────────────────────────────────────────────────────────────────────────
# Internal helper — build GoalOut with computed progress_pct
# ─────────────────────────────────────────────────────────────────────────────

def _goal_out(goal: TherapyGoal) -> GoalOut:
    pct = None
    if goal.target_value and goal.current_value is not None and goal.target_value != 0:
        pct = round((goal.current_value / goal.target_value) * 100, 1)

    return GoalOut(
        id                   = goal.id,
        patient_id           = goal.patient_id,
        intervention_plan_id = goal.intervention_plan_id,
        therapist_user_id    = goal.therapist_user_id,
        therapy_type         = goal.therapy_type.value if goal.therapy_type else "other",
        goal_text            = goal.goal_text,
        target_date          = goal.target_date,
        status               = goal.status.value if goal.status else "not_started",
        baseline_value       = goal.baseline_value,
        current_value        = goal.current_value,
        target_value         = goal.target_value,
        unit                 = goal.unit,
        progress_pct         = pct,
        notes                = goal.notes,
        created_at           = goal.created_at,
        updated_at           = goal.updated_at,
    )