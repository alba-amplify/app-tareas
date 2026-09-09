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
        // Paleta Amplify (minimalista)
        paprika: { DEFAULT: "#B53324", dark: "#8f2419" },
        honeycomb: { DEFAULT: "#E5A657", dark: "#9a6a1f" },
        biscuit: "#E8E2D8", // borde suave
        crumpet: "#F4EFE8", // tinte muy sutil
        cream: "#FAF8F3", // fondo crema casi blanco
        ink: "#2a2320",
      },
      boxShadow: {
        soft: "0 1px 3px rgba(42,35,32,0.06), 0 1px 2px rgba(42,35,32,0.04)",
        card: "0 4px 20px rgba(42,35,32,0.06)",
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
