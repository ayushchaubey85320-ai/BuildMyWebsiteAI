import React from 'react';
import { Mail, Phone } from 'lucide-react';

const FooterSection = ({ data, colors, viewport = 'desktop' }) => {
  const brand = data?.brand || "BrandName";
  const description = data?.description || "Next-generation website.";
  const email = data?.contact_email;
  const phone = data?.contact_phone;
  const copyright = data?.copyright || "© 2026 All rights reserved.";
  const credit = data?.credit || "Website built by BuildMyWebsiteAI";

  const isLight = colors?.mode === 'light';
  const textColor = isLight ? '#0f172a' : '#ffffff';
  const subtextColor = isLight ? '#475569' : '#94a3b8';
  const footerBg = isLight ? '#f1f5f9' : '#090d16';
  const footerBorder = isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)';

  return (
    <footer className="w-full border-t px-6 sm:px-12 py-12 mt-16" style={{ backgroundColor: footerBg, borderColor: footerBorder }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
        <div>
          <h3 className="text-xl font-black mb-2 tracking-tight" style={{ color: textColor }}>
            {brand}
          </h3>
          <p className="text-xs sm:text-sm max-w-sm" style={{ color: subtextColor }}>
            {description}
          </p>
        </div>

        <div className="space-y-2 text-xs sm:text-sm">
          {email && (
            <div className="flex items-center gap-2" style={{ color: subtextColor }}>
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2" style={{ color: subtextColor }}>
              <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{phone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ borderColor: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.05)', color: subtextColor }}>
        <span>{copyright}</span>
        <span className="font-semibold" style={{ color: colors.primary }}>
          {credit}
        </span>
      </div>
    </footer>
  );
};

export default FooterSection;
