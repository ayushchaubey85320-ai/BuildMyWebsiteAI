import hashlib
import datetime
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, desc
from pydantic import BaseModel

from app.db.session import get_db
from app.db.models import Website, WebsiteVisit, User
from app.utils.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Website Traffic Analytics"])

class TrackPayload(BaseModel):
    path: Optional[str] = "/"
    referrer: Optional[str] = "direct"
    screen: Optional[str] = None

def detect_device(user_agent: str) -> str:
    ua = (user_agent or "").lower()
    if "mobile" in ua or "android" in ua or "iphone" in ua:
        return "Mobile"
    if "ipad" in ua or "tablet" in ua:
        return "Tablet"
    return "Desktop"

def detect_browser(user_agent: str) -> str:
    ua = (user_agent or "").lower()
    if "edg/" in ua or "edge" in ua:
        return "Edge"
    if "chrome" in ua and "safari" in ua:
        return "Chrome"
    if "safari" in ua and "chrome" not in ua:
        return "Safari"
    if "firefox" in ua:
        return "Firefox"
    if "opera" in ua or "opr/" in ua:
        return "Opera"
    return "Other"

@router.post("/track/{target}")
def track_website_visit(target: str, payload: TrackPayload, request: Request, db: Session = Depends(get_db)):
    """Public lightweight analytics tracker endpoint. Called asynchronously by published websites."""
    # Lookup by numeric ID or subdomain
    website = None
    if target.isdigit():
        website = db.query(Website).filter(Website.id == int(target)).first()
    if not website:
        website = db.query(Website).filter(Website.subdomain == target).first()
    if not website:
        # Also try matching by custom_domain
        website = db.query(Website).filter(Website.custom_domain == target).first()

    if not website:
        return {"ok": False, "detail": "Website target not found."}

    user_agent = request.headers.get("user-agent", "")
    forwarded_for = request.headers.get("x-forwarded-for")
    client_ip = (forwarded_for.split(",")[0].strip() if forwarded_for else request.client.host) if request.client else "unknown"

    # GDPR-compliant IP Hash (Salted SHA-256)
    ip_hash = hashlib.sha256(f"bmw_salt_{client_ip}".encode()).hexdigest()[:24]

    device = detect_device(user_agent)
    browser = detect_browser(user_agent)
    clean_referrer = (payload.referrer or "direct").strip()[:450]
    clean_path = (payload.path or "/").strip()[:200]

    try:
        visit = WebsiteVisit(
            website_id=website.id,
            page_path=clean_path,
            referrer=clean_referrer,
            browser=browser,
            device=device,
            ip_hash=ip_hash,
            created_at=datetime.datetime.utcnow()
        )
        db.add(visit)
        db.commit()
    except Exception as e:
        db.rollback()
        return {"ok": False, "error": str(e)}

    return {"ok": True}

@router.get("/stats/{website_id}")
def get_website_stats(website_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Detailed analytics metrics for the website owner or superadmin."""
    website = db.query(Website).filter(Website.id == website_id).first()
    if not website:
        raise HTTPException(status_code=404, detail="Website project not found.")

    is_admin = getattr(current_user, 'is_admin', False) or current_user.email in ['admin@buildmywebsiteai.ai', 'admin@webrisk.ai']
    if website.user_id != current_user.id and not is_admin:
        raise HTTPException(status_code=403, detail="Access denied: You do not own this website.")

    now = datetime.datetime.utcnow()
    today_start = datetime.datetime(now.year, now.month, now.day)
    seven_days_ago = now - datetime.timedelta(days=7)

    # 1. Total Visits and Unique Visitors
    total_views = db.query(func.count(WebsiteVisit.id)).filter(WebsiteVisit.website_id == website_id).scalar() or 0
    unique_visitors = db.query(func.count(distinct(WebsiteVisit.ip_hash))).filter(WebsiteVisit.website_id == website_id).scalar() or 0

    # 2. Today's Views
    today_views = db.query(func.count(WebsiteVisit.id)).filter(
        WebsiteVisit.website_id == website_id,
        WebsiteVisit.created_at >= today_start
    ).scalar() or 0

    # 3. Last 7 Days Daily Breakdown
    daily_stats = []
    for i in range(6, -1, -1):
        day = now - datetime.timedelta(days=i)
        start_day = datetime.datetime(day.year, day.month, day.day)
        end_day = start_day + datetime.timedelta(days=1)
        day_views = db.query(func.count(WebsiteVisit.id)).filter(
            WebsiteVisit.website_id == website_id,
            WebsiteVisit.created_at >= start_day,
            WebsiteVisit.created_at < end_day
        ).scalar() or 0
        day_uniques = db.query(func.count(distinct(WebsiteVisit.ip_hash))).filter(
            WebsiteVisit.website_id == website_id,
            WebsiteVisit.created_at >= start_day,
            WebsiteVisit.created_at < end_day
        ).scalar() or 0
        daily_stats.append({
            "date": start_day.strftime("%b %d"),
            "views": day_views,
            "uniques": day_uniques
        })

    # 4. Top Pages
    top_pages_rows = db.query(
        WebsiteVisit.page_path,
        func.count(WebsiteVisit.id).label("count")
    ).filter(WebsiteVisit.website_id == website_id).group_by(WebsiteVisit.page_path).order_by(desc("count")).limit(5).all()

    top_pages = [{"path": r[0] or "/", "views": r[1]} for r in top_pages_rows]

    # 5. Device Breakdown
    device_rows = db.query(
        WebsiteVisit.device,
        func.count(WebsiteVisit.id).label("count")
    ).filter(WebsiteVisit.website_id == website_id).group_by(WebsiteVisit.device).all()
    device_breakdown = {r[0] or "Desktop": r[1] for r in device_rows}

    # 6. Top Referrers
    referrer_rows = db.query(
        WebsiteVisit.referrer,
        func.count(WebsiteVisit.id).label("count")
    ).filter(WebsiteVisit.website_id == website_id).group_by(WebsiteVisit.referrer).order_by(desc("count")).limit(5).all()

    top_referrers = [{"referrer": (r[0] or "Direct"), "views": r[1]} for r in referrer_rows]

    return {
        "website_id": website.id,
        "title": website.title,
        "subdomain": website.subdomain,
        "custom_domain": website.custom_domain,
        "is_published": website.is_published,
        "total_views": total_views,
        "unique_visitors": unique_visitors,
        "today_views": today_views,
        "daily_stats": daily_stats,
        "top_pages": top_pages,
        "top_referrers": top_referrers,
        "device_breakdown": device_breakdown
    }

@router.delete("/reset/{website_id}")
def reset_website_analytics(website_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Reset analytics logs for this website."""
    website = db.query(Website).filter(Website.id == website_id, Website.user_id == current_user.id).first()
    if not website:
        raise HTTPException(status_code=404, detail="Website not found.")
    db.query(WebsiteVisit).filter(WebsiteVisit.website_id == website_id).delete(synchronize_session=False)
    db.commit()
    return {"message": "Analytics counters reset successfully."}
