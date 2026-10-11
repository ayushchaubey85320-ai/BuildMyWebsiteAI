import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Layers, PhoneCall, Zap, Download } from 'lucide-react';
import LandingNavbar from '../components/LandingNavbar';
import AnimatedBackground from '../components/AnimatedBackground';
import { useTheme } from '../context/ThemeContext';

export default function HowItWorksPage() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const steps = [
    { 
      step: "01", 
      icon: Sparkles,
      title: "Input Business Details & Category", 
      desc: "Select a specialized high-demand domain (Salons, Gyms, Coaching Classes, Clinics, Bakeries). Fill in your business name, tagline, target audience, operating hours, address, and mobile number with international country codes (+91 India default)." 
    },
    { 
      step: "02", 
      icon: Layers,
      title: "Configure Pages & Custom AI Prompts", 
      desc: "Choose between Single Page or Multi-Page mode. Toggle default pages (About Us, Services, Contact Us) or add custom pages (e.g. 'Faculty & Mentors', 'Admission Process') with dedicated AI prompts describing exactly what to generate." 
    },
    { 
      step: "03", 
      icon: Zap,
      title: "Real-Time AI Generation & Interactive Canvas", 
      desc: "The Gemini AI engine synthesizes realistic, domain-specific copywriting with zero corporate tech clichés. Preview live scroll animations, test Dark and Light mode themes, and navigate between pages using interactive tabs." 
    },
    { 
      step: "04", 
      icon: Download,
      title: "1-Click Standalone ZIP Export", 
      desc: "Export a complete production package containing index.html, style.css, and separate HTML files for every page. Every button is functional with an interactive booking modal and phone number validator, running 100% offline via file:///." 
    }
  ];

  return (
    <div className={`relative min-h-screen flex flex-col transition-colors duration-300 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      <AnimatedBackground />
      <LandingNavbar />

      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20 inline-block">
            Seamless 4-Step Process
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            How BuildMyWebsiteAI <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">Builds Your Website</span>
          </h1>
          <p className={`text-sm sm:text-base font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            From concept to a fully functional multi-page standalone website in under 60 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((s, idx) => {
            const IconComp = s.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`p-8 rounded-3xl border space-y-4 shadow-xl flex flex-col justify-between ${
                  isLight ? 'bg-white/90 border-slate-200 text-slate-900' : 'bg-slate-900/80 border-slate-800 text-white'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-black text-indigo-500/40">{s.step}</span>
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                      <IconComp className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold">{s.title}</h3>
                  <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{s.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition transform hover:scale-105"
          >
            <span>Start Building Your Website</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
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
            <Link to="/showcase" className="hover:text-indigo-600">Categories</Link>
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
