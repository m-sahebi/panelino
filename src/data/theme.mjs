// Used in tailwind.config.mjs and other places
export const fontFamily = {
  sans: ["var(--font-sans)"],
};

export const colors = {
  primary: { DEFAULT: "rgb(var(--color-primary) / <alpha-value>)" },
  secondary: { DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)" },
};

export const borderRadius = {
  sm: ".125rem",
  DEFAULT: ".375rem",
  md: ".25rem",
  lg: ".5rem",
  xl: "1rem",
};

export const screens = {
  xs: "319px",
  sm: "576px",
  md: "768px",
  lg: "992px",
  xl: "1200px",
  "2xl": "1600px",
};
