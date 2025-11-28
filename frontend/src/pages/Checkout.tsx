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
        <section className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-3 leading-tight">
            Seu Plano Personalizado Está Pronto.
          </h1>
          <p className="text-lg md:text-xl text-light-muted">
            Escolha um plano e avance para o pagamento seguro.
          </p>
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
