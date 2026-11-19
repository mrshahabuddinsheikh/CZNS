import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        czns: {
          50: "#f6f7f9",
          100: "#edeef2",
          200: "#d7dbe3",
          300: "#b3bbca",
          400: "#8996ac",
          500: "#697792",
          600: "#535f79",
          700: "#444d63",
          800: "#3b4153",
          900: "#13161c",
          950: "#0b0d11",
        },
        brand: {
          emerald: "#10b981",
          gold: "#f59e0b",
          blue: "#2563eb",
          purple: "#8b5cf6",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
