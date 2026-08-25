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

  const isMobile = viewport === 'mobile';

  return (
    <footer className={`w-full border-t py-10 mt-16 ${isMobile ? 'px-4' : 'px-6 sm:px-12'}`} style={{ backgroundColor: footerBg, borderColor: footerBorder }}>
      <div className={`max-w-6xl mx-auto flex gap-6 mb-8 ${isMobile ? 'flex-col items-center text-center' : 'flex-col md:flex-row items-start justify-between'}`}>
        <div className={isMobile ? 'flex flex-col items-center' : ''}>
          <h3 className="text-xl font-black mb-2 tracking-tight" style={{ color: textColor }}>
            {brand}
          </h3>
          <p className="text-xs sm:text-sm max-w-sm" style={{ color: subtextColor }}>
            {description}
          </p>
        </div>

        <div className={`space-y-2 text-xs sm:text-sm ${isMobile ? 'flex flex-col items-center' : ''}`}>
          {email && (
            <div className="flex items-center gap-2 max-w-full" style={{ color: subtextColor }}>
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="break-all">{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 max-w-full" style={{ color: subtextColor }}>
              <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="break-all">{phone}</span>
            </div>
          )}
        </div>
      </div>

      <div className={`max-w-6xl mx-auto pt-6 border-t flex items-center justify-between gap-4 text-xs ${isMobile ? 'flex-col text-center' : 'flex-col sm:flex-row'}`} style={{ borderColor: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.05)', color: subtextColor }}>
        <span>{copyright}</span>
        <span className="font-semibold" style={{ color: colors.primary }}>
          {credit}
        </span>
      </div>
    </footer>
  );
};

export default FooterSection;
