/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070B14',
          900: '#0B1120',
          850: '#0F172A',
          800: '#162036',
          700: '#1E293B',
          600: '#334155',
          500: '#475569',
        },
        opera: {
          teal: '#14B8A6',
          cyan: '#06B6D4',
          electric: '#0EA5E9',
          amber: '#F59E0B',
          surface: '#F8FAFC',
          cardDark: '#0D1527',
          borderDark: '#1E2D4A',
          borderLight: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-teal': '0 0 20px -3px rgba(20, 184, 166, 0.3)',
        'glow-cyan': '0 0 25px -3px rgba(14, 165, 233, 0.35)',
        'card-dark': '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
