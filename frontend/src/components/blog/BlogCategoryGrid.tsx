import { useNavigate } from 'react-router-dom'
import OptimizedImage from './OptimizedImage'

interface BlogCategoryGridProps {
  categories: Array<{
    id: string
    name: string
    slug: string
    icon: string | null
    featuredImage: string | null
    description: string | null
    _count?: {
      articles: number
    }
  }>
}

export default function BlogCategoryGrid({ categories }: BlogCategoryGridProps) {
  const navigate = useNavigate()

  if (categories.length === 0) return null

  return (
    <section className="mb-16 md:mb-24">
      <div className="mb-10 md:mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Categorias</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/50 to-transparent"></div>
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-3">
          Explore por Categoria
        </h2>
        <p className="text-lg text-light-muted">
          Encontre conteúdo específico sobre o que você precisa
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => navigate(`/blog/categoria/${category.slug}`)}
            className="group bg-dark-lighter rounded-xl border border-grey/20 hover:border-primary/50 transition-all hover:scale-105 overflow-hidden flex flex-col"
          >
            {category.featuredImage ? (
              <div className="relative aspect-video overflow-hidden bg-dark">
                <OptimizedImage
                  src={category.featuredImage}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ) : category.icon ? (
              <div className="p-6 pb-3">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
              </div>
            ) : null}
            <div className="p-6 pt-3 text-center flex-1 flex flex-col justify-center">
              <h3 className="text-lg font-display font-bold text-light mb-2 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              {category._count && (
                <p className="text-sm text-light-muted">
                  {category._count.articles} artigo(s)
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
