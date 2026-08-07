import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Smartphone, Sparkles, Code2, Download, ShieldCheck, Layers, Eye, Laptop } from 'lucide-react';
import LandingNavbar from '../components/LandingNavbar';
import AnimatedBackground from '../components/AnimatedBackground';
import { useTheme } from '../context/ThemeContext';

export default function FeaturesPage() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const featureList = [
    { icon: Sparkles, title: "Gemini 1.5 Flash AI Engine", desc: "Crafts custom headlines, multi-paragraph About Us narratives, 6 service cards, 6 feature cards, and FAQ accordions tailored to your prompt." },
    { icon: Smartphone, title: "100% Mobile Viewport Responsiveness", desc: "Auto-detects device widths, includes hamburger dropdown navigation, responsive font scaling, and 1-column grid collapses." },
    { icon: Eye, title: "Dual Live & Export Scroll Animations", desc: "Features Framer Motion animations in live web preview canvas and injects lightweight AOS (Animate-On-Scroll) library into exported HTML." },
    { icon: Layers, title: "Multi-Page SPA & Multi-Tab Isolation", desc: "Supports single-page anchor navigation (#home, #about, #services, #contact) and multi-page HTML tab switching with zero section leakage." },
    { icon: Download, title: "1-Click Production ZIP Export", desc: "Generates clean index.html, style.css, and JavaScript archives ready for Vercel, Netlify, Render, or any standard Web host." },
    { icon: ShieldCheck, title: "Enterprise Theme Engine & Token Mapping", desc: "6 curated theme presets (Modern Dark, Neon Cyber, Minimal Light, Elegant Gold, Ocean Blue, Sunset Orange) with crisp contrast." }
  ];

  return (
    <div className={`relative min-h-screen flex flex-col transition-colors duration-300 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      <AnimatedBackground />
      <LandingNavbar />

      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 inline-block">
            Comprehensive Capabilities
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Engineered for High-Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-cyan-400 to-pink-500">Web Generation</span>
          </h1>
          <p className={`text-sm sm:text-base font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Explore the core architectural features powering the BuildMyWebsiteAI engine.
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
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <IconComp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">{f.title}</h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
