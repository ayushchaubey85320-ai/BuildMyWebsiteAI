import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { themeMode, toggleThemeMode } = useTheme();
  const isLight = themeMode === 'light';

  return (
    <button
      onClick={toggleThemeMode}
      title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-md border relative group overflow-hidden ${
        isLight
          ? 'bg-amber-100 text-amber-600 border-amber-300 shadow-amber-500/20'
          : 'bg-slate-900 text-indigo-400 border-indigo-500/40 shadow-indigo-500/30'
      }`}
      aria-label="Toggle Dark and Light Mode"
    >
      {/* Animated Subtle Ambient Glow */}
      <div className={`absolute inset-0 rounded-full opacity-30 transition-opacity group-hover:opacity-70 ${
        isLight ? 'bg-amber-300' : 'bg-indigo-500'
      }`} />

      <div className="relative z-10 transition-transform duration-500 transform group-hover:rotate-180">
        {isLight ? (
          <Sun className="w-5 h-5 text-amber-600" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-400" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
