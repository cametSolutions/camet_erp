import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA(
      { 
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
        }
      })
  ],
  resolve: {
    alias: {
      '@': '/src', // Ensure alias is set up for '@/'
    }
  },
})
