import { useParams, useNavigate } from 'react-router-dom'
import { blogArticles } from '../data/blog/articles'
import { findArticleBySlug, getRelatedArticles } from '../utils/blog.utils'
import BlogHeader from '../components/blog/BlogHeader'
import BlogMeta from '../components/blog/BlogMeta'
import BlogCTA from '../components/blog/BlogCTA'
import SEOHead from '../components/blog/SEOHead'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const article = slug ? findArticleBySlug(blogArticles, slug) : undefined

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-light mb-4">Artigo não encontrado</h1>
          <button
            onClick={() => navigate('/blog')}
            className="btn-primary"
          >
            Voltar ao blog
          </button>
        </div>
      </div>
    )
  }

  const relatedArticles = getRelatedArticles(blogArticles, article)

  return (
    <>
      <SEOHead article={article} />
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark">
        <BlogHeader />
        
        <article className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20">
          {/* Hero Image */}
          <div className="mb-8 rounded-2xl overflow-hidden">
            <img
              src={article.featuredImage}
              alt={article.featuredImageAlt}
              className="w-full h-auto object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-6 leading-tight">
              {article.title}
            </h1>
            <BlogMeta
              author={article.author}
              publishedAt={article.publishedAt}
              updatedAt={article.updatedAt}
              readingTime={article.readingTime}
              category={article.category}
            />
          </header>

          {/* Content */}
          <div className="mb-12">
            <div className="text-light leading-relaxed space-y-6 text-base md:text-lg">
              {article.content}
            </div>
          </div>

          {/* CTA */}
          <BlogCTA
            title={article.cta.title}
            description={article.cta.description}
            buttonText={article.cta.buttonText}
            href="/"
          />

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mt-16 pt-12 border-t border-grey/20">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-light mb-8">
                Artigos Relacionados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedArticles.map((related) => (
                  <div
                    key={related.id}
                    onClick={() => navigate(`/blog/${related.slug}`)}
                    className="cursor-pointer p-6 bg-dark-lighter rounded-xl border border-grey/20 hover:border-primary/50 transition-all"
                  >
                    <h3 className="text-xl font-bold text-light mb-2">{related.title}</h3>
                    <p className="text-light-muted text-sm">{related.excerpt}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </>
  )
}

