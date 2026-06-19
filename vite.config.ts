import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      includeAssets: ['icon-192-v2.png', 'icon-512-v2.png', 'logo.png'],
      manifest: {
        name: 'শিক্ষাঙ্গন',
        short_name: 'Shikkhangon',
        description: 'Bengali Educational Exam Preparation Platform for HSC & SSC',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icon-192-v2.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512-v2.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
});
