import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Updates take over on next visit by themselves — no missed prompt
      // can strand a phone on a stale shell ever again.
      registerType: 'autoUpdate',
      cleanupOutdatedCaches: true,
      includeAssets: ['robots.txt', 'sitemap.xml', 'llms.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'PlayTube — after-dark screening room',
        short_name: 'PlayTube',
        description: 'Premieres, live cuts and creator rooms, guarded by email verification.',
        start_url: '/home',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#0C0A09',
        theme_color: '#0C0A09',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: 'index.html',
        // API stays network-only (auth + freshness). Cache shell, fonts, media.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'fonts', expiration: { maxEntries: 20, maxAgeSeconds: 30 * 24 * 3600 } },
          },
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'media',
              expiration: { maxEntries: 120, maxAgeSeconds: 7 * 24 * 3600 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/(picsum\.photos|api\.dicebear\.com)\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'placeholders',
              expiration: { maxEntries: 60, maxAgeSeconds: 7 * 24 * 3600 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
