import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { 
  X, Check, ShieldCheck, ArrowRight, Loader2, Sparkles, 
  Smartphone, Copy, CheckCircle2, QrCode, Image as ImageIcon,
  Clock, AlertCircle, RefreshCw
} from 'lucide-react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

const UPIPaymentModal = ({ isOpen, onClose, onPaymentSuccess, quotaInfo }) => {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  // Modal Flow State: 'SCAN' | 'AWAITING_APPROVAL' | 'APPROVED' | 'DENIED'
  const [modalState, setModalState] = useState('SCAN');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingPaymentId, setPendingPaymentId] = useState(null);
  const [qrType, setQrType] = useState('dynamic'); // 'dynamic' (auto ₹1) or 'original' (Paytm card)

  const pollTimerRef = useRef(null);

  const upiId = quotaInfo?.upi_id || "7983933436@ptaxis";
  const payeeName = quotaInfo?.payee_name || "Ayush Chaubey";
  const amount = quotaInfo?.cost_per_website || 1;
  const originalQrUrl = quotaInfo?.qr_image_url || "/upi_payment_qr.jpg";

  // Standard NPCI UPI URI — automatically opens UPI app with ₹1.00 prefilled
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=1.00&cu=INR&tn=BuildMyWebsiteAI`;

  // Stop polling on unmount or close
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. User clicks "I Have Paid ₹1 via UPI" -> Submits request without reference ID
  const handleRequestApproval = async () => {
    setError('');
    setLoading(true);

    try {
      const resp = await api.post('/payment/request-approval', {
        upi_id: upiId,
        amount: amount,
        notes: "1 Additional Website Credit (₹1 UPI - Pending Mobile Approval)"
      });

      const pId = resp.data.payment_id;
      setPendingPaymentId(pId);
      setModalState('AWAITING_APPROVAL');
      setLoading(false);

      // Start real-time polling every 2.5s for Super Admin approval
      startApprovalPolling(pId);
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || 'Failed to submit payment request. Please try again.';
      setError(detail);
      setLoading(false);
    }
  };

  // 2. Poll payment status until Approved or Denied
  const startApprovalPolling = (paymentId) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    pollTimerRef.current = setInterval(async () => {
      try {
        const resp = await api.get(`/payment/status/${paymentId}`);
        const status = resp.data.status;

        if (status === 'COMPLETED') {
          clearInterval(pollTimerRef.current);
          setModalState('APPROVED');

          // Trigger celebratory confetti
          try {
            confetti({
              particleCount: 90,
              spread: 75,
              origin: { y: 0.6 }
            });
          } catch (e) {}

          setTimeout(() => {
            if (onPaymentSuccess) {
              onPaymentSuccess(resp.data);
            }
          }, 1800);
        } else if (status === 'REJECTED' || status === 'REVOKED_UNVERIFIED') {
          clearInterval(pollTimerRef.current);
          setModalState('DENIED');
        }
      } catch (err) {
        // Silently continue polling on transient network hiccups
      }
    }, 2500);
  };

  const handleReset = () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    setModalState('SCAN');
    setError('');
    setLoading(false);
  };

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
            onClick={() => {
              if (pollTimerRef.current) clearInterval(pollTimerRef.current);
              onClose();
            }}
            className={`absolute top-4 right-4 p-2 rounded-xl transition ${
              isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-600' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* STATE 1: SCANNER & 1-CLICK VERIFY */}
          {modalState === 'SCAN' && (
            <div>
              {/* Minimalist Header */}
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-2">
                  <Sparkles className="w-3 h-3" />
                  <span>Unlock Website — Only ₹1</span>
                </div>
                <h3 className="text-xl font-black tracking-tight">Scan & Pay ₹1</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Scan QR, pay ₹1, and tap below. No reference ID needed!
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

              {/* 1-Tap Verification Button (No Reference ID required) */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleRequestApproval}
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/25 transform active:scale-95 transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Approval Request...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>I Have Paid ₹1 — Request Approval</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-2">
                  Once clicked, a live prompt appears on Super Admin's phone to verify and grant credit.
                </p>
              </div>
            </div>
          )}

          {/* STATE 2: AWAITING SUPER ADMIN APPROVAL (Real-Time Spinner) */}
          {modalState === 'AWAITING_APPROVAL' && (
            <div className="py-6 text-center space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full bg-sky-500/20 animate-ping" />
                <div className="relative w-20 h-20 rounded-full border-4 border-sky-400 border-t-transparent animate-spin flex items-center justify-center bg-slate-900 shadow-xl">
                  <Smartphone className="w-7 h-7 text-sky-400" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black tracking-tight text-white">
                  Waiting for Super Admin Approval...
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-[260px] mx-auto leading-relaxed">
                  A live alert popup has been sent to <b className="text-white">Ayush Chaubey's</b> mobile companion app.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-left text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Payment Amount</span>
                  <span className="font-bold text-emerald-400 font-mono">₹1.00 INR</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Status</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    Pending Approval
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Payee UPI</span>
                  <span className="font-mono text-slate-300 font-medium">{upiId}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-sky-400 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Checking approval status automatically...</span>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-slate-500 hover:text-slate-300 underline font-medium"
              >
                Back to Scanner
              </button>
            </div>
          )}

          {/* STATE 3: APPROVED (Success celebration) */}
          {modalState === 'APPROVED' && (
            <div className="py-6 text-center space-y-4">
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>

              <div>
                <h3 className="text-xl font-black text-white">Payment Approved!</h3>
                <p className="text-xs text-emerald-400 mt-1 font-bold">
                  ✓ 1 Website Creation Credit Added Successfully!
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Approved directly from Super Admin's mobile app. Unlocking website...
                </p>
              </div>
            </div>
          )}

          {/* STATE 4: DENIED */}
          {modalState === 'DENIED' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 mx-auto flex items-center justify-center">
                <AlertCircle className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Payment Not Approved</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  The payment request was denied by the administrator. Please make sure you transferred ₹1 to <b className="text-white">{upiId}</b> and try again.
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md transition"
              >
                Try Again
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UPIPaymentModal;
