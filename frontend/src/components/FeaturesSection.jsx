import React from 'react';
import { motion } from 'framer-motion';
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
  const cardBg = isLight ? '#ffffff' : (colors.card_bg || 'rgba(18, 24, 36, 0.4)');
  const cardBorder = isLight ? '#e2e8f0' : (colors.card_border || 'rgba(255,255,255,0.06)');
  const accentColor = colors.primary || '#6366f1';

  return (
    <section id="features" className={`max-w-6xl mx-auto scroll-mt-20 ${
      isMobile ? 'px-4 py-10' : 'px-6 lg:px-8 py-20'
    }`}>
      
      {/* Refined Header - Asymmetric Split Layout */}
      <div className={`grid items-end gap-6 mb-12 sm:mb-16 ${
        isMobile ? 'grid-cols-1 text-center' : 'grid-cols-1 lg:grid-cols-12'
      }`}>
        <div className={isMobile ? 'w-full' : 'lg:col-span-6 space-y-3'}>
          {badge && (
            <span 
              className="font-extrabold uppercase tracking-widest text-[10px] sm:text-xs px-3 py-1 rounded-full border inline-block" 
              style={{ 
                backgroundColor: isLight ? '#eff6ff' : 'rgba(255,255,255,0.03)', 
                color: accentColor, 
                borderColor: isLight ? '#bfdbfe' : 'rgba(255,255,255,0.08)' 
              }}
            >
              {badge}
            </span>
          )}
          <h2 className={`font-black tracking-tight leading-tight ${
            isMobile ? 'text-2xl' : 'text-3xl sm:text-4xl lg:text-5xl'
          }`} style={{ color: textColor }}>
            {title}
          </h2>
        </div>
        
        <div className={isMobile ? 'w-full' : 'lg:col-span-6 lg:border-l lg:pl-8 lg:pb-1'} style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }}>
          <p className="text-xs sm:text-base font-medium leading-relaxed" style={{ color: subtextColor }}>
            {subtitle}
          </p>
        </div>
      </div>

      {/* Grid Cards with Hover Glow Lift Effects */}
      <div className={`grid gap-6 ${
        isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {items.map((item, idx) => {
          const IconComp = ICON_MAP[item.icon] || Sparkles;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`rounded-2xl border p-6 transition-all duration-300 relative overflow-hidden group hover:-translate-y-2 hover:shadow-2xl ${
                isLight ? 'hover:shadow-slate-200/50' : 'hover:shadow-indigo-500/5'
              }`}
              style={{ 
                backgroundColor: cardBg, 
                borderColor: cardBorder
              }}
            >
              {/* Subtle accent line on top hover */}
              <div 
                className="absolute top-0 left-0 w-full h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                style={{ backgroundColor: accentColor }}
              />

              {/* Glowing Icon Wrapper */}
              <div 
                className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center border transition-colors duration-300 group-hover:bg-opacity-20" 
                style={{ 
                  backgroundColor: isLight ? '#eff6ff' : 'rgba(255,255,255,0.03)', 
                  borderColor: isLight ? '#bfdbfe' : 'rgba(255,255,255,0.08)', 
                  color: accentColor 
                }}
              >
                <IconComp className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </div>

              <h3 className="text-base sm:text-lg font-bold mb-2 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200" style={{ color: textColor }}>
                {item.title}
              </h3>
              
              <p className="text-xs leading-relaxed font-medium" style={{ color: subtextColor }}>
                {item.description}
              </p>
            </motion.div>
          );
        })}
      </div>

    </section>
  );
};

export default FeaturesSection;
