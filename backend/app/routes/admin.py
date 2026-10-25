from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.db.models import User, Website, EditHistory, Payment
from app.utils.auth import get_current_user, create_access_token

router = APIRouter(prefix="/admin", tags=["Super Admin Portal Management"])

class CreditUpdatePayload(BaseModel):
    amount: int  # e.g. +1, +5, +10 or custom
    action: str = "ADD"  # "ADD" or "SET"

class SuspendPayload(BaseModel):
    is_suspended: bool
    reason: Optional[str] = None


def verify_super_admin(current_user: User = Depends(get_current_user)) -> User:
    is_super = bool(
        getattr(current_user, "is_super_admin", False) or 
        current_user.email in ["admin@buildmywebsiteai.ai", "admin@webrisk.ai"]
    )
    if not is_super:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Super Admin privileges required."
        )
    return current_user


@router.get("/stats")
def get_admin_stats(
    admin_user: User = Depends(verify_super_admin),
    db: Session = Depends(get_db)
):
    """Aggregate high-level platform accountability metrics."""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_suspended == False).count()
    suspended_users = db.query(User).filter(User.is_suspended == True).count()
    admin_users = db.query(User).filter(User.is_admin == True).count()
    super_admin_users = db.query(User).filter(User.is_super_admin == True).count()
    total_websites = db.query(Website).count()
    
    total_payments = db.query(Payment).count()
    revenue_sum = db.query(func.sum(Payment.amount)).scalar() or 0
    total_credits_granted = db.query(func.sum(User.paid_credits)).scalar() or 0

    return {
        "total_users": total_users,
        "active_users": active_users,
        "suspended_users": suspended_users,
        "forever_free_admins": admin_users,
        "super_admins": super_admin_users,
        "total_websites": total_websites,
        "total_payments": total_payments,
        "total_revenue_inr": revenue_sum,
        "total_credits_granted": total_credits_granted
    }


@router.get("/users")
def get_all_users(
    admin_user: User = Depends(verify_super_admin),
    db: Session = Depends(get_db)
):
    """Detailed user analysis with website limits, credits, suspension & role state."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    result = []
    
    for u in users:
        project_count = db.query(Website).filter(Website.user_id == u.id).count()
        paid_credits = u.paid_credits or 0
        is_forever_free = bool(u.is_admin or getattr(u, "is_super_admin", False))
        
        # Quota analysis: Admins have unlimited creation, regular users have 1 free + credits
        allowed_websites = "Unlimited" if is_forever_free else (1 + paid_credits)
        remaining_websites = "Unlimited" if is_forever_free else max(0, (1 + paid_credits) - project_count)

        # Payment metrics
        user_payments = db.query(Payment).filter(Payment.user_id == u.id).all()
        payments_count = len(user_payments)
        total_spent = sum(p.amount for p in user_payments)

        result.append({
            "id": u.id,
            "full_name": u.full_name or u.email.split("@")[0],
            "email": u.email,
            "is_verified": u.is_verified,
            "is_admin": bool(u.is_admin),  # Forever Free Unlimited Websites
            "is_super_admin": bool(getattr(u, "is_super_admin", False) or u.email in ["admin@buildmywebsiteai.ai", "admin@webrisk.ai"]),
            "is_suspended": bool(getattr(u, "is_suspended", False)),
            "suspension_reason": getattr(u, "suspension_reason", None),
            "paid_credits": paid_credits,
            "project_count": project_count,
            "allowed_websites": allowed_websites,
            "remaining_websites": remaining_websites,
            "payments_count": payments_count,
            "total_spent_inr": total_spent,
            "created_at": u.created_at
        })
    return result


@router.put("/users/{user_id}/credits")
def update_user_credits(
    user_id: int,
    payload: CreditUpdatePayload,
    admin_user: User = Depends(verify_super_admin),
    db: Session = Depends(get_db)
):
    """Super Admin allocates or adjusts website creation credits for a user."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    old_credits = target_user.paid_credits or 0
    if payload.action.upper() == "SET":
        new_credits = max(0, payload.amount)
    else:
        new_credits = max(0, old_credits + payload.amount)

    target_user.paid_credits = new_credits
    db.commit()
    db.refresh(target_user)

    return {
        "success": True,
        "message": f"Updated credits for {target_user.email} from {old_credits} to {new_credits}.",
        "user_id": target_user.id,
        "paid_credits": target_user.paid_credits
    }


