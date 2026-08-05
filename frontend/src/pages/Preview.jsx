import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, Tablet, Smartphone, Download, Globe, ArrowLeft, 
  Sparkles, CheckCircle2, Copy, ExternalLink, Loader2, Layers 
} from 'lucide-react';
import api from '../api';
import NavbarSection from '../components/NavbarSection';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import ServicesSection from '../components/ServicesSection';
import FeaturesSection from '../components/FeaturesSection';
import FAQSection from '../components/FAQSection';
import TestimonialsSection from '../components/TestimonialsSection';
import CTASection from '../components/CTASection';
import FooterSection from '../components/FooterSection';
import AIEditBar from '../components/AIEditBar';
import AnimatedBackground from '../components/AnimatedBackground';
import confetti from 'canvas-confetti';

const getThemeColors = (themeName, themeMode = "dark") => {
  const themes = {
    MODERN_DARK: { bg: "#0f172a", surface: "#1e293b", primary: "#6366f1", secondary: "#ec4899", text: "#f8fafc", muted: "#94a3b8", accent: "#38bdf8", card_bg: "#1e293b", card_border: "rgba(255,255,255,0.1)", mode: "dark" },
    NEON_CYBER: { bg: "#09090b", surface: "#18181b", primary: "#22c55e", secondary: "#a855f7", text: "#ffffff", muted: "#a1a1aa", accent: "#06b6d4", card_bg: "#18181b", card_border: "rgba(255,255,255,0.1)", mode: "dark" },
    MINIMAL_LIGHT: { bg: "#f8fafc", surface: "#ffffff", primary: "#2563eb", secondary: "#0284c7", text: "#0f172a", muted: "#475569", accent: "#ec4899", card_bg: "#ffffff", card_border: "#e2e8f0", mode: "light" },
    ELEGANT_GOLD: { bg: "#0b0f19", surface: "#111827", primary: "#eab308", secondary: "#f97316", text: "#fef08a", muted: "#d1d5db", accent: "#d97706", card_bg: "#111827", card_border: "rgba(255,255,255,0.1)", mode: "dark" },
    OCEAN_BLUE: { bg: "#030712", surface: "#0f172a", primary: "#0284c7", secondary: "#06b6d4", text: "#f0f9ff", muted: "#94a3b8", accent: "#38bdf8", card_bg: "#0f172a", card_border: "rgba(255,255,255,0.1)", mode: "dark" },
    SUNSET_ORANGE: { bg: "#180e29", surface: "#28153f", primary: "#f97316", secondary: "#ef4444", text: "#fff7ed", muted: "#f5d0fe", accent: "#fbbf24", card_bg: "#28153f", card_border: "rgba(255,255,255,0.1)", mode: "dark" }
  };
  
  if (themeMode === "light" && themeName !== "MINIMAL_LIGHT") {
    const darkTheme = themes[themeName] || themes.MODERN_DARK;
    return {
      bg: "#f8fafc",
      surface: "#ffffff",
      primary: darkTheme.primary,
      secondary: darkTheme.secondary,
      text: "#0f172a",
      muted: "#475569",
      accent: darkTheme.accent,
      card_bg: "#ffffff",
      card_border: "#e2e8f0",
      mode: "light"
    };
  }
  return themes[themeName] || themes.MODERN_DARK;
};

