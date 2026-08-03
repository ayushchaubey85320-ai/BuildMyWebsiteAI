import os
import ssl
import time

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config.settings import settings

db_url = settings.DATABASE_URL
clean_db_url = db_url.replace("?ssl-mode=REQUIRED", "").replace("&ssl-mode=REQUIRED", "")
clean_db_url = clean_db_url.replace("?ssl_mode=REQUIRED", "").replace("&ssl_mode=REQUIRED", "")

Base = declarative_base()

def create_db_engine():
    connect_args = {}
    if "aivencloud.com" in db_url or "ssl-mode=REQUIRED" in db_url or "ssl_mode=REQUIRED" in db_url:
        connect_args["ssl"] = {"check_hostname": False}

    # Attempt primary database connection (Aiven MySQL)
    try:
        print(f"Connecting to Primary Database ({clean_db_url.split('@')[-1] if '@' in clean_db_url else 'MySQL'})...")
        primary_engine = create_engine(
            clean_db_url,
            connect_args=connect_args,
            pool_pre_ping=True,
            pool_recycle=280,
            pool_timeout=5,
            pool_size=10,
            max_overflow=20
        )
        # Test connection immediately
        with primary_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[SUCCESS] Primary Database (Aiven MySQL) connected successfully!")
        return primary_engine
    except Exception as e:
        print(f"\n[NOTICE] Primary Database unreachable ({e}).")
        print("[FALLBACK] Switching to Resilient Local Database (SQLite)...")
        fallback_db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "buildmywebsiteai_fallback.db"))
        fallback_url = f"sqlite:///{fallback_db_path}"
        
        fallback_engine = create_engine(
            fallback_url,
            connect_args={"check_same_thread": False},
            pool_pre_ping=True
        )
        return fallback_engine

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()
