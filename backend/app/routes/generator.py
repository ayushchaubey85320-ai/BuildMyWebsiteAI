import re
import uuid
from typing import List
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
        user_prompt=payload.prompt
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
