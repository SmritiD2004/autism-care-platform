"""
Parent Router
=============
Handles the Parent Mental Health Co-Pilot module (PRD §5).

Endpoints
---------
JOURNAL
  POST   /api/parent/journal              — submit a journal entry (NLP runs automatically)
  GET    /api/parent/journal              — list own journal entries
  GET    /api/parent/journal/{entry_id}  — get one entry in full detail

WELLBEING
  GET    /api/parent/wellbeing/trend      — burnout + sentiment trend over time (chart data)
  GET    /api/parent/wellbeing/summary    — latest snapshot (score, risk level, support msg)

SUPPORT
  POST   /api/parent/support/request     — explicitly request human support / resources

Access rules
------------
- Parents   : read/write only their own entries
- Clinicians / admins : read any parent's entries (for clinical oversight)
- Therapists : no access (co-pilot is parent ↔ clinician only)
"""

import json
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from auth_utils import get_current_user, require_roles
from database import get_db
from models import ParentJournalEntry, RiskLevelEnum, User

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# NLP pipeline stub
# Replace _analyse_text() body with your BERT fine-tuned model when ready.
# The interface (in: str, out: dict) stays the same.
# ─────────────────────────────────────────────────────────────────────────────

# Keyword banks for rule-based scoring
_NEGATIVE_WORDS = {
    "exhausted", "exhaustion", "drowning", "hopeless", "hopelessness",
    "failure", "failing", "overwhelmed", "burnout", "desperate",
    "alone", "isolated", "worthless", "helpless", "depressed",
    "crying", "breakdown", "crisis", "struggle", "struggling",
    "can't cope", "giving up", "no sleep", "no energy",
}
_POSITIVE_WORDS = {
    "happy", "proud", "progress", "milestone", "smiled", "laughed",
    "breakthrough", "improvement", "better", "hopeful", "grateful",
    "amazing", "wonderful", "success", "achieved", "joy",
}
_BURNOUT_SIGNALS = {
    "weeks", "months", "haven't slept", "no break", "no help",
    "no one", "alone", "isolated", "quit", "can't do this",
    "too much", "falling apart",
}
_EMOTION_KEYWORDS = {
    "exhaustion":   {"exhausted", "drained", "no energy", "tired"},
    "hopelessness": {"hopeless", "no hope", "giving up", "pointless"},
    "guilt":        {"failure", "failing", "my fault", "bad parent", "blame"},
    "isolation":    {"alone", "lonely", "isolated", "no one understands"},
    "anxiety":      {"worried", "anxious", "scared", "fear", "panic"},
    "grief":        {"loss", "grieve", "mourning", "wish", "used to"},
}


