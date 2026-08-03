import os
import sys

# Ensure backend root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.db.session import engine, Base, SessionLocal
from app.db.models import User
from app.utils.auth import get_password_hash
from app.routes import auth_router, dashboard_router, generator_router, export_router, admin_router

# Auto-create tables & sync DB on startup
try:
    Base.metadata.create_all(bind=engine)
    print("==================================================")
    print("Successfully initialized & synced Database tables.")
    print("==================================================")
    
    # Auto-seed Super Admin user if missing
    db = SessionLocal()
    try:
        admin_email = "admin@buildmywebsiteai.ai"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            admin_user = User(
                full_name="Super Admin",
                email=admin_email,
                hashed_password=get_password_hash("adminpassword123"),
                is_verified=True,
                is_admin=True
            )
            db.add(admin_user)
            db.commit()
            print("[SUCCESS] Auto-seeded Super Admin User (admin@buildmywebsiteai.ai)!")
        else:
            if not admin_user.is_admin:
                admin_user.is_admin = True
                db.commit()
    except Exception as seed_err:
        print(f"[NOTICE] Admin auto-seed error: {seed_err}")
    finally:
        db.close()
except Exception as e:
    print(f"[NOTICE] Database initialization: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Route Controllers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(generator_router, prefix=settings.API_V1_STR)
app.include_router(export_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "BuildMyWebsiteAI Engine",
        "version": "2.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
