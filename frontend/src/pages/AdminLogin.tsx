import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Normalizar email/username (trim e lowercase)
      const emailNormalizado = email.trim().toLowerCase()
      const response = await api.post('/auth/login', { email: emailNormalizado, senha })
      
      // Verificar se é admin
      if (response.data.user.role !== 'ADMIN') {
        setError('Acesso negado. Apenas administradores podem acessar esta área.')
        setLoading(false)
        return
      }

      // Salvar tokens e dados do admin
      localStorage.setItem('adminAccessToken', response.data.accessToken)
      localStorage.setItem('adminRefreshToken', response.data.refreshToken)
      localStorage.setItem('adminUser', JSON.stringify(response.data.user))

      // Redirecionar para painel admin
      navigate('/admin')
    } catch (err: any) {
      console.error('Erro no login:', err)
      
      // Extrair mensagem de erro detalhada
      let errorMessage = 'Erro ao fazer login'
      
      if (err.response?.data) {
        // Se houver detalhes de validação
        if (err.response.data.details && Array.isArray(err.response.data.details)) {
          errorMessage = err.response.data.details[0]?.msg || err.response.data.error || errorMessage
        } else {
          errorMessage = err.response.data.error || err.response.data.message || errorMessage
        }
      }
      
      // Mensagens específicas por status
      if (err.response?.status === 400) {
        errorMessage = 'Dados inválidos. Verifique os campos preenchidos.'
      } else if (err.response?.status === 401) {
        errorMessage = 'Usuário ou senha inválidos. Verifique se o usuário admin foi criado (npm run criar-admin).'
      } else if (err.response?.status === 500) {
        errorMessage = 'Erro no servidor. Verifique se o backend está rodando.'
      } else if (!err.response) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 3001.'
      }
      
      setError(errorMessage)
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Admin AthletIA
          </h1>
          <p className="text-light-muted">
            Área Administrativa - Acesso Restrito
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="usuario" className="label-field">
              Usuário Administrativo
            </label>
            <input
              id="usuario"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="admin"
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
            {loading ? 'Entrando...' : 'Acessar Painel Admin'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-light-muted text-sm">
            Acesso apenas para administradores
          </p>
          <button
            onClick={() => navigate('/login')}
            className="text-primary hover:text-primary-400 font-semibold transition-colors mt-2 text-sm"
          >
            Voltar para login de usuário
          </button>
        </div>
      </div>
    </div>
  )
}

