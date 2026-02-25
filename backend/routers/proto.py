"""
Prototype router — isolated endpoints against proto_* tables.

Prefix : /api/proto
Models : minimal_models (proto_users, proto_patients, proto_daily_checkins, proto_screening_results)

This router is intentionally decoupled from production models and routers.
Safe to remove or replace once the prototype phase is complete.
"""

import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth_utils import hash_password, verify_password
from database import get_db
from minimal_models import DailyCheckin, Patient as ProtoPatient, ScreeningResult, User
from models import InterventionPlan, Patient as ProdPatient, hash_child_id

router = APIRouter(prefix="/proto", tags=["Proto"])


def _public_user(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at,
    }


def _predict_intervention_plans(features: dict) -> list[dict]:
    """
    Prototype ML hook: replace this body with real model inference.
    Keep the return format stable for the frontend.
    """
    severity = (features.get("severity") or "moderate").lower()
    risk = float(features.get("risk_score") or 0.5)

    if severity == "severe":
        freq_a, freq_b, freq_c = "5x/week", "3x/week", "2x/week"
        milestone_a, milestone_b, milestone_c = 0.85, 0.72, 0.60
        time_a, time_b, time_c = "6-9 months", "9-12 months", "12-18 months"
        cost_a, cost_b, cost_c = 15000, 9500, 6000
    elif severity == "mild":
        freq_a, freq_b, freq_c = "3x/week", "2x/week", "1x/week"
        milestone_a, milestone_b, milestone_c = 0.80, 0.70, 0.62
        time_a, time_b, time_c = "6-9 months", "9-12 months", "12-18 months"
        cost_a, cost_b, cost_c = 11000, 7800, 5200
    else:
        freq_a, freq_b, freq_c = "4x/week", "3x/week", "2x/week"
        milestone_a, milestone_b, milestone_c = 0.82, 0.71, 0.58
        time_a, time_b, time_c = "6-9 months", "9-12 months", "12-18 months"
        cost_a, cost_b, cost_c = 13000, 8800, 5800

    # Light risk adjustment
    milestone_a = min(0.95, max(0.45, milestone_a + (risk - 0.5) * 0.2))
    milestone_b = min(0.90, max(0.40, milestone_b + (risk - 0.5) * 0.15))
    milestone_c = min(0.85, max(0.35, milestone_c + (risk - 0.5) * 0.1))

    return [
        {
            "key": "A",
            "name": "Intensive",
            "tag": "Recommended",
            "subtitle": "Aggressive approach for rapid progress",
            "frequency": freq_a,
            "milestone_probability": round(milestone_a * 100),
            "time_estimate": time_a,
            "cost_estimate": cost_a,
            "desc": "Combines ABA, speech, and occupational therapy to maximize early developmental gains.",
        },
        {
            "key": "B",
            "name": "Balanced",
            "tag": None,
            "subtitle": "Structured approach for steady improvement",
            "frequency": freq_b,
            "milestone_probability": round(milestone_b * 100),
            "time_estimate": time_b,
            "cost_estimate": cost_b,
            "desc": "Balanced mix of ABA and speech therapy with manageable weekly commitments.",
        },
        {
            "key": "C",
            "name": "Social",
            "tag": None,
            "subtitle": "Focus on social skills and peer interaction",
            "frequency": freq_c,
            "milestone_probability": round(milestone_c * 100),
            "time_estimate": time_c,
            "cost_estimate": cost_c,
            "desc": "Emphasizes social skills training and group sessions for confidence and interaction.",
        },
    ]


def _parse_time_months(time_estimate: str) -> float:
    """
    Convert strings like "6-9 months" or "12 months" to a numeric midpoint.
    """
    if not time_estimate:
        return 0.0
    cleaned = time_estimate.lower().replace("months", "").strip()
    if "-" in cleaned:
        parts = cleaned.split("-")
        try:
            lo = float(parts[0].strip())
            hi = float(parts[1].strip())
            return (lo + hi) / 2.0
        except Exception:
            return 0.0
    try:
        return float(cleaned)
    except Exception:
        return 0.0


