import { useNavigate } from 'react-router-dom'
import OptimizedImage from './OptimizedImage'
import BlogMeta from './BlogMeta'

interface BlogHeroProps {
  article: {
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
  }
}

export default function BlogHero({ article }: BlogHeroProps) {
  const navigate = useNavigate()

  return (
    <section className="mb-16 md:mb-24">
      <article
        onClick={() => navigate(`/blog/${article.slug}`)}
        className="group cursor-pointer bg-dark-lighter rounded-2xl border border-grey/20 overflow-hidden hover:border-primary/50 transition-all"
      >
        {article.featuredImage && (
          <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-dark">
            <OptimizedImage
              src={article.featuredImage}
              alt={article.featuredImageAlt || article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />
          </div>
        )}
        
        <div className="p-8 md:p-12">
          <div className="mb-4">
            {article.categoryRelation && (
              <span className="inline-block px-4 py-2 text-sm font-semibold text-primary uppercase tracking-wide bg-primary/20 rounded-full">
                {article.categoryRelation.name}
              </span>
            )}
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-light mb-4 group-hover:text-primary transition-colors">
            {article.title}
          </h1>
          
          {article.subtitle && (
            <p className="text-xl md:text-2xl text-light-muted mb-6">
              {article.subtitle}
            </p>
          )}
          
          <p className="text-lg text-light-muted mb-8 line-clamp-3">
            {article.excerpt}
          </p>
          
          <BlogMeta
            author={article.authorRelation?.name || article.author || 'Equipe AthletIA'}
            authorRole={article.authorRelation?.role || undefined}
            authorAvatar={article.authorRelation?.avatar ? (article.authorRelation.avatar.startsWith('http') ? article.authorRelation.avatar : `${window.location.origin}${article.authorRelation.avatar}`) : undefined}
            publishedAt={article.publishedAt || ''}
            readingTime={article.readingTime}
            category={article.categoryRelation?.name}
          />
          
          <button className="mt-8 btn-primary px-8 py-4 text-lg font-semibold">
            Ler Artigo Completo
          </button>
        </div>
      </article>
    </section>
  )
}
