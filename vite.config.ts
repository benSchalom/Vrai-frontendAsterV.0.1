import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    injectRegister: 'auto',

    pwaAssets: {
      disabled: true,
      config: true,
    },

    manifest: false,

    includeAssets: ['favicon.ico', 'manifest.json'],

    workbox: {
      additionalManifestEntries: [
        { url: '/manifest.json', revision: Date.now().toString() }
      ],
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.pathname === '/manifest.json',
          handler: 'CacheFirst',
          options: {
            cacheName: 'manifest-cache',
          }
        }
      ],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      navigateFallback: '/index.html',
      navigateFallbackDenylist: [/^\/api/],
    },

    devOptions: {
      enabled: true,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],

  server: {
    host: true, // Pour le --host
    allowedHosts: [
      '.dev'
    ]
  },

})