/**
 * Utilitários para o formulário de blog
 */

/**
 * Calcula o tempo estimado de leitura baseado no conteúdo
 * Assumindo velocidade média de 200 palavras por minuto
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
 * Gera meta description a partir do excerpt
 * Limita a 160 caracteres (ideal para SEO)
 */
export function generateMetaDescription(excerpt: string, maxLength: number = 160): string {
  if (!excerpt || excerpt.trim().length === 0) {
    return '';
  }

  // Remover HTML tags se houver
  const cleanExcerpt = excerpt
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  if (cleanExcerpt.length <= maxLength) {
    return cleanExcerpt;
  }

  // Cortar no último espaço antes do limite
  const truncated = cleanExcerpt.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Gera texto alternativo para imagem baseado no título
 */
export function generateImageAlt(title: string): string {
  if (!title || title.trim().length === 0) {
    return '';
  }
  return `Imagem de capa: ${title.trim()}`;
}

/**
 * Extrai palavras-chave sugeridas do título e categoria
 */
export function suggestKeywords(title: string, category?: string): string[] {
  const keywords: string[] = [];
  
  // Palavras comuns a remover
  const stopWords = ['o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 
    'em', 'no', 'na', 'nos', 'nas', 'para', 'com', 'por', 'sobre', 'como', 'que', 'é', 
    'são', 'se', 'não', 'mais', 'muito', 'bem', 'também', 'já', 'ainda', 'só', 'sempre',
    'guia', 'completo', 'como', 'melhor', 'top', 'melhores', 'dicas', 'tudo', 'sobre'];
  
  // Extrair palavras do título
  const titleWords = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
  
  keywords.push(...titleWords);
  
  // Adicionar categoria se fornecida
  if (category && category.trim()) {
    const categorySlug = category
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, ' ')
      .trim();
    
    if (categorySlug && !keywords.includes(categorySlug)) {
      keywords.push(categorySlug);
    }
  }
  
  // Remover duplicatas e limitar a 10
  return [...new Set(keywords)].slice(0, 10);
}

/**
 * Melhora a geração de slug removendo caracteres especiais
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim()
    .replace(/\s+/g, '-') // Espaços viram hífens
    .replace(/[^\w-]+/g, '') // Remove caracteres especiais
    .replace(/-+/g, '-') // Múltiplos hífens viram um
    .replace(/^-|-$/g, ''); // Remove hífens do início/fim
}

