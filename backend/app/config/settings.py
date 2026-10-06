import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Automatically locate .env from backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BACKEND_DIR / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "BuildMyWebsiteAI Engine"
    API_V1_STR: str = "/api"
    
    # Database (Defaults to local fallback SQLite if not specified)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./buildmywebsiteai_fallback.db"
    )
    
    # Gemini API Key (Loaded securely from environment variable)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Auth Secrets (Loaded from environment variable)
    JWT_SECRET: str = os.getenv("JWT_SECRET", "buildmywebsiteai_default_dev_secret_change_in_env")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = os.getenv(
        "GOOGLE_CLIENT_ID", 
        "702327971210-mpvaknnf4ipdlvvkgg7uf1fp0c8dq63u.apps.googleusercontent.com"
    )
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    
    # Email Settings
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")

    class Config:
        env_file = str(ENV_FILE) if ENV_FILE.exists() else ".env"
        extra = "allow"

settings = Settings()
