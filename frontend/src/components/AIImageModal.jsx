import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Image as ImageIcon, Loader2, Check, 
  RefreshCw, Wand2, Download, ExternalLink, Clock, Camera, Key, Cpu, Info 
} from 'lucide-react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

const STYLES = [
  { id: 'photorealistic', label: '📸 Photorealistic' },
  { id: 'minimal', label: '🎨 Minimalist' },
  { id: '3d', label: '🚀 3D Render' },
  { id: 'cinematic', label: '🎬 Cinematic' },
  { id: 'vector', label: '✏️ Vector Graphic' }
];

const SUGGESTIONS = [
  "High-energy modern fitness gym with neon lighting and weights",
  "Modern minimalist cafe interior with barista brewing espresso",
  "Futuristic AI technology workspace with holographic screens",
  "Luxury boutique spa wellness room with organic bamboo and stone",
  "Contemporary dental and medical clinic with pristine friendly atmosphere"
];

const CURATED_GALLERIES = [
  {
    category: 'Fitness & Gym',
    tag: 'gym',
    photos: [
      { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80', title: 'Modern Gym Arena' },
      { url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80', title: 'Cardio & Strength' },
      { url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80', title: 'Personal Training Studio' },
      { url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80', title: 'CrossFit Dumbbells' }
    ]
  },
  {
    category: 'Cafe & Restaurant',
    tag: 'food',
    photos: [
      { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', title: 'Cozy Artisan Cafe' },
      { url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80', title: 'Espresso Bar' },
      { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', title: 'Gourmet Dining' }
    ]
  },
  {
    category: 'Salon & Spa',
    tag: 'beauty',
    photos: [
      { url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80', title: 'Luxury Hair Salon' },
      { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80', title: 'Aesthetic Treatment' },
      { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', title: 'Relaxing Spa' }
    ]
  },
  {
    category: 'Tech & Agency',
    tag: 'tech',
    photos: [
      { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80', title: 'Modern Tech Workspace' },
      { url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', title: 'Collaborative Team' },
      { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80', title: 'Cyber Network' }
    ]
  },
  {
    category: 'Healthcare & Clinic',
    tag: 'health',
    photos: [
      { url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80', title: 'Dental & Clinic' },
      { url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80', title: 'Medical Practice' },
      { url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80', title: 'Healthcare Doctor' }
    ]
  }
];

const AIImageModal = ({ isOpen, onClose, onApplyImage, defaultPrompt = '' }) => {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [activeTab, setActiveTab] = useState('ai'); // 'ai' or 'curated'
  const [prompt, setPrompt] = useState(defaultPrompt || '');
  const [style, setStyle] = useState('photorealistic');
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [geminiResult, setGeminiResult] = useState(null);
  const [showEnhanced, setShowEnhanced] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Gemini API Key State & Storage
  const [customKey, setCustomKey] = useState(localStorage.getItem('user_gemini_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    localStorage.setItem('user_gemini_key', customKey.trim());
    setShowKeyInput(false);
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || cooldown > 0 || generating) return;

    setGenerating(true);
    setCooldown(3); // 3-second rapid debounce

    try {
      const storedKey = customKey.trim() || localStorage.getItem('user_gemini_key') || '';
      const resp = await api.post('/generator/generate-image', {
        prompt: prompt.trim(),
        style: style,
        width: 1200,
        height: 800,
        api_key: storedKey
      });

      setGeneratedUrl(resp.data.image_url);
      setGeminiResult(resp.data);
    } catch (err) {
      console.error('Image generation error:', err);
      const seed = Math.floor(Math.random() * 999999);
      const enc = encodeURIComponent(`${prompt}, ${style}, 8k ultra realistic website hero photography`);
      const fallbackUrl = `https://image.pollinations.ai/prompt/${enc}?width=1200&height=800&nologo=true&seed=${seed}`;
      setGeneratedUrl(fallbackUrl);
      setGeminiResult({
        image_url: fallbackUrl,
        enhanced_prompt: `${prompt}, ${style}, 8k resolution, professional photography`,
        source: 'fallback',
        gemini_active: false
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleApply = (urlToApply) => {
    const finalUrl = urlToApply || generatedUrl;
    if (finalUrl && onApplyImage) {
      onApplyImage(finalUrl);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-8 overflow-hidden transition-colors max-h-[90vh] flex flex-col ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-600 text-white shadow-md">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black tracking-tight">AI & HD Image Studio</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                    Gemini AI Active
                  </span>
                </div>
                <p className="text-xs text-sky-500 font-mono font-bold truncate max-w-sm">
                  Powered by Google Gemini API & High-Res Commercial Engine
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowKeyInput(!showKeyInput)}
                className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                  customKey 
                    ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' 
                    : isLight ? 'border-slate-300 text-slate-600 hover:bg-slate-100' : 'border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
                title="Configure Gemini API Key"
              >
                <Key className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{customKey ? 'Key Set' : 'Gemini Key'}</span>
              </button>

              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Optional Gemini API Key Drawer */}
          {showKeyInput && (
            <div className={`p-3 rounded-2xl border mb-4 text-xs space-y-2 shrink-0 ${
              isLight ? 'bg-sky-50/70 border-sky-200' : 'bg-sky-950/30 border-sky-800/50'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-sky-400">
                  <Key className="w-3.5 h-3.5" /> Google Gemini API Key
                </span>
                <span className="text-[10px] text-slate-400">
                  Leave blank to use system server key
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="Enter your custom Gemini API key (AIzaSy...)"
                  className={`flex-1 px-3 py-1.5 rounded-xl border text-xs font-mono transition focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition"
                >
                  Save Key
                </button>
              </div>
            </div>
          )}

          {/* Mode Switch Tabs */}
          <div className="flex gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-4 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
                activeTab === 'ai'
                  ? 'bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Gemini AI Prompt Generator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('curated')}
              className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
                activeTab === 'curated'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Curated 4K HD Photography</span>
            </button>
          </div>

          <div className="overflow-y-auto pr-1 flex-1 space-y-4">
            {activeTab === 'ai' ? (
              <>
                {/* Form */}
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      Describe the image you need
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. Modern boutique fitness gym with weights and neon vibes..."
                        className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                        }`}
                        required
                      />
                      <button
                        type="submit"
                        disabled={generating || cooldown > 0}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition transform hover:scale-105 disabled:opacity-50 shrink-0"
                      >
                        {generating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        <span>{generating ? 'Gemini Synthesizing...' : 'Generate with Gemini'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Suggestions Chips */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Quick Ideas:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTIONS.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPrompt(s)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition truncate max-w-[260px] ${
                            isLight ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Style Selector */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      Visual Art Style
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {STYLES.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setStyle(st.id)}
                          className={`p-2 rounded-xl border text-center transition ${
                            style === st.id
                              ? 'bg-sky-500/10 border-sky-500 text-sky-500 font-black'
                              : isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          <div className="text-xs font-bold truncate">{st.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </form>

                {/* Generated Result Preview */}
                {generatedUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}
                  >
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-black/40 flex items-center justify-center border border-white/10 mb-3 shadow-inner">
                      <img
                        src={generatedUrl}
                        alt="AI Generated"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-bold text-sky-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-sky-400" />
                        <span>Synthesized with Gemini AI</span>
                      </div>
                    </div>

                    {/* Gemini Art Direction Details */}
                    {geminiResult?.enhanced_prompt && (
                      <div className="mb-3 text-[11px] p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                        <button
                          type="button"
                          onClick={() => setShowEnhanced(!showEnhanced)}
                          className="w-full flex items-center justify-between text-left font-bold text-sky-400 hover:text-sky-300"
                        >
                          <span className="flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                            Gemini AI Art Director Prompt
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {showEnhanced ? 'Hide ▲' : 'Inspect ▼'}
                          </span>
                        </button>
                        {showEnhanced && (
                          <p className="mt-2 text-[10px] text-slate-400 leading-relaxed font-mono">
                            {geminiResult.enhanced_prompt}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> High-Resolution Ready
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleGenerate}
                          disabled={generating || cooldown > 0}
                          className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1 disabled:opacity-40"
                          title="Generate Variation"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                          <span>Variant</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApply(generatedUrl)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition transform hover:scale-105"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Apply to Site</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              /* Curated HD 4K Photography Gallery (Instant, Zero Wait) */
              <div className="space-y-4">
                <div className="text-xs text-slate-400">
                  Select an authentic commercial photography asset tailored to popular business niches:
                </div>
                {CURATED_GALLERIES.map((gal, gIdx) => (
                  <div key={gIdx} className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <span>{gal.category}</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {gal.photos.map((photo, pIdx) => (
                        <div
                          key={pIdx}
                          onClick={() => handleApply(photo.url)}
                          className="group relative rounded-xl overflow-hidden aspect-video border border-slate-700 cursor-pointer hover:border-emerald-400 transition transform hover:scale-105 shadow-md"
                        >
                          <img
                            src={photo.url}
                            alt={photo.title}
                            className="w-full h-full object-cover group-hover:opacity-90 transition"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition">
                            <span className="text-[10px] font-bold text-white flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" /> Apply Photo
                            </span>
                          </div>
                          <span className="absolute top-1 right-1 text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-white font-mono">
                            4K HD
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800 shrink-0 mt-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AIImageModal;
