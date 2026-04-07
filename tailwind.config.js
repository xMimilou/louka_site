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
        bg: '#0A0A0F',
        surface: '#13131A',
        accent: '#00D4FF',
        'accent-glow': 'rgba(0,212,255,0.3)',
        border: '#1E293B',
        'text-primary': '#F1F5F9',
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
        'glow-sm': '0 0 12px rgba(0,212,255,0.2)',
        'glow': '0 0 24px rgba(0,212,255,0.3)',
        'glow-lg': '0 0 40px rgba(0,212,255,0.4)',
      },
    },
  },
  plugins: [],
}
