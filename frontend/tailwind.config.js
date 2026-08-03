/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        buildmywebsiteai: {
          dark: '#0a0d14',
          card: '#121824',
          accent: '#6366f1',
          neon: '#10b981',
          gold: '#eab308',
          cyan: '#06b6d4'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)' },
          '100%': { boxShadow: '0 0 35px rgba(99, 102, 241, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
