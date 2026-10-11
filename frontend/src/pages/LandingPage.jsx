import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, ArrowRight, CheckCircle2, Zap, Smartphone, Code2, 
  Download, Globe, Layers, ShieldCheck, ChevronDown, Rocket, Flame, 
  Laptop, Wand2, Star, Eye, Heart 
} from 'lucide-react';
import LandingNavbar from '../components/LandingNavbar';
import AnimatedBackground from '../components/AnimatedBackground';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = [
  { name: "Salon, Spa & Beauty Parlour", icon: Sparkles, desc: "Hair stylists, nail spas, facial skin care & bridal makeup", badge: "High Demand" },
  { name: "Dentist & Medical Healthcare Clinic", icon: ShieldCheck, desc: "Family dentists, pediatricians & local healthcare clinics", badge: "Essential" },
  { name: "Plumbing, Electrician & Home Handyman", icon: Rocket, desc: "24/7 emergency plumbers, electricians & home repair contractors", badge: "Emergency" },
  { name: "Restaurant, Café & Bakery", icon: Flame, desc: "Local eateries, bakeries, cafes & fine dining spots", badge: "Popular" },
  { name: "Real Estate Broker & Property Dealer", icon: Globe, desc: "Property dealers, home listing brokers & buyer advisory", badge: "High Value" },
  { name: "Lawyer, Advocate & Legal Consultancy", icon: ShieldCheck, desc: "Advocates, estate planning, and legal consultants", badge: "Trusted" },
  { name: "Auto Repair, Garage & Car Detailing", icon: Zap, desc: "Mechanical garages, tire services, and auto detailing", badge: "Essential" },
  { name: "Fitness Gym, Yoga & Personal Training", icon: Rocket, desc: "Local fitness gyms, personal trainers & yoga studios", badge: "Active" },
  { name: "Event Management & Wedding Planner", icon: Star, desc: "Wedding planners, banquet organizers & milestone events", badge: "Creative" },
  { name: "Pet Care, Veterinary & Dog Grooming", icon: Heart, desc: "Pet grooming parlours, veterinary clinics & dog daycares", badge: "Loving" },
  { name: "Cleaning & Janitorial Services", icon: Sparkles, desc: "Residential maid services & commercial office janitorial", badge: "In Demand" },
  { name: "Coaching Classes, Tuition & Preschool", icon: Laptop, desc: "Private tutoring centers, daycares & STEM academies", badge: "Education" }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [promptText, setPromptText] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  const handlePromptSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('buildmywebsiteai_token');
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/signup', { state: { initialPrompt: promptText } });
    }
  };

  return (
    <div className={`relative min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Fixed Ambient Particle Canvas Background */}
      <AnimatedBackground />

      {/* Top Navbar */}
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 sm:pt-44 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex flex-col items-center">
        
        {/* Animated Ambient Glow */}
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] blur-[130px] rounded-full pointer-events-none -z-10 ${
          isLight ? 'bg-indigo-300/30' : 'bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-pink-600/20'
        }`} />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6 shadow-md backdrop-blur-md border ${
            isLight ? 'bg-white border-slate-200 text-indigo-600' : 'bg-slate-900/80 border-slate-800 text-indigo-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span>ENGINE 2.0 • HIGH-DEMAND LOCAL BUSINESSES • MULTI-PAGE & CUSTOM PROMPTS</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight max-w-5xl leading-[1.12] mb-6 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          Build & Deploy Real-Life Websites in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-cyan-500 to-pink-500">Seconds with AI</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`text-sm sm:text-lg md:text-xl max-w-3xl leading-relaxed mb-10 font-medium px-2 ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}
        >
          Select from high-demand categories (Salons, Gyms, Coaching, Clinics, Bakeries), customize pages with dedicated AI prompts, preview interactive layouts, and export 100% standalone HTML/CSS with functional booking modals.
        </motion.p>

        {/* Interactive Prompt Box */}
        <motion.form 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onSubmit={handlePromptSubmit}
          className={`w-full max-w-2xl border p-2 sm:p-2.5 rounded-2xl sm:rounded-full shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center gap-2 mb-8 transition-colors ${
            isLight
              ? 'bg-white border-slate-300 focus-within:border-indigo-500 shadow-slate-200/80'
              : 'bg-slate-900/90 border-slate-800 focus-within:border-indigo-500/80'
          }`}
        >
          <div className="flex items-center gap-2 px-3 w-full sm:w-auto flex-1">
            <Wand2 className="w-5 h-5 text-indigo-500 shrink-0" />
            <input
              type="text"
              placeholder="Describe your business (e.g. Aura Unisex Salon with hair spa and bridal makeup)..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className={`w-full bg-transparent text-xs sm:text-sm focus:outline-none py-2 ${
                isLight ? 'text-slate-900 placeholder-slate-400' : 'text-white placeholder-slate-500'
              }`}
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl sm:rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition transform hover:scale-105 shrink-0"
          >
            <span>Generate Website</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.form>

        {/* Direct Action Badges */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-semibold"
        >
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Multi-Page + Custom Prompts</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Interactive Booking Modals</span>
          </div>
          <div className="flex items-center gap-1.5 text-pink-600 dark:text-pink-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>+91 Indian Mobile Validation</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Standalone ZIP Export (Offline Ready)</span>
          </div>
        </motion.div>

        {/* Hero Mockup Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className={`w-full max-w-5xl mt-12 sm:mt-16 rounded-2xl sm:rounded-3xl border p-2 sm:p-4 backdrop-blur-2xl shadow-2xl relative overflow-hidden group ${
            isLight ? 'bg-white border-slate-200 shadow-slate-200/80' : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <div className={`flex items-center justify-between px-3 py-2 border-b mb-3 rounded-xl ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
          }`}>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className={`text-[11px] font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>buildmywebsiteai.site/preview/demo</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">CANVAS PREVIEW</span>
            </div>
          </div>

          <div className={`rounded-xl overflow-hidden border relative min-h-[300px] sm:min-h-[460px] flex items-center justify-center ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <img 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80" 
              alt="BuildMyWebsiteAI Live Preview Canvas" 
              className="w-full h-auto max-h-[480px] object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
            />
            <div className={`absolute inset-0 opacity-80 ${
              isLight ? 'bg-gradient-to-t from-slate-100 via-transparent to-transparent' : 'bg-gradient-to-t from-slate-950 via-transparent to-transparent'
            }`} />
            <div className={`absolute bottom-6 left-6 right-6 p-6 rounded-2xl border backdrop-blur-xl text-left space-y-2 ${
              isLight ? 'bg-white/90 border-slate-200 shadow-xl' : 'bg-slate-900/90 border-slate-800'
            }`}>
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Live AI Layout Canvas Engine
              </div>
              <h3 className={`text-lg sm:text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Full Responsive Canvas + Framer Motion Scroll Animations</h3>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Generates custom headlines, 6 service cards, 4 methodology steps, 6 features, About stories, FAQs, and client reviews.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 18 Categories Showcase Grid */}
      <section id="showcase" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 inline-block">
            Comprehensive Industry Support
          </span>
          <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            18 Dedicated Website Categories
          </h2>
          <p className={`text-sm sm:text-base ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Every category includes tailored Unsplash image pools, headlines, multi-paragraph company stories, 6 service cards, 6 features, and FAQ accordions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((cat, idx) => {
            const IconComp = cat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "100px" }}
                transition={{ duration: 0.35, delay: idx * 0.02 }}
                className={`p-6 rounded-2xl border transition-all duration-300 group flex items-start justify-between shadow-lg ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900'
                }`}
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className={`text-base font-bold transition-colors ${
                    isLight ? 'text-slate-900 group-hover:text-indigo-600' : 'text-white group-hover:text-indigo-400'
                  }`}>{cat.name}</h3>
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{cat.desc}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {cat.badge}
                </span>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={`relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-y scroll-mt-24 ${
        isLight ? 'bg-slate-100/60 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
      }`}>
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 inline-block">
            Seamless Workflow
          </span>
          <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            How BuildMyWebsiteAI Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Select Category & Input Profile", desc: "Choose your high-demand local domain (Salon, Gym, Coaching, Clinic), input operating hours, address, and Indian mobile number with +91 validation." },
            { step: "02", title: "Configure Multi-Page & Custom Prompts", desc: "Select default pages (About, Services, Contact) or create custom pages like 'Faculty & Mentors' or 'Admission Process' with your own AI prompts." },
            { step: "03", title: "Live Interactive Preview Canvas", desc: "Inspect real domain-authentic copywriting without generic corporate jargon, switch pages via tabs, and toggle between Light and Dark themes." },
            { step: "04", title: "1-Click Standalone ZIP Export", desc: "Download pure static HTML files, style.css, and interactive booking modal forms that run 100% offline via file:/// with zero server dependencies." }
          ].map((s, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "100px" }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className={`p-6 rounded-2xl border space-y-3 relative ${
                isLight ? 'bg-white border-slate-200 shadow-md' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <span className="text-3xl font-black text-indigo-500/40">{s.step}</span>
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{s.title}</h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto scroll-mt-24">
        <h2 className={`text-3xl sm:text-4xl font-black text-center mb-12 tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            { 
              q: "Can I create multi-page websites and custom pages with custom prompts?", 
              a: "Yes! In Multi-Page mode, you can select standard pages (Home, About Us, Services, Contact Us) and manually add custom pages (e.g. 'Faculty & Mentors', 'Admission Process', 'Signature Treatments'). When you provide an AI prompt, the engine crafts rich, domain-specific hero sections, narratives, and offering cards tailored to your instructions." 
            },
            { 
              q: "Are the buttons on the generated and exported websites functional?", 
              a: "Yes! Every Call-To-Action and booking button on the exported website is wired to an interactive modal popup. Customers can submit their Name, Email, Country Code, and Phone Number with instant feedback." 
            },
            { 
              q: "How does phone number validation work?", 
              a: "Both the creation wizard and the exported booking modal support international country codes with India (+91) as default, enforcing strict 10-digit Indian mobile validation (/^[6-9]\\d{9}$/) to prevent spam and invalid inquiries." 
            },
            { 
              q: "Why is there zero corporate tech jargon in local business websites?", 
              a: "We engineered our AI prompts to eliminate generic SaaS clichés like 'How We Deliver Excellence' or 'Agile transformation'. Salon websites get real beauty & grooming copy, gym websites get authentic fitness regimens, and coaching academies get academic syllabus details." 
            },
            { 
              q: "Can I download the code and run it offline without Node.js or a backend?", 
              a: "Absolutely. When you click 'Export ZIP', you receive a complete package containing index.html, style.css, and individual HTML files for every page. You can double-click index.html and run it directly in any browser offline or upload it to any static web host." 
            },
            { 
              q: "How does the built-in AI Chatbot help me?", 
              a: "Our floating assistant copilot is available 24/7 in the corner of your screen. You can ask it questions on how to customize colors, modify HTML files, connect custom domains, or optimize your site's SEO." 
            }
          ].map((f, idx) => (
            <div key={idx} className={`rounded-2xl border overflow-hidden ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}>
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className={`w-full p-5 text-left font-bold text-sm sm:text-base flex items-center justify-between gap-4 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                <span>{f.q}</span>
                <ChevronDown className={`w-5 h-5 text-indigo-500 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className={`px-5 pb-5 text-xs sm:text-sm leading-relaxed border-t pt-3 ${
                  isLight ? 'text-slate-600 border-slate-100' : 'text-slate-400 border-slate-800/80'
                }`}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={`relative z-10 border-t py-12 px-4 sm:px-6 text-center text-xs ${
        isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-800/80 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className={`flex items-center justify-center gap-2 font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span>BuildMyWebsiteAI Engine</span>
          </div>
          <p className={`max-w-md mx-auto ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Next-generation AI website generation platform empowering local businesses, educators, and creators to build and export production-ready websites in seconds.
          </p>
          <div className={`flex items-center justify-center gap-6 font-semibold pt-2 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
            <Link to="/login" className="hover:text-indigo-600">Log In</Link>
            <Link to="/signup" className="hover:text-indigo-600">Sign Up</Link>
            <Link to="/features" className="hover:text-indigo-600">Features</Link>
            <Link to="/showcase" className="hover:text-indigo-600">18 Categories</Link>
            <Link to="/how-it-works" className="hover:text-indigo-600">How It Works</Link>
            <Link to="/faq" className="hover:text-indigo-600">FAQ</Link>
          </div>
          <div className={`pt-4 border-t ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-900 text-slate-600'}`}>
            © 2026 BuildMyWebsiteAI. All rights reserved. Powered by Antigravity Studio.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
