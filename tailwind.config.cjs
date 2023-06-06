/** @type {import('tailwindcss').Config} */
const { colors, borderRadius, screens } = require("./src/data/theme.js");

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}","!./.next/**/*.{css}"],
  darkMode: "class",
  important: true,
  theme: {
    extend: {
      colors,
      borderRadius,
      screens,
    },
  },
  plugins: [require("tailwind-dark-aware")({})],
};
