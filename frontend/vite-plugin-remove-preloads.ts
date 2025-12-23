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
        
        // Remover TODOS os modulepreload que não são do chunk principal (index/main)
        // O Vite gera modulepreload para todos os chunks, mas só precisamos do principal
        modifiedHtml = modifiedHtml.replace(
          /<link[^>]*rel=["']modulepreload["'][^>]*>/gi,
          (match) => {
            // Manter apenas se for o chunk principal (index.js ou main chunk)
            const href = match.match(/href=["']([^"']+)["']/)?.[1] || ''
            const isMainChunk = href.includes('index-') || href.includes('main-') || href.match(/\/assets\/index-[^"']+\.js/)
            return isMainChunk ? match : ''
          }
        )
        
        // Remover preloads de script que não são críticos
        // Manter apenas preloads explícitos do index.html (fontes, imagens críticas)
        modifiedHtml = modifiedHtml.replace(
          /<link[^>]*rel=["']preload["'][^>]*>/gi,
          (match) => {
            // Manter preloads de fontes e imagens (definidos manualmente no index.html)
            if (match.includes('as="font"') || match.includes('as="image"') || match.includes('type="font/woff2"')) {
              return match
            }
            // Remover preloads de scripts/chunks (Vite gera automaticamente, mas não são críticos)
            if (match.includes('as="script"')) {
              return ''
            }
            // Manter outros preloads explícitos (CSS crítico, etc)
            return match
          }
        )
        
        return modifiedHtml
      }
    }
  }
}

