import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base: "./"` keeps asset paths relative so the build works on
// Netlify, Vercel and GitHub Pages (including project sub-paths).
export default defineConfig({
  plugins: [react()],
  base: "./",
});
