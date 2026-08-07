import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Laptop, Flame, Zap, Download, ShieldCheck, Globe, Rocket, Star, Heart, Eye, Wand2, Layers } from 'lucide-react';
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

export default function ShowcasePage() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  return (
    <div className={`relative min-h-screen flex flex-col transition-colors duration-300 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      <AnimatedBackground />
      <LandingNavbar />

      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 inline-block">
            18 Specialized Industry Templates
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Tailored Industry <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-pink-500">Showcase Categories</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, idx) => {
            const IconComp = cat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.03 }}
                className={`p-6 rounded-3xl border transition-all duration-300 flex items-start justify-between shadow-lg ${
                  isLight ? 'bg-white/90 border-slate-200 text-slate-900' : 'bg-slate-900/80 border-slate-800 text-white'
                }`}
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold">{cat.name}</h3>
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
      </main>
    </div>
  );
}
