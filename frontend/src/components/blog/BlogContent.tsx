import { useEffect, useRef } from 'react'

interface BlogContentProps {
  content: string
  className?: string
}

/**
 * Componente para renderizar conteúdo HTML do blog com estilos padronizados
 * Similar ao padrão Befit, mas mantendo o design dark do AthletIA
 */
export default function BlogContent({ content, className = '' }: BlogContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

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
    }

    processSpecialElements()
  }, [content])

  return (
    <div
      ref={contentRef}
      className={`blog-content ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
