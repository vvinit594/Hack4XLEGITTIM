import path from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Dev/preview: proxy to BedPulse FastAPI (avoids CORS + localhost IPv6 issues). */
const bedpulseProxy = {
  "/bedpulse": {
    target: "http://127.0.0.1:8001",
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/bedpulse/, "") || "/",
  },
  "/api": {
    target: "http://127.0.0.1:3001",
    changeOrigin: true,
  },
} as const

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: { ...bedpulseProxy },
  },
  preview: {
    proxy: { ...bedpulseProxy },
  },
})
