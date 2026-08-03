import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQSection = ({ data, colors, viewport = 'desktop' }) => {
  const title = data?.section_title || "Frequently Asked Questions";
  const items = data?.items || [];
  const [openIdx, setOpenIdx] = useState(0);

  const isLight = colors?.mode === 'light';
  const textColor = isLight ? '#0f172a' : '#ffffff';
  const subtextColor = isLight ? '#475569' : '#94a3b8';
  const cardBg = isLight ? '#ffffff' : (colors.card_bg || '#1e293b');
  const cardBorder = isLight ? '#e2e8f0' : (colors.card_border || 'rgba(255,255,255,0.1)');

  return (
    <section id="faq" className="px-4 sm:px-8 py-16 max-w-4xl mx-auto">
      <h2 className="text-2xl sm:text-4xl font-black text-center mb-10 tracking-tight" style={{ color: textColor }}>
        {title}
      </h2>

      <div className="space-y-4">
        {items.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border transition overflow-hidden"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 text-left font-bold text-sm sm:text-base flex items-center justify-between gap-4"
                style={{ color: textColor }}
              >
                <span>{item.question}</span>
                <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: colors.primary }} />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm leading-relaxed border-t pt-3" style={{ color: subtextColor, borderColor: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.05)' }}>
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
