import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import BlogHeader from '../components/blog/BlogHeader'
import BlogBreadcrumb from '../components/blog/BlogBreadcrumb'
import BlogMeta from '../components/blog/BlogMeta'
import BlogPostIndex from '../components/blog/BlogPostIndex'
import BlogContent from '../components/blog/BlogContent'
import BlogCTA from '../components/blog/BlogCTA'
import BlogRelatedPosts from '../components/blog/BlogRelatedPosts'
import SEOHead from '../components/blog/SEOHead'
import OptimizedImage from '../components/blog/OptimizedImage'
import api from '../services/auth.service'

interface BlogArticle {
  id: string
  slug: string
  title: string
  subtitle?: string | null
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
  ctaType?: string | null
  ctaConfig?: {
    id: string
    name: string
    type: string
    title: string
    description: string
    buttonText: string
    link: string
  } | null
  categoryRelation?: {
    id: string
    name: string
    slug: string
  } | null
  authorRelation?: {
    id: string
    name: string
    role: string | null
    avatar: string | null
    bio: string | null
  } | null
  relatedPosts?: Array<{
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
  }>
  published: boolean
  createdAt: string
  updatedAt: string
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [article, setArticle] = useState<BlogArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) {
        setError('Slug não fornecido')
        setLoading(false)
        return
      }

      try {
        const response = await api.get(`/blog/artigos/slug/${slug}`)
        if (response.data) {
          setArticle(response.data)
          
          // Incrementar visualizações
          try {
            await api.post(`/blog/artigos/${slug}/view`)
          } catch (error) {
            console.error('Erro ao incrementar visualizações:', error)
          }
        } else {
          setError('Artigo não encontrado')
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Artigo não encontrado')
        } else {
          console.error('Erro ao buscar artigo:', err)
          setError('Erro ao carregar artigo')
        }
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

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    ...(article.categoryRelation
      ? [{ label: article.categoryRelation.name, href: `/blog/categoria/${article.categoryRelation.slug}` }]
      : []),
    { label: article.title }
  ]

  // Determinar CTA a usar (prioridade: ctaConfig > campos diretos)
  // Todos os CTAs devem levar para o início do onboarding (/)
  const ctaToUse = article.ctaConfig 
    ? {
        ...article.ctaConfig,
        link: '/' // Sempre sobrescrever link para onboarding
      }
    : (article.ctaTitle && article.ctaDescription && article.ctaButtonText
      ? {
          title: article.ctaTitle,
          description: article.ctaDescription,
          buttonText: article.ctaButtonText,
          link: '/' // Sempre para o início do onboarding
        }
      : null)

  return (
    <>
      <SEOHead 
        article={{
          slug: article.slug,
          title: article.title,
          metaTitle: article.metaTitle,
          metaDescription: article.metaDescription,
          keywords: article.keywords,
          featuredImage: article.featuredImage,
          publishedAt: article.publishedAt || article.createdAt,
          updatedAt: article.updatedAt,
          author: article.authorRelation?.name || article.author,
          categoryRelation: article.categoryRelation,
          authorRelation: article.authorRelation
        }}
        breadcrumbItems={breadcrumbItems}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark">
        <BlogHeader />
        
        <article className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20">
          {/* Breadcrumb */}
          <BlogBreadcrumb items={breadcrumbItems} />

          {/* Hero Image */}
          {article.featuredImage && (
            <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl border border-grey/20 bg-dark relative aspect-video max-h-[480px]">
              <OptimizedImage
                src={article.featuredImage}
                alt={article.featuredImageAlt || article.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent"></div>
            </div>
          )}

          {/* Header */}
          <header className="mb-12">
            <div className="mb-6">
              {article.categoryRelation && (
                <span className="inline-block px-5 py-2.5 text-sm font-semibold text-primary uppercase tracking-wide bg-primary/20 border border-primary/30 rounded-full">
                  {article.categoryRelation.name}
                </span>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-light mb-6 leading-tight">
              {article.title}
            </h1>
            
            {article.subtitle && (
              <p className="text-xl md:text-2xl text-light-muted mb-8 font-light leading-relaxed">
                {article.subtitle}
              </p>
            )}
            
            <div className="pb-8 border-b border-grey/20">
              <BlogMeta
                author={article.authorRelation?.name || article.author || 'Equipe AthletIA'}
                authorRole={article.authorRelation?.role || undefined}
                authorAvatar={article.authorRelation?.avatar ? (article.authorRelation.avatar.startsWith('http') ? article.authorRelation.avatar : `${window.location.origin}${article.authorRelation.avatar}`) : undefined}
                publishedAt={article.publishedAt || article.createdAt}
                updatedAt={article.updatedAt}
                readingTime={article.readingTime}
                category={article.categoryRelation?.name || article.category}
                showDate={false}
              />
            </div>
          </header>

          {/* Índice Automático */}
          {article.content && (
            <BlogPostIndex content={article.content} />
          )}

          {/* Content */}
          <div className="mb-12">
            <BlogContent content={article.content} />
          </div>

          {/* CTA Final */}
          {ctaToUse && (
            <div className="mt-16 pt-12 border-t border-grey/20">
              <BlogCTA
                title={ctaToUse.title}
                description={ctaToUse.description}
                buttonText={ctaToUse.buttonText}
                link={ctaToUse.link}
              />
            </div>
          )}

          {/* Related Articles */}
          {article.relatedPosts && article.relatedPosts.length > 0 && (
            <BlogRelatedPosts articles={article.relatedPosts} />
          )}
        </article>
      </div>
    </>
  )
}
