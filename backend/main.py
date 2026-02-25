"""
NeuroThrive FastAPI Backend
───────────────────────────
Start:  uvicorn main:app --reload
Docs:   http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import engine
from models import Base
from routers import auth, screening, monitoring, therapy, interventions, parent, proto

# App 
app = FastAPI(
    title="NeuroThrive API",
    description="AI-powered autism care platform — auth + screening + monitoring",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS + ["*"],   # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create all Postgres tables on startup 
Base.metadata.create_all(bind=engine)

# Routers 
app.include_router(auth.router,          prefix="/api/auth",          tags=["Auth"])
app.include_router(screening.router,     prefix="/api/screening",     tags=["Screening"])
app.include_router(monitoring.router,    prefix="/api/monitoring",    tags=["Monitoring"])
app.include_router(therapy.router,       prefix="/api/therapy",       tags=["Therapy"])
app.include_router(interventions.router, prefix="/api/interventions", tags=["Interventions"])
app.include_router(parent.router,        prefix="/api/parent",        tags=["Parent"])
app.include_router(proto.router,         prefix="/api",               tags=["Proto"])

#  Health 
@app.get("/", tags=["Health"])
def root():
    return {"service": "NeuroThrive API", "status": "running", "version": "2.0.0"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
