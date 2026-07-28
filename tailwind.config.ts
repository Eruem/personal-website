import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: "0px",
      },
      fontFamily: {
        serif: ["Playfair Display", "Times New Roman", "serif"],
        body: ["Lora", "Georgia", "serif"],
        sans: ["Inter", "Helvetica Neue", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
      colors: {
        newsprint: {
          bg: "#F9F9F7",
          ink: "#111111",
          muted: "#E5E5E0",
          red: "#CC0000",
        },
      },
    },
  },
  plugins: [],
};

export default config;
