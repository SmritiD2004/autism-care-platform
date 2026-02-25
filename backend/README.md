# Backend API

FastAPI backend for the autism project.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

API documentation available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Prototype (Proto) Mode

During prototyping, use the proto endpoints under `/api/proto/*`.

Key endpoints:
- `POST /api/proto/users` (requires `email`, `password`; optional `full_name`, `role`)
- `POST /api/proto/login` (requires `email`, `password`)
- `POST /api/proto/interventions/generate` (generates plans and saves to `intervention_plans`)

The frontend currently uses proto auth and proto endpoints.

## Troubleshooting

If you see a bcrypt/passlib error (`module 'bcrypt' has no attribute '__about__'`),
pin bcrypt in your venv:
```bash
python -m pip install "bcrypt==4.0.1" --force-reinstall
```