def _get_or_create_prod_patient(payload: dict, db: Session) -> ProdPatient | None:
    proto_id = payload.get("proto_patient_id")
    if proto_id is None:
        return None

    child_id_hashed = hash_child_id(f"proto:{proto_id}")
    patient = db.query(ProdPatient).filter(ProdPatient.child_id_hashed == child_id_hashed).first()
    if patient:
        return patient

    meta = {"proto_patient_id": proto_id}
    if payload.get("patient_name"):
        meta["display_name"] = payload.get("patient_name")
    if payload.get("age_years") is not None:
        meta["age_years"] = payload.get("age_years")

    patient = ProdPatient(
        child_id_hashed=child_id_hashed,
        metadata_json=json.dumps(meta),
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


# ── Users ─────────────────────────────────────────────────────────────────────

@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    """Return all prototype users (proto_users table)."""
    return [_public_user(u) for u in db.query(User).all()]


@router.post("/users", status_code=201)
def create_user(payload: dict, db: Session = Depends(get_db)):
    """Create a prototype user. Requires: email, password. Optional: full_name, role."""
    email = payload.get("email")
    password = payload.get("password")
    if not email:
        raise HTTPException(status_code=400, detail="email is required")
    if not password:
        raise HTTPException(status_code=400, detail="password is required")

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="email already exists")

    user = User(
        email=email,
        full_name=payload.get("full_name"),
        role=payload.get("role", "parent"),
        hashed_password=hash_password(password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _public_user(user)


@router.post("/login")
def login(payload: dict, db: Session = Depends(get_db)):
    """Prototype login. Requires: email, password."""
    email = payload.get("email")
    password = payload.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="email and password are required")

    user = db.query(User).filter(User.email == email).first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="invalid credentials")
    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="invalid credentials")

    return _public_user(user)


# ── Patients ──────────────────────────────────────────────────────────────────

@router.get("/patients")
def list_patients(db: Session = Depends(get_db)):
    """Return all prototype patients (proto_patients table)."""
    return db.query(ProtoPatient).all()


