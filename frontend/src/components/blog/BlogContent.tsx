import { useEffect, useRef, useState } from 'react'
import { processHeadings, processLinks } from '../../utils/blog-seo.utils'

interface BlogContentProps {
  content: string
  className?: string
}

/**
 * Componente para renderizar conteúdo HTML do blog com estilos padronizados
 * Similar ao padrão Befit, mas mantendo o design dark do AthletIA
 * Inclui processamento SEO: hierarquia de headings, links, FAQs
 */
export default function BlogContent({ content, className = '' }: BlogContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [processedContent, setProcessedContent] = useState<string>(content)

  useEffect(() => {
    // Processar conteúdo HTML antes de renderizar
    let processed = content
    
    // 1. Validar e corrigir hierarquia de headings
    processed = processHeadings(processed)
    
    // 2. Processar links (adicionar rel="noopener" para externos, validar âncoras)
    const siteOrigin = window.location.origin
    processed = processLinks(processed, siteOrigin)
    
    setProcessedContent(processed)
  }, [content])

  useEffect(() => {
    if (!contentRef.current) return

    // Processar elementos especiais do conteúdo HTML
    const processSpecialElements = () => {
      // Processar cards de exercícios
      const exerciseCards = contentRef.current?.querySelectorAll('.exercise-card')
      exerciseCards?.forEach((card) => {
        card.classList.add('blog-exercise-card')
      })

      // Processar boxes de dicas
      const tipBoxes = contentRef.current?.querySelectorAll('.tip-box')
      tipBoxes?.forEach((box) => {
        box.classList.add('blog-tip-box')
      })

      // Processar boxes de locais
      const locationBoxes = contentRef.current?.querySelectorAll('.location-box')
      locationBoxes?.forEach((box) => {
        box.classList.add('blog-location-box')
      })

      // Processar blocos especiais
      const highlightBoxes = contentRef.current?.querySelectorAll('.blog-highlight, [data-block="highlight"]')
      highlightBoxes?.forEach((box) => {
        box.classList.add('blog-highlight-box')
      })

      const alertBoxes = contentRef.current?.querySelectorAll('.blog-alert, [data-block="alert"]')
      alertBoxes?.forEach((box) => {
        box.classList.add('blog-alert-box')
      })

      const scienceBoxes = contentRef.current?.querySelectorAll('.blog-science, [data-block="science"]')
      scienceBoxes?.forEach((box) => {
        box.classList.add('blog-science-box')
      })

      const errorBoxes = contentRef.current?.querySelectorAll('.blog-error, [data-block="error"]')
      errorBoxes?.forEach((box) => {
        box.classList.add('blog-error-box')
      })

      // Processar parágrafos introdutórios
      const introParagraphs = contentRef.current?.querySelectorAll('p.intro')
      introParagraphs?.forEach((p) => {
        p.classList.add('blog-intro')
      })

      // Processar blocos FAQ
      const faqItems = contentRef.current?.querySelectorAll('.faq-item, [data-faq]')
      faqItems?.forEach((item) => {
        item.setAttribute('itemscope', '')
        item.setAttribute('itemtype', 'https://schema.org/Question')
        
        const questionEl = item.querySelector('.faq-question, [data-question], h3, h4')
        const answerEl = item.querySelector('.faq-answer, [data-answer], p')
        
        if (questionEl) {
          questionEl.setAttribute('itemprop', 'name')
        }
        if (answerEl) {
          answerEl.setAttribute('itemscope', '')
          answerEl.setAttribute('itemtype', 'https://schema.org/Answer')
          const textEl = answerEl.querySelector('p') || answerEl
          textEl.setAttribute('itemprop', 'text')
        }
      })

      // Processar blocos de definição
      const definitions = contentRef.current?.querySelectorAll('.definition, [data-definition]')
      definitions?.forEach((def) => {
        def.setAttribute('itemscope', '')
        def.setAttribute('itemtype', 'https://schema.org/DefinedTerm')
      })

      // Processar imagens no conteúdo - garantir loading="lazy" e atributos otimizados
      const images = contentRef.current?.querySelectorAll('img')
      images?.forEach((img) => {
        // Imagens no conteúdo devem ter loading="lazy" (a featured image já tem loading="eager")
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy')
        }
        // Adicionar decoding="async" para melhor performance
        if (!img.hasAttribute('decoding')) {
          img.setAttribute('decoding', 'async')
        }
        // Garantir que imagens tenham alt text
        if (!img.hasAttribute('alt') || img.getAttribute('alt') === '') {
          img.setAttribute('alt', 'Imagem do artigo')
        }
      })
    }

    processSpecialElements()
  }, [processedContent])

  return (
    <div
      ref={contentRef}
      className={`blog-content ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
}
