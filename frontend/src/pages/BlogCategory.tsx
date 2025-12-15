import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import BlogHeader from '../components/blog/BlogHeader'
import BlogBreadcrumb from '../components/blog/BlogBreadcrumb'
import BlogCard from '../components/blog/BlogCard'
import BlogCTA from '../components/blog/BlogCTA'
import SEOHead from '../components/blog/SEOHead'
import api from '../services/auth.service'

interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  introText: string | null
  icon: string | null
  metaTitle: string | null
  metaDescription: string | null
  _count?: {
    articles: number
  }
}

interface BlogArticle {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  featuredImage: string | null
  featuredImageAlt: string | null
  excerpt: string
  categoryRelation?: {
    name: string
    slug: string
  } | null
  authorRelation?: {
    name: string
    role: string | null
  } | null
  author?: string
  publishedAt: string | null
  readingTime: number
  viewsCount?: number
}

interface CategoryPageData {
  id: string
  name: string
  slug: string
  description: string | null
  introText: string | null
  icon: string | null
  metaTitle: string | null
  metaDescription: string | null
  artigos: BlogArticle[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function BlogCategory() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [categoryData, setCategoryData] = useState<CategoryPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchCategory = async () => {
      if (!slug) {
        setError('Slug não fornecido')
        setLoading(false)
        return
      }

      try {
        const response = await api.get(`/blog/categorias/${slug}?page=${currentPage}&limit=12`)
        if (response.data) {
          setCategoryData(response.data)
        } else {
          setError('Categoria não encontrada')
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Categoria não encontrada')
        } else {
          console.error('Erro ao buscar categoria:', err)
          setError('Erro ao carregar categoria')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
  }, [slug, currentPage])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-light-muted">Carregando categoria...</p>
        </div>
      </div>
    )
  }

  if (error || !categoryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-light mb-4">Categoria não encontrada</h1>
          <button
            onClick={() => navigate('/blog')}
            className="btn-primary"
          >
            Voltar ao blog
          </button>
        </div>
      </div>
    )
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: categoryData.name }
  ]

  return (
    <>
      <SEOHead article={{
        slug: categoryData.slug,
        title: categoryData.name,
        metaTitle: categoryData.metaTitle || `${categoryData.name} | Blog AthletIA`,
        metaDescription: categoryData.metaDescription || categoryData.description || `Explore artigos sobre ${categoryData.name.toLowerCase()}`,
        keywords: [categoryData.name.toLowerCase()],
        featuredImage: null,
        publishedAt: new Date().toISOString(),
        author: 'Equipe AthletIA',
        categoryRelation: {
          name: categoryData.name,
          slug: categoryData.slug
        }
      }} />
      
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark">
        <BlogHeader />
        
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
          {/* Breadcrumb */}
          <BlogBreadcrumb items={breadcrumbItems} />

          {/* Header da Categoria */}
          <header className="mb-12">
            {categoryData.icon && (
              <div className="text-6xl mb-4">{categoryData.icon}</div>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-light mb-4">
              {categoryData.name}
            </h1>
            {categoryData.introText && (
              <div 
                className="text-lg md:text-xl text-light-muted max-w-3xl prose prose-invert"
                dangerouslySetInnerHTML={{ __html: categoryData.introText }}
              />
            )}
            {categoryData.description && !categoryData.introText && (
              <p className="text-lg md:text-xl text-light-muted max-w-3xl">
                {categoryData.description}
              </p>
            )}
            {categoryData.pagination.total > 0 && (
              <p className="text-sm text-light-muted mt-4">
                {categoryData.pagination.total} artigo(s) encontrado(s)
              </p>
            )}
          </header>

          {/* Bloco "O que você vai aprender" */}
          {categoryData.introText && (
            <div className="mb-12 p-6 bg-dark-lighter rounded-xl border border-grey/20">
              <h2 className="text-2xl font-display font-bold text-light mb-4">
                O que você vai aprender
              </h2>
              <div 
                className="text-light-muted prose prose-invert"
                dangerouslySetInnerHTML={{ __html: categoryData.introText }}
              />
            </div>
          )}

          {/* Lista de Artigos */}
          {categoryData.artigos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-light-muted text-lg">Nenhum artigo encontrado nesta categoria.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                {categoryData.artigos.map((article) => (
                  <BlogCard
                    key={article.id}
                    article={{
                      ...article,
                      category: article.categoryRelation?.name || 'Geral',
                      featuredImage: article.featuredImage || null,
                      featuredImageAlt: article.featuredImageAlt || article.title || '',
                      author: article.author || article.authorRelation?.name || 'Equipe AthletIA',
                      publishedAt: article.publishedAt || new Date().toISOString(),
                      readingTime: article.readingTime || 5
                    }}
                    onClick={() => navigate(`/blog/${article.slug}`)}
                  />
                ))}
              </div>

              {/* Paginação */}
              {categoryData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-dark border border-grey/30 rounded-lg text-light hover:bg-dark-lighter transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="text-light-muted">
                    Página {currentPage} de {categoryData.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(categoryData.pagination.totalPages, prev + 1))}
                    disabled={currentPage === categoryData.pagination.totalPages}
                    className="px-4 py-2 bg-dark border border-grey/30 rounded-lg text-light hover:bg-dark-lighter transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}

          {/* CTA Contextual */}
          <div className="mt-16">
            <BlogCTA
              title="Pronto para começar?"
              description="Crie seu treino personalizado com IA e acelere seus resultados na academia."
              buttonText="Criar meu treino agora"
              link="/cadastro"
            />
          </div>
        </main>
      </div>
    </>
  )
}
