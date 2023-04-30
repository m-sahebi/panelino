/** @type {import('tailwindcss').Config} */
const { colors, borderRadius, screens } = require('./src/data/theme');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors,
      borderRadius,
      screens,
    },
  },
  plugins: [],
};
