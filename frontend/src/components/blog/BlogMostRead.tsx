import { useNavigate } from 'react-router-dom'
import BlogCard from './BlogCard'

interface BlogMostReadProps {
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
    viewsCount?: number
  }>
}

export default function BlogMostRead({ articles }: BlogMostReadProps) {
  const navigate = useNavigate()

  if (articles.length === 0) return null

  return (
    <section className="mb-16 md:mb-24">
      <div className="mb-10 md:mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Popular</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/50 to-transparent"></div>
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-3">
          Mais Lidos
        </h2>
        <p className="text-lg text-light-muted">
          Os artigos mais populares da comunidade
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {articles.map((article, index) => (
          <div key={article.id} className="relative">
            {index < 3 && (
              <div className="absolute -top-3 -left-3 z-10 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {index + 1}
              </div>
            )}
            <BlogCard
            article={{
              ...article,
              categoryRelation: article.categoryRelation,
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
