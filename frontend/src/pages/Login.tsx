import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true) // Por padrão, manter logado
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, senha, rememberMe)

      // Redirecionar após login bem-sucedido baseado no plano/trial
      // Buscar dados atualizados do usuário após login
      // Verificar ambos storages (localStorage e sessionStorage)
      const userData = JSON.parse(
        localStorage.getItem('user') || sessionStorage.getItem('user') || '{}'
      )
      const planoValido = userData.planoAtivo && (
        !userData.dataExpiracao || new Date(userData.dataExpiracao) > new Date()
      )

      // Considerar período de teste (trial) também
      const agora = new Date()
      let trialAtivo = false
      let trialExpirado = false

      if (userData.dataFimTrial) {
        const dataFimTrial = new Date(userData.dataFimTrial)
        trialAtivo = !userData.planoAtivo && dataFimTrial > agora
        trialExpirado = !userData.planoAtivo && dataFimTrial <= agora
      }

      if (planoValido || trialAtivo) {
        navigate('/meu-plano', { replace: true })
      } else if (trialExpirado) {
        // Trial expirado: redirecionar direto para checkout para escolher plano
        navigate('/checkout', { replace: true })
      } else {
        navigate('/checkout', { replace: true })
      }
    } catch (err: any) {
      console.error('Erro no login:', err)

      if (err.response?.status === 502) {
        setError('Servidor temporariamente indisponível. Tente novamente em instantes.')
      } else if (err.response?.status === 503) {
        setError('Serviço temporariamente indisponível. Tente novamente em instantes.')
      } else if (err.response?.status === 401) {
        setError('Email ou senha incorretos. Verifique suas credenciais.')
      } else if (err.isNetworkError || !err.response) {
        setError('Não foi possível conectar ao servidor. Verifique sua conexão.')
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
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo e Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/favicon.svg"
              alt="AthletIA"
              className="w-12 h-12"
            />
            <h1 className="text-3xl font-display font-bold text-light">AthletIA</h1>
          </div>
          <p className="text-white/60 text-sm">Entre na sua conta</p>
        </div>

        {/* Formulário de Login */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-2xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-white/80">Email</span>
                  <div className="relative rounded-2xl bg-white/5 border border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent pl-12 pr-4 py-3.5 text-base text-white placeholder-white/40 focus:outline-none"
                      placeholder="seu@email.com"
                      required
                      disabled={loading}
                    />
                  </div>
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-white/80">Senha</span>
                  <div className="relative rounded-2xl bg-white/5 border border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="senha"
                      type={showPassword ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="w-full bg-transparent pl-12 pr-12 py-3.5 text-base text-white placeholder-white/40 focus:outline-none"
                      placeholder="********"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-primary transition p-1"
                      disabled={loading}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l3.612 3.612M21 21l-3.612-3.612M7.5 7.5C5.093 8.758 3.375 10.82 2.25 12c1.852 2.045 5.795 5.25 9.75 5.25 1.098 0 2.164-.174 3.177-.488M15 12a3 3 0 00-3-3m0 0c-.414 0-.81.084-1.172.238m1.172-.238a3 3 0 013 3c0 .414-.084.81-.238 1.172" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c1.852-2.045 5.795-5.25 9.75-5.25s7.898 3.205 9.75 5.25c-1.852 2.045-5.795 5.25-9.75 5.25S4.102 14.045 2.25 12z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </label>

                {/* Checkbox Permanecer logado */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-primary focus:ring-2 focus:ring-primary/40 focus:ring-offset-0 cursor-pointer"
                    disabled={loading}
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-sm text-white/70 cursor-pointer select-none flex items-center gap-2"
                  >
                    <span>Permanecer logado</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/90 text-dark font-bold py-4 text-base shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Entrando...
                    </span>
                  ) : (
                    'Entrar'
                  )}
                </button>
          </form>

          <div className="text-center space-y-3 pt-4 mt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowForgotPasswordModal(true)}
              className="text-sm text-primary hover:text-primary/80 hover:underline transition"
            >
              Esqueci minha senha
            </button>
            <p className="text-white/60 text-sm">
              Não tem uma conta?{' '}
              <Link to="/?start=true" className="text-primary font-semibold hover:text-primary/80 hover:underline transition">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  )
}
