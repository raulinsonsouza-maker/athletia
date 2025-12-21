import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'
import { cssNonBlocking } from './vite-plugin-css-non-blocking'
import { removeNonCriticalPreloads } from './vite-plugin-remove-preloads'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cssNonBlocking(), // CSS não bloqueante - carrega de forma assíncrona
    removeNonCriticalPreloads(), // Remove preload de chunks não críticos
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
    cssMinify: 'esbuild', // Usar esbuild para minificação mais rápida
    minify: 'esbuild', // Minificar JS com esbuild (mais rápido que terser)
    sourcemap: false, // Desabilitar sourcemaps em produção para reduzir tamanho
    reportCompressedSize: false, // Desabilitar relatório de tamanho comprimido (acelera build)
    target: 'es2015', // Suportar navegadores modernos (melhor otimização)
    // Vite já minifica automaticamente com esbuild (mais rápido que terser)
    rollupOptions: {
      output: {
        // Code splitting manual para reduzir tamanho dos chunks
        manualChunks(id) {
          // Separar node_modules em chunks específicos
          if (id.includes('node_modules')) {
            // React core (necessário desde o início)
            if (id.includes('react') && !id.includes('react-router') && !id.includes('react-chartjs') && !id.includes('react-dom')) {
              return 'react-vendor'
            }
            
            // React DOM (necessário desde o início)
            if (id.includes('react-dom')) {
              return 'react-vendor'
            }
            
            // React Router (carregado sob demanda com rotas)
            if (id.includes('react-router')) {
              return 'router-vendor'
            }
            
            // Chart.js (usado apenas em Progresso - NUNCA carregar na landing)
            if (id.includes('chart.js') || id.includes('react-chartjs') || id.includes('chartjs')) {
              return 'chart-vendor'
            }
            
            // Axios (utilitário HTTP - usado em várias páginas)
            if (id.includes('axios')) {
              return 'utils'
            }
            
            // React Input Mask (usado apenas em algumas páginas)
            if (id.includes('react-input-mask')) {
              return 'utils'
            }
            
            // Outros node_modules menores
            return 'vendor'
          }
          
          // Agrupar TODAS as páginas admin em chunk separado (nunca carregar na landing)
          if (id.includes('/pages/Admin') || 
              id.includes('/pages/AdminBlog') || 
              id.includes('/pages/AdminGrupos') ||
              id.includes('/pages/AdminLogin')) {
            return 'admin-pages'
          }
          
          // Separar página Progresso (usa Chart.js)
          if (id.includes('/pages/Progresso')) {
            return 'progresso-page'
          }
          
          // Separar páginas de blog (não críticas para landing)
          if (id.includes('/pages/Blog')) {
            return 'blog-pages'
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

