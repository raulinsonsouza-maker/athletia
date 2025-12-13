import { BlogArticle } from '../types/blog.types'

/**
 * Gera slug a partir de uma string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Formata data para exibição
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Calcula tempo de leitura baseado no conteúdo
 */
export function calculateReadingTime(content: string | { toString(): string }): number {
  let text = ''
  
  if (typeof content === 'string') {
    text = content
  } else {
    // Extrai texto de ReactNode (aproximação)
    text = content.toString()
  }
  
  const wordsPerMinute = 200
  const words = text.split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  
  return Math.max(1, minutes)
}

/**
 * Encontra artigo por slug
 */
export function findArticleBySlug(articles: BlogArticle[], slug: string): BlogArticle | undefined {
  return articles.find(article => article.slug === slug)
}

/**
 * Obtém artigos relacionados (mesma categoria, excluindo o atual)
 */
export function getRelatedArticles(
  articles: BlogArticle[],
  currentArticle: BlogArticle,
  limit: number = 3
): BlogArticle[] {
  return articles
    .filter(article => 
      article.id !== currentArticle.id && 
      article.category === currentArticle.category
    )
    .slice(0, limit)
}

/**
 * Obtém artigos mais recentes
 */
export function getLatestArticles(articles: BlogArticle[], limit: number = 6): BlogArticle[] {
  return [...articles]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit)
}

/**
 * Obtém artigos por categoria
 */
export function getArticlesByCategory(articles: BlogArticle[], category: string): BlogArticle[] {
  return articles.filter(article => article.category === category)
}

