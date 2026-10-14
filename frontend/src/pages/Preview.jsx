import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, Tablet, Smartphone, Download, Globe, ArrowLeft, 
  Sparkles, CheckCircle2, Copy, ExternalLink, Loader2, Layers,
  Sliders, Palette, Sun, Moon, ArrowUp, ArrowDown, Eye, EyeOff, 
  Save, Shuffle, RefreshCw, Image, MessageCircle, Phone, X, Check,
  Edit3, Undo2, Redo2, Code
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
import ErrorBoundary from '../components/ErrorBoundary';
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

const PRESET_PALETTES = [
  { name: 'Indigo Aura', color: '#6366f1' },
  { name: 'Royal Sapphire', color: '#2563eb' },
  { name: 'Emerald Forest', color: '#10b981' },
  { name: 'Amber Sunrise', color: '#f59e0b' },
  { name: 'Rose Blossom', color: '#ec4899' },
  { name: 'Electric Violet', color: '#8b5cf6' },
  { name: 'Cyber Mint', color: '#06b6d4' }
];

const DEFAULT_SECTIONS = [
  { id: 'hero', label: 'Hero Banner', icon: '🚀' },
  { id: 'about', label: 'About Story & Vision', icon: '📖' },
  { id: 'services', label: 'Services & Pricing', icon: '⚡' },
  { id: 'features', label: 'Key Features & USPs', icon: '🏆' },
  { id: 'blog', label: 'Blog & Articles', icon: '📰' },
  { id: 'testimonials', label: 'Verified Client Reviews', icon: '⭐' },
  { id: 'faq', label: 'Frequently Asked Questions', icon: '❓' },
  { id: 'cta', label: 'Lead Capture & Google Maps', icon: '📍' }
];

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

  // In-Browser Studio State (Phase 2 & 3)
  const [isStudioMode, setIsStudioMode] = useState(false);
  const [studioDrawerOpen, setStudioDrawerOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savingStudio, setSavingStudio] = useState(false);

  // Live Canvas History Stack (FEAT-012 Undo / Redo)
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Custom CSS Code Inspector State (FEAT-013)
  const [cssModalOpen, setCssModalOpen] = useState(false);
  const [customCssCode, setCustomCssCode] = useState('');

  // Live Editable Project Tree State
  const [liveTree, setLiveTree] = useState(null);
  const [sectionOrder, setSectionOrder] = useState(['hero', 'about', 'services', 'features', 'blog', 'testimonials', 'faq', 'cta']);
  const [hiddenSections, setHiddenSections] = useState({});

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
      const data = webResp.data;
      setWebsite(data);
      setHistories(histResp.data);

      const tree = data.page_tree || {};
      setLiveTree(tree);
      if (tree.section_order && Array.isArray(tree.section_order)) {
        setSectionOrder(tree.section_order);
      }
      if (tree.hidden_sections) {
        setHiddenSections(tree.hidden_sections);
      }
      if (tree.custom_css) {
        setCustomCssCode(tree.custom_css);
      }
    } catch (err) {
      console.error('Error fetching website preview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsiteDetails();
  }, [id]);

  // Record Snapshot into Undo Stack (FEAT-012)
  const recordHistory = useCallback((currentTree) => {
    if (!currentTree) return;
    setUndoStack((prev) => [...prev.slice(-30), JSON.parse(JSON.stringify(currentTree))]);
    setRedoStack([]);
  }, []);

  // Undo Handler (FEAT-012)
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0 || !liveTree) return;
    const prevSnapshot = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);
    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(liveTree))]);
    setUndoStack(newUndo);
    setLiveTree(prevSnapshot);
    if (prevSnapshot.section_order) setSectionOrder(prevSnapshot.section_order);
    if (prevSnapshot.hidden_sections) setHiddenSections(prevSnapshot.hidden_sections);
    if (prevSnapshot.custom_css !== undefined) setCustomCssCode(prevSnapshot.custom_css || '');
    setHasUnsavedChanges(true);
  }, [undoStack, liveTree]);

  // Redo Handler (FEAT-012)
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || !liveTree) return;
    const nextSnapshot = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(liveTree))]);
    setRedoStack(newRedo);
    setLiveTree(nextSnapshot);
    if (nextSnapshot.section_order) setSectionOrder(nextSnapshot.section_order);
    if (nextSnapshot.hidden_sections) setHiddenSections(nextSnapshot.hidden_sections);
    if (nextSnapshot.custom_css !== undefined) setCustomCssCode(nextSnapshot.custom_css || '');
    setHasUnsavedChanges(true);
  }, [redoStack, liveTree]);

  // Keyboard Shortcuts for Undo (Ctrl+Z) & Redo (Ctrl+Y / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleApplyEdit = async (instruction) => {
    setUpdating(true);
    try {
      const resp = await api.post(`/generator/edit/${id}`, { prompt_instruction: instruction });
      setWebsite(resp.data);
      setLiveTree(resp.data.page_tree);
      const histResp = await api.get(`/generator/history/${id}`);
      setHistories(histResp.data);
      setHasUnsavedChanges(false);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    } catch (err) {
      alert('Error updating website layout: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUpdating(false);
    }
  };

  // Studio: Save Direct Tree Updates to Backend
  const handleSaveStudioEdits = async () => {
    if (!liveTree) return;
    setSavingStudio(true);
    try {
      const updatedTree = {
        ...liveTree,
        section_order: sectionOrder,
        hidden_sections: hiddenSections,
        custom_css: customCssCode
      };
      const resp = await api.put(`/generator/tree/${id}`, {
        page_tree: updatedTree,
        instruction: "Visual Studio In-Browser Customization"
      });
      setWebsite(resp.data);
      setLiveTree(resp.data.page_tree);
      setHasUnsavedChanges(false);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    } catch (err) {
      alert('Failed to save studio customizations: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSavingStudio(false);
    }
  };

  // Studio: Live Color Wheel Picker Change
  const handlePrimaryColorChange = (hex) => {
    if (!liveTree) return;
    recordHistory(liveTree);
    const currentColors = liveTree.colors || getThemeColors(website.theme, liveTree.theme_mode || 'dark');
    const newColors = { ...currentColors, primary: hex };
    setLiveTree({ ...liveTree, colors: newColors });
    setHasUnsavedChanges(true);
  };

  // Studio: Toggle Dark / Light Theme
  const handleToggleThemeMode = () => {
    if (!liveTree) return;
    recordHistory(liveTree);
    const curMode = liveTree.theme_mode === 'light' ? 'dark' : 'light';
    const newColors = getThemeColors(website.theme, curMode);
    setLiveTree({ ...liveTree, theme_mode: curMode, colors: newColors });
    setHasUnsavedChanges(true);
  };

  // Studio: Move Section Up / Down
  const handleMoveSection = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= sectionOrder.length) return;
    recordHistory(liveTree);
    const newOrder = [...sectionOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIdx, 0, moved);
    setSectionOrder(newOrder);
    setLiveTree({ ...liveTree, section_order: newOrder });
    setHasUnsavedChanges(true);
  };

  // Studio: Toggle Section Visibility (Hide/Show)
  const handleToggleSectionVisibility = (secId) => {
    recordHistory(liveTree);
    const newHidden = { ...hiddenSections, [secId]: !hiddenSections[secId] };
    setHiddenSections(newHidden);
    setLiveTree({ ...liveTree, hidden_sections: newHidden });
    setHasUnsavedChanges(true);
  };

  // Studio: Update Hero Image
  const handleApplyHeroImage = () => {
    if (!customImageUrl.trim() || !liveTree) return;
    recordHistory(liveTree);
    const newHero = { ...(liveTree.hero || {}), hero_image: customImageUrl.trim() };
    setLiveTree({ ...liveTree, hero: newHero });
    setHasUnsavedChanges(true);
    setImageModalOpen(false);
    setCustomImageUrl('');
  };

  // Studio: Layout Variant Shuffling (Bento / Split Hero)
  const handleShuffleLayoutVariant = () => {
    if (!liveTree) return;
    recordHistory(liveTree);
    const curVariant = liveTree.layout_variant || 'split';
    const nextVariant = curVariant === 'split' ? 'bento' : 'split';
    setLiveTree({ ...liveTree, layout_variant: nextVariant });
    setHasUnsavedChanges(true);
  };

  // Transform custom CSS rules for live preview canvas (FEAT-013)
  const processCustomCssForPreview = (rawCss) => {
    if (!rawCss || typeof rawCss !== 'string') return '';
    // Map body and html rules to also target #preview-canvas-root
    let css = rawCss.replace(/\b(body|html)\b/g, '#preview-canvas-root');

    // Make sure declarations override any inline styles and Tailwind utilities:
    // Regex matches selector { declarations }
    return css.replace(/([^{}]+)\{([^{}]+)\}/g, (match, selector, decls) => {
      const sel = selector.trim();
      if (sel.startsWith('@keyframes') || sel.startsWith('from') || sel.startsWith('to') || /^\d+%/.test(sel)) {
        return match;
      }

      const transformedDecls = decls
        .split(';')
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return '';
          if (trimmed.includes('!important')) return trimmed;
          const colonIdx = trimmed.indexOf(':');
          if (colonIdx === -1) return trimmed;
          return `${trimmed} !important`;
        })
        .filter(Boolean)
        .join('; ');

      const scopedSelectors = sel
        .split(',')
        .map((s) => {
          const item = s.trim();
          if (!item) return '';
          if (item.includes('#preview-canvas-root')) return item;
          return `#preview-canvas-root ${item}, ${item}`;
        })
        .filter(Boolean)
        .join(', ');

      return `${scopedSelectors} {\n  ${transformedDecls};\n}`;
    });
  };

  // Studio: Generic Section Update Handler for Full In-Browser Inline Visual Studio
  const handleUpdateSection = (sectionKey, partial) => {
    if (!liveTree) return;
    recordHistory(liveTree);
    const currentSec = liveTree[sectionKey] || {};
    const updatedTree = {
      ...liveTree,
      [sectionKey]: {
        ...currentSec,
        ...partial
      }
    };
    // Also sync subpage if currently on active subpage in multi-page architecture
    if (websiteType === 'multi' && activePage !== 'Home' && liveTree.pages && liveTree.pages[activePage]) {
      const currentPageObj = liveTree.pages[activePage] || {};
      updatedTree.pages = {
        ...liveTree.pages,
        [activePage]: {
          ...currentPageObj,
          [sectionKey]: {
            ...(currentPageObj[sectionKey] || {}),
            ...partial
          }
        }
      };
    }
    setLiveTree(updatedTree);
    setHasUnsavedChanges(true);
  };

  // Studio: Apply Custom CSS Code Injection (FEAT-013)
  const handleApplyCustomCss = (explicitCss = null) => {
    if (!liveTree) return;
    recordHistory(liveTree);
    const cssToApply = explicitCss !== null ? explicitCss : customCssCode;
    setLiveTree({ ...liveTree, custom_css: cssToApply });
    setCustomCssCode(cssToApply);
    setHasUnsavedChanges(true);
    setCssModalOpen(false);
  };

  const handleExportZip = async () => {
    setDownloadingZip(true);
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
      const cleanTitle = (website?.title || 'website').toLowerCase().replace(/\s+/g, '_');
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

  const pageTree = liveTree || website.page_tree || {};
  const colors = pageTree.colors || getThemeColors(website.theme, pageTree.theme_mode || 'dark');
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

  // Section Renderer according to active Studio order and visibility
  const renderSingleSection = (secKey) => {
    if (hiddenSections[secKey]) return null;
    switch (secKey) {
      case 'hero':
        return (
          <HeroSection
            key="hero"
            data={pageTree.hero}
            colors={colors}
            viewport={viewport}
            isEditMode={isStudioMode}
            onUpdate={(partial) => {
              setLiveTree({ ...liveTree, hero: { ...liveTree.hero, ...partial } });
              setHasUnsavedChanges(true);
            }}
          />
        );
      case 'about':
        return (
          <AboutSection 
            key="about" 
            data={pageTree.about} 
            colors={colors} 
            viewport={viewport} 
            isEditMode={isStudioMode}
            onUpdate={(partial) => handleUpdateSection('about', partial)}
          />
        );
      case 'services':
        return (
          <ServicesSection 
            key="services" 
            data={pageTree.services} 
            colors={colors} 
            viewport={viewport} 
            isEditMode={isStudioMode}
            onUpdate={(partial) => handleUpdateSection('services', partial)}
          />
        );
      case 'features':
        return (
          <FeaturesSection 
            key="features" 
            data={pageTree.features} 
            colors={colors} 
            viewport={viewport} 
            isEditMode={isStudioMode}
            onUpdate={(partial) => handleUpdateSection('features', partial)}
          />
        );
      case 'blog':
        return (
          <div key="blog" className="py-16 px-6 max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Knowledge & Guides
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-3" style={{ color: colors.text }}>
                Latest Industry Articles & Insights
              </h2>
              <p className="mt-2 text-sm max-w-xl mx-auto" style={{ color: colors.muted }}>
                Expert advice and educational guides authored by {website.title}.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(pageTree.blog_articles || []).map((art, idx) => (
                <div key={idx} className="p-6 rounded-2xl border transition hover:shadow-xl flex flex-col justify-between" style={{ backgroundColor: colors.surface, borderColor: colors.card_border }}>
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-3" style={{ color: colors.muted }}>
                      <span className="px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}>
                        {art.read_time || '4 min read'}
                      </span>
                      <span>{art.date || 'Recent'}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 leading-snug" style={{ color: colors.text }}>{art.title}</h3>
                    <p className="text-xs line-clamp-3 leading-relaxed mb-4" style={{ color: colors.muted }}>{art.summary}</p>
                  </div>
                  <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <span className="text-xs font-bold" style={{ color: colors.primary }}>By {art.author || website.title}</span>
                    <button
                      onClick={() => alert(`${art.title}\n\n${art.content}`)}
                      className="px-3 py-1 rounded-lg text-xs font-bold text-white shadow-sm"
                      style={{ backgroundColor: colors.primary }}
                    >
                      Read Post
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'testimonials':
        return (
          <TestimonialsSection 
            key="testimonials" 
            data={pageTree.testimonials} 
            colors={colors} 
            viewport={viewport} 
            isEditMode={isStudioMode}
            onUpdate={(partial) => handleUpdateSection('testimonials', partial)}
          />
        );
      case 'faq':
        return (
          <FAQSection 
            key="faq" 
            data={pageTree.faq} 
            colors={colors} 
            viewport={viewport} 
            isEditMode={isStudioMode}
            onUpdate={(partial) => handleUpdateSection('faq', partial)}
          />
        );
      case 'cta':
        return (
          <CTASection
            key="cta"
            data={pageTree.cta}
            colors={colors}
            viewport={viewport}
            isEditMode={isStudioMode}
            onUpdate={(partial) => handleUpdateSection('cta', partial)}
            contactEmail={website.contact_email || pageTree.footer?.contact_email}
            contactPhone={website.contact_phone || pageTree.contact?.contact_phone || pageTree.footer?.contact_phone}
            address={pageTree.contact?.address || pageTree.footer?.address}
            brandName={website.title}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      {/* Top Floating Control Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{website.title}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {website.category}
              </span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
              {website.subdomain}.buildmywebsiteai.site
            </span>
          </div>
        </div>

        {/* Viewport Switcher Controls */}
        <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
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

        {/* Action Controls & Studio Mode Switch */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Studio Mode Toggle */}
          <button
            onClick={() => setIsStudioMode(!isStudioMode)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              isStudioMode
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-lg shadow-amber-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>{isStudioMode ? 'Studio Active' : 'Studio Mode'}</span>
          </button>

          {/* Save Unsaved Changes Button */}
          {hasUnsavedChanges && (
            <button
              onClick={handleSaveStudioEdits}
              disabled={savingStudio}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 transition animate-pulse"
            >
              {savingStudio ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Edits</span>
            </button>
          )}

          <button
            onClick={handleExportZip}
            disabled={downloadingZip}
            className="px-3 sm:px-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {downloadingZip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-indigo-400" />}
            <span className="hidden sm:inline">{downloadingZip ? 'Exporting...' : 'Export ZIP'}</span>
          </button>

          <button
            onClick={handleDeployCoDomain}
            className="px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Publish</span>
          </button>
        </div>
      </header>

      {/* Interactive In-Browser Studio Toolbar (Phase 2 & 3) */}
      <AnimatePresence>
        {isStudioMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900/90 backdrop-blur-xl border-b border-indigo-500/30 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs"
          >
            {/* Color Palette & Hex Wheel Picker */}
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-400 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-indigo-400" /> Brand Color:
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={colors.primary || '#6366f1'}
                  onChange={(e) => handlePrimaryColorChange(e.target.value)}
                  className="w-7 h-7 rounded-lg border border-slate-700 cursor-pointer overflow-hidden p-0 bg-transparent"
                  title="Pick Live Hex Color"
                />
                <div className="hidden sm:flex items-center gap-1">
                  {PRESET_PALETTES.map((pal) => (
                    <button
                      key={pal.color}
                      onClick={() => handlePrimaryColorChange(pal.color)}
                      style={{ backgroundColor: pal.color }}
                      className={`w-5 h-5 rounded-full border transition transform hover:scale-110 ${
                        colors.primary === pal.color ? 'border-white scale-110 ring-2 ring-indigo-400' : 'border-transparent'
                      }`}
                      title={pal.name}
                    />
                  ))}
                </div>
              </div>

              {/* Theme Mode Toggle (Dark / Light) */}
              <button
                onClick={handleToggleThemeMode}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 font-semibold"
                title="Toggle Dark / Light Theme"
              >
                {colors.mode === 'light' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                <span className="capitalize">{colors.mode}</span>
              </button>
            </div>

            {/* Undo / Redo Stack Controls (FEAT-012) */}
            <div className="flex items-center gap-1 border-r border-slate-700/80 pr-2">
              <button
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 flex items-center gap-1 font-semibold transition"
                title="Undo Canvas Change (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden md:inline text-[11px]">Undo</span>
              </button>
              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 flex items-center gap-1 font-semibold transition"
                title="Redo Canvas Change (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden md:inline text-[11px]">Redo</span>
              </button>
            </div>

            {/* Layout Controls & Section Manager */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStudioDrawerOpen(true)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition"
              >
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Manage Sections ({sectionOrder.length})</span>
              </button>

              <button
                onClick={() => setImageModalOpen(true)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition"
              >
                <Image className="w-3.5 h-3.5 text-emerald-400" />
                <span>Replace Hero Image</span>
              </button>

              <button
                onClick={handleShuffleLayoutVariant}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition"
                title="Toggle Bento Grid vs Split Hero Layout"
              >
                <Shuffle className="w-3.5 h-3.5 text-purple-400" />
                <span>Layout: {pageTree.layout_variant === 'bento' ? 'Bento' : 'Split'}</span>
              </button>

              <button
                onClick={() => {
                  setCustomCssCode(liveTree?.custom_css || '');
                  setCssModalOpen(true);
                }}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition"
                title="Custom CSS Injection & Code Inspector (FEAT-013)"
              >
                <Code className="w-3.5 h-3.5 text-pink-400" />
                <span>Custom CSS</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          id="preview-canvas-root"
          className={`${viewportStyles[viewport]} transition-all duration-300 shadow-2xl relative scroll-smooth overflow-hidden preview-canvas-root`}
          style={{ 
            backgroundColor: colors.bg, 
            color: colors.text,
            '--primary-color': colors.primary || '#6366f1',
            '--secondary-color': colors.secondary || '#ec4899',
            '--accent-color': colors.accent || colors.primary || '#6366f1',
            '--bg-color': colors.bg || '#0b0f19',
            '--text-color': colors.text || '#f8fafc',
            '--muted-color': colors.mode === 'light' ? '#475569' : '#94a3b8',
            '--card-bg': colors.card_bg || colors.surface || 'rgba(18, 24, 36, 0.6)',
            '--card-border': colors.card_border || 'rgba(255, 255, 255, 0.08)',
            '--badge-bg': colors.mode === 'light' ? '#eff6ff' : 'rgba(255, 255, 255, 0.04)',
            '--badge-border': colors.mode === 'light' ? '#bfdbfe' : 'rgba(255, 255, 255, 0.1)',
            '--badge-text': colors.primary || '#6366f1'
          }}
        >
          {/* Injected Custom Studio CSS (FEAT-013) with live preview */}
          {Boolean(cssModalOpen ? customCssCode : (liveTree?.custom_css || customCssCode)) && (
            <style
              id="studio-custom-css"
              dangerouslySetInnerHTML={{
                __html: processCustomCssForPreview(cssModalOpen ? customCssCode : (liveTree?.custom_css || customCssCode))
              }}
            />
          )}

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
            <ErrorBoundary>
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
                {sectionOrder.map((secKey) => renderSingleSection(secKey))}
              </>
            ) : (
              <>
                <HeroSection 
                  data={activePageData.hero || pageTree.hero} 
                  colors={colors} 
                  viewport={viewport}
                  isEditMode={isStudioMode}
                  onUpdate={(partial) => {
                    setLiveTree({ ...liveTree, hero: { ...liveTree.hero, ...partial } });
                    setHasUnsavedChanges(true);
                  }}
                />
                {activePage === 'Home' && (
                  <>
                    <ServicesSection 
                      data={pageTree.services} 
                      colors={colors} 
                      viewport={viewport} 
                      isEditMode={isStudioMode}
                      onUpdate={(partial) => handleUpdateSection('services', partial)}
                    />
                    <FeaturesSection 
                      data={pageTree.features} 
                      colors={colors} 
                      viewport={viewport} 
                      isEditMode={isStudioMode}
                      onUpdate={(partial) => handleUpdateSection('features', partial)}
                    />
                    <TestimonialsSection 
                      data={pageTree.testimonials} 
                      colors={colors} 
                      viewport={viewport} 
                      isEditMode={isStudioMode}
                      onUpdate={(partial) => handleUpdateSection('testimonials', partial)}
                    />
                    <FAQSection 
                      data={pageTree.faq} 
                      colors={colors} 
                      viewport={viewport} 
                      isEditMode={isStudioMode}
                      onUpdate={(partial) => handleUpdateSection('faq', partial)}
                    />
                    <CTASection
                      data={pageTree.cta}
                      colors={colors}
                      viewport={viewport}
                      isEditMode={isStudioMode}
                      onUpdate={(partial) => handleUpdateSection('cta', partial)}
                      contactEmail={website.contact_email || pageTree.footer?.contact_email}
                      contactPhone={website.contact_phone || pageTree.contact?.contact_phone || pageTree.footer?.contact_phone}
                      address={pageTree.contact?.address || pageTree.footer?.address}
                      brandName={website.title}
                    />
                  </>
                )}
                {activePage === 'About Us' && (
                  <>
                    <AboutSection 
                      data={activePageData.about || pageTree.about} 
                      colors={colors} 
                      viewport={viewport} 
                      isEditMode={isStudioMode}
                      onUpdate={(partial) => handleUpdateSection('about', partial)}
                    />
                    <FeaturesSection 
                      data={activePageData.features || pageTree.features} 
                      colors={colors} 
                      viewport={viewport} 
                      isEditMode={isStudioMode}
                      onUpdate={(partial) => handleUpdateSection('features', partial)}
                    />
                    <TestimonialsSection 
                      data={activePageData.testimonials || pageTree.testimonials} 
                      colors={colors} 
                      viewport={viewport} 
                      isEditMode={isStudioMode}
                      onUpdate={(partial) => handleUpdateSection('testimonials', partial)}
                    />
                  </>
                )}
                {activePage === 'Services' && (
                  <>
                    <ServicesSection 
                      data={activePageData.services || pageTree.services} 
                      colors={colors} 
                      viewport={viewport} 
                      isEditMode={isStudioMode}
                      onUpdate={(partial) => handleUpdateSection('services', partial)}
                    />
                    <FAQSection 
                      data={activePageData.faq || pageTree.faq} 
                      colors={colors} 
                      viewport={viewport} 
                      isEditMode={isStudioMode}
                      onUpdate={(partial) => handleUpdateSection('faq', partial)}
                    />
                    <CTASection
                      data={activePageData.cta || pageTree.cta}
                      colors={colors}
                      viewport={viewport}
                      isEditMode={isStudioMode}
                      onUpdate={(partial) => handleUpdateSection('cta', partial)}
                      contactEmail={website.contact_email || pageTree.footer?.contact_email}
                      contactPhone={website.contact_phone || pageTree.contact?.contact_phone || pageTree.footer?.contact_phone}
                      address={pageTree.contact?.address || pageTree.footer?.address}
                      brandName={website.title}
                    />
                  </>
                )}
                {activePage === 'Pricing' && (
                  <>
                    <ServicesSection 
                      data={activePageData.services || pageTree.services} 
                      colors={colors} 
                      viewport={viewport} 
                      isEditMode={isStudioMode}
                      onUpdate={(partial) => handleUpdateSection('services', partial)}
                    />
                    <CTASection
                      data={activePageData.cta || pageTree.cta}
                      colors={colors}
                      viewport={viewport}
                      isEditMode={isStudioMode}
                      onUpdate={(partial) => handleUpdateSection('cta', partial)}
                      contactEmail={website.contact_email || pageTree.footer?.contact_email}
                      contactPhone={website.contact_phone || pageTree.contact?.contact_phone || pageTree.footer?.contact_phone}
                      address={pageTree.contact?.address || pageTree.footer?.address}
                      brandName={website.title}
                    />
                  </>
                )}
                {activePage === 'FAQ' && (
                  <>
                    <FAQSection data={activePageData.faq || pageTree.faq} colors={colors} viewport={viewport} />
                    <CTASection
                      data={activePageData.cta || pageTree.cta}
                      colors={colors}
                      viewport={viewport}
                      contactEmail={website.contact_email || pageTree.footer?.contact_email}
                      contactPhone={website.contact_phone || pageTree.contact?.contact_phone || pageTree.footer?.contact_phone}
                      address={pageTree.contact?.address || pageTree.footer?.address}
                      brandName={website.title}
                    />
                  </>
                )}
                {activePage === 'Contact Us' && (
                  <>
                    <CTASection
                      data={activePageData.contact || activePageData.cta || pageTree.cta}
                      colors={colors}
                      viewport={viewport}
                      contactEmail={website.contact_email || pageTree.footer?.contact_email}
                      contactPhone={website.contact_phone || pageTree.contact?.contact_phone || pageTree.footer?.contact_phone}
                      address={pageTree.contact?.address || pageTree.footer?.address}
                      brandName={website.title}
                    />
                    <FAQSection data={pageTree.faq} colors={colors} viewport={viewport} />
                  </>
                )}
                {(activePage === 'Blog' || activePage === 'Blog & Articles' || activePage === 'Articles') && (
                  <div className="py-16 px-6 max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        Knowledge & Articles
                      </span>
                      <h2 className="text-3xl sm:text-4xl font-extrabold mt-3" style={{ color: colors.text }}>
                        Latest Industry Articles & Insights
                      </h2>
                      <p className="mt-2 text-sm max-w-xl mx-auto" style={{ color: colors.muted }}>
                        Curated educational guides authored by {website.title}.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {(activePageData.blog_articles || pageTree.blog_articles || []).map((art, idx) => (
                        <div key={idx} className="p-6 rounded-2xl border transition hover:shadow-xl flex flex-col justify-between" style={{ backgroundColor: colors.surface, borderColor: colors.card_border }}>
                          <div>
                            <div className="flex items-center justify-between text-xs font-semibold mb-3" style={{ color: colors.muted }}>
                              <span className="px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}>
                                {art.read_time || '4 min read'}
                              </span>
                              <span>{art.date || 'Recent'}</span>
                            </div>
                            <h3 className="text-lg font-bold mb-2 leading-snug" style={{ color: colors.text }}>{art.title}</h3>
                            <p className="text-xs line-clamp-3 leading-relaxed mb-4" style={{ color: colors.muted }}>{art.summary}</p>
                          </div>
                          <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                            <span className="text-xs font-bold" style={{ color: colors.primary }}>By {art.author || website.title}</span>
                            <button
                              onClick={() => alert(`${art.title}\n\n${art.content}`)}
                              className="px-3 py-1 rounded-lg text-xs font-bold text-white shadow-sm"
                              style={{ backgroundColor: colors.primary }}
                            >
                              Read Post
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            <FooterSection data={pageTree.footer} colors={colors} viewport={viewport} />
          </ErrorBoundary>
        </div>

          {/* Floating Mobile Sticky Action Bar in Mobile Viewport Mode (IND-009) */}
          {viewport === 'mobile' && (
            <div className="sticky bottom-0 z-30 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-2 flex gap-2">
              {website.contact_phone ? (
                <>
                  <a
                    href={`tel:${website.contact_phone}`}
                    className="flex-1 py-2 px-1 rounded-xl text-center text-xs font-bold text-white flex items-center justify-center gap-1 shadow-md"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>
                  <a
                    href={`https://wa.me/${website.contact_phone.replace(/\D/g, '').length === 10 ? `91${website.contact_phone.replace(/\D/g, '')}` : website.contact_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${website.title}! I am inquiring from your website.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-1 rounded-xl text-center text-xs font-bold text-white bg-[#25D366] flex items-center justify-center gap-1 shadow-md"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    <span>WhatsApp</span>
                  </a>
                </>
              ) : null}
              <a
                href="#contact"
                className="flex-1 py-2 px-1 rounded-xl text-center text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 flex items-center justify-center gap-1 shadow-md"
              >
                <span>⚡ UPI / Book</span>
              </a>
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom AI Edit Prompt Bar */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4">
        <AIEditBar onApplyEdit={handleApplyEdit} isUpdating={updating} />
      </div>

      {/* Studio Section Reorder & Visibility Drawer (Phase 2) */}
      <AnimatePresence>
        {studioDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 glass-panel rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-bold text-white">Manage & Reorder Sections</h3>
                </div>
                <button
                  onClick={() => setStudioDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-4">
                Use the arrow controls to move sections up or down. Toggle the eye icon to hide or display sections.
              </p>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {sectionOrder.map((secId, idx) => {
                  const secMeta = DEFAULT_SECTIONS.find((s) => s.id === secId) || { label: secId, icon: '📄' };
                  const isHidden = hiddenSections[secId];
                  return (
                    <div
                      key={secId}
                      className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                        isHidden ? 'bg-slate-950/60 border-slate-800/60 opacity-50' : 'bg-slate-800/80 border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{secMeta.icon}</span>
                        <span className="text-xs font-bold text-white">{secMeta.label}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveSection(idx, -1)}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white transition"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveSection(idx, 1)}
                          disabled={idx === sectionOrder.length - 1}
                          className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white transition"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleSectionVisibility(secId)}
                          className={`p-1.5 rounded-lg transition ${
                            isHidden ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                          title={isHidden ? 'Show Section' : 'Hide Section'}
                        >
                          {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setStudioDrawerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Hero Image Modal */}
      <AnimatePresence>
        {imageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 glass-panel rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Replace Hero Banner Image</h3>
                </div>
                <button
                  onClick={() => setImageModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-3">
                Paste any high-resolution image URL (Unsplash, Cloudinary, etc.) to immediately swap out the hero photography.
              </p>

              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 mb-4"
              />

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setImageModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyHeroImage}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20"
                >
                  Apply Photo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

      {/* Custom CSS Code Inspector Modal (FEAT-013) */}
      <AnimatePresence>
        {cssModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl p-6 glass-panel rounded-3xl border border-pink-500/40 bg-slate-900 shadow-2xl text-left flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Custom CSS Code Inspector</h3>
                    <p className="text-[11px] text-slate-400">Live inject custom styles directly into your website</p>
                  </div>
                </div>
                <button
                  onClick={() => setCssModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-3">
                <p className="text-xs text-slate-400 mb-2">
                  Target existing elements or inject custom design rules. Click any class token to insert into editor:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['.hero-title', '.hero-subtitle', '.btn-primary', '.btn-secondary', '.btn-whatsapp', '.card', '.badge', '.nav-wrap', '.section-title', '.section-subtitle', '.form-input'].map((sel) => (
                    <button
                      key={sel}
                      type="button"
                      onClick={() => setCustomCssCode((prev) => `${prev ? prev + '\n' : ''}${sel} {\n  \n}`)}
                      className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-mono text-pink-300 transition"
                    >
                      {sel}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex flex-col mb-4 overflow-hidden">
                <label className="text-[11px] font-bold text-slate-400 mb-1 flex items-center justify-between">
                  <span>CSS Editor</span>
                  <span className="font-mono text-[10px] text-slate-500">Auto-injected into &lt;style&gt; with Live Real-Time Preview</span>
                </label>
                <textarea
                  value={customCssCode}
                  onChange={(e) => setCustomCssCode(e.target.value)}
                  placeholder={`/* Example custom override: */\n.hero-title {\n  letter-spacing: -0.04em;\n  color: #f59e0b;\n}\n.btn-primary {\n  border-radius: 9999px;\n  box-shadow: 0 10px 25px -5px rgba(99,102,241,0.5);\n}`}
                  rows={10}
                  className="w-full flex-1 p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-pink-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-pink-500 resize-none overflow-y-auto"
                  spellCheck={false}
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleApplyCustomCss('')}
                  className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold"
                >
                  Clear CSS
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomCssCode(liveTree?.custom_css || '');
                      setCssModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyCustomCss}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-pink-500/20"
                  >
                    Apply & Inject CSS
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Preview;
