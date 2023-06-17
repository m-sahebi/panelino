const { colors, borderRadius, screens } = require("./src/data/theme.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
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
