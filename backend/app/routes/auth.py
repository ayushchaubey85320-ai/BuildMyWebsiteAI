import datetime
import random
from typing import Optional
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests

from app.config.settings import settings
from app.db.session import get_db
from app.db.models import User
from app.schemas.website import (
    RegisterPayload, VerifyOTPPayload, LoginPayload, GoogleAuthPayload, TokenResponse,
    ForgotPasswordPayload, ResetPasswordPayload
)
from app.utils.auth import (
    get_password_hash, verify_password, create_access_token, get_current_user
)
from app.services.email import send_password_reset_email

router = APIRouter(prefix="/auth", tags=["Authentication & User Security"])

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name or current_user.email.split("@")[0],
        "is_verified": current_user.is_verified,
        "is_admin": current_user.is_admin,
        "created_at": current_user.created_at
    }

@router.put("/profile/password")
def update_password(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_password = payload.get("current_password")
    new_password = payload.get("new_password")

    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Current and new password are required.")

    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")

    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters long.")

    current_user.hashed_password = get_password_hash(new_password)
    db.commit()
    return {"message": "Password updated successfully."}

# 1. REGISTER / SIGN UP (Supports both /register and /signup)
@router.post("/register", response_model=TokenResponse)
@router.post("/signup", response_model=TokenResponse)
def register_user(payload: RegisterPayload, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    hashed_pw = get_password_hash(payload.password)
    otp = generate_otp()
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)

    user = User(
        full_name=payload.full_name.strip() if payload.full_name else clean_email.split("@")[0],
        email=clean_email,
        hashed_password=hashed_pw,
        is_verified=True,
        otp_code=otp,
        otp_expires_at=expires_at
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.email, "name": user.full_name})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_verified": user.is_verified,
            "is_admin": user.is_admin
        }
    )

@router.post("/verify-otp")
def verify_otp(payload: VerifyOTPPayload, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    if user.otp_code != payload.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code.")

    user.is_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()

    token = create_access_token(data={"sub": user.email, "name": user.full_name})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_verified": True,
            "is_admin": user.is_admin
        }
    )

# 2. LOGIN / SIGN IN
@router.post("/login", response_model=TokenResponse)
def login_user(payload: LoginPayload, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    
    # Support both admin@buildmywebsiteai.ai and admin@webrisk.ai as admin aliases
    if clean_email in ["admin@webrisk.ai", "admin@buildmywebsiteai.ai"]:
        user = db.query(User).filter(User.is_admin == True).first()
    else:
        user = db.query(User).filter(User.email == clean_email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    token = create_access_token(data={"sub": user.email, "name": user.full_name})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_verified": user.is_verified,
            "is_admin": user.is_admin
        }
    )

# 3. FORGOT PASSWORD (Generate link & OTP)
@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordPayload, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="No account associated with this email address was found. Please check your spelling or sign up."
        )

    otp = generate_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    db.commit()

    reset_token = create_access_token(
        data={"sub": user.email, "scope": "password_reset"},
        expires_delta=datetime.timedelta(minutes=15)
    )

    frontend_base = os.getenv("FRONTEND_URL", "https://buildmywebsiteai-frontend.onrender.com")
    reset_link = f"{frontend_base}/reset-password?token={reset_token}"
    print(f"\n[EMAIL DISPATCH] Dispatching to {user.email}:\nReset Link: {reset_link}\nOTP Code: {otp}\n")

    # Send real email via configured SMTP
    email_sent = send_password_reset_email(to_email=user.email, otp_code=otp, reset_link=reset_link)

    response_payload = {
        "message": "A 6-digit security OTP and password reset instructions have been dispatched to your email inbox."
    }
    if not email_sent:
        response_payload["message"] = f"OTP Code generated: {otp}. Enter it below along with your new password to proceed."
        response_payload["otp_code"] = otp

    return response_payload

# 4. RESET PASSWORD (Verify token or OTP and update password)
@router.post("/reset-password")
def reset_password(payload: ResetPasswordPayload, db: Session = Depends(get_db)):
    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters."
        )

    user = None

    # Option A: Reset via JWT token
    if payload.token:
        try:
            token_payload = jwt.decode(
                payload.token,
                settings.JWT_SECRET,
                algorithms=[settings.JWT_ALGORITHM]
            )
            if token_payload.get("scope") != "password_reset":
                raise HTTPException(status_code=400, detail="Invalid token scope")
            email = token_payload.get("sub")
            if not email:
                raise HTTPException(status_code=400, detail="Invalid token payload")
            user = db.query(User).filter(User.email == str(email).lower()).first()
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=400, detail="Reset token has expired.")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=400, detail="Invalid or corrupted reset token.")

    # Option B: Reset via Email + 6-digit OTP
    elif payload.email and payload.otp_code:
        clean_email = payload.email.strip().lower()
        user = db.query(User).filter(User.email == clean_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
        
        if user.otp_code != payload.otp_code.strip():
            raise HTTPException(status_code=400, detail="Invalid OTP code.")
        
        if user.otp_expires_at and user.otp_expires_at < datetime.datetime.utcnow():
            raise HTTPException(status_code=400, detail="OTP code has expired.")

    else:
        raise HTTPException(
            status_code=400,
            detail="Either reset token or email with OTP code is required."
        )

    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    user.hashed_password = get_password_hash(payload.new_password)
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()

    return {"message": "Password has been successfully updated. You can now log in."}

# 5. GOOGLE OAUTH
@router.post("/google", response_model=TokenResponse)
def google_auth(payload: GoogleAuthPayload, db: Session = Depends(get_db)):
    id_token_str = payload.credential or payload.token
    if not id_token_str:
        raise HTTPException(status_code=400, detail="Missing Google credential payload.")

    try:
        id_info = id_token.verify_oauth2_token(
            id_token_str,
            requests.Request(),
            "702327971210-5eo4gladvjb1j9iqt6i6u6d39phe6pht.apps.googleusercontent.com"
        )
        email = id_info.get("email").strip().lower()
        full_name = id_info.get("name") or email.split("@")[0]

        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                full_name=full_name,
                email=email,
                hashed_password=get_password_hash("google_authenticated_user_pass"),
                is_verified=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        token = create_access_token(data={"sub": user.email, "name": user.full_name})
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user={
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "is_verified": user.is_verified,
                "is_admin": user.is_admin
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Google authentication failed: {str(e)}")
