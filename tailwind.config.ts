import type { Config } from "tailwindcss";

// WorkDay design language: clean, light, card-based — a calm Linear/Things hybrid.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}", // badge color classes live in lib/types.ts
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces
        canvas: "#F6F7F9", // subtle gray app background
        card: "#FFFFFF",
        line: "#E7E8EC", // hairline borders
        // Text
        ink: "#1B1C1E", // primary
        subtle: "#5C6066", // secondary
        muted: "#9AA0A6", // tertiary / placeholders
        // Brand accent — calm indigo
        accent: {
          DEFAULT: "#5B5BD6",
          soft: "#EEEEFB",
          dark: "#4A4AC0",
        },
      },
      borderColor: {
        DEFAULT: "#E7E8EC",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      fontSize: {
        // ~13px comfortable base
        base: ["0.8125rem", { lineHeight: "1.25rem" }],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04)",
        pop: "0 8px 28px rgba(16, 24, 40, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
