import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../services/auth.service'

interface User {
  id: string
  email: string
  nome?: string
  role: string
  planoAtivo?: boolean
  plano?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, senha: string) => Promise<void>
  register: (email: string, senha: string, nome?: string) => Promise<void>
  logout: () => void
  setUserFromResponse: (user: User, accessToken: string, refreshToken: string) => void
  updateUser: (userData: Partial<User>) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há token salvo
    const token = localStorage.getItem('accessToken')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
    }

    setLoading(false)
  }, [])

  const login = async (email: string, senha: string) => {
    try {
      // Normalizar email/username (trim e lowercase)
      const emailNormalizado = email.trim().toLowerCase()
      const response = await authService.login(emailNormalizado, senha)
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.user))
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
    localStorage.setItem('accessToken', response.accessToken)
    localStorage.setItem('refreshToken', response.refreshToken)
    localStorage.setItem('user', JSON.stringify(response.user))
    setUser(response.user)
    // Após registro, redirecionar para onboarding
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
  }

  const setUserFromResponse = (userData: User, accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    }
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
        isAuthenticated: !!user
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

