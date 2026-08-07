import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X, ArrowRight, Layout } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const LandingNavbar = () => {
  const navigate = useNavigate();
  const { themeMode, colors } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const isLight = themeMode === 'light';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const token = localStorage.getItem('buildmywebsiteai_token');
    const userStr = localStorage.getItem('buildmywebsiteai_user');
    if (token && userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {}
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItemClass = ({ isActive }) =>
    `text-xs sm:text-sm font-bold transition px-3 py-1.5 rounded-full ${
      isActive
        ? 'bg-indigo-600 text-white shadow-md'
        : isLight
        ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? isLight
            ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200 py-3 shadow-lg'
            : 'bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 py-3 shadow-2xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isLight ? 'bg-slate-900' : 'bg-slate-950'}`}>
              <Sparkles className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className={`text-lg sm:text-xl font-black tracking-tight flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              BuildMyWebsite<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-cyan-500 to-pink-500">AI</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase hidden sm:inline-block">
              AI Web Generation Engine
            </span>
          </div>
        </Link>

        {/* Center Multi-Page Links */}
        <nav className={`hidden md:flex items-center gap-2 border px-4 py-1.5 rounded-full backdrop-blur-md shadow-inner ${
          isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-900/60 border-slate-800/80'
        }`}>
          <NavLink to="/" className={navItemClass} end>Home</NavLink>
          <NavLink to="/features" className={navItemClass}>Features</NavLink>
          <NavLink to="/showcase" className={navItemClass}>18 Categories</NavLink>
          <NavLink to="/how-it-works" className={navItemClass}>How It Works</NavLink>
          <NavLink to="/pricing" className={navItemClass}>Pricing</NavLink>
          <NavLink to="/faq" className={navItemClass}>FAQ</NavLink>
        </nav>

        {/* Right Top Actions (Login & Signup + CIRCULAR THEME TOGGLE BUTTON) */}
        <div className="hidden sm:flex items-center gap-3">
          {/* CIRCULAR THEME TOGGLE BUTTON */}
          <ThemeToggle />

          {user ? (
            <Link
              to={user.is_admin || user.email === 'admin@buildmywebsiteai.ai' ? '/admin' : '/dashboard'}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-105"
            >
              <Layout className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <>
              {/* LOGIN BUTTON */}
              <Link
                to="/login"
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold border transition duration-200 ${
                  isLight
                    ? 'text-slate-800 hover:text-indigo-600 bg-white border-slate-300 hover:border-indigo-400'
                    : 'text-slate-300 hover:text-white bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                Log In
              </Link>

              {/* SIGN UP BUTTON */}
              <Link
                to="/signup"
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Viewport Header Controls */}
        <div className="flex sm:hidden items-center gap-2">
          {/* CIRCULAR THEME TOGGLE BUTTON MOBILE */}
          <ThemeToggle />

          {user ? (
            <Link
              to="/dashboard"
              className="px-3.5 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/signup"
              className="px-3 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-bold"
            >
              Sign Up
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-xl border ${
              isLight ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Panel */}
      {mobileMenuOpen && (
        <div className={`md:hidden px-6 py-6 space-y-3 shadow-2xl border-b animate-in slide-in-from-top-3 duration-200 ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
        }`}>
          <nav className="flex flex-col gap-2">
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className={navItemClass} end>Home</NavLink>
            <NavLink to="/features" onClick={() => setMobileMenuOpen(false)} className={navItemClass}>Features</NavLink>
            <NavLink to="/showcase" onClick={() => setMobileMenuOpen(false)} className={navItemClass}>18 Categories</NavLink>
            <NavLink to="/how-it-works" onClick={() => setMobileMenuOpen(false)} className={navItemClass}>How It Works</NavLink>
            <NavLink to="/pricing" onClick={() => setMobileMenuOpen(false)} className={navItemClass}>Pricing</NavLink>
            <NavLink to="/faq" onClick={() => setMobileMenuOpen(false)} className={navItemClass}>FAQ</NavLink>
          </nav>

          {!user && (
            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl text-center font-bold text-sm bg-slate-900 text-white"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl text-center font-bold text-sm bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-lg"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
