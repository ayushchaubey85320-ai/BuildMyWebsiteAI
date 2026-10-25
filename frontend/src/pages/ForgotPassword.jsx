import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff, ShieldCheck, Check } from 'lucide-react';
import api from '../api';
import AnimatedBackground from '../components/AnimatedBackground';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');

  const [step, setStep] = useState(tokenParam ? 2 : 1); // 1: Request OTP/Link, 2: Reset Password
  const [email, setEmail] = useState(() => sessionStorage.getItem('reset_email') || '');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordInputRef = useRef(null);

  useEffect(() => {
    if (tokenParam) {
      setStep(2);
      setMsg('Reset token detected. Enter your new password below.');
    }
  }, [tokenParam]);

  // Password validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasLower = /[a-z]/.test(newPassword);
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasLower && hasUpper && hasNumber && hasSpecial;

  // OTP completion check: either via URL token or exactly 6 numeric digits
  const isOtpComplete = Boolean(tokenParam) || otpCode.trim().length === 6;

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);

    try {
      const cleanEmail = email.trim();
      const res = await api.post('/auth/forgot-password', { email: cleanEmail });
      sessionStorage.setItem('reset_email', cleanEmail);
      setStep(2);
      setMsg(res.data?.message || 'Verification code has been sent to your email inbox.');
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        (err.code === 'ECONNABORTED'
          ? 'Server connection timed out (backend is waking up). Please try once more.'
          : null) ||
        err.message ||
        'Request failed. Please check your connection or try again.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    // Strictly restrict to digits only and maximum 6 characters
    const cleanDigits = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtpCode(cleanDigits);

    // Auto-focus the password field the moment 6 digits are reached
    if (cleanDigits.length === 6) {
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = (e.clipboardData || window.clipboardData).getData('text');
    const cleanDigits = pasteData.replace(/\D/g, '').slice(0, 6);
    setOtpCode(cleanDigits);
    if (cleanDigits.length === 6) {
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isOtpComplete) {
      setError('Please enter the 6-digit security OTP code first.');
      return;
    }

    if (!hasMinLength) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!hasLower) {
      setError('Password must contain at least 1 lowercase letter (a-z).');
      return;
    }
    if (!hasUpper) {
      setError('Password must contain at least 1 uppercase letter (A-Z).');
      return;
    }
    if (!hasNumber) {
      setError('Password must contain at least 1 number (0-9).');
      return;
    }
    if (!hasSpecial) {
      setError('Password must contain at least 1 special character (e.g. !@#$%^&*).');
      return;
    }

    setLoading(true);

    try {
      const payload = tokenParam
        ? { token: tokenParam, new_password: newPassword }
        : { email: email.trim(), otp_code: otpCode.trim(), new_password: newPassword };

      await api.post('/auth/reset-password', payload);
      sessionStorage.removeItem('reset_email');
      setMsg('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Reset failed. Please verify your OTP code and try again.');
    } finally {
      setLoading(false);
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
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Recover Password</h1>
          <p className="text-sm text-slate-400 mt-1">
            {step === 1 ? 'Dispatch a 6-digit security OTP code to your inbox' : 'Verify code & configure your new secure password'}
          </p>
        </div>

        {msg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-5" autoComplete="off">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  name="recovery_email_input"
                  id="recovery_email_input"
                  required
                  autoComplete="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700 text-white focus:outline-none focus:border-amber-500 transition text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition disabled:opacity-50"
            >
              <span>{loading ? 'Sending Code...' : 'Dispatch Reset OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-5" autoComplete="off">
            {/* Decoy hidden fields to prevent browsers from autofilling saved credentials into OTP / Password */}
            <input type="text" name="fake_username_remember" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            <input type="password" name="fake_password_remember" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

            {!tokenParam && (
              <>
                {/* Email Context indicator if already entered */}
                {email ? (
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 truncate">
                      Resetting for: <strong className="text-white">{email}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-amber-400 hover:underline font-semibold ml-2 shrink-0 text-[11px]"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Registered Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                )}

                {/* 6-Digit OTP Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      6-Digit Security OTP
                    </label>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      otpCode.length === 6 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {otpCode.length === 6 ? '✓ 6 Digits Complete' : `${otpCode.length} / 6 Digits`}
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      name="security_otp_code"
                      id="security_otp_code"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      maxLength={6}
                      required
                      placeholder="• • • • • •"
                      value={otpCode}
                      onChange={handleOtpChange}
                      onPaste={handleOtpPaste}
                      className="w-full text-center text-2xl font-black tracking-[12px] py-3.5 rounded-xl bg-slate-900/80 border border-slate-700 text-amber-400 focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                    Enter the 6-digit verification code from your email
                  </p>
                </div>
              </>
            )}

            {/* New Password Field - Gated by OTP Completion */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  New Password
                </label>
                {!isOtpComplete ? (
                  <span className="text-[10px] font-bold text-amber-400/90 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked until OTP entered
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Unlocked
                  </span>
                )}
              </div>

              <div className="relative">
                <Lock className={`absolute left-4 top-3.5 w-5 h-5 transition ${isOtpComplete ? 'text-slate-400' : 'text-slate-600'}`} />
                <input
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  name="user_new_password_reset"
                  id="user_new_password_reset"
                  autoComplete="new-password"
                  disabled={!isOtpComplete}
                  required
                  placeholder={isOtpComplete ? 'Min 8 chars, Aa1@' : 'Enter 6-digit OTP above to unlock'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3.5 rounded-xl border text-sm transition focus:outline-none ${
                    isOtpComplete 
                      ? 'bg-slate-900/80 border-slate-700 text-white focus:border-indigo-500 ring-1 ring-transparent focus:ring-indigo-500/30' 
                      : 'bg-slate-900/30 border-slate-800 text-slate-600 cursor-not-allowed opacity-50 select-none'
                  }`}
                />
                {isOtpComplete && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition p-0.5 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                )}
              </div>

              {/* Real-time Password Rules Checklist (visible once OTP entered and user begins typing) */}
              {isOtpComplete && newPassword.length > 0 && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] grid grid-cols-2 gap-1.5">
                  <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    {hasMinLength ? '✓' : '○'} 8+ characters
                  </span>
                  <span className={`flex items-center gap-1 ${hasUpper && hasLower ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    {hasUpper && hasLower ? '✓' : '○'} Upper & lower case
                  </span>
                  <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    {hasNumber ? '✓' : '○'} At least 1 number
                  </span>
                  <span className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    {hasSpecial ? '✓' : '○'} Special character (!@#)
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isOtpComplete || !isPasswordValid}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>
                {loading 
                  ? 'Updating Password...' 
                  : !isOtpComplete 
                  ? 'Enter 6-Digit OTP Above' 
                  : !isPasswordValid 
                  ? 'Complete Password Requirements' 
                  : 'Save New Password'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-xs text-slate-400">
          Remember your password?{' '}
          <Link to="/login" className="text-amber-400 font-semibold hover:underline">
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
