import { useEffect, useState } from 'react'

interface BlogPostIndexProps {
  content: string
}

interface IndexItem {
  id: string
  text: string
  level: number
}

export default function BlogPostIndex({ content }: BlogPostIndexProps) {
  const [indexItems, setIndexItems] = useState<IndexItem[]>([])

  useEffect(() => {
    // Extrair H2 e H3 do conteúdo HTML e atualizar IDs no DOM
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    const headings = doc.querySelectorAll('h2, h3')
    
    const items: IndexItem[] = []
    headings.forEach((heading, index) => {
      const id = `heading-${index}`
      items.push({
        id,
        text: heading.textContent || '',
        level: heading.tagName === 'H2' ? 2 : 3
      })
    })
    
    // Atualizar IDs no DOM real após renderização
    setTimeout(() => {
      const blogContent = document.querySelector('.blog-content')
      if (blogContent) {
        const realHeadings = blogContent.querySelectorAll('h2, h3')
        realHeadings.forEach((heading, index) => {
          if (index < items.length) {
            heading.id = items[index].id
          }
        })
      }
    }, 100)
    
    setIndexItems(items)
  }, [content])

  if (indexItems.length === 0) return null

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="mb-8 p-6 bg-dark-lighter rounded-xl border border-grey/20">
      <h3 className="text-lg font-display font-bold text-light mb-4">
        Índice do Artigo
      </h3>
      <nav className="space-y-2">
        {indexItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToHeading(item.id)}
            className={`block w-full text-left hover:text-primary transition-colors ${
              item.level === 2
                ? 'text-base font-semibold text-light'
                : 'text-sm text-light-muted ml-4'
            }`}
          >
            {item.text}
          </button>
        ))}
      </nav>
    </div>
  )
}
