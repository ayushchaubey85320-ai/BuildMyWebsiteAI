import React from 'react';
import { motion } from 'framer-motion';
import LandingNavbar from '../components/LandingNavbar';
import AnimatedBackground from '../components/AnimatedBackground';
import { useTheme } from '../context/ThemeContext';

export default function HowItWorksPage() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  return (
    <div className={`relative min-h-screen flex flex-col transition-colors duration-300 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      <AnimatedBackground />
      <LandingNavbar />

      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 inline-block">
            Seamless Workflow Methodology
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            How BuildMyWebsiteAI <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">Generates Code</span>
          </h1>
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
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className={`p-8 rounded-3xl border space-y-4 shadow-xl ${
                isLight ? 'bg-white/90 border-slate-200 text-slate-900' : 'bg-slate-900/80 border-slate-800 text-white'
              }`}
            >
              <span className="text-4xl font-black text-indigo-500/50">{s.step}</span>
              <h3 className="text-lg font-bold">{s.title}</h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
