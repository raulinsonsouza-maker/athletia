import { useNavigate } from 'react-router-dom'

interface BlogCategoryGridProps {
  categories: Array<{
    id: string
    name: string
    slug: string
    icon: string | null
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
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-2">
          Explore por Categoria
        </h2>
        <p className="text-light-muted">
          Encontre conteúdo específico sobre o que você precisa
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => navigate(`/blog/categoria/${category.slug}`)}
            className="group p-6 bg-dark-lighter rounded-xl border border-grey/20 hover:border-primary/50 transition-all hover:scale-105 text-center"
          >
            {category.icon && (
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {category.icon}
              </div>
            )}
            <h3 className="text-lg font-display font-bold text-light mb-2 group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            {category._count && (
              <p className="text-sm text-light-muted">
                {category._count.articles} artigo(s)
              </p>
            )}
          </button>
        ))}
      </div>
    </section>
  )
}
