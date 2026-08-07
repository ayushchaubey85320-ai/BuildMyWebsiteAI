import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isLight = themeMode === 'light';

  useEffect(() => {
    /* global google */
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: '702327971210-5eo4gladvjb1j9iqt6i6u6d39phe6pht.apps.googleusercontent.com',
        callback: handleGoogleCallback,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('googleSignUpBtn'),
        { theme: 'outline', size: 'large', width: '100%', shape: 'pill' }
      );
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

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const resp = await api.post('/auth/signup', {
        full_name: fullName,
        email,
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
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider mb-1.5" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none transition text-sm ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

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

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider mb-1.5" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>
                Create Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none transition text-sm ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                  }`}
                />
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
            <span className="bg-slate-900 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 absolute">OR</span>
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
