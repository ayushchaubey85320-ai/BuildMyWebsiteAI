import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Eye, Download, Globe, Trash2, Sparkles, 
  Layers, Search, Loader2, LogOut, User as UserIcon, AlertTriangle, 
  X, Lock, KeyRound, CheckCircle2, ShieldCheck, Mail, UserCheck
} from 'lucide-react';
import api from '../api';
import AnimatedBackground from '../components/AnimatedBackground';
import CreationWizardModal from '../components/CreationWizardModal';
import CreationLoader from '../components/CreationLoader';

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // User Profile state
  const [userEmail, setUserEmail] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [userId, setUserId] = useState(null);
  
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

      try {
        const meResp = await api.get('/auth/me');
        if (meResp.data) {
          setUserEmail(meResp.data.email || '');
          setUserFullName(meResp.data.full_name || '');
          setUserId(meResp.data.id || null);
          localStorage.setItem('buildmywebsiteai_user', JSON.stringify(meResp.data));
        }
      } catch (e) {}

      const projResp = await api.get('/dashboard/projects');
      setProjects(projResp.data || []);
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
      if (e.key === 'buildmywebsiteai_token' || e.key === 'buildmywebsiteai_user') {
        const token = localStorage.getItem('buildmywebsiteai_token');
        if (!token) {
          navigate('/login');
        } else {
          fetchDashboardData();
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
    navigate('/login');
  };

  const handleCreateSubmit = async (payload) => {
    setIsWizardOpen(false);
    setIsGenerating(true);
    setGenerationStep(0);

    const stepTimer = setInterval(() => {
      setGenerationStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1200);

    try {
      const resp = await api.post('/generator/create', payload);
      clearInterval(stepTimer);
      setIsGenerating(false);
      navigate(`/preview/${resp.data.id}`);
    } catch (err) {
      clearInterval(stepTimer);
      setIsGenerating(false);
      alert('Website generation failed: ' + (err.response?.data?.detail || err.message));
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
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_website.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('ZIP export failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setDownloadingZipId(null);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userNameDisplay = userFullName || (userEmail ? userEmail.split('@')[0] : 'User');

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8">
      <AnimatedBackground />

      {/* 3-Second Welcome Pop-up Toast Notification Card */}
      <AnimatePresence>
        {showWelcomeToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 p-4 sm:p-5 bg-white rounded-2xl border border-sky-300 shadow-2xl flex items-center gap-4 max-w-sm"
          >
            <div className="p-3 rounded-xl bg-gradient-to-tr from-cyan-400 via-sky-400 to-pink-500 text-white shrink-0 shadow-lg">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1 pr-2">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span>Welcome back, {userNameDisplay}!</span>
                <span className="text-xs">👋</span>
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 font-mono truncate font-semibold">
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
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span className="bg-gradient-to-r from-cyan-500 via-sky-400 to-pink-500 bg-clip-text text-transparent font-black">
                BuildMyWebsiteAI
              </span>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-sky-100 text-sky-700 border border-sky-300">
                Command Center
              </span>
            </h1>
            <p className="text-sm text-slate-600 mt-1 font-semibold">
              Manage, edit, and publish your AI-generated websites
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-sky-400 hover:bg-slate-50 text-xs text-slate-800 font-bold transition shadow-sm group"
              title="Click to View Account Profile & Settings"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 via-sky-400 to-pink-500 text-white flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-105 transition">
                {userNameDisplay.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-extrabold text-xs text-slate-900 leading-tight">{userNameDisplay}</div>
                <div className="text-[10px] text-slate-500 font-mono truncate max-w-[120px] font-semibold">{userEmail}</div>
              </div>
            </button>

            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-pink-500 hover:from-cyan-500 hover:to-pink-600 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-sky-500/25 transition transform hover:scale-105"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Create Website</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-pink-600" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Dynamic Metrics Grid - Pure White Surface Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-3xl border border-sky-200 flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Total Projects</p>
              <h3 className="text-4xl font-black text-slate-900 mt-1">{totalProjectsCount}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-200">
              <Layers className="w-7 h-7" />
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-sky-200 flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Live Co-Domains</p>
              <h3 className="text-4xl font-black text-emerald-600 mt-1">{liveCoDomainsCount}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Globe className="w-7 h-7" />
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-sky-200 flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Active Categories</p>
              <h3 className="text-4xl font-black text-pink-600 mt-1">{activeCategoriesCount}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-pink-50 text-pink-600 border border-pink-200">
              <Sparkles className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-300 w-full sm:max-w-md shadow-sm">
            <Search className="w-5 h-5 text-slate-500 ml-3" />
            <input
              type="text"
              placeholder="Search projects by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 focus:outline-none py-2 pr-4 placeholder:text-slate-400 font-bold"
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

        {/* Project Cards Grid - Pure White High-Contrast Cards */}
        {loading ? (
          <div className="p-12 text-center text-slate-600">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold">Loading Website Projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-md">
            <Layers className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-900 mb-2">No Website Projects Found</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 font-semibold">
              Create your first website using the BuildMyWebsiteAI Creation Wizard.
            </p>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-pink-500 text-white font-black text-sm shadow-md transition hover:scale-105"
            >
              Create Website
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative p-6 bg-white rounded-3xl border border-sky-200 hover:border-sky-400 transition-all shadow-md hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                      {project.category}
                    </span>
                    <span className="text-xs text-slate-600 font-bold">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-sky-600 transition tracking-tight">
                    {project.title}
                  </h3>
                  <p className="text-xs text-sky-700 font-mono font-bold mb-4">
                    {project.subdomain}.buildmywebsiteai.site
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2">
                  <Link
                    to={`/preview/${project.id}`}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-pink-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition transform hover:scale-105"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview & Edit</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportZip(project.id, project.title)}
                      disabled={downloadingZipId === project.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold transition shadow-sm"
                      title="Export ZIP"
                    >
                      {downloadingZipId === project.id ? (
                        <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 text-sky-600" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      disabled={deletingId === project.id}
                      className="p-2.5 rounded-xl bg-pink-50 border border-pink-300 hover:bg-pink-100 text-pink-600 text-xs font-bold transition shadow-sm"
                      title="Delete Project"
                    >
                      {deletingId === project.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
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
    </div>
  );
};

export default Dashboard;
