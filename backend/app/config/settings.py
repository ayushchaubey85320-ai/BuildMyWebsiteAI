import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Proactively search and load .env from workspace or backend directory
env_candidates = [
    os.path.join(os.getcwd(), ".env"),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env")),
]
for p in env_candidates:
    if os.path.exists(p):
        load_dotenv(p)
        break

class Settings(BaseSettings):
    PROJECT_NAME: str = "BuildMyWebsiteAI Engine"
    API_V1_STR: str = "/api"
    
    # Database (Reads from .env, defaults safely to local SQLite)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./buildmywebsiteai_fallback.db"
    )
    
    # Gemini API Key (Loaded strictly from .env / environment variable)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Auth Secrets (Loaded strictly from .env)
    JWT_SECRET: str = os.getenv("JWT_SECRET", "buildmywebsiteai_dev_secret_key_antigravity_safe_change_in_env")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # Google OAuth (Loaded strictly from .env)
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    
    # Email Settings (Loaded strictly from .env)
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
