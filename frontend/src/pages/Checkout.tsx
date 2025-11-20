import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import InputMask from 'react-input-mask'

interface Planos {
  id: string
  nome: string
  preco: number
  periodo: string
  desconto?: string
  popular?: boolean
  economia?: string
}

const PLANOS: Planos[] = [
  {
    id: 'MENSAL',
    nome: 'Mensal',
    preco: 19.90,
    periodo: 'por mês',
    desconto: '0%',
  },
  {
    id: 'TRIMESTRAL',
    nome: 'Trimestral',
    preco: 49.90,
    periodo: 'a cada 3 meses',
    desconto: '16%',
    economia: 'Economize R$ 9,80',
  },
  {
    id: 'SEMESTRAL',
    nome: 'Semestral',
    preco: 89.90,
    periodo: 'a cada 6 meses',
    desconto: '25%',
    popular: true,
    economia: 'Economize R$ 29,50',
  },
]

export default function Checkout() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const { showToast, ToastContainer } = useToast()
  const [planoSelecionado, setPlanoSelecionado] = useState<string>('SEMESTRAL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tempoRestante, setTempoRestante] = useState(15 * 60) // 15 minutos em segundos
  const [ofertaExpirada, setOfertaExpirada] = useState(false)

  // Scroll para o topo ao carregar a página
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Timer de urgência
  useEffect(() => {
    // Verificar se já existe timestamp salvo
    const timestampSalvo = localStorage.getItem('checkoutTimerStart')
    let startTime: number

    if (timestampSalvo) {
      startTime = parseInt(timestampSalvo)
    } else {
      startTime = Date.now()
      localStorage.setItem('checkoutTimerStart', startTime.toString())
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remaining = 15 * 60 - elapsed

      if (remaining <= 0) {
        setTempoRestante(0)
        setOfertaExpirada(true)
        clearInterval(interval)
      } else {
        setTempoRestante(remaining)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatarTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60)
    const segs = segundos % 60
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`
  }

  // Calcular valores do plano selecionado
  const planoSelecionadoObj = PLANOS.find(p => p.id === planoSelecionado)
  const totalAPagar = planoSelecionadoObj?.preco || 0
  const precoMensal = planoSelecionadoObj?.id === 'MENSAL' 
    ? planoSelecionadoObj.preco 
    : planoSelecionadoObj?.id === 'TRIMESTRAL' 
      ? planoSelecionadoObj.preco / 3 
      : planoSelecionadoObj.preco / 6

  const handleAtivarPlano = async () => {
    if (!user?.id) {
      showToast('Erro: usuário não encontrado. Faça login novamente.', 'error')
      navigate('/login')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/ativar-plano-pagamento', {
        userId: user.id,
        plano: planoSelecionado
      })

      // Atualizar estado do usuário com dados do backend
      if (response.data?.user) {
        const userAtualizado = {
          ...response.data.user,
          planoAtivo: response.data.user.planoAtivo ?? true,
          plano: response.data.user.plano ?? planoSelecionado
        }
        
        // Atualizar contexto e localStorage
        updateUser(userAtualizado)
        
        console.log('✅ Usuário atualizado com plano ativo:', userAtualizado)
        console.log('📦 Dados salvos no localStorage')
      } else {
        console.warn('⚠️ Resposta do backend não contém dados do usuário, atualizando manualmente')
        // Atualizar manualmente mesmo sem resposta completa
        updateUser({
          planoAtivo: true,
          plano: planoSelecionado
        })
        console.log('✅ Estado atualizado manualmente')
      }
      
      // Verificar se o estado foi atualizado corretamente
      const userData = localStorage.getItem('user')
      if (userData) {
        const parsedUser = JSON.parse(userData)
        console.log('🔍 Estado atual do usuário no localStorage:', {
          id: parsedUser.id,
          planoAtivo: parsedUser.planoAtivo,
          plano: parsedUser.plano
        })
      }

      showToast('Plano ativado com sucesso! Treinos gerados automaticamente.', 'success')
      
      // Limpar timer do localStorage
      localStorage.removeItem('checkoutTimerStart')
      
      // Aguardar um momento para garantir que o estado foi atualizado
      // Usar window.location.href para forçar reload completo e garantir que o AuthContext
      // seja recarregado do localStorage com os dados atualizados
      setTimeout(() => {
        console.log('🔄 Redirecionando para dashboard...')
        // Usar window.location.href para forçar reload completo
        // Isso garante que o AuthContext seja recarregado do localStorage
        // e o ProtectedRoute veja o estado atualizado
        window.location.href = '/dashboard'
      }, 1000)
    } catch (err: any) {
      console.error('❌ Erro ao ativar plano:', err)
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Erro ao ativar plano. Tente novamente.'
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
    <div className="min-h-screen">
      <ToastContainer />
      
      {/* Header */}
      <div className="w-full py-6 px-6 border-b border-grey/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-3xl font-display font-bold text-primary">AthletIA</div>
        </div>
      </div>

      <main className="container-custom section">
        {/* Headline Impactante */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-light mb-4">
            Seu Plano Personalizado Está Pronto
          </h1>
          <p className="text-xl text-light-muted">
            Complete seu cadastro e comece sua transformação hoje
          </p>
        </div>

        {/* Timer de Urgência */}
        <div className={`card mb-8 ${ofertaExpirada ? 'border-warning/50 bg-warning/10' : 'border-primary/50 bg-primary/10'}`}>
          <div className="flex items-center justify-center gap-3 py-4">
            <svg className={`w-6 h-6 ${ofertaExpirada ? 'text-warning' : 'text-primary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {ofertaExpirada ? (
              <p className="text-warning font-bold text-lg">Oferta Expirada</p>
            ) : (
              <>
                <p className="text-primary font-bold text-lg">Oferta expira em:</p>
                <p className="text-primary font-bold text-2xl font-mono">{formatarTempo(tempoRestante)}</p>
              </>
            )}
          </div>
        </div>

        {/* Prova Social */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="card text-center p-4">
            <div className="text-3xl font-bold text-primary mb-1">10k+</div>
            <div className="text-sm text-light-muted">Usuários ativos</div>
          </div>
          <div className="card text-center p-4">
            <div className="text-3xl font-bold text-primary mb-1">4.9/5</div>
            <div className="text-sm text-light-muted">Avaliação média</div>
          </div>
          <div className="card text-center p-4">
            <div className="text-3xl font-bold text-primary mb-1">95%</div>
            <div className="text-sm text-light-muted">Taxa de satisfação</div>
          </div>
        </div>

        {/* Planos */}
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-light mb-8 text-center">
            Escolha seu Plano
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANOS.map((plano) => {
              const selected = planoSelecionado === plano.id
              const precoMensal = plano.id === 'MENSAL' 
                ? plano.preco 
                : plano.id === 'TRIMESTRAL' 
                  ? plano.preco / 3 
                  : plano.preco / 6

              return (
                <button
                  key={plano.id}
                  type="button"
                  onClick={() => setPlanoSelecionado(plano.id)}
                  className={`relative p-6 rounded-2xl text-left transition-all duration-300 ${
                    selected
                      ? 'border-2 border-primary bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20 scale-105 shadow-2xl shadow-primary/30'
                      : plano.popular
                      ? 'border-2 border-primary/50 bg-dark-lighter hover:border-primary hover:scale-[1.02]'
                      : 'border border-grey/50 bg-dark-lighter hover:border-primary/50 hover:scale-[1.02]'
                  }`}
                >
                  {/* Badge Mais Popular */}
                  {plano.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-dark text-xs font-bold px-4 py-1 rounded-full">
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
                  <div className="mb-5">
                    <h3 className="text-2xl font-bold text-light">{plano.nome}</h3>
                  </div>

                  {/* Preço */}
                  <div className="mb-5 pb-5 border-b border-grey/30">
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-xl font-semibold text-light-muted">R$</span>
                      <span className="text-5xl font-bold text-primary">{precoMensal.toFixed(2)}</span>
                    </div>
                    <p className="text-base text-light-muted mb-2">{plano.periodo}</p>
                    {plano.id !== 'MENSAL' && (
                      <div className="mt-3 pt-3 border-t border-grey/20">
                        <p className="text-xs text-light-muted mb-1">Total do período:</p>
                        <p className="text-lg font-bold text-light">
                          R$ {plano.preco.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {plano.economia && (
                      <p className="text-sm text-success font-semibold mt-2">{plano.economia}</p>
                    )}
                  </div>

                  {/* Benefícios */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-light font-medium">Treinos personalizados</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-light font-medium">Acompanhamento de progresso</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-light font-medium">Ajustes automáticos</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-light font-medium">Suporte completo</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Garantias e Benefícios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="card p-6 bg-primary/10 border-2 border-primary/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-light">Garantia de 7 dias</h3>
                <p className="text-sm text-primary font-semibold">100% do seu dinheiro de volta</p>
              </div>
            </div>
            <p className="text-base text-light leading-relaxed mb-3">
              Não ficou satisfeito? Devolvemos 100% do seu investimento, sem perguntas.
            </p>
            <div className="flex items-center gap-2 text-sm text-light-muted">
              <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Sem compromisso</span>
              <span className="mx-2">•</span>
              <span>Sem renovação automática</span>
              <span className="mx-2">•</span>
              <span>Resultados ou dinheiro de volta</span>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold text-light mb-4">O que você está comprando</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-semibold text-light text-sm mb-1">Treinos personalizados para os próximos 30 dias</div>
                  <div className="text-xs text-light-muted">Criados por IA baseados no seu perfil físico e objetivos</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-semibold text-light text-sm mb-1">Ajustes automáticos baseados no seu progresso</div>
                  <div className="text-xs text-light-muted">O sistema adapta cargas e exercícios conforme você evolui</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-semibold text-light text-sm mb-1">Acompanhamento de evolução com métricas</div>
                  <div className="text-xs text-light-muted">Visualize seu progresso com gráficos e estatísticas detalhadas</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-semibold text-light text-sm mb-1">Suporte completo durante todo o período</div>
                  <div className="text-xs text-light-muted">Tire dúvidas e receba orientações sempre que precisar</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-semibold text-light text-sm mb-1">Acesso imediato após pagamento</div>
                  <div className="text-xs text-light-muted">Seus treinos serão gerados automaticamente em segundos</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-semibold text-light text-sm mb-1">Sem renovação automática</div>
                  <div className="text-xs text-light-muted">Você decide quando continuar, sem compromisso</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo do Plano Selecionado */}
        {planoSelecionadoObj && (
          <div className="card p-6 md:p-8 mb-8 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20 border-2 border-primary/50">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-light mb-2">
                Resumo do Plano Selecionado
              </h2>
              <p className="text-light-muted">Confira os detalhes antes de finalizar</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-dark-lighter/50 rounded-xl p-5 border border-primary/20">
                <div className="text-sm text-light-muted mb-2">Plano</div>
                <div className="text-2xl font-bold text-light">{planoSelecionadoObj.nome}</div>
                <div className="text-sm text-light-muted mt-1">{planoSelecionadoObj.periodo}</div>
              </div>
              
              <div className="bg-dark-lighter/50 rounded-xl p-5 border border-primary/20">
                <div className="text-sm text-light-muted mb-2">Total a Pagar</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-semibold text-light-muted">R$</span>
                  <span className="text-4xl font-bold text-primary">{totalAPagar.toFixed(2)}</span>
                </div>
                {planoSelecionadoObj.id !== 'MENSAL' && (
                  <div className="text-sm text-light-muted mt-2">
                    Equivale a R$ {precoMensal.toFixed(2)}/mês
                  </div>
                )}
              </div>
            </div>

            {planoSelecionadoObj.economia && (
              <div className="bg-success/10 border border-success/30 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-success font-bold text-lg">{planoSelecionadoObj.economia}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Escassez */}
        <div className="card p-6 mb-10 bg-warning/10 border-warning/30 text-center">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-warning font-semibold">
              Últimas vagas disponíveis - Oferta limitada
            </p>
          </div>
        </div>

        {/* Formulário de Pagamento */}
        <div className="card p-6 md:p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-light mb-6 text-center">
            Dados de Pagamento
          </h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="label-field text-sm">Nome no Cartão *</label>
              <input
                type="text"
                className="input-field"
                placeholder="Nome como está no cartão"
                required
              />
            </div>

            <div>
              <label className="label-field text-sm">Número do Cartão *</label>
              <InputMask
                mask="9999 9999 9999 9999"
                placeholder="0000 0000 0000 0000"
              >
                {(inputProps: any) => (
                  <input
                    {...inputProps}
                    type="text"
                    className="input-field"
                    required
                  />
                )}
              </InputMask>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field text-sm">Validade *</label>
                <InputMask
                  mask="99/99"
                  placeholder="MM/AA"
                >
                  {(inputProps: any) => (
                    <input
                      {...inputProps}
                      type="text"
                      className="input-field"
                      required
                    />
                  )}
                </InputMask>
              </div>

              <div>
                <label className="label-field text-sm">CVV *</label>
                <InputMask
                  mask="999"
                  placeholder="000"
                >
                  {(inputProps: any) => (
                    <input
                      {...inputProps}
                      type="text"
                      className="input-field"
                      required
                    />
                  )}
                </InputMask>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-light-muted">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Seus dados estão protegidos com criptografia SSL</span>
            </div>
          </div>

          {error && (
            <div className="bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <button
            onClick={handleAtivarPlano}
            disabled={loading}
            className="btn-primary text-xl px-8 py-5 font-bold w-full shadow-lg shadow-primary/30 hover:scale-105 transition-transform flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="spinner h-5 w-5"></div>
                Processando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Ativar Plano e Gerar Meus Treinos Agora</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>

          <p className="text-sm text-light-muted text-center mt-4">
            Seus treinos serão gerados automaticamente em segundos após o pagamento
          </p>
        </div>
      </main>
    </div>
  )
}

