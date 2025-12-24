import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/auth.service'
import { useAuth } from '../../contexts/AuthContext'
import { OnboardingData } from '../../types/onboarding.types'

interface CadastroSectionProps {
  onboardingData: OnboardingData
}

export default function CadastroSection({ onboardingData }: CadastroSectionProps) {
  const navigate = useNavigate()
  const { setUserFromResponse } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    telefone: '',
    email: '',
    senha: ''
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/cadastro-pre-pagamento', {
        nome: formData.nomeCompleto,
        telefone: formData.telefone,
        email: formData.email,
        senha: formData.senha,
        onboarding: onboardingData,
      })

      if (!response.data) {
        throw new Error('Resposta do servidor inválida')
      }

      const { accessToken, refreshToken, user } = response.data

      if (!accessToken || !refreshToken || !user) {
        throw new Error('Dados incompletos na resposta do servidor')
      }

      setUserFromResponse(user, accessToken, refreshToken)
      localStorage.removeItem('onboardingData')

      navigate('/meu-plano')
    } catch (err: any) {
      console.error('Erro no cadastro:', err)
      
      let errorMessage = 'Erro ao realizar cadastro'
      
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = err.response.data?.error || 'Dados inválidos. Verifique as informações e tente novamente.'
        } else if (err.response.status === 409 || err.response.data?.error?.includes('já cadastrado')) {
          errorMessage = 'Este e-mail já está cadastrado. Você pode fazer login ou usar outro e-mail.'
        } else if (err.response.status >= 500) {
          errorMessage = 'Erro no servidor. Tente novamente em alguns instantes.'
        } else {
          errorMessage = err.response.data?.error || err.response.data?.message || errorMessage
        }
      } else if (err.request) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="cadastro" className="py-20 px-4 bg-dark">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Acesse gratuitamente por 24 horas
          </h2>
          <p className="text-xl text-white/70">
            Não pedimos cartão. Comece agora e teste todos os recursos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-dark-lighter rounded-2xl p-8 border border-white/10">
          {error && (
            <div className="bg-error/20 border border-error/50 rounded-lg p-4 text-error text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="nome" className="block text-white font-medium mb-2">
              Nome completo
            </label>
            <input
              id="nome"
              type="text"
              required
              value={formData.nomeCompleto}
              onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
              className="w-full px-4 py-3 bg-dark border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-white font-medium mb-2">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-dark border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="telefone" className="block text-white font-medium mb-2">
              Telefone
            </label>
            <input
              id="telefone"
              type="tel"
              required
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              className="w-full px-4 py-3 bg-dark border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-white font-medium mb-2">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              required
              minLength={8}
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              className="w-full px-4 py-3 bg-dark border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-dark font-bold text-lg rounded-full hover:bg-primary/90 transition shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando conta...' : 'Acessar meu teste gratuito'}
          </button>

          <p className="text-center text-white/60 text-sm">
            Ao continuar, você concorda com nossos{' '}
            <a href="/termos" className="text-primary hover:underline">Termos de Uso</a>
            {' '}e{' '}
            <a href="/privacidade" className="text-primary hover:underline">Política de Privacidade</a>
          </p>
        </form>
      </div>
    </section>
  )
}
