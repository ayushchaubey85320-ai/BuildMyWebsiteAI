import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ServicesSection({ data, colors, viewport }) {
  if (!data) return null;

  const items = data.items || [];
  const isMobile = viewport === 'mobile';

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
        isMobile ? 'py-8 px-3' : 'py-12 sm:py-16 px-4 sm:px-6'
      }`}
      style={{ backgroundColor: colors.bg }}
    >
      <div className="max-w-6xl mx-auto space-y-10 sm:space-y-16">
        {/* Header */}
        <div className="text-center space-y-2.5 max-w-3xl mx-auto">
          {data.section_badge && (
            <span className={`font-extrabold tracking-widest uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 inline-block ${
              isMobile ? 'text-[10px] px-2.5 py-1' : 'text-xs px-3.5 py-1.5'
            }`}>
              {data.section_badge}
            </span>
          )}
          <h2 className={`font-extrabold tracking-tight ${
            isMobile ? 'text-xl' : 'text-2xl sm:text-4xl lg:text-5xl'
          }`} style={{ color: colors.text }}>
            {data.section_title || 'Our Comprehensive Services'}
          </h2>
          {data.section_subtitle && (
            <p className={`max-w-2xl mx-auto leading-relaxed ${
              isMobile ? 'text-xs' : 'text-sm sm:text-base lg:text-lg'
            }`} style={{ color: colors.muted }}>
              {data.section_subtitle}
            </p>
          )}
        </div>

        {/* 6 Rich Service Cards Grid (Forced Single Column when viewport === 'mobile') */}
        <div className={`grid gap-4 sm:gap-8 ${
          isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`rounded-2xl border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between shadow-lg ${
                isMobile ? 'p-5' : 'p-6 sm:p-8'
              }`}
              style={{ backgroundColor: colors.card_bg, borderColor: colors.card_border }}
            >
              <div className="space-y-3">
                <div className={`rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold ${
                  isMobile ? 'w-9 h-9' : 'w-10 h-10 sm:w-12 sm:h-12'
                }`}>
                  <CheckCircle2 className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5 sm:w-6 sm:h-6'}`} />
                </div>
                <h3 className={`font-bold ${isMobile ? 'text-base' : 'text-lg sm:text-xl'}`} style={{ color: colors.text }}>
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: colors.muted }}>
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-bold" style={{ borderColor: colors.card_border, color: colors.primary }}>
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Extended Section: Execution Workflow Process */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`rounded-2xl border shadow-2xl space-y-6 ${
            isMobile ? 'p-4' : 'p-6 sm:p-10 lg:p-12 sm:rounded-3xl'
          }`}
          style={{ backgroundColor: colors.surface, borderColor: colors.card_border }}
        >
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[10px] sm:text-xs font-extrabold tracking-widest uppercase px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 inline-block">
              Our Methodology
            </span>
            <h3 className={`font-extrabold ${isMobile ? 'text-lg' : 'text-xl sm:text-3xl'}`} style={{ color: colors.text }}>
              How We Deliver Excellence
            </h3>
            <p className="text-xs max-w-xl mx-auto" style={{ color: colors.muted }}>
              A systematic, transparent 4-step execution model engineered to guarantee measurable results.
            </p>
          </div>

          <div className={`grid gap-4 ${
            isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          }`}>
            {processSteps.map((p, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border space-y-2 relative" 
                style={{ backgroundColor: colors.card_bg, borderColor: colors.card_border }}
              >
                <span className="text-lg sm:text-2xl font-black text-cyan-400/50">{p.step}</span>
                <h4 className="text-xs sm:text-base font-bold" style={{ color: colors.text }}>{p.title}</h4>
                <p className="text-xs leading-relaxed" style={{ color: colors.muted }}>{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
