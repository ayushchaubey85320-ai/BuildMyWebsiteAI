import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Laptop, Flame, Zap, Download, ShieldCheck, Globe, Rocket, Star, Heart, ArrowRight } from 'lucide-react';
import LandingNavbar from '../components/LandingNavbar';
import AnimatedBackground from '../components/AnimatedBackground';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = [
  { 
    name: "Salon, Spa & Beauty Parlour", 
    icon: Sparkles, 
    desc: "Hair stylists, luxury nail spas, revitalizing facial treatments & bridal makeover packages.", 
    badge: "High Demand",
    pages: ["Home", "About Us", "Services", "Bridal Packages", "Contact Us"]
  },
  { 
    name: "Coaching Classes, Tuition & Academies", 
    icon: Laptop, 
    desc: "Private coaching institutes, entrance test prep, STEM tutoring & preschool daycares.", 
    badge: "Education",
    pages: ["Home", "About Us", "Courses", "Faculty & Mentors", "Admission Process", "Contact Us"]
  },
  { 
    name: "Fitness Gym, Yoga & Personal Training", 
    icon: Rocket, 
    desc: "Local fitness gyms, CrossFit centers, yoga sanctuaries & certified personal trainers.", 
    badge: "Active",
    pages: ["Home", "About Us", "Workout Programs", "Trainers & Mentors", "Contact Us"]
  },
  { 
    name: "Dentist & Medical Healthcare Clinic", 
    icon: ShieldCheck, 
    desc: "Family dentists, pediatricians, local wellness clinics & diagnostic centers.", 
    badge: "Essential",
    pages: ["Home", "About Clinic", "Dental Services", "Doctor OPD Schedule", "Contact Us"]
  },
  { 
    name: "Restaurant, Café & Artisan Bakery", 
    icon: Flame, 
    desc: "Local eateries, artisan sourdough bakeries, espresso cafes & fine dining bistros.", 
    badge: "Popular",
    pages: ["Home", "Our Story", "Signature Menu", "Chef Specials", "Table Booking"]
  },
  { 
    name: "Plumbing, Electrician & Handyman", 
    icon: Rocket, 
    desc: "24/7 emergency plumbers, licensed residential electricians & HVAC contractors.", 
    badge: "Emergency",
    pages: ["Home", "Services", "Emergency Repair", "Safety Guarantee", "Contact Us"]
  },
  { 
    name: "Real Estate Broker & Property Dealer", 
    icon: Globe, 
    desc: "Commercial & residential property dealers, verified listings & buyer advisory.", 
    badge: "High Value",
    pages: ["Home", "Featured Properties", "Buyer Advisory", "Investment Guide", "Contact Us"]
  },
  { 
    name: "Lawyer, Advocate & Legal Consultancy", 
    icon: ShieldCheck, 
    desc: "Civil & corporate advocates, estate planning attorneys, and legal advisory.", 
    badge: "Trusted",
    pages: ["Home", "Practice Areas", "Legal Counsel", "Case Assessment", "Contact Us"]
  },
  { 
    name: "Auto Repair, Garage & Car Detailing", 
    icon: Zap, 
    desc: "Automotive repair garages, wheel alignment, periodic service & ceramic detailing.", 
    badge: "Automotive",
    pages: ["Home", "Mechanical Repairs", "Detailing Packages", "Customer Reviews", "Contact Us"]
  },
  { 
    name: "Interior Design & Architecture Studio", 
    icon: Star, 
    desc: "Residential interior design, turnkey modular kitchens & luxury architecture consultancies.", 
    badge: "Creative",
    pages: ["Home", "Portfolio Gallery", "Design Process", "Material Finishes", "Contact Us"]
  },
  { 
    name: "Pet Care, Veterinary & Dog Grooming", 
    icon: Heart, 
    desc: "Pet grooming spas, veterinary clinics, pet boarding kennels & puppy training.", 
    badge: "Pet Care",
    pages: ["Home", "Grooming Spas", "Veterinary Care", "Boarding Guidelines", "Contact Us"]
  },
  { 
    name: "Cleaning & Janitorial Services", 
    icon: Sparkles, 
    desc: "Deep house cleaning, sanitized sofa shampooing & corporate janitorial contracts.", 
    badge: "In Demand",
    pages: ["Home", "Cleaning Services", "Hygiene Checklist", "Commercial Cleaning", "Contact Us"]
  }
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
          <span className="text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 inline-block">
            High-Demand Industry Engines
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Specialized Categories for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-pink-500">Every Business</span>
          </h1>
          <p className={`text-sm sm:text-base font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Each category generates authentic domain-specific legal copywriting, high-res curated imagery, and customizable multi-page architectures with user prompts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {CATEGORIES.map((cat, idx) => {
            const IconComp = cat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.03 }}
                className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between shadow-lg space-y-4 ${
                  isLight ? 'bg-white/90 border-slate-200 text-slate-900' : 'bg-slate-900/80 border-slate-800 text-white'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold">{cat.name}</h3>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{cat.desc}</p>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block mb-1.5">
                      Supported Multi-Page Flow:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {cat.pages.map((p, pIdx) => (
                        <span 
                          key={pIdx} 
                          className={`text-[10px] px-2 py-0.5 rounded-md border ${
                            isLight ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-950 text-slate-300 border-slate-800'
                          }`}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Link
                  to="/signup"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-center transition flex items-center justify-center gap-1.5"
                >
                  <span>Build For {cat.name.split(',')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
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
