import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { 
  X, Check, ShieldCheck, ArrowRight, Loader2, Sparkles, 
  Smartphone, Copy, CheckCircle2, QrCode, Image as ImageIcon,
  KeyRound, AlertCircle
} from 'lucide-react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

const UPIPaymentModal = ({ isOpen, onClose, onPaymentSuccess, quotaInfo }) => {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [utrNumber, setUtrNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [qrType, setQrType] = useState('dynamic'); // 'dynamic' (auto ₹1) or 'original' (Paytm card)

  if (!isOpen) return null;

  const upiId = quotaInfo?.upi_id || "7983933436@ptaxis";
  const payeeName = quotaInfo?.payee_name || "Ayush Chaubey";
  const amount = quotaInfo?.cost_per_website || 1;
  const originalQrUrl = quotaInfo?.qr_image_url || "/upi_payment_qr.jpg";

  // Standard NPCI UPI URI — automatically opens UPI app with ₹1.00 prefilled
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=1.00&cu=INR&tn=BuildMyWebsiteAI`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const cleanUtr = utrNumber.trim().replace(/\s+/g, '');
    if (cleanUtr.length !== 12 || !/^\d{12}$/.test(cleanUtr)) {
      setError('Please enter the complete 12-digit UPI Reference Number / UTR from your payment receipt.');
      return;
    }

    setVerifying(true);

    try {
      const resp = await api.post('/payment/verify-upi', {
        utr_reference: cleanUtr,
        upi_id: upiId,
        amount: amount,
        notes: "1 Additional Website Creation Credit (₹1 UPI)"
      });

      setSuccess(true);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setTimeout(() => {
        if (onPaymentSuccess) {
          onPaymentSuccess(resp.data);
        }
      }, 1000);
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || 'Verification failed. Please check your UTR and try again.';
      setError(detail);
      setVerifying(false);
    }
  };

  const isUtrComplete = utrNumber.length === 12;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          className={`relative w-full max-w-sm rounded-3xl border shadow-2xl p-6 overflow-hidden transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-xl transition ${
              isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-600' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Minimalist Header */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Unlock Website — Only ₹1</span>
            </div>
            <h3 className="text-xl font-black tracking-tight">Scan & Pay ₹1</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Scan with any UPI app. ₹1 is auto-filled instantly!
            </p>
          </div>

          {/* Scanner Card */}
          <div className={`relative p-3.5 rounded-2xl border flex flex-col items-center shadow-inner ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
          }`}>
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/50 dark:bg-slate-900 border border-slate-300/40 dark:border-slate-800 mb-2.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setQrType('dynamic')}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                  qrType === 'dynamic'
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Auto ₹1 Scanner</span>
              </button>
              <button
                type="button"
                onClick={() => setQrType('original')}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                  qrType === 'original'
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Paytm Card</span>
              </button>
            </div>

            {/* QR Box with Glowing Border */}
            <div className="relative p-2.5 bg-white rounded-2xl shadow-lg border-2 border-sky-400/40">
              {qrType === 'dynamic' ? (
                <QRCodeSVG
                  value={upiDeepLink}
                  size={180}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "/favicon.ico",
                    x: undefined,
                    y: undefined,
                    height: 26,
                    width: 26,
                    excavate: true,
                  }}
                />
              ) : (
                <div className="w-[180px] h-[180px] flex items-center justify-center overflow-hidden rounded-xl">
                  <img
                    src={originalQrUrl}
                    alt="Paytm QR"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Scanning visual overlay bar */}
              <motion.div
                className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-sky-500 to-transparent shadow-[0_0_8px_#0ea5e9]"
                animate={{ top: ['10%', '90%', '10%'] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* Payee Info */}
            <div className="mt-2.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                <span className={isLight ? 'text-slate-800' : 'text-slate-100'}>{payeeName}</span>
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-sky-500 text-white text-[9px]">
                  ✓
                </span>
              </div>
              <button
                onClick={handleCopyUPI}
                className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-mono font-medium text-sky-400 hover:text-sky-300 transition"
                title="Click to copy UPI ID"
              >
                <span>{upiId}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Quick Pay on Mobile button */}
          <div className="mt-2.5">
            <a
              href={upiDeepLink}
              className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-[11px] font-bold flex items-center justify-center gap-1.5 transition text-slate-300"
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span>Tap to Open in UPI App (GPay / PhonePe)</span>
            </a>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mt-2.5 p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] text-center font-medium flex items-center justify-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Mandatory 12-Digit UTR Verification Form */}
          <form onSubmit={handleVerify} className="mt-3 space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-sky-400" />
                  <span>Enter 12-Digit UPI UTR</span>
                </label>
                <span className={`text-[10px] font-mono font-bold ${
                  isUtrComplete ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  {isUtrComplete ? '✓ 12/12 digits' : `${utrNumber.length}/12 digits`}
                </span>
              </div>

              <input
                type="text"
                required
                maxLength={12}
                placeholder="e.g. 429512345678"
                value={utrNumber}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
                  setUtrNumber(cleaned);
                  if (error) setError('');
                }}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-sky-500 transition ${
                  isLight 
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400' 
                    : 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500'
                }`}
              />
              <p className="text-[10px] text-slate-400 text-center mt-1">
                Found on your payment receipt as "UPI Ref ID" or "UTR".
              </p>
            </div>

            <button
              type="submit"
              disabled={verifying || success || !isUtrComplete}
              className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition disabled:cursor-not-allowed ${
                isUtrComplete
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-emerald-500/25 transform hover:scale-[1.01]'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying UTR Receipt...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Verified! Unlocking Website...</span>
                </>
              ) : isUtrComplete ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Verify UTR & Unlock Website (+1 Credit)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <span>Enter 12-Digit UTR to Unlock ({12 - utrNumber.length} digits left)</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UPIPaymentModal;
