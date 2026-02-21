from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from config import settings

# postgres:// → postgresql:// (Heroku legacy URL fix)
_url = settings.DATABASE_URL
if _url.startswith("postgres://"):
    _url = _url.replace("postgres://", "postgresql://", 1)

engine = create_engine(_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
