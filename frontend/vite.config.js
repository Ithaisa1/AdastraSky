import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// App instalable y usable sin cobertura (miradores y observatorios suelen no tenerla).
// - La interfaz se guarda al instalar; se actualiza sola en cuanto hay una versión nueva.
// - Las consultas GET a la API se sirven de la red y, si no hay red, de la última copia.
// - Del mapa de GRAFCAN solo se guardan las teselas ya vistas (sin descargas masivas).
const pwa = VitePWA({
  registerType: "autoUpdate",
  includeAssets: ["favicon.png", "apple-touch-icon.png"],
  manifest: {
    name: "AdAstra Sky",
    short_name: "AdAstra",
    description: "Astroturismo y observación del cielo en Canarias",
    lang: "es",
    start_url: "/",
    display: "standalone",
    background_color: "#060b16",
    theme_color: "#060b16",
    icons: [
      { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
      { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
      { src: "pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  },
  workbox: {
    globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
    maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    skipWaiting: true,
    navigateFallbackDenylist: [/^\/api\//, /^\/media\//],
    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.destination === "image" && /\.(jpe?g|webp)$/i.test(new URL(request.url).pathname),
        handler: "CacheFirst",
        options: { cacheName: "images", expiration: { maxEntries: 80, maxAgeSeconds: 30 * 24 * 3600 } },
      },
      {
        urlPattern: ({ url, request }) => request.method === "GET" && url.pathname.startsWith("/api/"),
        handler: "NetworkFirst",
        options: { cacheName: "api", networkTimeoutSeconds: 6, expiration: { maxEntries: 60, maxAgeSeconds: 3 * 24 * 3600 } },
      },
      {
        urlPattern: ({ url }) => url.hostname.endsWith("grafcan.es"),
        handler: "StaleWhileRevalidate",
        options: { cacheName: "map-tiles", expiration: { maxEntries: 300, maxAgeSeconds: 7 * 24 * 3600 } },
      },
    ],
  },
});

export default defineConfig({
  plugins: [react(), pwa],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.js"],
  },
});
