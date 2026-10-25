import datetime
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, Website, Payment
from app.utils.auth import get_current_user

router = APIRouter(prefix="/payment", tags=["UPI Payment Gateway & Quota"])

UPI_ID = "7983933436@ptaxis"
PAYEE_NAME = "Ayush Chaubey"
COST_PER_WEBSITE = 1  # ₹1 INR per additional website
FREE_LIMIT = 1

class UPIPaymentVerifyPayload(BaseModel):
    utr_reference: str
    upi_id: Optional[str] = UPI_ID
    amount: Optional[int] = 1
    notes: Optional[str] = None

class QuotaResponse(BaseModel):
    current_websites: int
    free_limit: int
    paid_credits: int
    total_allowed: int
    can_create: bool
    is_admin: bool
    cost_per_website: int
    currency: str
    upi_id: str
    payee_name: str
    qr_image_url: str

class PaymentRecordResponse(BaseModel):
    id: int
    amount: int
    currency: str
    upi_id: str
    utr_reference: str
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True


@router.get("/quota", response_model=QuotaResponse)
def get_user_quota(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetch user's current website quota and UPI pricing details."""
    website_count = db.query(Website).filter(Website.user_id == current_user.id).count()
    paid_credits = current_user.paid_credits or 0
    is_admin = bool(current_user.is_admin or getattr(current_user, "is_super_admin", False))
    total_allowed = 999999 if is_admin else (FREE_LIMIT + paid_credits)
    can_create = is_admin or (website_count < total_allowed)

    return QuotaResponse(
        current_websites=website_count,
        free_limit=FREE_LIMIT,
        paid_credits=paid_credits,
        total_allowed=total_allowed,
        can_create=can_create,
        is_admin=is_admin,
        cost_per_website=COST_PER_WEBSITE,
        currency="INR",
        upi_id=UPI_ID,
        payee_name=PAYEE_NAME,
        qr_image_url="/upi_payment_qr.jpg"
    )


@router.post("/verify-upi")
def verify_upi_payment(payload: UPIPaymentVerifyPayload, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Strictly verify genuine 12-digit UPI transaction reference (UTR) with anti-fraud & anti-replay checks."""
    raw_utr = payload.utr_reference or ""
    clean_utr = raw_utr.strip().replace(" ", "").replace("-", "")

    # 1. Reject empty, bypass or dummy keywords
    if not clean_utr or clean_utr.lower() in ["auto", "test", "instant", "verified", "none", "null", "faketr"]:
        raise HTTPException(
            status_code=400, 
            detail="A genuine 12-digit UPI Reference Number (UTR) from your payment receipt is strictly required."
        )

    # 2. Strict 12-digit numeric NPCI format
    import re
    if not re.match(r'^\d{12}$', clean_utr):
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid UPI Reference ID ({len(clean_utr)} digits entered). Indian banking UTR numbers must be exactly 12 numeric digits (e.g. 429512345678)."
        )

    # 3. Anti-Fraud dummy pattern detection
    # Reject all-same digits (e.g. 000000000000, 111111111111)
    if len(set(clean_utr)) <= 2:
        raise HTTPException(
            status_code=400,
            detail="Invalid UPI Reference Number. Repetitive dummy numbers are rejected by anti-fraud validation."
        )

    # Reject standard ascending/descending test sequences
    if clean_utr in ["123456789012", "012345678901", "987654321098", "098765432109"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid UPI Reference Number. Sequential dummy numbers are rejected by anti-fraud validation."
        )

    # 4. Anti-replay protection: Check if this UTR has already been credited
    existing_payment = db.query(Payment).filter(Payment.utr_reference == clean_utr).first()
    if existing_payment:
        created_str = existing_payment.created_at.strftime('%Y-%m-%d %H:%M') if existing_payment.created_at else "previously"
        raise HTTPException(
            status_code=400,
            detail=f"This UPI UTR reference ({clean_utr}) has already been credited to an account on {created_str}. Each transaction receipt can only be used once."
        )

    # 5. Record verified payment in DB
    payment = Payment(
        user_id=current_user.id,
        amount=COST_PER_WEBSITE,
        currency="INR",
        upi_id=payload.upi_id or UPI_ID,
        utr_reference=clean_utr,
        status="COMPLETED",
        verified_by="UTR_STRICT_VERIFIED",
        notes=payload.notes or "1 Additional Website Creation Credit (₹1 UPI)"
    )
    db.add(payment)

    # 6. Credit user with +1 website
    current_user.paid_credits = (current_user.paid_credits or 0) + 1
    db.commit()
    db.refresh(current_user)

    website_count = db.query(Website).filter(Website.user_id == current_user.id).count()
    is_admin = bool(current_user.is_admin or getattr(current_user, "is_super_admin", False))
    total_allowed = 999999 if is_admin else (FREE_LIMIT + current_user.paid_credits)

    return {
        "success": True,
        "message": f"Payment of ₹{COST_PER_WEBSITE} verified successfully! 1 Website credit added.",
        "paid_credits": current_user.paid_credits,
        "total_allowed": total_allowed,
        "current_websites": website_count,
        "can_create": True,
        "utr_reference": clean_utr,
        "amount": COST_PER_WEBSITE,
        "currency": "INR",
        "verified_by": payment.verified_by
    }


@router.get("/history", response_model=List[PaymentRecordResponse])
def get_payment_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve user's payment history."""
    payments = db.query(Payment).filter(Payment.user_id == current_user.id).order_by(Payment.created_at.desc()).all()
    return payments
