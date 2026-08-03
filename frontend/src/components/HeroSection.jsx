import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const HeroSection = ({ data, colors, viewport = 'desktop' }) => {
  const badge = data?.badge || "Welcome";
  const headline = data?.headline || "Headline Here";
  const subheadline = data?.subheadline || "Subheadline Here";
  const primaryCta = data?.primary_cta || "Get Started";
  const secondaryCta = data?.secondary_cta || "Learn More";
  const heroImage = data?.hero_image;

  const isLight = colors?.mode === 'light';
  const textColor = isLight ? '#0f172a' : '#ffffff';
  const subtextColor = isLight ? '#475569' : '#94a3b8';

  return (
    <section className="relative px-4 sm:px-8 py-16 sm:py-24 text-center max-w-6xl mx-auto flex flex-col items-center">
      {badge && (
        <div 
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border shadow-sm"
          style={{ 
            backgroundColor: isLight ? '#eff6ff' : 'rgba(255,255,255,0.05)', 
            color: colors.primary, 
            borderColor: isLight ? '#bfdbfe' : 'rgba(255,255,255,0.1)' 
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{badge}</span>
        </div>
      )}

      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl leading-[1.15] mb-6" style={{ color: textColor }}>
        {headline}
      </h1>

      <p className="text-base sm:text-lg max-w-2xl leading-relaxed mb-8 font-medium" style={{ color: subtextColor }}>
        {subheadline}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full max-w-md mb-12">
        <button 
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition transform hover:scale-105"
          style={{ backgroundColor: colors.primary, color: '#ffffff' }}
        >
          <span>{primaryCta}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {secondaryCta && (
          <button 
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm border transition"
            style={{ 
              backgroundColor: isLight ? '#ffffff' : 'transparent',
              color: textColor, 
              borderColor: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.2)' 
            }}
          >
            {secondaryCta}
          </button>
        )}
      </div>

      {heroImage && (
        <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border" style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }}>
          <img src={heroImage} alt="Hero" className="w-full h-auto object-cover max-h-[500px]" />
        </div>
      )}
    </section>
  );
};

export default HeroSection;
