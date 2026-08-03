import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import api from '../api';
import AnimatedBackground from '../components/AnimatedBackground';

const Signup = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const resp = await api.post('/auth/register', {
        full_name: fullName,
        email,
        password
      });

      if (resp.data.access_token) {
        localStorage.setItem('buildmywebsiteai_token', resp.data.access_token);
        localStorage.setItem('buildmywebsiteai_user', JSON.stringify(resp.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
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
          className="p-8 glass-panel rounded-3xl border border-sky-200/80 shadow-2xl shadow-sky-500/10 space-y-6"
        >
          {/* Header Branding */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-3xl font-black tracking-tight mb-2">
              <span className="bg-gradient-to-r from-cyan-500 via-sky-400 to-pink-400 bg-clip-text text-transparent font-black">
                BuildMyWebsite
              </span>
              <span className="text-slate-800">AI</span>
            </Link>
            <p className="text-xs text-slate-500 font-medium">
              Create your account to start generating websites in seconds
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-pink-50 border border-pink-200 text-pink-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-pink-400 hover:from-cyan-500 hover:to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition transform hover:scale-[1.02] disabled:opacity-50 mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <>
                  <span>Create Account</span>
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
              <span className="bg-slate-50 px-3 text-slate-400 font-semibold">OR CONTINUE WITH</span>
            </div>
          </div>

          {/* Google One-Tap Sign In */}
          <div id="googleSignUpBtn" className="w-full min-h-[40px] flex justify-center" />

          {/* Footer Link */}
          <p className="text-center text-xs text-slate-500 pt-2 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-500 font-bold hover:text-pink-500 transition">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
