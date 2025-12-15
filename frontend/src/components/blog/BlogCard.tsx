import { BlogArticle } from '../../types/blog.types'
import BlogMeta from './BlogMeta'
import OptimizedImage from './OptimizedImage'

interface BlogCardProps {
  article: Partial<BlogArticle> & {
    id: string
    slug: string
    title: string
    excerpt: string
    category: string
    readingTime: number
    featuredImage: string | null
    featuredImageAlt?: string | null
    author?: string
    publishedAt?: string | null
  }
  onClick: () => void
}

export default function BlogCard({ article, onClick }: BlogCardProps) {
  return (
    <article
      onClick={onClick}
      className="cursor-pointer bg-dark-lighter rounded-2xl border border-grey/20 overflow-hidden hover:border-primary/50 transition-all hover:scale-[1.02] group"
    >
      {article.featuredImage && (
        <div className="relative aspect-video overflow-hidden bg-dark">
          <OptimizedImage
            src={article.featuredImage}
            alt={article.featuredImageAlt || article.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}
      
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            {article.category}
          </span>
        </div>
        
        <h2 className="text-xl md:text-2xl font-display font-bold text-light group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h2>
        
        <p className="text-light-muted text-sm md:text-base line-clamp-3">
          {article.excerpt}
        </p>
        
        <BlogMeta
          author={article.author || article.authorRelation?.name || 'Equipe AthletIA'}
          publishedAt={article.publishedAt || new Date().toISOString()}
          readingTime={article.readingTime}
          category={article.category}
          compact
        />
      </div>
    </article>
  )
}

