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
      registerType: 'autoUpdate', // স্বয়ংক্রিয়ভাবে নতুন আপডেট আসলে ব্যাকগ্রাউন্ডে আপডেট হবে
      injectRegister: 'script',
      manifestFilename: 'manifest.json',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'logo.png', 'screenshot-wide.png', 'screenshot-mobile.png'],
      
      // ম্যানিফেস্ট ফাইল - যা মোবাইল বা ডেসকটপে ইনস্টল অপশন যুক্ত করে (বিদ্যায়ন অ্যাপের জন্য)
      manifest: {
        id: '/',
        name: 'বিদ্যায়ন',
        short_name: 'Biddayan',
        description: 'HSC ও SSC পরীক্ষার জন্য বাংলা শিক্ষামূলক প্রস্তুতি প্ল্যাটফর্ম',
        lang: 'bn',
        dir: 'ltr',
        theme_color: '#0F172A',
        background_color: '#FFFFFF',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['education', 'productivity'],
        prefer_related_applications: false,
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '/screenshot-wide.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: '/screenshot-mobile.png',
            sizes: '1080x2400',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      },

      // অফলাইন ও ক্যাশিং কাজ করার জন্য Workbox কনফিগারেশন
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,json}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          // গুগল ফন্টস CSS ক্যাশ করা
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // ১ বছর মেয়াদ
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // ফন্ট ফাইলগুলো ক্যাশ করা
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // ১ বছর মেয়াদ
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // ফায়ারবেস বা ফায়ারস্টোর ডেটা সাময়িকভাবে ক্যাশ করা
          {
            urlPattern: /^https:\/\/(firestore\.googleapis\.com|identitytoolkit\.googleapis\.com)\/.*/i,
            handler: 'NetworkFirst', // প্রথমে ইন্টারনেট ট্রাই করবে, অফলাইনে ক্যাশ দেখাবে
            options: {
              cacheName: 'firebase-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // ১ সপ্তাহ
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // ইমেজ ক্যাশিং
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 60 * 60 * 24 * 30 // ৩০ দিন
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
      }
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
});
