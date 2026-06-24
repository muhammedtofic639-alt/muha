import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          400: "#627d98",
          600: "#334e68",
          800: "#1e293b",
          900: "#0f172a",
          950: "#0a0f1c",
        },
        gold: {
          50: "#fff8e1",
          100: "#ffecb3",
          400: "#f6c343",
          500: "#f2a900",
          600: "#d18f00",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 30px -10px rgba(15, 23, 42, 0.25)",
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
