import React from 'react';
import { ShieldCheck, Target, Heart, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutSection({ data, colors, viewport }) {
  if (!data) return null;

  const coreValues = [
    { icon: Sparkles, title: "Continuous Innovation", desc: "Pushing technical boundaries to craft modern, forward-thinking solutions." },
    { icon: ShieldCheck, title: "Uncompromising Integrity", desc: "Building trust through transparent operations, clear security, and ethical standards." },
    { icon: Award, title: "Operational Excellence", desc: "Enforcing rigorous quality controls across every product and project deployment." },
    { icon: Heart, title: "Customer Success", desc: "Prioritizing client goals and delivering proactive support every step of the way." }
  ];

  return (
    <motion.section 
      id="about" 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-12 sm:py-16 px-4 sm:px-6 relative z-10 scroll-mt-20 overflow-hidden" 
      style={{ backgroundColor: colors.surface }}
    >
      <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          {data.section_badge && (
            <span className="text-xs font-extrabold tracking-widest uppercase px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 inline-block">
              {data.section_badge}
            </span>
          )}
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight" style={{ color: colors.text }}>
            {data.section_title || 'About Us'}
          </h2>
        </div>

        {/* Story & Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 text-sm sm:text-base lg:text-lg leading-relaxed font-normal" style={{ color: colors.muted }}>
            {data.paragraphs && data.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {data.mission && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-5 sm:p-6 rounded-2xl border shadow-md space-y-2" 
                style={{ backgroundColor: colors.card_bg, borderColor: colors.card_border }}
              >
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400 shrink-0" />
                  <h3 className="text-base sm:text-lg font-bold text-cyan-400">{data.mission_title || 'Our Mission'}</h3>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: colors.muted }}>{data.mission}</p>
              </motion.div>
            )}
            {data.vision && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="p-5 sm:p-6 rounded-2xl border shadow-md space-y-2" 
                style={{ backgroundColor: colors.card_bg, borderColor: colors.card_border }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-400 shrink-0" />
                  <h3 className="text-base sm:text-lg font-bold text-pink-400">{data.vision_title || 'Our Vision'}</h3>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: colors.muted }}>{data.vision}</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Core Pillars / Values Section */}
        <div className="pt-6 sm:pt-8 border-t space-y-6 sm:space-y-8" style={{ borderColor: colors.card_border }}>
          <div className="text-center space-y-2">
            <h3 className="text-xl sm:text-2xl font-extrabold" style={{ color: colors.text }}>Our Foundational Pillars</h3>
            <p className="text-xs sm:text-sm max-w-lg mx-auto" style={{ color: colors.muted }}>
              Guided by core principles that drive long-term value, reliability, and technical distinction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {coreValues.map((v, idx) => {
              const IconComp = v.icon;
              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="p-5 sm:p-6 rounded-xl sm:rounded-2xl border space-y-2.5" 
                  style={{ backgroundColor: colors.card_bg, borderColor: colors.card_border }}
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                    <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold" style={{ color: colors.text }}>{v.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: colors.muted }}>{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
