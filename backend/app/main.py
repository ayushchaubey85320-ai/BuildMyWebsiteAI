import os
import sys

# Ensure backend root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.db.session import engine, fallback_engine, Base, SessionLocal
from app.db.models import User
from app.utils.auth import get_password_hash
from app.routes import auth_router, dashboard_router, generator_router, export_router, admin_router, chatbot_router

# Auto-create tables & sync DB on startup
try:
    Base.metadata.create_all(bind=engine)
    if fallback_engine != engine:
        Base.metadata.create_all(bind=fallback_engine)
    print("==================================================")
    print("Successfully initialized & synced Database tables.")
    print("==================================================")
    
    # Auto-seed Super Admin user if missing
    db = SessionLocal()
    try:
        import secrets
        admin_email = os.getenv("ADMIN_EMAIL", "admin@buildmywebsiteai.ai")
        admin_pass = os.getenv("ADMIN_DEFAULT_PASSWORD", "") or secrets.token_urlsafe(16)
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            admin_user = User(
                full_name="Super Admin",
                email=admin_email,
                hashed_password=get_password_hash(admin_pass),
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

import time
from collections import defaultdict
from fastapi.responses import JSONResponse
from starlette.requests import Request

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Robust In-Memory Rate Limiting Engine (FEAT-036)
RATE_LIMIT_WINDOWS = defaultdict(list)
RATE_LIMIT_RULES = {
    f"{settings.API_V1_STR}/auth": {"max_requests": 40, "window_seconds": 60},
    f"{settings.API_V1_STR}/generator": {"max_requests": 25, "window_seconds": 60},
    "/api/auth": {"max_requests": 40, "window_seconds": 60},
    "/api/generator": {"max_requests": 25, "window_seconds": 60}
}

@app.middleware("http")
async def security_and_rate_limiting_middleware(request: Request, call_next):
    # 1. Rate Limiting Check
    client_ip = request.client.host if request.client else "unknown"
    path = request.url.path
    now = time.time()

    for prefix, rule in RATE_LIMIT_RULES.items():
        if path.startswith(prefix):
            key = f"{client_ip}:{prefix}"
            timestamps = RATE_LIMIT_WINDOWS[key]
            # Prune expired timestamps
            cutoff = now - rule["window_seconds"]
            RATE_LIMIT_WINDOWS[key] = [t for t in timestamps if t > cutoff]
            if len(RATE_LIMIT_WINDOWS[key]) >= rule["max_requests"]:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests. Please slow down and try again."},
                    headers={"Retry-After": "60"}
                )
            RATE_LIMIT_WINDOWS[key].append(now)
            break

    # 2. Process Request
    response = await call_next(request)

    # 3. Inject Strict Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Enable Secure CORS for frontend (Local, Render, Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_origin_regex=r"^https?://([a-zA-Z0-9-]+\.)*(localhost|127\.0\.0\.1|onrender\.com|vercel\.app)(:\d+)?$",
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
app.include_router(chatbot_router, prefix=settings.API_V1_STR)

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
