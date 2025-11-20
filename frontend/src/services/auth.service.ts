import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

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
  
  // Verificar se é rota de admin (verificar se URL contém '/admin')
  const isAdminRoute = config.url?.includes('/admin') || false
  
  if (isAdminRoute) {
    const adminToken = localStorage.getItem('adminAccessToken')
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`
    }
  } else {
    // Para rotas normais, usar token do usuário
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Interceptor para renovar token quando expirar
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Tratamento de erros de rede (backend offline)
    if (!error.response && error.request) {
      // Erro de rede - backend não está respondendo
      const isAdminRoute = originalRequest?.url?.includes('/admin') || false
      if (isAdminRoute) {
        // Para rotas admin, não fazer nada aqui - deixar o componente tratar
        return Promise.reject({
          ...error,
          isNetworkError: true,
          message: 'Erro de conexão. Verifique se o backend está rodando na porta 3001.'
        })
      }
      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: 'Erro de conexão. Verifique sua internet e tente novamente.'
      })
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Se for rota de admin, usar refresh token admin
      const isAdminRoute = originalRequest.url?.includes('/admin') || false
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
          }
        } catch (refreshError) {
          localStorage.removeItem('adminAccessToken')
          localStorage.removeItem('adminRefreshToken')
          localStorage.removeItem('adminUser')
          window.location.href = '/admin/login'
          return Promise.reject(refreshError)
        }
      } else {
        // Para rotas normais
        try {
          const refreshToken = localStorage.getItem('refreshToken')
          if (refreshToken) {
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken
            })

            const { accessToken, refreshToken: newRefreshToken } = response.data
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', newRefreshToken)

            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return api(originalRequest)
          }
        } catch (refreshError) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }

    // Tratamento de outros erros
    return Promise.reject(error)
  }
)

export const authService = {
  async login(email: string, senha: string) {
    const response = await api.post('/auth/login', { email, senha })
    return response.data
  },

  async register(email: string, senha: string, nome?: string) {
    const response = await api.post('/auth/register', { email, senha, nome })
    return response.data
  },

  async refreshToken(refreshToken: string) {
    const response = await api.post('/auth/refresh', { refreshToken })
    return response.data
  }
}

export default api

