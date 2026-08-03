import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "BuildMyWebsiteAI Engine"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "mysql+pymysql://avnadmin:AVNS_26Qh9hSxitMP1Yp6Dwt@mysql-278572f1-nervestackers-0979.h.aivencloud.com:15060/defaultdb"
    )
    
    # AI Engine Key
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Auth Secrets
    JWT_SECRET: str = os.getenv("JWT_SECRET", "buildmywebsiteai_super_secret_jwt_key_2026_antigravity_987654321_secure")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "702327971210-5eo4gladvjb1j9iqt6i6u6d39phe6pht.apps.googleusercontent.com")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "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")
    
    # Email Settings
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
