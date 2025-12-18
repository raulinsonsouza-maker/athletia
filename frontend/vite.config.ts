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
    chunkSizeWarningLimit: 500, // Limite reduzido após otimizações
    cssCodeSplit: true, // Separar CSS para melhor cache
    cssMinify: true, // Minificar CSS
    // Vite já minifica automaticamente com esbuild (mais rápido que terser)
    rollupOptions: {
      output: {
        // Code splitting manual para reduzir tamanho dos chunks
        manualChunks(id) {
          // Separar node_modules em chunks específicos
          if (id.includes('node_modules')) {
            // React core (necessário desde o início)
            if (id.includes('react') && !id.includes('react-router') && !id.includes('react-chartjs')) {
              return 'react-vendor'
            }
            
            // React Router (carregado sob demanda com rotas)
            if (id.includes('react-router')) {
              return 'router-vendor'
            }
            
            // Chart.js (usado apenas em Progresso)
            if (id.includes('chart.js') || id.includes('react-chartjs')) {
              return 'chart-vendor'
            }
            
            // Axios (utilitário HTTP)
            if (id.includes('axios')) {
              return 'utils'
            }
            
            // Outros node_modules menores
            return 'vendor'
          }
          
          // Agrupar páginas admin em chunk separado
          if (id.includes('/pages/Admin') || id.includes('/pages/AdminBlog') || id.includes('/pages/AdminGrupos')) {
            return 'admin-pages'
          }
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

