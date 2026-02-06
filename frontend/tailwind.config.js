/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0a0a0a',
        'dark-sidebar': '#111111',
        'dark-border': '#1f1f1f',
        'dark-text': '#e5e5e5',
        'dark-text-secondary': '#a3a3a3',
        'accent': '#6366f1',
        'accent-hover': '#818cf8',
      }
    },
  },
  plugins: [],
}
