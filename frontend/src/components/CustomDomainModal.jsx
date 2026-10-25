import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Globe, CheckCircle2, AlertCircle, Copy, Check, 
  ExternalLink, Loader2, Trash2, RefreshCw, ShieldCheck 
} from 'lucide-react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

const CustomDomainModal = ({ isOpen, onClose, project, onDomainUpdated }) => {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [domainInput, setDomainInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [statusInfo, setStatusInfo] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [copiedTarget, setCopiedTarget] = useState(false);

  useEffect(() => {
    if (project) {
      setDomainInput(project.custom_domain || '');
      if (project.custom_domain) {
        verifyDomainStatus(project.id);
      } else {
        setStatusInfo(null);
      }
    }
  }, [project, isOpen]);

  const verifyDomainStatus = async (projectId) => {
    setVerifying(true);
    try {
      const resp = await api.get(`/dashboard/projects/${projectId}/custom-domain/verify`);
      setStatusInfo(resp.data);
    } catch (err) {
      setStatusInfo({ status: 'dns_pending', details: 'DNS propagation in progress. Please check your domain DNS settings.' });
    } finally {
      setVerifying(false);
    }
  };

  const handleConnectDomain = async (e) => {
    e.preventDefault();
    if (!domainInput.trim()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const resp = await api.post(`/dashboard/projects/${project.id}/custom-domain`, {
        domain: domainInput.trim()
      });
      setMessage({ type: 'success', text: resp.data.message });
      if (onDomainUpdated) onDomainUpdated();
      verifyDomainStatus(project.id);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to bind custom domain.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect this custom domain from your website?')) return;
    setLoading(true);
    try {
      await api.delete(`/dashboard/projects/${project.id}/custom-domain`);
      setDomainInput('');
      setStatusInfo(null);
      setMessage({ type: 'success', text: 'Custom domain disconnected.' });
      if (onDomainUpdated) onDomainUpdated();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to remove domain.' });
    } finally {
      setLoading(false);
    }
  };

  const targetHost = `${project?.subdomain || 'mybrand'}.buildmywebsiteai.site`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedTarget(true);
    setTimeout(() => setCopiedTarget(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-8 overflow-hidden transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-400 to-pink-500 text-white shadow-md">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">Custom Domain Mapping</h3>
                <p className="text-xs text-sky-500 font-mono font-bold truncate max-w-sm">
                  Connect your own brand domain (e.g. yourbrand.com)
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

          {message.text && (
            <div className={`p-3.5 rounded-xl text-xs font-bold mb-4 flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500' 
                : 'bg-pink-500/10 border border-pink-500/30 text-pink-500'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleConnectDomain} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Your Domain Name
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. mycompany.com or www.mycompany.com"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className={`flex-1 px-4 py-3 rounded-xl border text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-pink-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition transform hover:scale-105 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  <span>{project?.custom_domain ? 'Update' : 'Connect'}</span>
                </button>
              </div>
            </div>
          </form>

          {/* DNS Configuration Instructions */}
          <div className={`p-5 rounded-2xl border mb-6 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-500" />
                DNS CNAME Record Setup
              </h4>
              <span className="text-[10px] font-bold text-sky-500">GoDaddy / Namecheap / Cloudflare</span>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, Hostinger) and create the following DNS record:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700/60'}`}>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Record Type</span>
                <span className="font-mono font-black text-sky-500 text-sm">CNAME</span>
              </div>

              <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700/60'}`}>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Host / Name</span>
                <span className="font-mono font-black text-indigo-400 text-sm">www or @</span>
              </div>

              <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700/60'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Target / Points To</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(targetHost)}
                    className="text-sky-500 hover:text-sky-400 text-[10px] font-bold flex items-center gap-0.5"
                    title="Copy Target"
                  >
                    {copiedTarget ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTarget ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <span className="font-mono font-bold text-emerald-500 text-[11px] truncate block mt-0.5" title={targetHost}>
                  {targetHost}
                </span>
              </div>
            </div>
          </div>

          {/* Status Bar & Actions */}
          {project?.custom_domain && (
            <div className={`p-4 rounded-2xl border mb-6 flex items-center justify-between gap-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/50'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${statusInfo?.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <div>
                  <div className="text-xs font-black">
                    {statusInfo?.status === 'active' ? 'Domain Active & Configured' : 'DNS Propagation Pending'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {statusInfo?.details || 'Changes can take up to 24 hours to propagate across all DNS servers.'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => verifyDomainStatus(project.id)}
                  disabled={verifying}
                  className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                  title="Re-check DNS"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-sky-500 ${verifying ? 'animate-spin' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-500 hover:bg-pink-500/20 transition"
                  title="Disconnect Custom Domain"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CustomDomainModal;
