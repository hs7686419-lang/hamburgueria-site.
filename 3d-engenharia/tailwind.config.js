/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './privacidade/index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#07090c',
          900: '#0b0e12',
          850: '#10141a',
          800: '#151a21',
          700: '#1e252e',
          600: '#2b333e',
        },
        steel: {
          50: '#f4f5f6',
          100: '#e6e8eb',
          200: '#cdd1d6',
          300: '#a9afb7',
          400: '#848b95',
          500: '#686f79',
        },
        metal: {
          DEFAULT: '#b8a27a',
          light: '#d8c7a3',
          dark: '#8c7856',
        },
      },
      fontFamily: {
        sans: ['"Inter Tight Variable"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      maxWidth: { site: '1360px' },
      letterSpacing: { tightest: '-0.045em' },
      transitionTimingFunction: { premium: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      keyframes: {
        loader: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(300%)' } },
        scrollcue: {
          '0%': { transform: 'translateY(-100%)' },
          '60%,100%': { transform: 'translateY(200%)' },
        },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
    },
  },
  plugins: [],
}
