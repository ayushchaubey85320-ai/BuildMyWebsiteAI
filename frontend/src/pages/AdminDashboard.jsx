import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Users, Layers, LogIn, Trash2, LogOut, 
  Search, Loader2, Sparkles, AlertTriangle, CheckCircle2,
  CreditCard, Ban, PlayCircle, Crown, ShieldAlert,
  Coins, Plus, RefreshCw, IndianRupee, Filter, ArrowUpRight,
  ExternalLink, UserCheck, UserX, X, Smartphone, Download, QrCode, BellRing
} from 'lucide-react';
import api from '../api';
import AnimatedBackground from '../components/AnimatedBackground';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  // State
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'payments'
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, SUSPENDED, ADMINS, SUPER_ADMINS
  const [adminEmail, setAdminEmail] = useState('');
  
  // Action Loading States
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [impersonatingId, setImpersonatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [notification, setNotification] = useState('');

  // Credit Allocation Modal State
  const [creditModalUser, setCreditModalUser] = useState(null);
  const [creditAmount, setCreditAmount] = useState(1);
  const [creditAction, setCreditAction] = useState('ADD'); // 'ADD' or 'SET'

  // Suspend Service Modal State
  const [suspendModalUser, setSuspendModalUser] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');

  // Mobile Companion APK Modal State
  const [mobileApkModalOpen, setMobileApkModalOpen] = useState(false);

  const fetchAdminData = async () => {
    try {
      const storedUser = localStorage.getItem('buildmywebsiteai_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setAdminEmail(parsed.email || 'admin@buildmywebsiteai.ai');
        } catch (e) {}
      }

      const [usersResp, statsResp, paymentsResp] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats').catch(() => ({ data: null })),
        api.get('/admin/payments').catch(() => ({ data: [] }))
      ]);

      setUsers(usersResp.data || []);
      if (statsResp?.data) setStats(statsResp.data);
      if (paymentsResp?.data) setPayments(paymentsResp.data);
    } catch (err) {
      alert('Admin Access Error: ' + (err.response?.data?.detail || err.message));
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('buildmywebsiteai_token');
    localStorage.removeItem('buildmywebsiteai_user');
    navigate('/');
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // 1. Grant / Revoke Forever Free Admin
  const handleToggleAdmin = async (targetUser) => {
    const actionText = targetUser.is_admin ? 'revoke Forever Free Admin from' : 'grant FOREVER FREE ADMIN (Unlimited Websites) to';
    if (!window.confirm(`Are you sure you want to ${actionText} ${targetUser.email}?`)) return;

    setActionLoadingId(targetUser.id);
    try {
      const resp = await api.put(`/admin/users/${targetUser.id}/toggle-admin`);
      setUsers(users.map(u => u.id === targetUser.id ? { 
        ...u, 
        is_admin: resp.data.is_admin,
        allowed_websites: resp.data.is_admin ? 'Unlimited' : (1 + u.paid_credits),
        remaining_websites: resp.data.is_admin ? 'Unlimited' : Math.max(0, (1 + u.paid_credits) - u.project_count)
      } : u));
      showNotification(resp.data.message);
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoadingId(null);
    }
  };

  // 2. Stop Service (Suspend) / Resume Service
  const handleConfirmSuspend = async () => {
    if (!suspendModalUser) return;
    const isSuspending = !suspendModalUser.is_suspended;

    setActionLoadingId(suspendModalUser.id);
    try {
      const resp = await api.put(`/admin/users/${suspendModalUser.id}/toggle-suspend`, {
        is_suspended: isSuspending,
        reason: isSuspending ? (suspendReason.trim() || 'Service halted by Super Admin.') : null
      });

      setUsers(users.map(u => u.id === suspendModalUser.id ? {
        ...u,
        is_suspended: resp.data.is_suspended,
        suspension_reason: resp.data.suspension_reason
      } : u));

      showNotification(resp.data.message);
      setSuspendModalUser(null);
      setSuspendReason('');
    } catch (err) {
      alert('Failed to update service status: ' + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoadingId(null);
    }
  };

  // 3. Promote / Demote Super Admin Personality
  const handleToggleSuperAdmin = async (targetUser) => {
    const roleText = targetUser.is_super_admin ? 'demote from Super Admin' : 'PROMOTE to Super Admin';
    if (!window.confirm(`Are you sure you want to ${roleText} ${targetUser.email}?`)) return;

    setActionLoadingId(targetUser.id);
    try {
      const resp = await api.put(`/admin/users/${targetUser.id}/toggle-super-admin`);
      setUsers(users.map(u => u.id === targetUser.id ? {
        ...u,
        is_super_admin: resp.data.is_super_admin,
        is_admin: resp.data.is_admin
      } : u));
      showNotification(resp.data.message);
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoadingId(null);
    }
  };

  // 4. Give Website Creation Credits
  const handleAllocateCredits = async () => {
    if (!creditModalUser) return;

    setActionLoadingId(creditModalUser.id);
    try {
      const resp = await api.put(`/admin/users/${creditModalUser.id}/credits`, {
        amount: parseInt(creditAmount) || 0,
        action: creditAction
      });

      const updatedCredits = resp.data.paid_credits;
      setUsers(users.map(u => u.id === creditModalUser.id ? {
        ...u,
        paid_credits: updatedCredits,
        allowed_websites: (u.is_admin || u.is_super_admin) ? 'Unlimited' : (1 + updatedCredits),
        remaining_websites: (u.is_admin || u.is_super_admin) ? 'Unlimited' : Math.max(0, (1 + updatedCredits) - u.project_count)
      } : u));

      showNotification(resp.data.message);
      setCreditModalUser(null);
    } catch (err) {
      alert('Credit update failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoadingId(null);
    }
  };

  // 5. 1-Click Approve Payment
  const handleApprovePayment = async (paymentId) => {
    setActionLoadingId(`pay-${paymentId}`);
    try {
      const resp = await api.post(`/admin/payments/${paymentId}/approve`);
      setPayments(payments.map(p => p.id === paymentId ? {
        ...p,
        status: 'COMPLETED',
        verified_by: resp.data.verified_by
      } : p));
      showNotification(resp.data.message);
      // Refresh user stats
      const usersResp = await api.get('/admin/users');
      setUsers(usersResp.data || []);
    } catch (err) {
      alert('Approval failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Revoke Fake/Unverified Payment
  const handleRevokePayment = async (paymentId, userEmail) => {
    if (!window.confirm(`Revoke Payment #${paymentId}? 1 website credit will be deducted from ${userEmail}.`)) return;

    setActionLoadingId(`revoke-${paymentId}`);
    try {
      const resp = await api.post(`/admin/payments/${paymentId}/revoke`);
      setPayments(payments.map(p => p.id === paymentId ? {
        ...p,
        status: 'REVOKED_UNVERIFIED',
        verified_by: resp.data.verified_by
      } : p));
      showNotification(resp.data.message);
      const usersResp = await api.get('/admin/users');
      setUsers(usersResp.data || []);
    } catch (err) {
      alert('Revocation failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoadingId(null);
    }
  };

  // 6. Impersonate User
  const handleImpersonateUser = async (targetUser) => {
    if (!window.confirm(`Login directly as ${targetUser.email}?`)) return;
    setImpersonatingId(targetUser.id);

    try {
      const resp = await api.post(`/admin/impersonate/${targetUser.id}`);
      localStorage.setItem('buildmywebsiteai_token', resp.data.access_token);
      localStorage.setItem('buildmywebsiteai_user', JSON.stringify(resp.data.user));

      showNotification(`Logged in as ${targetUser.email}! Redirecting...`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      alert('Impersonation failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setImpersonatingId(null);
    }
  };

  // 7. Delete User
  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Delete user ${userEmail}? All their websites will be permanently erased.`)) return;
    setDeletingId(userId);

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      showNotification(`User ${userEmail} deleted successfully.`);
    } catch (err) {
      alert('Deletion failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = (
      (u.full_name && u.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!matchesSearch) return false;

    if (statusFilter === 'ACTIVE') return !u.is_suspended;
    if (statusFilter === 'SUSPENDED') return u.is_suspended;
    if (statusFilter === 'ADMINS') return u.is_admin;
    if (statusFilter === 'SUPER_ADMINS') return u.is_super_admin;
    return true;
  });

  const totalUsersCount = stats?.total_users ?? users.length;
  const activeUsersCount = stats?.active_users ?? users.filter(u => !u.is_suspended).length;
  const suspendedUsersCount = stats?.suspended_users ?? users.filter(u => u.is_suspended).length;
  const adminUsersCount = stats?.forever_free_admins ?? users.filter(u => u.is_admin).length;
  const totalProjectsCount = stats?.total_websites ?? users.reduce((acc, u) => acc + (u.project_count || 0), 0);
  const totalRevenue = stats?.total_revenue_inr ?? payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className={`relative min-h-screen p-4 sm:p-8 transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      <AnimatedBackground />

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <header className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6 ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-400 to-pink-500 text-white shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-3xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-pink-400 bg-clip-text text-transparent font-black">
                    Super Admin Portal
                  </span>
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  Control Center
                </span>
              </div>
              <p className={`text-xs mt-1 font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Full platform accountability: manage users, stop services, allocate credits, grant forever free access & verify payments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setMobileApkModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
            >
              <Smartphone className="w-4 h-4 animate-bounce" />
              <span>Mobile Companion APK</span>
            </button>

            <ThemeToggle />

            <Link
              to="/dashboard"
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                isLight ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700' : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <span>User Dashboard</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                isLight ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700' : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <LogOut className="w-4 h-4 text-pink-500" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Notification Toast */}
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-2.5 text-xs font-bold shadow-md"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{notification}</span>
          </motion.div>
        )}

        {/* Accountability Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Total Registered Users */}
          <div className={`p-4 rounded-2xl border shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider opacity-60">Total Users</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <h3 className="text-2xl font-black mt-1">{totalUsersCount}</h3>
            <div className="mt-1 flex items-center gap-2 text-[10px] font-bold">
              <span className="text-emerald-500">{activeUsersCount} Active</span>
              <span className="opacity-40">•</span>
              <span className="text-red-400">{suspendedUsersCount} Suspended</span>
            </div>
          </div>

          {/* Forever Free Admins */}
          <div className={`p-4 rounded-2xl border shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider opacity-60">Forever Free Admins</span>
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-2xl font-black text-amber-400 mt-1">{adminUsersCount}</h3>
            <p className="text-[10px] opacity-60 font-medium mt-1">Unlimited Websites Forever</p>
          </div>

          {/* Total Generated Websites */}
          <div className={`p-4 rounded-2xl border shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider opacity-60">Websites Built</span>
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">{totalProjectsCount}</h3>
            <p className="text-[10px] opacity-60 font-medium mt-1">Across all users</p>
          </div>

          {/* UPI Platform Revenue */}
          <div className={`p-4 rounded-2xl border shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider opacity-60">UPI Revenue</span>
              <IndianRupee className="w-4 h-4 text-teal-400" />
            </div>
            <h3 className="text-2xl font-black text-teal-400 mt-1">₹{totalRevenue}</h3>
            <p className="text-[10px] opacity-60 font-medium mt-1">{payments.length} Payments Verified</p>
          </div>

          {/* Service Halted */}
          <div className={`p-4 rounded-2xl border shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider opacity-60">Service Halted</span>
              <Ban className="w-4 h-4 text-red-400" />
            </div>
            <h3 className="text-2xl font-black text-red-400 mt-1">{suspendedUsersCount}</h3>
            <p className="text-[10px] opacity-60 font-medium mt-1">Users Stopped</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Accounts & Quotas ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'payments'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Live UPI Payments ({payments.length})</span>
          </button>

          <button
            onClick={fetchAdminData}
            className="ml-auto p-2 rounded-xl border border-slate-300 dark:border-slate-800 text-xs text-slate-400 hover:text-white transition"
            title="Refresh Records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* TAB 1: USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl border max-w-md w-full shadow-sm ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
              }`}>
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs focus:outline-none font-bold"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
                {[
                  { id: 'ALL', label: 'All Users' },
                  { id: 'ACTIVE', label: 'Active' },
                  { id: 'SUSPENDED', label: 'Suspended' },
                  { id: 'ADMINS', label: 'Forever Free' },
                  { id: 'SUPER_ADMINS', label: 'Super Admins' }
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setStatusFilter(filter.id)}
                    className={`px-3 py-1.5 rounded-xl border transition whitespace-nowrap ${
                      statusFilter === filter.id
                        ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                        : isLight
                          ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">Loading User Records...</p>
              </div>
            ) : (
              <div className={`rounded-3xl border overflow-hidden shadow-lg ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b text-[10px] font-black uppercase tracking-wider ${
                      isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      <tr>
                        <th className="p-4">User</th>
                        <th className="p-4">Role & Status</th>
                        <th className="p-4">Websites Built</th>
                        <th className="p-4">Quota & Credits</th>
                        <th className="p-4">UPI Spent</th>
                        <th className="p-4">Joined</th>
                        <th className="p-4 text-right">Super Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${
                      isLight ? 'divide-slate-200 bg-white' : 'divide-slate-800 bg-slate-900/60'
                    }`}>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className={`transition ${
                          u.is_suspended 
                            ? 'bg-red-500/5 hover:bg-red-500/10' 
                            : isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                        }`}>
                          {/* User Identity */}
                          <td className="p-4">
                            <div className="font-bold flex items-center gap-1.5">
                              <span>{u.full_name}</span>
                              {u.is_super_admin && (
                                <span className="p-1 rounded bg-purple-500/20 text-purple-400" title="Super Admin Personality">
                                  <ShieldCheck className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[11px] opacity-70 truncate max-w-[200px]">
                              {u.email}
                            </div>
                          </td>

                          {/* Role & Status */}
                          <td className="p-4 space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {u.is_super_admin ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-400 border border-purple-500/30">
                                  SUPER ADMIN
                                </span>
                              ) : u.is_admin ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                  <Crown className="w-2.5 h-2.5" />
                                  <span>FOREVER FREE</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                  STANDARD
                                </span>
                              )}

                              {u.is_suspended ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1">
                                  <Ban className="w-2.5 h-2.5" />
                                  <span>SERVICE STOPPED</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            {u.is_suspended && u.suspension_reason && (
                              <p className="text-[10px] text-red-400 font-mono italic">
                                Reason: {u.suspension_reason}
                              </p>
                            )}
                          </td>

                          {/* Websites Built */}
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 font-black text-sm">
                              <span className={u.project_count > 0 ? 'text-sky-400' : 'opacity-40'}>
                                {u.project_count}
                              </span>
                              <span className="text-[10px] font-normal opacity-50">sites</span>
                            </div>
                          </td>

                          {/* Quota & Credits */}
                          <td className="p-4 space-y-1">
                            <div className="font-bold flex items-center gap-2">
                              <span className="text-[11px]">
                                Allowed: <strong className="text-emerald-400">{u.allowed_websites}</strong>
                              </span>
                              {u.paid_credits > 0 && (
                                <span className="px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 text-[10px] font-mono">
                                  +{u.paid_credits} Cr
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCreditModalUser(u);
                                setCreditAmount(1);
                                setCreditAction('ADD');
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 hover:text-sky-300 underline"
                            >
                              <Coins className="w-3 h-3" />
                              <span>Give Credits</span>
                            </button>
                          </td>

                          {/* UPI Spent */}
                          <td className="p-4 font-mono">
                            <span className="font-bold text-teal-400">₹{u.total_spent_inr}</span>
                            <div className="text-[10px] opacity-50">{u.payments_count} txns</div>
                          </td>

                          {/* Joined Date */}
                          <td className="p-4 text-[11px] opacity-70">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right">
                            <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                              {/* Give Forever Free Admin Toggle */}
                              <button
                                onClick={() => handleToggleAdmin(u)}
                                disabled={actionLoadingId === u.id}
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition flex items-center gap-1 ${
                                  u.is_admin
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                                    : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-300 hover:text-white'
                                }`}
                                title={u.is_admin ? "Revoke Forever Free Admin" : "Give Forever Free Admin (Unlimited Websites)"}
                              >
                                <Crown className="w-3 h-3 text-amber-400" />
                                <span>{u.is_admin ? 'Admin (Free)' : 'Make Admin'}</span>
                              </button>

                              {/* Stop Service (Suspend) / Resume Service */}
                              <button
                                onClick={() => {
                                  setSuspendModalUser(u);
                                  setSuspendReason(u.suspension_reason || '');
                                }}
                                disabled={actionLoadingId === u.id}
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition flex items-center gap-1 ${
                                  u.is_suspended
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                    : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                                }`}
                                title={u.is_suspended ? "Resume Service" : "Stop Service"}
                              >
                                {u.is_suspended ? <PlayCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                                <span>{u.is_suspended ? 'Resume' : 'Stop Service'}</span>
                              </button>

                              {/* Super Admin Designation Toggle */}
                              <button
                                onClick={() => handleToggleSuperAdmin(u)}
                                disabled={actionLoadingId === u.id}
                                className={`p-1.5 rounded-xl border text-[11px] transition ${
                                  u.is_super_admin
                                    ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                                    : 'border-slate-700 text-slate-400 hover:text-purple-400'
                                }`}
                                title={u.is_super_admin ? "Demote from Super Admin" : "Promote to Super Admin Personality"}
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </button>

                              {/* Impersonate Direct Login */}
                              <button
                                onClick={() => handleImpersonateUser(u)}
                                disabled={impersonatingId === u.id}
                                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition disabled:opacity-50"
                                title={`Login directly as ${u.email}`}
                              >
                                {impersonatingId === u.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <LogIn className="w-3 h-3" />
                                )}
                                <span>Login</span>
                              </button>

                              {/* Delete User */}
                              {!u.is_super_admin && (
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.email)}
                                  disabled={deletingId === u.id}
                                  className="p-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition"
                                  title="Permanently Delete User"
                                >
                                  {deletingId === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE PAYMENTS AUDIT TRAIL */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div>
                <h3 className="text-base font-black">UPI Payment Audit Log</h3>
                <p className="text-xs text-slate-400">
                  Transactions credited to Ayush Chaubey (7983933436@ptaxis). Auto-verified or manually confirmed.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400">Auto-Verify Active</span>
              </div>
            </div>

            <div className={`rounded-3xl border overflow-hidden shadow-lg ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b text-[10px] font-black uppercase tracking-wider ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    <tr>
                      <th className="p-4">Txn ID</th>
                      <th className="p-4">User</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">UPI Reference / UTR</th>
                      <th className="p-4">Verification Mode</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isLight ? 'divide-slate-200 bg-white' : 'divide-slate-800 bg-slate-900/60'
                  }`}>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                          No UPI payments recorded yet.
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p.id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}>
                          <td className="p-4 font-mono font-bold">#{p.id}</td>
                          <td className="p-4">
                            <div className="font-bold">{p.user_name}</div>
                            <div className="font-mono text-[10px] opacity-60">{p.user_email}</div>
                          </td>
                          <td className="p-4 font-mono font-black text-emerald-400">
                            ₹{p.amount}.00
                          </td>
                          <td className="p-4 font-mono text-[11px] text-sky-400 font-bold select-all">
                            {p.utr_reference}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                              {p.verified_by || 'AUTO'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {p.status}
                            </span>
                          </td>
                          <td className="p-4 text-[11px] opacity-70">
                            {new Date(p.created_at).toLocaleString()}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {p.status !== 'REVOKED_UNVERIFIED' && (
                                <button
                                  onClick={() => handleRevokePayment(p.id, p.user_email)}
                                  disabled={actionLoadingId === `revoke-${p.id}`}
                                  className="px-2 py-1 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-[10px] font-bold transition flex items-center gap-1"
                                  title="Revoke Fake/Unverified Payment & Deduct Credit"
                                >
                                  <Ban className="w-3 h-3" />
                                  <span>Revoke</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleApprovePayment(p.id)}
                                disabled={actionLoadingId === `pay-${p.id}`}
                                className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold transition flex items-center gap-1"
                                title="Re-verify & Credit User"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{p.status === 'REVOKED_UNVERIFIED' ? 'Restore' : 'Re-Verify'}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: GIVE CREDITS */}
      <AnimatePresence>
        {creditModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-md rounded-3xl border p-6 shadow-2xl ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
              }`}
            >
              <button
                onClick={() => setCreditModalUser(null)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Allocate Website Credits</h3>
                  <p className="text-xs text-slate-400 truncate max-w-[260px]">
                    User: {creditModalUser.email}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Current Quota Info */}
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs flex justify-between">
                  <span>Current Paid Credits:</span>
                  <strong className="text-sky-400">{creditModalUser.paid_credits}</strong>
                </div>

                {/* Quick Add Presets */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider opacity-60 mb-1.5">
                    Quick Presets
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 5, 10, 25].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setCreditAction('ADD');
                          setCreditAmount(amt);
                        }}
                        className={`py-2 rounded-xl text-xs font-bold border transition ${
                          creditAction === 'ADD' && creditAmount === amt
                            ? 'bg-sky-500 text-white border-sky-500'
                            : 'border-slate-700 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount Input */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider opacity-60 mb-1.5">
                    Custom Credits Amount
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  />
                </div>

                {/* Action Mode: Add or Set */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCreditAction('ADD')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                      creditAction === 'ADD' ? 'bg-sky-500 text-white border-sky-500' : 'border-slate-700 text-slate-400'
                    }`}
                  >
                    Add to Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreditAction('SET')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                      creditAction === 'SET' ? 'bg-sky-500 text-white border-sky-500' : 'border-slate-700 text-slate-400'
                    }`}
                  >
                    Set Exactly To
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAllocateCredits}
                  disabled={actionLoadingId === creditModalUser.id}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition disabled:opacity-50"
                >
                  {actionLoadingId === creditModalUser.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Confirm & Update Credits</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: STOP SERVICE (SUSPEND) */}
      <AnimatePresence>
        {suspendModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-md rounded-3xl border p-6 shadow-2xl ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
              }`}
            >
              <button
                onClick={() => setSuspendModalUser(null)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-4">
                <div className={`p-2.5 rounded-xl border ${
                  suspendModalUser.is_suspended 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {suspendModalUser.is_suspended ? <PlayCircle className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-black">
                    {suspendModalUser.is_suspended ? 'Resume Service for User' : 'Stop Service (Suspend User)'}
                  </h3>
                  <p className="text-xs text-slate-400 truncate max-w-[260px]">
                    {suspendModalUser.email}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {!suspendModalUser.is_suspended ? (
                  <>
                    <p className="text-xs text-slate-300">
                      Stopping service blocks the user from logging in, generating websites, or editing projects.
                    </p>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider opacity-60 mb-1.5">
                        Suspension Reason (Visible to user)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Terms violation, account audit, or requested hold"
                        value={suspendReason}
                        onChange={(e) => setSuspendReason(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500 ${
                          isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-800 border-slate-700 text-white'
                        }`}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-300">
                    Resuming service immediately restores full login and website creation access for this user.
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSuspendModalUser(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSuspend}
                    disabled={actionLoadingId === suspendModalUser.id}
                    className={`flex-1 py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition disabled:opacity-50 ${
                      suspendModalUser.is_suspended
                        ? 'bg-emerald-500 hover:bg-emerald-600'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {actionLoadingId === suspendModalUser.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {suspendModalUser.is_suspended ? <PlayCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        <span>{suspendModalUser.is_suspended ? 'Resume Service' : 'Stop Service Now'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: MOBILE COMPANION APK */}
      <AnimatePresence>
        {mobileApkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-lg rounded-3xl border p-6 sm:p-7 shadow-2xl ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
              }`}
            >
              <button
                onClick={() => setMobileApkModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/20">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black tracking-tight">Super Admin Mobile Companion</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      APK v1.0
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    Instant sound alert when ₹1 UPI payment is received & 1-tap credit allocation
                  </p>
                </div>
              </div>

              {/* QR Code and Download Block */}
              <div className={`p-4 rounded-2xl border mb-5 flex flex-col sm:flex-row items-center gap-5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
              }`}>
                <div className="relative p-2 bg-white rounded-xl shadow-md border border-slate-200 shrink-0">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=http://192.168.1.14:8000/download/admin-apk"
                    alt="Scan to Download APK"
                    className="w-32 h-32 rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/60 rounded-xl transition text-white text-[10px] font-bold text-center p-1">
                    Scan with phone camera
                  </div>
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <p className="text-xs font-bold text-emerald-400 flex items-center justify-center sm:justify-start gap-1">
                    <QrCode className="w-3.5 h-3.5" />
                    Scan to Install on Android
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Point your Android camera at the QR code to instantly download and install <b className="text-white">BuildMyWebsiteAI_Admin.apk</b> directly onto your phone.
                  </p>
                  <a
                    href="http://192.168.1.14:8000/download/admin-apk"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Direct APK Download</span>
                  </a>
                </div>
              </div>

              {/* Key Features List */}
              <div className="space-y-2.5 mb-6 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    🔔
                  </div>
                  <div>
                    <span className="font-bold text-slate-200">Real-Time Chime & Vibration:</span>
                    <span className="text-slate-400"> Chimes like a cash register and vibrates the phone when someone pays ₹1.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    ⚡
                  </div>
                  <div>
                    <span className="font-bold text-slate-200">1-Tap Credit Giving:</span>
                    <span className="text-slate-400"> Instantly grant +1 or +5 credits right from the notification card.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    🛡️
                  </div>
                  <div>
                    <span className="font-bold text-slate-200">1-Tap Fraud Revocation:</span>
                    <span className="text-slate-400"> Reject invalid payments and claw back credits with a single tap.</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <span>Local Server: <code className="text-emerald-400 font-mono">http://192.168.1.14:8000</code></span>
                <button
                  onClick={() => setMobileApkModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white font-bold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