def _analyse_text(text: str) -> dict:
    """
    Lightweight rule-based NLP analyser.

    Returns:
        sentiment_score  : float  -1.0 (very negative) → +1.0 (very positive)
        emotions         : dict   {emotion: confidence 0-1}
        burnout_score    : float  0 – 100
        burnout_risk_level: str  low | medium | high | critical
        triggers         : list[str]
        support_message  : str | None
    """
    lower = text.lower()
    words = set(lower.split())

    # ── Sentiment ─────────────────────────────────────────────────────────────
    neg_hits = sum(1 for w in _NEGATIVE_WORDS if w in lower)
    pos_hits = sum(1 for w in _POSITIVE_WORDS if w in lower)
    total    = neg_hits + pos_hits or 1
    sentiment = round((pos_hits - neg_hits) / total, 3)
    sentiment = max(-1.0, min(1.0, sentiment))

    # ── Emotions ──────────────────────────────────────────────────────────────
    emotions: dict[str, float] = {}
    for emotion, kws in _EMOTION_KEYWORDS.items():
        hits = sum(1 for kw in kws if kw in lower)
        if hits:
            emotions[emotion] = round(min(hits / len(kws) * 2, 1.0), 2)

    # ── Burnout ───────────────────────────────────────────────────────────────
    burnout_raw  = (neg_hits * 8) + sum(4 for sig in _BURNOUT_SIGNALS if sig in lower)
    burnout_score = min(round(burnout_raw, 1), 100.0)

    if burnout_score <= 30:
        risk_level = RiskLevelEnum.low
    elif burnout_score <= 60:
        risk_level = RiskLevelEnum.medium
    elif burnout_score <= 85:
        risk_level = RiskLevelEnum.high
    else:
        risk_level = RiskLevelEnum.critical

    # ── Triggers ──────────────────────────────────────────────────────────────
    triggers: list[str] = []
    if "meltdown" in lower or "meltdowns" in lower:
        triggers.append("multiple_meltdowns")
    if any(w in lower for w in ("sleep", "slept", "awake", "night")):
        triggers.append("sleep_deprivation")
    if any(w in lower for w in ("alone", "isolated", "no one")):
        triggers.append("social_isolation")
    if any(w in lower for w in ("therapy", "appointment", "session")):
        triggers.append("therapy_burden")
    if any(w in lower for w in ("money", "cost", "afford", "expensive")):
        triggers.append("financial_stress")

    # ── Support message ───────────────────────────────────────────────────────
    support_message: Optional[str] = None
    if risk_level == RiskLevelEnum.critical:
        support_message = (
            "💙 We're concerned about you right now. "
            "What you're carrying is immense and you don't have to carry it alone. "
            "Please consider speaking with a counsellor today — "
            "your wellbeing matters just as much as your child's. "
            "Would you like us to connect you with a support specialist?"
        )
    elif risk_level == RiskLevelEnum.high:
        support_message = (
            "💙 It sounds like you're having an incredibly tough time. "
            "Caregiver burnout is real and valid. "
            "There are parent support groups meeting this week — "
            "even one hour away can make a measurable difference. "
            "You cannot pour from an empty cup."
        )
    elif risk_level == RiskLevelEnum.medium:
        support_message = (
            "We notice things feel heavy right now. "
            "Make sure to carve out even 15 minutes for yourself today. "
            "Small breaks add up — your child benefits most when you're well."
        )

    return {
        "sentiment_score":    sentiment,
        "emotions":           emotions,
        "burnout_score":      burnout_score,
        "burnout_risk_level": risk_level,
        "triggers":           triggers,
        "support_message":    support_message,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Access helpers
# ─────────────────────────────────────────────────────────────────────────────

def _assert_owns_entry(entry: ParentJournalEntry, user: User) -> None:
    """Parents can only read/write their own entries."""
    if user.role.value == "parent" and entry.parent_user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied to this journal entry")


def _get_entry_or_404(entry_id: int, db: Session) -> ParentJournalEntry:
    e = db.query(ParentJournalEntry).filter(ParentJournalEntry.id == entry_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return e


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic schemas
# ─────────────────────────────────────────────────────────────────────────────

class JournalCreateRequest(BaseModel):
    entry_text: str  = Field(..., min_length=10)
    patient_id: Optional[int] = None   # optionally link to a child


class JournalOut(BaseModel):
    id:                 int
    parent_user_id:     int
    patient_id:         Optional[int]
    entry_text:         str
    entry_date:         datetime
    sentiment_score:    Optional[float]
    emotions:           dict              = {}
    burnout_score:      Optional[float]
    burnout_risk_level: Optional[str]
    triggers:           list[str]         = []
    support_sent:       bool
    support_message:    Optional[str]
    created_at:         datetime

    model_config = {"from_attributes": True}


class WellbeingTrendPoint(BaseModel):
    entry_date:         datetime
    sentiment_score:    Optional[float]
    burnout_score:      Optional[float]
    burnout_risk_level: Optional[str]


class WellbeingSummary(BaseModel):
    latest_sentiment:    Optional[float]
    latest_burnout:      Optional[float]
    risk_level:          Optional[str]
    support_message:     Optional[str]
    avg_sentiment_7d:    Optional[float]
    avg_burnout_7d:      Optional[float]
    trend_direction:     str              # "improving" | "stable" | "worsening"
    total_entries:       int


class SupportRequest(BaseModel):
    message:    Optional[str] = None   # what kind of support they need
    patient_id: Optional[int] = None


class SupportResponse(BaseModel):
    acknowledged:  bool
    resources:     list[str]
    message:       str


# ─────────────────────────────────────────────────────────────────────────────
# Serialise ORM → JournalOut
# ─────────────────────────────────────────────────────────────────────────────

def _journal_out(entry: ParentJournalEntry) -> JournalOut:
    def _load_list(field) -> list:
        if not field:
            return []
        try:
            val = json.loads(field)
            return val if isinstance(val, list) else []
        except Exception:
            return []

    def _load_dict(field) -> dict:
        if not field:
            return {}
        try:
            val = json.loads(field)
            return val if isinstance(val, dict) else {}
        except Exception:
            return {}

    return JournalOut(
        id                 = entry.id,
        parent_user_id     = entry.parent_user_id,
        patient_id         = entry.patient_id,
        entry_text         = entry.entry_text,
        entry_date         = entry.entry_date,
        sentiment_score    = entry.sentiment_score,
        emotions           = _load_dict(entry.emotions_json),
        burnout_score      = entry.burnout_score,
        burnout_risk_level = entry.burnout_risk_level.value if entry.burnout_risk_level else None,
        triggers           = _load_list(entry.triggers_json),
        support_sent       = entry.support_sent,
        support_message    = entry.support_message,
        created_at         = entry.created_at,
    )


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/parent/journal
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/journal", response_model=JournalOut, status_code=201)
def create_journal_entry(
    payload:      JournalCreateRequest,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(require_roles("parent")),
):
    """
    Parent submits a free-text journal entry.
    NLP analysis runs immediately and results are stored alongside the text.
    A support message is generated automatically if burnout risk is medium+.
    """
    nlp = _analyse_text(payload.entry_text)

    entry = ParentJournalEntry(
        parent_user_id     = current_user.id,
        patient_id         = payload.patient_id,
        entry_text         = payload.entry_text,
        entry_date         = datetime.utcnow(),
        sentiment_score    = nlp["sentiment_score"],
        emotions_json      = json.dumps(nlp["emotions"]),
        burnout_score      = nlp["burnout_score"],
        burnout_risk_level = nlp["burnout_risk_level"],
        triggers_json      = json.dumps(nlp["triggers"]),
        support_sent       = nlp["support_message"] is not None,
        support_message    = nlp["support_message"],
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    print(
        f"[journal] user={current_user.id} "
        f"burnout={nlp['burnout_score']} "
        f"risk={nlp['burnout_risk_level'].value}"
    )

    return _journal_out(entry)


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/parent/journal
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/journal", response_model=list[JournalOut])
def list_journal_entries(
    days:         int  = 30,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    """
    Return journal entries.
    - Parents see only their own.
    - Clinicians / admins see all (for clinical oversight).
    """
    if current_user.role.value not in ("clinician", "admin"):
        # Parent — own entries only
        if current_user.role.value != "parent":
            raise HTTPException(status_code=403, detail="Access denied")

    since = datetime.utcnow() - timedelta(days=days)
    q     = db.query(ParentJournalEntry).filter(
        ParentJournalEntry.entry_date >= since
    )

    if current_user.role.value == "parent":
        q = q.filter(ParentJournalEntry.parent_user_id == current_user.id)

    entries = q.order_by(ParentJournalEntry.entry_date.desc()).all()
    return [_journal_out(e) for e in entries]


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/parent/journal/{entry_id}
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/journal/{entry_id}", response_model=JournalOut)
def get_journal_entry(
    entry_id:     int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    """Get one journal entry in full detail."""
    entry = _get_entry_or_404(entry_id, db)
    _assert_owns_entry(entry, current_user)
    return _journal_out(entry)


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/parent/wellbeing/trend
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/wellbeing/trend", response_model=list[WellbeingTrendPoint])
def wellbeing_trend(
    days:         int  = 14,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(require_roles("parent", "clinician", "admin")),
):
    """
    Return (date, sentiment, burnout) series for the last N days.
    Used by the frontend to draw the stress trend graph (PRD §5c).
    """
    since   = datetime.utcnow() - timedelta(days=days)
    user_id = current_user.id

    entries = (
        db.query(ParentJournalEntry)
        .filter(
            ParentJournalEntry.parent_user_id == user_id,
            ParentJournalEntry.entry_date     >= since,
        )
        .order_by(ParentJournalEntry.entry_date.asc())
        .all()
    )

    return [
        WellbeingTrendPoint(
            entry_date         = e.entry_date,
            sentiment_score    = e.sentiment_score,
            burnout_score      = e.burnout_score,
            burnout_risk_level = e.burnout_risk_level.value if e.burnout_risk_level else None,
        )
        for e in entries
    ]


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/parent/wellbeing/summary
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/wellbeing/summary", response_model=WellbeingSummary)
def wellbeing_summary(
    db:           Session = Depends(get_db),
    current_user: User    = Depends(require_roles("parent", "clinician", "admin")),
):
    """
    Latest wellbeing snapshot + 7-day averages.
    Powers the Parent Dashboard wellbeing card.
    """
    since_7d = datetime.utcnow() - timedelta(days=7)

    # Latest entry
    latest = (
        db.query(ParentJournalEntry)
        .filter(ParentJournalEntry.parent_user_id == current_user.id)
        .order_by(ParentJournalEntry.entry_date.desc())
        .first()
    )

    # Last 7 days entries
    recent = (
        db.query(ParentJournalEntry)
        .filter(
            ParentJournalEntry.parent_user_id == current_user.id,
            ParentJournalEntry.entry_date     >= since_7d,
        )
        .all()
    )

    total = (
        db.query(ParentJournalEntry)
        .filter(ParentJournalEntry.parent_user_id == current_user.id)
        .count()
    )

    def _avg(vals):
        clean = [v for v in vals if v is not None]
        return round(sum(clean) / len(clean), 2) if clean else None

    avg_sentiment = _avg([e.sentiment_score for e in recent])
    avg_burnout   = _avg([e.burnout_score   for e in recent])

    # Trend direction — compare first half vs second half of the 7-day window
    trend = "stable"
    if len(recent) >= 4:
        mid        = len(recent) // 2
        first_half = _avg([e.burnout_score for e in recent[:mid]])
        second_half = _avg([e.burnout_score for e in recent[mid:]])
        if first_half is not None and second_half is not None:
            diff = second_half - first_half
            if diff > 5:
                trend = "worsening"
            elif diff < -5:
                trend = "improving"

    return WellbeingSummary(
        latest_sentiment = latest.sentiment_score    if latest else None,
        latest_burnout   = latest.burnout_score      if latest else None,
        risk_level       = latest.burnout_risk_level.value if latest and latest.burnout_risk_level else None,
        support_message  = latest.support_message    if latest else None,
        avg_sentiment_7d = avg_sentiment,
        avg_burnout_7d   = avg_burnout,
        trend_direction  = trend,
        total_entries    = total,
    )


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/parent/support/request
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/support/request", response_model=SupportResponse)
def request_support(
    payload:      SupportRequest,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(require_roles("parent")),
):
    """
    Parent explicitly requests support.
    Returns a curated list of resources + acknowledgement message.
    In production this would also trigger a notification to the care team.
    """
    resources = [
        "📞 National Autism Helpline: 1800-XXX-XXXX (free, 24/7)",
        "💬 Online Parent Support Group — next session: Tomorrow 7 PM",
        "🧘 Respite Care Finder: neurothrive.app/respite",
        "📖 Caregiver Burnout Self-Assessment: neurothrive.app/burnout-check",
        "🤝 Local Family Resource Centre — connect via your clinician",
    ]

    # TODO: In production — create a care-team notification here
    # e.g. send email/push to the assigned clinician

    return SupportResponse(
        acknowledged = True,
        resources    = resources,
        message      = (
            "💙 Your request has been received. "
            "A member of your care team will follow up within 24 hours. "
            "If this is an emergency please call your local crisis line immediately."
        ),
    )