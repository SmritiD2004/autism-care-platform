# NeuroThrive — Prototype DB Setup

## Overview

This guide covers setting up the **prototype Postgres schema** (`proto_*` tables)
alongside the production schema. Both live in the same `neurothrive` database
without conflict because prototype tables are prefixed with `proto_`.

---

## 1. Environment Variables

Create `backend/.env` (for local dev) and optionally a root `.env` (for Docker):

```env
# backend/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/neurothrive
SECRET_KEY=your_openssl_rand_hex_32_value_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
FRONTEND_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

For Docker Compose, set these in the root `.env`:

```env
# .env  (project root — used by docker-compose.yml)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=neurothrive
SECRET_KEY=your_openssl_rand_hex_32_value_here
```

Generate a secure secret key with:
```bash
openssl rand -hex 32
```

---

## 2. Start the Database

### With Docker Compose (recommended)
```bash
# From project root
docker compose up db -d

# Confirm it's healthy
docker compose ps db
```

### Without Docker (local Postgres)
Make sure Postgres 15 is running locally on port 5432 and the `neurothrive`
database exists:
```bash
psql -U postgres -c "CREATE DATABASE neurothrive;"
```

---

## 3. Create the Prototype Schema

Run from the project root:
```bash
# Schema only
python backend/create_minimal_db.py

# Schema + demo seed data
python backend/create_minimal_db.py --seed
```

Expected output:
```
Creating minimal prototype schema (proto_* tables)...
Done — tables created:
  ✓ proto_users
  ✓ proto_patients
  ✓ proto_daily_checkins
  ✓ proto_screening_results
```

---

## 4. Start the Backend

```bash
# Local
cd backend
uvicorn main:app --reload

# Or via Docker Compose (starts db + backend together)
docker compose up --build
```

---

## 5. Verify the Setup

### Option A — Swagger UI
Open http://localhost:8000/docs and look for the **Proto** section.

### Option B — psql
```bash
docker compose exec db psql -U postgres -d neurothrive -c "\dt proto_*"
```

### Option C — curl
```bash
# List prototype patients
curl http://localhost:8000/api/proto/patients

# Create a prototype user
curl -X POST http://localhost:8000/api/proto/users \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Passw0rd!", "full_name": "Test User", "role": "parent"}'
```

---

## 6. Proto Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/proto/users` | List all proto users |
| POST | `/api/proto/users` | Create a proto user (requires `email`, `password`) |
| POST | `/api/proto/login` | Login proto user (requires `email`, `password`) |
| GET | `/api/proto/patients` | List all proto patients |
| POST | `/api/proto/patients` | Create a proto patient |
| GET | `/api/proto/patients/{id}/checkins` | List checkins for patient |
| POST | `/api/proto/patients/{id}/checkins` | Add a checkin |
| GET | `/api/proto/patients/{id}/screenings` | List screenings for patient |
| POST | `/api/proto/patients/{id}/screenings` | Add a screening result |
| POST | `/api/proto/interventions/generate` | Generate intervention plans (A/B/C) |

---

### Example: Generate Proto Intervention Plans

```bash
curl -X POST http://localhost:8000/api/proto/interventions/generate \
  -H "Content-Type: application/json" \
  -d '{"age_years":4,"severity":"moderate","risk_score":0.60,"comm_score":5,"motor_score":6,"notes":"demo","proto_patient_id":1,"patient_name":"Manish Kumar"}'
```

## 7. Table Reference

| Proto Table | Production Equivalent | Purpose |
|---|---|---|
| `proto_users` | `users` | Auth / user accounts |
| `proto_patients` | `patients` | Child records |
| `proto_daily_checkins` | `daily_checkins` | Parent daily check-in |
| `proto_screening_results` | `screening_logs` | ASD screening output |

---

## Notes

- `database.py` and `config.py` are **shared** between production and prototype — no duplication.
- `minimal_models.py` uses its own `Base` — `create_all()` only touches `proto_*` tables.
- Production tables are created by `main.py` on startup via `models.Base.metadata.create_all()`.
- Alembic migrations are deferred — use `create_all()` for now.

## Intervention Plans (Proto)

The endpoint `POST /api/proto/interventions/generate` returns plans and also
saves them into the **production** `intervention_plans` table for now.
It creates a corresponding **production** `patients` row using a hashed
`proto_patient_id` to keep data aligned without storing PII.
