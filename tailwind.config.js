/** @type {import('tailwindcss').Config} */
// ============================================================
// TAILWIND CONFIG — CabanaBook Design System
// Extends Tailwind with custom colors, fonts, and animations
// for a premium social media aesthetic.
// ============================================================
export default {
  // Tell Tailwind where to find class names so it can purge unused CSS
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ─── BRAND COLORS ────────────────────────────────────────
      colors: {
        // Primary brand blues — ocean/tropical palette
        cabana: {
          50:  '#eff8ff',
          100: '#dbeffe',
          200: '#bfe3fd',
          300: '#93d0fc',
          400: '#60b4f8',
          500: '#3b93f3',   // ← Main brand blue
          600: '#2474e8',
          700: '#1a5fd1',
          800: '#1b4eaa',
          900: '#1c4285',
          950: '#152a56',
        },
        // Accent — warm ocean teal
        ocean: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        // Sand/sunset warm accent for contrast
        sand: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
        },
        // UI neutrals — Facebook-style gray backgrounds
        surface: {
          bg:     '#f0f2f5',  // Page background
          card:   '#ffffff',  // Card/panel background
          input:  '#f0f2f5',  // Input field background
          hover:  '#e4e6eb',  // Hover states
          border: '#dddfe2',  // Dividers
        },
      },
      // ─── TYPOGRAPHY ──────────────────────────────────────────
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      // ─── CUSTOM ANIMATIONS ───────────────────────────────────
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%':       { transform: 'rotate(3deg)' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 6px rgba(59,147,243,0.4)' },
          '50%':       { boxShadow: '0 0 18px rgba(59,147,243,0.8)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0'  },
        },
        heartPop: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.4)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        wave:     'wave 2s ease-in-out infinite',
        slideUp:  'slideUp 0.4s ease-out',
        glow:     'glow 2s ease-in-out infinite',
        shimmer:  'shimmer 1.5s infinite linear',
        heartPop: 'heartPop 0.3s ease-out',
      },
      // ─── CUSTOM SHADOWS ──────────────────────────────────────
      boxShadow: {
        card:  '0 1px 2px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
        hover: '0 4px 12px rgba(0,0,0,0.15)',
        nav:   '0 2px 8px rgba(0,0,0,0.10)',
        blue:  '0 4px 14px rgba(59,147,243,0.35)',
      },
    },
  },
  plugins: [],
}
