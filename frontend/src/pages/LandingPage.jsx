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
  { name: "AI Startup", icon: Sparkles, desc: "Neural workflows & ML-Ops platforms", badge: "Hot" },
  { name: "Education", icon: Laptop, desc: "Interactive academies & skill courses", badge: "Popular" },
  { name: "Fashion", icon: Flame, desc: "Artisan apparel & luxury lookbooks", badge: "Trending" },
  { name: "SaaS", icon: Zap, desc: "Cloud telemetry & enterprise software", badge: "Featured" },
  { name: "E-Commerce", icon: Download, desc: "Digital storefronts & product lines", badge: "Essential" },
  { name: "Healthcare", icon: ShieldCheck, desc: "Medical clinics & diagnostic labs", badge: "Trusted" },
  { name: "Real Estate", icon: Globe, desc: "Luxury property listings & estates", badge: "High ROI" },
  { name: "Restaurant", icon: Flame, desc: "Culinary dining & artisan cafes", badge: "Popular" },
  { name: "Fitness", icon: Rocket, desc: "Gym memberships & personal training", badge: "Active" },
  { name: "Law Firm", icon: ShieldCheck, desc: "Legal consultation & corporate practice", badge: "Corporate" },
  { name: "Event", icon: Star, desc: "Conferences, galas & festival expos", badge: "Live" },
  { name: "Non-Profit", icon: Heart, desc: "Charity initiatives & community causes", badge: "Impact" },
  { name: "Photography", icon: Eye, desc: "Visual portfolios & studio galleries", badge: "Creative" },
  { name: "Car Rental", icon: Rocket, desc: "Vehicle fleets & reservation systems", badge: "Speed" },
  { name: "Travel", icon: Globe, desc: "Exotic expeditions & booking tours", badge: "Global" },
  { name: "Gaming", icon: Zap, desc: "Esports leagues & streaming hubs", badge: "NextGen" },
  { name: "Portfolio", icon: Layers, desc: "Designer showcases & resume sites", badge: "Personal" },
  { name: "Agency", icon: Wand2, desc: "Digital marketing & creative studios", badge: "Agency" }
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
          <span>BUILDMYWEBSITEAI ENGINE 2.0 • 18 SPECIALIZED CATEGORIES</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight max-w-5xl leading-[1.12] mb-6 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          Build & Deploy Production Websites in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-cyan-500 to-pink-500">Seconds with AI</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`text-sm sm:text-lg md:text-xl max-w-3xl leading-relaxed mb-10 font-medium px-2 ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}
        >
          Enter your prompt, pick from 18 specialized industry categories, preview live Framer Motion scroll animations, and export 100% production-ready HTML/CSS code.
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
              placeholder="Describe your website (e.g. Organic coffee shop with daily roasted espresso)..."
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
            <span>Generate Free Now</span>
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
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Instant HTML/CSS ZIP Export</span>
          </div>
          <div className="flex items-center gap-1.5 text-pink-600 dark:text-pink-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Live AOS Scroll Animations</span>
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
            { step: "01", title: "Enter Prompt & Category", desc: "Type your business title, select from 18 preset categories, and choose your color theme." },
            { step: "02", title: "Instant AI Generation", desc: "Our engine crafts headlines, About story pools, 6 service cards, features, and FAQs in seconds." },
            { step: "03", title: "Live Canvas Edit & Animate", desc: "Preview live Framer Motion scroll animations, toggle mobile viewports, and refine layout instructions." },
            { step: "04", title: "1-Click Export or Deploy", desc: "Download production-ready static HTML/CSS with AOS animation scripts or publish instantly." }
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

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-block">
            Simple Pricing
          </span>
          <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Start Building Free Today
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Starter Plan */}
          <div className={`p-8 rounded-3xl border flex flex-col justify-between space-y-6 ${
            isLight ? 'bg-white border-slate-200 shadow-xl' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="space-y-4">
              <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Starter Creator</h3>
              <div className={`text-4xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>$0 <span className={`text-xs font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>/ forever free</span></div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Perfect for exploring AI website generation and previewing live layouts.</p>
              <ul className={`space-y-2.5 text-xs pt-4 border-t ${isLight ? 'border-slate-200 text-slate-700' : 'border-slate-800 text-slate-300'}`}>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> All 18 Categories Supported</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Unlimited Live Canvas Previews</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Full Mobile Viewport Responsiveness</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Export Static HTML/CSS Archive</li>
              </ul>
            </div>
            <Link
              to="/signup"
              className={`w-full py-3.5 rounded-xl font-bold text-sm text-center transition ${
                isLight ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
            >
              Sign Up Free
            </Link>
          </div>

          {/* Pro AI Creator Plan */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-900/90 to-purple-950 border-2 border-indigo-500 flex flex-col justify-between space-y-6 relative shadow-2xl text-white">
            <span className="absolute -top-3.5 right-6 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-md">
              Most Popular
            </span>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">Pro AI Architect <Sparkles className="w-4 h-4 text-indigo-300" /></h3>
              <div className="text-4xl font-black text-white">$29 <span className="text-xs text-indigo-200 font-normal">/ month</span></div>
              <p className="text-xs text-indigo-200">For agencies, freelancers, and businesses demanding high-speed publishing.</p>
              <ul className="space-y-2.5 text-xs text-indigo-100 pt-4 border-t border-indigo-700/50">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-300" /> Everything in Starter Tier</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-300" /> Unlimited Prompt AI Layout Edits</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-300" /> One-Click Custom Co-Domain Publishing</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-300" /> Priority 24/7 Support Desk</li>
              </ul>
            </div>
            <Link
              to="/signup"
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 hover:from-cyan-300 hover:to-pink-400 text-white text-center shadow-lg transition transform hover:scale-105"
            >
              Get Started Pro
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto scroll-mt-24">
        <h2 className={`text-3xl sm:text-4xl font-black text-center mb-12 tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            { q: "How does BuildMyWebsiteAI generate websites?", a: "Our system combines intelligent category presets, Unsplash image pools, Framer Motion scroll animations, and Gemini AI parsing to generate comprehensive HTML/CSS website architectures." },
            { q: "Are exported websites mobile responsive?", a: "Yes! Every generated website includes viewport meta tags, media queries, hamburger navigation toggles, and responsive column collapses." },
            { q: "Can I download the code and host it anywhere?", a: "Absolutely. When you click 'Export ZIP', you get clean index.html, style.css, and JS files ready to host on Vercel, Netlify, Render, or any Web server." },
            { q: "Can I edit the generated website?", a: "Yes. You can use the live AI Assistant prompt bar inside the Canvas Editor to tweak headlines, change colors, or adjust layout sections." }
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
            Next-generation AI website generation platform empowering creators to build, preview, and deploy stunning websites in seconds.
          </p>
          <div className={`flex items-center justify-center gap-6 font-semibold pt-2 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
            <Link to="/login" className="hover:text-indigo-600">Log In</Link>
            <Link to="/signup" className="hover:text-indigo-600">Sign Up</Link>
            <Link to="/features" className="hover:text-indigo-600">Features</Link>
            <Link to="/pricing" className="hover:text-indigo-600">Pricing</Link>
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
