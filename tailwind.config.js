/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "modal-in": {
          "0%": { opacity: "0", transform: "scale(0.94) translateY(16px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "overlay-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "modal-in": "modal-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "overlay-in": "overlay-in 0.3s ease forwards",
      },
    },
  },
  plugins: [],
};
