import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f0e0d",
        paper: "#f5f0e8",
        paper2: "#ede8dc",
        paper3: "#e4ddd0",
        red: "#e63a2e",
        blue: "#1a6ef5",
        dim: "#7a756e",
      },
      fontFamily: {
        mono: ["'Space Mono'", "monospace"],
        serif: ["'Instrument Serif'", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
