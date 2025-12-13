import { useNavigate } from 'react-router-dom'
import { blogArticles } from '../data/blog/articles'
import { getLatestArticles } from '../utils/blog.utils'
import BlogHeader from '../components/blog/BlogHeader'
import BlogCard from '../components/blog/BlogCard'

export default function Blog() {
  const navigate = useNavigate()
  const articles = getLatestArticles(blogArticles)

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark">
      <BlogHeader />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-light mb-4">
            Blog AthletIA
          </h1>
          <p className="text-lg md:text-xl text-light-muted max-w-3xl mx-auto">
            Conteúdo sobre treino, saúde, evolução física e qualidade de vida. 
            Aprenda estratégias práticas para acelerar seus resultados.
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-light-muted text-lg">Artigos em breve...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {articles.map((article) => (
              <BlogCard
                key={article.id}
                article={article}
                onClick={() => navigate(`/blog/${article.slug}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

