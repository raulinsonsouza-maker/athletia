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
        {/* Hero Melhorado */}
        <section className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-6 text-sm font-semibold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Seu treino personalizado está pronto!
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-light mb-4 leading-tight">
            Último Passo para Começar
            <span className="block text-primary mt-2">Sua Transformação</span>
          </h1>
          <p className="text-xl md:text-2xl text-light-muted max-w-2xl mx-auto mb-6">
            Escolha o plano ideal e tenha acesso imediato ao seu treino personalizado com IA
          </p>
          
          {/* Benefícios Rápidos */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8">
            {[
              { icon: '⚡', text: 'Acesso Imediato' },
              { icon: '🔄', text: 'Ajustes Automáticos' },
              { icon: '📊', text: 'Acompanhamento Completo' },
              { icon: '🔒', text: 'Cancelamento a Qualquer Momento' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-dark-lighter/50 px-4 py-2 rounded-lg border border-primary/20">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium text-light">{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Escolha seu plano - Melhorado */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
              Escolha o Plano Ideal para Você
            </h2>
            <p className="text-lg text-light-muted">
              Quanto mais tempo, maior a economia. Todos os planos incluem os mesmos benefícios.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {PLANOS.map((plano) => {
              const selected = planoSelecionado === plano.id

              return (
                <div
                  key={plano.id}
                  className={`relative ${
                    selected ? 'md:scale-105 z-10' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setPlanoSelecionado(plano.id)}
                    className={`relative w-full p-8 rounded-2xl text-left transition-all duration-300 ${
                      selected
                        ? 'border-2 border-primary bg-gradient-to-br from-primary/30 via-primary/15 to-primary/30 shadow-2xl shadow-primary/40'
                        : plano.popular
                        ? 'border-2 border-primary/60 bg-dark-lighter hover:border-primary hover:shadow-xl shadow-primary/20'
                        : 'border-2 border-grey/30 bg-dark-lighter hover:border-primary/50 hover:shadow-lg'
                    }`}
                  >
                    {/* Badge Mais Popular */}
                    {plano.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <span className="bg-gradient-to-r from-primary to-primary/80 text-dark text-xs font-bold px-4 py-1.5 rounded-full shadow-lg animate-pulse">
                          ⭐ MAIS POPULAR
                        </span>
                      </div>
                    )}

                    {/* Badge Selecionado */}
                    {selected && (
                      <div className="absolute -top-4 -right-4 z-10">
                        <div className="bg-primary rounded-full p-2.5 shadow-xl animate-bounce">
                          <svg className="w-6 h-6 text-dark" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Header do Plano */}
                    <div className="mb-6">
                      <h3 className="text-2xl md:text-3xl font-bold text-light mb-2">{plano.nome}</h3>
                      {plano.id === 'MENSAL' && (
                        <p className="text-sm text-light-muted">Ideal para testar</p>
                      )}
                      {plano.id === 'TRIMESTRAL' && (
                        <p className="text-sm text-light-muted">Melhor custo-benefício</p>
                      )}
                      {plano.id === 'SEMESTRAL' && (
                        <p className="text-sm text-light-muted">Máxima economia</p>
                      )}
                    </div>

                    {/* Preço Destacado */}
                    <div className="mb-6 pb-6 border-b border-grey/30">
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-xl font-semibold text-light-muted">R$</span>
                        <span className={`text-5xl md:text-6xl font-bold ${selected ? 'text-primary' : 'text-primary/90'}`}>
                          {plano.precoMensal.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <p className="text-base text-light-muted mb-4">/ mês</p>
                      
                      {plano.id !== 'MENSAL' && (
                        <div className="bg-dark/50 rounded-lg p-3 mb-3">
                          <p className="text-xs text-light-muted mb-1">Pagamento único:</p>
                          <p className="text-2xl font-bold text-light">
                            R$ {plano.preco.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      )}
                      
                      {plano.economia && (
                        <div className="bg-success/20 border border-success/50 rounded-lg p-3">
                          <p className="text-sm text-success font-bold flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {plano.economia}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Benefícios Incluídos */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-light mb-3">Inclui:</p>
                      {[
                        'Treino personalizado com IA',
                        'Ajustes automáticos diários',
                        'Histórico completo de treinos',
                        'Acompanhamento de progresso',
                        'Suporte por e-mail'
                      ].map((beneficio, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-light-muted">{beneficio}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        {/* Garantia e Segurança */}
        <section className="mb-8 max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 rounded-2xl p-6 md:p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="text-xl md:text-2xl font-bold text-light">Garantia Incondicional de 7 Dias</h3>
            </div>
            <p className="text-base text-light-muted mb-4">
              Não gostou? Devolvemos 100% do seu dinheiro. Sem perguntas. Sem burocracia.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-light-muted">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Pagamento 100% Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Cancelamento a Qualquer Momento</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Acesso Imediato</span>
              </div>
            </div>
          </div>
        </section>

        {/* Botão Continuar para o Pagamento - Melhorado */}
        <section className="mb-12 max-w-2xl mx-auto">
          {error && (
            <div className="bg-error/20 border border-error/50 text-error px-6 py-4 rounded-xl mb-6 text-center">
              <p className="font-semibold">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleContinuarParaPagamento}
              disabled={loading}
              className="relative w-full bg-gradient-to-r from-primary via-primary to-primary/90 text-dark text-xl md:text-2xl px-8 py-6 font-bold rounded-2xl shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
            >
              {/* Efeito de brilho animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {loading ? (
                <>
                  <div className="spinner h-6 w-6 border-2 border-dark"></div>
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <span>Finalizar Compra Agora</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {/* Informações de Segurança */}
            <div className="text-center space-y-2">
              <p className="text-sm text-light-muted flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Pagamento processado de forma segura e criptografada
              </p>
              <p className="text-xs text-light-muted">
                Você será redirecionado para uma página de pagamento segura
              </p>
            </div>
          </div>
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
