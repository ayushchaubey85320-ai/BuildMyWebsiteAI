import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, Smartphone, Sparkles, Code2, Download, ShieldCheck, 
  Layers, Eye, Laptop, MessageSquare, PhoneCall, Palette, CheckCircle2 
} from 'lucide-react';
import LandingNavbar from '../components/LandingNavbar';
import AnimatedBackground from '../components/AnimatedBackground';
import { useTheme } from '../context/ThemeContext';

export default function FeaturesPage() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const featureList = [
    { 
      icon: Sparkles, 
      title: "Specialized Industry Engines", 
      desc: "Tailored specifically for businesses with non-technical owners: Luxury Salons, Fitness Gyms, Coaching Classes, Dental Clinics, Bakeries, Plumbers, and Legal Consultants." 
    },
    { 
      icon: Layers, 
      title: "Custom Multi-Page Architect & Prompts", 
      desc: "Select which pages you need and manually create custom pages (e.g. 'Faculty & Mentors', 'Admission Process') with dedicated AI prompts synthesized into deep copy." 
    },
    { 
      icon: ShieldCheck, 
      title: "Domain-Authentic Legal Copywriting", 
      desc: "Zero generic tech clichés or corporate software jargon. Every generated page features realistic, industry-accurate services, FAQs, and storytelling." 
    },
    { 
      icon: PhoneCall, 
      title: "Country Code & Indian Mobile Validator", 
      desc: "Input business phone numbers with international country codes (+91 India default) and strict 10-digit validation (/^[6-9]\\d{9}$/) carried through to exported sites." 
    },
    { 
      icon: Zap, 
      title: "Functional Interactive Booking Modals", 
      desc: "Every Call-to-Action button on generated and exported websites opens a fully working appointment/inquiry booking popup modal with instant submission feedback." 
    },
    { 
      icon: Download, 
      title: "1-Click Standalone ZIP Exporter", 
      desc: "Download complete static packages: separate HTML files for each page, unified style.css, and JS scripts ready to run 100% offline via file:/// with zero server setup." 
    },
    { 
      icon: Palette, 
      title: "Dynamic Light & Dark Theme Variables", 
      desc: "Instant live theme switching with clean CSS variable tokens (--header-bg, --text-color, --card-bg) ensuring high contrast and optimal legibility in both modes." 
    },
    { 
      icon: MessageSquare, 
      title: "Built-In AI Copilot Chatbot", 
      desc: "24/7 floating assistant copilot ready to answer questions, guide design customizations, provide styling suggestions, and assist with web hosting." 
    },
    { 
      icon: Smartphone, 
      title: "100% Mobile Viewport Responsiveness", 
      desc: "Adaptive responsive navigation, hamburger menu toggles, flexible CSS grids, and mobile-optimized typography across all generated pages." 
    }
  ];

  return (
    <div className={`relative min-h-screen flex flex-col transition-colors duration-300 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      <AnimatedBackground />
      <LandingNavbar />

      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 inline-block">
            Engine Capabilities
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Engineered for Real-World <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-cyan-400 to-pink-500">Website Creation</span>
          </h1>
          <p className={`text-sm sm:text-base font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Explore the core functionalities powering the BuildMyWebsiteAI multi-page engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((f, idx) => {
            const IconComp = f.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={`p-8 rounded-3xl border shadow-xl flex flex-col justify-between space-y-4 ${
                  isLight ? 'bg-white/90 border-slate-200 text-slate-900' : 'bg-slate-900/80 border-slate-800 text-white'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <IconComp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">{f.title}</h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </main>

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
}
