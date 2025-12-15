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
    <section className="mt-16 md:mt-24">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-2">
          Artigos Relacionados
        </h2>
        <p className="text-light-muted">
          Continue explorando conteúdo relevante
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {articles.map((article) => (
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
    </section>
  )
}
