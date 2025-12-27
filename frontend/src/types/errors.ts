import { AxiosError } from 'axios'

/**
 * Tipo para erros de API
 */
export interface ApiError {
  message: string
  error?: string
  details?: unknown
  status?: number
}

/**
 * Type guard para verificar se é um AxiosError
 */
export function isAxiosError(error: unknown): error is AxiosError<ApiError> {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  )
}

/**
 * Type guard para verificar se é um Error padrão
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error
}

/**
 * Extrai mensagem de erro de forma segura
 */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    return error.response?.data?.error || error.response?.data?.message || error.message || 'Erro desconhecido'
  }
  if (isError(error)) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Erro desconhecido'
}

/**
 * Extrai status HTTP de erro de forma segura
 */
export function getErrorStatus(error: unknown): number | undefined {
  if (isAxiosError(error)) {
    return error.response?.status
  }
  return undefined
}

