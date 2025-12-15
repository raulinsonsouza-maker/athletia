import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import BlogHeader from '../components/blog/BlogHeader'
import BlogHero from '../components/blog/BlogHero'
import BlogFeaturedGrid from '../components/blog/BlogFeaturedGrid'
import BlogCategoryGrid from '../components/blog/BlogCategoryGrid'
import BlogMostRead from '../components/blog/BlogMostRead'
import BlogPillarContent from '../components/blog/BlogPillarContent'
import BlogCTA from '../components/blog/BlogCTA'
import BlogSEO from '../components/blog/SEOHead'
import api from '../services/auth.service'

interface BlogArticle {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  featuredImage: string | null
  featuredImageAlt: string | null
  excerpt: string
  categoryRelation?: {
    id: string
    name: string
    slug: string
    icon: string | null
  } | null
  authorRelation?: {
    id: string
    name: string
    role: string | null
  } | null
  author?: string
  publishedAt: string | null
  readingTime: number
  viewsCount?: number
  isFeatured?: boolean
  isPillar?: boolean
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  _count?: {
    articles: number
  }
}

interface BlogSettings {
  heroPostId: string | null
  featuredCount: number
  categoriesDisplay: string[]
  globalCtaId: string | null
  blogIntroText: string | null
  globalMetaTitle: string | null
  globalMetaDescription: string | null
  heroPost?: BlogArticle | null
  globalCta?: {
    id: string
    name: string
    type: string
    title: string
    description: string
    buttonText: string
    link: string
  } | null
}

export default function Blog() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [heroPost, setHeroPost] = useState<BlogArticle | null>(null)
  const [featuredArticles, setFeaturedArticles] = useState<BlogArticle[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [mostReadArticles, setMostReadArticles] = useState<BlogArticle[]>([])
  const [pillarArticles, setPillarArticles] = useState<BlogArticle[]>([])
  const [settings, setSettings] = useState<BlogSettings | null>(null)

  useEffect(() => {
    const fetchBlogData = async () => {
      setLoading(true)
      try {
        // Buscar configurações do blog
        const settingsRes = await api.get('/blog/configuracoes').catch(() => ({ data: null }))
        const blogSettings = settingsRes.data

        // Hero post já vem nas configurações (filtrar se não estiver publicado)
        if (blogSettings?.heroPost && blogSettings.heroPost.published && blogSettings.heroPost.status === 'published') {
          setHeroPost(blogSettings.heroPost)
        }

        // Buscar artigos em destaque
        const featuredRes = await api.get(`/blog/featured?limit=${blogSettings?.featuredCount || 3}`)
        setFeaturedArticles(featuredRes.data || [])

        // Buscar categorias (apenas as selecionadas para exibir)
        const categoriesRes = await api.get('/blog/categorias')
        const allCategories = categoriesRes.data || []
        if (blogSettings?.categoriesDisplay && blogSettings.categoriesDisplay.length > 0) {
          const selectedCategories = allCategories.filter((cat: BlogCategory) =>
            blogSettings.categoriesDisplay.includes(cat.id)
          )
          setCategories(selectedCategories)
        } else {
          setCategories(allCategories.slice(0, 6))
        }

        // Buscar mais lidos (ordenados por views_count)
        const allArticlesRes = await api.get('/blog/artigos?limit=6')
        const allArticles = allArticlesRes.data || []
        const sortedByViews = [...allArticles].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
        setMostReadArticles(sortedByViews.slice(0, 6))

        // Buscar artigos pilar
        const pillarRes = await api.get('/blog/pillar?limit=6')
        setPillarArticles(pillarRes.data || [])

        setSettings(blogSettings)
      } catch (error: any) {
        console.error('Erro ao carregar dados do blog:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark">
      <BlogSEO
        article={{
          title: settings?.globalMetaTitle || 'Blog AthletIA | Treino, Saúde e Evolução Física',
          metaDescription: settings?.globalMetaDescription || 'Descubra estratégias práticas de treino, saúde e evolução física. Conteúdo especializado para acelerar seus resultados na academia.',
          metaTitle: settings?.globalMetaTitle || 'Blog AthletIA | Treino, Saúde e Evolução Física'
        }}
      />
      
      <BlogHeader />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
        {loading ? (
          <div className="text-center py-20">
            <div className="spinner h-12 w-12 mx-auto mb-4"></div>
            <p className="text-light-muted text-lg">Carregando blog...</p>
          </div>
        ) : (
          <>
            {/* Intro Text */}
            {settings?.blogIntroText && (
              <div className="mb-12 text-center">
                <p className="text-lg md:text-xl text-light-muted max-w-3xl mx-auto">
                  {settings.blogIntroText}
                </p>
              </div>
            )}

            {/* Hero Editorial */}
            {heroPost && (
              <BlogHero article={heroPost} />
            )}

            {/* Destaques Secundários */}
            {featuredArticles.length > 0 && (
              <BlogFeaturedGrid articles={featuredArticles} />
            )}

            {/* Navegação por Categorias */}
            {categories.length > 0 && (
              <BlogCategoryGrid categories={categories} />
            )}

            {/* Mais Lidos */}
            {mostReadArticles.length > 0 && (
              <BlogMostRead articles={mostReadArticles} />
            )}

            {/* Conteúdos Profundos */}
            {pillarArticles.length > 0 && (
              <BlogPillarContent articles={pillarArticles} />
            )}

            {/* CTA Editorial */}
            {settings?.globalCta && (
              <BlogCTA
                title={settings.globalCta.title}
                description={settings.globalCta.description}
                buttonText={settings.globalCta.buttonText}
                link={settings.globalCta.link}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}
