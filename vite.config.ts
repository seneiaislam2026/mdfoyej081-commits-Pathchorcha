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
      includeAssets: ['icon-192-v2.png', 'icon-512-v2.png', 'logo.png', 'manifest.json'],
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
            src: 'https://i.ibb.co/5WR6skVX/file-000000004c047209a4e27202c54ddd8d-1.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://i.ibb.co/5WR6skVX/file-000000004c047209a4e27202c54ddd8d-1.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      }
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
});
