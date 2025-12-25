import axios from 'axios'
import { getApiUrl } from '../utils/api-url'

const API_URL = getApiUrl()

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  // Não sobrescrever Content-Type se for FormData (upload de arquivo)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  // Verificar se já existe header de autorização (ex: upload manual)
  if (config.headers.Authorization) {
    return config
  }

  // Verificar se é rota de admin (verificar se URL contém '/admin' ou é rota de mídia de exercício)
  // Rotas de mídia (/exercicios/:id/media) são protegidas e requerem admin para POST/DELETE
  const isAdminRoute = config.url?.includes('/admin') ||
    (config.url?.includes('/exercicios/') && config.url?.includes('/media') && config.method?.toLowerCase() !== 'get') ||
    false

  if (isAdminRoute) {
    const adminToken = localStorage.getItem('adminAccessToken')
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`
    } else {
      console.warn('[API] Rota admin sem token:', config.url)
    }
  } else {
    // Para rotas normais, usar token do usuário (verificar ambos storages)
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('[API] Requisição sem token de acesso:', config.url)
    }
  }
  return config
})

// Interceptor para renovar token quando expirar
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Tratamento de erros de rede (backend offline) e 502/503
    if (!error.response && error.request) {
      // Erro de rede - backend não está respondendo
      const isAdminRoute = originalRequest?.url?.includes('/admin') ||
        (originalRequest?.url?.includes('/exercicios/') && originalRequest?.url?.includes('/media') && originalRequest?.method?.toLowerCase() !== 'get') ||
        false
      
      // Rotas públicas do blog podem usar fallback silenciosamente
      const isPublicBlogRoute = originalRequest?.url?.includes('/blog/artigos')
      
      if (isAdminRoute) {
        // Para rotas admin, não fazer nada aqui - deixar o componente tratar
        return Promise.reject({
          ...error,
          isNetworkError: true,
          message: 'Erro de conexão. Verifique se o backend está rodando na porta 3001.'
        })
      } else if (isPublicBlogRoute) {
        // Para rotas públicas do blog, retornar erro silencioso para permitir fallback
        return Promise.reject({
          ...error,
          isNetworkError: true,
          silent: true // Flag para indicar que é um erro silencioso
        })
      }
      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: 'Erro de conexão. Verifique sua internet e tente novamente.'
      })
    }

    // Tratamento específico para 502 Bad Gateway e 503 Service Unavailable
    if (error.response?.status === 502 || error.response?.status === 503) {
      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: 'Servidor temporariamente indisponível. O backend pode estar offline ou reiniciando.'
      })
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Verificar se é rota de admin baseado na URL da requisição original
      // IMPORTANTE: Verificar a URL original, não a URL da requisição de refresh
      const originalUrl = originalRequest.url || ''
      const isAdminRoute = originalUrl.includes('/admin') ||
        (originalUrl.includes('/exercicios/') && originalUrl.includes('/media') && originalRequest.method?.toLowerCase() !== 'get')
      
      if (isAdminRoute) {
        try {
          const refreshToken = localStorage.getItem('adminRefreshToken')
          if (refreshToken) {
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken
            })

            const { accessToken, refreshToken: newRefreshToken } = response.data
            localStorage.setItem('adminAccessToken', accessToken)
            localStorage.setItem('adminRefreshToken', newRefreshToken)

            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return api(originalRequest)
          } else {
            console.warn('[API] Tentativa de refresh sem refreshToken admin')
            localStorage.removeItem('adminAccessToken')
            localStorage.removeItem('adminRefreshToken')
            localStorage.removeItem('adminUser')
            // Só redirecionar se estiver em rota admin
            if (window.location.pathname.startsWith('/admin')) {
              window.location.href = '/admin/login'
            }
            return Promise.reject(error)
          }
        } catch (refreshError: any) {
          console.error('[API] Erro ao renovar token admin:', refreshError)
          localStorage.removeItem('adminAccessToken')
          localStorage.removeItem('adminRefreshToken')
          localStorage.removeItem('adminUser')
          // Só redirecionar se estiver em rota admin
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login'
          }
          return Promise.reject(refreshError)
        }
      } else {
        // Para rotas normais (usuários)
        try {
          // Verificar ambos storages para refresh token
          let refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')
          const isLocalStorage = !!localStorage.getItem('refreshToken')
          
          if (refreshToken) {
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken
            })

            const { accessToken, refreshToken: newRefreshToken } = response.data
            // Salvar no mesmo storage de origem
            const storage = isLocalStorage ? localStorage : sessionStorage
            storage.setItem('accessToken', accessToken)
            storage.setItem('refreshToken', newRefreshToken)

            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return api(originalRequest)
          } else {
            console.warn('[API] Tentativa de refresh sem refreshToken. Redirecionando para login.')
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            sessionStorage.removeItem('accessToken')
            sessionStorage.removeItem('refreshToken')
            sessionStorage.removeItem('user')
            // Garantir que vai para /login e não /admin/login
            if (!window.location.pathname.startsWith('/admin')) {
              window.location.href = '/login'
            }
            return Promise.reject(error)
          }
        } catch (refreshError: any) {
          console.error('[API] Erro ao renovar token:', refreshError)
          // Limpar ambos storages
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          sessionStorage.removeItem('accessToken')
          sessionStorage.removeItem('refreshToken')
          sessionStorage.removeItem('user')
          // Garantir que vai para /login e não /admin/login
          if (!window.location.pathname.startsWith('/admin')) {
            window.location.href = '/login'
          }
          return Promise.reject(refreshError)
        }
      }
    }

    // Tratamento de outros erros
    return Promise.reject(error)
  }
)

export const authService = {
  async login(email: string, senha: string, rememberMe: boolean = true) {
    const response = await api.post('/auth/login', { email, senha, rememberMe })
    return response.data
  },

  async register(email: string, senha: string, nome?: string) {
    const response = await api.post('/auth/register', { email, senha, nome })
    return response.data
  },

  async refreshToken(refreshToken: string) {
    const response = await api.post('/auth/refresh', { refreshToken })
    return response.data
  },

  async requestPasswordReset(email: string) {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  async resetPassword(token: string, newPassword: string) {
    const response = await api.post('/auth/reset-password', { token, newPassword })
    return response.data
  },

  async getMe() {
    const response = await api.get('/auth/me')
    return response.data
  }
}

// Método para upload de mídia de exercício
// Nova função de upload usando a nova rota
export const uploadExercicioMedia = async (exercicioId: string, file: File, onUploadProgress?: (progress: number) => void) => {
  const formData = new FormData()
  formData.append('media', file)

  // Usar token admin para upload
  const adminToken = localStorage.getItem('adminAccessToken')
  const headers: any = {}
  if (adminToken) {
    headers.Authorization = `Bearer ${adminToken}`
  }

  const response = await api.post(`/exercicios/${exercicioId}/media`, formData, {
    headers,
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onUploadProgress(percentCompleted)
      }
    }
  })
  return response.data
}

// Nova função para remover mídia
export const removeExercicioMedia = async (exercicioId: string) => {
  const adminToken = localStorage.getItem('adminAccessToken')
  const headers: any = {}
  if (adminToken) {
    headers.Authorization = `Bearer ${adminToken}`
  }

  const response = await api.delete(`/exercicios/${exercicioId}/media`, { headers })
  return response.data
}

export default api