@router.post("/patients", status_code=201)
def create_patient(payload: dict, db: Session = Depends(get_db)):
    """Create a prototype patient. Requires: name. Optional: parent_id, dob."""
    name = payload.get("name")
    if not name:
        raise HTTPException(status_code=400, detail="name is required")

    patient = ProtoPatient(
        name=name,
        parent_id=payload.get("parent_id"),
        dob=payload.get("dob"),
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


# ── Daily Check-ins ───────────────────────────────────────────────────────────

@router.get("/patients/{patient_id}/checkins")
def list_checkins(patient_id: int, db: Session = Depends(get_db)):
    """Return all check-ins for a prototype patient."""
    return (
        db.query(DailyCheckin)
        .filter(DailyCheckin.patient_id == patient_id)
        .order_by(DailyCheckin.created_at.desc())
        .all()
    )


@router.post("/patients/{patient_id}/checkins", status_code=201)
def add_checkin(patient_id: int, payload: dict, db: Session = Depends(get_db)):
    """Add a daily check-in for a prototype patient. Optional: mood, notes."""
    if not db.query(ProtoPatient).filter(ProtoPatient.id == patient_id).first():
        raise HTTPException(status_code=404, detail="patient not found")

    checkin = DailyCheckin(
        patient_id=patient_id,
        mood=payload.get("mood"),
        notes=payload.get("notes"),
    )
    db.add(checkin)
    db.commit()
    db.refresh(checkin)
    return checkin


# ── Screening Results ─────────────────────────────────────────────────────────

@router.get("/patients/{patient_id}/screenings")
def list_screenings(patient_id: int, db: Session = Depends(get_db)):
    """Return all screening results for a prototype patient."""
    return (
        db.query(ScreeningResult)
        .filter(ScreeningResult.patient_id == patient_id)
        .order_by(ScreeningResult.created_at.desc())
        .all()
    )


@router.post("/patients/{patient_id}/screenings", status_code=201)
def add_screening(patient_id: int, payload: dict, db: Session = Depends(get_db)):
    """Add a screening result. Requires: score. Optional: interpretation."""
    if not db.query(ProtoPatient).filter(ProtoPatient.id == patient_id).first():
        raise HTTPException(status_code=404, detail="patient not found")

    score = payload.get("score")
    if score is None:
        raise HTTPException(status_code=400, detail="score is required")

    result = ScreeningResult(
        patient_id=patient_id,
        score=int(score),
        interpretation=payload.get("interpretation"),
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


# ── Prototype Intervention Engine ────────────────────────────────────────────

@router.post("/interventions/generate")
def generate_proto_interventions(payload: dict, db: Session = Depends(get_db)):
    """
    Prototype intervention generator (no auth, no DB).
    Expects: age_years, severity, risk_score, comm_score, motor_score, notes (optional)
    Returns: list of plans (A/B/C) with frequency, time, milestone probability, cost, desc.
    """
    features = {
        "age_years": payload.get("age_years"),
        "severity": payload.get("severity"),
        "risk_score": payload.get("risk_score"),
        "comm_score": payload.get("comm_score"),
        "motor_score": payload.get("motor_score"),
        "notes": payload.get("notes"),
    }
    plans = _predict_intervention_plans(features)
    # Auto-select plan using weighted score (milestone + cost + time + fit bonus)
    recommended_key = None
    if plans:
        milestones = [p.get("milestone_probability", 0) for p in plans]
        costs = [p.get("cost_estimate", 0) for p in plans]
        times = [_parse_time_months(p.get("time_estimate", "")) for p in plans]

        min_m, max_m = min(milestones), max(milestones)
        min_c, max_c = min(costs), max(costs)
        min_t, max_t = min(times), max(times)

        def norm(val, vmin, vmax, invert=False):
            if vmax == vmin:
                return 1.0
            score = (val - vmin) / (vmax - vmin)
            return 1.0 - score if invert else score

        severity = (features.get("severity") or "moderate").lower()
        risk_score = float(features.get("risk_score") or 0.5)

        def fit_bonus(plan_key: str) -> float:
            bonus = 0.0
            # Severity alignment
            if severity == "severe" and plan_key == "A":
                bonus += 0.12
            elif severity == "moderate" and plan_key == "B":
                bonus += 0.12
            elif severity == "mild" and plan_key == "C":
                bonus += 0.12
            # Risk alignment
            if risk_score >= 0.75 and plan_key == "A":
                bonus += 0.08
            if risk_score <= 0.40 and plan_key == "C":
                bonus += 0.08
            return bonus

        scored = []
        for plan, m, c, t in zip(plans, milestones, costs, times):
            m_score = norm(m, min_m, max_m, invert=False)
            c_score = norm(c, min_c, max_c, invert=True)   # lower cost is better
            t_score = norm(t, min_t, max_t, invert=True)   # shorter time is better
            total = 0.45 * m_score + 0.30 * c_score + 0.20 * t_score + fit_bonus(plan.get("key"))
            scored.append((total, plan))

        recommended_key = max(scored, key=lambda x: x[0])[1].get("key")

    # Persist to production intervention_plans (Option 1).
    prod_patient = _get_or_create_prod_patient(payload, db)
    if prod_patient:
        db.query(InterventionPlan).filter(
            InterventionPlan.patient_id == prod_patient.id,
            InterventionPlan.is_active == True,  # noqa: E712
        ).update({"is_active": False})

        for plan in plans:
            ip = InterventionPlan(
                patient_id=prod_patient.id,
                created_by=None,
                plan_name=plan["name"],
                plan_option=plan["key"],
                input_features_json=json.dumps(features),
                therapies_json=json.dumps([
                    {
                        "type": "mixed",
                        "frequency": plan["frequency"],
                        "duration_min": 60,
                    }
                ]),
                predicted_outcomes_json=json.dumps({
                    "milestone_probability": plan["milestone_probability"] / 100.0,
                }),
                milestone_months=None,
                milestone_std=None,
                estimated_cost=plan["cost_estimate"],
                reasoning=plan["desc"],
                is_active=True,
                accepted=(plan["key"] == recommended_key),
            )
            db.add(ip)
        db.commit()

    # Mark recommended in response for UI
    if recommended_key:
        for plan in plans:
            plan["recommended"] = (plan.get("key") == recommended_key)

    return plans
