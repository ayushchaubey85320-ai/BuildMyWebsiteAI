import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQSection = ({ data, colors, viewport = 'desktop' }) => {
  const title = data?.section_title || "Frequently Asked Questions";
  const items = data?.items || [];
  const [openIdx, setOpenIdx] = useState(0);
  const isMobile = viewport === 'mobile';

  const isLight = colors?.mode === 'light';
  const textColor = isLight ? '#0f172a' : '#ffffff';
  const subtextColor = isLight ? '#475569' : '#94a3b8';
  const cardBg = isLight ? '#ffffff' : (colors.card_bg || '#1e293b');
  const cardBorder = isLight ? '#e2e8f0' : (colors.card_border || 'rgba(255,255,255,0.1)');

  return (
    <section id="faq" className={`max-w-4xl mx-auto ${
      isMobile ? 'px-3 py-8' : 'px-4 sm:px-8 py-16'
    }`}>
      <h2 className={`font-black text-center tracking-tight ${
        isMobile ? 'text-xl mb-6' : 'text-2xl sm:text-4xl mb-10'
      }`} style={{ color: textColor }}>
        {title}
      </h2>

      <div className="space-y-3">
        {items.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-xl sm:rounded-2xl border transition overflow-hidden"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className={`w-full text-left font-bold flex items-center justify-between gap-3 ${
                  isMobile ? 'p-3.5 text-xs' : 'p-5 text-sm sm:text-base'
                }`}
                style={{ color: textColor }}
              >
                <span>{item.question}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: colors.primary }} />
              </button>

              {isOpen && (
                <div className={`text-xs leading-relaxed border-t ${
                  isMobile ? 'px-3.5 pb-3.5 pt-2 text-[11px]' : 'px-5 pb-5 pt-3 sm:text-sm'
                }`} style={{ color: subtextColor, borderColor: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.05)' }}>
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FAQSection;
