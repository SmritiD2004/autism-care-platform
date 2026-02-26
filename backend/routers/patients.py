"""
Patients router
  GET /api/patients — list all patients (clinicians/admins only)
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Patient, User
from auth_utils import require_roles
from schemas import PatientOut

router = APIRouter()

@router.get("", response_model=List[PatientOut])
def list_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "clinician", "therapist")),
):
    """
    Return all patients.
    Joins with User to get parent's name if available.
    """
    patients = db.query(Patient).all()

    results = []
    for p in patients:
        parent_name = None
        if p.parent:
            parent_name = p.parent.full_name

        results.append(PatientOut(
            id=p.id,
            child_id_hashed=p.child_id_hashed,
            parent_user_id=p.parent_user_id,
            parent_name=parent_name,
            metadata_json=p.metadata_json,
            created_at=p.created_at
        ))

    return results
