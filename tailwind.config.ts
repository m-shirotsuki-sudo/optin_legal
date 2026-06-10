import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1a1d24",
        "ink-soft": "#4a5160",
        line: "#d8dce4",
        "line-soft": "#eaedf2",
        accent: "#1f5fa8",
        "accent-soft": "#eaf1f9",
        field: "#fffbe8",
        "field-line": "#d9c97a",
      },
    },
  },
  plugins: [],
};

export default config;
