import json
import random
from typing import Dict, Any, List

# High-Resolution Unsplash Image Pools for Web Categories
CATEGORY_IMAGE_POOLS = {
    "Education": [
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1200&q=80"
    ],
    "Fitness": [
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80"
    ],
    "SaaS": [
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
    ],
    "E-Commerce": [
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80"
    ],
    "Restaurant": [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
    ],
    "Healthcare": [
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80"
    ],
    "Real Estate": [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
    ],
    "Portfolio": [
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"
    ],
    "Agency": [
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
    ],
    "Law Firm": [
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80"
    ],
    "Fashion": [
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
    ],
    "Photography": [
        "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80"
    ],
    "Car Rental": [
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80"
    ],
    "Travel": [
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
    ],
    "AI Startup": [
        "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80"
    ],
    "Event": [
        "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80"
    ],
    "Non-Profit": [
        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80"
    ],
    "Gaming": [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80"
    ]
}

def get_theme_colors(theme_name: str, theme_mode: str = "dark") -> Dict[str, str]:
    if theme_mode == "light" or theme_name == "MINIMAL_LIGHT":
        return {
            "bg": "#ffffff",
            "surface": "#f8fafc",
            "primary": "#2563eb",
            "secondary": "#0284c7",
            "text": "#0f172a",
            "muted": "#475569",
            "accent": "#3b82f6",
            "card_bg": "#ffffff",
            "card_border": "#e2e8f0",
            "mode": "light"
        }
    
    themes = {
        "MODERN_DARK": {"bg": "#0f172a", "surface": "#1e293b", "primary": "#6366f1", "secondary": "#ec4899", "text": "#ffffff", "muted": "#94a3b8", "accent": "#38bdf8", "card_bg": "#1e293b", "card_border": "rgba(255,255,255,0.1)", "mode": "dark"},
        "NEON_CYBER": {"bg": "#09090b", "surface": "#18181b", "primary": "#22c55e", "secondary": "#a855f7", "text": "#ffffff", "muted": "#a1a1aa", "accent": "#06b6d4", "card_bg": "#18181b", "card_border": "rgba(255,255,255,0.1)", "mode": "dark"},
        "MINIMAL_LIGHT": {"bg": "#ffffff", "surface": "#f8fafc", "primary": "#2563eb", "secondary": "#0284c7", "text": "#0f172a", "muted": "#475569", "accent": "#3b82f6", "card_bg": "#ffffff", "card_border": "#e2e8f0", "mode": "light"},
        "ELEGANT_GOLD": {"bg": "#0b0f19", "surface": "#111827", "primary": "#eab308", "secondary": "#f97316", "text": "#ffffff", "muted": "#d1d5db", "accent": "#d97706", "card_bg": "#111827", "card_border": "rgba(255,255,255,0.1)", "mode": "dark"},
        "OCEAN_BLUE": {"bg": "#030712", "surface": "#0f172a", "primary": "#0284c7", "secondary": "#06b6d4", "text": "#ffffff", "muted": "#94a3b8", "accent": "#38bdf8", "card_bg": "#0f172a", "card_border": "rgba(255,255,255,0.1)", "mode": "dark"},
        "SUNSET_ORANGE": {"bg": "#180e29", "surface": "#28153f", "primary": "#f97316", "secondary": "#ef4444", "text": "#ffffff", "muted": "#cbd5e1", "accent": "#fbbf24", "card_bg": "#28153f", "card_border": "rgba(255,255,255,0.1)", "mode": "dark"}
    }
    return themes.get(theme_name, themes["MODERN_DARK"])

def get_random_hero_image(category: str) -> str:
    pool = CATEGORY_IMAGE_POOLS.get(category, CATEGORY_IMAGE_POOLS.get("Education"))
    return random.choice(pool)

