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
    // Desabilitar modulePreload automático para reduzir warnings de preload não usado
    // Usaremos apenas preloads explícitos do index.html (fontes, imagens críticas)
    modulePreload: false,
    // Vite já minifica automaticamente com esbuild (mais rápido que terser)
    rollupOptions: {
      output: {
        // Code splitting manual para reduzir tamanho dos chunks
        manualChunks(id) {
          // CRÍTICO: Excluir componentes admin e chart do bundle da landing
          // Verificar ANTES de qualquer outra lógica para garantir separação
          
          // Componentes e serviços admin - chunk separado (NUNCA incluir na landing)
          if (id.includes('/components/admin/') ||
              id.includes('/components/Admin') ||
              id.includes('/services/admin') ||
              id.includes('/services/grupo-muscular-admin') ||
              id.includes('/services/whatsapp-admin') ||
              id.includes('GrupoMuscularFormModal') ||
              id.includes('GruposMuscularesAdminList') ||
              id.includes('ExerciciosAdminList') ||
              id.includes('AdminHeader') ||
              id.includes('AdminSidebar') ||
              id.includes('/pages/Admin') ||
              id.includes('/pages/AdminBlog') ||
              id.includes('/pages/AdminGrupos') ||
              id.includes('/pages/AdminLogin')) {
            return 'admin-pages'
          }
          
          // Chart.js e componentes relacionados - chunk separado (usado apenas em Progresso/Perfil)
          // IMPORTANTE: Verificar antes de qualquer outra lógica de node_modules
          if (id.includes('chart.js') || 
              id.includes('react-chartjs') || 
              id.includes('chartjs') ||
              id.includes('ChartWrapper') ||
              id.includes('/components/Chart')) {
            return 'chart-vendor'
          }
          
          // Separar página Progresso (usa Chart.js)
          if (id.includes('/pages/Progresso')) {
            return 'progresso-page'
          }
          
          // Separar node_modules em chunks específicos
          if (id.includes('node_modules')) {
            // Chart.js - verificar novamente aqui para garantir (já tratado acima, mas garantir)
            if (id.includes('chart.js') || id.includes('react-chartjs') || id.includes('chartjs')) {
              return 'chart-vendor'
            }
            
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
            
            // Socket.io (usado apenas em algumas páginas, não na landing)
            if (id.includes('socket.io')) {
              return 'socket-vendor'
            }
            
            // Axios (utilitário HTTP - usado em várias páginas, mas pode ser lazy loaded)
            if (id.includes('axios')) {
              return 'utils'
            }
            
            // React Input Mask (usado apenas em algumas páginas)
            if (id.includes('react-input-mask')) {
              return 'utils'
            }
            
            // js-cookie (usado em várias páginas, mas pequeno)
            if (id.includes('js-cookie')) {
              return 'utils'
            }
            
            // Outros node_modules menores
            return 'vendor'
          }
          
          // Separar páginas de blog (não críticas para landing)
          if (id.includes('/pages/Blog')) {
            return 'blog-pages'
          }
          
          // Separar páginas protegidas que não são críticas para landing
          if (id.includes('/pages/Treinos') && !id.includes('/pages/Landing')) {
            return 'treinos-page'
          }
          
          if (id.includes('/pages/TreinoAtual')) {
            return 'treino-atual-page'
          }
          
          if (id.includes('/pages/Historico')) {
            return 'historico-page'
          }
          
          if (id.includes('/pages/Perfil')) {
            return 'perfil-page'
          }
          
          // Landing page e onboarding - chunk próprio (não agrupar com outros)
          // Deixar undefined para Vite criar chunk separado automaticamente
          if (id.includes('/pages/Landing') || 
              id.includes('/components/landing') || 
              id.includes('/components/onboarding')) {
            return undefined
          }
          
          // Retornar undefined para outros arquivos (Vite decide automaticamente)
          return undefined
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

