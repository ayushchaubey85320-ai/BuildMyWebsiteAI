import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Code2, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const FALLBACK_HERO_IMAGE = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80";

const HeroSection = ({ data, colors, viewport = 'desktop' }) => {
  const badge = data?.badge || "Welcome";
  const headline = data?.headline || "Headline Here";
  const subheadline = data?.subheadline || "Subheadline Here";
  const primaryCta = data?.primary_cta || "Get Started";
  const secondaryCta = data?.secondary_cta || "Learn More";
  const heroImageProp = data?.hero_image || FALLBACK_HERO_IMAGE;

  const [imgSrc, setImgSrc] = useState(heroImageProp);
  const isMobile = viewport === 'mobile';

  useEffect(() => {
    setImgSrc(heroImageProp || FALLBACK_HERO_IMAGE);
  }, [heroImageProp]);

  const isLight = colors?.mode === 'light';
  const textColor = isLight ? '#0f172a' : '#ffffff';
  const subtextColor = isLight ? '#475569' : '#94a3b8';
  const accentColor = colors.primary || '#6366f1';

  // Floating stats animation setup
  const floatTransition = {
    duration: 3,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut"
  };

  return (
    <section 
      id="home" 
      className={`relative w-full max-w-6xl mx-auto scroll-mt-20 overflow-hidden ${
        isMobile ? 'px-4 py-10' : 'px-6 lg:px-8 py-16 sm:py-24 lg:py-28'
      }`}
    >
      {/* Background Subtle Mesh Glow Backdrop for depth */}
      {!isMobile && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />
      )}

      <div className={`grid items-center ${
        isMobile ? 'grid-cols-1 text-center gap-8' : 'grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 text-left'
      }`}>
        
        {/* Left Column: Heading & CTAs */}
        <div className={isMobile ? 'w-full' : 'lg:col-span-7 space-y-6 sm:space-y-8'}>
          {badge && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`inline-flex items-center gap-2 rounded-full font-bold border shadow-sm max-w-full px-4 py-1.5 text-xs ${
                isMobile ? 'mb-2' : ''
              }`}
              style={{ 
                backgroundColor: isLight ? '#eff6ff' : 'rgba(255,255,255,0.03)', 
                color: accentColor, 
                borderColor: isLight ? '#bfdbfe' : 'rgba(255,255,255,0.08)' 
              }}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse" />
              <span className="truncate tracking-wide">{badge}</span>
            </motion.div>
          )}

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`font-black tracking-tight leading-[1.1] ${
              isMobile ? 'text-2xl mb-3' : 'text-3xl sm:text-5xl lg:text-6xl'
            }`}
            style={{ color: textColor }}
          >
            {headline}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`leading-relaxed font-medium ${
              isMobile ? 'text-xs mb-5' : 'text-sm sm:text-base lg:text-lg max-w-xl'
            }`}
            style={{ color: subtextColor }}
          >
            {subheadline}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={`flex flex-col sm:flex-row items-center gap-3 justify-start w-full ${
              isMobile ? 'max-w-xs mx-auto' : ''
            }`}
          >
            <button 
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-indigo-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0"
              style={{ backgroundColor: accentColor, color: '#ffffff' }}
            >
              <span>{primaryCta}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {secondaryCta && (
              <button 
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm border transition-colors duration-200 hover:bg-slate-500/5"
                style={{ 
                  backgroundColor: isLight ? '#ffffff' : 'transparent',
                  color: textColor, 
                  borderColor: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.15)' 
                }}
              >
                {secondaryCta}
              </button>
            )}
          </motion.div>
        </div>

        {/* Right Column: Interactive Mockup Showcase with floating stats pills */}
        <div className={`relative ${isMobile ? 'w-full max-w-sm mx-auto' : 'lg:col-span-5'}`}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="w-full rounded-2xl overflow-hidden shadow-2xl border relative bg-slate-900/50 backdrop-blur-sm group" 
            style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)' }}
          >
            <img 
              src={imgSrc} 
              alt="Hero Banner Showcase" 
              onError={() => setImgSrc(FALLBACK_HERO_IMAGE)}
              className={`w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
                isMobile ? 'max-h-[220px]' : 'max-h-[460px]'
              }`}
            />
          </motion.div>

          {/* Floating Card 1: Generation Stats */}
          {!isMobile && (
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ ...floatTransition, delay: 0.2 }}
              className="absolute -top-4 -left-6 px-4 py-3 rounded-2xl border shadow-xl flex items-center gap-3 backdrop-blur-md"
              style={{ 
                backgroundColor: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.85)',
                borderColor: isLight ? '#bfdbfe' : 'rgba(255,255,255,0.1)'
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-sm">
                <Cpu className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-500">AI Synthesized</p>
                <p className="text-xs font-black" style={{ color: textColor }}>Ready in 10s</p>
              </div>
            </motion.div>
          )}

          {/* Floating Card 2: Clean Export */}
          {!isMobile && (
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={floatTransition}
              className="absolute -bottom-4 -right-6 px-4 py-3 rounded-2xl border shadow-xl flex items-center gap-3 backdrop-blur-md"
              style={{ 
                backgroundColor: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.85)',
                borderColor: isLight ? '#bfdbfe' : 'rgba(255,255,255,0.1)'
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-sm">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-500">Output Code</p>
                <p className="text-xs font-black" style={{ color: textColor }}>W3C Standalone ZIP</p>
              </div>
            </motion.div>
          )}
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
