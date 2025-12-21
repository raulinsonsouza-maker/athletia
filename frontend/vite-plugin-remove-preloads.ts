/**
 * Plugin Vite para remover preload de chunks não críticos
 * Remove preload de admin-pages, chart-vendor, blog-pages, etc.
 */

import type { Plugin } from 'vite'

export function removeNonCriticalPreloads(): Plugin {
  return {
    name: 'remove-non-critical-preloads',
    transformIndexHtml: {
      order: 'post',
      handler(html: string, ctx) {
        // Apenas em produção (build)
        if (ctx.server) {
          return html
        }
        
        // Remover preload de chunks não críticos para landing page
        const nonCriticalChunks = [
          'admin-pages',
          'chart-vendor',
          'blog-pages',
          'progresso-page'
        ]
        
        let modifiedHtml = html
        
        // Remover preload links para chunks não críticos
        nonCriticalChunks.forEach(chunkName => {
          // Remover preload/modulepreload com o nome do chunk (qualquer formato)
          // Pode ser modulepreload ou preload, e o nome pode estar em href ou no nome do arquivo
          const patterns = [
            // Formato: <link rel="modulepreload" href="/assets/admin-pages-xxx.js">
            new RegExp(`<link[^>]*rel=["']modulepreload["'][^>]*${chunkName}[^>]*>`, 'gi'),
            // Formato: <link rel="preload" as="script" href="/assets/admin-pages-xxx.js">
            new RegExp(`<link[^>]*rel=["']preload["'][^>]*${chunkName}[^>]*>`, 'gi'),
            // Formato com qualquer variação do nome
            new RegExp(`<link[^>]*href=["'][^"']*${chunkName}[^"']*["'][^>]*rel=["'](modulepreload|preload)["'][^>]*>`, 'gi')
          ]
          
          patterns.forEach(regex => {
            modifiedHtml = modifiedHtml.replace(regex, '')
          })
        })
        
        return modifiedHtml
      }
    }
  }
}

