import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import api from '../api';
import AnimatedBackground from '../components/AnimatedBackground';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setError(err.response?.data?.detail || 'Google Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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
    <div className="relative min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-white rounded-3xl border border-sky-200 shadow-2xl shadow-sky-500/10 space-y-6"
        >
          {/* Header Branding */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-3xl font-black tracking-tight mb-2">
              <span className="bg-gradient-to-r from-cyan-500 via-sky-400 to-pink-500 bg-clip-text text-transparent font-black">
                BuildMyWebsite
              </span>
              <span className="text-slate-900">AI</span>
            </Link>
            <p className="text-xs text-slate-600 font-semibold">
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
              <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-400/30 transition text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-400/30 transition text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-pink-500 hover:from-cyan-500 hover:to-pink-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition transform hover:scale-[1.02] disabled:opacity-50 mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-600 font-bold uppercase tracking-wider">OR CONTINUE WITH</span>
            </div>
          </div>

          {/* Google Sign In */}
          <div id="googleSignInBtn" className="w-full min-h-[40px] flex justify-center" />

          {/* Footer Link */}
          <p className="text-center text-xs text-slate-600 font-bold pt-2">
            Don't have an account?{' '}
            <Link to="/signup" className="text-sky-600 font-black hover:text-pink-600 transition">
              Create Account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
