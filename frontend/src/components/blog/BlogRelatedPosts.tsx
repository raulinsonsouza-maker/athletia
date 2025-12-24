import { useNavigate } from 'react-router-dom'
import BlogCard from './BlogCard'

interface BlogRelatedPostsProps {
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

export default function BlogRelatedPosts({ articles }: BlogRelatedPostsProps) {
  const navigate = useNavigate()

  if (articles.length === 0) return null

  return (
    <section className="mt-16 md:mt-24 relative">
      {/* Background decorative element */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="mb-10 md:mb-12 text-center">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/50"></div>
          <div className="px-5 py-2 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 rounded-full backdrop-blur-sm">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Continue Explorando</span>
          </div>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/50"></div>
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-4">
          <span className="bg-gradient-to-r from-light via-light to-primary bg-clip-text text-transparent">
            Artigos Relacionados
          </span>
        </h2>
        <p className="text-lg md:text-xl text-light-muted max-w-2xl mx-auto leading-relaxed">
          Continue sua jornada de conhecimento com conteúdo cuidadosamente selecionado para você
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {articles.map((article, index) => (
          <div
            key={article.id}
            className="transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
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