def get_dynamic_category_preset(category: str, title: str, user_prompt: str = None) -> Dict[str, Any]:
    cat = category.strip()
    safe_title = title if title else f"NextGen {cat}"
    hero_img = get_random_hero_image(cat)

    if cat == "Education":
        badge = "🎓 Premier Learning & Knowledge Academy"
        headlines = [
            f"Unlock Your Full Potential & Master New Skills at {safe_title}",
            f"Empowering Future Leaders & Innovators at {safe_title}",
            f"World-Class Courses & Interactive Learning with {safe_title}"
        ]
        subheadlines = [
            "Interactive video lessons, expert academic instructors, and hands-on projects designed for modern students and professionals.",
            "Gain industry-recognized certifications, study at your own pace, and join a vibrant global learning community."
        ]
        features = [
            {"icon": "BookOpen", "title": "Interactive Course Modules", "description": "Engaging curriculum structured by top educators for maximum retention and practical skills."},
            {"icon": "Award", "title": "Certified Accreditation", "description": "Earn recognized credentials that showcase your expertise to top employers worldwide."},
            {"icon": "Users", "title": "Expert Faculty & Mentors", "description": "Get direct guidance, live Q&A sessions, and feedback from experienced mentors."},
            {"icon": "Laptop", "title": "Learn Anywhere, Any Time", "description": "Seamless cross-device learning platform accessible 24/7 on desktop, tablet, or mobile."}
        ]
    elif cat == "Restaurant":
        badge = "🍽️ Gourmet Culinary Experience"
        headlines = [
            f"Savor Fine Dining & Exquisite Flavors at {safe_title}",
            f"Authentic Artisanal Cuisine & Warm Hospitality at {safe_title}"
        ]
        subheadlines = [
            "Fresh organic ingredients, master chef specialties, and a relaxed ambiance designed for unforgettable dining moments."
        ]
        features = [
            {"icon": "Utensils", "title": "Master Chef Menu", "description": "Handcrafted dishes featuring fresh seasonal ingredients and signature recipes."},
            {"icon": "Wine", "title": "Curated Wine Pairing", "description": "Exclusive wine selections carefully paired to enhance every entree."},
            {"icon": "Clock", "title": "Easy Online Reservations", "description": "Reserve your table online in seconds with instant booking confirmation."}
        ]
    else:
        badge = f"⚡ Welcome to {safe_title}"
        headlines = [
            f"Elevate Your Experience in {cat} with {safe_title}",
            f"Next-Generation Solutions for {cat} at {safe_title}"
        ]
        subheadlines = [
            f"Modern, reliable, and user-friendly platform engineered specifically for peak performance in {cat}."
        ]
        features = [
            {"icon": "Zap", "title": "Simple & Intuitive Design", "description": f"Engineered for clarity and ease of use across all devices in {cat}."},
            {"icon": "ShieldCheck", "title": "Reliable Quality", "description": "Trusted standards designed to deliver consistent results every single day."},
            {"icon": "Sparkles", "title": "Smart Innovations", "description": "Modern tools and features that simplify your daily routine."},
            {"icon": "BarChart3", "title": "Proven Results", "description": "Transparent metrics demonstrating high satisfaction and value."}
        ]

    return {
        "badge": badge,
        "headline": random.choice(headlines),
        "subheadline": random.choice(subheadlines),
        "features": features,
        "hero_image": hero_img
    }


