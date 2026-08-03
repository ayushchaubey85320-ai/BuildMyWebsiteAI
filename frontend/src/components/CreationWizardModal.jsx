import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Upload, Mail, Phone, Palette, Layout, 
  ArrowRight, Layers, CheckSquare, Square, MonitorPlay, Sun, Moon 
} from 'lucide-react';

const CATEGORIES = [
  "Education", "SaaS", "E-Commerce", "Portfolio", "Agency", "Healthcare", "Real Estate", 
  "Restaurant", "Fitness", "Law Firm", "Event", "Non-Profit", 
  "Fashion", "Photography", "Car Rental", "AI Startup", "Travel", "Gaming"
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
  { id: "Home", label: "Home Page", required: true },
  { id: "About Us", label: "About Us", required: false },
  { id: "Services", label: "Services / Features", required: false },
  { id: "Pricing", label: "Pricing / Plans", required: false },
  { id: "FAQ", label: "FAQ Page", required: false },
  { id: "Contact Us", label: "Contact Us", required: false }
];

const CreationWizardModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [theme, setTheme] = useState(THEMES[0].id);
  const [themeMode, setThemeMode] = useState('light'); // Default to light
  const [websiteType, setWebsiteType] = useState('single');
  const [backgroundStyle, setBackgroundStyle] = useState('live');
  const [selectedPages, setSelectedPages] = useState(["Home", "About Us", "Services", "Pricing", "Contact Us"]);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFileName, setLogoFileName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title,
      category,
      theme,
      theme_mode: themeMode,
      website_type: websiteType,
      background_style: backgroundStyle,
      selected_pages: websiteType === 'multi' ? selectedPages : ["Home"],
      logo_url: logoUrl,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      prompt,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl my-8 bg-white rounded-3xl border border-sky-200 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-left"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-400 to-pink-400 text-white shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Create New AI Website
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                Configure theme mode, architecture, background experience & brand assets
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Theme Mode Selector (Light Mode vs Dark Mode) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" /> Website Theme Mode
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setThemeMode('light')}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                    themeMode === 'light'
                      ? 'border-sky-400 bg-sky-50 ring-2 ring-sky-400/30'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-600 border border-amber-200">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">☀️ Light Mode Theme</div>
                    <div className="text-[11px] text-slate-500">Crisp, clean light surface aesthetic.</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setThemeMode('dark')}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                    themeMode === 'dark'
                      ? 'border-sky-400 bg-sky-50 ring-2 ring-sky-400/30'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-900 text-indigo-400">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">🌙 Dark Mode Theme</div>
                    <div className="text-[11px] text-slate-500">Sleek, modern dark surface aesthetic.</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Website Architecture Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-500" /> Website Architecture
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setWebsiteType('single')}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                    websiteType === 'single'
                      ? 'border-sky-400 bg-sky-50 ring-2 ring-sky-400/30'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900 mb-1">Single-Page Website (SPA)</div>
                  <div className="text-xs text-slate-500">Smooth single landing page with instant section scrolling.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setWebsiteType('multi')}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                    websiteType === 'multi'
                      ? 'border-sky-400 bg-sky-50 ring-2 ring-sky-400/30'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900 mb-1">Multi-Page Website</div>
                  <div className="text-xs text-slate-500">Separate dedicated pages (Home, About, Services, Contact, etc.).</div>
                </button>
              </div>
            </div>

            {/* Background Style Selector (Live vs Static) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MonitorPlay className="w-4 h-4 text-cyan-500" /> Canvas Background Mode
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setBackgroundStyle('live')}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    backgroundStyle === 'live'
                      ? 'border-cyan-400 bg-cyan-50 ring-2 ring-cyan-400/30'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 mb-0.5">✨ Animated Live Particles</div>
                  <div className="text-[11px] text-slate-500">Dynamic Cyan, Sky & Pink particle canvas effect.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setBackgroundStyle('static')}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    backgroundStyle === 'static'
                      ? 'border-cyan-400 bg-cyan-50 ring-2 ring-cyan-400/30'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 mb-0.5">🎨 Static Clean Background</div>
                  <div className="text-[11px] text-slate-500">Sleek, minimal static background.</div>
                </button>
              </div>
            </div>

            {/* Page Selector Checkbox Grid (Multi-Page) */}
            {websiteType === 'multi' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-sky-600 uppercase tracking-wider mb-2">
                  Select Pages Needed For Your Website
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AVAILABLE_PAGES.map((page) => {
                    const isChecked = selectedPages.includes(page.id);
                    return (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => togglePage(page.id)}
                        className={`p-3 rounded-xl border text-left text-xs font-bold flex items-center gap-2.5 transition ${
                          isChecked
                            ? 'border-sky-300 bg-sky-100 text-sky-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-sky-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span>{page.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Project Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Website / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oxford Learning Academy"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-400 transition text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Website Category (18 Web Options)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-400 transition text-sm font-medium"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Embedded Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-sky-500" /> Embedded Contact Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. contact@mybrand.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-400 transition text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-cyan-500" /> Embedded Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. +1 (800) 555-0199"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-400 transition text-sm font-medium"
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4 text-pink-500" /> Upload Brand Logo (PNG / JPEG File)
              </label>
              <div className="flex items-center gap-3">
                <label className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-400 text-slate-800 text-xs font-bold cursor-pointer transition flex items-center gap-2 shadow-sm">
                  <Upload className="w-4 h-4 text-pink-500" />
                  <span>Choose Image File...</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-slate-500 font-mono truncate">
                  {logoFileName || (logoUrl ? 'Custom Image Loaded' : 'No file selected (Optional)')}
                </span>
              </div>
            </div>

            {/* Theme Palette Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-500" /> Select Theme Palette
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                      theme === t.id
                        ? `border-sky-400 bg-sky-50 ring-2 ring-sky-400/30`
                        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${t.accent} shrink-0 shadow-sm`} />
                    <span className="text-xs font-bold text-slate-800">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom AI Instructions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Layout className="w-4 h-4 text-cyan-500" /> Custom AI Layout Instructions
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Build a clean modern website highlighting our 24/7 learning classes, certified academic mentors, and instant course enrollments..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-400 transition resize-none text-sm font-medium"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition font-bold text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-pink-400 hover:from-cyan-500 hover:to-pink-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-sky-500/25 transition transform hover:scale-105"
              >
                <span>Generate Website</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreationWizardModal;
