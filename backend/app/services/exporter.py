import io
import zipfile
import json
import re
import html
import urllib.parse
from typing import Dict, Any

def safe_dict(val: Any) -> Dict[str, Any]:
    """Safely converts any input (JSON string, None, primitive) into a valid dictionary."""
    if isinstance(val, dict):
        return val
    if isinstance(val, str):
        try:
            parsed = json.loads(val)
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            pass
    return {}

def get_page_slug(p_name: str) -> str:
    """Returns a clean, valid .html filename slug for any page name."""
    if p_name == "Home":
        return "index.html"
    clean = re.sub(r'[^a-zA-Z0-9]+', '_', p_name.strip().lower()).strip('_')
    return f"{clean or 'page'}.html"

def clean_phone_for_wa(phone_str: str) -> str:
    """Extracts clean digits for WhatsApp wa.me links, defaulting to India +91 if 10-digit."""
    digits = re.sub(r'\D', '', str(phone_str or ''))
    if len(digits) == 10:
        return f"91{digits}"
    return digits


def get_font_pairing(category: str) -> Dict[str, str]:
    """Returns curated Google Font pairings tailored to the business vertical."""
    c_lower = (category or "").lower()
    if any(k in c_lower for k in ["salon", "spa", "beauty", "jewelry", "bridal", "fashion"]):
        return {
            "heading": "'Playfair Display', Georgia, serif",
            "body": "'Inter', -apple-system, sans-serif",
            "link": "family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,400&family=Inter:wght@400;500;600;700",
            "badge": "Luxury Serif"
        }
    elif any(k in c_lower for k in ["restaurant", "café", "cafe", "bakery", "food", "dining", "bar"]):
        return {
            "heading": "'DM Serif Display', Georgia, serif",
            "body": "'Poppins', -apple-system, sans-serif",
            "link": "family=DM+Serif+Display&family=Poppins:wght@400;500;600;700",
            "badge": "Editorial Dining"
        }
    elif any(k in c_lower for k in ["gym", "fitness", "yoga", "crossfit", "sports", "martial"]):
        return {
            "heading": "'Oswald', Impact, sans-serif",
            "body": "'Roboto', -apple-system, sans-serif",
            "link": "family=Oswald:wght@500;600;700&family=Roboto:wght@400;500;700",
            "badge": "Athletic Bold"
        }
    elif any(k in c_lower for k in ["coaching", "tuition", "preschool", "school", "education", "academy"]):
        return {
            "heading": "'Outfit', -apple-system, sans-serif",
            "body": "'Plus Jakarta Sans', -apple-system, sans-serif",
            "link": "family=Outfit:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700",
            "badge": "Academic Modern"
        }
    elif any(k in c_lower for k in ["clinic", "dental", "doctor", "health", "hospital", "pharma"]):
        return {
            "heading": "'Inter', -apple-system, sans-serif",
            "body": "'Manrope', -apple-system, sans-serif",
            "link": "family=Inter:wght@600;700;800&family=Manrope:wght@400;500;600;700",
            "badge": "Clinical Precision"
        }
    elif any(k in c_lower for k in ["pet", "vet", "dog", "cat", "animal"]):
        return {
            "heading": "'Fredoka', -apple-system, sans-serif",
            "body": "'Plus Jakarta Sans', -apple-system, sans-serif",
            "link": "family=Fredoka:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600",
            "badge": "Warm & Friendly"
        }
    return {
        "heading": "'Plus Jakarta Sans', -apple-system, sans-serif",
        "body": "'Inter', -apple-system, sans-serif",
        "link": "family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Inter:wght@400;500;600;700",
        "badge": "Universal Clean"
    }

