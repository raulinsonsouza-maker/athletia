/**
 * Utilitário para obter a URL base da API com suporte automático a HTTPS
 * Quando a página está em HTTPS, força a API a usar HTTPS também
 * Se a URL contém IP, substitui pelo domínio atual quando em HTTPS
 */

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL
  
  // Se não houver URL configurada, usar localhost em desenvolvimento
  if (!envUrl) {
    throw new Error('VITE_API_URL não definida. Build inválido para produção.')
  }
  
  // Remover /api do final se existir (será adicionado por getApiUrl)
  const cleanUrl = envUrl.replace(/\/api\/?$/, '')
  
  // Se estamos em produção HTTPS (não localhost)
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && window.location.hostname !== 'localhost') {
    const currentHost = window.location.hostname
    
    // Se a URL da API contém um IP, substituir pelo domínio atual
    const ipPattern = /https?:\/\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?(\/.*)?/
    if (ipPattern.test(cleanUrl)) {
      // Extrair porta e path se existirem
      const match = cleanUrl.match(ipPattern)
      const port = match?.[2] || ''
      const path = match?.[3] || ''
      // Remover /api do path se existir
      const cleanPath = path.replace(/\/api\/?$/, '')
      // Substituir IP pelo domínio atual e garantir HTTPS
      return `https://${currentHost}${port}${cleanPath}`
    }
    
    // Se a API está em HTTP, converter para HTTPS usando o domínio atual
    if (cleanUrl.startsWith('http://')) {
      // Extrair host, porta e path
      const urlMatch = cleanUrl.match(/http:\/\/([^/:]+)(:\d+)?(\/.*)?/)
      if (urlMatch) {
        const [, , port, path] = urlMatch
        // Remover /api do path se existir
        const cleanPath = path ? path.replace(/\/api\/?$/, '') : ''
        return `https://${currentHost}${port || ''}${cleanPath}`
      }
    }
  }
  
  return cleanUrl
}

/**
 * Obtém a URL completa da API (com /api no final se necessário)
 */
export function getApiUrl(): string {
  const baseUrl = getApiBaseUrl()
  
  // Se já termina com /api, retornar como está
  if (baseUrl.endsWith('/api')) {
    return baseUrl
  }
  
  // Se termina com /, adicionar api
  if (baseUrl.endsWith('/')) {
    return `${baseUrl}api`
  }
  
  // Caso contrário, adicionar /api
  return `${baseUrl}/api`
}

/**
 * Constrói uma URL absoluta para recursos servidos pela API (ex.: uploads)
 * Aceita caminhos relativos iniciando (ou não) por /api e preserva URLs absolutas.
 */
export function resolveApiPath(path?: string | null): string | null {
  if (!path) {
    return null
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const baseUrl = getApiBaseUrl().replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${baseUrl}${normalizedPath}`
}

