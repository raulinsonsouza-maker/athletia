import api from './auth.service'

let paywallModalCallback: ((blockedAction?: string) => void) | null = null

/**
 * Registra callback para abrir paywall modal
 */
export function setPaywallModalCallback(callback: (blockedAction?: string) => void) {
  paywallModalCallback = callback
}

/**
 * Inicializa interceptor HTTP para capturar erros 402 (Payment Required)
 */
export function initializeHttpInterceptor() {
  // Interceptor já existe no auth.service.ts, vamos adicionar tratamento para 402
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Se for erro 402 (Payment Required), abrir paywall
      if (error.response?.status === 402) {
        const blockedAction = error.response?.data?.blockedAction || undefined
        
        if (paywallModalCallback) {
          paywallModalCallback(blockedAction)
        } else {
          // Fallback: redirecionar para checkout se callback não estiver registrado
          console.warn('[HTTP Interceptor] Paywall callback não registrado, redirecionando para checkout')
          if (typeof window !== 'undefined') {
            window.location.href = '/checkout'
          }
        }
      }

      // Rejeitar erro para que outros handlers possam processar
      return Promise.reject(error)
    }
  )
}

