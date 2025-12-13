import { useEffect } from 'react'
import { BlogArticle } from '../../types/blog.types'

interface SEOHeadProps {
  article: BlogArticle | {
    slug: string
    title: string
    metaTitle: string
    metaDescription: string
    keywords: string[]
    featuredImage: string | null
    publishedAt: string
    updatedAt?: string | null
    author: string
  }
}

export default function SEOHead({ article }: SEOHeadProps) {
  useEffect(() => {
    // Atualizar title
    document.title = article.metaTitle

    // Atualizar ou criar meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute('content', article.metaDescription)

    // Open Graph tags
    const ogTags = [
      { property: 'og:title', content: article.metaTitle },
      { property: 'og:description', content: article.metaDescription },
      { property: 'og:image', content: article.featuredImage || '' },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: `${window.location.origin}/blog/${article.slug}` },
    ]

    ogTags.forEach(({ property, content }) => {
      let tag = document.querySelector(`meta[property="${property}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('property', property)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    })

    // Twitter Card tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: article.metaTitle },
      { name: 'twitter:description', content: article.metaDescription },
      { name: 'twitter:image', content: article.featuredImage },
    ]

    twitterTags.forEach(({ name, content }) => {
      let tag = document.querySelector(`meta[name="${name}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', name)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content || '')
    })

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    const canonicalUrl = article.slug ? `${window.location.origin}/blog/${article.slug}` : window.location.href
    canonical.setAttribute('href', canonicalUrl)

    // Schema.org structured data
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.metaDescription,
      image: article.featuredImage || '',
      datePublished: article.publishedAt,
      dateModified: article.updatedAt || article.publishedAt,
      author: {
        '@type': 'Person',
        name: article.author
      },
      publisher: {
        '@type': 'Organization',
        name: 'AthletIA',
        logo: {
          '@type': 'ImageObject',
          url: `${window.location.origin}/favicon.svg`
        }
      }
    }

    let schemaScript = document.querySelector('script[type="application/ld+json"][data-article-schema]')
    if (!schemaScript) {
      schemaScript = document.createElement('script')
      schemaScript.setAttribute('type', 'application/ld+json')
      schemaScript.setAttribute('data-article-schema', 'true')
      document.head.appendChild(schemaScript)
    }
    schemaScript.textContent = JSON.stringify(schema)

    // Keywords meta tag
    if (article.keywords.length > 0) {
      let keywordsTag = document.querySelector('meta[name="keywords"]')
      if (!keywordsTag) {
        keywordsTag = document.createElement('meta')
        keywordsTag.setAttribute('name', 'keywords')
        document.head.appendChild(keywordsTag)
      }
      keywordsTag.setAttribute('content', article.keywords.join(', '))
    }
  }, [article])

  return null
}

