import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // ── Your own backend: auth / RBAC / data routes ──────────────────────
      // Matches /api/* → http://localhost:8000
      // Handles: /api/v1/auth/*, /api/v1/users/*, /api/v1/research/history etc.
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },

      // ── Teammate's HALO pipeline service ─────────────────────────────────
      // Matches /pipeline-api/* → http://localhost:8001, stripping the prefix.
      // Handles: POST /pipeline-api/research  →  POST /api/v1/research on 8001
      // Run teammate's service with: uvicorn halo.api.app:app --port 8001
      "/pipeline-api": {
        target: "http://localhost:8001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pipeline-api/, "/api/v1"),
      },
    },
  },
});

