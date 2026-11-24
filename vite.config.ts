import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { compression } from "vite-plugin-compression2";

// https://vite.dev/config/
export default defineConfig({
  // Relative asset URLs, so dist/ works from any path, not only a site root.
  base: "./",
  plugins: [
    react(),
    compression({
      algorithms: ["gzip", "brotliCompress"],
      threshold: 1024,
    }),
  ],
});
