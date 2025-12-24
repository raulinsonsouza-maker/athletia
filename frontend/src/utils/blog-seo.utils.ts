/**
 * Utilitários para otimização SEO e processamento de conteúdo do blog
 */

/**
 * Gera um slug semântico a partir de um texto (para IDs de headings)
 */
export function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Valida e corrige hierarquia de headings no HTML
 * - Remove H1 do conteúdo (já existe na página)
 * - Garante que não há saltos de nível (H1 → H3, etc)
 * - Adiciona IDs semânticos aos headings
 */
export function processHeadings(htmlContent: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')
  let lastLevel = 0
  
  headings.forEach((heading) => {
    const tagName = heading.tagName
    const level = parseInt(tagName.substring(1))
    
    // Remover H1 do conteúdo (já existe na página)
    if (level === 1) {
      // Converter H1 para H2
      const h2 = doc.createElement('h2')
      h2.innerHTML = heading.innerHTML
      if (heading.id) h2.id = heading.id
      heading.parentNode?.replaceChild(h2, heading)
      return
    }
    
    // Garantir que não há saltos de nível
    // Se o último heading foi H2 e este é H4, converter para H3
    if (lastLevel > 0 && level > lastLevel + 1) {
      const correctedLevel = lastLevel + 1
      const newTag = doc.createElement(`h${correctedLevel}`)
      newTag.innerHTML = heading.innerHTML
      if (heading.id) newTag.id = heading.id
      heading.parentNode?.replaceChild(newTag, heading)
      lastLevel = correctedLevel
      return
    }
    
    lastLevel = level
    
    // Adicionar ID semântico se não existir
    if (!heading.id && heading.textContent) {
      const id = generateHeadingId(heading.textContent)
      heading.id = id
    }
  })
  
  return doc.body.innerHTML
}

/**
 * Processa links no conteúdo HTML para garantir âncoras descritivas
 * - Adiciona rel="noopener" e target="_blank" para links externos
 * - Valida que links internos tenham âncoras descritivas
 */
export function processLinks(htmlContent: string, siteOrigin: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  
  const links = doc.querySelectorAll('a')
  
  links.forEach((link) => {
    const href = link.getAttribute('href')
    if (!href) return
    
    const anchorText = link.textContent?.trim().toLowerCase() || ''
    const isExternal = href.startsWith('http') && !href.startsWith(siteOrigin)
    
    // Para links externos, adicionar rel="noopener" e target="_blank"
    if (isExternal) {
      link.setAttribute('rel', 'noopener noreferrer')
      link.setAttribute('target', '_blank')
    }
    
    // Validar âncoras genéricas (não bloqueia, mas pode logar avisos)
    const genericAnchors = ['clique aqui', 'leia mais', 'saiba mais', 'veja mais', 'clique', 'aqui']
    if (genericAnchors.some(generic => anchorText.includes(generic))) {
      // Link tem âncora genérica - mas não vamos bloquear, apenas documentar
      console.warn('Link com âncora genérica detectada:', anchorText, href)
    }
  })
  
  return doc.body.innerHTML
}

/**
 * Detecta e processa blocos FAQ no conteúdo
 */
export function detectFAQBlocks(htmlContent: string): Array<{ question: string; answer: string }> {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  
  const faqItems: Array<{ question: string; answer: string }> = []
  
  // Detectar FAQ por classe ou data attribute
  const faqBlocks = doc.querySelectorAll('.faq-item, [data-faq]')
  
  faqBlocks.forEach((block) => {
    const questionEl = block.querySelector('.faq-question, [data-question], h3, h4')
    const answerEl = block.querySelector('.faq-answer, [data-answer], p')
    
    if (questionEl && answerEl) {
      faqItems.push({
        question: questionEl.textContent?.trim() || '',
        answer: answerEl.textContent?.trim() || ''
      })
    }
  })
  
  return faqItems
}

/**
 * Valida presença de keyword principal no conteúdo
 * Retorna um objeto com validações e sugestões
 */
export function validateKeywordDensity(
  content: string,
  keyword: string
): {
  isValid: boolean
  inH1: boolean
  inFirstParagraph: boolean
  inH2: boolean
  density: number
  suggestions: string[]
} {
  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'text/html')
  
  const keywordLower = keyword.toLowerCase()
  const textContent = doc.body.textContent?.toLowerCase() || ''
  const words = textContent.split(/\s+/).filter(w => w.length > 0)
  const keywordMatches = words.filter(w => w.includes(keywordLower)).length
  
  const density = words.length > 0 ? (keywordMatches / words.length) * 100 : 0
  
  // Verificar presença em H1
  const h1 = doc.querySelector('h1')
  const inH1 = h1?.textContent?.toLowerCase().includes(keywordLower) || false
  
  // Verificar presença no primeiro parágrafo
  const firstP = doc.querySelector('p')
  const inFirstParagraph = firstP?.textContent?.toLowerCase().includes(keywordLower) || false
  
  // Verificar presença em pelo menos um H2
  const h2s = doc.querySelectorAll('h2')
  const inH2 = Array.from(h2s).some(h2 => h2.textContent?.toLowerCase().includes(keywordLower))
  
  const suggestions: string[] = []
  if (!inH1) suggestions.push('Adicione a palavra-chave principal no H1')
  if (!inFirstParagraph) suggestions.push('Adicione a palavra-chave no primeiro parágrafo')
  if (!inH2) suggestions.push('Adicione a palavra-chave em pelo menos um H2')
  if (density > 3) suggestions.push('Densidade de palavra-chave muito alta - pode ser considerado keyword stuffing')
  if (density < 0.5) suggestions.push('Densidade de palavra-chave muito baixa - considere adicionar mais menções')
  
  return {
    isValid: inH1 && inFirstParagraph && inH2 && density >= 0.5 && density <= 3,
    inH1,
    inFirstParagraph,
    inH2,
    density,
    suggestions
  }
}

