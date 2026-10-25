import re
import uuid
from typing import List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, Website, EditHistory
from app.schemas.website import WebsiteCreatePayload, WebsiteEditPayload, WebsiteResponse, EditHistoryItem
from app.utils.auth import get_current_user
from app.services.gemini import generate_website_tree, edit_website_tree

router = APIRouter(prefix="/generator", tags=["Gemini AI Generation Engine"])

@router.post("/create", response_model=WebsiteResponse)
def create_website(payload: WebsiteCreatePayload, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
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
                    "Free plan allows 1 website. Please pay ₹1 via UPI to create an additional website."
                )
            )

    clean_subdomain = re.sub(r'[^a-zA-Z0-9]', '', payload.title.lower()) or "mywebsite"
    suffix = uuid.uuid4().hex[:6]
    subdomain_val = f"{clean_subdomain}-{current_user.id}-{suffix}"
    
    # Generate JSON structure using Gemini

    page_tree = generate_website_tree(
        title=payload.title,
        category=payload.category,
        theme=payload.theme,
        website_type=payload.website_type,
        selected_pages=payload.selected_pages,
        logo_url=payload.logo_url,
        contact_email=payload.contact_email or current_user.email,
        contact_phone=payload.contact_phone,
        background_style=payload.background_style,
        theme_mode=payload.theme_mode,
        brand_tone=payload.brand_tone,
        user_prompt=payload.prompt,
        tagline=payload.tagline,
        primary_services=payload.primary_services,
        service_area=payload.service_area,
        target_audience=payload.target_audience,
        key_highlights=payload.key_highlights,
        business_hours=payload.business_hours,
        address=payload.address,
        cta_text=payload.cta_text,
        business_spec_json=payload.business_spec_json,
        custom_pages=payload.custom_pages
    )

    website = Website(
        user_id=current_user.id,
        title=payload.title,
        category=payload.category,
        theme=payload.theme,
        logo_url=payload.logo_url,
        contact_email=payload.contact_email or current_user.email,
        contact_phone=payload.contact_phone,
        prompt=payload.prompt,
        page_tree=page_tree,
        subdomain=subdomain_val,
        is_published=False
    )
    db.add(website)
    db.commit()
    db.refresh(website)

    initial_history = EditHistory(
        website_id=website.id,
        prompt_instruction=payload.prompt or f"Initial generation ({payload.website_type.upper()} PAGE) for {payload.category}",
        page_tree_snapshot=page_tree
    )
    db.add(initial_history)
    db.commit()

    return website


@router.post("/edit/{website_id}", response_model=WebsiteResponse)
def edit_website(website_id: int, payload: WebsiteEditPayload, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    website = db.query(Website).filter(Website.id == website_id, Website.user_id == current_user.id).first()
    if not website:
        raise HTTPException(status_code=404, detail="Website project not found.")

    new_tree = edit_website_tree(website.page_tree, payload.prompt_instruction)

    history_record = EditHistory(
        website_id=website.id,
        prompt_instruction=payload.prompt_instruction,
        page_tree_snapshot=new_tree
    )
    db.add(history_record)

    website.page_tree = new_tree
    db.commit()
    db.refresh(website)

    return website


class WebsiteTreeUpdatePayload(BaseModel):
    page_tree: dict
    instruction: str = "Studio Customization"

@router.put("/tree/{website_id}", response_model=WebsiteResponse)
def update_website_tree_direct(website_id: int, payload: WebsiteTreeUpdatePayload, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    website = db.query(Website).filter(Website.id == website_id, Website.user_id == current_user.id).first()
    if not website:
        raise HTTPException(status_code=404, detail="Website project not found.")

    website.page_tree = payload.page_tree
    history_record = EditHistory(
        website_id=website.id,
        prompt_instruction=payload.instruction or "In-Browser Studio Customization",
        page_tree_snapshot=payload.page_tree
    )
    db.add(history_record)
    db.commit()
    db.refresh(website)
    return website


@router.get("/history/{website_id}", response_model=List[EditHistoryItem])
def get_website_history(website_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    website = db.query(Website).filter(Website.id == website_id, Website.user_id == current_user.id).first()
    if not website:
        raise HTTPException(status_code=404, detail="Website project not found.")

    # Optimized indexed query for edit history timeline
    histories = db.query(
        EditHistory.id,
        EditHistory.website_id,
        EditHistory.prompt_instruction,
        EditHistory.created_at
    ).filter(
        EditHistory.website_id == website_id
    ).order_by(
        EditHistory.created_at.desc()
    ).limit(20).all()

    return histories

from typing import Optional
from app.services.gemini import generate_website_tree, edit_website_tree, generate_ai_image_with_gemini

class GenerateImagePayload(BaseModel):
    prompt: str
    style: Optional[str] = "photorealistic"
    width: Optional[int] = 1200
    height: Optional[int] = 800
    api_key: Optional[str] = None

@router.post("/generate-image")
def generate_ai_image(payload: GenerateImagePayload, current_user: User = Depends(get_current_user)):
    """Generate high-resolution contextual AI images using Google Gemini API."""
    clean_prompt = payload.prompt.strip()
    if not clean_prompt:
        raise HTTPException(status_code=400, detail="Prompt is required.")

    result = generate_ai_image_with_gemini(
        prompt=clean_prompt,
        style=payload.style or "photorealistic",
        width=payload.width or 1200,
        height=payload.height or 800,
        user_api_key=payload.api_key
    )
    return result


