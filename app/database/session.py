from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config.config import settings

# In the hackathon we can use the Supabase URL or a local SQLite for testing until configured.
# Here we default to postgresql URL from Supabase if provided.
SQLALCHEMY_DATABASE_URL = settings.SUPABASE_URL if settings.SUPABASE_URL and settings.SUPABASE_URL.startswith("postgresql") else "sqlite:///./app.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
