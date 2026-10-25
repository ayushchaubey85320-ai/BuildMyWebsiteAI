import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LocalNotifications } from '@capacitor/local-notifications';
import confetti from 'canvas-confetti';
import { 
  Bell, Users, BarChart3, Settings, CheckCircle2, XCircle, 
  AlertCircle, RefreshCw, Smartphone, Copy, Check, ShieldCheck, 
  Plus, Ban, PlayCircle, Crown, LogIn, ChevronRight, Zap, Volume2, VolumeX,
  IndianRupee, Layers, X, ArrowRight, ShieldAlert, Sparkles
} from 'lucide-react';

const DEFAULT_SERVER_URL = 'https://buildmywebsiteai-backend-okcf.onrender.com';

// Web Audio API synthesized cash register & bell alert chime
const playPaymentChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // First note (bell chime)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc1.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // A6
    gain1.gain.setValueAtTime(0.35, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.4);

    // Second note (crystal high ring)
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1318.5, ctx.currentTime); // E6
      gain2.gain.setValueAtTime(0.45, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.6);
    }, 120);
  } catch (e) {
    console.error("Audio chime error:", e);
  }
};

export default function App() {
  // State
  const [activeTab, setActiveTab] = useState('payments'); // 'payments', 'users', 'stats', 'settings'
  const [serverUrl, setServerUrl] = useState(() => {
    const saved = localStorage.getItem('bmwa_server_url');
    if (!saved || saved.includes('192.168.') || saved.includes('localhost') || !saved.includes('onrender.com')) {
      return DEFAULT_SERVER_URL;
    }
    return saved;
  });
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('bmwa_admin_token') || '');
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem('bmwa_admin_email') || '');
  const [adminPassword, setAdminPassword] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pollInterval, setPollInterval] = useState(3); // seconds

  // Data State
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [copiedUtr, setCopiedUtr] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // URGENT APPROVAL POPUP MODAL STATE
  const [pendingApprovalModal, setPendingApprovalModal] = useState(null);

  const lastPaymentIdRef = useRef(0);
  const knownPaymentIds = useRef(new Set());
  const dismissedPopupIds = useRef(new Set());

  // Request Android notification permissions on startup
  useEffect(() => {
    try {
      LocalNotifications.requestPermissions().catch(() => {});
    } catch (e) {}
  }, []);

  // Show toast helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Helper Axios client
  const getApi = () => {
    return axios.create({
      baseURL: `${serverUrl.replace(/\/$/, '')}/api`,
      headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
      timeout: 8000
    });
  };

  // 1. Authenticate as Super Admin (No hardcoded credentials)
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!adminEmail.trim() || !adminPassword) {
      alert('Please enter your Super Admin email and password.');
      return;
    }

    try {
      const resp = await axios.post(`${serverUrl.replace(/\/$/, '')}/api/auth/login`, {
        email: adminEmail.trim(),
        password: adminPassword
      });
      const token = resp.data.access_token;
      setAdminToken(token);
      localStorage.setItem('bmwa_admin_token', token);
      localStorage.setItem('bmwa_admin_email', adminEmail.trim());
      localStorage.setItem('bmwa_server_url', serverUrl);
      setIsConnected(true);
      showToast('Logged in as Super Admin!');
      fetchFullData(token);
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  // 2. Fetch Notifications / Payments & Check Pending Approvals
  const pollPayments = async () => {
    if (!adminToken) return;
    try {
      const resp = await getApi().get(`/admin/mobile/notifications?last_id=0`);
      const newPayments = resp.data.payments || [];
      if (resp.data.stats) setStats(resp.data.stats);

      // Check for urgent pending payments that need approval
      const pendingPayment = newPayments.find(p => p.status === 'PENDING' && !dismissedPopupIds.current.has(p.id));
      if (pendingPayment && (!pendingApprovalModal || pendingApprovalModal.id !== pendingPayment.id)) {
        setPendingApprovalModal(pendingPayment);
        if (soundEnabled) playPaymentChime();
        if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 450]);

        // Trigger system notification for Android tray / lockscreen
        try {
          LocalNotifications.schedule({
            notifications: [{
              id: Math.abs(pendingPayment.id) || 101,
              title: '🔔 ₹1 UPI Payment Pending Approval',
              body: `${pendingPayment.user_name || pendingPayment.user_email} requested +1 website credit. Tap to approve!`,
              schedule: { at: new Date(Date.now() + 100) },
              sound: 'res://platform_default'
            }]
          });
        } catch (e) {}
      }

      // Check for any brand new completed payments for subtle chime
      let hasNew = false;
      newPayments.forEach(p => {
        if (!knownPaymentIds.current.has(p.id)) {
          knownPaymentIds.current.add(p.id);
          if (lastPaymentIdRef.current > 0 && p.id > lastPaymentIdRef.current) {
            hasNew = true;
          }
        }
      });

      if (hasNew && !pendingPayment) {
        if (soundEnabled) playPaymentChime();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        showToast('🔔 New ₹1 UPI Payment Activity!');
      }

      if (newPayments.length > 0) {
        lastPaymentIdRef.current = Math.max(...newPayments.map(p => p.id));
      }
      setPayments(newPayments);
      setIsConnected(true);
    } catch (err) {
      // Graceful fallback to /admin/users
      try {
        const uResp = await getApi().get('/admin/users');
        if (uResp.data && Array.isArray(uResp.data)) {
          setUsers(uResp.data);
          setIsConnected(true);
        }
      } catch (e2) {
        setIsConnected(false);
      }
    }
  };

  // 3. Fetch Full Data (Users & Payments)
  const fetchFullData = async (token = adminToken) => {
    setIsRefreshing(true);
    try {
      const api = axios.create({
        baseURL: `${serverUrl.replace(/\/$/, '')}/api`,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 8000
      });

      const [notifResp, usersResp, statsResp] = await Promise.allSettled([
        api.get(`/admin/mobile/notifications?last_id=0`),
        api.get('/admin/users'),
        api.get('/admin/stats')
      ]);

      if (notifResp.status === 'fulfilled' && notifResp.value.data) {
        const pList = notifResp.value.data.payments || [];
        setPayments(pList);
        pList.forEach(p => knownPaymentIds.current.add(p.id));
        if (pList.length > 0) lastPaymentIdRef.current = Math.max(...pList.map(p => p.id));

        // Check if there is an unhandled pending payment
        const pendingPayment = pList.find(p => p.status === 'PENDING' && !dismissedPopupIds.current.has(p.id));
        if (pendingPayment && !pendingApprovalModal) {
          setPendingApprovalModal(pendingPayment);
          if (soundEnabled) playPaymentChime();
          if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 450]);
        }
      }

      if (usersResp.status === 'fulfilled' && usersResp.value.data) {
        setUsers(usersResp.value.data);
      }

      if (statsResp.status === 'fulfilled' && statsResp.value.data) {
        setStats(statsResp.value.data);
      }

      setIsConnected(true);
    } catch (err) {
      setIsConnected(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 4. Quick Actions (Approve, Give Credits, Revoke, Reject, Toggle Suspend)
  const handleQuickAction = async (payload) => {
    setActionLoadingId(payload.payment_id ? `pay-${payload.payment_id}` : `usr-${payload.user_id}`);
    try {
      const resp = await getApi().post('/admin/mobile/quick-action', payload);
      showToast(resp.data.message || 'Action executed successfully!');

      if (payload.action === 'APPROVE') {
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        } catch (e) {}
      }

      if (pendingApprovalModal && pendingApprovalModal.id === payload.payment_id) {
        setPendingApprovalModal(null);
      }

      fetchFullData();
    } catch (err) {
      // Fallback endpoints if mobile quick-action endpoint hasn't synced
      try {
        if (payload.action === 'APPROVE' && payload.payment_id) {
          const resp = await getApi().post(`/admin/payments/${payload.payment_id}/approve`);
          showToast(resp.data.message || 'Approved payment & added credit!');
          if (pendingApprovalModal && pendingApprovalModal.id === payload.payment_id) {
            setPendingApprovalModal(null);
          }
          fetchFullData();
          return;
        } else if (payload.action === 'REJECT' && payload.payment_id) {
          const resp = await getApi().post(`/admin/payments/${payload.payment_id}/reject`);
          showToast(resp.data.message || 'Payment denied.');
          if (pendingApprovalModal && pendingApprovalModal.id === payload.payment_id) {
            setPendingApprovalModal(null);
          }
          fetchFullData();
          return;
        } else if (payload.action === 'GIVE_CREDITS') {
          const resp = await getApi().put(`/admin/users/${payload.user_id}/credits`, {
            amount: payload.credits || 1,
            action: 'ADD'
          });
          showToast(resp.data.message || 'Credits granted successfully!');
          fetchFullData();
          return;
        } else if (payload.action === 'TOGGLE_ADMIN') {
          const resp = await getApi().put(`/admin/users/${payload.user_id}/toggle-admin`);
          showToast(resp.data.message || 'Admin status updated!');
          fetchFullData();
          return;
        } else if (payload.action === 'TOGGLE_SUSPEND') {
          const resp = await getApi().put(`/admin/users/${payload.user_id}/toggle-suspend`, {
            is_suspended: payload.is_suspended,
            reason: payload.reason || 'Service updated by Super Admin.'
          });
          showToast(resp.data.message || 'Service status updated!');
          fetchFullData();
          return;
        }
      } catch (fallbackErr) {}
      alert('Action failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Polling loop
  useEffect(() => {
    if (adminToken) {
      fetchFullData();
      const interval = setInterval(pollPayments, pollInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [adminToken, serverUrl, pollInterval]);

  const copyUtr = (utr) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(''), 2000);
  };

  // Filtered Users
  const filteredUsers = users.filter(u => 
    (u.full_name && u.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header Bar */}
      <header className="safe-top px-4 pt-3 pb-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-sky-500 to-pink-500 flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black tracking-tight">BMWA Companion</h1>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-red-400'}`} />
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Super Admin Mobile Gateway</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs transition ${
              soundEnabled ? 'border-sky-500/40 text-sky-400 bg-sky-500/10' : 'border-slate-800 text-slate-500'
            }`}
            title="Toggle Notification Chime"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => fetchFullData()}
            className="p-2 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-300 transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mx-4 mt-2 p-2.5 rounded-xl bg-emerald-500 text-white text-xs font-black flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🚨 CRITICAL POPUP MODAL: URGENT PAYMENT APPROVAL REQUEST */}
      {/* ========================================================= */}
      {pendingApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl border-2 border-amber-500/60 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl shadow-amber-500/20 text-white">
            {/* Pulsating Beacon Alert */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <div className="absolute inset-0 rounded-xl bg-amber-500/30 animate-ping" />
                  <Bell className="w-4 h-4 relative z-10" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Payment Approval Request
                  </span>
                  <div className="text-xs font-black text-white">Action Required</div>
                </div>
              </div>

              <button
                onClick={() => {
                  dismissedPopupIds.current.add(pendingApprovalModal.id);
                  setPendingApprovalModal(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Request Card Content */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 mb-4 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-black text-sm text-white">
                    {pendingApprovalModal.user_name || 'Client User'}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {pendingApprovalModal.user_email}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-400">₹{pendingApprovalModal.amount}.00</span>
                  <div className="text-[9px] text-slate-500">1 Website</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
                <span>Current Credits:</span>
                <span className="font-bold text-sky-400">+{pendingApprovalModal.user_credits} websites</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Payee UPI:</span>
                <span className="font-mono text-slate-300 font-medium">{pendingApprovalModal.upi_id}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center mb-4 leading-relaxed">
              Once you tap <b className="text-emerald-400">Approve</b>, 1 website creation credit will be added to the user's account immediately.
            </p>

            {/* Action Buttons: APPROVE vs DENY */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickAction({ action: 'REJECT', payment_id: pendingApprovalModal.id })}
                disabled={actionLoadingId === `pay-${pendingApprovalModal.id}`}
                className="py-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <X className="w-4 h-4" />
                <span>Deny Request</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAction({ action: 'APPROVE', payment_id: pendingApprovalModal.id, credits: 1 })}
                disabled={actionLoadingId === `pay-${pendingApprovalModal.id}`}
                className="py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 transition active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Approve (+1 Credit)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {/* If Not Logged In, Show Clean Login Form (No Hardcoded Passwords) */}
        {!adminToken && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 mt-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mx-auto flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <h2 className="text-base font-black">Super Admin Mobile Gateway</h2>
            <p className="text-xs text-slate-400">
              Enter your credentials to receive live payment approval alerts and grant website credits.
            </p>
            <form onSubmit={handleLogin} className="space-y-3 text-left mt-2">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Backend Server URL</label>
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="https://your-backend.onrender.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Super Admin Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@yourdomain.ai"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 active:scale-95 transition"
              >
                Connect to Super Admin
              </button>
            </form>
          </div>
        )}

        {/* TAB 1: PAYMENTS & REAL-TIME ALERTS */}
        {adminToken && activeTab === 'payments' && (
          <div className="space-y-3">
            {/* Quick Live Status Ribbon */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-800/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-300">Live Soundbox Monitor</span>
                <div className="text-xs font-black text-white">Ayush Chaubey (7983933436@ptaxis)</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ₹1 / Website
              </span>
            </div>

            {/* Payment Cards */}
            {payments.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No payment transactions recorded yet.
              </div>
            ) : (
              payments.map((p) => {
                const isCompleted = p.status === 'COMPLETED';
                const isPending = p.status === 'PENDING';
                const isRevoked = p.status === 'REVOKED_UNVERIFIED' || p.status === 'REJECTED';

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-2xl border transition shadow-md ${
                      isPending
                        ? 'bg-amber-950/40 border-amber-500/50 shadow-amber-500/10'
                        : isRevoked 
                          ? 'bg-red-950/20 border-red-900/40 opacity-75' 
                          : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {/* User & Amount */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs truncate text-white">{p.user_name}</div>
                        <div className="font-mono text-[11px] text-slate-400 truncate">{p.user_email}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-400">₹{p.amount}.00</span>
                        <div className="text-[9px] text-slate-500 font-mono">
                          {p.created_at ? new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </div>
                    </div>

                    {/* UTR Reference Bar */}
                    <div className="mt-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">ID:</span>
                        <span className="font-mono text-xs font-bold text-sky-400 truncate select-all">
                          {p.utr_reference}
                        </span>
                      </div>
                      <button
                        onClick={() => copyUtr(p.utr_reference)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white"
                        title="Copy ID"
                      >
                        {copiedUtr === p.utr_reference ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Status & Credits Info */}
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className={`px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : isRevoked
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {isPending && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                        {p.status}
                      </span>
                      <span className="text-slate-400 font-bold">
                        User Credits: <strong className="text-sky-400">+{p.user_credits}</strong>
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3 grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/80">
                      {/* 1-Tap Give +1 Credit / Approve */}
                      <button
                        onClick={() => handleQuickAction({ action: 'APPROVE', payment_id: p.id, credits: 1 })}
                        disabled={actionLoadingId === `pay-${p.id}`}
                        className={`py-1.5 rounded-xl text-white font-bold text-[10px] flex items-center justify-center gap-1 transition shadow-sm ${
                          isPending ? 'bg-emerald-500 hover:bg-emerald-600 ring-2 ring-emerald-400/50' : 'bg-emerald-600/80 hover:bg-emerald-600'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>{isPending ? 'Approve (+1)' : '+1 Credit'}</span>
                      </button>

                      {/* 1-Tap Give +5 Credits */}
                      <button
                        onClick={() => handleQuickAction({ action: 'GIVE_CREDITS', user_id: p.user_id, credits: 5 })}
                        disabled={actionLoadingId === `pay-${p.id}`}
                        className="py-1.5 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition shadow-sm"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>+5 Credits</span>
                      </button>

                      {/* Revoke or Reject */}
                      {isPending ? (
                        <button
                          onClick={() => handleQuickAction({ action: 'REJECT', payment_id: p.id })}
                          disabled={actionLoadingId === `pay-${p.id}`}
                          className="py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold text-[10px] flex items-center justify-center gap-1 transition"
                        >
                          <X className="w-3 h-3" />
                          <span>Deny</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleQuickAction({ action: 'REVOKE', payment_id: p.id })}
                          disabled={actionLoadingId === `pay-${p.id}`}
                          className="py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 font-bold text-[10px] flex items-center justify-center gap-1 transition"
                        >
                          <Ban className="w-3 h-3" />
                          <span>Revoke</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: USER DIRECTORY & CREDIT ALLOCATION */}
        {adminToken && activeTab === 'users' && (
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* User List */}
            <div className="space-y-2">
              {filteredUsers.map((u) => (
                <div key={u.id} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{u.full_name || 'User'}</span>
                        {u.is_super_admin && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            Super Admin
                          </span>
                        )}
                        {u.is_admin && !u.is_super_admin && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Forever Free
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">{u.email}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400">
                        {u.paid_credits || 0} Credits
                      </span>
                    </div>
                  </div>

                  {/* Actions for this user */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-slate-800/60">
                    <button
                      onClick={() => handleQuickAction({ action: 'GIVE_CREDITS', user_id: u.id, credits: 1 })}
                      disabled={actionLoadingId === `usr-${u.id}`}
                      className="py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+1 Credit</span>
                    </button>

                    <button
                      onClick={() => handleQuickAction({ action: 'TOGGLE_ADMIN', user_id: u.id })}
                      disabled={actionLoadingId === `usr-${u.id}`}
                      className={`py-1 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 ${
                        u.is_admin 
                          ? 'bg-amber-600/80 text-white' 
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Crown className="w-3 h-3" />
                      <span>{u.is_admin ? 'Revoke Free' : 'Forever Free'}</span>
                    </button>

                    <button
                      onClick={() => handleQuickAction({ action: 'TOGGLE_SUSPEND', user_id: u.id })}
                      disabled={actionLoadingId === `usr-${u.id}`}
                      className={`py-1 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 ${
                        u.is_suspended 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-red-950/40 text-red-400 border border-red-900/40'
                      }`}
                    >
                      {u.is_suspended ? <PlayCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                      <span>{u.is_suspended ? 'Resume' : 'Suspend'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ANALYTICS & REVENUE */}
        {adminToken && activeTab === 'stats' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-800/40 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Revenue</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">₹{stats?.today_revenue ?? 0}</div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-950/40 to-slate-900 border border-sky-800/40 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Users</span>
                <div className="text-2xl font-black text-sky-400 mt-1">{stats?.total_users ?? users.length}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <h3 className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>Super Admin Information</span>
              </h3>
              <div className="flex justify-between text-slate-400">
                <span>Admin Email:</span>
                <span className="text-white font-mono">{adminEmail}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>UPI ID:</span>
                <span className="text-white font-mono">7983933436@ptaxis</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Price per Website:</span>
                <span className="text-emerald-400 font-bold">₹1.00 INR</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS & LOGOUT */}
        {adminToken && activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
              <h3 className="font-bold text-white">App Configuration</h3>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Backend Server URL</label>
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => {
                    setServerUrl(e.target.value);
                    localStorage.setItem('bmwa_server_url', e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-white mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Polling Frequency ({pollInterval}s)</label>
                <input
                  type="range"
                  min="2"
                  max="15"
                  value={pollInterval}
                  onChange={(e) => setPollInterval(Number(e.target.value))}
                  className="w-full mt-1.5"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => playPaymentChime()}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Test Cash Register Alert Chime</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem('bmwa_admin_token');
                setAdminToken('');
                setIsConnected(false);
                showToast('Signed out from Mobile Gateway.');
              }}
              className="w-full py-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold text-xs transition"
            >
              Sign Out from Super Admin
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      {adminToken && (
        <nav className="safe-bottom bg-slate-900/90 border-t border-slate-800 backdrop-blur-md flex items-center justify-around py-2 shrink-0">
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              activeTab === 'payments' ? 'text-sky-400 font-bold' : 'text-slate-400'
            }`}
          >
            <div className="relative">
              <Bell className="w-4 h-4" />
              {payments.some(p => p.status === 'PENDING') && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </div>
            <span className="text-[10px]">Payments</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              activeTab === 'users' ? 'text-sky-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-[10px]">Users</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              activeTab === 'stats' ? 'text-sky-400 font-bold' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-[10px]">Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              activeTab === 'settings' ? 'text-sky-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-[10px]">Settings</span>
          </button>
        </nav>
      )}
    </div>
  );
}
