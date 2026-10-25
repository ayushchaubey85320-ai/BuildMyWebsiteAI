import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, BarChart2, Eye, Users, TrendingUp, Smartphone, Monitor, 
  Globe, ArrowUpRight, RotateCcw, Loader2, Sparkles, CheckCircle2 
} from 'lucide-react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

const AnalyticsModal = ({ isOpen, onClose, websiteId, websiteTitle }) => {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    if (!websiteId) return;
    setLoading(true);
    setError('');
    try {
      const resp = await api.get(`/analytics/stats/${websiteId}`);
      setData(resp.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err.response?.data?.detail || 'Failed to fetch traffic metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && websiteId) {
      fetchStats();
    }
  }, [isOpen, websiteId]);

  const handleReset = async () => {
    if (!window.confirm('Reset all analytics counters for this website? This action cannot be undone.')) return;
    setResetting(true);
    try {
      await api.delete(`/analytics/reset/${websiteId}`);
      await fetchStats();
    } catch (err) {
      alert('Reset failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setResetting(false);
    }
  };

  if (!isOpen) return null;

  const maxDailyViews = Math.max(...(data?.daily_stats?.map(d => d.views) || [1]), 1);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-3xl rounded-3xl border shadow-2xl p-6 sm:p-8 overflow-hidden transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-400 to-pink-500 text-white shadow-md">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">Website Traffic Analytics</h3>
                <p className="text-xs text-sky-500 font-mono font-bold truncate max-w-sm">
                  {websiteTitle || 'Project'} • Live Visitor Insights
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
              <p className="text-sm font-bold text-slate-400">Loading traffic metrics...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-sm text-pink-500 font-bold mb-4">{error}</p>
              <button
                onClick={fetchStats}
                className="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 transition"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700/60'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Views</span>
                    <Eye className="w-4 h-4 text-sky-500" />
                  </div>
                  <div className="text-2xl font-black">{data?.total_views || 0}</div>
                  <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 mt-1">
                    <TrendingUp className="w-3 h-3" /> All-time traffic
                  </span>
                </div>

                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700/60'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unique Visitors</span>
                    <Users className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-2xl font-black">{data?.unique_visitors || 0}</div>
                  <span className="text-[10px] text-indigo-400 font-bold mt-1 block">Distinct visitors</span>
                </div>

                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700/60'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-emerald-500">{data?.today_views || 0}</div>
                  <span className="text-[10px] text-slate-400 font-bold mt-1 block">Views today</span>
                </div>

                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700/60'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                    <Globe className="w-4 h-4 text-pink-500" />
                  </div>
                  <div className="text-sm font-black mt-1">
                    {data?.is_published ? (
                      <span className="text-emerald-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
                      </span>
                    ) : (
                      <span className="text-slate-400">Draft</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 truncate block mt-1">
                    {data?.custom_domain || (data?.subdomain ? `${data.subdomain}.site` : 'Co-domain')}
                  </span>
                </div>
              </div>

              {/* 7-Day Traffic Bar Chart */}
              <div className={`p-5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/50'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">7-Day Visit Velocity</h4>
                  <span className="text-[10px] font-bold text-sky-500">Page Views by Date</span>
                </div>
                <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2">
                  {data?.daily_stats?.map((day, idx) => {
                    const heightPercent = Math.max(Math.round((day.views / maxDailyViews) * 100), 8);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                        {/* Tooltip */}
                        <div className="absolute -top-8 px-2 py-1 rounded bg-black/80 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                          {day.views} views ({day.uniques} unique)
                        </div>
                        <div className="w-full flex justify-center">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full max-w-[32px] rounded-t-lg bg-gradient-to-t from-sky-500 to-cyan-400 transition-all group-hover:from-pink-500 group-hover:to-rose-400"
                          />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400">{day.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Pages & Device Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Top Pages */}
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/50'}`}>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Top Pages</h4>
                  {data?.top_pages?.length > 0 ? (
                    <div className="space-y-2">
                      {data.top_pages.map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-xs font-bold">
                          <span className="font-mono text-sky-500 truncate max-w-[180px]">{p.path}</span>
                          <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-500">{p.views} views</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No page visits logged yet.</p>
                  )}
                </div>

                {/* Device Breakdown */}
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/50'}`}>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Device Types</h4>
                  <div className="space-y-2 text-xs font-bold">
                    {Object.entries(data?.device_breakdown || { Desktop: 0, Mobile: 0 }).map(([dev, count], i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          {dev === 'Mobile' ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
                          {dev}
                        </span>
                        <span className="font-mono">{count} visits</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
                <button
                  onClick={handleReset}
                  disabled={resetting}
                  className="flex items-center gap-1.5 text-pink-500 hover:text-pink-600 font-bold transition disabled:opacity-50"
                >
                  {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  <span>Reset Stats</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AnalyticsModal;
