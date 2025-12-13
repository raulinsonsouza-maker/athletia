import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { blogArticles } from '../data/blog/articles'
import { getLatestArticles } from '../utils/blog.utils'
import BlogHeader from '../components/blog/BlogHeader'
import BlogCard from '../components/blog/BlogCard'
import api from '../services/auth.service'

interface BlogArticleFromDB {
  id: string
  slug: string
  title: string
  metaTitle: string
  category: string
  featuredImage: string | null
  featuredImageAlt: string | null
  excerpt: string
  author: string
  publishedAt: string | null
  readingTime: number
  createdAt: string
  updatedAt: string
}

export default function Blog() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Tentar buscar do banco de dados
        const response = await api.get('/blog/artigos')
        if (response.data && response.data.length > 0) {
          // Converter para formato compatível com BlogCard
          const articlesFromDB = response.data.map((article: BlogArticleFromDB) => ({
            id: article.id,
            slug: article.slug,
            title: article.title,
            metaTitle: article.metaTitle,
            category: article.category,
            featuredImage: article.featuredImage || '',
            featuredImageAlt: article.featuredImageAlt || article.title,
            excerpt: article.excerpt,
            author: article.author,
            publishedAt: article.publishedAt || article.createdAt,
            readingTime: article.readingTime,
            updatedAt: article.updatedAt
          }))
          setArticles(articlesFromDB)
        } else {
          // Fallback para artigos estáticos
          setArticles(getLatestArticles(blogArticles))
        }
      } catch (error: any) {
        // Se for erro de rede (backend offline) ou erro silencioso, usar fallback silenciosamente
        const isNetworkError = !error.response || error.isNetworkError
        const isSilent = error.silent === true
        
        if (isNetworkError && isSilent) {
          // Backend offline - usar arquivos estáticos sem mostrar erro
          console.log('Backend offline, usando artigos estáticos')
        } else if (isNetworkError) {
          // Erro de rede não silencioso
          console.warn('Erro de conexão ao buscar artigos do banco')
        } else {
          console.error('Erro ao buscar artigos do banco:', error)
        }
        // Fallback para artigos estáticos
        setArticles(getLatestArticles(blogArticles))
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark">
      <BlogHeader />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-light mb-4">
            Blog AthletIA
          </h1>
          <p className="text-lg md:text-xl text-light-muted max-w-3xl mx-auto">
            Conteúdo sobre treino, saúde, evolução física e qualidade de vida. 
            Aprenda estratégias práticas para acelerar seus resultados.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="spinner h-12 w-12 mx-auto mb-4"></div>
            <p className="text-light-muted text-lg">Carregando artigos...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-light-muted text-lg">Artigos em breve...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {articles.map((article) => (
              <BlogCard
                key={article.id}
                article={article}
                onClick={() => navigate(`/blog/${article.slug}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

