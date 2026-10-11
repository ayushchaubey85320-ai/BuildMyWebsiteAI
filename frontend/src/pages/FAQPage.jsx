import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Sparkles } from 'lucide-react';
import LandingNavbar from '../components/LandingNavbar';
import AnimatedBackground from '../components/AnimatedBackground';
import { useTheme } from '../context/ThemeContext';

export default function FAQPage() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    { 
      q: "Can I create multi-page websites with custom pages and prompts?", 
      a: "Yes! In Multi-Page mode, you can toggle default pages (Home, About Us, Services, Contact Us) and manually add your own custom pages (e.g. 'Faculty & Mentors', 'Admission Process', 'Signature Treatments', 'Doctor OPD Schedule'). When you supply a custom prompt, the AI synthesizes deep, realistic hero headers, narrative stories, and offering cards tailored specifically to your prompt." 
    },
    { 
      q: "Are the buttons on the generated and exported websites functional?", 
      a: "Yes! All Call-to-Action and appointment buttons on exported websites are wired to an interactive modal popup dialog. Customers can submit their Name, Email, Country Code, and Phone Number with instant client-side feedback." 
    },
    { 
      q: "How does phone number validation work?", 
      a: "Both the creation wizard and the exported booking modal support international country codes with India (+91) as default. In addition, strict 10-digit Indian mobile validation (/^[6-9]\\d{9}$/) is enforced so only genuine phone numbers are accepted." 
    },
    { 
      q: "Why is there zero corporate tech jargon in local business websites?", 
      a: "We specifically instructed our generation engine to ban corporate SaaS jargon (such as 'How We Deliver Excellence', 'Cloud transformation', 'Agile delivery') on local businesses. Salon websites get authentic styling and beauty copy, fitness centers get workout and trainer copy, and coaching institutes get academic syllabus information." 
    },
    { 
      q: "Can I download the code and run it offline without Node.js or a backend?", 
      a: "Yes! When you click 'Export ZIP', you receive a standalone package with index.html, style.css, and separate HTML files for each page. You can double-click index.html and run it directly in any web browser via file:/// without any Node.js, Python, or server required." 
    },
    { 
      q: "Can I switch between Light Mode and Dark Mode?", 
      a: "Yes! The live preview canvas allows 1-click toggling between Light and Dark themes. The exported style.css uses dynamic CSS custom variables (--header-bg, --text-color, --card-bg) ensuring high contrast and optimal legibility in both modes." 
    },
    { 
      q: "How does the built-in AI Chatbot help me?", 
      a: "Our floating assistant copilot is available 24/7 in the corner of your screen. You can ask it questions on how to customize colors, modify HTML files, connect custom domains, or optimize your site's SEO." 
    },
    { 
      q: "What categories of websites are supported?", 
      a: "We focus on high-demand local businesses and service providers whose owners need automated website generation: Luxury Salons & Spas, Gyms & Yoga Studios, Coaching Classes & Academies, Dental Clinics, Bakeries & Cafes, Handymen & Plumbers, Real Estate, and Legal Consultants." 
    }
  ];

  return (
    <div className={`relative min-h-screen flex flex-col transition-colors duration-300 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      <AnimatedBackground />
      <LandingNavbar />

      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex-1 w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/20 inline-block">
            Frequently Asked Questions
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Got Questions? <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-pink-500">We Have Answers</span>
          </h1>
          <p className={`text-sm sm:text-base font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Everything you need to know about BuildMyWebsiteAI's multi-page generation and standalone export engine.
          </p>
        </div>

        <div className="space-y-4 mb-16">
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
