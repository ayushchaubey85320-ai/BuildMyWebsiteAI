import os
import ssl
import socket
import time
from urllib.parse import urlparse

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config.settings import settings

db_url = settings.DATABASE_URL
clean_db_url = db_url.replace("?ssl-mode=REQUIRED", "").replace("&ssl-mode=REQUIRED", "")
clean_db_url = clean_db_url.replace("?ssl_mode=REQUIRED", "").replace("&ssl_mode=REQUIRED", "")

Base = declarative_base()

def is_host_reachable(host: str, port: int = 3306, timeout: float = 2.0) -> bool:
    """Fast pre-check to verify if remote host port is reachable without hanging."""
    try:
        s = socket.create_connection((host, port), timeout=timeout)
        s.close()
        return True
    except Exception:
        return False

def get_fallback_sqlite_engine():
    fallback_db_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "buildmywebsiteai_fallback.db")
    )
    fallback_url = f"sqlite:///{fallback_db_path}"
    print(f"[FALLBACK DB] Using Resilient Local SQLite Database: {fallback_db_path}")
    return create_engine(
        fallback_url,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )

def create_db_engine():
    # If SQLite already specified, return it directly
    if clean_db_url.startswith("sqlite"):
        return create_engine(clean_db_url, connect_args={"check_same_thread": False}, pool_pre_ping=True)

    connect_args = {
        "connect_timeout": 3  # Fast 3s timeout to never hang on remote network issues
    }

    if "aivencloud.com" in db_url or "ssl-mode=REQUIRED" in db_url or "ssl_mode=REQUIRED" in db_url:
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE
        connect_args["ssl"] = ssl_ctx

    # Extract host & port for fast pre-flight check
    try:
        parsed = urlparse(clean_db_url.replace("mysql+pymysql://", "http://"))
        host = parsed.hostname
        port = parsed.port or 3306
        if host and not is_host_reachable(host, port, timeout=2.0):
            print(f"\n[NOTICE] Remote database host ({host}:{port}) is currently unreachable.")
            return get_fallback_sqlite_engine()
    except Exception as parse_err:
        pass

    # Attempt primary database connection (MySQL)
    try:
        host_label = clean_db_url.split('@')[-1] if '@' in clean_db_url else 'MySQL'
        print(f"Connecting to Primary Database ({host_label})...")
        primary_engine = create_engine(
            clean_db_url,
            connect_args=connect_args,
            pool_pre_ping=True,
            pool_recycle=280,
            pool_timeout=5,
            pool_size=5,
            max_overflow=10
        )
        # Test connection immediately
        with primary_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[SUCCESS] Primary Database (MySQL) connected successfully!")
        return primary_engine
    except Exception as e:
        print(f"\n[NOTICE] Primary Database connection failed: {e}")
        return get_fallback_sqlite_engine()

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Keep fallback SessionLocal available for dynamic runtime failover
fallback_engine = get_fallback_sqlite_engine()
FallbackSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=fallback_engine)

def get_db():
    try:
        db = SessionLocal()
        yield db
    except Exception as e:
        # Runtime failover to local SQLite if primary engine dies mid-execution
        print(f"[DB FAILOVER] Primary session failed ({e}), switching to fallback SQLite session...")
        fallback_db = FallbackSessionLocal()
        try:
            yield fallback_db
        finally:
            fallback_db.close()
    finally:
        try:
            db.close()
        except Exception:
            pass
