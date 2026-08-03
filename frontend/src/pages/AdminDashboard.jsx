import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Users, Layers, LogIn, Trash2, LogOut, 
  Search, Loader2, Sparkles, AlertTriangle, CheckCircle2 
} from 'lucide-react';
import api from '../api';
import AnimatedBackground from '../components/AnimatedBackground';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [impersonatingId, setImpersonatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [notification, setNotification] = useState('');

  const fetchAdminData = async () => {
    try {
      const storedUser = localStorage.getItem('buildmywebsiteai_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setAdminEmail(parsed.email || 'admin@buildmywebsiteai.ai');
        } catch (e) {}
      }

      const resp = await api.get('/admin/users');
      setUsers(resp.data || []);
    } catch (err) {
      alert('Admin Access Error: ' + (err.response?.data?.detail || err.message));
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();

    const handleStorageChange = (e) => {
      if (e.key === 'buildmywebsiteai_token' || e.key === 'buildmywebsiteai_user') {
        const token = localStorage.getItem('buildmywebsiteai_token');
        if (!token) {
          navigate('/login');
        } else {
          fetchAdminData();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('buildmywebsiteai_token');
    localStorage.removeItem('buildmywebsiteai_user');
    navigate('/login');
  };

  const handleImpersonateUser = async (targetUser) => {
    if (!window.confirm(`Are you sure you want to login directly as ${targetUser.email}?`)) return;
    setImpersonatingId(targetUser.id);

    try {
      const resp = await api.post(`/admin/impersonate/${targetUser.id}`);
      localStorage.setItem('buildmywebsiteai_token', resp.data.access_token);
      localStorage.setItem('buildmywebsiteai_user', JSON.stringify(resp.data.user));

      setNotification(`Successfully logged in as ${targetUser.email}! Redirecting...`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      alert('Impersonation failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setImpersonatingId(null);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user ${userEmail}? All their websites will be deleted.`)) return;
    setDeletingId(userId);

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      setNotification(`User ${userEmail} deleted successfully.`);
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      alert('User deletion failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name && u.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUsersCount = users.length;
  const totalProjectsCount = users.reduce((acc, u) => acc + (u.project_count || 0), 0);

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8">
      <AnimatedBackground />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header Bar */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-400 to-pink-400 text-white shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span className="bg-gradient-to-r from-cyan-500 via-sky-400 to-pink-400 bg-clip-text text-transparent font-black">
                  Super Admin Portal
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                  Control Center
                </span>
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Manage registered users, inspect credentials & launch direct user sessions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span className="font-mono font-medium">{adminEmail}</span>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <LogOut className="w-4 h-4 text-pink-500" />
              <span>Admin Logout</span>
            </button>
          </div>
        </header>

        {/* Notification Toast */}
        {notification && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-3 text-sm font-bold shadow-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{notification}</span>
          </motion.div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 glass-panel rounded-3xl border border-sky-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registered Users</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{totalUsersCount}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-sky-50 text-sky-500 border border-sky-100">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 glass-panel rounded-3xl border border-sky-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Generated Websites</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">{totalProjectsCount}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-500 border border-emerald-100">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 max-w-md shadow-sm">
          <Search className="w-5 h-5 text-slate-400 ml-3" />
          <input
            type="text"
            placeholder="Search users by name or email address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 focus:outline-none py-2 pr-4 placeholder:text-slate-400 font-medium"
          />
        </div>

        {/* Registered Users Table */}
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium">Loading User Records...</p>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4 sm:p-5">ID</th>
                    <th className="p-4 sm:p-5">Full Name</th>
                    <th className="p-4 sm:p-5">Email Address</th>
                    <th className="p-4 sm:p-5">Websites</th>
                    <th className="p-4 sm:p-5">Joined Date</th>
                    <th className="p-4 sm:p-5 text-right">Actions (Direct Login)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-sky-50/50 transition">
                      <td className="p-4 sm:p-5 font-mono text-xs text-slate-400">#{u.id}</td>
                      <td className="p-4 sm:p-5 font-bold text-slate-900 flex items-center gap-2">
                        <span>{u.full_name}</span>
                        {u.is_admin && (
                          <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                            ADMIN
                          </span>
                        )}
                      </td>
                      <td className="p-4 sm:p-5 font-mono text-xs text-slate-600">{u.email}</td>
                      <td className="p-4 sm:p-5">
                        <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-600 border border-sky-200 text-xs font-bold">
                          {u.project_count} Websites
                        </span>
                      </td>
                      <td className="p-4 sm:p-5 text-xs text-slate-500 font-medium">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 sm:p-5 text-right space-x-2">
                        {/* Direct Login (Impersonate) Button */}
                        <button
                          onClick={() => handleImpersonateUser(u)}
                          disabled={impersonatingId === u.id}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-pink-400 hover:from-cyan-500 hover:to-pink-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition transform hover:scale-105 disabled:opacity-50"
                          title={`Click to directly log in as ${u.email}`}
                        >
                          {impersonatingId === u.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <LogIn className="w-3.5 h-3.5" />
                          )}
                          <span>Login</span>
                        </button>

                        {/* Delete User Button */}
                        {!u.is_admin && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            disabled={deletingId === u.id}
                            className="p-2 rounded-xl bg-pink-50 border border-pink-200 hover:bg-pink-100 text-pink-500 text-xs transition shadow-sm"
                            title="Delete User Account"
                          >
                            {deletingId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
