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
      avatar: string | null
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
        className="group cursor-pointer bg-dark-lighter rounded-3xl border border-grey/20 overflow-hidden hover:border-primary/50 transition-all shadow-xl hover:shadow-2xl hover:shadow-primary/10"
      >
        {article.featuredImage && (
          <div className="relative w-full aspect-video max-h-[480px] overflow-hidden bg-dark">
            <OptimizedImage
              src={article.featuredImage}
              alt={article.featuredImageAlt || article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" />
            <div className="absolute top-4 left-4">
              {article.categoryRelation && (
                <span className="inline-block px-4 py-2 text-sm font-semibold text-primary uppercase tracking-wide bg-dark/90 backdrop-blur-sm border border-primary/30 rounded-full shadow-lg">
                  {article.categoryRelation.name}
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="p-8 md:p-12 lg:p-16">
          {!article.featuredImage && (
            <div className="mb-4">
              {article.categoryRelation && (
                <span className="inline-block px-4 py-2 text-sm font-semibold text-primary uppercase tracking-wide bg-primary/20 rounded-full">
                  {article.categoryRelation.name}
                </span>
              )}
            </div>
          )}
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-light mb-4 group-hover:text-primary transition-colors leading-tight">
            {article.title}
          </h1>
          
          {article.subtitle && (
            <p className="text-xl md:text-2xl text-light-muted mb-6 font-light">
              {article.subtitle}
            </p>
          )}
          
          <p className="text-lg md:text-xl text-light-muted mb-8 line-clamp-3 leading-relaxed">
            {article.excerpt}
          </p>
          
          <BlogMeta
            author={article.authorRelation?.name || article.author || 'Equipe AthletIA'}
            authorRole={article.authorRelation?.role || undefined}
            authorAvatar={article.authorRelation?.avatar ? (article.authorRelation.avatar.startsWith('http') ? article.authorRelation.avatar : `${window.location.origin}${article.authorRelation.avatar}`) : undefined}
            publishedAt={article.publishedAt || ''}
            readingTime={article.readingTime}
            category={article.categoryRelation?.name}
            showDate={false}
          />
          
          <button className="mt-8 btn-primary px-8 py-4 text-lg font-semibold group-hover:scale-105 transition-transform">
            Ler Artigo Completo
            <svg className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </article>
    </section>
  )
}
