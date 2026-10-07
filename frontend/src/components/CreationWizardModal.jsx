import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Upload, Mail, Phone, Palette, Layout, 
  ArrowRight, Layers, CheckSquare, Square, MonitorPlay, Sun, Moon,
  MapPin, Clock, Tag, Target, Award, Code, Eye, ChevronDown, ChevronUp, Check
} from 'lucide-react';

export const NON_TECH_CATEGORIES = [
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
];

const THEMES = [
  { id: "MODERN_DARK", name: "Modern Slate", bg: "bg-slate-900", border: "border-sky-500", accent: "from-cyan-400 to-pink-400" },
  { id: "NEON_CYBER", name: "Neon Cyber", bg: "bg-zinc-950", border: "border-emerald-500", accent: "from-emerald-400 to-purple-500" },
  { id: "MINIMAL_LIGHT", name: "Minimal Light", bg: "bg-slate-100 text-slate-900", border: "border-blue-500", accent: "from-slate-800 to-blue-600" },
  { id: "ELEGANT_GOLD", name: "Elegant Gold", bg: "bg-gray-950", border: "border-yellow-500", accent: "from-yellow-400 to-amber-600" },
  { id: "OCEAN_BLUE", name: "Ocean Blue", bg: "bg-slate-950", border: "border-sky-500", accent: "from-sky-400 to-blue-600" },
  { id: "SUNSET_ORANGE", name: "Sunset Orange", bg: "bg-purple-950", border: "border-orange-500", accent: "from-orange-400 to-pink-600" },
];

const AVAILABLE_PAGES = [
  { id: "Home", label: "Home Page (index.html)", required: true },
  { id: "About Us", label: "About Us (about_us.html)", required: false },
  { id: "Services", label: "Services (services.html)", required: false },
  { id: "Pricing", label: "Pricing / Plans (pricing.html)", required: false },
  { id: "FAQ", label: "FAQ Page (faq.html)", required: false },
  { id: "Contact Us", label: "Contact Us (contact_us.html)", required: false }
];

