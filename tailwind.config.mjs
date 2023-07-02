import { borderRadius, colors, fontFamily, screens } from "./src/data/theme.mjs";

/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  important: true,
  theme: {
    extend: {
      colors,
      borderRadius,
      screens,
      fontFamily,
    },
  },
  plugins: [require("tailwind-dark-aware")({})],
};

export default config;
