import { borderRadius, colors, fontFamily, screens } from "./src/data/theme.mjs";

/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  important: "#app",
  theme: {
    extend: {
      colors,
      borderRadius,
      screens,
      fontFamily,
      lineHeight: {
        "0": "0rem",
      },
    },
  },
  plugins: [require("tailwind-dark-aware")({})],
};

export default config;
