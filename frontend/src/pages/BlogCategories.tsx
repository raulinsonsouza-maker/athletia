import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BlogHeader from '../components/blog/BlogHeader'
import BlogFooter from '../components/blog/BlogFooter'
import BlogBreadcrumb from '../components/blog/BlogBreadcrumb'
import BlogCTA from '../components/blog/BlogCTA'
import SEOHead from '../components/blog/SEOHead'
import OptimizedImage from '../components/blog/OptimizedImage'
import api from '../services/auth.service'

interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  featuredImage: string | null
  _count?: {
    articles: number
  }
}

export default function BlogCategories() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await api.get('/blog/categorias')
        setCategories(response.data || [])
      } catch (error: any) {
        console.error('Erro ao carregar categorias:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: 'Categorias' }
  ]

  return (
    <>
      <SEOHead
        article={{
          slug: 'blog/categorias',
          title: 'Categorias do Blog',
          metaTitle: 'Categorias | Blog AthletIA',
          metaDescription: 'Explore todas as categorias do nosso blog. Encontre conteúdo específico sobre treino, saúde, evolução física e muito mais.',
          keywords: ['categorias', 'blog', 'artigos'],
          featuredImage: null,
          publishedAt: new Date().toISOString(),
          author: 'Equipe AthletIA'
        }}
        breadcrumbItems={breadcrumbItems}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark">
        <BlogHeader />
        
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16">
          {/* Breadcrumb */}
          <div className="mb-6 md:mb-8">
            <BlogBreadcrumb items={breadcrumbItems} />
          </div>

          {/* Header */}
          <header className="mb-12 md:mb-16 text-center">
            <div className="inline-block mb-6">
              <div className="inline-block px-4 py-2 mb-4 bg-primary/10 border border-primary/20 rounded-full">
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Explore</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-light mb-4 leading-tight">
                <span className="bg-gradient-to-r from-light via-light to-primary bg-clip-text text-transparent">
                  Todas as Categorias
                </span>
              </h1>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary"></div>
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary"></div>
              </div>
            </div>
            <p className="text-lg md:text-xl text-light-muted max-w-2xl mx-auto">
              Explore nosso conteúdo organizado por temas e encontre exatamente o que você procura
            </p>
          </header>

          {loading ? (
            <div className="text-center py-20">
              <div className="spinner h-12 w-12 mx-auto mb-4"></div>
              <p className="text-light-muted">Carregando categorias...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-light-muted text-lg">Nenhuma categoria disponível no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => navigate(`/blog/categoria/${category.slug}`)}
                  className="group text-left bg-dark-lighter rounded-2xl border border-grey/20 overflow-hidden hover:border-primary/50 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10"
                >
                  {category.featuredImage ? (
                    <div className="relative aspect-video overflow-hidden bg-dark">
                      <OptimizedImage
                        src={category.featuredImage}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent"></div>
                    </div>
                  ) : (
                    <div className="relative aspect-video bg-gradient-to-br from-primary/20 via-primary/10 to-dark overflow-hidden">
                      {category.icon && (
                        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
                          {category.icon}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      {category.icon && !category.featuredImage && (
                        <div className="text-3xl">{category.icon}</div>
                      )}
                      <h2 className="text-xl md:text-2xl font-display font-bold text-light group-hover:text-primary transition-colors">
                        {category.name}
                      </h2>
                    </div>
                    
                    {category.description && (
                      <p className="text-light-muted text-sm md:text-base line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    
                    {category._count && (
                      <div className="flex items-center gap-2 text-sm text-light-muted pt-2 border-t border-grey/20">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>
                          {category._count.articles} artigo{category._count.articles !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-16">
            <BlogCTA
              title="Pronto para começar?"
              description="Crie seu treino personalizado com IA e acelere seus resultados na academia."
              buttonText="Criar meu treino agora"
              link="/?start=true"
            />
          </div>
        </main>
        
        <BlogFooter categories={categories} />
      </div>
    </>
  )
}