const Preview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [website, setWebsite] = useState(null);
  const [histories, setHistories] = useState([]);
  const [viewport, setViewport] = useState('desktop');
  const [activePage, setActivePage] = useState('Home');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [liveUrl, setLiveUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchWebsiteDetails = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const [webResp, histResp] = await Promise.all([
        api.get(`/dashboard/projects/${id}`),
        api.get(`/generator/history/${id}`)
      ]);
      setWebsite(webResp.data);
      setHistories(histResp.data);
    } catch (err) {
      console.error('Error fetching website preview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsiteDetails();
  }, [id]);

  const handleApplyEdit = async (instruction) => {
    setUpdating(true);
    try {
      const resp = await api.post(`/generator/edit/${id}`, { prompt_instruction: instruction });
      setWebsite(resp.data);
      const histResp = await api.get(`/generator/history/${id}`);
      setHistories(histResp.data);
    } catch (err) {
      alert('Error updating website layout: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleExportZip = async () => {
    setDownloadingZip(true);
    try {
      const response = await api.get(`/export/zip/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${website.title.toLowerCase().replace(/\s+/g, '_')}_website.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('ZIP export failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDeployCoDomain = async () => {
    try {
      const resp = await api.post(`/export/deploy/${id}`);
      setLiveUrl(resp.data.live_url);
      setDeployModalOpen(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      alert('Co-domain publishing failed.');
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm font-medium text-slate-400">Loading Canvas Preview...</p>
        </div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <p className="text-lg font-bold text-red-400 mb-4">Website Project Not Found</p>
          <Link to="/dashboard" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const pageTree = website.page_tree || {};
  const colors = pageTree.colors || getThemeColors(website.theme);
  const websiteType = pageTree.website_type || 'single';
  const backgroundStyle = pageTree.background_style || 'live';
  const selectedPages = pageTree.selected_pages || ["Home", "About Us", "Services", "Contact Us"];
  const pagesDict = pageTree.pages || {};

  const activePageData = (websiteType === 'multi' && pagesDict[activePage]) ? pagesDict[activePage] : pageTree;

  const viewportStyles = {
    desktop: "w-full max-w-full min-h-screen rounded-none overflow-visible",
    tablet: "w-[768px] max-h-[82vh] my-4 rounded-3xl border-[6px] border-slate-800 shadow-2xl overflow-y-auto overscroll-contain",
    mobile: "w-[375px] max-h-[82vh] my-4 rounded-3xl border-[6px] border-slate-800 shadow-2xl overflow-y-auto overscroll-contain"
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      {/* Top Floating Control Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <div className="h-5 w-px bg-slate-800" />

          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{website.title}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {website.category} • {websiteType.toUpperCase()}
              </span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              {website.subdomain}.buildmywebsiteai.site
            </span>
          </div>
        </div>

        {/* Viewport Switcher Controls */}
        <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setViewport('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewport === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>

          <button
            onClick={() => setViewport('tablet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewport === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>

          <button
            onClick={() => setViewport('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewport === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportZip}
            disabled={downloadingZip}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {downloadingZip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{downloadingZip ? 'Exporting...' : 'Export ZIP'}</span>
          </button>

          <button
            onClick={handleDeployCoDomain}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Publish Co-Domain</span>
          </button>
        </div>
      </header>

      {/* Multi-Page Sub-Page Switcher Bar */}
      {websiteType === 'multi' && (
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-2 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider shrink-0 mr-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Live Page Navigation:
          </span>
          {selectedPages.map((p) => (
            <button
              key={p}
              onClick={() => setActivePage(p)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
                activePage === p
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Main Website Canvas */}
      <main className="flex-1 flex justify-center items-center bg-slate-900/60 p-2 sm:p-4 overflow-y-auto pb-28">
        <div
          className={`${viewportStyles[viewport]} transition-all duration-300 shadow-2xl relative scroll-smooth overflow-hidden`}
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {backgroundStyle === 'live' && (
            <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
              <AnimatedBackground />
            </div>
          )}

          {updating && (
            <div className="absolute inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center">
              <div className="p-6 glass-panel rounded-2xl border border-indigo-500/40 flex items-center gap-3">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                <span className="text-sm font-bold text-white">Mutating Layout via BuildMyWebsiteAI...</span>
              </div>
            </div>
          )}

          {/* Section Components Render Engine */}
          <div className="relative z-10">
            <NavbarSection
              data={pageTree.navbar}
              colors={colors}
              viewport={viewport}
              logoUrl={website?.logo_url || pageTree?.navbar?.logo_url}
              onPageChange={(pageName) => {
                if (pagesDict[pageName] || selectedPages.includes(pageName)) {
                  setActivePage(pageName);
                }
              }}
            />
            {websiteType === 'single' ? (
              <>
                <HeroSection data={pageTree.hero} colors={colors} viewport={viewport} />
                <AboutSection data={pageTree.about} colors={colors} viewport={viewport} />
                <ServicesSection data={pageTree.services} colors={colors} viewport={viewport} />
                <FeaturesSection data={pageTree.features} colors={colors} viewport={viewport} />
                <FAQSection data={pageTree.faq} colors={colors} viewport={viewport} />
                <TestimonialsSection data={pageTree.testimonials} colors={colors} viewport={viewport} />
                <CTASection
                  data={pageTree.cta}
                  colors={colors}
                  viewport={viewport}
                  contactEmail={website.contact_email || pageTree.footer?.contact_email}
                />
              </>
            ) : (
              <>
                <HeroSection data={activePageData.hero || pageTree.hero} colors={colors} viewport={viewport} />
                {activePage === 'Home' && (
                  <>
                    <ServicesSection data={pageTree.services} colors={colors} viewport={viewport} />
                    <FeaturesSection data={pageTree.features} colors={colors} viewport={viewport} />
                    <TestimonialsSection data={pageTree.testimonials} colors={colors} viewport={viewport} />
                    <FAQSection data={pageTree.faq} colors={colors} viewport={viewport} />
                    <CTASection
                      data={pageTree.cta}
                      colors={colors}
                      viewport={viewport}
                      contactEmail={website.contact_email || pageTree.footer?.contact_email}
                    />
                  </>
                )}
                {activePage === 'About Us' && (
                  <AboutSection data={activePageData.about || pageTree.about} colors={colors} viewport={viewport} />
                )}
                {activePage === 'Services' && (
                  <ServicesSection data={activePageData.services || pageTree.services} colors={colors} viewport={viewport} />
                )}
                {activePage === 'Contact Us' && (
                  <CTASection
                    data={pageTree.cta}
                    colors={colors}
                    viewport={viewport}
                    contactEmail={website.contact_email || pageTree.footer?.contact_email}
                  />
                )}
              </>
            )}
            <FooterSection data={pageTree.footer} colors={colors} viewport={viewport} />
          </div>
        </div>
      </main>

      {/* Conversational AI Floating Edit Bar */}
      <AIEditBar
        onApplyEdit={handleApplyEdit}
        histories={histories}
        isUpdating={updating}
      />

      {/* Publishing Modal */}
      <AnimatePresence>
        {deployModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-8 glass-panel rounded-3xl border border-emerald-500/40 text-center shadow-2xl"
            >
              <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-block mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="text-2xl font-black text-white mb-2">
                Published to Co-Domain!
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Your {websiteType.toUpperCase()} website is now live and accessible worldwide on the BuildMyWebsiteAI co-domain network.
              </p>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between mb-6">
                <span className="text-xs font-mono text-indigo-300 truncate pr-2">
                  {liveUrl}
                </span>
                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1 shrink-0"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeployModalOpen(false)}
                  className="w-full py-3 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800"
                >
                  Close
                </button>
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 text-sm font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <span>Visit Live</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Preview;
