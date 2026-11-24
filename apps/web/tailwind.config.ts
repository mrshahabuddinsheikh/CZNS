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
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        brand: {
          emerald: "#10b981",
          emeraldDark: "#059669",
          gold: "#f59e0b",
          amber: "#d97706",
          blue: "#2563eb",
          purple: "#8b5cf6",
        },
      },
      fontFamily: {
        sans: ["var(--font-primary)", "var(--font-inter)", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        primary: ["var(--font-primary)", "system-ui", "-apple-system", "sans-serif"],
        secondary: ["var(--font-secondary)", "system-ui", "-apple-system", "sans-serif"],
        heading: ["var(--font-secondary)", "var(--font-primary)", "system-ui", "sans-serif"],
        display: ["var(--font-secondary)", "var(--font-primary)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.05)",
        "glass-lg": "0 20px 48px -12px rgba(0, 0, 0, 0.08)",
        "glass-emerald": "0 10px 30px -10px rgba(16, 185, 129, 0.3)",
        "glass-amber": "0 10px 30px -10px rgba(245, 158, 11, 0.3)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "scale-in": "scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
