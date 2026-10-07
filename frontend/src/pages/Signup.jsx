import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail, Lock, User, ArrowRight, Loader2, AlertCircle, ArrowLeft,
  Check, X, Eye, EyeOff
} from 'lucide-react';
import api from '../api';
import AnimatedBackground from '../components/AnimatedBackground';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const Signup = () => {
  const navigate = useNavigate();
  const { themeMode } = useTheme();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isLight = themeMode === 'light';

  const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '702327971210-mpvaknnf4ipdlvvkgg7uf1fp0c8dq63u.apps.googleusercontent.com';

  useEffect(() => {
    const initGoogleAuth = () => {
      /* global google */
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });
        const btnContainer = document.getElementById('googleSignUpBtn');
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            shape: 'pill',
          });
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleAuth();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogleAuth;
      document.body.appendChild(script);
    }
  }, []);

  const handleGoogleCallback = async (response) => {
    setLoading(true);
    setError('');
    try {
      const resp = await api.post('/auth/google', { credential: response.credential });
      localStorage.setItem('buildmywebsiteai_token', resp.data.access_token);
      localStorage.setItem('buildmywebsiteai_user', JSON.stringify(resp.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  // Full name input handler: letters, numbers and spaces only, max 50 chars
  const handleFullNameChange = (e) => {
    const inputVal = e.target.value;
    // Strip any character that is not a letter, number, or space
    const filtered = inputVal.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 50);
    setFullName(filtered);
    if (error && error.includes('Full Name')) {
      setError('');
    }
  };

  // Password criteria calculations
  const passCriteria = {
    minLength: password.length >= 8,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^a-zA-Z0-9]/.test(password),
  };

  const strengthCount = Object.values(passCriteria).filter(Boolean).length;
  const isPasswordValid = strengthCount === 5;

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Full name validation
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }
    if (trimmedName.length > 50) {
      setError('Full name cannot exceed 50 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9 ]+$/.test(trimmedName)) {
      setError('Full name can only contain letters, numbers, and spaces.');
      return;
    }

    // 2. Password validation
    if (!passCriteria.minLength) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!passCriteria.hasLower) {
      setError('Password must contain at least 1 lowercase letter (a-z).');
      return;
    }
    if (!passCriteria.hasUpper) {
      setError('Password must contain at least 1 uppercase letter (A-Z).');
      return;
    }
    if (!passCriteria.hasNumber) {
      setError('Password must contain at least 1 number (0-9).');
      return;
    }
    if (!passCriteria.hasSpecial) {
      setError('Password must contain at least 1 special character (e.g. !@#$%^&*).');
      return;
    }

    setLoading(true);

    try {
      const resp = await api.post('/auth/signup', {
        full_name: trimmedName,
        email: email.trim().toLowerCase(),
        password
      });

      if (resp.data.require_otp) {
        navigate('/verify-otp', { state: { email, message: resp.data.message } });
      } else {
        localStorage.setItem('buildmywebsiteai_token', resp.data.access_token);
        localStorage.setItem('buildmywebsiteai_user', JSON.stringify(resp.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      let msg = 'Registration failed. Please try again.';
      if (typeof detail === 'string') msg = detail;
      else if (Array.isArray(detail)) msg = detail.map(d => d.msg || JSON.stringify(d)).join(', ');
      else if (err.message) msg = err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen flex flex-col justify-center items-center p-4 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      <AnimatedBackground />

      {/* Top Header with Circular Theme Switcher */}
      <header className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20">
        <Link to="/" className="flex items-center gap-2 text-xs font-bold opacity-80 hover:opacity-100 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <ThemeToggle />
      </header>

      <div className="relative z-10 w-full max-w-md my-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-8 rounded-3xl border shadow-2xl space-y-6 ${
            isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          {/* Header Branding */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-3xl font-black tracking-tight mb-2">
              <span className="bg-gradient-to-r from-cyan-500 via-sky-400 to-pink-500 bg-clip-text text-transparent font-black">
                BuildMyWebsite
              </span>
              <span className={isLight ? 'text-slate-900' : 'text-white'}>AI</span>
            </Link>
            <p className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Create a free account to generate & export AI websites
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-pink-50 border border-pink-200 text-pink-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            {/* Full Name Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>
                  Full Name
                </label>
                <span className={`text-[11px] font-medium ${fullName.length === 50 ? 'text-amber-500 font-bold' : isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {fullName.length}/50
                </span>
              </div>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  maxLength={50}
                  placeholder="Letters and numbers only (max 50)"
                  value={fullName}
                  onChange={handleFullNameChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none transition text-sm ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                  }`}
                />
              </div>
              <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Only letters and numbers are permitted (up to 50 characters).
              </p>
            </div>

            {/* Email Address Input */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider mb-1.5" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none transition text-sm ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            {/* Create Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>
                  Create Password
                </label>
                {password && (
                  <span className={`text-[11px] font-bold ${
                    isPasswordValid
                      ? 'text-emerald-500'
                      : strengthCount >= 3
                      ? 'text-amber-500'
                      : 'text-pink-500'
                  }`}>
                    {isPasswordValid ? 'Strong' : strengthCount >= 3 ? 'Medium' : 'Weak'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error && error.includes('Password')) setError('');
                  }}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none transition text-sm ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Requirements Checklist */}
              <div className={`mt-2.5 p-3 rounded-xl border space-y-1.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800/80'
              }`}>
                <p className={`text-[11px] font-bold tracking-wide uppercase ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Password Requirements:
                </p>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${passCriteria.minLength ? 'text-emerald-500 font-semibold' : isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {passCriteria.minLength ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 ml-1 mr-1" />}
                    <span>At least 8 chars</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passCriteria.hasUpper ? 'text-emerald-500 font-semibold' : isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {passCriteria.hasUpper ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 ml-1 mr-1" />}
                    <span>1 uppercase (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passCriteria.hasLower ? 'text-emerald-500 font-semibold' : isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {passCriteria.hasLower ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 ml-1 mr-1" />}
                    <span>1 lowercase (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passCriteria.hasNumber ? 'text-emerald-500 font-semibold' : isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {passCriteria.hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 ml-1 mr-1" />}
                    <span>1 number (0-9)</span>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 text-[11px] pt-0.5 ${passCriteria.hasSpecial ? 'text-emerald-500 font-semibold' : isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {passCriteria.hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 ml-1 mr-1" />}
                  <span>1 special character (e.g. !@#$%^&*)</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 transition transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-700/40 w-full" />
            <span className={`px-3 text-[11px] font-bold uppercase tracking-wider absolute ${
              isLight ? 'bg-white text-slate-500' : 'bg-slate-900 text-slate-500'
            }`}>
              OR
            </span>
          </div>

          <div id="googleSignUpBtn" className="w-full flex justify-center"></div>

          <div className="text-center pt-2 text-xs font-semibold text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 font-bold hover:underline">
              Log In Here
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
