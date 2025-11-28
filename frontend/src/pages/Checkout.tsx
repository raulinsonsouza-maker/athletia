import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'

interface Planos {
  id: string
  nome: string
  preco: number
  precoMensal: number
  periodo: string
  economia?: string
  popular?: boolean
}

const PLANOS: Planos[] = [
  {
    id: 'MENSAL',
    nome: 'Mensal',
    preco: 19.90,
    precoMensal: 19.90,
    periodo: 'por mês',
  },
  {
    id: 'TRIMESTRAL',
    nome: 'Trimestral',
    preco: 49.90,
    precoMensal: 16.63,
    periodo: 'a cada 3 meses',
    economia: 'Economize R$ 9,80',
  },
  {
    id: 'SEMESTRAL',
    nome: 'Semestral',
    preco: 89.90,
    precoMensal: 14.98,
    periodo: 'a cada 6 meses',
    economia: 'Economize R$ 29,50',
    popular: true,
  },
]

export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast, ToastContainer } = useToast()
  const [planoSelecionado, setPlanoSelecionado] = useState<string>('SEMESTRAL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Scroll para o topo ao carregar a página
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleContinuarParaPagamento = async () => {
    if (!user?.id || !user?.email) {
      showToast('Erro: usuário não encontrado. Faça login novamente.', 'error')
      navigate('/login')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Gerar URL de checkout do Cakto
      const response = await api.post('/payment/checkout', {
        plano: planoSelecionado,
        email: user.email,
        userId: user.id
      })

      if (response.data?.checkoutUrl) {
        // Redirecionar para o checkout do Cakto
        console.log('🔄 Redirecionando para checkout Cakto...')
        window.location.href = response.data.checkoutUrl
      } else {
        throw new Error('URL de checkout não recebida')
      }
    } catch (err: any) {
      console.error('❌ Erro ao gerar checkout:', err)
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Erro ao processar checkout. Tente novamente.'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      
      // Se for erro de autenticação, redirecionar para login
      if (err.response?.status === 401 || err.response?.status === 403) {
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark">
      <ToastContainer />
      
      {/* Header Simples */}
      <header className="sticky top-0 z-50 w-full py-4 px-4 border-b border-grey/20 bg-dark/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-xl md:text-2xl font-display font-bold text-primary">AthletIA</div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-light-muted">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Pagamento 100% Seguro</span>
          </div>
        </div>
      </header>

      <main className="container-custom section pb-20 pt-8">
        {/* Hero */}
        <section className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-3 leading-tight">
            Seu Plano Personalizado Está Pronto.
          </h1>
          <p className="text-lg md:text-xl text-light-muted mb-6">
            Escolha um plano e avance para o pagamento seguro.
          </p>
        </section>

        {/* Blocos de Confiança Compactos */}
        <section className="mb-8 animate-fade-in">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-light-muted mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="font-semibold text-light">4.9/5</span>
            </div>
            <span className="hidden md:inline">•</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-light">10.000+</span>
              <span>usuários</span>
            </div>
            <span className="hidden md:inline">•</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-light">95%</span>
              <span>satisfação</span>
            </div>
            <span className="hidden md:inline">•</span>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Garantia 7 dias</span>
            </div>
            <span className="hidden md:inline">•</span>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>SSL</span>
            </div>
            <span className="hidden md:inline">•</span>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <span>Sem renovação automática</span>
            </div>
          </div>
        </section>

        {/* O que você recebe */}
        <section className="mb-8 animate-fade-in">
          <div className="card p-5 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-light mb-4 text-center">O Que Você Recebe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-light">Treinos personalizados por IA</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-light">Ajustes automáticos conforme seu progresso</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-light">Demonstrações em vídeo</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-light">Gráficos e evolução visual</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-light">Acesso imediato após pagamento</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-light">Suporte</span>
              </div>
            </div>
          </div>
        </section>

        {/* Escolha seu plano */}
        <section className="mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-light mb-6 text-center">
            Escolha seu Plano
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {PLANOS.map((plano) => {
              const selected = planoSelecionado === plano.id

              return (
                <button
                  key={plano.id}
                  type="button"
                  onClick={() => setPlanoSelecionado(plano.id)}
                  className={`relative p-6 rounded-xl text-left transition-all duration-300 ${
                    selected
                      ? 'border-2 border-primary bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20 scale-105 shadow-2xl shadow-primary/30'
                      : plano.popular
                      ? 'border-2 border-primary/50 bg-dark-lighter hover:border-primary hover:scale-[1.02]'
                      : 'border border-grey/50 bg-dark-lighter hover:border-primary/50 hover:scale-[1.02]'
                  }`}
                >
                  {/* Badge Mais Popular */}
                  {plano.popular && !selected && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-primary text-dark text-xs font-bold px-3 py-1 rounded-full">
                        MAIS POPULAR
                      </span>
                    </div>
                  )}

                  {/* Badge Selecionado */}
                  {selected && (
                    <div className="absolute -top-3 -right-3 z-10">
                      <div className="bg-primary rounded-full p-2 shadow-lg">
                        <svg className="w-5 h-5 text-dark" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Header do Plano */}
                  <div className="mb-4">
                    <h3 className="text-xl md:text-2xl font-bold text-light">{plano.nome}</h3>
                  </div>

                  {/* Preço */}
                  <div className="mb-4 pb-4 border-b border-grey/30">
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-lg font-semibold text-light-muted">R$</span>
                      <span className="text-4xl md:text-5xl font-bold text-primary">{plano.precoMensal.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-light-muted mb-2">/ mês</p>
                    {plano.id !== 'MENSAL' && (
                      <div className="mt-2">
                        <p className="text-xs text-light-muted mb-1">Total:</p>
                        <p className="text-lg font-bold text-light">
                          R$ {plano.preco.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {plano.economia && (
                      <p className="text-sm text-success font-bold mt-2">{plano.economia}</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Botão Continuar para o Pagamento */}
        <section className="mb-8 max-w-2xl mx-auto">
          {error && (
            <div className="bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <button
            onClick={handleContinuarParaPagamento}
            disabled={loading}
            className="btn-primary text-lg md:text-xl px-8 py-5 font-bold w-full shadow-lg shadow-primary/30 hover:scale-105 transition-transform flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <div className="spinner h-5 w-5"></div>
                Processando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Continuar para o Pagamento
              </>
            )}
          </button>
        </section>

        {/* Footer */}
        <footer className="py-6 px-4 border-t border-grey/20 mt-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm">
              <a href="#" className="text-light-muted hover:text-primary transition-colors">Termos de Serviço</a>
              <a href="#" className="text-light-muted hover:text-primary transition-colors">Política de Privacidade</a>
              <a href="#" className="text-light-muted hover:text-primary transition-colors">Política de Reembolso</a>
            </div>
            <p className="text-center text-xs text-light-muted mt-4">
              © {new Date().getFullYear()} AthletIA. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
