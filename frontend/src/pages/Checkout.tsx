import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import { PLANOS_CHECKOUT } from '../constants/planos-precos'

// Registrar evento de analytics (não bloqueia se falhar)
const registrarEventoAnalytics = (eventType: string, properties?: any) => {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('analytics:event', {
        detail: { eventType, properties }
      }))
    }
  } catch (error) {
    console.error('Erro ao registrar evento de analytics:', error)
  }
}

type PlanoCheckout = (typeof PLANOS_CHECKOUT)[number]

const PLANOS: PlanoCheckout[] = [...PLANOS_CHECKOUT]

export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast, ToastContainer } = useToast()
  const [planoSelecionado, setPlanoSelecionado] = useState<string>('MENSAL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
    // Registrar evento de paywall visualizado
    registrarEventoAnalytics('paywall_viewed', {
      screen: 'checkout',
      reason: 'trial_expired'
    })
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
      const response = await api.post('/payment/checkout', {
        plano: planoSelecionado,
        email: user.email,
        userId: user.id
      })

      if (response.data?.checkoutUrl) {
        // Registrar evento de início de assinatura
        registrarEventoAnalytics('subscription_started', {
          plan: planoSelecionado,
          source: 'checkout'
        })
        window.location.href = response.data.checkoutUrl
      } else {
        throw new Error('URL de checkout não recebida')
      }
    } catch (err: any) {
      console.error('Erro ao gerar checkout:', err)
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Erro ao processar checkout. Tente novamente.'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      
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
      
      <main className="container-custom section pb-20 pt-12">
        {/* Header Direto */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-light mb-4">
            Desbloquear Meu Plano
          </h1>
          <p className="text-lg md:text-xl text-light-muted max-w-2xl mx-auto">
            Mantenha seu progresso e continue sua evolução
          </p>
        </div>

        {/* Planos - Layout Direto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-12">
          {PLANOS.map((plano) => {
            const selected = planoSelecionado === plano.id

            return (
              <div
                key={plano.id}
                className={`relative ${selected ? 'md:scale-105 z-10' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => setPlanoSelecionado(plano.id)}
                  className={`relative w-full p-6 rounded-2xl text-left transition-all duration-300 flex flex-col h-full ${
                    selected
                      ? 'border-2 border-primary bg-gradient-to-br from-primary/30 via-primary/15 to-primary/30 shadow-2xl shadow-primary/40'
                      : plano.popular
                      ? 'border-2 border-primary/60 bg-dark-lighter hover:border-primary hover:shadow-xl shadow-primary/20'
                      : 'border-2 border-grey/30 bg-dark-lighter hover:border-primary/50 hover:shadow-lg'
                  }`}
                >
                  {/* Badge Mais Popular */}
                  {plano.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-primary to-primary/80 text-dark text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        MAIS POPULAR
                      </span>
                    </div>
                  )}

                  {/* Badge Selecionado */}
                  {selected && (
                    <div className="absolute -top-3 -right-3 z-10">
                      <div className="bg-primary rounded-full p-2 shadow-xl">
                        <svg className="w-5 h-5 text-dark" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Nome do Plano */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-light mb-1">{plano.nome}</h3>
                  </div>

                  {/* Preço */}
                  <div className="mb-4 pb-4 border-b border-grey/30">
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-lg font-semibold text-light-muted">R$</span>
                      <span className={`text-4xl md:text-5xl font-bold ${selected ? 'text-primary' : 'text-primary/90'}`}>
                        {plano.precoMensal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <p className="text-sm text-light-muted mb-3">/ mês</p>
                    
                    {plano.id !== 'MENSAL' && (
                      <div className="bg-dark/50 rounded-lg p-2 mb-2">
                        <p className="text-xs text-light-muted mb-1">Pagamento único:</p>
                        <p className="text-xl font-bold text-light">
                          R$ {plano.preco.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    )}
                    
                    {plano.economia && (
                      <div className="bg-success/20 border border-success/50 rounded-lg p-2">
                        <p className="text-xs text-success font-bold flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {plano.economia}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Benefícios Resumidos */}
                  <div className="space-y-2 flex-1">
                    {[
                      'Treino personalizado com IA',
                      'Ajustes automáticos',
                      'Histórico completo',
                      'Acompanhamento de progresso'
                    ].map((beneficio, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs text-light-muted">{beneficio}</span>
                      </div>
                    ))}
                  </div>
                </button>
              </div>
            )
          })}
        </div>

        {/* CTA Principal - Destaque Máximo */}
        <div className="max-w-2xl mx-auto mb-8">
          {error && (
            <div className="bg-error/20 border border-error/50 text-error px-6 py-4 rounded-xl mb-6 text-center">
              <p className="font-semibold">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleContinuarParaPagamento}
              disabled={loading}
              className="relative w-full bg-gradient-to-r from-primary via-primary to-primary/90 text-dark text-xl md:text-2xl px-8 py-6 font-bold rounded-2xl shadow-2xl shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {loading ? (
                <>
                  <div className="spinner h-6 w-6 border-2 border-dark"></div>
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <span>Continuar para pagamento</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            <div className="text-center space-y-2">
              <p className="text-sm text-light-muted flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Pagamento 100% seguro
              </p>
            </div>
          </div>
        </div>

        {/* Garantia Simplificada */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-dark-lighter border border-grey/30 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="text-lg font-bold text-light">Garantia de 7 dias</h3>
            </div>
            <p className="text-sm text-light-muted">
              Não gostou? Devolvemos 100% do seu dinheiro. Sem perguntas.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
