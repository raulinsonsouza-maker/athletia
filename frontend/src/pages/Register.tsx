import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [senhaStrength, setSenhaStrength] = useState<'weak' | 'medium' | 'strong' | null>(null)
  const { register } = useAuth()
  const navigate = useNavigate()

  // Validar força da senha em tempo real
  const validarForcaSenha = (senha: string): 'weak' | 'medium' | 'strong' | null => {
    if (!senha) return null
    if (senha.length < 6) return 'weak'
    if (senha.length < 10) return 'medium'
    // Verificar complexidade
    const temMaiuscula = /[A-Z]/.test(senha)
    const temMinuscula = /[a-z]/.test(senha)
    const temNumero = /[0-9]/.test(senha)
    const temEspecial = /[^A-Za-z0-9]/.test(senha)
    const complexidade = [temMaiuscula, temMinuscula, temNumero, temEspecial].filter(Boolean).length
    if (complexidade >= 3 && senha.length >= 10) return 'strong'
    if (complexidade >= 2) return 'medium'
    return 'weak'
  }

  const handleSenhaChange = (value: string) => {
    setSenha(value)
    setSenhaStrength(validarForcaSenha(value))
    if (error && error.includes('senha')) {
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem')
      return
    }

    if (senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setLoading(true)

    try {
      await register(email, senha, nome || undefined)
      // Após registro simples, redirecionar para dashboard
      // O onboarding completo é feito na Landing antes do cadastro
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar conta')
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
            Crie sua conta e comece seus treinos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="nome" className="label-field">
              Nome (opcional)
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="input-field"
              placeholder="Seu nome"
              disabled={loading}
            />
          </div>

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
              onChange={(e) => handleSenhaChange(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
            />
            {senhaStrength && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-dark-lighter rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        senhaStrength === 'weak' ? 'bg-error w-1/3' :
                        senhaStrength === 'medium' ? 'bg-warning w-2/3' :
                        'bg-success w-full'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    senhaStrength === 'weak' ? 'text-error' :
                    senhaStrength === 'medium' ? 'text-warning' :
                    'text-success'
                  }`}>
                    {senhaStrength === 'weak' ? 'Fraca' :
                     senhaStrength === 'medium' ? 'Média' :
                     'Forte'}
                  </span>
                </div>
                {senhaStrength === 'weak' && senha.length >= 6 && (
                  <p className="text-xs text-warning mt-1">
                    Dica: Use letras maiúsculas, números e caracteres especiais para aumentar a segurança
                  </p>
                )}
              </div>
            )}
            <p className="text-xs text-light-muted mt-1">
              Mínimo de 6 caracteres
            </p>
          </div>

          <div>
            <label htmlFor="confirmarSenha" className="label-field">
              Confirmar Senha
            </label>
            <input
              id="confirmarSenha"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
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
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-light-muted">
            Já tem uma conta?{' '}
            <Link
              to="/login"
              className="text-primary hover:text-primary-400 font-semibold transition-colors"
            >
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
