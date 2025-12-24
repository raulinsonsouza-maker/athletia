import { useEffect } from 'react'
import { BlogArticle } from '../../types/blog.types'
import { detectFAQBlocks } from '../../utils/blog-seo.utils'

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
    excerpt?: string
    categoryRelation?: {
      id?: string
      name: string
      slug: string
    } | null
    authorRelation?: {
      id?: string
      name: string
      role: string | null
      avatar?: string | null
    } | null
  }
  breadcrumbItems?: Array<{
    label: string
    href?: string
  }>
}

export default function SEOHead({ article, breadcrumbItems }: SEOHeadProps) {
  useEffect(() => {
    // Atualizar title
    document.title = article.metaTitle || article.title || 'Blog AthletIA'

    // Atualizar ou criar meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute('content', article.metaDescription || article.excerpt || '')

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
      tag.setAttribute('content', content || '')
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

    // Schema.org structured data - BlogPosting (mais específico para blogs)
    const blogPostingSchema: any = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.metaDescription,
      image: article.featuredImage ? (article.featuredImage.startsWith('http') ? article.featuredImage : `${window.location.origin}${article.featuredImage}`) : '',
      datePublished: article.publishedAt,
      dateModified: article.updatedAt || article.publishedAt,
      inLanguage: 'pt-BR',
      author: (article as any).authorRelation ? {
        '@type': 'Person',
        name: (article as any).authorRelation.name,
        jobTitle: (article as any).authorRelation.role || undefined,
        image: (article as any).authorRelation.avatar ? ((article as any).authorRelation.avatar.startsWith('http') ? (article as any).authorRelation.avatar : `${window.location.origin}${(article as any).authorRelation.avatar}`) : undefined
      } : {
        '@type': 'Person',
        name: article.author || 'Equipe AthletIA'
      },
      publisher: {
        '@type': 'Organization',
        name: 'AthletIA',
        logo: {
          '@type': 'ImageObject',
          url: `${window.location.origin}/favicon.svg`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${window.location.origin}/blog/${article.slug}`
      }
    }

    // Adicionar keywords como array se disponível
    if (article.keywords && article.keywords.length > 0) {
      blogPostingSchema.keywords = article.keywords
    }

    // Adicionar wordCount se disponível (pode ser calculado no backend)
    if ((article as any).wordCount) {
      blogPostingSchema.wordCount = (article as any).wordCount
    }

    if ((article as any).categoryRelation) {
      blogPostingSchema.articleSection = (article as any).categoryRelation.name
    }

    // Também manter schema Article para compatibilidade
    const articleSchema: any = {
      ...blogPostingSchema,
      '@type': 'Article'
    }

    // Função para remover propriedades undefined
    const cleanSchema = (schema: any): any => {
      const cleaned = { ...schema }
      Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === undefined) {
          delete cleaned[key]
        }
      })
      if (cleaned.author) {
        if (cleaned.author.image === undefined) delete cleaned.author.image
        if (cleaned.author.jobTitle === undefined) delete cleaned.author.jobTitle
        if (cleaned.author.name === undefined) delete cleaned.author
      }
      return cleaned
    }

    const cleanedBlogPostingSchema = cleanSchema(blogPostingSchema)
    const cleanedArticleSchema = cleanSchema(articleSchema)

    // Schema BlogPosting (mais específico)
    let blogPostingScript = document.querySelector('script[type="application/ld+json"][data-blog-posting-schema]')
    if (!blogPostingScript) {
      blogPostingScript = document.createElement('script')
      blogPostingScript.setAttribute('type', 'application/ld+json')
      blogPostingScript.setAttribute('data-blog-posting-schema', 'true')
      document.head.appendChild(blogPostingScript)
    }
    blogPostingScript.textContent = JSON.stringify(cleanedBlogPostingSchema)

    // Schema Article (compatibilidade)
    let articleSchemaScript = document.querySelector('script[type="application/ld+json"][data-article-schema]')
    if (!articleSchemaScript) {
      articleSchemaScript = document.createElement('script')
      articleSchemaScript.setAttribute('type', 'application/ld+json')
      articleSchemaScript.setAttribute('data-article-schema', 'true')
      document.head.appendChild(articleSchemaScript)
    }
    articleSchemaScript.textContent = JSON.stringify(cleanedArticleSchema)

    // Schema.org BreadcrumbList
    if (breadcrumbItems && breadcrumbItems.length > 0) {
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.label,
          item: item.href ? (item.href.startsWith('http') ? item.href : `${window.location.origin}${item.href}`) : window.location.href
        }))
      }

      let breadcrumbScript = document.querySelector('script[type="application/ld+json"][data-breadcrumb-schema]')
      if (!breadcrumbScript) {
        breadcrumbScript = document.createElement('script')
        breadcrumbScript.setAttribute('type', 'application/ld+json')
        breadcrumbScript.setAttribute('data-breadcrumb-schema', 'true')
        document.head.appendChild(breadcrumbScript)
      }
      breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema)
    }

    // Schema.org Organization
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'AthletIA',
      url: window.location.origin,
      logo: `${window.location.origin}/favicon.svg`,
      description: 'Sistema Inteligente de Treinos Personalizados'
    }

    let orgScript = document.querySelector('script[type="application/ld+json"][data-organization-schema]')
    if (!orgScript) {
      orgScript = document.createElement('script')
      orgScript.setAttribute('type', 'application/ld+json')
      orgScript.setAttribute('data-organization-schema', 'true')
      document.head.appendChild(orgScript)
    }
    orgScript.textContent = JSON.stringify(organizationSchema)

    // Keywords meta tag
    if (article.keywords && article.keywords.length > 0) {
      let keywordsTag = document.querySelector('meta[name="keywords"]')
      if (!keywordsTag) {
        keywordsTag = document.createElement('meta')
        keywordsTag.setAttribute('name', 'keywords')
        document.head.appendChild(keywordsTag)
      }
      keywordsTag.setAttribute('content', article.keywords.join(', '))
    }

    // Schema.org FAQPage - detectar se há FAQs no conteúdo
    const content = (article as any).content
    if (content) {
      const faqItems = detectFAQBlocks(content)
      if (faqItems.length > 0) {
        const faqSchema = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer
            }
          }))
        }

        let faqScript = document.querySelector('script[type="application/ld+json"][data-faq-schema]')
        if (!faqScript) {
          faqScript = document.createElement('script')
          faqScript.setAttribute('type', 'application/ld+json')
          faqScript.setAttribute('data-faq-schema', 'true')
          document.head.appendChild(faqScript)
        }
        faqScript.textContent = JSON.stringify(faqSchema)
      } else {
        // Remover schema FAQ se não houver FAQs
        const faqScript = document.querySelector('script[type="application/ld+json"][data-faq-schema]')
        if (faqScript) {
          faqScript.remove()
        }
      }
    }
  }, [article])

  return null
}

