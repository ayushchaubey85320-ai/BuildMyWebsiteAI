from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, Website, EditHistory
from app.schemas.website import WebsiteResponse
from app.utils.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard Metrics & Projects"])

@router.get("/projects", response_model=List[WebsiteResponse])
def get_user_projects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    projects = db.query(Website).filter(Website.user_id == current_user.id).order_by(Website.created_at.desc()).all()
    return projects

@router.get("/projects/{project_id}", response_model=WebsiteResponse)
def get_project_by_id(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = db.query(Website).filter(Website.id == project_id, Website.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project

@router.delete("/projects/all")
def delete_all_projects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_website_ids = [w.id for w in db.query(Website.id).filter(Website.user_id == current_user.id).all()]
    if user_website_ids:
        # Delete edit history child rows first to avoid foreign key integrity constraint error
        db.query(EditHistory).filter(EditHistory.website_id.in_(user_website_ids)).delete(synchronize_session=False)
        deleted_count = db.query(Website).filter(Website.user_id == current_user.id).delete(synchronize_session=False)
        db.commit()
    else:
        deleted_count = 0
    return {"message": f"Successfully deleted all {deleted_count} website projects.", "count": deleted_count}

@router.delete("/projects/{project_id}")
def delete_project(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = db.query(Website).filter(Website.id == project_id, Website.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    
    # Delete child edit history first
    db.query(EditHistory).filter(EditHistory.website_id == project_id).delete(synchronize_session=False)
    db.delete(project)
    db.commit()
    return {"message": "Website project deleted successfully."}

@router.get("/metrics")
def get_dashboard_metrics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    projects = db.query(Website).filter(Website.user_id == current_user.id).all()
    total_projects = len(projects)
    published_count = sum(1 for p in projects if p.is_published)
    unique_categories = len(set(p.category for p in projects if p.category))
    
    return {
        "total": total_projects,
        "published": published_count,
        "categories": unique_categories
    }