def generate_svg_logo(brand_name: str, primary_color: str, secondary_color: str) -> str:
    """Synthesizes an elegant vector SVG brand emblem when no custom logo is uploaded."""
    words = [w for w in brand_name.split() if w]
    initials = ("".join([w[0] for w in words[:2]]) if words else "AI").upper()
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="logo-img" style="height: 38px; width: 38px; border-radius: 10px; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="{primary_color}"/>
          <stop offset="100%" stop-color="{secondary_color}"/>
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#logoGrad)"/>
      <text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="900" fill="#ffffff" dominant-baseline="middle" text-anchor="middle">{initials}</text>
    </svg>'''

def generate_export_zip(website_data: Dict[str, Any]) -> io.BytesIO:
    website_id = website_data.get("id") or ""
    subdomain = website_data.get("subdomain") or ""
    page_tree = safe_dict(website_data.get("page_tree"))
    brand_name = page_tree.get("brand_name") or website_data.get("title") or "My Website"
    
    navbar = safe_dict(page_tree.get("navbar"))
    logo_url = website_data.get("logo_url") or navbar.get("logo_url")
    tagline = page_tree.get("tagline", "Built with BuildMyWebsiteAI")
    
    colors = safe_dict(page_tree.get("colors"))
    website_type = page_tree.get("website_type", "single")
    category = website_data.get("category") or page_tree.get("category", "")
    font_info = get_font_pairing(category)
    theme_mode = page_tree.get("theme_mode") or colors.get("mode") or "light"
    selected_pages = page_tree.get("selected_pages", ["Home", "About Us", "Services", "Contact Us"])
    if not isinstance(selected_pages, list):
        selected_pages = ["Home", "About Us", "Services", "Contact Us"]

    pages_dict = safe_dict(page_tree.get("pages"))

    # Determine Dark vs Light Theme dynamically
    bg_val = str(colors.get("bg", "#f8fafc")).lower()
    is_dark = (theme_mode == "dark") or (colors.get("mode") == "dark") or (bg_val in ["#0f172a", "#09090b", "#0b0f19", "#030712", "#180e29", "#111827"])

    primary = colors.get("primary", "#6366f1")
    secondary = colors.get("secondary", "#ec4899")
    accent = colors.get("accent", "#38bdf8")

    if is_dark:
        bg = colors.get("bg", "#0f172a")
        surface = colors.get("surface", "#1e293b")
        text_color = "#f8fafc"
        muted_color = "#94a3b8"
        header_bg = "rgba(15, 23, 42, 0.94)"
        header_border = "rgba(255, 255, 255, 0.1)"
        card_bg = surface if surface != "#ffffff" else "#1e293b"
        card_border = "rgba(255, 255, 255, 0.1)"
        section_alt_bg = "#090d16"
        badge_bg = "rgba(99, 102, 241, 0.2)"
        badge_border = "rgba(99, 102, 241, 0.5)"
        badge_text = "#a5b4fc"
        input_bg = "#0f172a"
        input_border = "rgba(255, 255, 255, 0.15)"
        input_text = "#ffffff"
        modal_bg = "#111827"
    else:
        bg = "#f8fafc"
        surface = "#ffffff"
        text_color = "#0f172a"
        muted_color = "#475569"
        header_bg = "rgba(255, 255, 255, 0.95)"
        header_border = "rgba(0, 0, 0, 0.08)"
        card_bg = "#ffffff"
        card_border = "rgba(0, 0, 0, 0.08)"
        section_alt_bg = "#f1f5f9"
        badge_bg = "rgba(99, 102, 241, 0.08)"
        badge_border = primary
        badge_text = primary
        input_bg = "#ffffff"
        input_border = "rgba(0, 0, 0, 0.15)"
        input_text = "#0f172a"
        modal_bg = "#ffffff"

    hero = safe_dict(page_tree.get("hero"))
    about = safe_dict(page_tree.get("about"))
    services = safe_dict(page_tree.get("services"))
    features = safe_dict(page_tree.get("features"))
    faq = safe_dict(page_tree.get("faq"))
    testimonials = safe_dict(page_tree.get("testimonials"))
    cta = safe_dict(page_tree.get("cta"))
    contact = safe_dict(page_tree.get("contact"))
    footer = safe_dict(page_tree.get("footer"))

    css_content = f"""/* Generated by BuildMyWebsiteAI Studio */
:root {{
  --bg-color: {bg};
  --surface-color: {surface};
  --primary-color: {primary};
  --secondary-color: {secondary};
  --text-color: {text_color};
  --muted-color: {muted_color};
  --accent-color: {accent};
  --header-bg: {header_bg};
  --header-border: {header_border};
  --card-bg: {card_bg};
  --card-border: {card_border};
  --section-alt-bg: {section_alt_bg};
  --badge-bg: {badge_bg};
  --badge-border: {badge_border};
  --badge-text: {badge_text};
  --input-bg: {input_bg};
  --input-border: {input_border};
  --input-text: {input_text};
  --modal-bg: {modal_bg};
  --font-heading: {font_info["heading"]};
  --font-body: {font_info["body"]};
}}

* {{ box-sizing: border-box; margin: 0; padding: 0; }}
html {{ scroll-behavior: smooth; }}
body {{ background-color: var(--bg-color); color: var(--text-color); font-family: var(--font-body); line-height: 1.6; overflow-x: hidden; }}
h1, h2, h3, h4, .hero-title, .section-title {{ font-family: var(--font-heading); }}
a {{ color: inherit; text-decoration: none; }}
.container {{ max-width: 1200px; margin: 0 auto; padding: 0 24px; width: 100%; }}

/* Header & Nav */
header {{ position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: var(--header-bg); backdrop-filter: blur(16px); border-bottom: 1px solid var(--header-border); padding: 16px 0; transition: background 0.3s; }}
.nav-wrap {{ display: flex; justify-content: space-between; align-items: center; position: relative; }}
.logo-wrap {{ display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 20px; color: var(--primary-color); }}
.logo-img {{ height: 36px; width: 36px; object-fit: contain; border-radius: 8px; }}
.nav-links {{ display: flex; gap: 24px; list-style: none; align-items: center; }}
.nav-links a {{ color: var(--text-color); font-weight: 600; font-size: 14px; transition: color 0.2s ease; }}
.nav-links a:hover, .nav-links a.active {{ color: var(--primary-color); }}
.btn-primary {{ background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: #fff; padding: 12px 26px; border-radius: 9999px; font-weight: 700; display: inline-block; border: none; cursor: pointer; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.3); transition: transform 0.2s ease, box-shadow 0.2s ease; text-align: center; text-decoration: none; font-size: 14px; }}
.btn-primary:hover {{ transform: translateY(-2px); box-shadow: 0 14px 28px -5px rgba(99, 102, 241, 0.45); }}
.btn-secondary {{ background: transparent; border: 2px solid var(--primary-color); color: var(--text-color); padding: 10px 22px; border-radius: 9999px; font-weight: 700; display: inline-block; cursor: pointer; transition: all 0.2s ease; text-decoration: none; font-size: 14px; }}
.btn-secondary:hover {{ background: var(--primary-color); color: #fff; }}

.mobile-toggle {{ display: none; background: transparent; border: 1px solid var(--header-border); border-radius: 8px; padding: 6px 12px; font-size: 20px; cursor: pointer; color: var(--text-color); }}

/* Hero Section */
.hero-section {{ padding: 160px 0 80px; scroll-margin-top: 80px; position: relative; }}
.hero-grid {{ display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 48px; align-items: center; text-align: left; }}
.hero-left {{ display: flex; flex-direction: column; align-items: flex-start; gap: 20px; }}
.hero-right {{ position: relative; display: flex; justify-content: center; }}
.badge {{ display: inline-block; background: var(--badge-bg); border: 1px solid var(--badge-border); color: var(--badge-text); padding: 6px 18px; border-radius: 9999px; font-size: 13px; font-weight: 700; margin-bottom: 12px; }}
.hero-title {{ font-size: 48px; font-weight: 900; line-height: 1.15; color: var(--text-color); margin-bottom: 0; }}
.hero-subtitle {{ font-size: 16px; color: var(--muted-color); max-width: 620px; line-height: 1.7; margin-bottom: 0; }}
.hero-img {{ width: 100%; max-width: 900px; height: auto; max-height: 480px; object-fit: cover; border-radius: 24px; border: 1px solid var(--card-border); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35); }}

/* Section Layouts */
.section {{ padding: 85px 0; scroll-margin-top: 80px; }}
.section-alt {{ padding: 85px 0; background: var(--section-alt-bg); scroll-margin-top: 80px; }}
.section-header {{ text-align: center; margin-bottom: 48px; }}
.section-title {{ font-size: 34px; font-weight: 900; margin-bottom: 12px; color: var(--text-color); }}
.section-subtitle {{ font-size: 16px; color: var(--muted-color); max-width: 640px; margin: 0 auto; line-height: 1.6; }}

.grid-3 {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 28px; }}
.grid-4 {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 24px; }}

/* Cards */
.card {{ background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 18px; padding: 32px; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; }}
.card::before {{ content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: var(--primary-color); transform: scaleX(0); transition: transform 0.3s ease; transform-origin: left; }}
.card:hover::before {{ transform: scaleX(1); }}
.card:hover {{ transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }}
.card h3, .card h4 {{ color: var(--text-color); }}
.card p {{ color: var(--muted-color); line-height: 1.6; }}

/* Accordion FAQ */
.faq-card {{ background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 14px; margin-bottom: 12px; overflow: hidden; }}
.faq-question {{ padding: 18px 24px; font-size: 16px; font-weight: 700; color: var(--text-color); cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none; }}
.faq-question:hover {{ color: var(--primary-color); }}
.faq-answer {{ padding: 0 24px 18px; font-size: 14px; color: var(--muted-color); line-height: 1.6; display: none; }}
.faq-card.open .faq-answer {{ display: block; }}
.faq-card.open .faq-icon {{ transform: rotate(180deg); }}
.faq-icon {{ transition: transform 0.2s ease; font-weight: 900; }}

/* Footer */
footer {{ background: #07090e; color: #94a3b8; padding: 50px 0 25px; text-align: center; font-size: 14px; margin-top: 60px; border-top: 1px solid rgba(255,255,255,0.06); }}
footer a {{ color: var(--accent-color); }}

/* Inputs & Form */
.form-input {{ width: 100%; padding: 12px 16px; border-radius: 10px; border: 1px solid var(--input-border); background: var(--input-bg); color: var(--input-text); font-size: 14px; outline: none; transition: border 0.2s; }}
.form-input:focus {{ border-color: var(--primary-color); }}
.phone-row {{ display: grid; grid-template-columns: 140px 1fr; gap: 10px; }}

/* Modal */
.modal-overlay {{ position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px); z-index: 999; display: none; align-items: center; justify-content: center; padding: 20px; }}
.modal-overlay.active {{ display: flex; }}
.modal-box {{ background: var(--modal-bg); border: 1px solid var(--card-border); border-radius: 24px; padding: 36px; max-width: 520px; width: 100%; position: relative; box-shadow: 0 25px 60px rgba(0,0,0,0.4); max-height: 90vh; overflow-y: auto; text-align: left; }}
.modal-close {{ position: absolute; top: 20px; right: 20px; background: transparent; border: none; font-size: 22px; cursor: pointer; color: var(--muted-color); }}
.modal-close:hover {{ color: var(--text-color); }}

/* Toast Banner */
.toast-notice {{ position: fixed; bottom: 30px; right: 30px; z-index: 1000; background: #059669; color: #fff; padding: 16px 24px; border-radius: 14px; font-weight: 700; font-size: 14px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); display: none; align-items: center; gap: 10px; }}
.toast-notice.active {{ display: flex; animation: slideUp 0.3s ease; }}
@keyframes slideUp {{ from {{ transform: translateY(30px); opacity: 0; }} to {{ transform: translateY(0); opacity: 1; }} }}

/* WhatsApp & Lead Action Buttons */
.btn-whatsapp {{
  background: #25D366;
  color: #ffffff !important;
  padding: 12px 24px;
  border-radius: 9999px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 8px 20px -4px rgba(37, 211, 102, 0.4);
  font-size: 14px;
}}
.btn-whatsapp:hover {{
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -4px rgba(37, 211, 102, 0.55);
}}

/* Mobile Floating Call/WhatsApp Bar */
.mobile-sticky-bar {{
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 990;
  background: var(--header-bg);
  backdrop-filter: blur(16px);
  border-top: 1px solid var(--header-border);
  padding: 8px 12px;
  gap: 8px;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
}}
.sticky-action-btn {{
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 8px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: transform 0.15s;
}}
.sticky-action-btn.btn-call {{ background: var(--primary-color); color: #fff; }}
.sticky-action-btn.btn-wa {{ background: #25D366; color: #fff; }}
.sticky-action-btn.btn-book {{ background: var(--secondary-color); color: #fff; }}
.sticky-action-btn:active {{ transform: scale(0.96); }}

/* Service Chips for Multi-Selection (FEAT-005) */
.service-chips {{ display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }}
.service-chip-lbl {{ display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 9999px; border: 1px solid var(--input-border); background: var(--input-bg); font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; user-select: none; }}
.service-chip-lbl:hover {{ border-color: var(--primary-color); }}
.service-chip-lbl input:checked + span {{ color: var(--primary-color); }}

/* Guaranteed Section Visibility */
[data-aos] {{
  opacity: 1 !important;
  transform: none !important;
  visibility: visible !important;
}}
.subpage-hero-banner {{
  background: var(--section-alt-bg);
  padding: 56px 0 36px;
  text-align: center;
  border-bottom: 1px solid var(--card-border);
}}


/* Language Switcher (IND-004) */
.lang-switch-btn {{
  background: transparent;
  border: 1px solid var(--primary-color);
  color: var(--text-color);
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}}
.lang-switch-btn:hover {{
  background: var(--primary-color);
  color: #ffffff;
}}

/* UPI QR Code Card & Badges (IND-001) */
.upi-card {{
  border: 2px dashed var(--primary-color) !important;
  background: var(--card-bg) !important;
  border-radius: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}}
.upi-card:hover {{
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}}

/* Indian Trust Badges (IND-006) */
.trust-badges-bar {{
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}}
.trust-badge-pill {{
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
}}

/* Responsiveness */
@media (max-width: 768px) {{
  body {{ padding-bottom: 64px; }}
  .mobile-sticky-bar {{ display: flex; }}
  .container {{ padding: 0 16px; }}
  .mobile-toggle {{ display: block; }}
  .nav-links {{ display: none; position: absolute; top: 100%; left: 0; right: 0; background: var(--header-bg); flex-direction: column; padding: 20px; gap: 16px; border-bottom: 1px solid var(--header-border); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); text-align: left; }}
  .nav-links.active {{ display: flex; }}
  .hero-grid {{ grid-template-columns: 1fr !important; text-align: center; gap: 32px; }}
  .hero-left {{ align-items: center; }}
  .hero-title {{ font-size: 32px !important; }}
  .hero-subtitle {{ font-size: 14px !important; }}
  .grid-3, .grid-4 {{ grid-template-columns: 1fr !important; gap: 16px !important; }}
  .btn-primary, .btn-secondary, .btn-whatsapp {{ width: 100%; text-align: center; display: flex; }}
  .phone-row {{ grid-template-columns: 1fr; }}
}}
"""
    # Inject Custom Studio CSS if provided (FEAT-013)
    custom_css = page_tree.get("custom_css", "")
    if custom_css:
        css_content += f"\n\n/* Custom Studio CSS Injected (FEAT-013) */\n{custom_css}\n"


    def build_page_html(page_name: str, p_data: Dict[str, Any]) -> str:
        p_data = safe_dict(p_data)
        is_multi = website_type == "multi"
        is_subpage = is_multi and page_name != "Home"

        p_name_lower = page_name.lower().strip()
        is_about_page = "about" in p_name_lower
        is_services_page = "service" in p_name_lower or "offering" in p_name_lower or "menu" in p_name_lower or "pricing" in p_name_lower
        is_contact_page = "contact" in p_name_lower or "reach" in p_name_lower or "location" in p_name_lower
        is_faq_page = "faq" in p_name_lower or "question" in p_name_lower

        # Resilient subpage section matching
        p_hero = safe_dict(p_data.get("hero")) if (is_subpage and "hero" in p_data) else hero
        
        if is_subpage:
            p_about = safe_dict(p_data.get("about")) if "about" in p_data else (about if is_about_page else None)
            p_services = safe_dict(p_data.get("services")) if "services" in p_data else (services if is_services_page else None)
            p_features = safe_dict(p_data.get("features")) if "features" in p_data else (features if (is_about_page or is_services_page) else None)
            p_faq = safe_dict(p_data.get("faq")) if "faq" in p_data else (faq if (is_faq_page or is_services_page or is_contact_page) else None)
            p_testimonials = safe_dict(p_data.get("testimonials")) if "testimonials" in p_data else (testimonials if is_about_page else None)
            p_cta = safe_dict(p_data.get("cta")) if "cta" in p_data else cta
            p_contact = safe_dict(p_data.get("contact")) if "contact" in p_data else (contact if is_contact_page else None)
            p_footer = safe_dict(p_data.get("footer")) if "footer" in p_data else footer
        else:
            p_about = safe_dict(p_data.get("about")) or about
            p_services = safe_dict(p_data.get("services")) or services
            p_features = safe_dict(p_data.get("features")) or features
            p_faq = safe_dict(p_data.get("faq")) or faq
            p_testimonials = safe_dict(p_data.get("testimonials")) or testimonials
            p_cta = safe_dict(p_data.get("cta")) or cta
            p_contact = safe_dict(p_data.get("contact")) or contact
            p_footer = safe_dict(p_data.get("footer")) or footer

        if is_multi:
            nav_items_html = "".join([f'<li><a href="{get_page_slug(p)}" class="{"active" if p == page_name else ""}">{p}</a></li>' for p in selected_pages])
        else:
            nav_links = navbar.get("links", [])
            if not isinstance(nav_links, list): nav_links = []
            nav_items_html = "".join([f'<li><a href="{link.get("href")}" class="{"active" if link.get("label") == page_name else ""}">{link.get("label")}</a></li>' for link in nav_links if isinstance(link, dict)])
        logo_img_html = f'<img src="{logo_url}" alt="Logo" class="logo-img">' if logo_url else generate_svg_logo(brand_name, primary, secondary)

        # Build Section HTML snippets
        if is_subpage:
            sub_title = p_hero.get("headline") or f"{page_name}"
            sub_desc = p_hero.get("subheadline") or f"Learn more about our {page_name.lower()} at {brand_name}."
            hero_html = f"""
  <section class="subpage-hero-banner">
    <div class="container">
      <span class="badge" style="margin-bottom: 12px; display: inline-block;">{page_name}</span>
      <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 10px; color: var(--text-color);">{html.escape(sub_title)}</h1>
      <p style="font-size: 15px; color: var(--muted-color); max-width: 650px; margin: 0 auto;">{html.escape(sub_desc)}</p>
    </div>
  </section>"""
        else:
            hero_badge_html = f'<span class="badge">{p_hero.get("badge")}</span>' if p_hero.get("badge") else ''
            hero_img_html = f'<img src="{p_hero.get("hero_image")}" alt="Hero" class="hero-img">' if p_hero.get("hero_image") else ''
            hero_html = f"""
  <section id="home" class="hero-section">
    <div class="container">
      <div class="hero-grid">
        <div class="hero-left">
          {hero_badge_html}
          <h1 class="hero-title">{html.escape(p_hero.get("headline", brand_name))}</h1>
          <p class="hero-subtitle">{html.escape(p_hero.get("subheadline", ""))}</p>
          <div style="display: flex; gap: 14px; flex-wrap: wrap; margin-top: 10px;">
            <button onclick="openBookingModal()" class="btn-primary">{html.escape(p_hero.get("primary_cta", "Book Free Assessment"))}</button>
            <a href="#services" class="btn-secondary">Explore Services</a>
          </div>
        </div>
        <div class="hero-right">
          {hero_img_html}
        </div>
      </div>
    </div>
  </section>"""

        about_html = ""
        if p_about and isinstance(p_about, dict):
            paras = p_about.get("paragraphs")
            if isinstance(paras, str):
                paras = [paras]
            elif not isinstance(paras, list):
                paras = []
            if not paras:
                for k in ["description", "story", "content", "summary"]:
                    if p_about.get(k):
                        paras = [p_about.get(k)]
                        break
            if not paras:
                paras = [f"Welcome to {brand_name}. We take immense pride in delivering exceptional care, professional service, and verified excellence."]

            paragraphs_html = "".join([f'<p style="margin-bottom: 16px; font-size: 15px; line-height: 1.7; color: var(--muted-color);">{p}</p>' for p in paras])
            mission_card_html = f'<div class="card" style="border-left: 4px solid var(--primary-color);"><h4 style="font-weight: 800; color: var(--primary-color); margin-bottom: 8px;">Our Mission</h4><p style="font-size: 14px; color: var(--muted-color);">{p_about.get("mission")}</p></div>' if p_about.get("mission") else ''
            vision_card_html = f'<div class="card" style="border-left: 4px solid var(--secondary-color);"><h4 style="font-weight: 800; color: var(--secondary-color); margin-bottom: 8px;">Our Vision</h4><p style="font-size: 14px; color: var(--muted-color);">{p_about.get("vision")}</p></div>' if p_about.get("vision") else ''
            
            pillars_html = ""
            if isinstance(p_about.get("pillars"), list) and p_about.get("pillars"):
                pil_cards = "".join([
                    f'<div class="card" style="padding: 20px; border-radius: 16px;"><h4 style="font-size: 15px; font-weight: 800; margin-bottom: 6px; color: var(--text-color);">{pil.get("title")}</h4><p style="font-size: 13px; color: var(--muted-color); line-height: 1.5;">{pil.get("desc")}</p></div>'
                    for pil in p_about.get("pillars") if isinstance(pil, dict)
                ])
                pillars_html = f"""<div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(128,128,128,0.15);">
        <div class="section-header" style="margin-bottom: 24px; text-align: center;">
          <h3 style="font-size: 22px; font-weight: 800; color: var(--text-color);">{p_about.get("pillars_title", "Our Core Principles")}</h3>
          <p class="section-subtitle" style="font-size: 13px;">{p_about.get("pillars_subtitle", "")}</p>
        </div>
        <div class="grid-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
          {pil_cards}
        </div>
      </div>"""

            about_html = f"""
  <section id="about" class="section-alt">
    <div class="container">
      <div class="section-header">
        <span class="badge">{p_about.get("section_badge", "Our Background")}</span>
        <h2 class="section-title">{p_about.get("section_title", f"About {brand_name}")}</h2>
      </div>
      <div class="about-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px; margin-bottom: 40px; align-items: center;">
        <div class="about-story">
          {paragraphs_html}
          <div style="margin-top: 24px;">
            <button onclick="openBookingModal()" class="btn-primary">Connect With Our Team</button>
          </div>
        </div>
        <div class="about-cards" style="display: flex; flex-direction: column; gap: 20px;">
          {mission_card_html}
          {vision_card_html}
        </div>
      </div>
      {pillars_html}
    </div>
  </section>"""

        services_html = ""
        if p_services and isinstance(p_services.get("items"), list):
            s_cards = "".join([f"""
        <div class="card" data-aos="fade-up">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div style="width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: var(--badge-bg); color: var(--primary-color); font-weight: 900;">✓</div>
            <span style="font-weight: 800; color: var(--primary-color); font-size: 13px; background: var(--badge-bg); padding: 4px 10px; border-radius: 9999px;">{item.get("price", "Popular")}</span>
          </div>
          <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 8px; color: var(--text-color);">{item.get("title")}</h3>
          <p style="font-size: 13px; color: var(--muted-color); margin-bottom: 20px;">{item.get("description")}</p>
          <button onclick="openBookingModal('{item.get("title")}')" class="btn-primary" style="width: 100%; padding: 8px 16px; font-size: 12px; border-radius: 8px;">Book Service</button>
        </div>""" for item in p_services.get("items", []) if isinstance(item, dict)])

            services_html = f"""
  <section id="services" class="section" data-aos="fade-up">
    <div class="container">
      <div class="section-header">
        <span class="badge">{p_services.get("section_badge", "Comprehensive Services")}</span>
        <h2 class="section-title">{p_services.get("section_title", "Our Specialized Offerings")}</h2>
        <p class="section-subtitle">{p_services.get("section_subtitle", "")}</p>
      </div>
      <div class="grid-3">
        {s_cards}
      </div>
    </div>
  </section>"""

        features_html = ""
        if p_features and isinstance(p_features.get("items"), list):
            f_cards = "".join([f"""
        <div class="card" data-aos="fade-up">
          <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 8px; color: var(--text-color);">{item.get("title")}</h3>
          <p style="font-size: 13px; color: var(--muted-color);">{item.get("description")}</p>
        </div>""" for item in p_features.get("items", []) if isinstance(item, dict)])
            features_html = f"""
  <section id="features" class="section-alt" data-aos="fade-up">
    <div class="container">
      <div class="section-header">
        <span class="badge">{p_features.get("section_badge", "Why Choose Us")}</span>
        <h2 class="section-title">{p_features.get("section_title", "What Sets Us Apart")}</h2>
        <p class="section-subtitle">{p_features.get("section_subtitle", "")}</p>
      </div>
      <div class="grid-3">
        {f_cards}
      </div>
    </div>
  </section>"""

        blog_html = ""
        blog_items = p_data.get("blog_articles") if (is_subpage and "blog_articles" in p_data) else page_tree.get("blog_articles")
        if blog_items and isinstance(blog_items, list):
            b_cards = "".join([f"""
        <div class="card" data-aos="fade-up" style="display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; padding: 24px;">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; font-size: 12px; color: var(--muted-color);">
              <span style="background: var(--badge-bg); color: var(--primary-color); padding: 3px 8px; border-radius: 6px; font-weight: 700;">{art.get("read_time", "5 min read")}</span>
              <span>{art.get("date", "Recent")}</span>
            </div>
            <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 10px; line-height: 1.4; color: var(--text-color);">{art.get("title")}</h3>
            <p style="font-size: 13px; color: var(--muted-color); line-height: 1.6; margin-bottom: 16px;">{art.get("summary")}</p>
          </div>
          <div style="border-top: 1px solid rgba(128,128,128,0.15); padding-top: 14px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 12px; font-weight: 700; color: var(--primary-color);">By {art.get("author", brand_name)}</span>
            <button onclick="alert('{str(art.get('title', '')).replace("'", "\\'")}:\\n\\n{str(art.get('content', '')).replace("'", "\\'")}')" class="btn-primary" style="padding: 6px 14px; font-size: 11px; border-radius: 6px;">Read Post</button>
          </div>
        </div>""" for art in blog_items if isinstance(art, dict)])
            blog_html = f"""
  <section id="blog" class="section" data-aos="fade-up">
    <div class="container">
      <div class="section-header">
        <span class="badge">Knowledge & Insights</span>
        <h2 class="section-title">Latest Articles & Guides</h2>
        <p class="section-subtitle">Expert advice and practical guides authored by {brand_name}.</p>
      </div>
      <div class="grid-3">
        {b_cards}
      </div>
    </div>
  </section>"""

        faq_html = ""
        if p_faq and isinstance(p_faq.get("items"), list):
            faq_items = "".join([f"""
        <div class="faq-card" data-aos="fade-up">
          <div class="faq-question" onclick="toggleFaq(this)">
            <span>{item.get("question")}</span>
            <span class="faq-icon">▼</span>
          </div>
          <div class="faq-answer">
            {item.get("answer")}
          </div>
        </div>""" for item in p_faq.get("items", []) if isinstance(item, dict)])
            faq_html = f"""
  <section id="faq" class="section" data-aos="fade-up">
    <div class="container" style="max-width: 820px;">
      <div class="section-header">
        <span class="badge">FAQ</span>
        <h2 class="section-title">{p_faq.get("section_title", "Frequently Asked Questions")}</h2>
      </div>
      {faq_items}
    </div>
  </section>"""

        testimonials_html = ""
        if p_testimonials and isinstance(p_testimonials.get("items"), list):
            t_cards = "".join([f"""
        <div class="card" data-aos="fade-up">
          <p style="font-size: 14px; font-style: italic; margin-bottom: 18px; color: var(--text-color);">"{item.get("quote")}"</p>
          <div style="font-weight: 800; font-size: 14px; color: var(--primary-color);">{item.get("name")}</div>
          <div style="font-size: 12px; color: var(--muted-color);">{item.get("role")}</div>
        </div>""" for item in p_testimonials.get("items", []) if isinstance(item, dict)])
            testimonials_html = f"""
  <section id="testimonials" class="section-alt" data-aos="fade-up">
    <div class="container">
      <div class="section-header">
        <span class="badge">Verified Reviews</span>
        <h2 class="section-title">{p_testimonials.get("section_title", "What Clients & Students Say")}</h2>
      </div>
      <div class="grid-3">
        {t_cards}
      </div>
    </div>
  </section>"""

        contact_html = ""
        phone_val = p_contact.get("contact_phone") or (p_footer.get("contact_phone") if p_footer else "") or ""
        email_val = p_contact.get("contact_email") or (p_footer.get("contact_email") if p_footer else "") or ""
        address_val = p_contact.get("address") or (p_footer.get("address") if p_footer else "") or ""
        hours_val = p_contact.get("business_hours") or (p_footer.get("business_hours") if p_footer else "") or ""
        clean_wa = clean_phone_for_wa(phone_val)
        wa_url = f"https://wa.me/{clean_wa}?text={urllib.parse.quote(f'Hello {brand_name}, I would like to inquire about your services.')}" if clean_wa else ""
        web3forms_key = p_contact.get("web3forms_key") or (p_footer.get("web3forms_key") if p_footer else "") or ""

        if p_contact and isinstance(p_contact, dict):
            encoded_addr = urllib.parse.quote_plus(address_val) if address_val else ""
            maps_iframe_html = f'''<div class="card" style="margin-top: 24px; padding: 20px; border-radius: 18px; overflow: hidden; background: var(--card-bg, rgba(255,255,255,0.03)); border: 1px solid var(--card-border, rgba(255,255,255,0.1));">
              <div style="font-weight: 800; font-size: 14px; margin-bottom: 12px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 8px; color: var(--text-color);">
                  <span>📍 Google Maps Live Navigation</span>
                  <span style="font-size: 11px; font-weight: 600; color: var(--muted-color);">{html.escape(address_val)}</span>
                </div>
                <a href="https://www.google.com/maps/search/?api=1&query={encoded_addr}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 9999px; background: #ea4335; color: #ffffff; font-size: 11px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 12px rgba(234,67,53,0.3); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
                  <span>Open in Google Maps ↗</span>
                </a>
              </div>
              <div style="position: relative; width: 100%; height: 280px; border-radius: 12px; overflow: hidden; background: #0f172a;">
                <iframe width="100%" height="100%" style="border:0; position: absolute; inset: 0; width: 100%; height: 100%;" allowfullscreen="" allow="geolocation; fullscreen" src="https://maps.google.com/maps?q={encoded_addr}&t=&z=14&ie=UTF8&iwloc=B&output=embed"></iframe>
              </div>
            </div>''' if address_val else ''

            contact_cards = []
            if wa_url:
                contact_cards.append(f'''<div class="card" style="border-left: 4px solid #25D366; background: linear-gradient(135deg, rgba(37,211,102,0.06), transparent);">
            <div style="font-size: 24px; margin-bottom: 8px;">💬</div>
            <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px;">Instant WhatsApp Booking</div>
            <p style="font-size: 12px; margin-bottom: 12px;">Chat directly with our representatives for real-time answers.</p>
            <a href="{wa_url}" target="_blank" class="btn-whatsapp">Chat on WhatsApp</a>
          </div>''')
            if phone_val:
                contact_cards.append(f'''<div class="card">
            <div style="font-size: 24px; margin-bottom: 8px;">📞</div>
            <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px;">Direct Phone Support</div>
            <a href="tel:{html.escape(phone_val)}" style="color: var(--primary-color); font-weight: 700; font-size: 15px;">{html.escape(phone_val)}</a>
          </div>''')
            if email_val:
                contact_cards.append(f'''<div class="card">
            <div style="font-size: 24px; margin-bottom: 8px;">✉️</div>
            <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px;">Email Us</div>
            <a href="mailto:{html.escape(email_val)}" style="color: var(--primary-color); font-weight: 700; font-size: 15px;">{html.escape(email_val)}</a>
          </div>''')
            if address_val:
                contact_cards.append(f'''<div class="card">
            <div style="font-size: 24px; margin-bottom: 8px;">📍</div>
            <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px;">Physical Location</div>
            <p style="font-size: 13px;">{html.escape(address_val)}</p>
          </div>''')
            if hours_val:
                contact_cards.append(f'''<div class="card">
            <div style="font-size: 24px; margin-bottom: 8px;">⏰</div>
            <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px;">Operating Hours</div>
            <p style="font-size: 13px;">{html.escape(hours_val)}</p>
          </div>''')

            cards_html = "".join(contact_cards)

            contact_html = f"""
  <section id="contact" class="section-alt" data-aos="fade-up">
    <div class="container">
      <div class="section-header">
        <span class="badge">{html.escape(p_contact.get("section_badge", "Get In Touch"))}</span>
        <h2 class="section-title">{html.escape(p_contact.get("section_title", f"Contact {brand_name}"))}</h2>
        <p class="section-subtitle">{html.escape(p_contact.get("section_subtitle", "Reach out directly or send us an inquiry below."))}</p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px;">
        <div style="display: flex; flex-direction: column; gap: 16px;">
          {cards_html}
        </div>
        <div class="card" style="padding: 36px;">
          <h3 style="font-size: 20px; font-weight: 900; margin-bottom: 16px;">{html.escape(p_contact.get("form_title", "Send a Direct Inquiry"))}</h3>
          <form onsubmit="handleContactSubmit(event)" style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px;">Your Full Name *</label>
              <input type="text" id="contact_name" required placeholder="John Doe" class="form-input">
            </div>
            <div>
              <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px;">Mobile Number (with Country Code) *</label>
              <div class="phone-row">
                <select id="contact_country_code" class="form-input" onchange="validateContactPhone()">
                  <option value="+91" selected>🇮🇳 +91 (India)</option>
                  <option value="+1">🇺🇸 +1 (USA)</option>
                  <option value="+44">🇬🇧 +44 (UK)</option>
                  <option value="+971">🇦🇪 +971 (UAE)</option>
                  <option value="+1">🇨🇦 +1 (Canada)</option>
                  <option value="+61">🇦🇺 +61 (Australia)</option>
                  <option value="+65">🇸🇬 +65 (Singapore)</option>
                  <option value="+49">🇩🇪 +49 (Germany)</option>
                  <option value="+966">🇸🇦 +966 (Saudi)</option>
                </select>
                <input type="tel" id="contact_mobile" required placeholder="10-digit number" class="form-input" oninput="validateContactPhone()">
              </div>
              <span id="contact_phone_err" style="display: none; color: #ef4444; font-size: 11px; margin-top: 4px; font-weight: 600;">Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).</span>
            </div>
            <div>
              <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px;">Email Address</label>
              <input type="email" id="contact_email_input" placeholder="name@domain.com" class="form-input">
            </div>
            <div>
              <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px;">Message or Inquiry *</label>
              <textarea id="contact_msg" rows="3" required placeholder="Describe what service you are looking for..." class="form-input"></textarea>
            </div>
            <button type="submit" class="btn-primary" style="margin-top: 8px;">{html.escape(p_contact.get("cta_text", "Send Message"))}</button>
          </form>
        </div>
      </div>
      {maps_iframe_html}
    </div>
  </section>"""

        # Direct UPI QR Code (IND-001) - Only render if legitimate UPI ID is provided!
        upi_id = p_contact.get("upi_id") or p_footer.get("upi_id") or ""
        upi_card_html = ""
        if upi_id:
            encoded_brand_name = urllib.parse.quote(brand_name)
            upi_pay_url = f"upi://pay?pa={upi_id}&pn={encoded_brand_name}&cu=INR"
            upi_qr_url = f"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={urllib.parse.quote_plus(upi_pay_url)}"
            upi_card_html = f"""
      <div class="card upi-card" style="padding: 24px; max-width: 440px; margin: 0 auto; text-align: center;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 6px;">
          <span style="font-size: 20px;">⚡</span>
          <span style="font-weight: 800; font-size: 15px; color: var(--text-color);">Zero-MDR Direct UPI Payment</span>
        </div>
        <p style="font-size: 12px; color: var(--muted-color); margin-bottom: 14px;">Scan with GPay, PhonePe, Paytm, or BHIM for direct advance token / billing.</p>
        <div style="background: #ffffff; padding: 12px; border-radius: 14px; display: inline-block; box-shadow: 0 4px 16px rgba(0,0,0,0.08); margin-bottom: 12px;">
          <img src="{upi_qr_url}" alt="UPI QR Code for {html.escape(brand_name)}" width="160" height="160" style="display: block; border-radius: 8px;">
        </div>
        <div style="font-size: 13px; font-weight: 800; color: var(--primary-color); margin-bottom: 10px;">
          UPI ID: <span style="font-family: monospace; background: var(--badge-bg); padding: 2px 8px; border-radius: 6px; user-select: all;">{html.escape(upi_id)}</span>
        </div>
        <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; margin-bottom: 14px;">
          <span style="font-size: 11px; font-weight: 700; background: var(--badge-bg); color: var(--text-color); padding: 3px 8px; border-radius: 9999px;">Google Pay</span>
          <span style="font-size: 11px; font-weight: 700; background: var(--badge-bg); color: var(--text-color); padding: 3px 8px; border-radius: 9999px;">PhonePe</span>
          <span style="font-size: 11px; font-weight: 700; background: var(--badge-bg); color: var(--text-color); padding: 3px 8px; border-radius: 9999px;">Paytm</span>
          <span style="font-size: 11px; font-weight: 700; background: var(--badge-bg); color: var(--text-color); padding: 3px 8px; border-radius: 9999px;">BHIM UPI</span>
        </div>
        <a href="{upi_pay_url}" class="btn-primary" style="display: inline-block; width: 100%; padding: 10px 18px; font-size: 13px; border-radius: 9999px; text-decoration: none;">📱 Tap to Pay on Mobile UPI App</a>
      </div>"""

        # Indian Trust Credentials (IND-006) - Only render if legitimate registration is present!
        gstin = p_footer.get("gstin") or p_contact.get("gstin") or ""
        fssai = p_footer.get("fssai") or p_contact.get("fssai") or ""
        msme = p_footer.get("msme_number") or p_contact.get("msme_number") or ""
        is_food = any(k in (category or "").lower() for k in ["sweet", "mithai", "restaurant", "café", "bakery", "kirana", "food", "caterer", "grocery"])

        trust_badge_items = []
        if gstin:
            trust_badge_items.append(f'''<div class="trust-badge-pill"><span>🇮🇳</span> <span>GST Verified: {html.escape(gstin)}</span></div>''')
        if fssai and is_food:
            trust_badge_items.append(f'''<div class="trust-badge-pill"><span>🥗</span> <span>FSSAI Lic: {html.escape(fssai)}</span></div>''')
        if msme:
            trust_badge_items.append(f'''<div class="trust-badge-pill"><span>🛡️</span> <span>MSME Udyam Verified: {html.escape(str(msme))}</span></div>''')
        elif p_footer.get("msme_verified") or p_contact.get("msme_verified") or gstin:
            trust_badge_items.append('''<div class="trust-badge-pill"><span>🛡️</span> <span>MSME Udyam Verified Enterprise</span></div>''')
        if upi_id:
            trust_badge_items.append(f'''<div class="trust-badge-pill"><span>⚡</span> <span>Direct UPI Accepted</span></div>''')

        trust_badges_bar_html = f'''<div class="trust-badges-bar">{"".join(trust_badge_items)}</div>''' if trust_badge_items else ''


        cta_html = ""
        if p_cta and isinstance(p_cta, dict):
            wa_cta_btn = f'<a href="{wa_url}" target="_blank" class="btn-whatsapp">💬 Instant WhatsApp</a>' if wa_url else ''
            cta_html = f"""
  <section class="section" style="background: linear-gradient(135deg, var(--surface-color), var(--bg-color)); text-align: center;" data-aos="zoom-in">
    <div class="container" style="max-width: 760px;">
      <h2 class="section-title">{html.escape(p_cta.get("headline", f"Ready to Connect with {brand_name}?"))}</h2>
      <p class="hero-subtitle" style="margin: 0 auto 24px;">{html.escape(p_cta.get("subheadline", "Reach out today and our dedicated team will respond promptly."))}</p>
      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 28px;">
        <button onclick="openBookingModal()" class="btn-primary">{html.escape(p_cta.get("button_text", "Book An Appointment Now"))}</button>
        {wa_cta_btn}
      </div>
      {upi_card_html}
    </div>
  </section>"""

        footer_html = f"""
  <footer>
    <div class="container">
      <p style="font-weight: 800; font-size: 16px; margin-bottom: 8px; color: #fff;">{html.escape(p_footer.get("brand", brand_name) if p_footer else brand_name)}</p>
      <p style="margin-bottom: 16px; font-size: 13px;">{html.escape(p_footer.get("copyright", f"© 2026 {brand_name}. All rights reserved.") if p_footer else f"© 2026 {brand_name}. All rights reserved.")}</p>
      {trust_badges_bar_html}
      <p style="font-size: 12px; opacity: 0.6; margin-top: 12px;">{html.escape(p_footer.get("credit", "Website built by BuildMyWebsiteAI") if p_footer else "Website built by BuildMyWebsiteAI")}</p>
    </div>
  </footer>"""

        # Generate multi-select service chips for booking modal (FEAT-005)
        service_options = ""
        service_chips_html = ""
        if services and isinstance(services.get("items"), list):
            service_options = "".join([f'<option value="{html.escape(item.get("title", ""))}">{html.escape(item.get("title", ""))} - {html.escape(item.get("price", ""))}</option>' for item in services.get("items", []) if isinstance(item, dict)])
            service_chips_html = "".join([f'''<label class="service-chip-lbl">
              <input type="checkbox" name="service_chip" value="{html.escape(item.get("title", ""))}">
              <span>{html.escape(item.get("title", ""))}</span>
              <small style="opacity: 0.7; font-size: 11px;">({html.escape(item.get("price", ""))})</small>
            </label>''' for item in services.get("items", []) if isinstance(item, dict)])

        # Determine SEO and Social Meta tags (FEAT-021, FEAT-022, Custom SEO Editor)
        custom_seo = safe_dict(p_data.get("seo")) if (is_subpage and "seo" in p_data) else safe_dict(page_tree.get("seo"))
        default_seo_title = f"{page_name} | {brand_name}" if page_name != "Home" else f"{brand_name} - Official Website"
        seo_title = custom_seo.get("title") or default_seo_title
        
        hero_desc = p_hero.get("subheadline") if p_hero else ""
        default_seo_desc = hero_desc[:155] if hero_desc else f"Welcome to {brand_name}. Explore our specialized services, portfolio, and connect with our team."
        seo_description = custom_seo.get("description") or default_seo_desc
        
        seo_keywords = custom_seo.get("keywords") or f"{brand_name}, {category}, services, official website"
        hero_img = custom_seo.get("og_image") or (p_hero.get("image_url") if p_hero else "") or "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"

        # Determine business type for Schema.org LocalBusiness JSON-LD (FEAT-023)
        schema_type = "LocalBusiness"
        c_lower = (category or "").lower()
        if any(k in c_lower for k in ["coaching", "school", "education", "tuition", "academy"]):
            schema_type = "EducationalOrganization"
        elif any(k in c_lower for k in ["restaurant", "food", "café", "cafe", "bakery", "mithai", "sweet"]):
            schema_type = "Restaurant"
        elif any(k in c_lower for k in ["salon", "spa", "beauty", "hair"]):
            schema_type = "BeautySalon"
        elif any(k in c_lower for k in ["gym", "fitness", "yoga"]):
            schema_type = "HealthClub"
        elif any(k in c_lower for k in ["clinic", "hospital", "doctor", "ayurved"]):
            schema_type = "MedicalBusiness"
        elif any(k in c_lower for k in ["consultant", "ca", "tax", "accounting", "legal"]):
            schema_type = "FinancialService"

        schema_dict = {
            "@context": "https://schema.org",
            "@type": schema_type,
            "name": brand_name,
            "description": seo_description,
            "url": f"https://{re.sub(r'[^a-zA-Z0-9]+', '', brand_name.lower())}.com"
        }
        if phone_val:
            schema_dict["telephone"] = phone_val
        if email_val:
            schema_dict["email"] = email_val
        if address_val:
            schema_dict["address"] = {
                "@type": "PostalAddress",
                "streetAddress": address_val,
                "addressCountry": "IN"
            }
        if hours_val:
            schema_dict["openingHours"] = hours_val

        schema_json_ld = json.dumps(schema_dict, indent=2)

        return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>{html.escape(seo_title)}</title>

  <!-- Dynamic Localized SEO Meta Generator (FEAT-021) -->
  <meta name="description" content="{html.escape(seo_description)}">
  <meta name="keywords" content="{html.escape(seo_keywords)}">
  <meta name="robots" content="index, follow">
  <meta name="author" content="{html.escape(brand_name)}">

  <!-- Open Graph & Social Card Injection (FEAT-022) -->
  <meta property="og:site_name" content="{html.escape(brand_name)}">
  <meta property="og:title" content="{html.escape(seo_title)}">
  <meta property="og:description" content="{html.escape(seo_description)}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="{html.escape(hero_img)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{html.escape(seo_title)}">
  <meta name="twitter:description" content="{html.escape(seo_description)}">
  <meta name="twitter:image" content="{html.escape(hero_img)}">

  <!-- Schema.org Rich Snippets JSON-LD (FEAT-023) -->
  <script type="application/ld+json">
{schema_json_ld}
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?{font_info['link']}&display=swap" rel="stylesheet">
  <!-- AOS Animate On Scroll Library CDN -->
  <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />
  <link rel="stylesheet" href="style.css">
</head>

<body>
  <header>
    <div class="container">
      <div class="nav-wrap">
        <div class="logo-wrap">
          {logo_img_html}
          <span>{brand_name}</span>
        </div>
        <button class="mobile-toggle" id="mobile-toggle" aria-label="Toggle Menu">☰</button>
        <ul class="nav-links" id="nav-links">
          {nav_items_html}
          <li><button id="lang-toggle-btn" class="lang-switch-btn" onclick="toggleLanguage()">🇮🇳 हिन्दी</button></li>
          <li><button onclick="openBookingModal()" class="btn-primary" style="padding: 8px 20px; font-size: 13px;">Get In Touch</button></li>
        </ul>
      </div>
    </div>
  </header>

  {hero_html}
  {about_html}
  {services_html}
  {features_html}
  {blog_html}
  {faq_html}
  {testimonials_html}
  {contact_html}
  {cta_html}
  {footer_html}

  <!-- Interactive Booking / Appointment Modal with Bharat Stack (IND-001, IND-007, IND-010) -->
  <div id="booking-modal" class="modal-overlay">
    <div class="modal-box">
      <button class="modal-close" onclick="closeBookingModal()">✕</button>
      <div style="margin-bottom: 20px;">
        <span class="badge">Appointment & Order Booking</span>
        <h3 style="font-size: 22px; font-weight: 900; margin-top: 6px; color: var(--text-color);">Book With {brand_name}</h3>
        <p style="font-size: 13px; color: var(--muted-color);">Select your preferred service and schedule an appointment.</p>
      </div>

      <form onsubmit="handleBookingSubmit(event)" style="display: flex; flex-direction: column; gap: 14px;">
        <div>
          <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px;">Your Full Name *</label>
          <input type="text" id="modal_name" required placeholder="John Doe" class="form-input">
        </div>

        <div>
          <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px;">Mobile Number (with Country Code) *</label>
          <div class="phone-row">
            <select id="modal_country_code" class="form-input" onchange="validateModalPhone()">
              <option value="+91" selected>🇮🇳 +91 (India)</option>
              <option value="+1">🇺🇸 +1 (USA)</option>
              <option value="+44">🇬🇧 +44 (UK)</option>
              <option value="+971">🇦🇪 +971 (UAE)</option>
              <option value="+1">🇨🇦 +1 (Canada)</option>
              <option value="+61">🇦🇺 +61 (Australia)</option>
              <option value="+65">🇸🇬 +65 (Singapore)</option>
              <option value="+49">🇩🇪 +49 (Germany)</option>
              <option value="+966">🇸🇦 +966 (Saudi)</option>
            </select>
            <input type="tel" id="modal_phone" required placeholder="10-digit number" class="form-input" oninput="validateModalPhone()">
          </div>
          <span id="modal_phone_err" style="display: none; color: #ef4444; font-size: 11px; margin-top: 4px; font-weight: 600;">Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).</span>
        </div>

        <div>
          <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px;">Select Service(s) (Multi-Select Available) *</label>
          <div class="service-chips" style="margin-bottom: 8px;">
            {service_chips_html}
          </div>
          <select id="modal_service" class="form-input">
            <option value="">Or choose from dropdown...</option>
            <option value="General Consultation">General Consultation / Trial</option>
            {service_options}
          </select>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px;">Nearby Landmark</label>
            <input type="text" id="modal_landmark" placeholder="Near Temple / Metro" class="form-input">
          </div>
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px;">6-Digit Pincode</label>
            <input type="text" id="modal_pincode" maxlength="6" placeholder="e.g. 110001" class="form-input">
          </div>
        </div>

        <div>
          <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px;">Payment Preference</label>
          <select id="modal_payment_pref" class="form-input">
            <option value="Direct UPI QR (GPay / PhonePe / Paytm)">⚡ Direct UPI QR (GPay / PhonePe / Paytm)</option>
            <option value="Cash on Delivery / Pay at Shop (COD)">💵 Cash on Delivery / Pay at Shop (COD)</option>
            <option value="Pay after Consultation / Service">🤝 Pay after Consultation / Service</option>
          </select>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px;">Preferred Date</label>
            <input type="date" id="modal_date" class="form-input">
          </div>
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px;">Preferred Time</label>
            <select id="modal_time" class="form-input">
              <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
              <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
              <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
            </select>
          </div>
        </div>

        <button type="submit" class="btn-primary" style="margin-top: 10px; width: 100%;">Confirm Appointment Request</button>
      </form>
    </div>
  </div>

  <!-- Floating Call-Now & WhatsApp Lead Action Bar (Mobile - IND-009) -->
  <div class="mobile-sticky-bar">
    <a href="tel:{phone_val}" class="sticky-action-btn btn-call">📞 Call Now</a>
    <a href="{wa_url}" target="_blank" class="sticky-action-btn btn-wa">💬 WhatsApp</a>
    <button onclick="openBookingModal()" class="sticky-action-btn btn-book">⚡ Book / UPI</button>
  </div>

  <!-- Toast Notification -->
  <div id="toast-notice" class="toast-notice">
    <span>✓</span>
    <span id="toast-text">Appointment Request Sent Successfully!</span>
  </div>

  <!-- AOS Animate On Scroll JS Script -->
  <script src="https://unpkg.com/aos@next/dist/aos.js"></script>
  <script>
    try {{
      if (typeof AOS !== 'undefined') {{
        AOS.init({{ duration: 800, once: true }});
      }}
    }} catch(e) {{}}

    // Mobile Hamburger Toggle
    document.getElementById('mobile-toggle').addEventListener('click', function() {{
      document.getElementById('nav-links').classList.toggle('active');
    }});

    // Modal Control
    function openBookingModal(serviceName) {{
      var modal = document.getElementById('booking-modal');
      modal.classList.add('active');
      if (serviceName) {{
        var sel = document.getElementById('modal_service');
        for (var i = 0; i < sel.options.length; i++) {{
          if (sel.options[i].value.indexOf(serviceName) !== -1 || serviceName.indexOf(sel.options[i].value) !== -1) {{
            sel.selectedIndex = i;
            break;
          }}
        }}
      }}
    }}

    function closeBookingModal() {{
      document.getElementById('booking-modal').classList.remove('active');
    }}

    // FAQ Accordion Toggle
    function toggleFaq(el) {{
      var card = el.parentElement;
      card.classList.toggle('open');
    }}

    // Coupon Code Copy (IND-008)
    function copyCouponCode(code) {{
      if (navigator.clipboard && navigator.clipboard.writeText) {{
        navigator.clipboard.writeText(code).then(function() {{
          showToast('📋 Coupon ' + code + ' Copied! 15% discount applied.');
        }}).catch(function() {{
          prompt('Copy coupon code:', code);
        }});
      }} else {{
        prompt('Copy coupon code:', code);
      }}
    }}

    // Bilingual Desi / English Language Toggle (IND-004)
    var currentLang = 'en';
    function toggleLanguage() {{
      var btn = document.getElementById('lang-toggle-btn');
      if (currentLang === 'en') {{
        currentLang = 'hi';
        btn.innerText = '🇬🇧 English';
        document.querySelectorAll('.btn-primary').forEach(function(el) {{
          if (el.innerText.indexOf('Book') !== -1 || el.innerText.indexOf('Touch') !== -1) {{
            el.setAttribute('data-original-text', el.innerText);
            el.innerText = 'अभी संपर्क / बुकिंग करें';
          }}
        }});
        showToast('🇮🇳 भाषा हिन्दी में बदली गई');
      }} else {{
        currentLang = 'en';
        btn.innerText = '🇮🇳 हिन्दी';
        document.querySelectorAll('.btn-primary').forEach(function(el) {{
          var orig = el.getAttribute('data-original-text');
          if (orig) el.innerText = orig;
        }});
        showToast('🇬🇧 Switched back to English');
      }}
    }}

    // Phone Validation for India (+91)
    function validatePhoneInput(countryCode, phoneVal, errElId) {{
      var errEl = document.getElementById(errElId);
      var digits = phoneVal.replace(/\\D/g, '');
      if (countryCode === '+91') {{
        var isValid = (digits.length === 10 && /^[6-9]/.test(digits));
        if (phoneVal.length > 0 && !isValid) {{
          errEl.style.display = 'block';
          return false;
        }} else {{
          errEl.style.display = 'none';
          return true;
        }}
      }} else {{
        if (phoneVal.length > 0 && digits.length < 7) {{
          errEl.innerText = 'Please enter a valid phone number (at least 7 digits).';
          errEl.style.display = 'block';
          return false;
        }} else {{
          errEl.style.display = 'none';
          return true;
        }}
      }}
    }}

    function validateModalPhone() {{
      var code = document.getElementById('modal_country_code').value;
      var phone = document.getElementById('modal_phone').value;
      return validatePhoneInput(code, phone, 'modal_phone_err');
    }}

    function validateContactPhone() {{
      var code = document.getElementById('contact_country_code').value;
      var phone = document.getElementById('contact_mobile').value;
      return validatePhoneInput(code, phone, 'contact_phone_err');
    }}

    function showToast(msg) {{
      var t = document.getElementById('toast-notice');
      document.getElementById('toast-text').innerText = msg;
      t.classList.add('active');
      setTimeout(function() {{ t.classList.remove('active'); }}, 4000);
    }}

    function handleBookingSubmit(e) {{
      e.preventDefault();
      var code = document.getElementById('modal_country_code').value;
      var phone = document.getElementById('modal_phone').value.replace(/\\D/g, '');
      if (code === '+91' && (phone.length !== 10 || !/^[6-9]/.test(phone))) {{
        document.getElementById('modal_phone_err').style.display = 'block';
        alert('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
        return;
      }}
      var name = document.getElementById('modal_name').value;
      var chips = document.querySelectorAll('input[name="service_chip"]:checked');
      var selServices = [];
      for (var i = 0; i < chips.length; i++) {{
        selServices.push(chips[i].value);
      }}
      var ddVal = document.getElementById('modal_service').value;
      if (ddVal && selServices.indexOf(ddVal) === -1) {{
        selServices.push(ddVal);
      }}
      var service = selServices.length > 0 ? selServices.join(', ') : 'General Consultation';
      var dateVal = document.getElementById('modal_date').value || 'Flexible Date';
      var timeVal = document.getElementById('modal_time').value || 'Flexible Time';
      var landmark = document.getElementById('modal_landmark') ? document.getElementById('modal_landmark').value : '';
      var pincode = document.getElementById('modal_pincode') ? document.getElementById('modal_pincode').value : '';
      var paymentPref = document.getElementById('modal_payment_pref') ? document.getElementById('modal_payment_pref').value : 'Direct UPI';

      closeBookingModal();
      showToast('🎉 Appointment Confirmed! Sending email confirmation & WhatsApp...');

      // Automated Booking Confirmation Email dispatch (FEAT-006) - Only dispatches if legitimate Web3Forms key is configured
      var web3Key = "{web3forms_key}";
      if (web3Key && web3Key.length > 5 && web3Key !== "YOUR_ACCESS_KEY_HERE") {{
        try {{
          fetch('https://api.web3forms.com/submit', {{
            method: 'POST',
            headers: {{ 'Content-Type': 'application/json', 'Accept': 'application/json' }},
            body: JSON.stringify({{
              access_key: web3Key,
              subject: 'Confirmed Appointment Booking for {brand_name}',
              customer_name: name,
              customer_phone: code + ' ' + phone,
              services_booked: service,
              preferred_date: dateVal,
              preferred_time: timeVal,
              landmark: landmark,
              pincode: pincode,
              payment_preference: paymentPref
            }})
          }}).catch(function(err){{}});
        }} catch(e){{}}
      }}

      // Desi WhatsApp 1-Click Order / Booking Message Dispatch (IND-002, IND-007, IND-010)
      var waMsg = "🙏 Namaste {brand_name}!\n\n*New Booking & Order Request:*\n" +
        "👤 *Name:* " + name + "\n" +
        "📞 *Phone:* " + code + " " + phone + "\n" +
        "🛍️ *Service/Order:* " + service + "\n" +
        "📅 *Date:* " + dateVal + " (" + timeVal + ")\n" +
        (landmark ? "📍 *Landmark:* " + landmark + "\n" : "") +
        (pincode ? "📮 *Pincode:* " + pincode + "\n" : "") +
        "💳 *Payment Mode:* " + paymentPref;
      var cleanWaNumber = "{clean_wa}";
      if (cleanWaNumber) {{
        var waUrl = "https://wa.me/" + cleanWaNumber + "?text=" + encodeURIComponent(waMsg);
        setTimeout(function() {{
          try {{ window.open(waUrl, '_blank'); }} catch(err) {{}}
        }}, 500);
      }}
      e.target.reset();
    }}

    function handleContactSubmit(e) {{
      e.preventDefault();
      var code = document.getElementById('contact_country_code').value;
      var phone = document.getElementById('contact_mobile').value.replace(/\\D/g, '');
      if (code === '+91' && (phone.length !== 10 || !/^[6-9]/.test(phone))) {{
        document.getElementById('contact_phone_err').style.display = 'block';
        alert('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
        return;
      }}
      var name = document.getElementById('contact_name').value;
      var msg = document.getElementById('contact_msg').value;
      var emailVal = document.getElementById('contact_email_input') ? document.getElementById('contact_email_input').value : '';
      showToast('✉️ Thank you ' + name + '! Dispatching inquiry...');

      // Zero-backend Web3Forms email notification - Only if configured
      var web3Key = "{web3forms_key}";
      if (web3Key && web3Key.length > 5 && web3Key !== "YOUR_ACCESS_KEY_HERE") {{
        try {{
          fetch('https://api.web3forms.com/submit', {{
            method: 'POST',
            headers: {{ 'Content-Type': 'application/json', 'Accept': 'application/json' }},
            body: JSON.stringify({{
              access_key: web3Key,
              subject: 'New Website Lead for {brand_name}',
              name: name,
              phone: code + ' ' + phone,
              email: emailVal,
              message: msg
            }})
          }}).catch(function(e) {{}});
        }} catch(err) {{}}
      }}

      var cleanWaNumber = "{clean_wa}";
      if (cleanWaNumber) {{
        var waContactMsg = "🙏 Namaste {brand_name}!\n*New Website Inquiry*\n👤 *From:* " + name + " (" + code + " " + phone + ")\n💬 *Message:* " + msg;
        var waContactUrl = "https://wa.me/" + cleanWaNumber + "?text=" + encodeURIComponent(waContactMsg);
        setTimeout(function() {{
          try {{ window.open(waContactUrl, '_blank'); }} catch(err) {{}}
        }}, 500);
      }}
      e.target.reset();
    }}
  </script>

  <!-- Lightweight Privacy Analytics Tracking Beacon -->
  <script>
    (function() {{
      try {{
        var siteId = "{website_id or subdomain or brand_name}";
        if (siteId && window.location.protocol.indexOf('http') === 0) {{
          var host = window.location.hostname;
          var isLocal = host === 'localhost' || host === '127.0.0.1';
          var apiUrl = isLocal ? 'http://localhost:8000/api/analytics/track/' + encodeURIComponent(siteId) : 'https://buildmywebsiteai-backend.onrender.com/api/analytics/track/' + encodeURIComponent(siteId);
          fetch(apiUrl, {{
            method: 'POST',
            headers: {{ 'Content-Type': 'application/json' }},
            body: JSON.stringify({{
              path: window.location.pathname || '/',
              referrer: document.referrer || 'direct'
            }})
          }}).catch(function(){{}});
        }}
      }} catch(err){{}}
    }})();
  </script>
</body>
</html>"""

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        zip_file.writestr("style.css", css_content)

        clean_sub = re.sub(r'[^a-zA-Z0-9]+', '', brand_name.lower()) or "mywebsite"
        site_base_url = f"https://{clean_sub}.buildmywebsiteai.site"

        sitemap_urls = []
        if website_type == "multi":
            for p_name in selected_pages:
                file_name = get_page_slug(p_name)
                p_data = pages_dict.get(p_name, {})
                zip_file.writestr(file_name, build_page_html(p_name, p_data))
                priority = "1.0" if file_name == "index.html" else "0.8"
                sitemap_urls.append(f"""  <url>
    <loc>{site_base_url}/{file_name}</loc>
    <changefreq>weekly</changefreq>
    <priority>{priority}</priority>
  </url>""")
        else:
            zip_file.writestr("index.html", build_page_html("Home", page_tree))
            sitemap_urls.append(f"""  <url>
    <loc>{site_base_url}/index.html</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>""")

        # Bundle valid XML Sitemap (FEAT-024)
        sitemap_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{"".join(sitemap_urls)}
</urlset>"""
        zip_file.writestr("sitemap.xml", sitemap_content.strip())

        # Bundle robots.txt referencing the sitemap (FEAT-024)
        robots_content = f"""User-agent: *
Allow: /

Sitemap: {site_base_url}/sitemap.xml
"""
        zip_file.writestr("robots.txt", robots_content)

        # Include beginner-friendly deployment guide PDF inside the zip
        try:
            from app.services.deployment_guide import generate_deployment_guide_pdf_bytes
            guide_pdf_bytes = generate_deployment_guide_pdf_bytes(brand_name)
            zip_file.writestr("HOW_TO_DEPLOY_WEBSITE_FREE.pdf", guide_pdf_bytes)
        except Exception as e:
            print(f"Warning: Failed to generate deployment guide PDF in zip: {e}")

    zip_buffer.seek(0)
    return zip_buffer

