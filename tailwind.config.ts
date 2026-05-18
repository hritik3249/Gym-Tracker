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
        ink: "#07090d",
        panel: "#10141b",
        panelSoft: "#171d26",
        line: "rgba(255,255,255,0.09)",
        acid: "#b7ff3c",
        mint: "#30e6a1",
        steel: "#9aa6b2",
        ember: "#ff6b35"
      },
      boxShadow: {
        glow: "0 0 60px rgba(183, 255, 60, 0.12)",
        card: "0 18px 70px rgba(0, 0, 0, 0.32)"
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
