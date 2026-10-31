import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6B2737",
          light:   "#8B3A4A",
          dark:    "#4A1A25",
        },
        secondary: {
          DEFAULT: "#B8860B",
          light:   "#D4A017",
        },
        surface: "#FAFAF8",
        muted:   "#F3F0EE",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;