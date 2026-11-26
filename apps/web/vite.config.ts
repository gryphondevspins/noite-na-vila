import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // No GitHub Pages o jogo mora numa subpasta; o workflow informa qual.
  base: process.env.BASE_PATH || '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'Noite na Vila',
        short_name: 'Noite na Vila',
        description: 'Assassino, vítima e detetive em um aparelho só.',
        lang: 'pt-BR',
        // Android abre sem nenhuma barra; onde não houver suporte, cai para standalone.
        display: 'fullscreen',
        background_color: '#0b0706',
        theme_color: '#0b0706',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'] },
    }),
  ],
})
