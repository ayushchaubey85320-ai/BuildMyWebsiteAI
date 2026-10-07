import json
import random
import os
import requests
from typing import Dict, Any, List
from app.config.settings import settings

# 12 In-Demand Real-World Categories for Non-Tech Business Owners
CATEGORIES_LIST = [
    "Salon, Spa & Beauty Parlour",
    "Dentist & Medical Healthcare Clinic",
    "Plumbing, Electrician & Home Handyman",
    "Restaurant, Café & Bakery",
    "Real Estate Broker & Property Dealer",
    "Lawyer, Advocate & Legal Consultancy",
    "Auto Repair, Garage & Car Detailing",
    "Fitness Gym, Yoga & Personal Training",
    "Event Management & Wedding Planner",
    "Pet Care, Veterinary & Dog Grooming",
    "Cleaning & Janitorial Services",
    "Coaching Classes, Tuition & Preschool"
]

# Curated High-Definition Photography Pools (Multiple distinct real-life shots per category)
CATEGORY_IMAGE_POOLS = {
    "Salon, Spa & Beauty Parlour": [
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=80"
    ],
    "Dentist & Medical Healthcare Clinic": [
        "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80"
    ],
    "Plumbing, Electrician & Home Handyman": [
        "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1505798577917-a65157d3320a?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80"
    ],
    "Restaurant, Café & Bakery": [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80"
    ],
    "Real Estate Broker & Property Dealer": [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    "Lawyer, Advocate & Legal Consultancy": [
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1505664103604-bb0b37385340?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?auto=format&fit=crop&w=1200&q=80"
    ],
    "Auto Repair, Garage & Car Detailing": [
        "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1507767439269-2c64f107e609?auto=format&fit=crop&w=1200&q=80"
    ],
    "Fitness Gym, Yoga & Personal Training": [
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80"
    ],
    "Event Management & Wedding Planner": [
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80"
    ],
    "Pet Care, Veterinary & Dog Grooming": [
        "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=80"
    ],
    "Cleaning & Janitorial Services": [
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=1200&q=80"
    ],
    "Coaching Classes, Tuition & Preschool": [
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80"
    ]
}

def get_unique_category_image(category: str, seed_offset: int = 0) -> str:
    """Returns a unique, high-resolution image URL with a distinct signature per website."""
    pool = CATEGORY_IMAGE_POOLS.get(category)
    if not pool:
        for k in CATEGORY_IMAGE_POOLS:
            if k.lower() in category.lower() or category.lower() in k.lower():
                pool = CATEGORY_IMAGE_POOLS[k]
                break
    if not pool:
        pool = CATEGORY_IMAGE_POOLS["Salon, Spa & Beauty Parlour"]
    
    base_url = random.choice(pool)
    unique_sig = random.randint(1000, 99999) + seed_offset
    separator = "&" if "?" in base_url else "?"
    return f"{base_url}{separator}sig={unique_sig}"

def get_theme_colors(theme_name: str, theme_mode: str = "light") -> Dict[str, str]:
    themes = {
        "MODERN_DARK": {"bg": "#0f172a", "surface": "#1e293b", "primary": "#6366f1", "secondary": "#ec4899", "text": "#ffffff", "muted": "#94a3b8", "accent": "#38bdf8", "card_bg": "#1e293b", "card_border": "rgba(255,255,255,0.1)", "mode": "dark"},
        "NEON_CYBER": {"bg": "#09090b", "surface": "#18181b", "primary": "#22c55e", "secondary": "#a855f7", "text": "#ffffff", "muted": "#a1a1aa", "accent": "#06b6d4", "card_bg": "#18181b", "card_border": "rgba(255,255,255,0.1)", "mode": "dark"},
        "MINIMAL_LIGHT": {"bg": "#ffffff", "surface": "#f8fafc", "primary": "#2563eb", "secondary": "#0284c7", "text": "#0f172a", "muted": "#475569", "accent": "#ec4899", "card_bg": "#ffffff", "card_border": "#e2e8f0", "mode": "light"},
        "ELEGANT_GOLD": {"bg": "#0b0f19", "surface": "#111827", "primary": "#eab308", "secondary": "#f97316", "text": "#ffffff", "muted": "#d1d5db", "accent": "#d97706", "card_bg": "#111827", "card_border": "rgba(255,255,255,0.1)", "mode": "dark"},
        "OCEAN_BLUE": {"bg": "#030712", "surface": "#0f172a", "primary": "#0284c7", "secondary": "#06b6d4", "text": "#ffffff", "muted": "#94a3b8", "accent": "#38bdf8", "card_bg": "#0f172a", "card_border": "rgba(255,255,255,0.1)", "mode": "dark"},
        "SUNSET_ORANGE": {"bg": "#180e29", "surface": "#28153f", "primary": "#f97316", "secondary": "#ef4444", "text": "#fff7ed", "muted": "#f5d0fe", "accent": "#fbbf24", "card_bg": "#28153f", "card_border": "rgba(255,255,255,0.1)", "mode": "dark"}
    }
    if theme_mode == "light" and theme_name != "MINIMAL_LIGHT":
        dark_theme = themes.get(theme_name, themes["MODERN_DARK"])
        return {
            "bg": "#ffffff", "surface": "#f8fafc", "primary": dark_theme["primary"], "secondary": dark_theme["secondary"], "text": "#0f172a", "muted": "#475569", "accent": dark_theme["accent"], "card_bg": "#ffffff", "card_border": "#e2e8f0", "mode": "light"
        }
    return themes.get(theme_name, themes["MODERN_DARK"])

def get_page_slug(p_name: str) -> str:
    """Returns a clean, valid .html filename slug for any page name."""
    if p_name == "Home":
        return "index.html"
    import re
    clean = re.sub(r'[^a-zA-Z0-9]+', '_', p_name.strip().lower()).strip('_')
    return f"{clean or 'page'}.html"

def synthesize_custom_page_content(
    page_name: str,
    custom_prompt: str,
    safe_title: str,
    cat: str,
    safe_cta: str,
    seed: int = 10
) -> Dict[str, Any]:
    """Generates authentic, rich content tailored specifically to a user's custom page and prompt."""
    prompt_desc = custom_prompt.strip() if custom_prompt else f"Comprehensive insights and dedicated offerings for {page_name}."

    paragraphs = [
        f"Welcome to the {page_name} section of {safe_title}. {prompt_desc}",
        f"At {safe_title}, we believe that transparency, professional expertise, and dedicated attention form the cornerstone of every service we deliver in {cat}.",
        f"Explore our specialized offerings below or connect directly with our specialists to learn more about how {safe_title} can assist you."
    ]

    cards = [
        {"title": f"{page_name} Highlights", "description": prompt_desc[:140] if len(prompt_desc) > 30 else f"Expertly managed {page_name.lower()} designed to meet your specific standards.", "price": "Featured"},
        {"title": "Professional Standards", "description": f"Every aspect of our {page_name.lower()} is delivered by trained specialists with proven industry experience.", "price": "Certified"},
        {"title": "Personalized Guidance", "description": f"Tailored consultation and responsive support to ensure total satisfaction with {safe_title}.", "price": "Dedicated"},
        {"title": "Quality Assurance", "description": f"All services are backed by our commitment to reliability, excellence, and transparent communication.", "price": "Guaranteed"}
    ]

    faqs = [
        {"question": f"What should I know about {page_name} at {safe_title}?", "answer": f"Our {page_name.lower()} is tailored specifically to provide the highest quality results. {prompt_desc}"},
        {"question": f"How can I inquire or get started with {page_name}?", "answer": f"You can reach out using our online booking modal or contact form for an immediate consultation with our team."},
        {"question": f"Are customized options available for {page_name}?", "answer": f"Yes, we provide flexible options tailored to individual client requirements and preferences."}
    ]

    return {
        "hero": {
            "badge": f"✨ {page_name}",
            "headline": f"{page_name} at {safe_title}",
            "subheadline": prompt_desc,
            "primary_cta": safe_cta,
            "secondary_cta": "Contact Us",
            "hero_image": get_unique_category_image(cat, seed_offset=seed)
        },
        "about": {
            "section_badge": f"{page_name} Overview",
            "section_title": f"About Our {page_name}",
            "paragraphs": paragraphs,
            "mission_title": f"Our Standard for {page_name}",
            "mission": f"To deliver outstanding {page_name.lower()} with integrity and passion.",
            "vision_title": f"Our Vision",
            "vision": f"To be the benchmark for excellence in {page_name.lower()}.",
            "image": get_unique_category_image(cat, seed_offset=seed + 1)
        },
        "services": {
            "section_badge": f"Key Offerings",
            "section_title": f"{page_name} Offerings & Details",
            "section_subtitle": f"Carefully curated options tailored to your needs.",
            "items": cards
        },
        "features": {
            "section_badge": "Key Advantages",
            "section_title": f"Why Choose Our {page_name}",
            "section_subtitle": f"Setting the highest standards in {cat}.",
            "items": [
                {"title": "Dedicated Specialists", "description": f"Experienced professionals handling every detail of {page_name.lower()}."},
                {"title": "Transparent Communication", "description": "Honest guidance and clear expectations from start to finish."},
                {"title": "Proven Track Record", "description": f"Trusted by clients and students across the community."}
            ]
        },
        "faq": {
            "section_title": f"Frequently Asked Questions about {page_name}",
            "section_subtitle": f"Helpful answers to guide your decision.",
            "items": faqs
        }
    }

def synthesize_master_prompt_from_json(business_spec: Dict[str, Any]) -> str:
    """
    Synthesizes all business input fields into an expert architectural prompt
    to guide AI creation of a high-converting, authentic local business website.
    """
    biz_name = business_spec.get("business_name") or business_spec.get("title", "Local Service Studio")
    category = business_spec.get("category", "Salon, Spa & Beauty Parlour")
    tagline = business_spec.get("tagline", "")
    services = business_spec.get("primary_services", "")
    service_area = business_spec.get("service_area", "")
    target_audience = business_spec.get("target_audience", "")
    highlights = business_spec.get("key_highlights", "")
    hours = business_spec.get("business_hours", "")
    phone = business_spec.get("contact_phone", "")
    email = business_spec.get("contact_email", "")
    address = business_spec.get("address", "")
    cta = business_spec.get("cta_text", "")
    arch = business_spec.get("website_type", "single")
    pages = business_spec.get("selected_pages", [])
    custom = business_spec.get("prompt", "")

    custom_pages = business_spec.get("custom_pages", [])
    custom_pages_summary = ""
    if custom_pages and isinstance(custom_pages, list):
        items = []
        for cp in custom_pages:
            if isinstance(cp, dict) and cp.get("name"):
                items.append(f"{cp['name']} (Prompt: {cp.get('prompt', 'Dedicated custom page')})")
        if items:
            custom_pages_summary = f"- Custom User-Created Pages: {'; '.join(items)}\n"

    return f"""You are a master Web Designer & Lead Copywriter for {category}.
Synthesize an authentic, high-converting real-life website specification for:
- Business Name: {biz_name}
- Category: {category}
- Tagline: {tagline or f"Premium {category} Care & Services"}
- Core Services: {services or f"Full range of certified professional {category} services"}
- Location & Service Area: {service_area or "Local community & metropolitan area"}
- Target Audience: {target_audience or "Clients seeking reliable, top-tier service"}
- Key Highlights (USPs): {highlights or "Experienced Certified Staff, Modern Equipment, 100% Satisfaction Guarantee"}
- Working Hours: {hours or "Mon - Sat: 9:00 AM - 7:00 PM"}
- Contact Info: Phone: {phone}, Email: {email}, Address: {address}
- Call to Action: {cta or "Book An Appointment Now"}
- Architecture: {arch.upper()} (Pages: {', '.join(pages) if arch == 'multi' else 'Single Page Landing'})
{custom_pages_summary}- Custom Instructions: {custom or "Emphasize friendly customer service, credibility, transparent pricing, and instant booking."}
"""

def call_gemini_ai_content(master_prompt: str, category: str, title: str) -> Dict[str, Any]:
    """Calls Gemini AI if API key is configured to generate rich, context-specific website copy."""
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None

    # Supported and recommended Google Gemini models (fastest first)
    models_to_try = [
        "gemini-3.8-flash",
        "gemini-flash-latest"
    ]
    for model_name in models_to_try:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            headers = {"Content-Type": "application/json"}
            req_payload = {
                "contents": [{
                    "parts": [{
                        "text": (
                            f"{master_prompt}\n\n"
                            "Respond ONLY with a valid JSON object (no markdown, no backticks). Schema:\n"
                            "{\n"
                            '  "badge": "string (short punchy badge)",\n'
                            '  "headline": "string (high-converting hero title)",\n'
                            '  "subheadline": "string (2-3 sentences explaining value proposition)",\n'
                            '  "about_story": ["paragraph 1", "paragraph 2", "paragraph 3"],\n'
                            '  "mission": "string",\n'
                            '  "vision": "string",\n'
                            '  "services": [{"title": "string", "description": "string", "price": "string"}],\n'
                            '  "features": [{"title": "string", "description": "string"}],\n'
                            '  "testimonials": [{"name": "string", "role": "string", "quote": "string"}],\n'
                            '  "faqs": [{"question": "string", "answer": "string"}]\n'
                            "}"
                        )
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "responseMimeType": "application/json"
                }
            }
            resp = requests.post(url, headers=headers, json=req_payload, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                text_body = data['candidates'][0]['content']['parts'][0]['text']
                clean_text = text_body.strip()
                if clean_text.startswith("```json"):
                    clean_text = clean_text[7:]
                if clean_text.startswith("```"):
                    clean_text = clean_text[3:]
                if clean_text.endswith("```"):
                    clean_text = clean_text[:-3]
                parsed = json.loads(clean_text.strip())
                print(f"[SUCCESS] AI website copy generated using {model_name}!")
                return parsed
        except Exception:
            continue
    return None

def get_category_preset(
    category: str,
    title: str,
    primary_services: str = None,
    key_highlights: str = None,
    tagline: str = None,
    service_area: str = None
) -> Dict[str, Any]:
    """Generates authentic, rich content tailored specifically to the chosen category."""
    cat = category.strip()
    safe_title = title if title else f"Elite {cat}"
    hero_image = get_unique_category_image(cat, seed_offset=1)

    # Defaults customized for all 12 non-tech categories
    presets = {
        "Salon, Spa & Beauty Parlour": {
            "badge": "✨ Luxury Styling, Hair & Wellness Sanctuary",
            "headline": f"Reveal Your Best Self at {safe_title}",
            "subheadline": f"Experience award-winning hair styling, rejuvenating skin treatments, bridal makeup, and relaxation in our modern sanctuary{' serving ' + service_area if service_area else ''}.",
            "about_story": [
                f"Welcome to {safe_title}, where passion for beauty meets precision artistry. Founded by certified master stylists, we believe that self-care is a ritual that empowers confidence.",
                "From precision haircuts and custom balayage coloring to soothing organic facials and luxury spa therapies, our expert team utilizes premium, cruelty-free products tailored to your unique hair and skin.",
                "Step into our tranquil, chic salon space, unwind with a complimentary beverage, and leave looking and feeling effortlessly radiant."
            ],
            "mission": "To celebrate individual beauty with artistic craftsmanship, organic care, and unhurried personal attention.",
            "vision": "To be the most trusted salon and wellness destination known for transformational styling and genuine client care.",
            "services": [
                {"title": "Master Haircut & Styling", "description": "Personalized consultation, luxury wash, precision cut, and salon blow-dry.", "price": "From ₹499"},
                {"title": "Custom Balayage & Hair Color", "description": "Hand-painted highlights and dimensional shades with zero-ammonia organic color.", "price": "From ₹2,499"},
                {"title": "Rejuvenating Glow Facial", "description": "Deep pore cleansing, botanical exfoliation, and lymphatic hydration massage.", "price": "₹1,299"},
                {"title": "Luxury Spa Pedicure & Manicure", "description": "Gentle cuticle care, organic sugar scrub, hot towel wrap, and gel polish.", "price": "₹899"},
                {"title": "Keratin Smoothing Therapy", "description": "Frizz-free, sleek, mirror-shine treatment lasting up to 4 months.", "price": "From ₹3,999"},
                {"title": "Bridal & Glam Event Makeup", "description": "HD airbrush makeup and elegant hair design for weddings and special occasions.", "price": "Custom Package"}
            ],
            "features": [
                {"title": "Certified Master Stylists", "description": "Internationally trained artists with 10+ years of trendsetting experience."},
                {"title": "100% Organic Products", "description": "Paraben-free, cruelty-free, luxury botanicals that nurture hair and skin."},
                {"title": "Sanitized Private Suites", "description": "Pristine hygiene standards with sterilized tools for every guest."},
                {"title": "Flexible Online Booking", "description": "Book appointments 24/7 with instant confirmation and reminders."},
                {"title": "Complimentary Refreshments", "description": "Relax with gourmet espresso, herbal teas, and soothing ambiance."},
                {"title": "Satisfaction Guaranteed", "description": "We are dedicated to ensuring you adore your new look every visit."}
            ],
            "testimonials": [
                {"name": "Jessica Miller", "role": "Regular Client", "quote": f"The best salon experience I have ever had! The team at {safe_title} transformed my hair with the most natural balayage."},
                {"name": "Sophia Patel", "role": "Bridal Client", "quote": f"{safe_title} handled my entire wedding party makeup and hair. We all looked breathtaking all night!"},
                {"name": "Emily Carter", "role": "Spa Enthusiast", "quote": "Their Glow Facial took years off my skin. The calm environment and skilled staff make this my monthly sanctuary."}
            ],
            "faqs": [
                {"question": "How do I book an appointment?", "answer": "You can book directly through our online booking button, call us, or send an inquiry. Walk-ins are also welcome subject to availability."},
                {"question": "What hair color brands do you use?", "answer": "We use premium organic, low-ammonia formulas that preserve hair strength and natural shine."},
                {"question": "What is your cancellation policy?", "answer": "We kindly request at least 24 hours notice for cancellations so we can accommodate other guests."},
                {"question": "Do you offer consultations before major treatments?", "answer": "Yes! We offer complimentary 15-minute consultations to discuss color, extensions, or bridal styling."},
                {"question": "Is parking available at the salon?", "answer": "Yes, we provide convenient guest parking right outside our entrance."}
            ]
        },
        "Coaching Classes, Tuition & Preschool": {
            "badge": "📚 Trusted Academic Mentorship & Exam Excellence",
            "headline": f"Empowering Students to Achieve Top Academic Ranks at {safe_title}",
            "subheadline": f"Comprehensive coaching for School Boards, IIT-JEE, NEET, Foundation, and competitive exams with personalized mentoring and proven results{' in ' + service_area if service_area else ''}.",
            "about_story": [
                f"Welcome to {safe_title}, where academic potential transforms into proven success. Founded by passionate educators, our mission is to make learning engaging, structured, and result-oriented.",
                "We provide concept-first classroom coaching, comprehensive study modules, daily doubt-clearing sessions, and regular mock tests tailored for CBSE, ICSE, State Boards, IIT-JEE, and NEET aspirants.",
                "Our small batch sizes ensure that every student receives individual attention, continuous encouragement, and the analytical problem-solving skills needed to excel in competitive environments."
            ],
            "mission": "To inspire intellectual curiosity and empower every student with conceptual clarity, confidence, and discipline to achieve their dream academic careers.",
            "vision": "To be the most reputable and outcome-driven coaching institute celebrated for student success, ethical education, and top academic ranks.",
            "services": [
                {"title": "Class 9th & 10th Foundation & Board Prep", "description": "Core concepts in Science, Mathematics, and English with rigorous board exam practice.", "price": "Annual & Monthly Plans"},
                {"title": "IIT-JEE (Mains & Advanced) Intensive Batch", "description": "High-yield problem solving in Physics, Chemistry, and Mathematics with All-India test series.", "price": "Structured Batches"},
                {"title": "NEET-UG Medical Entrance Program", "description": "NCERT line-by-line Biology, advanced Physics & Chemistry numericals with simulated mock exams.", "price": "Comprehensive Program"},
                {"title": "Class 11th & 12th Senior Secondary Boards", "description": "Thorough coverage of board syllabus, practical lab guidance, and previous 10-year question solving.", "price": "Subject & Combo Batches"},
                {"title": "Daily Doubt Solving & One-on-One Mentoring", "description": "Dedicated doubt-clearing counters where students get personal guidance from faculty.", "price": "Included Free"},
                {"title": "Weekly Mock Tests & Performance Analytics", "description": "Regular computerized assessments with detailed performance insights shared with parents.", "price": "Weekly Schedule"}
            ],
            "features": [
                {"title": "Top Ranker Faculty & Mentors", "description": "Experienced educators from premier universities with a 10+ year track record of producing top scores."},
                {"title": "Small Batch Sizes (Max 25 Students)", "description": "Every student gets personalized attention, seating comfort, and active teacher interaction."},
                {"title": "Comprehensive Printed Study Modules", "description": "Curated theory books, practice question banks, formula sheets, and solved previous papers."},
                {"title": "Regular Parent-Teacher Reviews", "description": "Monthly performance reports, attendance tracking, and parent consultations."},
                {"title": "Air-Conditioned Modern Classrooms", "description": "Ergonomic seating, smart interactive display boards, and peaceful study library."},
                {"title": "Scholarship & Merit Rewards", "description": "Merit-based fee concessions for hardworking and deserving students based on admission tests."}
            ],
            "testimonials": [
                {"name": "Aman Sharma", "role": "Scored 98.4% in 12th Board", "quote": f"The faculty at {safe_title} helped me build solid conceptual foundations in Physics and Math. Their test series was a complete game-changer!"},
                {"name": "Dr. Sunita Verma", "role": "Parent of NEET Aspirant", "quote": f"Enrolling my daughter in {safe_title} was the best decision. The teachers are approachable, caring, and constantly monitor every student's progress."},
                {"name": "Rohan Deshmukh", "role": "JEE Mains Qualified", "quote": f"The daily doubt counters and disciplined study material at {safe_title} gave me the confidence to crack competitive questions easily."}
            ],
            "faqs": [
                {"question": "What curriculum and boards do you cover?", "answer": "We provide coaching for CBSE, ICSE, and State Boards from Classes 8 to 12, along with specialized batches for IIT-JEE and NEET."},
                {"question": "How are doubt-clearing sessions conducted?", "answer": "We hold dedicated doubt classes after regular lectures where students can sit with faculty one-on-one until concepts are crystal clear."},
                {"question": "Do you offer demo classes for new students?", "answer": "Yes! We provide 2 complimentary trial/demo classes so students and parents can experience our teaching quality before enrolling."},
                {"question": "What is the fee payment structure?", "answer": "We offer flexible fee options including monthly installments, quarterly plans, and scholarships based on admission assessments."},
                {"question": "Are mock tests and study materials included in the fee?", "answer": "Yes, all printed modules, assignment sheets, and weekly mock test series are completely included with no hidden fees."}
            ]
        },
        "Fitness Gym, Yoga & Personal Training": {
            "badge": "💪 Premier Fitness, Strength & Holistic Wellness",
            "headline": f"Transform Your Strength & Health at {safe_title}",
            "subheadline": f"State-of-the-art gym equipment, certified personal training, yoga sessions, and custom nutrition plans{' in ' + service_area if service_area else ''}.",
            "about_story": [
                f"Welcome to {safe_title}, your premier fitness and training destination designed to help you unlock your peak physical and mental potential.",
                "Whether your goal is fat loss, muscle building, athletic endurance, or mindful yoga flexibility, our certified trainers provide personalized coaching in a supportive, energizing atmosphere.",
                "Equipped with world-class imported gym equipment, dedicated functional cross-training zones, and clean locker amenities, we make fitness an enjoyable lifestyle habit."
            ],
            "mission": "To empower individuals of all fitness levels to build strength, vitality, and lifelong wellness through science-backed training.",
            "vision": "To be the most motivating and result-oriented fitness hub in the community.",
            "services": [
                {"title": "Strength & Hypertrophy Training", "description": "Free weights, Olympic lifting platforms, and pin-loaded selectorized machines.", "price": "Monthly & Annual"},
                {"title": "One-on-One Certified Personal Coaching", "description": "Customized workout regimens and bi-weekly body composition tracking.", "price": "From ₹3,500/mo"},
                {"title": "High-Intensity HIIT & Functional Cardio", "description": "High-energy calorie-burning group classes designed to boost metabolic endurance.", "price": "Group Pass"},
                {"title": "Mindful Yoga & Flexibility Sessions", "description": "Hatha and Vinyasa yoga flows for posture correction, mobility, and stress reduction.", "price": "Morning & Evening"},
                {"title": "Personalized Nutrition & Diet Planning", "description": "Macro-nutrient balanced meal charts designed for fat loss and muscle gain.", "price": "Included with PT"},
                {"title": "Post-Workout Recovery & Steam Bath", "description": "Relaxation zone with clean steam showers, lockers, and recovery stretching areas.", "price": "All Members"}
            ],
            "features": [
                {"title": "Certified Fitness Coaches", "description": "ACE, ISSA, and ACSM accredited trainers dedicated to proper form and safety."},
                {"title": "Top-Tier Modern Equipment", "description": "Biomechanical machinery, dumbbells up to 50kg, and specialized cardio decks."},
                {"title": "Hygienic & Sanitized Environment", "description": "Spotless workout floors, air purification, and continuous sanitization protocols."},
                {"title": "Flexible Workout Hours", "description": "Open 7 days a week from 6:00 AM to 10:00 PM to fit your busy lifestyle."},
                {"title": "Custom Diet & Macro Tracking", "description": "Tailored nutritional counseling to ensure your hard work translates to results."},
                {"title": "Friendly Welcoming Community", "description": "An encouraging zero-intimidation environment for beginners and athletes alike."}
            ],
            "testimonials": [
                {"name": "Vikram Malhotra", "role": "Member (Lost 14 kg)", "quote": f"The trainers at {safe_title} completely altered my lifestyle. The personalized workout routines and nutrition guidance delivered real, sustainable results."},
                {"name": "Pooja Reddy", "role": "Yoga & Fitness Member", "quote": f"Best gym in the area! Super clean facilities, friendly coaches, and the morning yoga classes give me unmatched energy for the entire day."},
                {"name": "Arjun Nair", "role": "Strength Athlete", "quote": f"{safe_title} has the best heavy lifting gear and power racks in town. The community is supportive and motivating."}
            ],
            "faqs": [
                {"question": "What are your gym operating hours?", "answer": "We are open Monday through Saturday from 6:00 AM to 10:00 PM, and Sundays from 7:00 AM to 8:00 PM."},
                {"question": "Do you provide a free trial workout session?", "answer": "Yes! We offer a 1-day complimentary guest workout pass so you can experience our facility and meet our coaches."},
                {"question": "Are personal trainers available for beginners?", "answer": "Absolutely. All new members receive an initial fitness assessment, machine orientation, and workout blueprint."},
                {"question": "Are shower and locker facilities provided?", "answer": "Yes, we have clean, modern locker rooms with secure storage and hot water showers."},
                {"question": "Can I freeze my membership if I travel?", "answer": "Yes, quarterly and annual memberships come with flexible membership freezing privileges."}
            ]
        },
        "Dentist & Medical Healthcare Clinic": {
            "badge": "🏥 Trusted Family Healthcare & Advanced Dental Care",
            "headline": f"Gentle, Modern Dental & Healthcare at {safe_title}",
            "subheadline": f"Compassionate, high-tech medical and dental care tailored for children, adults, and seniors{' in ' + service_area if service_area else ''}.",
            "about_story": [
                f"At {safe_title}, we are committed to making healthcare and dental visits comfortable, transparent, and anxiety-free. We treat every patient like family.",
                "Equipped with digital low-radiation X-rays, painless ultrasonic dentistry, and dedicated consultation rooms, our board-certified medical staff provides comprehensive preventive, restorative, and aesthetic care.",
                "From routine family cleanings to emergency dental care, we provide personalized treatment plans with clear upfront pricing."
            ],
            "mission": "To provide gentle, accessible, world-class dental and medical care that fosters lifelong health and beautiful smiles.",
            "vision": "To be the community's most recommended clinic recognized for clinical excellence and compassionate patient comfort.",
            "services": [
                {"title": "Comprehensive Dental Exam & Cleaning", "description": "Gentle plaque removal, digital dental imaging, and oral cancer screening.", "price": "From ₹799"},
                {"title": "Pain-Free Root Canal & Restoration", "description": "Gentle, microscopic root therapy to save your natural tooth in one visit.", "price": "From ₹2,499"},
                {"title": "Teeth Whitening & Veneers", "description": "In-office LED whitening up to 8 shades brighter and custom ceramic veneers.", "price": "From ₹4,500"},
                {"title": "Dental Implants & Crowns", "description": "Permanent titanium implants and natural-looking porcelain tooth crowns.", "price": "Custom Quote"},
                {"title": "Pediatric & Family Dentistry", "description": "Fun, friendly dental visits designed to build healthy oral habits in children.", "price": "₹699"},
                {"title": "Same-Day Emergency Dental Care", "description": "Immediate relief for toothaches, chipped teeth, and dental trauma.", "price": "Walk-ins Welcome"}
            ],
            "features": [
                {"title": "Board-Certified Specialists", "description": "Experienced dental surgeons and medical practitioners."},
                {"title": "Pain-Free Modern Technology", "description": "Ultrasonic cleanings, needle-free numbing, and digital diagnostics."},
                {"title": "Transparent Honest Pricing", "description": "No hidden fees, transparent insurance claims, and flexible payment plans."},
                {"title": "Same-Day Emergencies", "description": "Dedicated slots reserved daily for urgent toothaches and injuries."},
                {"title": "Sterile Hospital Grade Hygiene", "description": "Autoclave sterilization and strict infection control protocols."},
                {"title": "Comfort Amenities", "description": "Ceiling screens, headphones, and warm blankets for relaxing visits."}
            ],
            "testimonials": [
                {"name": "David Ross", "role": "Patient of 4 Years", "quote": f"I used to dread going to the dentist, but {safe_title} changed everything. Completely painless and so caring!"},
                {"name": "Maria Gonzalez", "role": "Mother of Two", "quote": "My kids actually look forward to their dental checkups here. The doctors are so gentle and patient."},
                {"name": "Robert Chen", "role": "Dental Implant Patient", "quote": f"Got two dental crowns done at {safe_title}. The fit is perfect, looks totally natural, and saved my bite."}
            ],
            "faqs": [
                {"question": "Do you accept dental insurance?", "answer": "Yes, we accept major health insurance and mediclaim policies and assist with direct claims."},
                {"question": "What should I do in a dental emergency?", "answer": "Call us immediately. We reserve daily emergency appointments for fast same-day pain relief."},
                {"question": "Are dental X-rays safe?", "answer": "Our digital X-rays emit up to 90% less radiation than conventional film and provide instant diagnostic clarity."},
                {"question": "How often should I have my teeth cleaned?", "answer": "We recommend a professional cleaning and checkup every 6 months to prevent decay and gum disease."},
                {"question": "Do you offer sedation for anxious patients?", "answer": "Yes, we offer gentle nitrous oxide (laughing gas) and oral sedation to ensure complete relaxation."}
            ]
        },
        "Plumbing, Electrician & Home Handyman": {
            "badge": "⚡ 24/7 Licensed Emergency Home Repair & Contracting",
            "headline": f"Reliable Plumbing & Electrical Services by {safe_title}",
            "subheadline": f"Fast, licensed, and guaranteed plumbing, electrical, and handyman repairs{' across ' + service_area if service_area else ''}. On time, every time.",
            "about_story": [
                f"{safe_title} was established on a simple promise: show up promptly, diagnose honestly, and fix the issue right the first time.",
                "With fully stocked service vans and certified master tradespeople, we solve urgent plumbing leaks, water heater breakdowns, circuit trips, and fixture upgrades with zero stress.",
                "We provide clear upfront estimates before starting any work, treat your home with total respect, and back every job with a 100% satisfaction guarantee."
            ],
            "mission": "To keep homes and businesses safe, comfortable, and running smoothly with dependable repair craftsmanship.",
            "vision": "To be the #1 trusted local contractor known for honesty, speed, and lasting repairs.",
            "services": [
                {"title": "Emergency Leak & Pipe Repair", "description": "Rapid detection and permanent repair of burst pipes, slab leaks, and drips.", "price": "From ₹499"},
                {"title": "Water Heater Installation & Repair", "description": "Tankless and traditional water heater maintenance, flush, and replacements.", "price": "From ₹799"},
                {"title": "Drain Cleaning & Unclogging", "description": "Clearing stubborn clogs in sinks, showers, main lines, and toilets.", "price": "From ₹599"},
                {"title": "Electrical Panel & Circuit Upgrades", "description": "Breaker repairs, panel upgrades, surge protection, and safety inspections.", "price": "From ₹699"},
                {"title": "Lighting & Ceiling Fan Installation", "description": "Modern recessed LED lighting, chandelier mounting, and outdoor security fixtures.", "price": "From ₹299/point"},
                {"title": "Full Bathroom & Kitchen Handyman Work", "description": "Faucet replacements, sanitary fitting repair, caulking, and fixture mounting.", "price": "Free Estimate"}
            ],
            "features": [
                {"title": "Licensed & Fully Insured", "description": "Certified master plumbers and electricians protecting your home."},
                {"title": "24/7 Rapid Response", "description": "Emergency service technicians ready when you need urgent help."},
                {"title": "Upfront Flat-Rate Pricing", "description": "Know the exact price before work begins—no surprise charges."},
                {"title": "Clean Home Guarantee", "description": "Shoe covers, drop cloths, and full cleanup after every job."},
                {"title": "1-Year Warranty on Repairs", "description": "We stand behind all labor and parts with our ironclad guarantee."},
                {"title": "Fully Stocked Service Vans", "description": "Most repairs completed on the very first visit with zero delay."}
            ],
            "testimonials": [
                {"name": "Mark Stevens", "role": "Homeowner", "quote": f"Our main pipe burst on a Sunday night. {safe_title} arrived in 35 minutes and fixed it cleanly. Lifesavers!"},
                {"name": "Karen Wilson", "role": "Property Manager", "quote": f"{safe_title} manages all plumbing and electrical for our 12 rental units. Honest, punctual, and highly skilled."},
                {"name": "Brian Taylor", "role": "Resident", "quote": "They replaced our old electrical panel and installed water heating. Clean work, great price, and super friendly."}
            ],
            "faqs": [
                {"question": "How quickly can you arrive for an emergency?", "answer": "For urgent plumbing or electrical emergencies, our local technicians typically arrive within 45 to 60 minutes."},
                {"question": "Do you charge extra for weekends or nights?", "answer": "We maintain transparent flat-rate pricing with no hidden surprises, discussed clearly before dispatch."},
                {"question": "Are your technicians licensed and background-checked?", "answer": "Yes, every technician on our team is fully licensed, insured, and thoroughly background-checked."},
                {"question": "Can I get an estimate before the work starts?", "answer": "Absolutely! We inspect the issue and give you a written upfront quote before starting any work."},
                {"question": "What areas do you service?", "answer": f"We proudly serve the entire local metropolitan area and surrounding neighborhoods."}
            ]
        },
        "Restaurant, Café & Bakery": {
            "badge": "🍽️ Artisanal Cuisine, Fresh Bakes & Warm Hospitality",
            "headline": f"Savor Handcrafted Flavors & Memories at {safe_title}",
            "subheadline": f"Farm-fresh ingredients, wood-fired specialties, specialty coffee, and decadent pastries created with love{' in ' + service_area if service_area else ''}.",
            "about_story": [
                f"Welcome to {safe_title}, where culinary passion meets warm community hospitality. Every dish on our menu tells a story of fresh flavors, time-honored recipes, and modern flair.",
                "From our morning bakery ovens serving sourdough bread and buttery croissants to our lively dinner kitchen crafting gourmet plates, we source ingredients from local organic producers.",
                "Whether you are dropping by for a peaceful morning espresso, celebrating a family dinner, or hosting a gathering, our cozy atmosphere and attentive team make every visit memorable."
            ],
            "mission": "To craft heartwarming, delicious meals that bring people together around authentic hospitality.",
            "vision": "To be the beloved neighborhood culinary haven known for quality, freshness, and memorable dining experiences.",
            "services": [
                {"title": "Artisanal Wood-Fired & Specialty Cuisine", "description": "Chef-curated gourmet entrees made with locally sourced organic produce.", "price": "A La Carte"},
                {"title": "Specialty Espresso & Hand-Brewed Coffee", "description": "Single-origin beans roasted to perfection, cold brews, and botanical teas.", "price": "From ₹180"},
                {"title": "Fresh Daily Sourdough & Pastries", "description": "Flaky croissants, sourdough boules, cinnamon brioche, and tea cakes.", "price": "From ₹120"},
                {"title": "Private Dining & Celebration Banquets", "description": "Dedicated indoor and outdoor event spaces for birthdays, anniversaries, and parties.", "price": "Custom Menus"},
                {"title": "Custom Designer Cakes & Patisserie", "description": "Handcrafted celebration cakes, Belgian chocolate ganache, and dessert platters.", "price": "By Order"},
                {"title": "Doorstep Delivery & Gourmet Takeout", "description": "Eco-friendly insulated packaging ensuring restaurant-quality taste at home.", "price": "Available Daily"}
            ],
            "features": [
                {"title": "Farm-to-Table Freshness", "description": "Ingredients sourced daily from trusted local organic farmers."},
                {"title": "Master Chefs & Bakers", "description": "Trained culinary artists with decades of passion for gastronomy."},
                {"title": "Cozy Ambiance & Free Wi-Fi", "description": "Warm interior design, soft lighting, and comfortable seating for work or leisure."},
                {"title": "Hygienic Open Kitchen", "description": "Stringent hygiene protocols and food safety certified operations."},
                {"title": "Vegetarian & Vegan Choices", "description": "Extensive menu options catering to gluten-free, vegan, and healthy diets."},
                {"title": "Instant Online Reservations", "description": "Reserve your favorite table online with instant SMS confirmation."}
            ],
            "testimonials": [
                {"name": "Ananya Sen", "role": "Food Critic & Blogger", "quote": f"The flavors at {safe_title} are exquisite! From the sourdough to the main course, every bite is pure perfection."},
                {"name": "Sameer Joshi", "role": "Regular Guest", "quote": "My favorite weekend spot. The coffee is unmatched, the staff is welcoming, and the atmosphere is so relaxing."},
                {"name": "Kavita Rao", "role": "Celebrated Birthday Party", "quote": f"Hosted our family anniversary at {safe_title}. The custom menu and service were beyond our expectations!"}
            ],
            "faqs": [
                {"question": "Do I need a reservation to dine in?", "answer": "Walk-ins are always warmly welcomed, though we recommend online table reservations for Friday and weekend dinners."},
                {"question": "Do you offer vegan and gluten-free options?", "answer": "Yes! Our menu features clearly marked plant-based, dairy-free, and gluten-sensitive selections."},
                {"question": "How far in advance should I order custom celebration cakes?", "answer": "We kindly ask for at least 24 to 48 hours notice for custom theme cakes and large bakery orders."},
                {"question": "Is outdoor patio seating available?", "answer": "Yes, we offer both air-conditioned indoor dining and a scenic open-air garden seating area."},
                {"question": "Do you cater for corporate and private events?", "answer": "Yes, we provide full-service catering and custom finger food platters for events of all sizes."}
            ]
        },
        "Real Estate Broker & Property Dealer": {
            "badge": "🏡 Verified Properties, Strategic Investments & Prime Real Estate",
            "headline": f"Discover Your Dream Home & Prime Investments with {safe_title}",
            "subheadline": f"Trusted residential and commercial real estate advisory with 100% verified legal titles and zero hidden brokerage stress{' across ' + service_area if service_area else ''}.",
            "about_story": [
                f"{safe_title} is your trusted real estate advisory partner. We believe that buying, selling, or leasing property is one of life's most meaningful financial milestones.",
                "With comprehensive knowledge of prime residential developments, commercial high-streets, and emerging suburban growth corridors, we guide buyers and investors with total transparency.",
                "We conduct thorough 30-year legal title checks, negotiate fair market values, assist with home loans, and handle registration paperwork from start to finish."
            ],
            "mission": "To empower clients with honest real estate intelligence, verified properties, and seamless property acquisition.",
            "vision": "To be the most reliable and customer-centric property consultancy in the region.",
            "services": [
                {"title": "Luxury Residential Apartments & Villas", "description": "Modern gated communities, penthouses, and independent luxury villas.", "price": "Verified Listings"},
                {"title": "Commercial Retail & Office Spaces", "description": "High-footfall retail outlets, corporate suites, and pre-leased income assets.", "price": "High ROI"},
                {"title": "Residential Plots & Land Investment", "description": "Gated plotted developments with clear approvals and high capital appreciation.", "price": "Prime Locations"},
                {"title": "Legal Title Verification & Due Diligence", "description": "Complete 30-year encumbrance search, municipal approvals, and title reports.", "price": "Advisory"},
                {"title": "Home Loan & Financial Assistance", "description": "Tie-ups with leading banks for swift loan sanctions at lowest interest rates.", "price": "Free Assistance"},
                {"title": "Property Valuation & Resale Management", "description": "Accurate comparative market analysis to help sellers close at highest value.", "price": "Fast Closures"}
            ],
            "features": [
                {"title": "100% Verified Legal Documents", "description": "Every property is vetted by legal experts to ensure zero litigation risk."},
                {"title": "Direct Developer Pricing", "description": "Exclusive builder discounts and inaugural launch offers with zero extra markup."},
                {"title": "End-to-End Paperwork Support", "description": "From agreement drafting to stamp duty payment and registry execution."},
                {"title": "Personalized Site Visits", "description": "Complimentary pickup and guided property tours with dedicated advisors."},
                {"title": "High Rental Yield Analysis", "description": "Data-driven investment reports to maximize rental returns and capital growth."},
                {"title": "Post-Purchase Handholding", "description": "Assistance with utility transfers, interior fit-outs, and tenant leasing."}
            ],
            "testimonials": [
                {"name": "Rajesh Singhania", "role": "Apartment Buyer", "quote": f"Found our dream 3BHK through {safe_title}. Their team showed extreme patience, checked all legal documents, and got us an incredible deal."},
                {"name": "Deepak Mehta", "role": "Commercial Investor", "quote": f"Investing in retail property with {safe_title} gave me 9% annual rental yield. Honest guidance with zero fluff."},
                {"name": "Sneha Kulkarni", "role": "First-Time Homeowner", "quote": "As a first-time buyer, the paperwork was daunting. {safe_title} managed everything from loan approval to registration smoothly."}
            ],
            "faqs": [
                {"question": "How do you verify the legality of listed properties?", "answer": "Our legal team verifies the mother deed, land title records, RERA registration, and municipal building sanctions before listing any property."},
                {"question": "Do you charge fees for initial consultations and site visits?", "answer": "No, our initial property consultations and guided site visits are completely complimentary."},
                {"question": "Can you help me secure a bank home loan?", "answer": "Yes, we partner with top public and private banks to ensure quick processing, paper collection, and competitive interest rates."},
                {"question": "Are resale and rental properties also handled?", "answer": "Yes, we have dedicated wings for residential resale, tenant leasing, and commercial retail licensing."},
                {"question": "What is the typical timeline to complete a property purchase?", "answer": "Typically, from site selection to agreement and registration takes between 2 to 4 weeks depending on loan sanction."}
            ]
        },
        "Lawyer, Advocate & Legal Consultancy": {
            "badge": "⚖️ Trusted Legal Counsel, Litigation & Corporate Advisory",
            "headline": f"Defending Your Rights & Protecting Your Interests at {safe_title}",
            "subheadline": f"Strategic legal representation in Civil Litigation, Criminal Defense, Property Disputes, and Corporate Compliance{' in ' + service_area if service_area else ''}.",
            "about_story": [
                f"{safe_title} is a dedicated legal practice built upon unwavering integrity, deep statutory expertise, and steadfast commitment to our clients' justice.",
                "Whether navigating complex commercial contracts, resolving property disputes, or defending rights in trial courts and tribunals, our advocates provide thorough preparation and aggressive representation.",
                "We maintain strict client confidentiality, provide pragmatic legal opinions without confusing jargon, and work tirelessly toward the most favorable legal outcome."
            ],
            "mission": "To provide ethical, fearless, and effective legal advocacy that safeguards our clients' legal and commercial interests.",
            "vision": "To be the most respected law chamber recognized for courtroom excellence and client-first counsel.",
            "services": [
                {"title": "Civil Litigation & Dispute Resolution", "description": "Representation in recovery suits, injunctions, consumer disputes, and contract breaches.", "price": "Consultation"},
                {"title": "Property, Real Estate & Land Disputes", "description": "Title scrutiny, partition suits, tenant-landlord disputes, and boundary conflicts.", "price": "Case Evaluation"},
                {"title": "Corporate Law & Commercial Contracts", "description": "Drafting shareholder agreements, NDAs, employment terms, and regulatory compliance.", "price": "Retainer & Project"},
                {"title": "Family, Matrimonial & Divorce Law", "description": "Compassionate counsel in mediation, mutual divorce, maintenance, and child custody.", "price": "Confidential"},
                {"title": "Criminal Defense & Bail Matters", "description": "Urgent anticipatory bail, trial defense, FIR quashing, and white-collar fraud litigation.", "price": "Urgent Relief"},
                {"title": "Legal Notice Drafting & Reply", "description": "Drafting authoritative legal notices and comprehensive statutory replies.", "price": "Fixed Fee"}
            ],
            "features": [
                {"title": "Decades of Courtroom Experience", "description": "Seasoned advocates appearing before District Courts, High Courts, and Tribunals."},
                {"title": "Strict Client Confidentiality", "description": "Privileged communication and ethical legal standards under Bar Council norms."},
                {"title": "Clear Transparent Legal Fees", "description": "Straightforward fee structures with no unexpected billing or hidden expenses."},
                {"title": "Pragmatic Legal Advice", "description": "Realistic case assessments focused on resolving matters swiftly rather than prolonged disputes."},
                {"title": "Fast Emergency Drafting", "description": "Same-day legal notice dispatch and expedited interim stay applications."},
                {"title": "Regular Case Status Updates", "description": "Proactive updates after every hearing date with certified orders."}
            ],
            "testimonials": [
                {"name": "Vikram Sethi", "role": "Business Director", "quote": f"{safe_title} helped our company resolve an intricate vendor dispute out of court, saving us millions and months of litigation."},
                {"name": "Sunita Agarwal", "role": "Property Owner", "quote": f"Our ancestral land had title complications for a decade. The advocates at {safe_title} cleared the title and secured our rights decisively."},
                {"name": "Gaurav Roy", "role": "Client", "quote": "Honest, reliable, and sharp courtroom presence. They explained the legal nuances simply and stood by me through every hearing."}
            ],
            "faqs": [
                {"question": "How do I schedule an initial consultation?", "answer": "You can book directly through our online form or call our chamber. We offer in-person and secure virtual consultations."},
                {"question": "Is everything I share kept confidential?", "answer": "Yes, all consultations and case materials are protected by legal attorney-client privilege."},
                {"question": "What documents should I bring to our first meeting?", "answer": "Please bring all relevant contracts, notices, email correspondence, court summons, or property deeds related to your issue."},
                {"question": "How are legal fees structured?", "answer": "We offer upfront fixed-fee arrangements for notices and contract drafting, and transparent stage-wise hearing fees for litigation."},
                {"question": "Can you represent clients in High Courts and Tribunals?", "answer": "Yes, our team is qualified and regularly appears before District Courts, High Courts, NCLT, and Consumer Commissions."}
            ]
        },
        "Auto Repair, Garage & Car Detailing": {
            "badge": "🚗 Certified Auto Mechanics & Precision Detailing Studio",
            "headline": f"Complete Automotive Care & Peak Performance by {safe_title}",
            "subheadline": f"Computerized diagnostics, periodic servicing, brake repairs, and ceramic coating by certified auto technicians{' serving ' + service_area if service_area else ''}.",
            "about_story": [
                f"{safe_title} was built by car enthusiasts for drivers who demand excellence. We understand that your vehicle is vital for your daily life and family safety.",
                "Using modern computerized diagnostic scanners, OEM parts, and hydraulic lift bays, our certified technicians service all domestic and imported car models with precision.",
                "Whether you need urgent brake servicing, air conditioning recharge, or showroom-grade ceramic paint protection, we get you safely back on the road with transparent estimates."
            ],
            "mission": "To deliver honest, dealership-grade automotive service with transparent pricing and uncompromised safety.",
            "vision": "To be the most recommended independent auto repair and detailing facility in the city.",
            "services": [
                {"title": "Periodic Service & Multi-Point Inspection", "description": "Synthetic oil change, OEM oil filter, fluid top-ups, and 40-point safety check.", "price": "From ₹1,999"},
                {"title": "Computerized Engine Diagnostics", "description": "Check-engine light scanning, sensor calibration, and electronic fault resolution.", "price": "From ₹799"},
                {"title": "Brake System Repair & Pad Replacement", "description": "Rotor resurfacing, ceramic brake pad replacement, and brake line fluid bleed.", "price": "From ₹1,499"},
                {"title": "Ceramic Coating & Paint Correction", "description": "9H nano-ceramic coating, swirl mark removal, and deep showroom gloss restoration.", "price": "From ₹6,999"},
                {"title": "Car AC Servicing & Gas Recharge", "description": "Cooling coil cleaning, compressor check, cabin pollen filter, and refrigerant top-up.", "price": "From ₹1,299"},
                {"title": "Wheel Alignment & High-Speed Balancing", "description": "Laser 3D alignment, tire rotation, and vibration elimination for smooth driving.", "price": "From ₹499"}
            ],
            "features": [
                {"title": "OEM & Genuine Spares", "description": "We only fit manufacturer-certified authentic replacement parts and lubricants."},
                {"title": "Certified Auto Technicians", "description": "Experienced mechanics trained on modern electronic and mechanical automotive systems."},
                {"title": "Clear Digital Estimates", "description": "Receive detailed photos and cost estimates via SMS/WhatsApp before work starts."},
                {"title": "Warranty on Labor & Parts", "description": "6-month / 10,000 km warranty on all major mechanical repairs."},
                {"title": "Complimentary Pickup & Drop", "description": "Convenient doorstep vehicle pickup and delivery across the city."},
                {"title": "Air-Conditioned Waiting Lounge", "description": "Comfortable lounge with high-speed Wi-Fi, coffee, and live bay viewing."}
            ],
            "testimonials": [
                {"name": "Abhishek Roy", "role": "Car Enthusiast", "quote": f"Did a full periodic service and 9H ceramic coating at {safe_title}. The car looks better than when I bought it from the showroom!"},
                {"name": "Priya Sharma", "role": "Daily Commuter", "quote": f"My car had a strange engine knocking noise that the dealer could not fix. {safe_title} diagnosed the bad sensor in 20 minutes. Honest and fast!"},
                {"name": "Harish Patel", "role": "SUV Owner", "quote": "Transparent pricing, polite staff, and clean garage. They showed me the old parts before replacing them. Highly trusted."}
            ],
            "faqs": [
                {"question": "How often should I service my vehicle?", "answer": "We recommend a periodic inspection and oil change every 10,000 kilometers or every 12 months, whichever comes first."},
                {"question": "Do you offer doorstep pickup and drop off?", "answer": "Yes, we provide complimentary vehicle pickup and drop service within our local service radius."},
                {"question": "Will servicing my car at an independent garage void my warranty?", "answer": "No, we use OEM parts and manufacturer-specified fluids which maintain your vehicle's warranty coverage."},
                {"question": "How long does a full periodic service take?", "answer": "Most standard periodic services are completed within 3 to 4 hours with prior booking."},
                {"question": "Do you provide roadside assistance for breakdowns?", "answer": "Yes, we offer emergency battery jump-starts, flat tire repair, and towing assistance across the city."}
            ]
        },
        "Event Management & Wedding Planner": {
            "badge": "🎉 Flawless Celebrations, Luxury Weddings & Corporate Galas",
            "headline": f"Crafting Unforgettable Moments & Celebrations with {safe_title}",
            "subheadline": f"Bespoke wedding planning, corporate events, milestone birthdays, and luxury decor production tailored to perfection{' in ' + service_area if service_area else ''}.",
            "about_story": [
                f"At {safe_title}, we transform your dream events into breathtaking realities. We believe every milestone celebration deserves impeccable elegance, emotion, and flawless execution.",
                "From intimate beachside wedding vows and royal heritage palace ceremonies to high-profile corporate conferences and anniversary galas, our creative team curates every detail.",
                "We orchestrate venue selection, exquisite floral themes, sound and lighting engineering, gourmet catering, and artist bookings so you can relax and cherish every moment."
            ],
            "mission": "To orchestrate stress-free, magical, and unforgettable celebrations with innovative design and hospitality.",
            "vision": "To be the leading luxury event curation company renowned for creativity, precision, and heartfelt service.",
            "services": [
                {"title": "Full-Service Luxury Wedding Planning", "description": "Theme design, guest hospitality, Sangeet choreography, and bridal coordination.", "price": "Custom Package"},
                {"title": "Bespoke Floral Decor & Stage Styling", "description": "Grand mandaps, fairy-light canopies, floral arches, and designer table centerpieces.", "price": "Custom Concepts"},
                {"title": "Corporate Conferences & Product Launches", "description": "Audio-visual staging, LED backdrops, keynote setup, and corporate banquets.", "price": "Turnkey Packages"},
                {"title": "Milestone Birthdays & Anniversary Galas", "description": "Creative themes, personalized props, DJ entertainment, and custom cocktail bars.", "price": "Curated Experiences"},
                {"title": "Artist, Live Band & Celebrity Booking", "description": "Live musical bands, anchors, celebrity performers, and choreographers.", "price": "Direct Rates"},
                {"title": "Gourmet Catering & Mixology Management", "description": "Live food stations, multi-cuisine banquets, and signature welcome drinks.", "price": "Per Plate Packages"}
            ],
            "features": [
                {"title": "Dedicated On-Site Event Directors", "description": "Experienced managers handling ground coordination from dawn to midnight."},
                {"title": "3D Visual Set Previews", "description": "View 3D digital renderings of your stage and venue before production begins."},
                {"title": "Vendor Quality & Cost Guarantees", "description": "Negotiated rates with leading venues, caterers, and lighting vendors with zero markups."},
                {"title": "Seamless Guest Hospitality", "description": "Airport transfers, luxury hotel check-in desks, and guest hampers."},
                {"title": "Contingency & Weather Preparedness", "description": "Backup power, waterproof canopies, and emergency protocols for zero hiccups."},
                {"title": "Sustainable Eco-Friendly Choices", "description": "Biodegradable decor, digital invites, and zero-food-waste community partnerships."}
            ],
            "testimonials": [
                {"name": "Karan & Tanya Kapoor", "role": "Newlyweds", "quote": f"{safe_title} organized our 3-day destination wedding with over 400 guests. Not a single glitch! Our guests are still raving about the decor and warmth."},
                {"name": "Ritu Singhal", "role": "Corporate VP", "quote": f"Our annual company global summit was planned by {safe_title}. The stage production, sound, and keynote execution were world-class."},
                {"name": "Aditya Mehra", "role": "Host of 50th Anniversary", "quote": "The team took away all our stress and delivered pure magic. The lighting, music, and food were spectacular."}
            ],
            "faqs": [
                {"question": "How early should we start planning our wedding?", "answer": "For large weddings and popular venue dates, we recommend engaging us 6 to 9 months in advance, though we also execute short-notice events."},
                {"question": "Can you work within our pre-defined budget?", "answer": "Yes! We specialize in optimizing your budget to maximize visual impact and guest hospitality without unnecessary expenditures."},
                {"question": "Do you travel for destination weddings?", "answer": "Yes, we plan destination weddings across prime palaces, beach resorts, and international celebration hubs."},
                {"question": "Can we bring our own caterer or florist?", "answer": "Absolutely. We are flexible and can seamlessly coordinate with your preferred family vendors."},
                {"question": "What is the process to get started?", "answer": "Contact us via the form or phone to set up a preliminary concept discussion and received a tailored mood board."}
            ]
        },
        "Pet Care, Veterinary & Dog Grooming": {
            "badge": "🐾 Compassionate Veterinary Care & Gentle Pet Grooming",
            "headline": f"Loving Healthcare & Pampering for Your Pets at {safe_title}",
            "subheadline": f"Gentle veterinary checkups, vaccination, luxury bath & haircut, and safe boarding for your furry family members{' in ' + service_area if service_area else ''}.",
            "about_story": [
                f"At {safe_title}, we love your pets as much as you do. We believe every dog, cat, and furry companion deserves gentle, compassionate, and stress-free care.",
                "From preventive vaccines and wellness exams to warm hydro-bath grooming and organic coat styling, our certified veterinarians and groomers handle pets with patience and affection.",
                "Our facility features fear-free examination rooms, sanitized grooming tubs, and a secure play lounge where pets feel calm, comfortable, and cherished."
            ],
            "mission": "To deliver affectionate, gentle, and modern pet healthcare that keeps your companions joyful and healthy.",
            "vision": "To be the community's favorite pet wellness sanctuary where every pet feels at home.",
            "services": [
                {"title": "Comprehensive Veterinary Wellness Exams", "description": "Preventive checkups, weight management, vitals monitoring, and ear/eye health.", "price": "From ₹499"},
                {"title": "Core Vaccinations & Deworming", "description": "Rabies, DHPP, feline vaccines, and seasonal flea/tick preventative treatments.", "price": "From ₹599"},
                {"title": "Luxury Hydro-Bath & De-Shedding", "description": "Organic hypoallergenic shampoo, warm blow dry, deep de-shedding, and brush out.", "price": "From ₹799"},
                {"title": "Breed-Specific Haircuts & Styling", "description": "Custom teddy cut, summer trims, sanitary hygiene trims, and paw-pad shaving.", "price": "From ₹999"},
                {"title": "Pet Dental Care & Ultrasonic Scaling", "description": "Plaque removal, tartar control, gum health check, and fresh breath polish.", "price": "From ₹1,499"},
                {"title": "Daycare & Cage-Free Boarding", "description": "Air-conditioned secure play rooms, supervised fun, and live camera updates.", "price": "Daily Rates"}
            ],
            "features": [
                {"title": "Fear-Free Certified Staff", "description": "Gentle handling techniques designed to minimize stress and anxiety for anxious pets."},
                {"title": "100% Organic Coat Care", "description": "Tearless, sulfate-free, and natural shampoos safe for sensitive pet skin."},
                {"title": "Licensed Veterinary Doctors", "description": "Experienced clinicians available for health diagnoses and nutritional guidance."},
                {"title": "Hospital-Grade Hygiene", "description": "Sanitized grooming tables, sterilized clippers, and fresh towels for each pet."},
                {"title": "Live Video Updates for Boarding", "description": "Receive daily photos and videos of your pet playing happily while you are away."},
                {"title": "Emergency First Aid Support", "description": "Equipped with diagnostic equipment and emergency wound care capabilities."}
            ],
            "testimonials": [
                {"name": "Pooja Hegde", "role": "Golden Retriever Mom", "quote": f"My dog Bruno usually hates baths, but at {safe_title} he was wagging his tail the entire time! His coat is super soft and fresh."},
                {"name": "Dr. Sandeep Nair", "role": "Pet Parent", "quote": f"The veterinarians at {safe_title} are genuinely caring. They accurately diagnosed my cat's allergy and explained the diet plan clearly."},
                {"name": "Shalini Gupta", "role": "Shih Tzu Owner", "quote": "Best grooming salon in town! The teddy bear haircut was done so neatly without any stress. Highly recommended!"}
            ],
            "faqs": [
                {"question": "How often should my dog be professionally groomed?", "answer": "For most breeds, professional grooming every 4 to 6 weeks maintains coat hygiene and prevents painful mats."},
                {"question": "Do you accept aggressive or anxious pets?", "answer": "Yes, our groomers and vets use positive reinforcement and gentle pacing. We never use sedation for standard grooming."},
                {"question": "What vaccinations are required before boarding?", "answer": "For the safety of all pets, we require up-to-date core vaccinations (Rabies, DHPP, and Bordetella kennel cough)."},
                {"question": "Do I need an appointment for grooming?", "answer": "We recommend booking in advance to avoid waiting, though walk-in nail trims and basic baths are accommodated when available."},
                {"question": "What products do you use for sensitive skin?", "answer": "We use aloe-vera, oatmeal, and hypoallergenic veterinary formulas that soothe itchy and sensitive skin."}
            ]
        },
        "Cleaning & Janitorial Services": {
            "badge": "✨ Deep Home Sanitization & Commercial Janitorial Specialists",
            "headline": f"Spotless, Sanitized & Sparkling Spaces by {safe_title}",
            "subheadline": f"Professional deep home cleaning, office janitorial services, sofa shampooing, and kitchen degreasing{' across ' + service_area if service_area else ''}.",
            "about_story": [
                f"{safe_title} delivers spotless perfection for homes, apartments, and corporate offices. We understand that a clean environment fosters health, peace of mind, and productivity.",
                "Using hospital-grade disinfectants, German HEPA industrial vacuum cleaners, and eco-friendly cleaning agents, our uniformed, background-checked crews tackle stubborn grime with precision.",
                "From move-in deep cleaning and post-construction scrubbing to daily commercial janitorial maintenance, we leave every corner gleaming with a fresh, sanitized fragrance."
            ],
            "mission": "To provide dependable, immaculate cleaning services that create healthy and uplifting living and working spaces.",
            "vision": "To be the most trustworthy and efficient cleaning service provider known for attention to detail.",
            "services": [
                {"title": "Full House Deep Cleaning", "description": "Floor scrubbing, ceiling cobwebs, door/window glass, and thorough dust elimination.", "price": "From ₹2,499"},
                {"title": "Modular Kitchen Deep Degreasing", "description": "Exhaust fan, chimney degreasing, tile scrubbing, cabinet interiors, and countertop shine.", "price": "From ₹1,199"},
                {"title": "Bathroom Sanitization & Scale Removal", "description": "Hard water stain removal from tiles, glass partitions, taps, and sanitaryware disinfection.", "price": "From ₹699/bath"},
                {"title": "Sofa, Carpet & Mattress Steam Cleaning", "description": "High-powered extraction, dust-mite removal, and stain shampooing.", "price": "From ₹899"},
                {"title": "Corporate Office Janitorial Maintenance", "description": "Daily or scheduled cleaning of workstations, meeting rooms, pantry, and restrooms.", "price": "Monthly Contract"},
                {"title": "Move-In & Post-Construction Cleanup", "description": "Paint splatter removal, cement residue scrubbing, and thorough polish before occupancy.", "price": "Custom Estimate"}
            ],
            "features": [
                {"title": "Trained & Verified Cleaning Staff", "description": "Police-verified, insured, and thoroughly trained crew in uniform."},
                {"title": "Eco-Friendly Safe Cleaners", "description": "Non-toxic, kid-friendly, and pet-safe botanical cleaning solutions."},
                {"title": "Heavy-Duty Modern Equipment", "description": "Single-disc floor scrubbers, steam machines, and HEPA vacuums."},
                {"title": "100% Re-Clean Guarantee", "description": "If you are not delighted with any area, we re-clean it immediately with no questions asked."},
                {"title": "Transparent Upfront Rates", "description": "Standardized pricing based on room size and property layout—no surprises."},
                {"title": "Flexible Scheduling", "description": "Available 7 days a week, including weekend and holiday time slots."}
            ],
            "testimonials": [
                {"name": "Siddharth Jain", "role": "Apartment Resident", "quote": f"{safe_title} did a move-in deep cleaning for our 3BHK flat. The bathrooms and kitchen look brand new. Worth every rupee!"},
                {"name": "Meera Nambiar", "role": "Office Admin Manager", "quote": f"Our corporate office has never been cleaner. {safe_title} provides daily janitorial maintenance with complete punctuality and discretion."},
                {"name": "Anil Saxena", "role": "Homeowner", "quote": "Their sofa shampooing removed years of stains from our living room couch. Smells fresh and looks amazing!"}
            ],
            "faqs": [
                {"question": "Do I need to provide any cleaning supplies or equipment?", "answer": "No! Our team arrives fully equipped with specialized machines, vacuum cleaners, microfiber mops, and cleaning chemicals."},
                {"question": "How long does a deep house cleaning take?", "answer": "Depending on the apartment size, a comprehensive deep clean typically takes between 3 to 6 hours with a 3-4 person crew."},
                {"question": "Are the chemicals safe for children and pets?", "answer": "Yes, we prioritize non-corrosive, eco-friendly, and odorless cleaning agents that are safe for everyone in your family."},
                {"question": "Can I leave the cleaning team unattended?", "answer": "Yes, all our cleaners are background-checked and vetted. You can inspect the premises at the end of the service."},
                {"question": "How soon can you schedule a service?", "answer": "We often offer next-day scheduling, and same-day slots are available for urgent requests."}
            ]
        }
    }

    # Match category or fallback safely
    matched_preset = None
    for k, v in presets.items():
        if k.lower() in cat.lower() or cat.lower() in k.lower():
            matched_preset = v
            break
    
    if not matched_preset:
        matched_preset = presets.get("Salon, Spa & Beauty Parlour")

    base = json.loads(json.dumps(matched_preset))

    # Replace business title safely
    base["headline"] = base["headline"].replace("{safe_title}", safe_title)
    if "{safe_title}" in base["subheadline"]:
        base["subheadline"] = base["subheadline"].replace("{safe_title}", safe_title)

    # Dynamic service area insertion
    if service_area and service_area not in base["subheadline"]:
        base["subheadline"] = f"{base['subheadline']} Serving {service_area}."

    # Override with user's inputs if provided
    if tagline:
        base["subheadline"] = f"{tagline} — {base['subheadline']}"
    if primary_services:
        custom_items = [s.strip() for s in primary_services.split(",") if s.strip()]
        if custom_items:
            new_services = []
            for idx, item in enumerate(custom_items[:6]):
                new_services.append({
                    "title": item,
                    "description": f"Professional {item.lower()} provided with expert care and guaranteed quality at {safe_title}.",
                    "price": "Custom Quote"
                })
            base["services"] = new_services
    if key_highlights:
        custom_feats = [f.strip() for f in key_highlights.split(",") if f.strip()]
        if custom_feats:
            new_feats = []
            for f in custom_feats[:6]:
                new_feats.append({
                    "title": f,
                    "description": f"We take pride in {f.lower()}, ensuring top quality for all our clients."
                })
            base["features"] = new_feats

    base["hero_image"] = hero_image
    return base

def generate_website_tree(
    title: str,
    category: str = "Salon, Spa & Beauty Parlour",
    theme: str = "MODERN_DARK",
    website_type: str = "single",
    selected_pages: List[str] = None,
    logo_url: str = None,
    contact_email: str = None,
    contact_phone: str = None,
    background_style: str = "live",
    theme_mode: str = "light",
    user_prompt: str = None,
    tagline: str = None,
    primary_services: str = None,
    service_area: str = None,
    target_audience: str = None,
    key_highlights: str = None,
    business_hours: str = None,
    address: str = None,
    cta_text: str = None,
    business_spec_json: Dict[str, Any] = None,
    custom_pages: List[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Main website tree generation engine.
    1. Converts inputs into structured JSON.
    2. Synthesizes an expert master prompt with custom pages and prompts.
    3. Calls Gemini AI (if available) or uses customized category presets.
    4. Generates rich multi-page structures with user-defined custom pages and prompts.
    """
    safe_title = title.strip() if title else "Studio Brand"
    cat = category.strip() if category else "Salon, Spa & Beauty Parlour"
    colors = get_theme_colors(theme, theme_mode)

    # Extract user-defined custom pages
    custom_page_prompts = {}
    if custom_pages and isinstance(custom_pages, list):
        for cp in custom_pages:
            if isinstance(cp, dict) and cp.get("name"):
                custom_page_prompts[cp["name"].strip()] = cp.get("prompt", "").strip()
    elif business_spec_json and isinstance(business_spec_json.get("custom_pages"), list):
        for cp in business_spec_json.get("custom_pages"):
            if isinstance(cp, dict) and cp.get("name"):
                custom_page_prompts[cp["name"].strip()] = cp.get("prompt", "").strip()

    # 1. Package Business Specification JSON
    business_spec = business_spec_json or {
        "business_name": safe_title,
        "category": cat,
        "tagline": tagline or "",
        "primary_services": primary_services or "",
        "service_area": service_area or "",
        "target_audience": target_audience or "",
        "key_highlights": key_highlights or "",
        "business_hours": business_hours or "Mon - Sat: 9:00 AM - 7:00 PM",
        "contact_phone": contact_phone or "+1 (800) 555-0199",
        "contact_email": contact_email or "contact@example.com",
        "address": address or f"120 Main Street, {cat} Plaza",
        "cta_text": cta_text or "Book An Appointment",
        "website_type": website_type,
        "selected_pages": selected_pages or ["Home", "About Us", "Services", "Contact Us"],
        "custom_pages": [{"name": k, "prompt": v} for k, v in custom_page_prompts.items()],
        "theme": theme,
        "theme_mode": theme_mode,
        "background_style": background_style,
        "prompt": user_prompt or ""
    }

    # 2. Synthesize Master Prompt
    master_prompt = synthesize_master_prompt_from_json(business_spec)

    # 3. Attempt Gemini AI Generation with Fallback to Industry Preset
    ai_content = call_gemini_ai_content(master_prompt, cat, safe_title)
    preset = get_category_preset(
        category=cat,
        title=safe_title,
        primary_services=primary_services,
        key_highlights=key_highlights,
        tagline=tagline,
        service_area=service_area
    )

    # Blend Gemini AI outputs if returned, otherwise use the rich preset
    badge = ai_content.get("badge") if ai_content and ai_content.get("badge") else preset["badge"]
    headline = ai_content.get("headline") if ai_content and ai_content.get("headline") else preset["headline"]
    subheadline = ai_content.get("subheadline") if ai_content and ai_content.get("subheadline") else preset["subheadline"]
    about_paragraphs = ai_content.get("about_story") if ai_content and isinstance(ai_content.get("about_story"), list) else preset["about_story"]
    mission = ai_content.get("mission") if ai_content and ai_content.get("mission") else preset["mission"]
    vision = ai_content.get("vision") if ai_content and ai_content.get("vision") else preset["vision"]
    services_items = ai_content.get("services") if ai_content and isinstance(ai_content.get("services"), list) else preset["services"]
    features_items = ai_content.get("features") if ai_content and isinstance(ai_content.get("features"), list) else preset["features"]
    testimonials_items = ai_content.get("testimonials") if ai_content and isinstance(ai_content.get("testimonials"), list) else preset["testimonials"]
    faqs_items = ai_content.get("faqs") if ai_content and isinstance(ai_content.get("faqs"), list) else preset["faqs"]

    safe_phone = contact_phone or "+1 (800) 555-0199"
    safe_email = contact_email or "info@example.com"
    safe_address = address or f"120 Main Street, Suite 200, {cat} District"
    safe_hours = business_hours or "Mon - Sat: 9:00 AM - 7:00 PM | Sun: Closed"
    safe_cta = cta_text or "Book An Appointment"

    pages_list = list(selected_pages) if isinstance(selected_pages, list) and selected_pages else ["Home", "About Us", "Services", "Contact Us"]
    if "Home" not in pages_list:
        pages_list.insert(0, "Home")

    # Add any custom pages to pages_list if not present
    for cp_name in custom_page_prompts:
        if cp_name not in pages_list:
            pages_list.append(cp_name)

    # 4. Construct Navigation Links based on Architecture (Single vs Multi)
    if website_type == "multi":
        nav_links = []
        for p in pages_list:
            slug = get_page_slug(p)
            nav_links.append({"label": p, "href": slug})
    else:
        nav_links = [
            {"label": "Home", "href": "#home"},
            {"label": "About Us", "href": "#about"},
            {"label": "Services", "href": "#services"},
            {"label": "Features", "href": "#features"},
            {"label": "FAQ", "href": "#faq"},
            {"label": "Contact Us", "href": "#contact"}
        ]

    hero_section = {
        "badge": badge,
        "headline": headline,
        "subheadline": subheadline,
        "primary_cta": safe_cta,
        "secondary_cta": "Contact Us",
        "hero_image": preset["hero_image"]
    }

    about_section = {
        "section_badge": "Our Story & Commitment",
        "section_title": f"About {safe_title}",
        "paragraphs": about_paragraphs,
        "mission_title": "Our Mission",
        "mission": mission,
        "vision_title": "Our Vision",
        "vision": vision,
        "image": get_unique_category_image(cat, seed_offset=2)
    }

    services_section = {
        "section_badge": "Specialties & Offerings",
        "section_title": "Our Professional Services",
        "section_subtitle": f"High-quality, certified solutions delivered with care at {safe_title}.",
        "items": services_items
    }

    features_section = {
        "section_badge": "Why Clients Choose Us",
        "section_title": f"Why Choose {safe_title}",
        "section_subtitle": f"Dedicated to setting the standard for quality and service in {cat}.",
        "items": features_items
    }

    faq_section = {
        "section_title": "Frequently Asked Questions",
        "section_subtitle": "Clear, honest answers to help you plan your visit or service.",
        "items": faqs_items
    }

    testimonials_section = {
        "section_title": "Real Client Reviews",
        "section_subtitle": f"See why clients throughout the area love and recommend {safe_title}.",
        "items": testimonials_items
    }

    contact_section = {
        "section_badge": "Get In Touch",
        "section_title": "Contact & Visit Us",
        "section_subtitle": f"We are here to answer questions and schedule your appointment with {safe_title}.",
        "contact_email": safe_email,
        "contact_phone": safe_phone,
        "address": safe_address,
        "business_hours": safe_hours,
        "form_title": f"Send a Message to {safe_title}",
        "cta_text": safe_cta
    }

    home_sections = {
        "brand_name": safe_title,
        "tagline": tagline or f"Premium {cat} Services",
        "logo_url": logo_url or f"https://api.dicebear.com/7.x/identicon/svg?seed={safe_title}",
        "theme": theme,
        "colors": colors,
        "website_type": website_type,
        "background_style": background_style,
        "selected_pages": pages_list,
        "custom_pages": [{"name": k, "prompt": v} for k, v in custom_page_prompts.items()],
        "business_spec": business_spec,
        "synthesized_prompt": master_prompt,
        "navbar": {
            "brand": safe_title,
            "links": nav_links,
            "cta_button": safe_cta
        },
        "hero": hero_section,
        "about": about_section,
        "services": services_section,
        "features": features_section,
        "faq": faq_section,
        "testimonials": testimonials_section,
        "contact": contact_section,
        "cta": {
            "headline": f"Ready to Experience the Best in {cat}?",
            "subheadline": f"Connect with {safe_title} today. We look forward to serving you!",
            "button_text": safe_cta
        },
        "footer": {
            "brand": safe_title,
            "description": f"Professional {cat} serving local clients with pride.",
            "contact_email": safe_email,
            "contact_phone": safe_phone,
            "address": safe_address,
            "business_hours": safe_hours,
            "copyright": f"© 2026 {safe_title}. All rights reserved.",
            "credit": "Website crafted by BuildMyWebsiteAI"
        }
    }

    # 5. Build Dedicated Multi-Page Structures If Selected
    if website_type == "multi":
        pages_dict = {}
        for idx, p in enumerate(pages_list):
            if p == "Home":
                pages_dict["Home"] = {
                    "hero": hero_section,
                    "about": about_section,
                    "services": services_section,
                    "features": features_section,
                    "testimonials": testimonials_section,
                    "contact": contact_section
                }
            elif p == "About Us":
                pages_dict["About Us"] = {
                    "hero": {
                        "badge": "📖 Our Background & Story",
                        "headline": f"Get to Know {safe_title}",
                        "subheadline": f"Discover our history, values, and devotion to outstanding {cat}.",
                        "primary_cta": safe_cta,
                        "hero_image": get_unique_category_image(cat, seed_offset=3)
                    },
                    "about": about_section,
                    "features": features_section,
                    "testimonials": testimonials_section,
                    "contact": contact_section
                }
            elif p == "Services" or p == "Services / Features":
                pages_dict["Services"] = {
                    "hero": {
                        "badge": "🛠️ Professional Care & Options",
                        "headline": f"Services Offered at {safe_title}",
                        "subheadline": "Explore our comprehensive offerings and affordable pricing options.",
                        "primary_cta": safe_cta,
                        "hero_image": get_unique_category_image(cat, seed_offset=4)
                    },
                    "services": services_section,
                    "faq": faq_section,
                    "contact": contact_section
                }
            elif p == "Contact Us":
                pages_dict["Contact Us"] = {
                    "hero": {
                        "badge": "📞 We Are Here To Help",
                        "headline": f"Connect With {safe_title}",
                        "subheadline": f"Call us at {safe_phone} or visit our location at {safe_address}.",
                        "primary_cta": "Send Message",
                        "hero_image": get_unique_category_image(cat, seed_offset=5)
                    },
                    "contact": contact_section,
                    "faq": faq_section
                }
            elif p == "Pricing" or p == "Pricing / Plans":
                pages_dict[p] = {
                    "hero": {
                        "badge": "💰 Transparent Pricing",
                        "headline": f"Transparent Pricing at {safe_title}",
                        "subheadline": "Honest rates with no surprises. Choose the right package for you.",
                        "primary_cta": safe_cta,
                        "hero_image": get_unique_category_image(cat, seed_offset=6)
                    },
                    "services": services_section,
                    "faq": faq_section,
                    "contact": contact_section
                }
            elif p == "FAQ" or p == "FAQ Page":
                pages_dict[p] = {
                    "hero": {
                        "badge": "❓ Frequently Asked Questions",
                        "headline": f"Questions Answered by {safe_title}",
                        "subheadline": "Everything you need to know about our services, booking, and policies.",
                        "primary_cta": "Ask a Question",
                        "hero_image": get_unique_category_image(cat, seed_offset=7)
                    },
                    "faq": faq_section,
                    "contact": contact_section
                }
            else:
                # Custom User-Created Page with its specific prompt!
                custom_prompt_text = custom_page_prompts.get(p, "")
                pages_dict[p] = synthesize_custom_page_content(
                    page_name=p,
                    custom_prompt=custom_prompt_text,
                    safe_title=safe_title,
                    cat=cat,
                    safe_cta=safe_cta,
                    seed=idx + 10
                )
                pages_dict[p]["contact"] = contact_section
        home_sections["pages"] = pages_dict

    return home_sections

def edit_website_tree(current_tree: Dict[str, Any], instruction: str) -> Dict[str, Any]:
    """Updates the website tree based on user prompt instruction."""
    updated = json.loads(json.dumps(current_tree))
    if "headline" in instruction.lower() or "title" in instruction.lower():
        updated["hero"]["headline"] = instruction
    elif "service" in instruction.lower():
        if "services" in updated and "items" in updated["services"]:
            updated["services"]["items"].insert(0, {
                "title": f"Special Offer: {instruction[:30]}",
                "description": instruction,
                "price": "Featured"
            })
    else:
        updated["hero"]["subheadline"] = f"{instruction}"
    return updated
