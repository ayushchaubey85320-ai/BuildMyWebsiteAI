import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Sparkles } from 'lucide-react';
import LandingNavbar from '../components/LandingNavbar';
import AnimatedBackground from '../components/AnimatedBackground';
import { useTheme } from '../context/ThemeContext';

export default function PricingPage() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  return (
    <div className={`relative min-h-screen flex flex-col transition-colors duration-300 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      <AnimatedBackground />
      <LandingNavbar />

      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex-1">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block">
            Transparent Pricing
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Start Building <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-pink-500">Free Today</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Starter Plan */}
          <div className={`p-8 rounded-3xl border flex flex-col justify-between space-y-6 shadow-xl ${
            isLight ? 'bg-white/90 border-slate-200 text-slate-900' : 'bg-slate-900/80 border-slate-800 text-white'
          }`}>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Starter Creator</h3>
              <div className="text-4xl font-black">$0 <span className={`text-xs font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>/ forever free</span></div>
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
      </main>
    </div>
  );
}
