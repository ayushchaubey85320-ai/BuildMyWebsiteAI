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

class ForgotPasswordPayload(BaseModel):
    email: str

class ResetPasswordPayload(BaseModel):
    token: Optional[str] = None
    email: Optional[str] = None
    otp_code: Optional[str] = None
    new_password: str

class WebsiteCreatePayload(BaseModel):
    title: str
    category: str
    theme: str = "MODERN_DARK"
    theme_mode: str = "light"  # "dark" or "light"
    website_type: str = "single"  # "single" or "multi"
    background_style: str = "live"  # "live" or "static"
    selected_pages: List[str] = ["Home", "About Us", "Services", "Contact Us"]
    logo_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    prompt: Optional[str] = None

    # Rich business inputs
    tagline: Optional[str] = None
    primary_services: Optional[str] = None
    service_area: Optional[str] = None
    target_audience: Optional[str] = None
    key_highlights: Optional[str] = None
    business_hours: Optional[str] = None
    address: Optional[str] = None
    cta_text: Optional[str] = None
    business_spec_json: Optional[Dict[str, Any]] = None

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