def build_default_page_tree(
    title: str,
    category: str,
    theme: str,
    website_type: str = "single",
    selected_pages: List[str] = None,
    logo_url: str = None,
    contact_email: str = None,
    contact_phone: str = None,
    background_style: str = "live",
    theme_mode: str = "dark",
    user_prompt: str = None
) -> Dict[str, Any]:
    colors = get_theme_colors(theme, theme_mode)
    preset = get_dynamic_category_preset(category, title, user_prompt)
    safe_title = title if title else f"NextGen {category}"
    safe_email = contact_email if contact_email else f"contact@{category.lower().replace(' ', '')}.com"
    safe_phone = contact_phone if contact_phone else "+1 (800) 555-0199"

    pages_list = selected_pages if selected_pages else ["Home", "About Us", "Services", "Contact Us"]
    if "Home" not in pages_list:
        pages_list.insert(0, "Home")

    nav_links = []
    if website_type == "multi":
        for p in pages_list:
            href_val = "index.html" if p == "Home" else f"{p.lower().replace(' ', '_')}.html"
            nav_links.append({"label": p, "href": href_val})
    else:
        nav_links = [
            {"label": "Features", "href": "#features"},
            {"label": "FAQ", "href": "#faq"},
            {"label": "Contact", "href": "#contact"}
        ]

    home_hero = {
        "badge": preset["badge"],
        "headline": preset["headline"],
        "subheadline": preset["subheadline"],
        "primary_cta": "Explore Platform",
        "secondary_cta": "Contact Us",
        "hero_image": preset["hero_image"]
    }

    home_features = {
        "section_badge": "Key Capabilities",
        "section_title": f"Why Choose {safe_title}",
        "section_subtitle": f"Tailored solutions designed specifically for high-impact performance in {category}.",
        "items": preset["features"]
    }

    home_sections = {
        "brand_name": safe_title,
        "tagline": f"The Ultimate {category} Experience",
        "logo_url": logo_url or f"https://api.dicebear.com/7.x/identicon/svg?seed={safe_title}",
        "theme": theme,
        "colors": colors,
        "website_type": website_type,
        "background_style": background_style,
        "selected_pages": pages_list,
        "navbar": {
            "brand": safe_title,
            "links": nav_links,
            "cta_button": "Get Started"
        },
        "hero": home_hero,
        "features": home_features,
        "faq": {
            "section_title": "Frequently Asked Questions",
            "items": [
                {"question": f"How do I get started with {safe_title}?", "answer": "You can reach out through our contact form or get started directly online within minutes."},
                {"question": "Is support available?", "answer": "Yes, our team is available to assist you with any questions or custom requirements."}
            ]
        },
        "cta": {
            "headline": f"Ready to Get Started with {safe_title}?",
            "subheadline": f"Send us a direct message and our team will get back to you immediately.",
            "button_text": "Contact Us Now"
        },
        "footer": {
            "brand": safe_title,
            "description": f"Next-generation {category} website.",
            "contact_email": safe_email,
            "contact_phone": safe_phone,
            "copyright": f"© 2026 {safe_title}. All rights reserved.",
            "credit": "Website built by BuildMyWebsiteAI"
        }
    }

    if website_type == "multi":
        pages_dict = {}
        for p in pages_list:
            if p == "Home":
                pages_dict["Home"] = {
                    "hero": home_hero,
                    "features": home_features
                }
            elif p == "About Us":
                pages_dict["About Us"] = {
                    "hero": {
                        "badge": "💡 Our Mission & Values",
                        "headline": f"About {safe_title}",
                        "subheadline": f"We are dedicated to redefining excellence and simplicity in {category}.",
                        "primary_cta": "Contact Us"
                    },
                    "features": {
                        "section_badge": "Core Principles",
                        "section_title": "What Drives Us",
                        "items": [
                            {"icon": "Heart", "title": "Customer First", "description": "Delivering genuine value and reliable service."},
                            {"icon": "Target", "title": "Continuous Innovation", "description": "Pioneering modern standards in the industry."}
                        ]
                    }
                }
            elif p == "Services" or p == "Services / Features":
                pages_dict["Services"] = {
                    "hero": {
                        "badge": "🛠️ What We Offer",
                        "headline": f"Services at {safe_title}",
                        "subheadline": f"Professional offerings tailored for your unique goals.",
                        "primary_cta": "Get Started"
                    },
                    "features": home_features
                }
            elif p == "Contact Us":
                pages_dict["Contact Us"] = {
                    "hero": {
                        "badge": "📞 Get In Touch",
                        "headline": f"Contact {safe_title}",
                        "subheadline": f"Have a question? Send a message directly to {safe_email}.",
                        "primary_cta": "Send Message"
                    }
                }
            else:
                pages_dict[p] = {
                    "hero": {
                        "badge": f"✨ {p}",
                        "headline": f"{p} - {safe_title}",
                        "subheadline": f"Learn more about {p.lower()} with {safe_title}."
                    }
                }
        home_sections["pages"] = pages_dict

    return home_sections


def generate_website_tree(
    title: str,
    category: str,
    theme: str,
    website_type: str = "single",
    selected_pages: List[str] = None,
    logo_url: str = None,
    contact_email: str = None,
    contact_phone: str = None,
    background_style: str = "live",
    theme_mode: str = "dark",
    user_prompt: str = None
) -> Dict[str, Any]:
    return build_default_page_tree(title, category, theme, website_type, selected_pages, logo_url, contact_email, contact_phone, background_style, theme_mode, user_prompt)


def edit_website_tree(current_tree: Dict[str, Any], instruction: str) -> Dict[str, Any]:
    updated = json.loads(json.dumps(current_tree))
    if "headline" in instruction.lower() or "title" in instruction.lower():
        updated["hero"]["headline"] = instruction
    else:
        updated["hero"]["subheadline"] = f"Updated: {instruction}"
    return updated