const CATEGORY_DEFAULTS = {
  "Salon, Spa & Beauty Parlour": {
    tagline: "Luxury Hair Styling, Rejuvenating Facials & Bridal Artistry",
    services: "Precision Haircut, Balayage Color, Keratin Smoothing, Hydra Facial, Gel Manicure & Pedicure, Bridal Makeup",
    audience: "Women, Men, Brides-to-be, and Local Professionals",
    area: "Downtown & Surrounding Metropolitan Area",
    highlights: "10+ Years Experience, Cruelty-Free Organic Products, Master Certified Stylists, Walk-ins & Appointments Welcome",
    cta: "Book Appointment Now",
    hours: "Tue - Sat: 9:00 AM - 8:00 PM | Sun: 10:00 AM - 5:00 PM"
  },
  "Dentist & Medical Healthcare Clinic": {
    tagline: "Gentle, State-of-the-Art Family Dental & Preventive Healthcare",
    services: "Teeth Cleaning, Cosmetic Veneers, Dental Implants, Root Canal Therapy, Invisalign Clear Aligners, Emergency Care",
    audience: "Families, Children, Seniors, and Working Adults",
    area: "Central City & Greater Valley Region",
    highlights: "Painless Dental Tech, Board-Certified Specialists, Digital 3D X-Rays, Most Insurances Accepted",
    cta: "Schedule Your Consultation",
    hours: "Mon - Fri: 8:00 AM - 6:00 PM | Sat: 9:00 AM - 2:00 PM"
  },
  "Plumbing, Electrician & Home Handyman": {
    tagline: "24/7 Rapid Emergency Plumbing & Certified Electrical Services",
    services: "Burst Pipe Repair, Drain Cleaning, Water Heater Replacement, Electrical Panel Upgrades, Fixture Installations",
    audience: "Homeowners, Property Managers, Landlords, and Commercial Tenants",
    area: "Tri-County Area & 30-Mile Service Radius",
    highlights: "Licensed & Insured, 60-Minute Rapid Response, Upfront Transparent Pricing, 100% Satisfaction Guarantee",
    cta: "Call for Instant Dispatch",
    hours: "24/7 Emergency Service | Office: Mon - Sat 8:00 AM - 7:00 PM"
  },
  "Restaurant, Café & Bakery": {
    tagline: "Artisan Flavors, Farm-to-Table Dining & Handcrafted Pastries",
    services: "All-Day Brunch, Wood-Fired Pizza, Handcrafted Coffee, Custom Celebration Cakes, Private Event Catering",
    audience: "Foodies, Families, Local Brunch Seekers, and Event Hosts",
    area: "Old Town Historic District",
    highlights: "Farm-Fresh Local Ingredients, Scratch-Made Daily, Outdoor Patio Seating, Vegan & Gluten-Free Options",
    cta: "Reserve a Table",
    hours: "Tue - Sun: 8:00 AM - 10:00 PM | Mon: Closed"
  },
  "Real Estate Broker & Property Dealer": {
    tagline: "Premier Residential Buying, Selling & Investment Advisory",
    services: "Home Valuation, Luxury Property Listings, First-Time Buyer Advisory, Rental Property Management, Commercial Brokerage",
    audience: "Home Sellers, Prospective Buyers, Real Estate Investors",
    area: "Prime Metro Districts & Suburbs",
    highlights: "$50M+ in Closed Sales, Complimentary Home Valuation, Professional Drone Staging, Top 1% Producer",
    cta: "Request Free Home Valuation",
    hours: "Mon - Sat: 9:00 AM - 7:00 PM | Sun: By Appointment"
  },
  "Lawyer, Advocate & Legal Consultancy": {
    tagline: "Trusted Legal Counsel, Aggressive Advocacy & Clear Guidance",
    services: "Estate Planning, Family Law, Business Formation, Contract Review, Personal Injury Litigation, Civil Disputes",
    audience: "Individuals, Small Business Owners, Families",
    area: "Statewide Legal Practice",
    highlights: "20+ Years Courtroom Experience, Free Initial Case Evaluation, Proven Record of Favorable Verdicts, Confidential & Dedicated",
    cta: "Request Confidential Consultation",
    hours: "Mon - Fri: 8:30 AM - 5:30 PM"
  },
  "Auto Repair, Garage & Car Detailing": {
    tagline: "Complete Mechanical Repairs, Computer Diagnostics & Ceramic Detailing",
    services: "Brake Replacement, Transmission Service, Oil & Filter Change, Engine Diagnostics, Ceramic Coating & Paint Correction",
    audience: "Car Owners, Fleet Operators, Luxury Vehicle Enthusiasts",
    area: "South Metro Area & Surrounding Suburbs",
    highlights: "ASE-Certified Master Technicians, 24-Month / 24,000-Mile Warranty, Free Digital Multi-Point Inspection, Same-Day Turnaround",
    cta: "Book Auto Service",
    hours: "Mon - Fri: 7:30 AM - 6:00 PM | Sat: 8:00 AM - 3:00 PM"
  },
  "Fitness Gym, Yoga & Personal Training": {
    tagline: "Transform Your Body & Mind With Expert Coaching & Community",
    services: "1-on-1 Personal Training, High-Intensity Interval Classes, Vinyasa Yoga, Functional Strength, Nutrition Coaching",
    audience: "Beginners, Athletes, Weight Loss Seekers, Fitness Enthusiasts",
    area: "Eastside Fitness Corridor",
    highlights: "State-of-the-Art Equipment, Certified Strength Coaches, Luxury Locker Rooms with Saunas, Free 3-Day Trial Pass",
    cta: "Claim Free 3-Day Trial",
    hours: "Mon - Fri: 5:00 AM - 10:00 PM | Sat - Sun: 7:00 AM - 8:00 PM"
  },
  "Event Management & Wedding Planner": {
    tagline: "Unforgettable Weddings, Seamless Corporate Galas & Milestone Celebrations",
    services: "Full-Service Wedding Planning, Day-of Coordination, Corporate Conferences, Floral & Scenic Design, Vendor Management",
    audience: "Engaged Couples, Corporate Executives, Milestone Celebrants",
    area: "Destination & Regional Venues",
    highlights: "Featured in Top Bridal Magazines, 150+ Successful Events, Bespoke Tailored Packages, Stress-Free Timeline Management",
    cta: "Schedule Planning Call",
    hours: "Tue - Sat: 9:00 AM - 6:00 PM"
  },
  "Pet Care, Veterinary & Dog Grooming": {
    tagline: "Compassionate Veterinary Care, Pampered Grooming & Luxury Boarding",
    services: "Full-Service Dog & Cat Grooming, Wellness Vaccinations, Dental Cleanings, Doggy Daycare, Overnight Boarding Suites",
    audience: "Dog & Cat Owners, Pet Parents",
    area: "Northside Neighborhoods",
    highlights: "Fear-Free Certified Staff, Climate-Controlled Play Arenas, Natural Shampoos, 24/7 Webcams for Boarding",
    cta: "Book Pet Appointment",
    hours: "Mon - Sat: 8:00 AM - 6:30 PM | Sun: 10:00 AM - 4:00 PM"
  },
  "Cleaning & Janitorial Services": {
    tagline: "Spotless Residential Housekeeping & Commercial Janitorial Services",
    services: "Deep House Cleaning, Regular Maid Visits, Move-In / Move-Out Cleans, Commercial Office Janitorial, Post-Construction Detailing",
    audience: "Busy Homeowners, Office Managers, Real Estate Agents",
    area: "Greater Metropolitan Area",
    highlights: "Eco-Friendly Non-Toxic Supplies, 100% Bonded & Insured Staff, Background Checked, Flexible Recurring Schedules",
    cta: "Get Instant Cleaning Quote",
    hours: "Mon - Sat: 7:30 AM - 7:00 PM"
  },
  "Coaching Classes, Tuition & Preschool": {
    tagline: "Inspiring Academic Excellence, STEM Mastery & Nurturing Early Growth",
    services: "Math & Science Tutoring, SAT/ACT Test Prep, Early Childhood Preschool, Coding for Kids, Homework Help Club",
    audience: "Students (Grades K-12), Parents, College Applicants",
    area: "West End Community & Schools",
    highlights: "Certified School Teachers, Small Class Sizes (Max 8), 98% Grade Improvement Rate, Free Skill Assessment",
    cta: "Book Free Assessment",
    hours: "Mon - Fri: 9:00 AM - 7:30 PM | Sat: 9:00 AM - 2:00 PM"
  }
};

const CreationWizardModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [category, setCategory] = useState(NON_TECH_CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [primaryServices, setPrimaryServices] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [keyHighlights, setKeyHighlights] = useState('');
  const [businessHours, setBusinessHours] = useState('');
  const [address, setAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [ctaText, setCtaText] = useState('');

  const [theme, setTheme] = useState(THEMES[0].id);
  const [themeMode, setThemeMode] = useState('light');
  const [websiteType, setWebsiteType] = useState('single');
  const [backgroundStyle, setBackgroundStyle] = useState('live');
  const [selectedPages, setSelectedPages] = useState(["Home", "About Us", "Services", "Pricing", "Contact Us"]);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFileName, setLogoFileName] = useState('');
  const [prompt, setPrompt] = useState('');

  const [showJsonPromptPreview, setShowJsonPromptPreview] = useState(false);

  const validatePhoneDigits = (digits, code = countryCode) => {
    const cleanDigits = (digits || '').replace(/\D/g, '');
    if (code === '+91') {
      if (cleanDigits.length === 0) {
        setPhoneError('');
        return true;
      }
      if (cleanDigits.length !== 10 || !['6', '7', '8', '9'].includes(cleanDigits[0])) {
        setPhoneError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
        return false;
      }
      setPhoneError('');
      return true;
    } else {
      if (cleanDigits.length > 0 && cleanDigits.length < 7) {
        setPhoneError('Please enter a valid phone number (at least 7 digits).');
        return false;
      }
      setPhoneError('');
      return true;
    }
  };

  const handleCountryCodeChange = (newCode) => {
    setCountryCode(newCode);
    validatePhoneDigits(mobileNumber, newCode);
  };

  const handleMobileInput = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setMobileNumber(val);
    validatePhoneDigits(val, countryCode);
  };

  // Auto-fill defaults when category changes if fields are empty
  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    const def = CATEGORY_DEFAULTS[newCat];
    if (def) {
      if (!tagline) setTagline(def.tagline);
      if (!primaryServices) setPrimaryServices(def.services);
      if (!targetAudience) setTargetAudience(def.audience);
      if (!serviceArea) setServiceArea(def.area);
      if (!keyHighlights) setKeyHighlights(def.highlights);
      if (!ctaText) setCtaText(def.cta);
      if (!businessHours) setBusinessHours(def.hours);
    }
  };

  const togglePage = (pageId) => {
    if (pageId === "Home") return;
    if (selectedPages.includes(pageId)) {
      setSelectedPages(selectedPages.filter(p => p !== pageId));
    } else {
      setSelectedPages([...selectedPages, pageId]);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const effectivePhone = mobileNumber ? `${countryCode} ${mobileNumber}` : (contactPhone.trim() || `${countryCode} 9876543210`);

  // Convert inputs into clean Business Specification JSON
  const businessSpecJson = useMemo(() => {
    return {
      business_name: title.trim() || "Local Service Specialist",
      category: category,
      tagline: tagline.trim(),
      primary_services: primaryServices.trim(),
      target_audience: targetAudience.trim(),
      service_area: serviceArea.trim(),
      key_highlights: keyHighlights.trim(),
      business_hours: businessHours.trim(),
      address: address.trim(),
      contact_phone: effectivePhone,
      contact_email: contactEmail.trim(),
      cta_text: ctaText.trim() || "Book An Appointment",
      website_architecture: websiteType === 'multi' ? 'multi-page' : 'single-page',
      selected_pages: websiteType === 'multi' ? selectedPages : ["Home"],
      theme_palette: theme,
      theme_mode: themeMode,
      canvas_background: backgroundStyle,
      special_instructions: prompt.trim()
    };
  }, [
    title, category, tagline, primaryServices, targetAudience,
    serviceArea, keyHighlights, businessHours, address,
    effectivePhone, contactEmail, ctaText, websiteType,
    selectedPages, theme, themeMode, backgroundStyle, prompt
  ]);

  // Synthesize best AI master prompt from JSON
  const synthesizedMasterPrompt = useMemo(() => {
    const pagesInfo = websiteType === 'multi' 
      ? `Dedicated HTML files: ${selectedPages.join(', ')} with relative inter-page navigation.`
      : `Single-Page landing page with section anchors (#home, #about, #services, #faq, #contact).`;

    return `Act as a world-class principal web designer and developer. Generate a production-grade, highly-converting live website for "${title || 'Business'}" in the "${category}" industry.
Architecture: ${websiteType.toUpperCase()} (${pagesInfo}).
Tagline: "${tagline || 'Excellence in service'}".
Core Services: "${primaryServices || 'Comprehensive solutions'}".
Ideal Audience: "${targetAudience || 'Local community & clients'}".
Service Radius / Location: "${serviceArea || 'Local area'}".
USPs & Highlights: "${keyHighlights || 'Top rated, verified professionals'}".
Physical Address: "${address || '120 Main Street'}".
Phone: "${effectivePhone}" | Email: "${contactEmail || 'contact@example.com'}".
Operating Hours: "${businessHours || 'Mon-Sat 9AM-7PM'}".
Call-To-Action: "${ctaText || 'Get In Touch'}".
Visual Aesthetic: ${theme} in ${themeMode.toUpperCase()} mode with curated, industry-relevant photography.
Generate realistic persuasive copywriting, pricing tiers, client testimonials, FAQ accordions, and responsive layout.`;
  }, [
    title, category, tagline, primaryServices, targetAudience,
    serviceArea, keyHighlights, address, effectivePhone, contactEmail,
    businessHours, ctaText, websiteType, selectedPages, theme, themeMode
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter your business or brand name.");
      return;
    }

    if (mobileNumber && !validatePhoneDigits(mobileNumber, countryCode)) {
      alert(phoneError || "Please enter a valid mobile number.");
      return;
    }

    onSubmit({
      title: title.trim(),
      category,
      theme,
      theme_mode: themeMode,
      website_type: websiteType,
      background_style: backgroundStyle,
      selected_pages: websiteType === 'multi' ? selectedPages : ["Home"],
      logo_url: logoUrl,
      contact_email: contactEmail.trim(),
      contact_phone: effectivePhone,
      prompt: synthesizedMasterPrompt,
      tagline: tagline.trim(),
      primary_services: primaryServices.trim(),
      service_area: serviceArea.trim(),
      target_audience: targetAudience.trim(),
      key_highlights: keyHighlights.trim(),
      business_hours: businessHours.trim(),
      address: address.trim(),
      cta_text: ctaText.trim() || "Book An Appointment",
      business_spec_json: businessSpecJson
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="relative w-full max-w-4xl my-6 bg-white rounded-3xl border border-sky-200 shadow-2xl p-5 sm:p-8 max-h-[92vh] overflow-y-auto text-left"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-start sm:items-center gap-3.5 mb-6 pr-10">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-400 to-pink-500 text-white shadow-md shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>AI Website Builder for Real-World Businesses</span>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                  Zero Code Required
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Input your business details. We convert them into a structured JSON and AI prompt to generate a live, multi-asset website.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Business Identity & Vertical */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Tag className="w-4 h-4 text-cyan-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  1. Business Identity & In-Demand Industry
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Your Business Vertical *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-400 font-semibold text-xs sm:text-sm shadow-sm"
                  >
                    {NON_TECH_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Specialized non-tech service departments with tailored image pools.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Business / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bella Chic Hair & Beauty Salon"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-400 font-semibold text-xs sm:text-sm shadow-sm"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Displayed across header, hero, footer, and page titles.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Business Tagline / Headline Slogan
                </label>
                <input
                  type="text"
                  placeholder="e.g. Luxury Hair Styling, Rejuvenating Facials & Bridal Artistry"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-400 text-xs sm:text-sm shadow-sm"
                />
              </div>
            </div>

            {/* Section 2: Detailed Services & Market Specifics */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Award className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  2. Services, USPs & Client Reach
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Core Services Offered (Comma-separated)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Precision Haircuts, Balayage Color, Keratin Treatment, Hydra Facials, Bridal Packages"
                  value={primaryServices}
                  onChange={(e) => setPrimaryServices(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-400 text-xs sm:text-sm shadow-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-pink-500" /> Target Audience / Clientele
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Brides, working women, local families"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-400 text-xs sm:text-sm shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Service Area / Locality
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Downtown Manhattan, Brooklyn & Queens"
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-400 text-xs sm:text-sm shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" /> Key USPs, Certifications & Guarantees
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10+ Years Experience, 100% Organic Products, Certified Master Stylists, Walk-ins Welcome"
                  value={keyHighlights}
                  onChange={(e) => setKeyHighlights(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-400 text-xs sm:text-sm shadow-sm"
                />
              </div>
            </div>

            {/* Section 3: Contact & Booking Operations */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  3. Contact, Location & Hours
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-cyan-500" /> Contact Mobile Number *
                  </label>
                  <div className="grid grid-cols-[130px_1fr] gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => handleCountryCodeChange(e.target.value)}
                      className="px-2.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-400 font-bold text-xs sm:text-sm shadow-sm"
                    >
                      <option value="+91">🇮🇳 +91 (IN)</option>
                      <option value="+1">🇺🇸 +1 (US)</option>
                      <option value="+44">🇬🇧 +44 (UK)</option>
                      <option value="+971">🇦🇪 +971 (UAE)</option>
                      <option value="+1">🇨🇦 +1 (CA)</option>
                      <option value="+61">🇦🇺 +61 (AU)</option>
                      <option value="+65">🇸🇬 +65 (SG)</option>
                      <option value="+49">🇩🇪 +49 (DE)</option>
                      <option value="+966">🇸🇦 +966 (SA)</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={mobileNumber}
                      onChange={handleMobileInput}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-400 text-xs sm:text-sm shadow-sm font-semibold"
                    />
                  </div>
                  {phoneError ? (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">
                      ⚠️ {phoneError}
                    </p>
                  ) : mobileNumber && mobileNumber.length === 10 && countryCode === '+91' ? (
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                      ✓ Valid 10-digit Indian Mobile Number
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Defaults to India (+91). Validated for booking alerts.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-500" /> Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. appointments@bellachicsalon.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-400 text-xs sm:text-sm shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" /> Physical Street Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 452 Lexington Ave, Suite 300, New York, NY"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-400 text-xs sm:text-sm shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" /> Business Operating Hours
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mon - Sat: 9:00 AM - 7:00 PM | Sun: Closed"
                    value={businessHours}
                    onChange={(e) => setBusinessHours(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-400 text-xs sm:text-sm shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Action Button Text (CTA)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Book Appointment Now / Get Free Quote"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-400 text-xs sm:text-sm shadow-sm font-semibold"
                />
              </div>
            </div>

            {/* Section 4: Architecture & Design System */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  4. Architecture (Single vs Multi-Page) & Visual Design
                </h3>
              </div>

              {/* Architecture Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Website Architecture Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWebsiteType('single')}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      websiteType === 'single'
                        ? 'border-sky-400 bg-sky-50 ring-2 ring-sky-400/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm text-slate-900 mb-0.5 flex items-center justify-between">
                      <span>Single-Page Website (SPA)</span>
                      {websiteType === 'single' && <Check className="w-4 h-4 text-sky-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      All sections (Hero, About, Services, FAQ, Contact) on one index page with smooth anchor scrolling.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWebsiteType('multi')}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      websiteType === 'multi'
                        ? 'border-sky-400 bg-sky-50 ring-2 ring-sky-400/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm text-slate-900 mb-0.5 flex items-center justify-between">
                      <span>Multi-Page Website</span>
                      {websiteType === 'multi' && <Check className="w-4 h-4 text-sky-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Generates distinct HTML files (index.html, about.html, services.html, contact.html) with separate route navigation.
                    </p>
                  </button>
                </div>
              </div>

              {/* Sub-Pages Selection for Multi-Page */}
              {websiteType === 'multi' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3.5 rounded-2xl bg-white border border-sky-200 space-y-2.5"
                >
                  <label className="block text-xs font-bold text-sky-700 uppercase tracking-wider">
                    Select HTML Pages To Output
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {AVAILABLE_PAGES.map((page) => {
                      const isChecked = selectedPages.includes(page.id);
                      return (
                        <button
                          key={page.id}
                          type="button"
                          onClick={() => togglePage(page.id)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center gap-2 transition ${
                            isChecked
                              ? 'border-sky-300 bg-sky-50 text-sky-700'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-sky-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{page.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Light vs Dark Mode */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setThemeMode('light')}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                    themeMode === 'light'
                      ? 'border-sky-400 bg-sky-50 ring-2 ring-sky-400/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="font-bold text-xs text-slate-900">Light Mode</div>
                    <div className="text-[10px] text-slate-500">Crisp, clean surface aesthetic</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setThemeMode('dark')}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                    themeMode === 'dark'
                      ? 'border-sky-400 bg-sky-50 ring-2 ring-sky-400/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <div>
                    <div className="font-bold text-xs text-slate-900">Dark Mode</div>
                    <div className="text-[10px] text-slate-500">Sleek, immersive dark aesthetic</div>
                  </div>
                </button>
              </div>

              {/* Theme Palette Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-pink-500" /> Color Palette Preset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 ${
                        theme === t.id
                          ? `border-sky-400 bg-sky-50 ring-2 ring-sky-400/30`
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${t.accent} shrink-0 shadow-sm`} />
                      <span className="text-xs font-bold text-slate-800 truncate">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Upload & Special Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-pink-500" /> Brand Logo (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-sky-400 text-slate-800 text-xs font-bold cursor-pointer transition flex items-center gap-1.5 shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-pink-500" />
                      <span>Upload Logo</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/svg+xml"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono truncate">
                      {logoFileName || (logoUrl ? 'Custom Logo Loaded' : 'None')}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <MonitorPlay className="w-3.5 h-3.5 text-cyan-500" /> Canvas Background
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBackgroundStyle('live')}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition ${
                        backgroundStyle === 'live' ? 'border-cyan-400 bg-cyan-50 text-cyan-800' : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      ✨ Live Particles
                    </button>
                    <button
                      type="button"
                      onClick={() => setBackgroundStyle('static')}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition ${
                        backgroundStyle === 'static' ? 'border-cyan-400 bg-cyan-50 text-cyan-800' : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      🎨 Static Clean
                    </button>
                  </div>
                </div>
              </div>

              {/* Extra Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5 text-cyan-500" /> Custom Instructions / Stylistic Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Include prominent emergency phone banner and guarantee badge on top."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-400 text-xs sm:text-sm shadow-sm"
                />
              </div>
            </div>

            {/* Collapsible Section: Inspect Generated JSON & AI Prompt */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowJsonPromptPreview(!showJsonPromptPreview)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100/60 transition"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Code className="w-4 h-4 text-cyan-600" />
                  <span>Inspect Generated Business JSON & AI Prompt Synthesis</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-sky-600 font-bold">
                  <span>{showJsonPromptPreview ? 'Hide Details' : 'View Code & Prompt'}</span>
                  {showJsonPromptPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              <AnimatePresence>
                {showJsonPromptPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 border-t border-slate-200 space-y-3 bg-white"
                  >
                    <div>
                      <div className="text-[11px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                        <Code className="w-3.5 h-3.5 text-purple-600" /> Converted Business Specification JSON:
                      </div>
                      <pre className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">
                        {JSON.stringify(businessSpecJson, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-600" /> Synthesized Gemini AI Master Prompt:
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed max-h-36 overflow-y-auto">
                        {synthesizedMasterPrompt}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
                Every website receives unique, category-tailored photography signatures.
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition font-bold text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-pink-500 hover:from-cyan-500 hover:to-pink-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Generate Website</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreationWizardModal;
