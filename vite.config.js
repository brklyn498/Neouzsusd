import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
      manifest: {
        name: 'NeoUZS',
        short_name: 'NeoUZS',
        description: 'Neobrutalist UZS Exchange Rates',
        theme_color: '#F0F0F0',
        background_color: '#F0F0F0',
        display: 'standalone',
        scope: './',
        start_url: './',
        icons: [
          {
            src: 'icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
      }
    })
  ],
  base: './',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3050',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
