import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_verified = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)  # Admin privileges (Forever Free Unlimited Websites)
    is_super_admin = Column(Boolean, default=False)  # Super Admin Portal Controller
    is_suspended = Column(Boolean, default=False)  # Service stopped / suspended by Super Admin
    suspension_reason = Column(String(255), nullable=True)
    paid_credits = Column(Integer, default=0, nullable=False)  # Extra website creation credits (1 credit = 1 website)
    otp_code = Column(String(10), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    websites = relationship("Website", back_populates="owner")


class Website(Base):
    __tablename__ = "websites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    theme = Column(String(50), default="MODERN_DARK")
    logo_url = Column(Text(length=4294967295), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    prompt = Column(Text, nullable=True)
    page_tree = Column(JSON, nullable=False)
    subdomain = Column(String(100), unique=True, index=True, nullable=False)
    custom_domain = Column(String(255), unique=True, nullable=True, index=True)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="websites")
    histories = relationship("EditHistory", back_populates="website", cascade="all, delete-orphan")
    visits = relationship("WebsiteVisit", back_populates="website", cascade="all, delete-orphan")

class EditHistory(Base):
    __tablename__ = "edit_histories"

    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer, ForeignKey("websites.id"), nullable=False)
    prompt_instruction = Column(Text, nullable=False)
    page_tree_snapshot = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    website = relationship("Website", back_populates="histories")

class WebsiteVisit(Base):
    __tablename__ = "website_visits"

    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer, ForeignKey("websites.id"), nullable=False, index=True)
    page_path = Column(String(255), default="/")
    referrer = Column(String(500), nullable=True)
    browser = Column(String(100), nullable=True)
    device = Column(String(50), nullable=True)
    ip_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    website = relationship("Website", back_populates="visits")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Integer, default=1, nullable=False)  # ₹1 INR
    currency = Column(String(10), default="INR", nullable=False)
    upi_id = Column(String(100), default="7983933436@ptaxis", nullable=False)
    utr_reference = Column(String(100), unique=True, index=True, nullable=False)
    status = Column(String(50), default="COMPLETED", nullable=False)
    verified_by = Column(String(100), default="AUTO", nullable=True)  # "AUTO" or "SUPER_ADMIN"
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", backref="payments")

