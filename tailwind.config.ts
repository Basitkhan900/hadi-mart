import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF9F5",
        ink: "#1C2421",
        sage: {
          50:  "#F5F7F2",
          100: "#E9EFE4",
          200: "#D3DFC9",
          300: "#B8C9AB",
          400: "#9FB390",
          500: "#7F9670",
          600: "#5E7351",
          700: "#44553B",
          800: "#2F3B29",
          900: "#1D251A",
        },
        earth: {
          light: "#F4EFE6",
          sand:  "#E8DFD0",
          clay:  "#C69B7B",
          dark:  "#3D312A",
        },
        emerald: {
          DEFAULT: "#2D5A43",
          dark:    "#1F3F2E",
          light:   "#D4E7DC",
        },
        amber: {
          sale: "#D97706",
        },
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
        sans:    ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
} satisfies Config;
