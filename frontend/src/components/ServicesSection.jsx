import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ServicesSection({ data, colors, viewport }) {
  if (!data) return null;

  const items = data.items || [];
  const isMobile = viewport === 'mobile';

  const isLight = colors?.mode === 'light';
  const textColor = isLight ? '#0f172a' : '#ffffff';
  const subtextColor = isLight ? '#475569' : '#94a3b8';
  const cardBg = isLight ? '#ffffff' : (colors.card_bg || 'rgba(18, 24, 36, 0.4)');
  const cardBorder = isLight ? '#e2e8f0' : (colors.card_border || 'rgba(255,255,255,0.06)');
  const accentColor = colors.primary || '#6366f1';

  const processSteps = [
    { step: "01", title: "Discovery & Analysis", desc: "We evaluate your core requirements, target audience, and strategic objectives to build a customized roadmap." },
    { step: "02", title: "Custom Architecture", desc: "Our team designs scalable, high-performance frameworks tailored specifically to your operational workflow." },
    { step: "03", title: "Implementation & Testing", desc: "Rigorous execution combined with quality assurance protocols ensuring seamless, zero-downtime deployment." },
    { step: "04", title: "Continuous Optimization", desc: "Ongoing monitoring, proactive updates, and dedicated technical support to guarantee long-term success." }
  ];

  return (
    <motion.section 
      id="services" 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`relative z-10 scroll-mt-20 overflow-hidden ${
        isMobile ? 'py-10 px-4' : 'py-20 px-6 sm:px-8'
      }`}
      style={{ backgroundColor: colors.bg }}
    >
      <div className="max-w-6xl mx-auto space-y-16 sm:space-y-24">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          {data.section_badge && (
            <span 
              className="font-extrabold uppercase tracking-widest text-[10px] sm:text-xs px-3 py-1 rounded-full border inline-block" 
              style={{ 
                backgroundColor: isLight ? '#eff6ff' : 'rgba(255,255,255,0.03)', 
                color: accentColor, 
                borderColor: isLight ? '#bfdbfe' : 'rgba(255,255,255,0.08)' 
              }}
            >
              {data.section_badge}
            </span>
          )}
          <h2 className={`font-black tracking-tight leading-tight ${
            isMobile ? 'text-2xl' : 'text-3xl sm:text-4xl lg:text-5xl'
          }`} style={{ color: textColor }}>
            {data.section_title || 'Our Comprehensive Services'}
          </h2>
          {data.section_subtitle && (
            <p className={`max-w-2xl mx-auto leading-relaxed font-medium ${
              isMobile ? 'text-xs' : 'text-sm sm:text-base lg:text-lg'
            }`} style={{ color: subtextColor }}>
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
              className={`rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex flex-col justify-between p-6 sm:p-8 group relative overflow-hidden`}
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
                
                <h3 className="text-base sm:text-lg font-bold group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200" style={{ color: textColor }}>
                  {item.title}
                </h3>
                
                <p className="text-xs leading-relaxed font-medium" style={{ color: subtextColor }}>
                  {item.description}
                </p>
              </div>

              <div 
                className="pt-5 border-t mt-5 flex items-center justify-between text-xs font-bold transition-colors duration-200 group-hover:opacity-80" 
                style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)', color: accentColor }}
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Premium Execution Workflow Timeline Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`rounded-3xl border shadow-2xl space-y-12 relative overflow-hidden ${
            isMobile ? 'p-6' : 'p-10 lg:p-14'
          }`}
          style={{ 
            backgroundColor: isLight ? '#ffffff' : 'rgba(18, 24, 36, 0.25)', 
            borderColor: cardBorder 
          }}
        >
          {/* Subtle Grid Backdrop for human-made SaaS theme */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />

          <div className="text-center space-y-2 max-w-2xl mx-auto relative z-10">
            <span 
              className="font-extrabold uppercase tracking-widest text-[10px] sm:text-xs px-3 py-1 rounded-full border inline-block"
              style={{ 
                backgroundColor: isLight ? '#fdf2f8' : 'rgba(244,114,182,0.03)', 
                color: '#db2777', 
                borderColor: isLight ? '#fbcfe8' : 'rgba(244,114,182,0.08)' 
              }}
            >
              Our Methodology
            </span>
            <h3 className={`font-black tracking-tight ${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'}`} style={{ color: textColor }}>
              How We Deliver Excellence
            </h3>
            <p className="text-xs leading-relaxed font-medium" style={{ color: subtextColor }}>
              A systematic, transparent 4-step execution model engineered to guarantee measurable results.
            </p>
          </div>

          {/* Workflow Steps with connected tracker lines */}
          <div className="relative">
            {/* Desktop timeline track connector line */}
            {!isMobile && (
              <div 
                className="absolute top-8 left-6 right-6 h-[1.5px] border-t border-dashed -z-10" 
                style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)' }}
              />
            )}

            <div className={`grid gap-8 relative z-10 ${
              isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}>
              {processSteps.map((p, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="space-y-3 relative group"
                >
                  {/* Step bubble */}
                  <div 
                    className="w-14 h-14 rounded-full border flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105"
                    style={{ 
                      backgroundColor: isLight ? '#ffffff' : '#0f172a',
                      borderColor: isLight ? '#bfdbfe' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <span 
                      className="text-lg font-black bg-gradient-to-tr from-indigo-500 to-pink-500 bg-clip-text text-transparent"
                    >
                      {p.step}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm sm:text-base font-bold" style={{ color: textColor }}>
                      {p.title}
                    </h4>
                    <p className="text-xs leading-relaxed font-medium" style={{ color: subtextColor }}>
                      {p.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </motion.section>
  );
}
