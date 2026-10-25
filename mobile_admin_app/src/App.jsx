import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Bell, Users, BarChart3, Settings, CheckCircle2, XCircle, 
  AlertCircle, RefreshCw, Smartphone, Copy, Check, ShieldCheck, 
  Plus, Ban, PlayCircle, Crown, LogIn, ChevronRight, Zap, Volume2, VolumeX,
  IndianRupee, Layers
} from 'lucide-react';

const DEFAULT_SERVER_URL = 'https://buildmywebsiteai-backend-okcf.onrender.com';

// Web Audio API synthesized cash register & bell alert chime
const playPaymentChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // First note (bell)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc1.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // A6
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.4);

    // Second note (pleasant high ring)
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1318.5, ctx.currentTime); // E6
      gain2.gain.setValueAtTime(0.4, ctx.currentTime);
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
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem('bmwa_admin_email') || 'admin@buildmywebsiteai.ai');
  const [adminPassword, setAdminPassword] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pollInterval, setPollInterval] = useState(4); // seconds

  // Data State
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [copiedUtr, setCopiedUtr] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const lastPaymentIdRef = useRef(0);
  const knownPaymentIds = useRef(new Set());

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
      timeout: 6000
    });
  };

  // 1. Authenticate as Super Admin
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    try {
      const resp = await axios.post(`${serverUrl.replace(/\/$/, '')}/api/auth/login`, {
        email: adminEmail,
        password: adminPassword || 'adminpassword123'
      });
      const token = resp.data.access_token;
      setAdminToken(token);
      localStorage.setItem('bmwa_admin_token', token);
      localStorage.setItem('bmwa_admin_email', adminEmail);
      localStorage.setItem('bmwa_server_url', serverUrl);
      setIsConnected(true);
      showToast('Logged in as Super Admin!');
      fetchFullData(token);
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  // 2. Fetch Notifications / Payments
  const pollPayments = async () => {
    if (!adminToken) return;
    try {
      const resp = await getApi().get(`/admin/mobile/notifications?last_id=0`);
      const newPayments = resp.data.payments || [];
      if (resp.data.stats) setStats(resp.data.stats);

      // Check if any brand new payment arrived
      let hasNew = false;
      newPayments.forEach(p => {
        if (!knownPaymentIds.current.has(p.id)) {
          knownPaymentIds.current.add(p.id);
          if (lastPaymentIdRef.current > 0 && p.id > lastPaymentIdRef.current) {
            hasNew = true;
          }
        }
      });

      if (hasNew) {
        if (soundEnabled) playPaymentChime();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        showToast('🔔 New ₹1 UPI Payment Received!');
      }

      if (newPayments.length > 0) {
        lastPaymentIdRef.current = Math.max(...newPayments.map(p => p.id));
      }
      setPayments(newPayments);
      setIsConnected(true);
    } catch (err) {
      // Graceful fallback: ping /admin/users to maintain connection and stats
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

  // 4. Quick Actions (Approve, Give Credits, Revoke, Toggle Suspend)
  const handleQuickAction = async (payload) => {
    setActionLoadingId(payload.payment_id ? `pay-${payload.payment_id}` : `usr-${payload.user_id}`);
    try {
      const resp = await getApi().post('/admin/mobile/quick-action', payload);
      showToast(resp.data.message);
      fetchFullData();
    } catch (err) {
      // Fallback to standard admin routes
      try {
        if (payload.action === 'GIVE_CREDITS') {
          const resp = await getApi().put(`/admin/users/${payload.user_id}/credits`, {
            amount: payload.amount || 1,
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
      } catch (fallbackErr) {
        // Fallback also failed
      }
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

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {/* If Not Logged In, Show Quick Login */}
        {!adminToken && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 mt-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mx-auto flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <h2 className="text-base font-black">Super Admin Mobile Login</h2>
            <p className="text-xs text-slate-400">
              Connect to your backend server to receive live payment alerts and give website credits.
            </p>
            <form onSubmit={handleLogin} className="space-y-2.5 text-left">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Server API URL</label>
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Super Admin Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Password</label>
                <input
                  type="password"
                  placeholder="adminpassword123"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs shadow-md"
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
                const isRevoked = p.status === 'REVOKED_UNVERIFIED';

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-2xl border transition shadow-md ${
                      isRevoked 
                        ? 'bg-red-950/20 border-red-900/40 opacity-75' 
                        : isCompleted
                          ? 'bg-slate-900 border-slate-800'
                          : 'bg-amber-950/30 border-amber-800/50'
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
                        <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">UTR:</span>
                        <span className="font-mono text-xs font-bold text-sky-400 truncate select-all">
                          {p.utr_reference}
                        </span>
                      </div>
                      <button
                        onClick={() => copyUtr(p.utr_reference)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white"
                        title="Copy UTR"
                      >
                        {copiedUtr === p.utr_reference ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Status & Credits Info */}
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                        isRevoked
                          ? 'bg-red-500/20 text-red-400'
                          : isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                      }`}>
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
                        className="py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition shadow-sm"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+1 Credit</span>
                      </button>

                      {/* Give +5 Credits */}
                      <button
                        onClick={() => handleQuickAction({ action: 'GIVE_CREDITS', user_id: p.user_id, credits: 5 })}
                        disabled={actionLoadingId === `pay-${p.id}`}
                        className="py-1.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 font-bold text-[10px] flex items-center justify-center gap-1"
                      >
                        <Zap className="w-3 h-3" />
                        <span>+5 Credits</span>
                      </button>

                      {/* Revoke Fraud */}
                      <button
                        onClick={() => handleQuickAction({ action: 'REVOKE', payment_id: p.id })}
                        disabled={actionLoadingId === `pay-${p.id}`}
                        className="py-1.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-[10px] flex items-center justify-center gap-1"
                      >
                        <Ban className="w-3 h-3" />
                        <span>Revoke</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: USER GOVERNANCE */}
        {adminToken && activeTab === 'users' && (
          <div className="space-y-3">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search user by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            />

            {/* User Cards List */}
            {filteredUsers.map((u) => (
              <div key={u.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs truncate flex items-center gap-1.5">
                      <span>{u.full_name}</span>
                      {u.is_admin && <Crown className="w-3 h-3 text-amber-400" />}
                    </div>
                    <div className="font-mono text-[10px] text-slate-400 truncate">{u.email}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    u.is_suspended ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {u.is_suspended ? 'STOPPED' : 'ACTIVE'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-300">
                  <span>Websites: <strong className="text-white">{u.project_count}</strong></span>
                  <span>Quota: <strong className="text-emerald-400">{u.allowed_websites}</strong></span>
                  <span>Credits: <strong className="text-sky-400">+{u.paid_credits}</strong></span>
                </div>

                {/* Mobile Admin Quick Controls */}
                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleQuickAction({ action: 'GIVE_CREDITS', user_id: u.id, credits: 1 })}
                    className="py-1 rounded-lg bg-sky-500/20 text-sky-300 font-bold text-[10px]"
                  >
                    +1 Credit
                  </button>
                  <button
                    onClick={() => handleQuickAction({ action: 'TOGGLE_ADMIN', user_id: u.id })}
                    className={`py-1 rounded-lg text-[10px] font-bold ${
                      u.is_admin ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {u.is_admin ? 'Admin (Free)' : 'Make Admin'}
                  </button>
                  <button
                    onClick={() => handleQuickAction({ action: 'TOGGLE_SUSPEND', user_id: u.id, reason: 'Service paused via Mobile Admin' })}
                    className={`py-1 rounded-lg text-[10px] font-bold ${
                      u.is_suspended ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {u.is_suspended ? 'Resume' : 'Stop User'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: ANALYTICS & REVENUE */}
        {adminToken && activeTab === 'stats' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Performance</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Total Users</span>
                  <Users className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-black mt-1 text-white">{stats?.total_users ?? users.length}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Websites Built</span>
                  <Layers className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black mt-1 text-emerald-400">{stats?.total_websites ?? '—'}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 col-span-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Total UPI Revenue Collected</span>
                  <IndianRupee className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-3xl font-black mt-1 text-teal-400">
                  ₹{stats?.total_revenue_inr ?? payments.reduce((acc, p) => acc + (p.amount || 0), 0)}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">₹1.00 per additional website credit</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS & CONNECTION */}
        {adminToken && activeTab === 'settings' && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Mobile Connection</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-bold">Server API URL</label>
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="font-bold">Sound Alert on Payment</div>
                  <div className="text-[10px] text-slate-400">Plays cash register chime</div>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 accent-sky-500 rounded"
                />
              </div>

              <div className="pt-2">
                <label className="text-[10px] text-slate-400 font-bold">Auto-Poll Frequency: {pollInterval}s</label>
                <input
                  type="range"
                  min="2"
                  max="15"
                  value={pollInterval}
                  onChange={(e) => setPollInterval(parseInt(e.target.value))}
                  className="w-full accent-sky-500 mt-1"
                />
              </div>

              <button
                onClick={() => {
                  localStorage.removeItem('bmwa_admin_token');
                  setAdminToken('');
                }}
                className="w-full py-2.5 rounded-xl border border-red-500/40 text-red-400 font-bold text-xs mt-4"
              >
                Sign Out from Companion
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Mobile Tab Bar */}
      {adminToken && (
        <nav className="safe-bottom bg-slate-900/95 border-t border-slate-800 flex justify-around items-center py-2 shrink-0">
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === 'payments' ? 'text-sky-400' : 'text-slate-500'
            }`}
          >
            <div className="relative">
              <Bell className="w-5 h-5" />
              {payments.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full" />
              )}
            </div>
            <span>Payments</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === 'users' ? 'text-sky-400' : 'text-slate-500'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Users</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === 'stats' ? 'text-sky-400' : 'text-slate-500'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Metrics</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === 'settings' ? 'text-sky-400' : 'text-slate-500'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </nav>
      )}
    </div>
  );
}
