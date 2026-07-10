import type { Config } from 'tailwindcss';

// Theme colours are runtime CSS variables (set per-school by <ThemeProvider>),
// exposed here so you can write `bg-primary`, `text-accent`, etc.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        primary: 'var(--primary)',
        accent: 'var(--accent)',
        correct: 'var(--correct)',
        wrong: 'var(--wrong)',
        'body-text': 'var(--text)',
        'body-dim': 'var(--text-dim)',
      },
      fontFamily: {
        display: ['"Fredoka One"', 'system-ui', 'sans-serif'],
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
