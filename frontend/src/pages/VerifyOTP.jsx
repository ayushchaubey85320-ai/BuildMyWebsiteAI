import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../api';
import AnimatedBackground from '../components/AnimatedBackground';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState('Verification code dispatched to your registered email.');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Missing email context. Please sign up or login again.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const resp = await api.post('/auth/verify-otp', { email, otp_code: otpCode });
      localStorage.setItem('buildmywebsiteai_token', resp.data.access_token);
      localStorage.setItem('buildmywebsiteai_user', JSON.stringify(resp.data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      await api.post('/auth/forgot-password', { email });
      setInfoMsg('New 6-digit OTP code dispatched!');
    } catch (err) {
      setError('Could not resend OTP code.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-8 glass-panel rounded-3xl border border-slate-700/60 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Verify Email OTP</h1>
          <p className="text-sm text-slate-400 mt-1">
            Enter the 6-digit security code sent to <br />
            <span className="text-indigo-300 font-medium">{email || 'your email address'}</span>
          </p>
        </div>

        {infoMsg && !error && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center">
            {infoMsg}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 text-center">
              6-Digit Security Code
            </label>
            <input
              type="text"
              maxLength={6}
              required
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-3xl font-black tracking-[12px] py-4 rounded-2xl bg-slate-900/80 border border-indigo-500/40 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length !== 6}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
          >
            <span>{loading ? 'Verifying...' : 'Complete Verification'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={handleResend}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-300 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Resend OTP Code</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
