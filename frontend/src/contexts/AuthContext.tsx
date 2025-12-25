import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { authService } from '../services/auth.service'

interface User {
  id: string
  email: string
  nome?: string
  role: string
  planoAtivo?: boolean
  plano?: string
  dataExpiracao?: string
  dataInicioTrial?: string
  dataFimTrial?: string
  trialUtilizado?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, senha: string, rememberMe?: boolean) => Promise<void>
  register: (email: string, senha: string, nome?: string) => Promise<void>
  logout: () => void
  setUserFromResponse: (user: User, accessToken: string, refreshToken: string, rememberMe?: boolean) => void
  updateUser: (userData: Partial<User>) => void
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
  isTrialAtivo: () => boolean
  diasRestantesTrial: () => number
  horasRestantesTrial: () => number
  isTrialExpirado: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Helper para obter storage baseado em rememberMe
  const getStorage = (rememberMe: boolean = true) => {
    return rememberMe ? localStorage : sessionStorage
  }

  // Helper para limpar ambos storages
  const clearAllStorages = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('refreshToken')
    sessionStorage.removeItem('user')
  }

  // Decodificar JWT sem verificar assinatura (apenas para ler payload)
  const decodeJWT = (token: string): { exp?: number; userId?: string; type?: string } | null => {
    try {
      const base64Url = token.split('.')[1]
      if (!base64Url) return null
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('[AuthContext] Erro ao decodificar JWT:', error)
      return null
    }
  }

  // Verificar se o token está expirado ou próximo de expirar
  const isTokenExpired = useCallback((token: string, bufferMinutes: number = 0): boolean => {
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) return true

    const exp = decoded.exp * 1000 // Converter para milissegundos
    const now = Date.now()
    const bufferMs = bufferMinutes * 60 * 1000

    return exp <= (now + bufferMs)
  }, [])

  // Fazer refresh automático do token
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      // Verificar ambos storages para refresh token
      let refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')
      const isLocalStorage = !!localStorage.getItem('refreshToken')
      
      if (!refreshToken) {
        console.warn('[AuthContext] Tentativa de refresh sem refreshToken')
        return false
      }

      // Verificar se refresh token está expirado
      if (isTokenExpired(refreshToken)) {
        console.warn('[AuthContext] Refresh token expirado')
        clearAllStorages()
        setUser(null)
        return false
      }

      const response = await authService.refreshToken(refreshToken)
      
      // Salvar novos tokens no mesmo storage de origem
      const storage = isLocalStorage ? localStorage : sessionStorage
      storage.setItem('accessToken', response.accessToken)
      storage.setItem('refreshToken', response.refreshToken)
      
      return true
    } catch (error: any) {
      console.error('[AuthContext] Erro ao fazer refresh do token:', error)
      clearAllStorages()
      setUser(null)
      return false
    }
  }, [isTokenExpired])

  useEffect(() => {
    const initializeAuth = async () => {
      // Verificar se há token salvo (localStorage primeiro, depois sessionStorage)
      let token = localStorage.getItem('accessToken')
      let refreshToken = localStorage.getItem('refreshToken')
      let userData = localStorage.getItem('user')
      let isLocalStorage = true
      
      // Se não encontrar no localStorage, tentar sessionStorage
      if (!token || !userData) {
        token = sessionStorage.getItem('accessToken')
        refreshToken = sessionStorage.getItem('refreshToken')
        userData = sessionStorage.getItem('user')
        isLocalStorage = false
      }

      if (token && userData) {
        try {
          // Verificar se o access token está expirado
          if (isTokenExpired(token)) {
            console.log('[AuthContext] Access token expirado, tentando refresh automático...')
            
            // Se refresh token existe e não está expirado, fazer refresh
            if (refreshToken && !isTokenExpired(refreshToken)) {
              const refreshSuccess = await refreshAccessToken()
              if (refreshSuccess) {
                // Buscar novo token do storage
                const storage = isLocalStorage ? localStorage : sessionStorage
                token = storage.getItem('accessToken')
                if (token) {
                  setUser(JSON.parse(userData))
                  setLoading(false)
                  return
                }
              }
            }
            
            // Se refresh falhou ou refresh token expirado, limpar e deslogar
            console.warn('[AuthContext] Não foi possível renovar token, deslogando...')
            clearAllStorages()
            setUser(null)
            setLoading(false)
            return
          }

          // Token válido, carregar usuário
          setUser(JSON.parse(userData))
        } catch (error) {
          console.error('Erro ao carregar usuário:', error)
          clearAllStorages()
          setUser(null)
        }
      }

      setLoading(false)
    }

    initializeAuth()
  }, [isTokenExpired, refreshAccessToken])

  const login = async (email: string, senha: string, rememberMe: boolean = true) => {
    try {
      // Normalizar email/username (trim e lowercase)
      const emailNormalizado = email.trim().toLowerCase()
      // Normalizar senha (trim para remover espaços)
      const senhaNormalizada = senha.trim()
      const response = await authService.login(emailNormalizado, senhaNormalizada, rememberMe)
      
      // Limpar ambos storages antes de salvar
      clearAllStorages()
      
      // Salvar no storage apropriado baseado em rememberMe
      const storage = getStorage(rememberMe)
      storage.setItem('accessToken', response.accessToken)
      storage.setItem('refreshToken', response.refreshToken)
      storage.setItem('user', JSON.stringify(response.user))
      setUser(response.user)
    } catch (error: any) {
      console.error('Erro no login:', error)
      
      // Adicionar flag isNetworkError se for erro de rede ou 502
      if (!error.response || error.response?.status === 502 || error.response?.status === 503) {
        error.isNetworkError = true
      }
      
      // Re-throw para que o componente possa tratar o erro
      throw error
    }
  }

  const register = async (email: string, senha: string, nome?: string) => {
    const response = await authService.register(email, senha, nome)
    // No registro, sempre usar localStorage (rememberMe = true por padrão)
    clearAllStorages()
    const storage = getStorage(true)
    storage.setItem('accessToken', response.accessToken)
    storage.setItem('refreshToken', response.refreshToken)
    storage.setItem('user', JSON.stringify(response.user))
    setUser(response.user)
    // Após registro, redirecionar para onboarding
  }

  const logout = () => {
    clearAllStorages()
    setUser(null)

    // Garantir retorno imediato para tela de login
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  const setUserFromResponse = (userData: User, accessToken: string, refreshToken: string, rememberMe: boolean = true) => {
    clearAllStorages()
    const storage = getStorage(rememberMe)
    storage.setItem('accessToken', accessToken)
    storage.setItem('refreshToken', refreshToken)
    storage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      // Verificar qual storage está sendo usado
      const storage = localStorage.getItem('accessToken') ? localStorage : sessionStorage
      storage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    }
  }

  const refreshUser = async () => {
    try {
      // Verificar ambos storages
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
      if (!token) {
        console.warn('[AuthContext] Tentativa de refresh sem token')
        return
      }

      const response = await authService.getMe()
      if (response?.user) {
        const userData: User = {
          id: response.user.id,
          email: response.user.email,
          nome: response.user.nome || undefined,
          role: response.user.role,
          planoAtivo: response.user.planoAtivo || false,
          plano: response.user.plano || undefined,
          dataExpiracao: response.user.dataExpiracao || undefined,
          dataInicioTrial: response.user.dataInicioTrial || undefined,
          dataFimTrial: response.user.dataFimTrial || undefined,
          trialUtilizado: response.user.trialUtilizado || false
        }
        // Usar o mesmo storage onde o token foi encontrado
        const storage = localStorage.getItem('accessToken') ? localStorage : sessionStorage
        storage.setItem('user', JSON.stringify(userData))
        setUser(userData)
      }
    } catch (error: any) {
      console.error('[AuthContext] Erro ao atualizar dados do usuário:', error)
      // Se for erro 401, limpar tokens e redirecionar para login
      if (error.response?.status === 401) {
        clearAllStorages()
        setUser(null)
      }
      throw error
    }
  }

  const isTrialAtivo = (): boolean => {
    if (!user || !user.dataFimTrial || user.planoAtivo) {
      return false
    }
    const agora = new Date()
    const dataFimTrial = new Date(user.dataFimTrial)
    return dataFimTrial > agora
  }

  const diasRestantesTrial = (): number => {
    if (!user || !user.dataFimTrial) {
      return 0
    }
    const agora = new Date()
    const dataFimTrial = new Date(user.dataFimTrial)

    if (dataFimTrial <= agora) {
      return 0
    }

    const diffMs = dataFimTrial.getTime() - agora.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    
    // Retornar dias com decimais para permitir cálculo de horas quando < 1 dia
    return Math.max(0, diffDays)
  }

  const horasRestantesTrial = (): number => {
    if (!user || !user.dataFimTrial) {
      return 0
    }
    const agora = new Date()
    const dataFimTrial = new Date(user.dataFimTrial)

    if (dataFimTrial <= agora) {
      return 0
    }

    const diffMs = dataFimTrial.getTime() - agora.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    
    return Math.max(0, diffHours)
  }

  const isTrialExpirado = (): boolean => {
    if (!user || !user.dataFimTrial) {
      return false
    }
    const agora = new Date()
    const dataFimTrial = new Date(user.dataFimTrial)
    return dataFimTrial <= agora && !user.planoAtivo
  }

  // Refresh proativo de token (verificar a cada 5 minutos)
  useEffect(() => {
    if (!user) return

    const checkAndRefreshToken = async () => {
      // Verificar ambos storages
      let token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
      
      if (!token) return

      // Verificar se está próximo de expirar (menos de 5 minutos)
      if (isTokenExpired(token, 5)) {
        console.log('[AuthContext] Token próximo de expirar, fazendo refresh proativo...')
        await refreshAccessToken()
      }
    }

    // Verificar imediatamente
    checkAndRefreshToken()

    // Verificar a cada 5 minutos
    const interval = setInterval(checkAndRefreshToken, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user, isTokenExpired, refreshAccessToken])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        setUserFromResponse,
        updateUser,
        refreshUser,
        isAuthenticated: !!user,
        isTrialAtivo,
        diasRestantesTrial,
        horasRestantesTrial,
        isTrialExpirado
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

