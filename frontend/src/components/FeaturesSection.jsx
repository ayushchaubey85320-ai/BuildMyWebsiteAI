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

  const isLight = colors?.mode === 'light';
  const textColor = isLight ? '#0f172a' : '#ffffff';
  const subtextColor = isLight ? '#475569' : '#94a3b8';
  const cardBg = isLight ? '#ffffff' : (colors.card_bg || '#1e293b');
  const cardBorder = isLight ? '#e2e8f0' : (colors.card_border || 'rgba(255,255,255,0.1)');

  return (
    <section id="features" className="px-4 sm:px-8 py-16 max-w-6xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12">
        {badge && (
          <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block border" style={{ backgroundColor: isLight ? '#eff6ff' : 'rgba(255,255,255,0.05)', color: colors.primary, borderColor: isLight ? '#bfdbfe' : 'rgba(255,255,255,0.1)' }}>
            {badge}
          </span>
        )}
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4" style={{ color: textColor }}>
          {title}
        </h2>
        <p className="text-sm sm:text-base font-medium" style={{ color: subtextColor }}>
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => {
          const IconComp = ICON_MAP[item.icon] || Sparkles;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl border transition hover:shadow-xl"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center border" style={{ backgroundColor: isLight ? '#eff6ff' : 'rgba(255,255,255,0.05)', borderColor: isLight ? '#bfdbfe' : 'rgba(255,255,255,0.1)', color: colors.primary }}>
                <IconComp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: textColor }}>
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: subtextColor }}>
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