@router.put("/users/{user_id}/toggle-admin")
def toggle_user_admin(
    user_id: int,
    admin_user: User = Depends(verify_super_admin),
    db: Session = Depends(get_db)
):
    """Grant or revoke Forever Free Admin access (unlimited website creation)."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    target_user.is_admin = not bool(target_user.is_admin)
    db.commit()
    db.refresh(target_user)

    state_str = "granted FOREVER FREE ADMIN (Unlimited Websites)" if target_user.is_admin else "revoked Admin status"
    return {
        "success": True,
        "message": f"Successfully {state_str} for {target_user.email}.",
        "user_id": target_user.id,
        "is_admin": target_user.is_admin
    }


@router.put("/users/{user_id}/toggle-super-admin")
def toggle_super_admin_role(
    user_id: int,
    admin_user: User = Depends(verify_super_admin),
    db: Session = Depends(get_db)
):
    """Promote or demote user to Super Admin personality."""
    if user_id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot alter your own Super Admin personality status.")

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    target_user.is_super_admin = not bool(getattr(target_user, "is_super_admin", False))
    # If promoted to super admin, ensure they also have admin rights
    if target_user.is_super_admin:
        target_user.is_admin = True

    db.commit()
    db.refresh(target_user)

    role_str = "PROMOTED to Super Admin" if target_user.is_super_admin else "DEMOTED from Super Admin"
    return {
        "success": True,
        "message": f"Successfully {role_str} for {target_user.email}.",
        "user_id": target_user.id,
        "is_super_admin": target_user.is_super_admin,
        "is_admin": target_user.is_admin
    }


@router.put("/users/{user_id}/toggle-suspend")
def toggle_suspend_service(
    user_id: int,
    payload: SuspendPayload,
    admin_user: User = Depends(verify_super_admin),
    db: Session = Depends(get_db)
):
    """Super Admin stops or resumes the service of a specific user."""
    if user_id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot suspend your own account.")

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    target_user.is_suspended = payload.is_suspended
    target_user.suspension_reason = payload.reason if payload.is_suspended else None
    db.commit()
    db.refresh(target_user)

    action_label = "SERVICE STOPPED (Suspended)" if payload.is_suspended else "SERVICE RESUMED (Active)"
    return {
        "success": True,
        "message": f"User {target_user.email} {action_label}.",
        "user_id": target_user.id,
        "is_suspended": target_user.is_suspended,
        "suspension_reason": target_user.suspension_reason
    }


@router.get("/payments")
def get_all_platform_payments(
    admin_user: User = Depends(verify_super_admin),
    db: Session = Depends(get_db)
):
    """Live audit trail of all UPI payments across the platform."""
    payments = db.query(Payment).order_by(Payment.created_at.desc()).all()
    result = []
    for p in payments:
        u = db.query(User).filter(User.id == p.user_id).first()
        result.append({
            "id": p.id,
            "user_id": p.user_id,
            "user_email": u.email if u else "Unknown User",
            "user_name": u.full_name if u else "Unknown",
            "amount": p.amount,
            "currency": p.currency,
            "upi_id": p.upi_id,
            "utr_reference": p.utr_reference,
            "status": p.status,
            "verified_by": getattr(p, "verified_by", "AUTO"),
            "notes": p.notes,
            "created_at": p.created_at
        })
    return result


@router.post("/payments/{payment_id}/approve")
def approve_payment(
    payment_id: int,
    admin_user: User = Depends(verify_super_admin),
    db: Session = Depends(get_db)
):
    """1-Click manual verification / re-crediting of UPI payment by Super Admin."""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found.")

    target_user = db.query(User).filter(User.id == payment.user_id).first()
    if target_user:
        target_user.paid_credits = (target_user.paid_credits or 0) + 1

    payment.status = "COMPLETED"
    payment.verified_by = f"SUPER_ADMIN ({admin_user.email})"
    db.commit()

    return {
        "success": True,
        "message": f"Payment #{payment.id} verified and approved by Super Admin.",
        "payment_id": payment.id,
        "verified_by": payment.verified_by
    }


@router.post("/payments/{payment_id}/revoke")
def revoke_payment(
    payment_id: int,
    admin_user: User = Depends(verify_super_admin),
    db: Session = Depends(get_db)
):
    """Super Admin revokes a fake or unverified payment, deducting credit and flagging the record."""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found.")

    target_user = db.query(User).filter(User.id == payment.user_id).first()
    if target_user:
        target_user.paid_credits = max(0, (target_user.paid_credits or 0) - 1)

    payment.status = "REVOKED_UNVERIFIED"
    payment.verified_by = f"REVOKED_BY_ADMIN ({admin_user.email})"
    db.commit()

    return {
        "success": True,
        "message": f"Payment #{payment.id} revoked and credit deducted from {target_user.email if target_user else 'user'}.",
        "payment_id": payment.id,
        "status": payment.status
    }


@router.post("/impersonate/{user_id}")
def impersonate_user(
    user_id: int,
    admin_user: User = Depends(verify_super_admin),
    db: Session = Depends(get_db)
):
    """Super Admin logs into any user session seamlessly."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user account not found.")

    token = create_access_token(data={"sub": target_user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": target_user.id,
            "email": target_user.email,
            "full_name": target_user.full_name or target_user.email.split("@")[0],
            "is_verified": target_user.is_verified,
            "is_admin": bool(target_user.is_admin),
            "is_super_admin": bool(getattr(target_user, "is_super_admin", False)),
            "is_suspended": bool(getattr(target_user, "is_suspended", False))
        }
    }


