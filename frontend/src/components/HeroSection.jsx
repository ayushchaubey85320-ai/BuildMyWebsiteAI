import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
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

  return (
    <motion.section 
      id="home" 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`relative text-center max-w-6xl mx-auto flex flex-col items-center scroll-mt-20 overflow-hidden ${
        isMobile ? 'px-3 py-8' : 'px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24'
      }`}
    >
      {badge && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold border shadow-sm max-w-full truncate ${
            isMobile ? 'px-3 py-1 text-[11px] mb-3' : 'px-3.5 py-1.5 text-xs mb-5 sm:mb-6'
          }`}
          style={{ 
            backgroundColor: isLight ? '#eff6ff' : 'rgba(255,255,255,0.05)', 
            color: colors.primary, 
            borderColor: isLight ? '#bfdbfe' : 'rgba(255,255,255,0.1)' 
          }}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{badge}</span>
        </motion.div>
      )}

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className={`font-black tracking-tight max-w-4xl leading-[1.2] ${
          isMobile ? 'text-xl mb-3 px-1' : 'text-2xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6'
        }`}
        style={{ color: textColor }}
      >
        {headline}
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`max-w-2xl leading-relaxed font-medium ${
          isMobile ? 'text-xs mb-5 px-1' : 'text-sm sm:text-base md:text-lg mb-6 sm:mb-8 px-2'
        }`}
        style={{ color: subtextColor }}
      >
        {subheadline}
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className={`flex flex-col sm:flex-row items-center gap-2.5 sm:gap-4 justify-center w-full ${
          isMobile ? 'max-w-xs mb-6' : 'max-w-md mb-8 sm:mb-12'
        }`}
      >
        <button 
          className="w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition transform hover:scale-105"
          style={{ backgroundColor: colors.primary, color: '#ffffff' }}
        >
          <span>{primaryCta}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {secondaryCta && (
          <button 
            className="w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs sm:text-sm border transition"
            style={{ 
              backgroundColor: isLight ? '#ffffff' : 'transparent',
              color: textColor, 
              borderColor: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.2)' 
            }}
          >
            {secondaryCta}
          </button>
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="w-full max-w-4xl rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border" 
        style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }}
      >
        <img 
          src={imgSrc} 
          alt="Hero Banner" 
          onError={() => setImgSrc(FALLBACK_HERO_IMAGE)}
          className={`w-full h-auto object-cover ${
            isMobile ? 'max-h-[220px] min-h-[160px]' : 'max-h-[260px] sm:max-h-[500px] min-h-[180px]'
          }`}
        />
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;
