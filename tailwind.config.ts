import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Ink — deep charcoal backgrounds, darkest → lightest surface
        ink: {
          900: "#0B0B0C", // app base
          850: "#0F0F11",
          800: "#121214", // raised surface
          750: "#161619", // card
          700: "#1C1C20", // elevated card / input
          600: "#26262C", // hairline-strong / pressed
          500: "#34343C",
        },
        // Lime — the electric accent
        lime: {
          700: "#9FC000",
          600: "#B8E000",
          500: "#D4FF00", // primary accent
          400: "#E0FF4D",
          300: "#ECFF8A",
        },
        // Verify blue — public verification checkmark
        verify: {
          600: "#1488E6",
          500: "#2EA8FF",
          400: "#5DBEFF",
        },
        // Semantic hues
        success: "#41E08B",
        warning: "#FFC53D",
        danger: "#FF5A5A",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-space-grotesk)", "var(--font-manrope)", "system-ui", "sans-serif"],
        mono: ["var(--font-space-mono)", "ui-monospace", "SF Mono", "monospace"],
      },
      borderRadius: {
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "22px",
        xl: "28px",
        "2xl": "36px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.4)",
        card: "0 12px 32px rgba(0, 0, 0, 0.5)",
        md: "0 6px 18px rgba(0, 0, 0, 0.45)",
        lg: "0 18px 44px rgba(0, 0, 0, 0.55)",
        sheet: "0 -16px 48px rgba(0, 0, 0, 0.6)",
        glow: "0 0 0 1px #D4FF00, 0 8px 28px rgba(212,255,0,0.45)",
        "accent-btn": "0 8px 24px rgba(212,255,0,0.4)",
      },
      keyframes: {
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.85)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "pop-in": "pop-in 200ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
