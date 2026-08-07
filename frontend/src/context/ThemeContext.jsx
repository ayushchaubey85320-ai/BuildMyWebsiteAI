import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEME_PALETTES = {
  MODERN_DARK: { name: "Modern Dark", bg: "#0f172a", surface: "#1e293b", primary: "#6366f1", secondary: "#ec4899", text: "#f8fafc", muted: "#94a3b8", accent: "#38bdf8", card_bg: "#1e293b", card_border: "rgba(255,255,255,0.1)", mode: "dark" },
  NEON_CYBER: { name: "Neon Cyber", bg: "#09090b", surface: "#18181b", primary: "#22c55e", secondary: "#a855f7", text: "#ffffff", muted: "#a1a1aa", accent: "#06b6d4", card_bg: "#18181b", card_border: "rgba(255,255,255,0.1)", mode: "dark" },
  MINIMAL_LIGHT: { name: "Minimal Light", bg: "#f8fafc", surface: "#ffffff", primary: "#2563eb", secondary: "#0284c7", text: "#0f172a", muted: "#475569", accent: "#ec4899", card_bg: "#ffffff", card_border: "#e2e8f0", mode: "light" },
  ELEGANT_GOLD: { name: "Elegant Gold", bg: "#0b0f19", surface: "#111827", primary: "#eab308", secondary: "#f97316", text: "#fef08a", muted: "#d1d5db", accent: "#d97706", card_bg: "#111827", card_border: "rgba(255,255,255,0.1)", mode: "dark" },
  OCEAN_BLUE: { name: "Ocean Blue", bg: "#030712", surface: "#0f172a", primary: "#0284c7", secondary: "#06b6d4", text: "#f0f9ff", muted: "#94a3b8", accent: "#38bdf8", card_bg: "#0f172a", card_border: "rgba(255,255,255,0.1)", mode: "dark" },
  SUNSET_ORANGE: { name: "Sunset Orange", bg: "#180e29", surface: "#28153f", primary: "#f97316", secondary: "#ef4444", text: "#fff7ed", muted: "#f5d0fe", accent: "#fbbf24", card_bg: "#28153f", card_border: "rgba(255,255,255,0.1)", mode: "dark" }
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('buildmywebsiteai_theme_mode') || 'dark';
  });

  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem('buildmywebsiteai_theme_name') || 'MODERN_DARK';
  });

  useEffect(() => {
    localStorage.setItem('buildmywebsiteai_theme_mode', themeMode);
    localStorage.setItem('buildmywebsiteai_theme_name', themeName);

    if (themeMode === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [themeMode, themeName]);

  const toggleThemeMode = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const getColors = () => {
    const base = THEME_PALETTES[themeName] || THEME_PALETTES.MODERN_DARK;
    if (themeMode === 'light') {
      return {
        bg: '#f8fafc',
        surface: '#ffffff',
        primary: base.primary,
        secondary: base.secondary,
        text: '#0f172a',
        muted: '#475569',
        accent: base.accent,
        card_bg: '#ffffff',
        card_border: '#e2e8f0',
        mode: 'light'
      };
    }
    return { ...base, mode: 'dark' };
  };

  const colors = getColors();

  return (
    <ThemeContext.Provider value={{ themeMode, themeName, toggleThemeMode, setThemeName, colors }}>
      <div style={{ backgroundColor: colors.bg, color: colors.text, minHeight: '100vh', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
