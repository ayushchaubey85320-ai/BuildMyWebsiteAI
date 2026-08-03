from pydantic import BaseModel
from typing import Optional, Any, Dict, List
import datetime

class RegisterPayload(BaseModel):
    full_name: str
    email: str
    password: str

class VerifyOTPPayload(BaseModel):
    email: str
    otp: str

class LoginPayload(BaseModel):
    email: str
    password: str

class GoogleAuthPayload(BaseModel):
    credential: Optional[str] = None
    token: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class WebsiteCreatePayload(BaseModel):
    title: str
    category: str
    theme: str = "MODERN_DARK"
    theme_mode: str = "dark"  # "dark" or "light"
    website_type: str = "single"  # "single" or "multi"
    background_style: str = "live"  # "live" or "static"
    selected_pages: List[str] = ["Home", "About Us", "Services", "Contact Us"]
    logo_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    prompt: Optional[str] = None

class WebsiteEditPayload(BaseModel):
    prompt_instruction: str

class EditHistoryItem(BaseModel):
    id: int
    prompt_instruction: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class WebsiteResponse(BaseModel):
    id: int
    user_id: int
    title: str
    category: str
    theme: str
    logo_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    prompt: Optional[str] = None
    page_tree: Dict[str, Any]
    subdomain: Optional[str] = None
    is_published: bool = False
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True
