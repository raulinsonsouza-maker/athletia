import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, senha)
      navigate('/dashboard')
    } catch (err: any) {
      console.error('Erro no login:', err)
      
      // Tratamento específico para diferentes tipos de erro
      if (err.response?.status === 502) {
        setError('Servidor temporariamente indisponível. O backend pode estar offline ou reiniciando. Tente novamente em alguns instantes.')
      } else if (err.response?.status === 503) {
        setError('Serviço temporariamente indisponível. Tente novamente em alguns instantes.')
      } else if (err.response?.status === 401) {
        setError('Email ou senha incorretos. Verifique suas credenciais.')
      } else if (err.isNetworkError || !err.response) {
        setError('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.')
      } else if (err.response?.status >= 500) {
        setError('Erro no servidor. Tente novamente em alguns instantes.')
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Erro ao fazer login')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full card animate-scale-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-gradient mb-2 flex items-center justify-center gap-3">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            AthletIA
          </h1>
          <p className="text-light-muted">
            Sistema Inteligente de Treinos Personalizados
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="label-field">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="seu@email.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="senha" className="label-field">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-light-muted">
            Não tem uma conta?{' '}
            <Link
              to="/register"
              className="text-primary hover:text-primary-400 font-semibold transition-colors"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
