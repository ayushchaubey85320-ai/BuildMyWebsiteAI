import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import LandingNavbar from '../components/LandingNavbar';
import AnimatedBackground from '../components/AnimatedBackground';
import { useTheme } from '../context/ThemeContext';

export default function FAQPage() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    { q: "How does BuildMyWebsiteAI generate websites?", a: "Our system combines intelligent category presets, Unsplash image pools, Framer Motion scroll animations, and Gemini AI parsing to generate comprehensive HTML/CSS website architectures." },
    { q: "Are exported websites mobile responsive?", a: "Yes! Every generated website includes viewport meta tags, media queries, hamburger navigation toggles, and responsive column collapses." },
    { q: "Can I download the code and host it anywhere?", a: "Absolutely. When you click 'Export ZIP', you get clean index.html, style.css, and JS files ready to host on Vercel, Netlify, Render, or any Web server." },
    { q: "Can I edit the generated website?", a: "Yes. You can use the live AI Assistant prompt bar inside the Canvas Editor to tweak headlines, change colors, or adjust layout sections." }
  ];

  return (
    <div className={`relative min-h-screen flex flex-col transition-colors duration-300 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      <AnimatedBackground />
      <LandingNavbar />

      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex-1 w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 inline-block">
            Frequently Asked Questions
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Got Questions? <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-pink-500">We Have Answers</span>
          </h1>
        </div>

        <div className="space-y-4">
          {faqs.map((f, idx) => (
            <div key={idx} className={`rounded-3xl border overflow-hidden shadow-md ${
              isLight ? 'bg-white/90 border-slate-200 text-slate-900' : 'bg-slate-900/80 border-slate-800 text-white'
            }`}>
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-6 text-left font-bold text-base flex items-center justify-between gap-4"
              >
                <span>{f.q}</span>
                <ChevronDown className={`w-5 h-5 text-indigo-500 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className={`px-6 pb-6 text-xs sm:text-sm leading-relaxed border-t pt-4 ${
                  isLight ? 'text-slate-600 border-slate-100' : 'text-slate-400 border-slate-800/80'
                }`}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
