import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { blogArticles } from '../data/blog/articles'
import { findArticleBySlug, getRelatedArticles } from '../utils/blog.utils'
import BlogHeader from '../components/blog/BlogHeader'
import BlogMeta from '../components/blog/BlogMeta'
import BlogCTA from '../components/blog/BlogCTA'
import BlogContent from '../components/blog/BlogContent'
import SEOHead from '../components/blog/SEOHead'
import OptimizedImage from '../components/blog/OptimizedImage'
import api from '../services/auth.service'

interface BlogArticleFromDB {
  id: string
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  author: string
  publishedAt: string | null
  readingTime: number
  category: string
  featuredImage: string | null
  featuredImageAlt: string | null
  excerpt: string
  content: string
  ctaTitle: string | null
  ctaDescription: string | null
  ctaButtonText: string | null
  published: boolean
  createdAt: string
  updatedAt: string
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [article, setArticle] = useState<BlogArticleFromDB | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Primeiro tenta buscar do banco de dados, depois fallback para arquivo estático
  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) {
        setError('Slug não fornecido')
        setLoading(false)
        return
      }

      try {
        // Tentar buscar do banco de dados (rota pública - precisa ser criada)
        try {
          const response = await api.get(`/blog/artigos/slug/${slug}`)
          if (response.data) {
            setArticle(response.data)
            setLoading(false)
            return
          }
        } catch (dbError: any) {
          // Se for erro de rede (backend offline) ou erro silencioso, usar fallback silenciosamente
          const isNetworkError = !dbError.response || dbError.isNetworkError
          const isSilent = dbError.silent === true
          
          if (isNetworkError && isSilent) {
            // Backend offline - usar arquivo estático sem mostrar erro
            console.log('Backend offline, usando artigo estático')
          } else if (isNetworkError) {
            // Erro de rede não silencioso
            console.warn('Erro de conexão ao buscar artigo do banco')
          } else if (dbError.response?.status !== 404) {
            // Outros erros (exceto 404) são logados
            console.error('Erro ao buscar artigo do banco:', dbError)
          }
        }

        // Fallback: buscar do arquivo estático
        const staticArticle = findArticleBySlug(blogArticles, slug)
        if (staticArticle) {
          // Converter para formato do banco
          setArticle({
            id: staticArticle.id,
            slug: staticArticle.slug,
            title: staticArticle.title,
            metaTitle: staticArticle.metaTitle,
            metaDescription: staticArticle.metaDescription,
            keywords: staticArticle.keywords,
            author: staticArticle.author,
            publishedAt: staticArticle.publishedAt,
            readingTime: staticArticle.readingTime,
            category: staticArticle.category,
            featuredImage: staticArticle.featuredImage,
            featuredImageAlt: staticArticle.featuredImageAlt,
            excerpt: staticArticle.excerpt,
            content: '', // Conteúdo ReactNode será renderizado separadamente
            ctaTitle: staticArticle.cta?.title || null,
            ctaDescription: staticArticle.cta?.description || null,
            ctaButtonText: staticArticle.cta?.buttonText || null,
            published: true,
            createdAt: staticArticle.publishedAt,
            updatedAt: staticArticle.updatedAt || staticArticle.publishedAt
          })
        } else {
          setError('Artigo não encontrado')
        }
      } catch (err: any) {
        console.error('Erro ao buscar artigo:', err)
        setError('Erro ao carregar artigo')
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-light-muted">Carregando artigo...</p>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-light mb-4">Artigo não encontrado</h1>
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

  // Buscar artigo estático para related articles (temporário até ter API)
  const staticArticle = slug ? findArticleBySlug(blogArticles, slug) : undefined
  const relatedArticles = staticArticle ? getRelatedArticles(blogArticles, staticArticle) : []

  // Converter para formato compatível com SEOHead
  const seoArticle = {
    slug: article.slug,
    title: article.title,
    metaTitle: article.metaTitle,
    metaDescription: article.metaDescription,
    keywords: article.keywords,
    featuredImage: article.featuredImage,
    publishedAt: article.publishedAt || article.createdAt,
    updatedAt: article.updatedAt || undefined,
    author: article.author
  }

  return (
    <>
      <SEOHead article={seoArticle} />
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark">
        <BlogHeader />
        
        <article className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20">
          {/* Hero Image */}
          {article.featuredImage && (
            <div className="mb-10 rounded-2xl overflow-hidden shadow-2xl">
              <OptimizedImage
                src={article.featuredImage}
                alt={article.featuredImageAlt || article.title}
                className="w-full h-auto object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}

          {/* Header */}
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-6 leading-tight">
              {article.title}
            </h1>
            <BlogMeta
              author={article.author}
              publishedAt={article.publishedAt || article.createdAt}
              updatedAt={article.updatedAt || undefined}
              readingTime={article.readingTime}
              category={article.category}
            />
          </header>

          {/* Content */}
          <div className="mb-12">
            {article.content ? (
              <BlogContent content={article.content} />
            ) : (
              // Fallback para conteúdo ReactNode (artigos estáticos antigos)
              staticArticle && typeof staticArticle.content !== 'string' && (
                <div className="blog-content text-light leading-relaxed space-y-6">
                  {staticArticle.content}
                </div>
              )
            )}
          </div>

          {/* CTA */}
          {(article.ctaTitle || article.ctaDescription || article.ctaButtonText) && (
            <BlogCTA
              title={article.ctaTitle || ''}
              description={article.ctaDescription || ''}
              buttonText={article.ctaButtonText || ''}
              href="/"
            />
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mt-16 pt-12 border-t border-grey/20">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-light mb-8">
                Artigos Relacionados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedArticles.map((related) => (
                  <div
                    key={related.id}
                    onClick={() => navigate(`/blog/${related.slug}`)}
                    className="cursor-pointer p-6 bg-dark-lighter rounded-xl border border-grey/20 hover:border-primary/50 transition-all"
                  >
                    <h3 className="text-xl font-bold text-light mb-2">{related.title}</h3>
                    <p className="text-light-muted text-sm">{related.excerpt}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </>
  )
}

