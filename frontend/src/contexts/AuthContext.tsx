import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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

  useEffect(() => {
    // Verificar se há token salvo (localStorage primeiro, depois sessionStorage)
    let token = localStorage.getItem('accessToken')
    let userData = localStorage.getItem('user')
    
    // Se não encontrar no localStorage, tentar sessionStorage
    if (!token || !userData) {
      token = sessionStorage.getItem('accessToken')
      userData = sessionStorage.getItem('user')
    }

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
        clearAllStorages()
      }
    }

    setLoading(false)
  }, [])

  const login = async (email: string, senha: string, rememberMe: boolean = true) => {
    try {
      // Normalizar email/username (trim e lowercase)
      const emailNormalizado = email.trim().toLowerCase()
      // Normalizar senha (trim para remover espaços)
      const senhaNormalizada = senha.trim()
      const response = await authService.login(emailNormalizado, senhaNormalizada)
      
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
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDays)
  }

  const isTrialExpirado = (): boolean => {
    if (!user || !user.dataFimTrial) {
      return false
    }
    const agora = new Date()
    const dataFimTrial = new Date(user.dataFimTrial)
    return dataFimTrial <= agora && !user.planoAtivo
  }

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

