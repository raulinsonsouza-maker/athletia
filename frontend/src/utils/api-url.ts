/**
 * Utilitário para obter a URL base da API com suporte automático a HTTPS
 * Quando a página está em HTTPS, força a API a usar HTTPS também
 */

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL
  
  // Se não houver URL configurada, usar localhost em desenvolvimento
  if (!envUrl) {
    return 'http://localhost:3001'
  }
  
  // Se a página está em HTTPS e a API está em HTTP, converter para HTTPS
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && envUrl.startsWith('http://')) {
    return envUrl.replace('http://', 'https://')
  }
  
  return envUrl
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

