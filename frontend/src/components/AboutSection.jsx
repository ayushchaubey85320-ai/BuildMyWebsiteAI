import React from 'react';
import { ShieldCheck, Target, Heart, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutSection({ data, colors, viewport }) {
  if (!data) return null;

  const isMobile = viewport === 'mobile';
  const isLight = colors?.mode === 'light';
  const textColor = isLight ? '#0f172a' : '#ffffff';
  const subtextColor = isLight ? '#475569' : '#94a3b8';
  const cardBg = isLight ? '#ffffff' : (colors.card_bg || 'rgba(18, 24, 36, 0.4)');
  const cardBorder = isLight ? '#e2e8f0' : (colors.card_border || 'rgba(255,255,255,0.06)');
  const accentColor = colors.primary || '#6366f1';

  const coreValues = [
    { icon: Sparkles, title: "Continuous Innovation", desc: "Pushing technical boundaries to craft modern, forward-thinking solutions." },
    { icon: ShieldCheck, title: "Uncompromising Integrity", desc: "Building trust through transparent operations, clear security, and ethical standards." },
    { icon: Award, title: "Operational Excellence", desc: "Enforcing rigorous quality controls across every product and project deployment." },
    { icon: Heart, title: "Customer Success", desc: "Prioritizing client goals and delivering proactive support every step of the way." }
  ];

  const stats = [
    { value: "99.9%", label: "Platform SLA Uptime", sub: "Highly resilient cloud hosting" },
    { value: "10k+", label: "Websites Crafted", sub: "Active user creations globally" },
    { value: "18+", label: "Design Verticals", sub: "Customizable industry options" },
    { value: "< 10s", label: "Synthesis Rate", sub: "Near-instantaneous AI engine" }
  ];

  return (
    <motion.section 
      id="about" 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`relative z-10 scroll-mt-20 overflow-hidden ${
        isMobile ? 'py-10 px-4' : 'py-20 px-6 sm:px-8'
      }`}
      style={{ backgroundColor: colors.surface }}
    >
      <div className="max-w-6xl mx-auto space-y-16 sm:space-y-24">
        
        {/* Header */}
        <div className="text-center space-y-3">
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
            {data.section_title || 'About Us'}
          </h2>
        </div>

        {/* Story & Mission Grid */}
        <div className={`grid gap-12 items-center ${
          isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
        }`}>
          <div className="space-y-4 text-xs sm:text-base leading-relaxed font-medium" style={{ color: subtextColor }}>
            {data.paragraphs && data.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6">
            {data.mission && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-6 rounded-2xl border shadow-lg space-y-2 relative overflow-hidden group" 
                style={{ backgroundColor: cardBg, borderColor: cardBorder }}
              >
                <div 
                  className="absolute top-0 left-0 w-full h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-gradient-to-r from-cyan-500 to-indigo-500"
                />
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400 shrink-0" />
                  <h3 className="text-sm sm:text-lg font-bold text-cyan-400">{data.mission_title || 'Our Mission'}</h3>
                </div>
                <p className="text-xs leading-relaxed font-medium" style={{ color: subtextColor }}>{data.mission}</p>
              </motion.div>
            )}

            {data.vision && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="p-6 rounded-2xl border shadow-lg space-y-2 relative overflow-hidden group" 
                style={{ backgroundColor: cardBg, borderColor: cardBorder }}
              >
                <div 
                  className="absolute top-0 left-0 w-full h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-gradient-to-r from-pink-500 to-indigo-500"
                />
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-400 shrink-0" />
                  <h3 className="text-sm sm:text-lg font-bold text-pink-400">{data.vision_title || 'Our Vision'}</h3>
                </div>
                <p className="text-xs leading-relaxed font-medium" style={{ color: subtextColor }}>{data.vision}</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Premium Geometric Statistics Counters */}
        <div 
          className={`grid gap-8 border-y py-8 ${
            isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'
          }`}
          style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.06)' }}
        >
          {stats.map((s, idx) => (
            <div key={idx} className="text-center space-y-1 group">
              <p 
                className={`font-black bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 ${
                  isMobile ? 'text-3xl' : 'text-3xl sm:text-4xl lg:text-5xl'
                }`}
              >
                {s.value}
              </p>
              <div>
                <p className="text-xs font-black tracking-tight" style={{ color: textColor }}>{s.label}</p>
                <p className="text-[10px] font-medium" style={{ color: subtextColor }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Core Pillars / Values Section */}
        <div className="space-y-10">
          <div className="text-center space-y-2">
            <h3 className={`font-black tracking-tight ${isMobile ? 'text-lg' : 'text-xl sm:text-3xl'}`} style={{ color: textColor }}>Our Foundational Pillars</h3>
            <p className="text-xs sm:text-sm leading-relaxed font-medium max-w-lg mx-auto" style={{ color: subtextColor }}>
              Guided by core principles that drive long-term value, reliability, and technical distinction.
            </p>
          </div>

          <div className={`grid gap-6 ${
            isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          }`}>
            {coreValues.map((v, idx) => {
              const IconComp = v.icon;
              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="p-5 rounded-2xl border space-y-3 relative group overflow-hidden" 
                  style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                >
                  <div 
                    className="absolute top-0 left-0 w-full h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                    style={{ backgroundColor: accentColor }}
                  />
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center border transition-colors duration-300 group-hover:bg-opacity-20" 
                    style={{ 
                      backgroundColor: isLight ? '#eff6ff' : 'rgba(255,255,255,0.03)', 
                      borderColor: isLight ? '#bfdbfe' : 'rgba(255,255,255,0.08)', 
                      color: accentColor 
                    }}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold" style={{ color: textColor }}>{v.title}</h4>
                  <p className="text-xs leading-relaxed font-medium" style={{ color: subtextColor }}>{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </motion.section>
  );
}
