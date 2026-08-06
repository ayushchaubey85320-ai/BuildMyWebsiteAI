import React from 'react';
import { 
  Zap, ShieldCheck, Sparkles, BarChart3, BookOpen, Award, Users, 
  Laptop, Dumbbell, Utensils, Clock, Home, Compass, Wine, Heart, Target 
} from 'lucide-react';

const ICON_MAP = {
  Zap, ShieldCheck, Sparkles, BarChart3, BookOpen, Award, Users, 
  Laptop, Dumbbell, Utensils, Clock, Home, Compass, Wine, Heart, Target
};

const FeaturesSection = ({ data, colors, viewport = 'desktop' }) => {
  const badge = data?.section_badge || "Capabilities";
  const title = data?.section_title || "Why Choose Us";
  const subtitle = data?.section_subtitle || "Engineered for maximum reliability and ease of use.";
  const items = data?.items || [];
  const isMobile = viewport === 'mobile';

  const isLight = colors?.mode === 'light';
  const textColor = isLight ? '#0f172a' : '#ffffff';
  const subtextColor = isLight ? '#475569' : '#94a3b8';
  const cardBg = isLight ? '#ffffff' : (colors.card_bg || '#1e293b');
  const cardBorder = isLight ? '#e2e8f0' : (colors.card_border || 'rgba(255,255,255,0.1)');

  return (
    <section id="features" className={`max-w-6xl mx-auto ${
      isMobile ? 'px-3 py-8' : 'px-4 sm:px-8 py-16'
    }`}>
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
        {badge && (
          <span className={`font-bold rounded-full uppercase tracking-wider mb-3 inline-block border ${
            isMobile ? 'text-[10px] px-2.5 py-1' : 'text-xs px-3 py-1'
          }`} style={{ backgroundColor: isLight ? '#eff6ff' : 'rgba(255,255,255,0.05)', color: colors.primary, borderColor: isLight ? '#bfdbfe' : 'rgba(255,255,255,0.1)' }}>
            {badge}
          </span>
        )}
        <h2 className={`font-black tracking-tight mb-3 ${
          isMobile ? 'text-xl' : 'text-2xl sm:text-4xl'
        }`} style={{ color: textColor }}>
          {title}
        </h2>
        <p className="text-xs sm:text-base font-medium" style={{ color: subtextColor }}>
          {subtitle}
        </p>
      </div>

      <div className={`grid gap-4 sm:gap-6 ${
        isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {items.map((item, idx) => {
          const IconComp = ICON_MAP[item.icon] || Sparkles;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition hover:shadow-xl ${
                isMobile ? 'p-4' : 'p-6'
              }`}
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center border" style={{ backgroundColor: isLight ? '#eff6ff' : 'rgba(255,255,255,0.05)', borderColor: isLight ? '#bfdbfe' : 'rgba(255,255,255,0.1)', color: colors.primary }}>
                <IconComp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color: textColor }}>
                {item.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: subtextColor }}>
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesSection;
