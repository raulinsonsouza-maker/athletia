import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, senha)
      navigate('/meu-plano')
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
    <div className="min-h-screen bg-gradient-to-b from-dark via-dark-light to-dark text-white flex flex-col">
      <div className="px-6 pt-12 pb-10 flex flex-col gap-8 flex-1">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.6em] text-white/50">AthletIA</p>
          <h1 className="text-4xl font-semibold leading-tight">Sua jornada inteligente começa aqui</h1>
          <p className="text-white/70 text-sm max-w-sm">
            Entre e continue o plano criado pela nossa inteligência exclusiva para o seu objetivo.
          </p>
        </header>

        <section className="rounded-[36px] border border-white/10 bg-white/5 overflow-hidden relative shadow-2xl">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80"
              alt="Atleta treinando"
              className="w-full h-full object-cover opacity-40"
              onError={(e) => {
                const target = e.currentTarget
                const fallback = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80'
                if (target.src !== fallback) {
                  target.src = fallback
                } else {
                  target.style.display = 'none'
                }
              }}
            />
          </div>
          <div className="relative px-6 py-8 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">O que você vai encontrar:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-white">Plano personalizado</p>
                    <p className="text-xs text-white/60">Treinos adaptados ao seu objetivo e nível</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-white">Acompanhamento em tempo real</p>
                    <p className="text-xs text-white/60">Acompanhe sua evolução e progresso</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-white">Instruções detalhadas</p>
                    <p className="text-xs text-white/60">GIFs e orientações para cada exercício</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <main className="bg-dark-lighter/80 border border-white/10 rounded-[36px] p-6 backdrop-blur space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Acesso</p>
              <h2 className="text-2xl font-semibold">Entre com seus dados</h2>
            </div>
            <span className="text-xs text-white/60">Seguro e criptografado</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-2xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}
            <label className="space-y-2 block">
              <span className="text-sm text-white/60">Email</span>
              <div className="rounded-2xl bg-white/5 border border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/40 transition">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent px-4 py-3 text-base text-white placeholder-white/40 focus:outline-none"
                  placeholder="seu@email.com"
                  required
                  disabled={loading}
                />
              </div>
            </label>

            <label className="space-y-2 block">
              <span className="text-sm text-white/60">Senha</span>
              <div className="relative rounded-2xl bg-white/5 border border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/40 transition">
                <input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full bg-transparent px-4 py-3 pr-12 text-base text-white placeholder-white/40 focus:outline-none"
                  placeholder="********"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-primary transition"
                  disabled={loading}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l3.612 3.612M21 21l-3.612-3.612M7.5 7.5C5.093 8.758 3.375 10.82 2.25 12c1.852 2.045 5.795 5.25 9.75 5.25 1.098 0 2.164-.174 3.177-.488M15 12a3 3 0 00-3-3m0 0c-.414 0-.81.084-1.172.238m1.172-.238a3 3 0 013 3c0 .414-.084.81-.238 1.172" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c1.852-2.045 5.795-5.25 9.75-5.25s7.898 3.205 9.75 5.25c-1.852 2.045-5.795 5.25-9.75 5.25S4.102 14.045 2.25 12z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-primary text-dark font-semibold py-3 shadow-lg shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed transition"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="text-center text-white/60 text-sm">
            <p>
              Não tem uma conta?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
