/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0A0F",
        panel: "#14141C",
        line: "#26262F",
        lime: {
          DEFAULT: "#C8FF2E",
          bright: "#DBFF5C",
          dim: "#9DC22A",
        },
        blaze: {
          DEFAULT: "#FF5A1F",
          hot: "#FF6E3D",
        },
        brand: {
          50: "#f7fee7",
          100: "#ecfccb",
          500: "#a3e635",
          600: "#65a30d",
          700: "#4d7c0f",
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
      },
      boxShadow: {
        card: "0 1px 0 rgb(255 255 255 / 0.04), 0 16px 40px -20px rgb(0 0 0 / 0.8)",
        glow: "0 0 28px -6px rgb(200 255 46 / 0.5)",
        glowblaze: "0 0 28px -6px rgb(255 90 31 / 0.55)",
      },
    },
  },
  plugins: [],
};
