/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0C0A09",
        panel: "#171310",
        line: "#2B221B",
        ember: {
          DEFAULT: "#FF4D2E",
          bright: "#FF7A59",
          dim: "#B4280F",
        },
        gold: {
          DEFAULT: "#FFB800",
          bright: "#FFD34D",
          dim: "#9A6B00",
        },
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410e",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: ["Unbounded", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgb(255 255 255 / 0.05), 0 24px 60px -24px rgb(0 0 0 / 0.9)",
        glow: "0 0 32px -6px rgb(255 77 46 / 0.55)",
        glowgold: "0 0 32px -6px rgb(255 184 0 / 0.5)",
      },
    },
  },
  plugins: [],
};
