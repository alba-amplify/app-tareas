import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Amplify CRM: lateral cacao, lienzo arena, tarjetas crema.
        // "black" y "white" se redefinen en tonos cálidos para que todas las
        // opacidades (border-black/10, bg-white…) encajen con la paleta.
        black: "#2A1D14",
        white: "#FFFDFA",
        paprika: { DEFAULT: "#A8231D", dark: "#8E1C17", soft: "#FBE9E4" },
        honeycomb: { DEFAULT: "#C08A2E", dark: "#94600F" },
        sun: { DEFAULT: "#F5E27A", soft: "#FBF3C8", ink: "#5C4A00" },
        cacao: { DEFAULT: "#2A1D14", hover: "#3A2A1F", raise: "#46342A" },
        biscuit: "#E6DDD1", // línea / borde
        crumpet: "#F4EEE5", // superficie secundaria (columnas)
        sand: "#ECE3D7", // superficie terciaria
        cream: "#F9F6F0", // fondo de la app
        ink: "#2A1D14",
        muted: "#6B5B50",
        faint: "#9A8A7E",
        good: { DEFAULT: "#3D6B47", soft: "#E1EBDD" },
        warn: { DEFAULT: "#94600F", soft: "#FCF3E1" },
        bad: { DEFAULT: "#A3271F", soft: "#F4DCD8" },
      },
      borderRadius: {
        lg: "10px",
        xl: "14px",
        "2xl": "18px",
        "3xl": "22px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(42,29,20,.05), 0 10px 30px -12px rgba(42,29,20,.14)",
        card: "0 1px 2px rgba(42,29,20,.06), 0 16px 36px -14px rgba(42,29,20,.22)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ['"Inter Tight"', "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
