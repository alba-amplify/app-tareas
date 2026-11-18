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
        // Paleta del panel de tareas (blanco roto, tinta y rojo Amplify)
        paprika: { DEFAULT: "#B5402F", dark: "#8f2f22" },
        honeycomb: { DEFAULT: "#E5A657", dark: "#9a6a1f" },
        biscuit: "#EBEBE8", // borde suave
        crumpet: "#F3F3F1", // tinte muy sutil
        cream: "#FAFAF9", // fondo
        ink: "#18181B",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(24,24,27,0.04)",
        card: "0 8px 30px rgba(24,24,27,0.08)",
      },
      fontFamily: {
        sans: ["Geist", "Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
