import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Eye, Download, Globe, Trash2, Sparkles, 
  Layers, Search, Loader2, LogOut, User as UserIcon, AlertTriangle, 
  X, Lock, KeyRound, CheckCircle2, ShieldCheck, Mail, UserCheck,
  Copy, EyeOff, Tag, ExternalLink, BarChart2, Link2, CreditCard, QrCode
} from 'lucide-react';
import api from '../api';
import AnimatedBackground from '../components/AnimatedBackground';
import CreationWizardModal from '../components/CreationWizardModal';
import CreationLoader from '../components/CreationLoader';
import ThemeToggle from '../components/ThemeToggle';
import AnalyticsModal from '../components/AnalyticsModal';
import CustomDomainModal from '../components/CustomDomainModal';
import UPIPaymentModal from '../components/UPIPaymentModal';
import { useTheme } from '../context/ThemeContext';


const Dashboard = () => {
  const navigate = useNavigate();
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // User Profile state
  const [userEmail, setUserEmail] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [userId, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  // Modals state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingZipId, setDownloadingZipId] = useState(null);

  // Delete All Modal state
  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
  const [confirmInputText, setConfirmInputText] = useState('');
  const [deletingAll, setDeletingAll] = useState(false);

  // User Profile Settings Modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // 3-Second Welcome Toast Notification state
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);

  // Clone & Publish state
  const [cloningId, setCloningId] = useState(null);
  const [publishingId, setPublishingId] = useState(null);

  // Analytics & Custom Domain Modal state
  const [analyticsModalProject, setAnalyticsModalProject] = useState(null);
  const [domainModalProject, setDomainModalProject] = useState(null);

  // Quota & UPI Payment Modal state
  const [quota, setQuota] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const storedUser = localStorage.getItem('buildmywebsiteai_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUserEmail(parsed.email || '');
          setUserFullName(parsed.full_name || '');
          setUserId(parsed.id || null);
        } catch (e) {}
      }

      const [meRes, projRes, quotaRes] = await Promise.allSettled([
        api.get('/auth/me'),
        api.get('/dashboard/projects'),
        api.get('/payment/quota')
      ]);

      if (meRes.status === 'fulfilled' && meRes.value?.data) {
        const u = meRes.value.data;
        setUserEmail(u.email || '');
        setUserFullName(u.full_name || '');
        setUserId(u.id || null);
        setIsSuperAdmin(Boolean(u.is_super_admin || u.email === 'admin@buildmywebsiteai.ai' || u.email === 'admin@webrisk.ai'));
        const curStr = localStorage.getItem('buildmywebsiteai_user');
        const newStr = JSON.stringify(u);
        if (curStr !== newStr) {
          localStorage.setItem('buildmywebsiteai_user', newStr);
        }
      }

      if (projRes.status === 'fulfilled' && projRes.value?.data) {
        setProjects(projRes.value.data || []);
      }

      if (quotaRes.status === 'fulfilled' && quotaRes.value?.data) {
        setQuota(quotaRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard projects:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchDashboardData();

    setShowWelcomeToast(true);
    const toastTimer = setTimeout(() => {
      setShowWelcomeToast(false);
    }, 3000);

    const handleStorageChange = (e) => {
      if (e.key === 'buildmywebsiteai_token') {
        const token = localStorage.getItem('buildmywebsiteai_token');
        if (!token) {
          navigate('/login');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearTimeout(toastTimer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const totalProjectsCount = projects.length;
  const liveCoDomainsCount = projects.filter(p => p.is_published).length;
  const activeCategoriesCount = new Set(projects.map(p => p.category)).size;

  const handleLogout = () => {
    localStorage.removeItem('buildmywebsiteai_token');
    localStorage.removeItem('buildmywebsiteai_user');
    navigate('/');
  };

  const handleOpenCreateFlow = () => {
    if (quota && !quota.can_create) {
      setIsPaymentModalOpen(true);
      return;
    }
    setIsWizardOpen(true);
  };

  const handlePaymentSuccess = async (paymentData) => {
    await fetchDashboardData();
    setIsPaymentModalOpen(false);
    setIsWizardOpen(true);
  };

  const handleCreateSubmit = async (payload) => {
    setIsWizardOpen(false);
    setIsGenerating(true);
    setGenerationStep(0);

    const stepTimer = setInterval(() => {
      setGenerationStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 2800);

    try {
      // 3-minute timeout specifically for deep multi-page generation
      const resp = await api.post('/generator/create', payload, { timeout: 180000 });
      clearInterval(stepTimer);
      setIsGenerating(false);
      navigate(`/preview/${resp.data.id}`);
    } catch (err) {
      clearInterval(stepTimer);

      if (err.response?.status === 402) {
        setIsGenerating(false);
        setIsPaymentModalOpen(true);
        return;
      }

      // Smart recovery: check if project was actually generated on the backend
      try {
        const checkResp = await api.get('/dashboard/projects');
        const projectsList = checkResp.data || [];
        const candidate = projectsList.find(
          (p) => p.title?.toLowerCase() === payload.title?.toLowerCase()
        ) || projectsList[0];

        if (candidate) {
          setIsGenerating(false);
          navigate(`/preview/${candidate.id}`);
          return;
        }
      } catch (checkErr) {
        // Fallback to error alert if recovery check fails
      }

      setIsGenerating(false);
      const isTimeout = err.code === 'ECONNABORTED' || (err.message && err.message.toLowerCase().includes('timeout'));
      if (isTimeout) {
        alert('Website generation took longer than usual due to deep multi-page synthesis. Your project is being finalized on the server—please refresh your dashboard in a few moments!');
        fetchDashboardData();
      } else {
        alert('Website generation failed: ' + (err.response?.data?.detail || err.message));
      }
    }
  };


  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/dashboard/projects/${id}`);
      fetchDashboardData();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAllProjects = async (e) => {
    e.preventDefault();
    if (confirmInputText.trim() !== 'DELETE ALL') {
      alert('Please type DELETE ALL exactly to confirm deletion.');
      return;
    }

    setDeletingAll(true);
    try {
      await api.delete('/dashboard/projects/all');
      setProjects([]);
      setDeleteAllModalOpen(false);
      setConfirmInputText('');
    } catch (err) {
      alert('Delete all failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setDeletingAll(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirmation password do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setPasswordUpdating(true);
    try {
      await api.put('/auth/profile/password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update password.' });
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleExportZip = async (id, title) => {
    setDownloadingZipId(id);
    try {
      const response = await api.get(`/export/zip/${id}`, { responseType: 'blob' });

      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        let msg = 'ZIP Export Failed';
        try { msg = JSON.parse(text).detail || msg; } catch(e){}
        alert('ZIP export failed: ' + msg);
        return;
      }

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
      const link = document.createElement('a');
      link.href = url;
      const cleanTitle = (title || 'website').toLowerCase().replace(/\s+/g, '_');
      link.setAttribute('download', `${cleanTitle}_website.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      let msg = 'Export failed. Please check network connection.';
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          msg = parsed.detail || msg;
        } catch (e) {}
      } else if (err.response?.data?.detail) {
        msg = err.response.data.detail;
      }
      alert('ZIP export failed: ' + msg);
    } finally {
      setDownloadingZipId(null);
    }
  };

  const handleCloneProject = async (id, title) => {
    if (quota && !quota.can_create) {
      setIsPaymentModalOpen(true);
      return;
    }
    if (!window.confirm(`Clone "${title}"? A full copy will be created in your dashboard.`)) return;
    setCloningId(id);
    try {
      const resp = await api.post(`/dashboard/projects/${id}/clone`);
      await fetchDashboardData();
      navigate(`/preview/${resp.data.id}`);
    } catch (err) {
      if (err.response?.status === 402) {
        setIsPaymentModalOpen(true);
      } else {
        alert('Clone failed: ' + (err.response?.data?.detail || err.message));
      }
    } finally {
      setCloningId(null);
    }
  };


  const handleTogglePublish = async (project) => {
    setPublishingId(project.id);
    try {
      if (project.is_published) {
        await api.post(`/dashboard/projects/${project.id}/unpublish`);
      } else {
        await api.post(`/export/deploy/${project.id}`);
      }
      await fetchDashboardData();
    } catch (err) {
      alert('Publish toggle failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setPublishingId(null);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userNameDisplay = userFullName || (userEmail ? userEmail.split('@')[0] : 'User');

  return (
    <div className={`relative min-h-screen p-4 sm:p-8 transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      <AnimatedBackground />

      {/* 3-Second Welcome Pop-up Toast Notification Card */}
      <AnimatePresence>
        {showWelcomeToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-50 p-4 sm:p-5 rounded-2xl border shadow-2xl flex items-center gap-4 max-w-sm ${
              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className="p-3 rounded-xl bg-gradient-to-tr from-cyan-400 via-sky-400 to-pink-500 text-white shrink-0 shadow-lg">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1 pr-2">
              <h4 className="text-sm font-black flex items-center gap-1.5">
                <span>Welcome back, {userNameDisplay}!</span>
                <span className="text-xs">👋</span>
              </h4>
              <p className={`text-xs mt-0.5 font-mono truncate font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {userEmail}
              </p>
            </div>
            <button
              onClick={() => setShowWelcomeToast(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Dashboard Header */}
        <header className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6 ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <span className="bg-gradient-to-r from-cyan-500 via-sky-400 to-pink-500 bg-clip-text text-transparent font-black">
                BuildMyWebsiteAI
              </span>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                isLight ? 'bg-sky-100 text-sky-700 border-sky-300' : 'bg-indigo-950 text-indigo-400 border-indigo-800'
              }`}>
                Command Center
              </span>
            </h1>
            <p className={`text-sm mt-1 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Manage, edit, and publish your AI-generated websites
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <ThemeToggle />

            <button
              onClick={() => setIsProfileModalOpen(true)}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition shadow-sm group ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-800 hover:border-sky-400 hover:bg-slate-50'
                  : 'bg-slate-900 border-slate-800 text-white hover:border-slate-700'
              }`}
              title="Click to View Account Profile & Settings"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 via-sky-400 to-pink-500 text-white flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-105 transition">
                {userNameDisplay.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-extrabold text-xs leading-tight">{userNameDisplay}</div>
                <div className="text-[10px] opacity-60 font-mono truncate max-w-[120px] font-semibold">{userEmail}</div>
              </div>
            </button>

            {quota && (
              <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                quota.can_create
                  ? isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                  : isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-950/40 border-amber-800 text-amber-400'
              }`}>
                <CreditCard className="w-3.5 h-3.5" />
                <span>
                  {quota.is_admin ? 'Forever Free (Unlimited Websites)' : `Websites: ${quota.current_websites}/${quota.total_allowed}`}
                </span>
                {!quota.can_create && !quota.is_admin && (
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="px-2 py-0.5 rounded-lg bg-amber-500 text-white text-[10px] font-black hover:bg-amber-600 transition shadow-sm"
                  >
                    +₹1 Add
                  </button>
                )}
              </div>
            )}

            {isSuperAdmin && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 text-xs font-bold transition shadow-sm"
                title="Open Super Admin Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Super Admin</span>
              </Link>
            )}

            <button
              onClick={handleOpenCreateFlow}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-pink-500 hover:from-cyan-500 hover:to-pink-600 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-sky-500/25 transition transform hover:scale-105"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Create Website</span>
            </button>

            <button
              onClick={handleLogout}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-pink-500" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Dynamic Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`p-6 rounded-3xl border flex items-center justify-between shadow-md ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div>
              <p className="text-xs font-black uppercase tracking-wider opacity-70">Total Projects</p>
              <h3 className="text-3xl font-black mt-1">{totalProjectsCount}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
              <Layers className="w-7 h-7" />
            </div>
          </div>

          <div className={`p-6 rounded-3xl border flex items-center justify-between shadow-md ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div>
              <p className="text-xs font-black uppercase tracking-wider opacity-70">Live Co-Domains</p>
              <h3 className="text-3xl font-black text-emerald-500 mt-1">{liveCoDomainsCount}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <Globe className="w-7 h-7" />
            </div>
          </div>

          <div className={`p-6 rounded-3xl border flex items-center justify-between shadow-md ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div>
              <p className="text-xs font-black uppercase tracking-wider opacity-70">Active Categories</p>
              <h3 className="text-3xl font-black text-pink-500 mt-1">{activeCategoriesCount}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400 border border-pink-200 dark:border-pink-800">
              <Sparkles className="w-7 h-7" />
            </div>
          </div>

          <div className={`p-6 rounded-3xl border flex items-center justify-between shadow-md ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div>
              <p className="text-xs font-black uppercase tracking-wider opacity-70">Website Quota</p>
              <h3 className="text-2xl font-black mt-1">
                {quota?.is_admin ? 'Unlimited Websites' : `${quota?.current_websites ?? totalProjectsCount} / ${quota?.total_allowed || 1}`}
              </h3>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-[10px] opacity-70 font-semibold">
                  {quota?.is_admin ? 'Forever Free Admin Active' : '1 Free • ₹1/Extra'}
                </span>
                {!quota?.is_admin && (
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="text-[10px] font-black text-sky-400 hover:underline"
                  >
                    +Unlock (₹1)
                  </button>
                )}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <CreditCard className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className={`flex items-center gap-3 p-2 rounded-2xl border w-full sm:max-w-md shadow-sm ${
            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <Search className="w-5 h-5 text-slate-400 ml-3" />
            <input
              type="text"
              placeholder="Search projects by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm focus:outline-none py-2 pr-4 font-bold"
            />
          </div>

          {projects.length > 0 && (
            <button
              onClick={() => setDeleteAllModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-pink-50 border border-pink-300 hover:bg-pink-100 text-pink-700 text-xs font-black flex items-center gap-1.5 transition self-end sm:self-auto shrink-0 shadow-sm"
              title="Delete All Projects"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete All Projects</span>
            </button>
          )}
        </div>

        {/* Project Cards Grid */}
        {loading ? (
          <div className={`p-12 text-center ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold">Loading Website Projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border shadow-md ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <Layers className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-black mb-2">No Website Projects Found</h3>
            <p className={`text-sm max-w-md mx-auto mb-6 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Create your first website using the BuildMyWebsiteAI Creation Wizard.
            </p>
            <button
              onClick={handleOpenCreateFlow}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-pink-500 text-white font-black text-sm shadow-md transition hover:scale-105"
            >
              Create Website
            </button>
          </div>

        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              // Visual theme color thumbnail — extract primary color from page_tree
              const tree = project.page_tree || {};
              const primaryColor = tree.colors?.primary || '#6366f1';
              const secondaryColor = tree.colors?.secondary || '#ec4899';
              const bgColor = tree.colors?.bg || '#0f172a';
              const themeMode = tree.theme_mode || 'dark';

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`group relative rounded-3xl border transition-all shadow-md hover:shadow-xl flex flex-col overflow-hidden ${
                    isLight ? 'bg-white border-slate-200 text-slate-900 hover:border-sky-400' : 'bg-slate-900 border-slate-800 text-white hover:border-indigo-500'
                  }`}
                >
                  {/* Visual Theme Thumbnail */}
                  <div
                    className="relative h-24 w-full flex items-center justify-center overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${bgColor} 0%, ${primaryColor}30 100%)` }}
                  >
                    {/* Theme color accent bars */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 flex">
                      <div className="flex-1 h-full" style={{ backgroundColor: primaryColor }} />
                      <div className="flex-1 h-full" style={{ backgroundColor: secondaryColor }} />
                      <div className="flex-1 h-full" style={{ backgroundColor: primaryColor, opacity: 0.6 }} />
                    </div>
                    {/* Mini website preview dots */}
                    <div className="flex flex-col items-center gap-1.5 opacity-70">
                      <div className="w-28 h-2 rounded-full" style={{ backgroundColor: primaryColor, opacity: 0.9 }} />
                      <div className="w-20 h-1.5 rounded-full bg-white/20" />
                      <div className="w-24 h-1.5 rounded-full bg-white/20" />
                    </div>
                    {/* Theme badge */}
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-black/30 text-white backdrop-blur-sm border border-white/10">
                      {project.theme?.replace(/_/g, ' ') || 'Custom'}
                    </div>
                    {/* Publish live badge */}
                    {project.is_published && (
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/90 text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        LIVE
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shrink-0 ${
                        isLight ? 'bg-sky-100 text-sky-800 border-sky-300' : 'bg-indigo-950 text-indigo-300 border-indigo-800'
                      }`}>
                        {project.category}
                      </span>
                      <span className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-black mb-0.5 group-hover:text-sky-500 transition tracking-tight line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-[10px] text-sky-500 font-mono font-bold mb-3 truncate">
                      {project.subdomain}.buildmywebsiteai.site
                    </p>

                    {/* Action row 1: Preview + Publish */}
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        to={`/preview/${project.id}`}
                        className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-pink-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition transform hover:scale-105"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview & Edit</span>
                      </Link>

                      {/* Publish / Unpublish toggle */}
                      <button
                        onClick={() => handleTogglePublish(project)}
                        disabled={publishingId === project.id}
                        className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-sm border ${
                          project.is_published
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                            : isLight
                            ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                        title={project.is_published ? 'Unpublish Website' : 'Publish to Live Co-Domain'}
                      >
                        {publishingId === project.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : project.is_published ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Globe className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">{project.is_published ? 'Unpublish' : 'Publish'}</span>
                      </button>
                    </div>

                    {/* Action row 2: ZIP, Clone, Delete */}
                    <div className={`pt-3 border-t flex items-center justify-between gap-2 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                      {/* Live URL link if published */}
                      {project.is_published && (
                        <a
                          href={`https://${project.subdomain}.buildmywebsiteai.site`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-emerald-500 hover:underline flex items-center gap-0.5 truncate max-w-[120px]"
                          title="Open live site"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">View Live</span>
                        </a>
                      )}

                      <div className="flex items-center gap-1.5 ml-auto">
                        {/* Traffic Analytics button */}
                        <button
                          onClick={() => setAnalyticsModalProject(project)}
                          className={`p-2 rounded-xl border text-xs font-bold transition shadow-sm ${
                            isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100' : 'bg-emerald-950/50 border-emerald-800 text-emerald-400 hover:bg-emerald-900/50'
                          }`}
                          title="Website Traffic Analytics"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Custom Domain button */}
                        <button
                          onClick={() => setDomainModalProject(project)}
                          className={`p-2 rounded-xl border text-xs font-bold transition shadow-sm ${
                            project.custom_domain
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-600 hover:bg-indigo-100'
                              : isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                          }`}
                          title={project.custom_domain ? `Custom Domain: ${project.custom_domain}` : 'Connect Custom Domain'}
                        >
                          <Link2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Clone button */}
                        <button
                          onClick={() => handleCloneProject(project.id, project.title)}
                          disabled={cloningId === project.id}
                          className={`p-2 rounded-xl border text-xs font-bold transition shadow-sm ${
                            isLight ? 'bg-violet-50 border-violet-200 text-violet-600 hover:bg-violet-100' : 'bg-violet-950/50 border-violet-800 text-violet-400 hover:bg-violet-900/50'
                          }`}
                          title="Clone / Duplicate Project"
                        >
                          {cloningId === project.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        {/* ZIP Download */}
                        <button
                          onClick={() => handleExportZip(project.id, project.title)}
                          disabled={downloadingZipId === project.id}
                          className={`p-2 rounded-xl border text-xs font-bold transition shadow-sm ${
                            isLight ? 'bg-sky-50 border-sky-200 text-sky-600 hover:bg-sky-100' : 'bg-sky-950/50 border-sky-800 text-sky-400 hover:bg-sky-900/50'
                          }`}
                          title="Export ZIP"
                        >
                          {downloadingZipId === project.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          disabled={deletingId === project.id}
                          className="p-2 rounded-xl bg-pink-50 border border-pink-200 hover:bg-pink-100 text-pink-600 text-xs font-bold transition shadow-sm"
                          title="Delete Project"
                        >
                          {deletingId === project.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

        )}
      </div>

      {/* User Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg p-6 sm:p-8 bg-white rounded-3xl border border-sky-200 shadow-2xl text-left"
            >
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 border-b border-slate-200 pb-6 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-400 to-pink-500 text-white flex items-center justify-center font-black text-xl shadow-lg">
                  {userNameDisplay.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{userNameDisplay}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-600 font-mono font-bold">{userEmail}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-black flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified Account
                    </span>
                  </div>
                </div>
              </div>

              {/* Password Change Form */}
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-sky-600" /> Update Account Password
                </h4>

                {passwordMessage.text && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    passwordMessage.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                      : 'bg-pink-50 text-pink-700 border border-pink-300'
                  }`}>
                    {passwordMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                    <span>{passwordMessage.text}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1 uppercase tracking-wider">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-sky-500 transition text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1 uppercase tracking-wider">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-sky-500 transition text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1 uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-sky-500 transition text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition text-xs font-bold"
                  >
                    Close
                  </button>

                  <button
                    type="submit"
                    disabled={passwordUpdating}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-pink-500 text-white text-xs font-black flex items-center gap-2 shadow-md transition disabled:opacity-50"
                  >
                    {passwordUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Creation Wizard Modal */}
      <CreationWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Animated Multi-Stage Progress Loader */}
      <CreationLoader
        isOpen={isGenerating}
        currentStep={generationStep}
        onClose={() => setIsGenerating(false)}
      />

      {/* Delete All Projects Confirmation Modal */}
      <AnimatePresence>
        {deleteAllModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-8 bg-white rounded-3xl border border-pink-300 text-center shadow-2xl relative"
            >
              <button
                onClick={() => setDeleteAllModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-4 rounded-2xl bg-pink-50 text-pink-600 border border-pink-300 inline-block mb-4">
                <AlertTriangle className="w-10 h-10" />
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-2">
                Delete All Projects?
              </h3>
              <p className="text-xs text-slate-600 mb-6 font-semibold">
                This action is permanent and cannot be undone. All {projects.length} website projects will be erased.
              </p>

              <form onSubmit={handleDeleteAllProjects} className="space-y-4">
                <div className="text-left">
                  <label className="block text-xs font-black text-pink-700 uppercase tracking-wider mb-2">
                    Type <span className="font-mono bg-pink-100 px-2 py-0.5 rounded text-pink-800 font-black">DELETE ALL</span> to confirm
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="DELETE ALL"
                    value={confirmInputText}
                    onChange={(e) => setConfirmInputText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-pink-300 text-slate-900 focus:outline-none focus:border-pink-500 transition text-sm font-mono font-bold"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteAllModalOpen(false)}
                    className="w-full py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={deletingAll || confirmInputText.trim() !== 'DELETE ALL'}
                    className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-pink-600/25 transition disabled:opacity-40"
                  >
                    {deletingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    <span>Confirm Delete All</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Website Traffic Analytics Modal */}
      {analyticsModalProject && (
        <AnalyticsModal
          isOpen={!!analyticsModalProject}
          onClose={() => setAnalyticsModalProject(null)}
          websiteId={analyticsModalProject.id}
          websiteTitle={analyticsModalProject.title}
        />
      )}

      {/* Custom Domain Modal */}
      {domainModalProject && (
        <CustomDomainModal
          isOpen={!!domainModalProject}
          onClose={() => setDomainModalProject(null)}
          project={domainModalProject}
          onDomainUpdated={fetchDashboardData}
        />
      )}

      {/* UPI Payment Modal (₹1 per additional website) */}
      <UPIPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        quotaInfo={quota}
      />
    </div>
  );
};

export default Dashboard;