@router.delete("/users/{user_id}")
def delete_user_account(
    user_id: int,
    admin_user: User = Depends(verify_super_admin),
    db: Session = Depends(get_db)
):
    if user_id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account.")

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user account not found.")

    # Delete all edit histories and websites for this user
    user_website_ids = [w.id for w in db.query(Website.id).filter(Website.user_id == user_id).all()]
    if user_website_ids:
        db.query(EditHistory).filter(EditHistory.website_id.in_(user_website_ids)).delete(synchronize_session=False)
        db.query(Website).filter(Website.user_id == user_id).delete(synchronize_session=False)

    # Delete payments
    db.query(Payment).filter(Payment.user_id == user_id).delete(synchronize_session=False)

    db.delete(target_user)
    db.commit()
    return {"message": f"Successfully deleted user {target_user.email} and all associated data."}


class MobileQuickActionPayload(BaseModel):
    action: str  # "APPROVE", "GIVE_CREDITS", "REVOKE", "TOGGLE_ADMIN", "TOGGLE_SUSPEND"
    payment_id: Optional[int] = None
    user_id: Optional[int] = None
    credits: Optional[int] = 1
    reason: Optional[str] = None


@router.get("/mobile/notifications")
def get_mobile_notifications(
    last_id: int = 0,
    admin_user: User = Depends(verify_super_admin),
    db: Session = Depends(get_db)
):
    """Real-time mobile polling endpoint: returns new payments and user details since last_id."""
    query = db.query(Payment)
    if last_id > 0:
        query = query.filter(Payment.id > last_id)
    payments = query.order_by(Payment.id.desc()).limit(30).all()

    result = []
    for p in payments:
        u = db.query(User).filter(User.id == p.user_id).first()
        result.append({
            "id": p.id,
            "user_id": p.user_id,
            "user_email": u.email if u else "Unknown",
            "user_name": u.full_name or (u.email.split("@")[0] if u else "User"),
            "user_credits": u.paid_credits if u else 0,
            "user_is_admin": bool(u.is_admin) if u else False,
            "user_is_suspended": bool(u.is_suspended) if u else False,
            "amount": p.amount,
            "currency": p.currency,
            "upi_id": p.upi_id,
            "utr_reference": p.utr_reference,
            "status": p.status,
            "verified_by": getattr(p, "verified_by", "AUTO"),
            "created_at": p.created_at.isoformat() if p.created_at else ""
        })

    # High level mobile summary
    stats_data = {
        "pending_count": db.query(Payment).filter(Payment.status == "PENDING").count(),
        "today_revenue": db.query(func.sum(Payment.amount)).filter(Payment.status == "COMPLETED").scalar() or 0,
        "total_users": db.query(User).count()
    }

    return {
        "payments": result,
        "stats": stats_data
    }


