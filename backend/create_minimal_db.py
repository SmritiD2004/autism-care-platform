"""
Create the minimal prototype DB schema and optionally seed sample data.

Usage (run from repo root):
    python backend/create_minimal_db.py          # create proto_* tables only
    python backend/create_minimal_db.py --seed   # create + insert demo rows
"""

import argparse
import os
import sys

# Ensure the backend directory is on sys.path so `from database import ...` works
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal
import minimal_models


def create_schema() -> None:
    print("Creating minimal prototype schema (proto_* tables)...")
    minimal_models.Base.metadata.create_all(bind=engine)
    print("Done — tables created:")
    for table in minimal_models.Base.metadata.sorted_tables:
        print(f"  ✓ {table.name}")


def seed_data() -> None:
    print("\nSeeding sample data...")
    db = SessionLocal()
    try:
        # Demo parent user
        parent = minimal_models.User(
            email="demo-parent@example.com",
            full_name="Demo Parent",
            role="parent",
        )
        db.add(parent)
        db.commit()
        db.refresh(parent)

        # Demo patient linked to parent
        patient = minimal_models.Patient(
            name="Demo Child",
            parent_id=parent.id,
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)

        # Demo screening result
        screening = minimal_models.ScreeningResult(
            patient_id=patient.id,
            score=42,
            interpretation="mild",
        )
        db.add(screening)

        # Demo daily check-in
        checkin = minimal_models.DailyCheckin(
            patient_id=patient.id,
            mood="calm",
            notes="First prototype check-in",
        )
        db.add(checkin)

        db.commit()
        print("Seeding complete:")
        print(f"  ✓ proto_users        → id={parent.id}  ({parent.email})")
        print(f"  ✓ proto_patients     → id={patient.id} ({patient.name})")
        print(f"  ✓ proto_screening_results → score={screening.score}")
        print(f"  ✓ proto_daily_checkins    → mood={checkin.mood}")
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Bootstrap the prototype Postgres schema.")
    parser.add_argument(
        "--seed",
        action="store_true",
        help="Insert demo rows after creating the schema",
    )
    args = parser.parse_args()

    create_schema()
    if args.seed:
        seed_data()


if __name__ == "__main__":
    main()
