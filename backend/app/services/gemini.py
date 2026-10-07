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
- Custom Instructions: {custom or "Emphasize friendly customer service, credibility, transparent pricing, and instant booking."}
"""

def call_gemini_ai_content(master_prompt: str, category: str, title: str) -> Dict[str, Any]:
    """Calls Gemini AI if API key is configured to generate rich, context-specific website copy."""
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None

    models_to_try = [
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash",
        "gemini-2.0-flash-exp",
        "gemini-pro"
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
            resp = requests.post(url, headers=headers, json=req_payload, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                text_body = data['candidates'][0]['content']['parts'][0]['text']
                # Strip markdown fences if present
                clean_text = text_body.strip()
                if clean_text.startswith("```json"):
                    clean_text = clean_text[7:]
                if clean_text.startswith("```"):
                    clean_text = clean_text[3:]
                if clean_text.endswith("```"):
                    clean_text = clean_text[:-3]
                parsed = json.loads(clean_text.strip())
                print(f"[GEMINI AI SUCCESS] AI website copy generated using {model_name}!")
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
            "badge": "✨ Luxury Styling, Hair & Wellness Experience",
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
                {"title": "Master Haircut & Styling", "description": "Personalized consultation, luxury wash, precision cut, and salon blow-dry.", "price": "From $45"},
                {"title": "Custom Balayage & Hair Color", "description": "Hand-painted highlights and dimensional shades with zero-ammonia organic color.", "price": "From $120"},
                {"title": "Rejuvenating Glow Facial", "description": "Deep pore cleansing, botanical exfoliation, and lymphatic hydration massage.", "price": "$85"},
                {"title": "Luxury Spa Pedicure & Manicure", "description": "Gentle cuticle care, organic sugar scrub, hot towel wrap, and gel polish.", "price": "$65"},
                {"title": "Keratin Smoothing Therapy", "description": "Frizz-free, sleek, mirror-shine treatment lasting up to 4 months.", "price": "$150"},
                {"title": "Bridal & Glam Event Makeup", "description": "HD airbrush makeup and elegant hair design for weddings and special occasions.", "price": "Custom Quote"}
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
                {"question": "How do I book an appointment?", "answer": "You can book directly through our online button, call us, or send an email. Walk-ins are also welcome subject to availability."},
                {"question": "What hair color brands do you use?", "answer": "We use premium organic, low-ammonia Italian and French salon formulas that preserve hair strength and shine."},
                {"question": "What is your cancellation policy?", "answer": "We kindly request at least 24 hours notice for cancellations so we can accommodate other guests."},
                {"question": "Do you offer consultations before major treatments?", "answer": "Yes! We offer complimentary 15-minute consultations to discuss color, extensions, or bridal styling."},
                {"question": "Is parking available at the salon?", "answer": "Yes, we provide convenient guest parking right outside our entrance."}
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
                {"title": "Comprehensive Dental Exam & Cleaning", "description": "Gentle plaque removal, digital dental imaging, and oral cancer screening.", "price": "$90"},
                {"title": "Pain-Free Root Canal & Restoration", "description": "Gentle, microscopic root therapy to save your natural tooth in one visit.", "price": "From $250"},
                {"title": "Teeth Whitening & Veneers", "description": "In-office LED whitening up to 8 shades brighter and custom ceramic veneers.", "price": "From $180"},
                {"title": "Dental Implants & Crowns", "description": "Permanent titanium implants and natural-looking porcelain tooth crowns.", "price": "Custom Quote"},
                {"title": "Pediatric & Family Dentistry", "description": "Fun, friendly dental visits designed to build healthy oral habits in children.", "price": "$75"},
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
                {"question": "Do you accept dental insurance?", "answer": "Yes, we accept most major dental insurance plans and handle direct billing on your behalf."},
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
                {"title": "Emergency Leak & Pipe Repair", "description": "Rapid detection and permanent repair of burst pipes, slab leaks, and drips.", "price": "From $85"},
                {"title": "Water Heater Installation & Repair", "description": "Tankless and traditional water heater maintenance, flush, and replacements.", "price": "From $150"},
                {"title": "Drain Cleaning & Hydro-Jetting", "description": "Clearing stubborn clogs in sinks, showers, main sewer lines, and toilets.", "price": "$95"},
                {"title": "Electrical Panel & Circuit Upgrades", "description": "Breaker repairs, 200A panel upgrades, surge protection, and safety inspections.", "price": "From $120"},
                {"title": "Lighting & Ceiling Fan Installation", "description": "Modern recessed LED lighting, chandelier mounting, and outdoor security fixtures.", "price": "$75/fixture"},
                {"title": "Full Bathroom & Kitchen Handyman Work", "description": "Faucet replacements, garbage disposal repair, caulking, and fixture mounting.", "price": "Free Estimate"}
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
                {"name": "Brian Taylor", "role": "Resident", "quote": "They replaced our old electrical panel and installed tankless water heating. Clean work, great price, and super friendly."}
            ],
            "faqs": [
                {"question": "How quickly can you arrive for an emergency?", "answer": "For urgent plumbing or electrical emergencies, our local technicians typically arrive within 45 to 60 minutes."},
                {"question": "Do you charge extra for weekends or nights?", "answer": "We maintain transparent flat-rate pricing with no hidden surprises, discussed clearly before dispatch."},
                {"question": "Are your technicians licensed and background-checked?", "answer": "Yes, every technician on our team is fully licensed, insured, and thoroughly background-checked."},
                {"question": "Can I get an estimate before the work starts?", "answer": "Absolutely! We inspect the issue and give you a written upfront quote before starting any work."},
                {"question": "What areas do you service?", "answer": f"We proudly serve the entire local metropolitan area and surrounding neighborhoods."}
            ]
        }
    }

    # If category is one of the specific presets, use it; otherwise create tailored preset
    if cat in presets:
        base = presets[cat]
    else:
        # Fallback tailored preset for any non-tech category
        base = {
            "badge": f"⭐ Premier {cat} Services",
            "headline": f"Excellence & Trusted Quality at {safe_title}",
            "subheadline": f"Dedicated {cat} solutions built for reliability, outstanding customer care, and lasting results{' in ' + service_area if service_area else ''}.",
            "about_story": [
                f"Welcome to {safe_title}, your dependable neighborhood provider for professional {cat}.",
                "Founded on principles of integrity, unmatched craftsmanship, and personal attention, we treat every client with the dedication they deserve.",
                "Whether you require routine service or customized solutions, our experienced specialists deliver prompt, guaranteed results."
            ],
            "mission": f"To deliver outstanding {cat} that enriches the lives of our clients through dependable service.",
            "vision": f"To be the most trusted and recommended {cat} provider in the community.",
            "services": [
                {"title": f"Signature {cat} Service", "description": "Comprehensive, professional care tailored to your specific requirements.", "price": "Standard Rate"},
                {"title": "Custom Consultation & Assessment", "description": "In-depth review of your needs with transparent pricing options.", "price": "Free Estimate"},
                {"title": "Express Care & Rapid Turnaround", "description": "Priority scheduling to address your urgent requests promptly.", "price": "Priority Rate"},
                {"title": "Seasonal Maintenance Package", "description": "Preventive checkups and ongoing care for maximum peace of mind.", "price": "Save 15%"},
                {"title": "Premium Deluxe Experience", "description": "All-inclusive service with dedicated specialist attention.", "price": "Best Value"},
                {"title": "Emergency & On-Demand Support", "description": "Rapid response assistance whenever you need dependable help.", "price": "Available 24/7"}
            ],
            "features": [
                {"title": "Certified Professionals", "description": f"Skilled experts with years of hands-on experience in {cat}."},
                {"title": "Upfront Honest Pricing", "description": "Clear quotations with no hidden fees or surprise costs."},
                {"title": "Client-First Care", "description": "Friendly, responsive communication from start to finish."},
                {"title": "Quality Guarantee", "description": "All services backed by our 100% satisfaction commitment."},
                {"title": "Convenient Scheduling", "description": "Easy online booking and flexible appointment slots."},
                {"title": "Local Community Reputation", "description": "Proudly serving local families and businesses with stellar reviews."}
            ],
            "testimonials": [
                {"name": "Sarah Jenkins", "role": "Verified Customer", "quote": f"Outstanding experience with {safe_title}! Professional, on time, and exceeded all expectations."},
                {"name": "Michael Brown", "role": "Local Resident", "quote": f"I highly recommend {safe_title} to anyone looking for genuine quality and friendly service."},
                {"name": "Amanda White", "role": "Satisfied Client", "quote": f"Top-tier service from start to finish. The team at {safe_title} went above and beyond!"}
            ],
            "faqs": [
                {"question": f"What services does {safe_title} offer?", "answer": f"We provide a comprehensive range of {cat} services tailored to individual and business needs."},
                {"question": "How can I book an appointment?", "answer": "You can book directly via our online form, call us, or send an email for an instant confirmation."},
                {"question": "Do you provide free estimates?", "answer": "Yes, we are happy to provide free, no-obligation estimates before starting any service."},
                {"question": "What payment methods do you accept?", "answer": "We accept all major credit cards, debit cards, cash, and digital mobile payments."},
                {"question": "What are your business hours?", "answer": "Our team is available Monday through Saturday with flexible appointments and emergency support."}
            ]
        }

    # Override with user's inputs if provided
    if tagline:
        base["subheadline"] = f"{tagline} — {base['subheadline']}"
    if primary_services:
        # User specified custom services in form
        custom_items = [s.strip() for s in primary_services.split(",") if s.strip()]
        if custom_items:
            new_services = []
            for idx, item in enumerate(custom_items[:6]):
                new_services.append({
                    "title": item,
                    "description": f"Professional {item.lower()} provided with expert care and guaranteed satisfaction at {safe_title}.",
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
    business_spec_json: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Main website tree generation engine.
    1. Converts inputs into structured JSON.
    2. Synthesizes an expert master prompt.
    3. Calls Gemini AI (if available) or uses customized category presets.
    4. Separates Single-Page and Multi-Page architectures with distinct HTML routes.
    """
    safe_title = title.strip() if title else "Studio Brand"
    cat = category.strip() if category else "Salon, Spa & Beauty Parlour"
    colors = get_theme_colors(theme, theme_mode)

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

    pages_list = selected_pages if isinstance(selected_pages, list) and selected_pages else ["Home", "About Us", "Services", "Contact Us"]
    if "Home" not in pages_list:
        pages_list.insert(0, "Home")

    # 4. Construct Navigation Links based on Architecture (Single vs Multi)
    if website_type == "multi":
        nav_links = []
        for p in pages_list:
            slug = "index.html" if p == "Home" else f"{p.lower().replace(' ', '_')}.html"
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
        for p in pages_list:
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
                    "testimonials": testimonials_section
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
                    "faq": faq_section
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
                    "services": services_section
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
                pages_dict[p] = {
                    "hero": {
                        "badge": f"✨ {p}",
                        "headline": f"{p} - {safe_title}",
                        "subheadline": f"Learn more about {p.lower()} with {safe_title}.",
                        "primary_cta": safe_cta,
                        "hero_image": get_unique_category_image(cat, seed_offset=8)
                    }
                }
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
