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
        ink: "#061A10",
        panel: "#0A2318",
        panelSoft: "#0D2B1E",
        line: "rgba(247,244,213,0.09)",
        acid: "#D3968C",
        mint: "#839958",
        steel: "#7a9e6a",
        ember: "#c06050",
        cream: "#F7F4D5",
        midnight: "#105666",
      },
      boxShadow: {
        glow: "0 0 60px rgba(211, 150, 140, 0.15)",
        card: "0 18px 70px rgba(0, 0, 0, 0.50)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-up": "fade-up 240ms ease-out"
      }
    },
  },
  plugins: [],
};

export default config;
