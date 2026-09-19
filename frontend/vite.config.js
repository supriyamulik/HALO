import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward /api requests to the FastAPI backend in development.
      // This avoids CORS issues — the browser only ever sees one origin.
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});

