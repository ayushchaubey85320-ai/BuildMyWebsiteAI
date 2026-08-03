from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, Website
from app.utils.auth import get_current_user
from app.services.exporter import generate_export_zip

router = APIRouter(prefix="/export", tags=["Export & Deployment Engine"])

@router.get("/zip/{website_id}")
def download_website_zip(website_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    website = db.query(Website).filter(Website.id == website_id, Website.user_id == current_user.id).first()
    if not website:
        raise HTTPException(status_code=404, detail="Website project not found.")

    website_dict = {
        "id": website.id,
        "title": website.title,
        "category": website.category,
        "logo_url": website.logo_url,
        "page_tree": website.page_tree
    }
    
    zip_buffer = generate_export_zip(website_dict)
    filename = f"{website.subdomain or 'buildmywebsiteai-project'}.zip"

    return Response(
        content=zip_buffer.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.post("/deploy/{website_id}")
def deploy_website(website_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    website = db.query(Website).filter(Website.id == website_id, Website.user_id == current_user.id).first()
    if not website:
        raise HTTPException(status_code=404, detail="Website project not found.")

    website.is_published = True
    db.commit()

    live_url = f"https://{website.subdomain}.buildmywebsiteai.site"
    return {
        "message": "Website successfully published to BuildMyWebsiteAI co-domain network!",
        "is_published": True,
        "subdomain": website.subdomain,
        "live_url": live_url
    }
