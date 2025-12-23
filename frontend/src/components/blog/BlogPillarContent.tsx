import { useNavigate } from 'react-router-dom'
import BlogCard from './BlogCard'

interface BlogPillarContentProps {
  articles: Array<{
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
}

export default function BlogPillarContent({ articles }: BlogPillarContentProps) {
  const navigate = useNavigate()

  if (articles.length === 0) return null

  return (
    <section className="mb-16 md:mb-24">
      <div className="mb-10 md:mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          <div className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Evergreen</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-purple-500/50 to-transparent"></div>
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-3">
          Conteúdos Profundos
        </h2>
        <p className="text-lg text-light-muted">
          Artigos evergreen que permanecem relevantes ao longo do tempo
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {articles.map((article) => (
          <div key={article.id} className="relative">
            <div className="absolute -top-2 -right-2 z-10 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold">
              Pilar
            </div>
            <BlogCard
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
          </div>
        ))}
      </div>
    </section>
  )
}
