/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0f1117',
        'dark-card': '#1a1f2e',
        'dark-border': '#2d3548',
      },
    },
  },
  plugins: [],
}
