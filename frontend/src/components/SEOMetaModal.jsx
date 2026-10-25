import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, Globe, Image, CheckCircle2, Sparkles, 
  Share2, Tag, FileText, Check 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SEOMetaModal = ({ isOpen, onClose, seoData, brandName, onSave }) => {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    if (seoData) {
      setTitle(seoData.title || `${brandName || 'My Website'} - Official Website`);
      setDescription(seoData.description || `Welcome to ${brandName || 'our website'}. Discover our services, portfolio, and contact details.`);
      setKeywords(seoData.keywords || `${brandName || 'business'}, services, contact, official`);
      setOgImage(seoData.og_image || '');
      setAuthor(seoData.author || brandName || '');
    }
  }, [seoData, brandName, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSave({
      title: title.trim(),
      description: description.trim(),
      keywords: keywords.trim(),
      og_image: ogImage.trim(),
      author: author.trim()
    });
    onClose();
  };

  const titleLength = title.length;
  const descLength = description.length;

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
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">SEO & Social Meta Editor</h3>
                <p className="text-xs text-sky-500 font-mono font-bold truncate max-w-sm">
                  Customize Google Search snippets and OpenGraph social cards
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

          <form onSubmit={handleSave} className="space-y-6">
            {/* Live Google Search Simulation Box */}
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-sky-500" /> Google Search Preview
                </span>
                <span className="text-[10px] text-slate-400">Desktop & Mobile SERP</span>
              </div>
              <div className="font-sans space-y-1">
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                  https://www.yourdomain.com <span className="text-slate-400">› official</span>
                </div>
                <div className="text-base font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer line-clamp-1">
                  {title || 'Your Website Title Here'}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {description || 'Provide a compelling description that explains what makes your brand unique so search engine users click your link.'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title Field */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Page Title Tag
                  </label>
                  <span className={`text-[10px] font-bold ${titleLength > 65 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {titleLength} / 60 chars (ideal)
                  </span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Acme Studio - Modern Architecture & Interior Design"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                  required
                />
              </div>

              {/* Description Field */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Meta Description
                  </label>
                  <span className={`text-[10px] font-bold ${descLength > 165 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {descLength} / 155 chars (ideal)
                  </span>
                </div>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Award-winning residential and commercial architecture firm specializing in sustainable spaces across the nation."
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                  required
                />
              </div>

              {/* Keywords Field */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                  SEO Keywords
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="comma separated: design, architecture, modern"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
              </div>

              {/* Social Share Image URL */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                  Social Card Image URL (OG:Image)
                </label>
                <input
                  type="url"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-pink-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition transform hover:scale-105"
              >
                <Check className="w-4 h-4" />
                <span>Save SEO Tags</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SEOMetaModal;
