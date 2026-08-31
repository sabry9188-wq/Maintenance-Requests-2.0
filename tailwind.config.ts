import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },
        neutral: {
          25: "#fcfcfc",
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        status: {
          submitted: "#6b7280",
          received: "#0891b2",
          acknowledged: "#0284c7",
          assigned: "#2563eb",
          scheduled: "#7c3aed",
          inprogress: "#d97706",
          waitingparts: "#b45309",
          waitingexternal: "#a16207",
          onhold: "#78716c",
          completed: "#16a34a",
          pendingconfirmation: "#9333ea",
          closed: "#4b5563",
          rejected: "#b91c1c",
          cancelled: "#6b7280",
          reopened: "#dc2626",
        },
        priority: {
          low: "#16a34a",
          medium: "#d97706",
          high: "#ea580c",
          critical: "#dc2626",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
