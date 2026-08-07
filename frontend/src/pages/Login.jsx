import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../api';
import AnimatedBackground from '../components/AnimatedBackground';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const navigate = useNavigate();
  const { themeMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isLight = themeMode === 'light';

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      /* global google */
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: '702327971210-5eo4gladvjb1j9iqt6i6u6d39phe6pht.apps.googleusercontent.com',
          callback: handleGoogleCallback,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInBtn'),
          { theme: 'outline', size: 'large', width: '100%', shape: 'pill' }
        );
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleGoogleCallback = async (response) => {
    setLoading(true);
    setError('');
    try {
      const resp = await api.post('/auth/google', {
        credential: response.credential,
      });
      const userData = resp.data.user || resp.data;
      localStorage.setItem('buildmywebsiteai_token', resp.data.access_token);
      localStorage.setItem('buildmywebsiteai_user', JSON.stringify(userData));

      if (userData.is_admin || userData.email === 'admin@buildmywebsiteai.ai') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Google Authentication Failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const resp = await api.post('/auth/login', { email, password });
      const userData = resp.data.user || resp.data;

      localStorage.setItem('buildmywebsiteai_token', resp.data.access_token);
      localStorage.setItem('buildmywebsiteai_user', JSON.stringify(userData));

      if (userData.is_admin || userData.email === 'admin@buildmywebsiteai.ai') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        navigate('/verify-otp', { state: { email } });
      } else {
        const detail = err.response?.data?.detail;
        let msg = 'Login failed. Please check your credentials.';
        if (typeof detail === 'string') msg = detail;
        else if (Array.isArray(detail)) msg = detail.map(d => d.msg || JSON.stringify(d)).join(', ');
        else if (err.message) msg = err.message;
        setError(msg);
      }
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
              Sign in to your account to manage your AI websites
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-pink-50 border border-pink-200 text-pink-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider mb-2" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-bold text-indigo-500 hover:underline">
                  Forgot Password?
                </Link>
              </div>
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
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 transition transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In to Platform</span>}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-700/40 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 absolute">OR</span>
          </div>

          <div id="googleSignInBtn" className="w-full flex justify-center"></div>

          <div className="text-center pt-2 text-xs font-semibold text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-400 font-bold hover:underline">
              Create Free Account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
