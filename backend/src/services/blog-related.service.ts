import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Sugere posts relacionados baseado em:
 * - Mesma categoria
 * - Palavras-chave similares
 * - Mesmo autor
 */
export async function suggestRelatedPosts(
  articleId: string,
  limit: number = 3
): Promise<string[]> {
  const article = await prisma.blogArticle.findUnique({
    where: { id: articleId },
    select: {
      categoryId: true,
      authorId: true,
      keywords: true,
      category: true
    }
  });

  if (!article) {
    return [];
  }

  // Buscar posts relacionados por categoria
  const relatedByCategory = await prisma.blogArticle.findMany({
    where: {
      id: { not: articleId },
      published: true,
      status: 'published',
      OR: [
        { categoryId: article.categoryId || undefined },
        { category: article.category || undefined }
      ]
    },
    select: { id: true },
    take: limit * 2 // Buscar mais para ter opções
  });

  // Buscar posts relacionados por autor
  const relatedByAuthor = article.authorId
    ? await prisma.blogArticle.findMany({
        where: {
          id: { not: articleId },
          published: true,
          status: 'published',
          authorId: article.authorId
        },
        select: { id: true },
        take: limit
      })
    : [];

  // Buscar posts relacionados por keywords (se houver)
  let relatedByKeywords: string[] = [];
  if (article.keywords && article.keywords.length > 0) {
    const keywordsLower = article.keywords.map(k => k.toLowerCase());
    const postsWithKeywords = await prisma.blogArticle.findMany({
      where: {
        id: { not: articleId },
        published: true,
        status: 'published',
        keywords: {
          hasSome: article.keywords
        }
      },
      select: { id: true },
      take: limit
    });
    relatedByKeywords = postsWithKeywords.map(p => p.id);
  }

  // Combinar e remover duplicatas
  const allRelatedIds = [
    ...relatedByCategory.map(p => p.id),
    ...relatedByAuthor.map(p => p.id),
    ...relatedByKeywords
  ];

  // Remover duplicatas mantendo ordem
  const uniqueIds = Array.from(new Set(allRelatedIds));

  // Retornar apenas o limite solicitado
  return uniqueIds.slice(0, limit);
}

/**
 * Atualiza automaticamente os posts relacionados de um artigo
 */
export async function updateArticleRelatedPosts(
  articleId: string,
  limit: number = 3
): Promise<string[]> {
  const suggestedIds = await suggestRelatedPosts(articleId, limit);

  await prisma.blogArticle.update({
    where: { id: articleId },
    data: {
      relatedPosts: suggestedIds
    }
  });

  return suggestedIds;
}
