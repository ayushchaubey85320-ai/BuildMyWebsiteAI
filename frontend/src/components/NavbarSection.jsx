import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const NavbarSection = ({ data, colors, viewport = 'desktop', onPageChange, logoUrl }) => {
  const brand = data?.brand || "BrandName";
  const logo = logoUrl || data?.logo_url;
  const links = data?.links || [];
  const cta = data?.cta_button || "Get Started";
  const [mobileOpen, setMobileOpen] = useState(false);

  const isMobile = viewport === 'mobile';
  const isLight = colors?.mode === 'light';

  const textColor = isLight ? '#0f172a' : '#f8fafc';
  const navBg = isLight ? `${colors.surface || '#ffffff'}f0` : `${colors.surface || '#1e293b'}ee`;
  const navBorder = isLight ? 'border-slate-200' : 'border-white/10';

  const handleNavClick = (e, link) => {
    if (onPageChange && link.label) {
      e.preventDefault();
      onPageChange(link.label);
    }
  };

  return (
    <nav className={`w-full border-b ${navBorder} px-4 sm:px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-30`} style={{ backgroundColor: navBg }}>
      {/* Left Brand Area with Uploaded Logo Image */}
      <div 
        className="text-xl font-black tracking-tight cursor-pointer flex items-center gap-2.5" 
        style={{ color: textColor }} 
        onClick={(e) => handleNavClick(e, { label: "Home" })}
      >
        {logo ? (
          <img 
            src={logo} 
            alt="Brand Logo" 
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg shrink-0 shadow-sm" 
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 via-sky-400 to-pink-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
            {brand.substring(0, 1).toUpperCase()}
          </div>
        )}
        <span style={{ color: colors.primary }}>{brand}</span>
      </div>

      {!isMobile && (
        <div className="hidden md:flex items-center gap-6">
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              onClick={(e) => handleNavClick(e, link)}
              className="text-sm font-semibold hover:opacity-75 transition cursor-pointer"
              style={{ color: textColor }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={(e) => handleNavClick(e, { label: "Contact Us" })}
          className="px-4 py-2 rounded-full font-bold text-xs sm:text-sm shadow-md transition transform hover:scale-105"
          style={{ backgroundColor: colors.primary, color: '#ffffff' }}
        >
          {cta}
        </button>
        {isMobile && (
          <button onClick={() => setMobileOpen(!mobileOpen)} className={`p-1.5 rounded-lg ${isLight ? 'bg-slate-200 text-slate-900' : 'bg-white/10 text-white'}`}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
      </div>

      {isMobile && mobileOpen && (
        <div className={`absolute top-full left-0 right-0 p-4 border-b ${navBorder} flex flex-col gap-3 shadow-2xl z-40`} style={{ backgroundColor: colors.surface }}>
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              onClick={(e) => { setMobileOpen(false); handleNavClick(e, link); }}
              className="text-sm font-semibold py-1 border-b border-slate-200/20 cursor-pointer"
              style={{ color: textColor }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default NavbarSection;
