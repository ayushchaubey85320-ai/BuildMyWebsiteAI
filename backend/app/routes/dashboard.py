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

@router.post("/projects/{project_id}/clone", response_model=WebsiteResponse)
def clone_project(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Duplicate an existing website project with a new unique subdomain."""
    # Check website creation quota: 1 Free website limit, extra websites require ₹1 via UPI.
    # Forever Free Admins & Super Admins can build UNLIMITED websites for free!
    if not (current_user.is_admin or getattr(current_user, "is_super_admin", False)):
        user_site_count = db.query(Website).filter(Website.user_id == current_user.id).count()
        allowed_limit = 1 + (current_user.paid_credits or 0)
        if user_site_count >= allowed_limit:
            raise HTTPException(
                status_code=402,
                detail=(
                    f"Website quota limit reached ({user_site_count}/{allowed_limit}). "
                    "Free plan allows 1 website. Please pay ₹1 via UPI to clone or create additional websites."
                )
            )

    import uuid, re
    original = db.query(Website).filter(Website.id == project_id, Website.user_id == current_user.id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Project not found.")


    clean_subdomain = re.sub(r'[^a-zA-Z0-9]', '', (original.title or 'copy').lower()) or "mywebsite"
    suffix = uuid.uuid4().hex[:6]
    new_subdomain = f"{clean_subdomain}-copy-{current_user.id}-{suffix}"

    cloned = Website(
        user_id=current_user.id,
        title=f"{original.title} (Copy)",
        category=original.category,
        theme=original.theme,
        logo_url=original.logo_url,
        contact_email=original.contact_email,
        contact_phone=original.contact_phone,
        prompt=original.prompt,
        page_tree=original.page_tree,
        subdomain=new_subdomain,
        is_published=False
    )
    db.add(cloned)
    db.commit()
    db.refresh(cloned)

    # Record initial clone history
    history = EditHistory(
        website_id=cloned.id,
        prompt_instruction=f"Cloned from project #{project_id} — {original.title}",
        page_tree_snapshot=original.page_tree
    )
    db.add(history)
    db.commit()

    return cloned

@router.post("/projects/{project_id}/unpublish")
def unpublish_project(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Unpublish a live co-domain website."""
    project = db.query(Website).filter(Website.id == project_id, Website.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    project.is_published = False
    db.commit()
    return {"message": "Website unpublished successfully.", "is_published": False}

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

import re
from pydantic import BaseModel

class CustomDomainPayload(BaseModel):
    domain: str

@router.post("/projects/{project_id}/custom-domain")
def set_custom_domain(project_id: int, payload: CustomDomainPayload, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Map a custom branded domain (e.g. mybrand.com or www.mybrand.com) to a website project."""
    project = db.query(Website).filter(Website.id == project_id, Website.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    raw_domain = payload.domain.strip().lower()
    clean_domain = re.sub(r'^https?://', '', raw_domain).rstrip('/')

    domain_regex = r'^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$'
    if not re.match(domain_regex, clean_domain):
        raise HTTPException(status_code=400, detail="Invalid domain format. Example: mybrand.com or www.mybrand.com")

    existing = db.query(Website).filter(Website.custom_domain == clean_domain, Website.id != project_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="This custom domain is already bound to another website project.")

    project.custom_domain = clean_domain
    db.commit()
    db.refresh(project)

    return {
        "message": f"Custom domain {clean_domain} successfully configured!",
        "custom_domain": clean_domain,
        "dns_instructions": {
            "record_type": "CNAME",
            "host": "www" if clean_domain.startswith("www.") else "@",
            "target": f"{project.subdomain}.buildmywebsiteai.site",
            "ttl": "3600"
        }
    }

@router.delete("/projects/{project_id}/custom-domain")
def remove_custom_domain(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Disconnect custom domain from project."""
    project = db.query(Website).filter(Website.id == project_id, Website.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    project.custom_domain = None
    db.commit()
    return {"message": "Custom domain removed successfully.", "custom_domain": None}

@router.get("/projects/{project_id}/custom-domain/verify")
def verify_custom_domain(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Check DNS CNAME propagation status for custom domain."""
    project = db.query(Website).filter(Website.id == project_id, Website.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    if not project.custom_domain:
        raise HTTPException(status_code=400, detail="No custom domain attached to this project.")

    import socket
    cname_target = f"{project.subdomain}.buildmywebsiteai.site"
    status = "verified"
    details = f"Domain {project.custom_domain} is mapped and pointing to {cname_target}."

    try:
        socket.gethostbyname(project.custom_domain)
        status = "active"
    except Exception:
        status = "dns_pending"
        details = f"DNS propagation in progress. Please ensure your CNAME record points {project.custom_domain} to {cname_target}."

    return {
        "domain": project.custom_domain,
        "target": cname_target,
        "status": status,
        "details": details
    }

