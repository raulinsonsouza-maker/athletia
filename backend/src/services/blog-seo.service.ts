import { BlogArticle, BlogCategory, BlogAuthor } from '@prisma/client';

/**
 * Gera Schema.org Article para um post do blog
 */
export function generateArticleSchema(
  article: BlogArticle & {
    categoryRelation?: BlogCategory | null;
    authorRelation?: BlogAuthor | null;
  },
  baseUrl: string = 'https://athletia.site'
): object {
  const articleUrl = `${baseUrl}/blog/${article.slug}`;
  const imageUrl = article.featuredImage 
    ? (article.featuredImage.startsWith('http') ? article.featuredImage : `${baseUrl}${article.featuredImage}`)
    : undefined;

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription || article.excerpt,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: article.authorRelation
      ? {
          '@type': 'Person',
          name: article.authorRelation.name,
          jobTitle: article.authorRelation.role || undefined,
          image: article.authorRelation.avatar
            ? (article.authorRelation.avatar.startsWith('http')
                ? article.authorRelation.avatar
                : `${baseUrl}${article.authorRelation.avatar}`)
            : undefined,
          url: article.authorRelation.externalLink || undefined
        }
      : {
          '@type': 'Organization',
          name: article.author || 'Equipe AthletIA'
        },
    publisher: {
      '@type': 'Organization',
      name: 'AthletIA',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl
    }
  };

  if (article.categoryRelation) {
    schema.articleSection = article.categoryRelation.name;
  }

  // Remover propriedades undefined
  Object.keys(schema).forEach(key => {
    if (schema[key] === undefined) {
      delete schema[key];
    }
  });

  return schema;
}

/**
 * Gera Schema.org BreadcrumbList para navegação
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  baseUrl: string = 'https://athletia.site'
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };
}

/**
 * Gera Schema.org Organization
 */
export function generateOrganizationSchema(
  baseUrl: string = 'https://athletia.site'
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AthletIA',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Sistema Inteligente de Treinos Personalizados',
    sameAs: [
      // Adicionar redes sociais se houver
    ]
  };
}

/**
 * Gera Schema.org Person para autor
 */
export function generatePersonSchema(
  author: BlogAuthor,
  baseUrl: string = 'https://athletia.site'
): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    jobTitle: author.role || undefined,
    description: author.bio || undefined,
    url: author.externalLink || undefined
  };

  if (author.avatar) {
    schema.image = author.avatar.startsWith('http')
      ? author.avatar
      : `${baseUrl}${author.avatar}`;
  }

  // Remover propriedades undefined
  Object.keys(schema).forEach(key => {
    if (schema[key] === undefined) {
      delete schema[key];
    }
  });

  return schema;
}

/**
 * Gera meta tags Open Graph
 */
export function generateOpenGraphTags(
  article: BlogArticle & {
    categoryRelation?: BlogCategory | null;
    authorRelation?: BlogAuthor | null;
  },
  baseUrl: string = 'https://athletia.site'
): Record<string, string> {
  const articleUrl = `${baseUrl}/blog/${article.slug}`;
  const imageUrl = article.featuredImage
    ? (article.featuredImage.startsWith('http')
        ? article.featuredImage
        : `${baseUrl}${article.featuredImage}`)
    : undefined;

  const tags: Record<string, string> = {
    'og:type': 'article',
    'og:title': article.metaTitle || article.title,
    'og:description': article.metaDescription || article.excerpt,
    'og:url': articleUrl,
    'article:published_time': article.publishedAt?.toISOString() || '',
    'article:modified_time': article.updatedAt.toISOString()
  };

  if (imageUrl) {
    tags['og:image'] = imageUrl;
    tags['og:image:alt'] = article.featuredImageAlt || article.title;
  }

  if (article.categoryRelation) {
    tags['article:section'] = article.categoryRelation.name;
  }

  if (article.authorRelation) {
    tags['article:author'] = article.authorRelation.name;
  }

  return tags;
}

/**
 * Gera meta tags Twitter Card
 */
export function generateTwitterCardTags(
  article: BlogArticle,
  baseUrl: string = 'https://athletia.site'
): Record<string, string> {
  const imageUrl = article.featuredImage
    ? (article.featuredImage.startsWith('http')
        ? article.featuredImage
        : `${baseUrl}${article.featuredImage}`)
    : undefined;

  const tags: Record<string, string> = {
    'twitter:card': 'summary_large_image',
    'twitter:title': article.metaTitle || article.title,
    'twitter:description': article.metaDescription || article.excerpt
  };

  if (imageUrl) {
    tags['twitter:image'] = imageUrl;
  }

  return tags;
}
