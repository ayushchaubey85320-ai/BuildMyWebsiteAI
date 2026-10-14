import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ServicesSection({ data, colors, viewport, isEditMode = false, onUpdate }) {
  if (!data) return null;

  const items = data.items || [];
  const isMobile = viewport === 'mobile';

  const isLight = colors?.mode === 'light';
  const textColor = isLight ? '#0f172a' : '#ffffff';
  const subtextColor = isLight ? '#475569' : '#94a3b8';
  const cardBg = isLight ? '#ffffff' : (colors.card_bg || 'rgba(18, 24, 36, 0.4)');
  const cardBorder = isLight ? '#e2e8f0' : (colors.card_border || 'rgba(255,255,255,0.06)');
  const accentColor = colors.primary || '#6366f1';

  return (
    <motion.section 
      id="services" 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`section services-section relative z-10 scroll-mt-20 overflow-hidden ${
        isMobile ? 'py-10 px-4' : 'py-20 px-6 sm:px-8'
      }`}
      style={{ backgroundColor: colors.bg }}
    >
      <div className="container max-w-6xl mx-auto space-y-16 sm:space-y-24">
        
        {/* Section Header */}
        <div className="section-header text-center space-y-3 max-w-3xl mx-auto">
          {data.section_badge && (
            <span 
              contentEditable={isEditMode}
              suppressContentEditableWarning
              onBlur={(e) => onUpdate && onUpdate({ section_badge: e.currentTarget.textContent })}
              className={`badge font-extrabold uppercase tracking-widest text-[10px] sm:text-xs px-3 py-1 rounded-full border inline-block ${
                isEditMode ? 'outline-dashed outline-2 outline-indigo-400 cursor-text' : ''
              }`} 
              style={{ 
                backgroundColor: isLight ? '#eff6ff' : 'rgba(255,255,255,0.03)', 
                color: accentColor, 
                borderColor: isLight ? '#bfdbfe' : 'rgba(255,255,255,0.08)' 
              }}
            >
              {data.section_badge}
            </span>
          )}
          <h2 
            contentEditable={isEditMode}
            suppressContentEditableWarning
            onBlur={(e) => onUpdate && onUpdate({ section_title: e.currentTarget.textContent })}
            className={`section-title font-black tracking-tight leading-tight ${
              isMobile ? 'text-2xl' : 'text-3xl sm:text-4xl lg:text-5xl'
            } ${isEditMode ? 'outline-dashed outline-2 outline-indigo-400 p-1 rounded-lg cursor-text' : ''}`} 
          >
            {data.section_title || 'Our Comprehensive Services'}
          </h2>
          {data.section_subtitle && (
            <p 
              contentEditable={isEditMode}
              suppressContentEditableWarning
              onBlur={(e) => onUpdate && onUpdate({ section_subtitle: e.currentTarget.textContent })}
              className={`section-subtitle max-w-2xl mx-auto leading-relaxed font-medium ${
                isMobile ? 'text-xs' : 'text-sm sm:text-base lg:text-lg'
              } ${isEditMode ? 'outline-dashed outline-2 outline-indigo-400 p-1 rounded-lg cursor-text' : ''}`} 
              style={{ color: subtextColor }}
            >
              {data.section_subtitle}
            </p>
          )}
        </div>

        {/* Services Cards Grid */}
        <div className={`grid gap-6 ${
          isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`card rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex flex-col justify-between p-6 sm:p-8 group relative overflow-hidden`}
              style={{ 
                backgroundColor: cardBg, 
                borderColor: cardBorder
              }}
            >
              {/* Top Accent Gradient Line on Hover */}
              <div 
                className="absolute top-0 left-0 w-full h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                style={{ backgroundColor: accentColor }}
              />

              <div className="space-y-4">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center border transition-colors duration-300 group-hover:bg-opacity-20" 
                  style={{ 
                    backgroundColor: isLight ? '#eff6ff' : 'rgba(255,255,255,0.03)', 
                    borderColor: isLight ? '#bfdbfe' : 'rgba(255,255,255,0.08)', 
                    color: accentColor 
                  }}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                
                <h3 
                  contentEditable={isEditMode}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (onUpdate) {
                      const newItems = [...items];
                      newItems[idx] = { ...newItems[idx], title: e.currentTarget.textContent };
                      onUpdate({ items: newItems });
                    }
                  }}
                  className={`text-base sm:text-lg font-bold group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200 ${isEditMode ? 'outline-dashed outline-2 outline-indigo-400 p-0.5 rounded cursor-text' : ''}`} 
                  style={{ color: textColor }}
                >
                  {item.title}
                </h3>
                
                <p 
                  contentEditable={isEditMode}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (onUpdate) {
                      const newItems = [...items];
                      newItems[idx] = { ...newItems[idx], description: e.currentTarget.textContent };
                      onUpdate({ items: newItems });
                    }
                  }}
                  className={`text-xs leading-relaxed font-medium ${isEditMode ? 'outline-dashed outline-2 outline-indigo-400 p-1 rounded cursor-text' : ''}`} 
                  style={{ color: subtextColor }}
                >
                  {item.description}
                </p>
              </div>

              <div 
                className="pt-4 border-t mt-5 flex items-center justify-between" 
                style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)' }}
              >
                <span 
                  contentEditable={isEditMode}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (onUpdate) {
                      const newItems = [...items];
                      newItems[idx] = { ...newItems[idx], price: e.currentTarget.textContent };
                      onUpdate({ items: newItems });
                    }
                  }}
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${isEditMode ? 'outline-dashed outline-2 outline-indigo-400 cursor-text' : ''}`} 
                  style={{ backgroundColor: isLight ? '#eff6ff' : 'rgba(99,102,241,0.15)', color: accentColor }}
                >
                  {item.price || "Available"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const contactEl = document.getElementById('contact');
                    if (contactEl) contactEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition transform hover:scale-105"
                  style={{ backgroundColor: accentColor }}
                >
                  Book Service
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
