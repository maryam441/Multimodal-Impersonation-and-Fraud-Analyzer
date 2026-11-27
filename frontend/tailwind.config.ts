import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        enterprise: {
          950: "#050811", // Ultra-deep obsidian
          900: "#090d1a", // Deep navy foundation
          850: "#0d1326", // Card background
          800: "#131b33", // Elevated surface
          700: "#1e294b", // Border default
          600: "#2d3a66", // Subtle border
          blue: "#2563eb", // Executive cobalt
          cobalt: "#3b82f6",
          cyan: "#0284c7",
          sky: "#38bdf8",
          emerald: "#059669",
          mint: "#10b981",
          amber: "#d97706",
          crimson: "#dc2626",
          slate: "#64748b",
        },
        forensic: {
          dark: "#070a13",
          card: "#0c1120",
          border: "#182238",
          cyan: "#38bdf8",
          emerald: "#10b981",
          amber: "#f59e0b",
          crimson: "#ef4444",
          slate: "#475569",
        },
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
        sans: ["var(--font-geist-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.02)" },
        },
        "radar-sweep": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "shimmer-sweep": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "pulse-subtle": "pulse-subtle 3s ease-in-out infinite",
        "radar-sweep": "radar-sweep 8s linear infinite",
        "shimmer": "shimmer-sweep 2.5s infinite linear",
      },
      boxShadow: {
        "formal-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
        "formal-md": "0 4px 16px -2px rgba(5, 8, 17, 0.7), 0 2px 6px -2px rgba(0, 0, 0, 0.4)",
        "formal-lg": "0 10px 30px -4px rgba(5, 8, 17, 0.8), 0 4px 12px -2px rgba(0, 0, 0, 0.5)",
        "cobalt-glow": "0 0 20px -3px rgba(37, 99, 235, 0.25)",
        "crimson-glow": "0 0 20px -3px rgba(220, 38, 38, 0.3)",
      },
    },
  },
  plugins: [],
} satisfies Config;
