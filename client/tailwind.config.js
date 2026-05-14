/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Brand Colors ─────────────────────────────────────────
      colors: {
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        vault: {
          green:  'var(--color-accent)',
          silver: 'var(--color-accent-secondary)',
          dark:   'var(--color-dark)',
          darker: 'var(--color-darker)',
          card:   'var(--color-card)',
          border: 'var(--color-border)',
        },
      },
      // ── Fonts ─────────────────────────────────────────────────
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      // ── Animations ────────────────────────────────────────────
      animation: {
        'fade-in':     'fadeIn 0.5s ease-in-out',
        'slide-up':    'slideUp 0.5s ease-out',
        'slide-down':  'slideDown 0.3s ease-out',
        'pulse-slow':  'pulse 3s infinite',
        'glow':        'glow 2s ease-in-out infinite alternate',
        'float':       'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        glow:      { from: { boxShadow: '0 0 5px #00FF88' }, to: { boxShadow: '0 0 20px #00FF88, 0 0 40px #00FF88' } },
        float:     { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      // ── Backgrounds ───────────────────────────────────────────
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand':  'linear-gradient(135deg, #00FF88, #16a34a)',
        'gradient-dark':   'linear-gradient(180deg, #0A0A0F 0%, #05050A 100%)',
        'glass':           'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
      },
    },
  },
  plugins: [],
};
