// vite.config.js
import { defineConfig } from "file:///C:/Users/T480s/Desktop/camet_erp/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/T480s/Desktop/camet_erp/frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { VitePWA } from "file:///C:/Users/T480s/Desktop/camet_erp/frontend/node_modules/vite-plugin-pwa/dist/index.js";
import dotenv from "file:///C:/Users/T480s/Desktop/camet_erp/frontend/node_modules/dotenv/lib/main.js";
dotenv.config();
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA(
      {
        registerType: "autoUpdate",
        manifest: {
          name: "Camet ERP",
          short_name: "Camet ERP",
          description: "Camet collection app",
          theme_color: "#451952",
          icons: [
            {
              src: "play_store_64.png",
              sizes: "64x64",
              type: "image/png"
            },
            {
              src: "play_store_512.png",
              sizes: "512x512",
              type: "image/png"
            }
          ]
        }
      }
    )
  ],
  resolve: {
    alias: {
      "@": "/src"
      // Ensure alias is set up for '@/'
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxUNDgwc1xcXFxEZXNrdG9wXFxcXGNhbWV0X2VycFxcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcVDQ4MHNcXFxcRGVza3RvcFxcXFxjYW1ldF9lcnBcXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL1Q0ODBzL0Rlc2t0b3AvY2FtZXRfZXJwL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJ1xyXG5cclxuaW1wb3J0IGRvdGVudiBmcm9tICdkb3RlbnYnO1xyXG5cclxuLy8gTG9hZCBlbnZpcm9ubWVudCB2YXJpYWJsZXMgZnJvbSAuZW52IGZpbGVcclxuZG90ZW52LmNvbmZpZygpO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgVml0ZVBXQShcclxuICAgICAgeyBcclxuICAgICAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJywgXHJcbiAgICAgICAgbWFuaWZlc3Q6IHtcclxuICAgICAgICAgIG5hbWU6ICdDYW1ldCBFUlAnLFxyXG4gICAgICAgICAgc2hvcnRfbmFtZTogJ0NhbWV0IEVSUCcsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0NhbWV0IGNvbGxlY3Rpb24gYXBwJyxcclxuICAgICAgICAgIHRoZW1lX2NvbG9yOiAnIzQ1MTk1MicsXHJcbiAgICAgICAgICBpY29uczogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgc3JjOiAncGxheV9zdG9yZV82NC5wbmcnLFxyXG4gICAgICAgICAgICAgIHNpemVzOiAnNjR4NjQnLFxyXG4gICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBzcmM6ICdwbGF5X3N0b3JlXzUxMi5wbmcnLFxyXG4gICAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXHJcbiAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICBdLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdAJzogJy9zcmMnLCAvLyBFbnN1cmUgYWxpYXMgaXMgc2V0IHVwIGZvciAnQC8nXHJcbiAgICB9XHJcbiAgfSxcclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5VCxTQUFTLG9CQUFvQjtBQUN0VixPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBRXhCLE9BQU8sWUFBWTtBQUduQixPQUFPLE9BQU87QUFHZCxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTjtBQUFBLE1BQ0U7QUFBQSxRQUNFLGNBQWM7QUFBQSxRQUNkLFVBQVU7QUFBQSxVQUNSLE1BQU07QUFBQSxVQUNOLFlBQVk7QUFBQSxVQUNaLGFBQWE7QUFBQSxVQUNiLGFBQWE7QUFBQSxVQUNiLE9BQU87QUFBQSxZQUNMO0FBQUEsY0FDRSxLQUFLO0FBQUEsY0FDTCxPQUFPO0FBQUEsY0FDUCxNQUFNO0FBQUEsWUFDUjtBQUFBLFlBQ0E7QUFBQSxjQUNFLEtBQUs7QUFBQSxjQUNMLE9BQU87QUFBQSxjQUNQLE1BQU07QUFBQSxZQUNSO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUs7QUFBQTtBQUFBLElBQ1A7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
