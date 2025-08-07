// import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Camet ERP',
        short_name: 'Camet ERP',
        description: 'Camet collection app',
        theme_color: '#451952',
        icons: [
          {
            src: 'play_store_64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'play_store_512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      // FIX: Add workbox configuration to handle your large bundle
      workbox: {
        // Keep default 2MB limit instead of increasing to 6MB
        // Your lazy loading should solve the bundle size issue
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /\.(?:png|gif|jpg|jpeg|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src') // Fix: Use path.resolve for better compatibility
    }
  },
  // ADD: Build optimization with code splitting
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@mui/material', '@emotion/react', '@emotion/styled'], // If you use Material-UI
          // Split your large modules
          'restaurant-pages': [
            './src/pages/Restuarant/Pages/RestaurantDashboard',
            './src/pages/Restuarant/Pages/KotPage', // Your thermal printer page
            './src/pages/Restuarant/Pages/ItemList',
            './src/pages/Restuarant/Pages/ItemRegistration'
          ],
          'hotel-pages': [
            './src/pages/Hotel/Pages/HotelDashboard',
            './src/pages/Hotel/Pages/BookingPage',
            './src/pages/Hotel/Pages/CheckInPage'
          ],
          'voucher-pages': [
            './src/pages/voucher/voucherCreation/voucherInitialPage',
            './src/pages/voucher/voucherDetails/VoucherDetails'
          ],
          'reports-pages': [
            './src/pages/secUsers/Reports',
            './src/pages/voucherReports/PartyStatement/PartyStatement'
          ]
        }
      }
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000 // Increase to 1000KB to avoid warnings
  },
  // OPTIONAL: Add server configuration for development
  server: {
    port: 3000,
    open: true
  }
})
