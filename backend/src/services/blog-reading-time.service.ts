/**
 * Calcula o tempo estimado de leitura de um artigo baseado no conteúdo
 * Assumindo velocidade média de leitura de 200 palavras por minuto
 */
export function calculateReadingTime(content: string): number {
  if (!content || content.trim().length === 0) {
    return 0;
  }

  // Remover HTML tags para contar apenas texto
  const textContent = content
    .replace(/<[^>]*>/g, ' ') // Remove tags HTML
    .replace(/&[^;]+;/g, ' ') // Remove entidades HTML
    .trim();

  // Contar palavras (separadas por espaços)
  const words = textContent.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Velocidade média de leitura: 200 palavras por minuto
  const wordsPerMinute = 200;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);

  // Mínimo de 1 minuto se houver conteúdo
  return Math.max(1, readingTime);
}

/**
 * Calcula tempo de leitura e atualiza o artigo
 */
export async function updateArticleReadingTime(
  prisma: any,
  articleId: string
): Promise<number> {
  const article = await prisma.blogArticle.findUnique({
    where: { id: articleId },
    select: { content: true }
  });

  if (!article) {
    throw new Error('Artigo não encontrado');
  }

  const readingTime = calculateReadingTime(article.content);

  await prisma.blogArticle.update({
    where: { id: articleId },
    data: { readingTime }
  });

  return readingTime;
}
