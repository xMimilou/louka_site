/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: '#F8FAFC',
        surface: '#FFFFFF',
        accent: '#0369A1',
        'accent-glow': 'rgba(3,105,161,0.25)',
        border: '#E2E8F0',
        'text-primary': '#0F172A',
        'text-muted': '#64748B',
        'admin-bg': '#0F1117',
        'admin-sidebar': '#161B27',
        'admin-surface': '#1C2333',
        'admin-border': '#2D3748',
        'admin-text': '#E2E8F0',
        'admin-muted': '#718096',
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(3,105,161,0.15)',
        'glow': '0 0 24px rgba(3,105,161,0.2)',
        'glow-lg': '0 0 40px rgba(3,105,161,0.3)',
      },
    },
  },
  plugins: [],
}
