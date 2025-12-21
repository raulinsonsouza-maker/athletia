/**
 * Plugin Vite para tornar CSS não bloqueante
 * Transforma <link rel="stylesheet"> em carregamento assíncrono
 * Usa a técnica media="print" + onload para carregar CSS sem bloquear renderização
 */

import type { Plugin } from 'vite'

export function cssNonBlocking(): Plugin {
  return {
    name: 'css-non-blocking',
    transformIndexHtml: {
      order: 'post',
      handler(html: string, ctx) {
        // Apenas em produção (build)
        if (ctx.server) {
          return html
        }
        
        // Transformar todos os links de CSS para carregamento não bloqueante
        return html.replace(
          /<link([^>]*rel=["']stylesheet["'][^>]*)>/gi,
          (match, attrs) => {
            // Verificar se já tem media ou onload (não modificar se já estiver otimizado)
            if (attrs.includes('media=') || attrs.includes('onload=')) {
              return match
            }
            
            // Adicionar media="print" e onload para trocar para "all" após carregar
            // Isso faz o CSS carregar de forma não bloqueante
            // O navegador baixa o CSS mas não bloqueia renderização porque media="print"
            const newAttrs = attrs.replace(
              /(rel=["']stylesheet["'])/,
              '$1 media="print" onload="this.media=\'all\'; this.onload=null;"'
            )
            
            // Adicionar noscript fallback para navegadores sem JS
            // Limpar apenas os atributos adicionados, mantendo os originais
            const cleanAttrs = attrs
            const linkTag = `<link${newAttrs}>`
            const noscriptTag = `<noscript><link${cleanAttrs}></noscript>`
            
            return linkTag + '\n    ' + noscriptTag
          }
        )
      }
    }
  }
}

