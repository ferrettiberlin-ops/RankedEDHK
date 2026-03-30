/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1f2937',
        secondary: '#3b82f6',
        accent: '#f97316',
      },
    },
  },
  plugins: [],
};
