from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class PageTree(BaseModel):
    brand_name: str
    tagline: str
    logo_url: Optional[str] = None
    theme: str = "MODERN_DARK"
    navbar: Dict[str, Any]
    hero: Dict[str, Any]
    features: Dict[str, Any]
    testimonials: Dict[str, Any]
    faq: Dict[str, Any]
    cta: Dict[str, Any]
    footer: Dict[str, Any]
