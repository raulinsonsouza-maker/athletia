import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    imagetools({
      defaultDirectives: (url) => {
        // Para imagens PNG/JPG, gerar WebP automaticamente
        if (url.searchParams.has('webp')) {
          return new URLSearchParams({
            format: 'webp',
            quality: '85'
          })
        }
        return new URLSearchParams()
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    // Otimizar imagens durante o build
    assetsInlineLimit: 4096, // Inline imagens pequenas (< 4KB)
    chunkSizeWarningLimit: 600, // Aumentar limite de aviso para 600KB
    rollupOptions: {
      output: {
        // Code splitting manual para reduzir tamanho dos chunks
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'utils': ['axios']
        },
        // Organizar assets por tipo
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && /\.(png|jpe?g|webp|svg|gif)$/.test(assetInfo.name)) {
            return 'images/[name].[hash][extname]'
          }
          return 'assets/[name].[hash][extname]'
        }
      }
    }
  }
})

