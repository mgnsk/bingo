import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // Relative asset URLs, so dist/ works from any path, not only a site root.
  base: "./",
  plugins: [react()],
});
