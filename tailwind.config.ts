import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211f",
        forest: "#1f5f4a",
        moss: "#7a9a3d",
        clay: "#b35c38",
        sky: "#4f83a3",
        paper: "#f8f7f3"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(23, 33, 31, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