@router.post("/mobile/quick-action")
def mobile_quick_action(
    payload: MobileQuickActionPayload,
    admin_user: User = Depends(verify_super_admin),
    db: Session = Depends(get_db)
):
    """Executes 1-tap mobile admin actions directly from the companion app."""
    action = payload.action.upper()
    payment = None
    target_user = None

    if payload.payment_id:
        payment = db.query(Payment).filter(Payment.id == payload.payment_id).first()
        if payment and not payload.user_id:
            target_user = db.query(User).filter(User.id == payment.user_id).first()

    if payload.user_id and not target_user:
        target_user = db.query(User).filter(User.id == payload.user_id).first()

    if action == "APPROVE" and payment:
        if target_user:
            target_user.paid_credits = (target_user.paid_credits or 0) + (payload.credits or 1)
        payment.status = "COMPLETED"
        payment.verified_by = f"MOBILE_ADMIN ({admin_user.email})"
        db.commit()
        return {
            "success": True,
            "message": f"Payment #{payment.id} verified & {payload.credits or 1} credit(s) granted to {target_user.email if target_user else 'user'}!",
            "payment_id": payment.id,
            "status": payment.status
        }

    elif action == "GIVE_CREDITS" and target_user:
        add_amount = payload.credits or 1
        target_user.paid_credits = (target_user.paid_credits or 0) + add_amount
        db.commit()
        return {
            "success": True,
            "message": f"Successfully granted +{add_amount} website credit(s) to {target_user.email}! Total: {target_user.paid_credits}",
            "user_id": target_user.id,
            "paid_credits": target_user.paid_credits
        }

    elif action == "REVOKE" and payment:
        if target_user:
            target_user.paid_credits = max(0, (target_user.paid_credits or 0) - 1)
        payment.status = "REVOKED_UNVERIFIED"
        payment.verified_by = f"REVOKED_MOBILE ({admin_user.email})"
        db.commit()
        return {
            "success": True,
            "message": f"Payment #{payment.id} revoked and credit deducted.",
            "payment_id": payment.id,
            "status": payment.status
        }

    elif action == "TOGGLE_SUSPEND" and target_user:
        target_user.is_suspended = not bool(target_user.is_suspended)
        target_user.suspension_reason = payload.reason if target_user.is_suspended else None
        db.commit()
        state = "SUSPENDED" if target_user.is_suspended else "ACTIVE"
        return {
            "success": True,
            "message": f"User {target_user.email} is now {state}.",
            "user_id": target_user.id,
            "is_suspended": target_user.is_suspended
        }

    elif action == "TOGGLE_ADMIN" and target_user:
        target_user.is_admin = not bool(target_user.is_admin)
        db.commit()
        state = "FOREVER FREE ADMIN" if target_user.is_admin else "STANDARD USER"
        return {
            "success": True,
            "message": f"User {target_user.email} set to {state}.",
            "user_id": target_user.id,
            "is_admin": target_user.is_admin
        }

    raise HTTPException(status_code=400, detail="Invalid action or missing required target.")

