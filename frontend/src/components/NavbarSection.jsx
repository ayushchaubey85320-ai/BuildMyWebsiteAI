import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const NavbarSection = ({ data, colors, viewport = 'desktop', onPageChange, logoUrl }) => {
  const brand = data?.brand || "BrandName";
  const logo = logoUrl || data?.logo_url;
  const links = data?.links || [];
  const cta = data?.cta_button || "Get Started";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = viewport === 'mobile' || windowWidth < 768;
  const isLight = colors?.mode === 'light';

  const textColor = isLight ? '#0f172a' : '#f8fafc';
  const navBg = isLight ? `${colors.surface || '#ffffff'}f0` : `${colors.surface || '#1e293b'}ee`;
  const navBorder = isLight ? 'border-slate-200' : 'border-white/10';

  const handleNavClick = (e, link) => {
    if (e) e.preventDefault();

    if (link.href && link.href.startsWith('#')) {
      const targetId = link.href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    if (onPageChange && link.label) {
      onPageChange(link.label);
    }
  };

  return (
    <nav className={`w-full border-b ${navBorder} px-4 sm:px-6 py-3.5 flex items-center justify-between backdrop-blur-md sticky top-0 z-40 transition-all`} style={{ backgroundColor: navBg }}>
      {/* Left Brand Area */}
      <div 
        className="text-lg sm:text-xl font-black tracking-tight cursor-pointer flex items-center gap-2.5 shrink-0" 
        style={{ color: textColor }} 
        onClick={(e) => handleNavClick(e, { label: "Home", href: "#home" })}
      >
        {logo ? (
          <img 
            src={logo} 
            alt="Brand Logo" 
            className="w-7 h-7 sm:w-9 sm:h-9 object-contain rounded-lg shrink-0 shadow-sm" 
          />
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-cyan-400 via-sky-400 to-pink-500 text-white flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-sm">
            {brand.substring(0, 1).toUpperCase()}
          </div>
        )}
        <span className="truncate max-w-[140px] sm:max-w-none" style={{ color: colors.primary }}>{brand}</span>
      </div>

      {/* Desktop Links */}
      {!isMobile && (
        <div className="hidden md:flex items-center gap-6">
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.href || '#'}
              onClick={(e) => handleNavClick(e, link)}
              className="text-sm font-semibold hover:opacity-75 transition cursor-pointer"
              style={{ color: textColor }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      {/* Right Area CTA & Hamburger */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={(e) => handleNavClick(e, { label: "Contact Us", href: "#contact" })}
          className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-xs sm:text-sm shadow-md transition transform hover:scale-105"
          style={{ backgroundColor: colors.primary, color: '#ffffff' }}
        >
          {cta}
        </button>

        {isMobile && (
          <button 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className={`p-2 rounded-xl border transition ${isLight ? 'bg-slate-100 text-slate-900 border-slate-300' : 'bg-white/10 text-white border-white/20'}`}
            aria-label="Toggle Mobile Navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Mobile Menu Dropdown Panel */}
      {isMobile && mobileOpen && (
        <div 
          className={`absolute top-full left-0 right-0 p-5 border-b ${navBorder} flex flex-col gap-3 shadow-2xl z-50 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200`} 
          style={{ backgroundColor: colors.surface }}
        >
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.href || '#'}
              onClick={(e) => { setMobileOpen(false); handleNavClick(e, link); }}
              className="text-sm font-bold py-2 border-b border-slate-700/20 cursor-pointer flex items-center justify-between"
              style={{ color: textColor }}
            >
              <span>{link.label}</span>
              <span className="text-xs text-cyan-400 font-mono">→</span>
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default NavbarSection;
