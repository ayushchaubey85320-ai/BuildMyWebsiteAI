from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, Website, EditHistory
from app.utils.auth import get_current_user, create_access_token

router = APIRouter(prefix="/admin", tags=["Super Admin Portal Management"])

def verify_super_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin and current_user.email != "admin@buildmywebsiteai.ai":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Super Admin privileges required."
        )
    return current_user

@router.get("/users")
def get_all_users(
    admin_user: User = Depends(verify_super_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        project_count = db.query(Website).filter(Website.user_id == u.id).count()
        result.append({
            "id": u.id,
            "full_name": u.full_name or u.email.split("@")[0],
            "email": u.email,
            "is_verified": u.is_verified,
            "is_admin": u.is_admin,
            "created_at": u.created_at,
            "project_count": project_count
        })
    return result

@router.post("/impersonate/{user_id}")
def impersonate_user(
    user_id: int,
    admin_user: User = Depends(verify_super_admin),
    db: Session = Depends(get_db)
):
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
            "is_admin": target_user.is_admin
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

    db.delete(target_user)
    db.commit()
    return {"message": f"Successfully deleted user {target_user.email} and all associated projects."}
