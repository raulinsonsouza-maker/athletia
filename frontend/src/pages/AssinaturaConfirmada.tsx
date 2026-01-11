import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/auth.service'

const IconeCheck = ({ className = 'w-12 h-12 text-success' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

const IconeArrowRight = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
)

interface SubscriptionStatus {
  plano?: string
  planoAtivo?: boolean
  dataPagamento?: string
  dataExpiracao?: string
}

export default function AssinaturaConfirmada() {
  const navigate = useNavigate()
  const { refreshUser, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [paymentValidated, setPaymentValidated] = useState(false)
  const maxRetries = 5

  useEffect(() => {
    const verificarPagamento = async (attempt: number = 0) => {
      try {
        // Verificar se usuário está autenticado
        if (!isAuthenticated) {
          // Se não está autenticado, redirecionar para login
          // O usuário será redirecionado de volta após login
          setTimeout(() => {
            navigate('/login', { 
              replace: true,
              state: { from: '/assinatura-confirmada' }
            })
          }, 1000)
          return
        }

        // Aguardar alguns segundos para garantir que o webhook foi processado
        // Aumentar delay progressivamente em tentativas subsequentes
        const delay = attempt === 0 ? 2000 : 3000 + (attempt * 1000)
        await new Promise(resolve => setTimeout(resolve, delay))

        // Verificar status da assinatura
        const response = await api.get('/payment/status')
        
        if (response.data?.success && response.data?.user) {
          const userData = response.data.user
          setSubscriptionStatus(userData)
          
          // Sincronizar dados do usuário do backend usando refreshUser
          try {
            await refreshUser()
            console.log('✅ Dados do usuário sincronizados após pagamento')
          } catch (refreshError) {
            console.error('Erro ao sincronizar dados do usuário:', refreshError)
            // Não bloquear o fluxo se refresh falhar, mas logar o erro
          }

          // VALIDAÇÃO DE SEGURANÇA: Verificar se realmente tem plano ativo
          // Se não tiver plano ativo após algumas tentativas, pode ser acesso manual
          if (userData.planoAtivo) {
            setPaymentValidated(true)
            
            // Disparar evento de conversão do Google Ads quando plano estiver ativo
            if (typeof window !== 'undefined' && (window as any).gtag) {
              console.log('✅ Disparando evento de conversão do Google Ads na página de assinatura confirmada')
              ;(window as any).gtag('event', 'conversion', {
                'send_to': 'AW-448210685/2_AoCMyDkM8bEP3N3NUB',
                'value': 19.90,
                'currency': 'BRL'
              })
              
              // Disparar evento manual de assinatura paga
              ;(window as any).gtag('event', 'manual_event_SUBSCRIBE_PAID', {
                // Event parameters
              })
            }
            
            setLoading(false)
          } else if (attempt < maxRetries) {
            // Se plano ainda não está ativo e ainda temos tentativas, tentar novamente
            console.log(`⏳ Plano ainda não ativado. Tentativa ${attempt + 1}/${maxRetries}...`)
            setRetryCount(attempt + 1)
            setTimeout(() => verificarPagamento(attempt + 1), 3000)
            return
          } else {
            // Se plano não está ativo após todas as tentativas, pode ser acesso não autorizado
            // Redirecionar para checkout
            console.warn('⚠️ Pagamento não confirmado após todas as tentativas. Redirecionando para checkout.')
            setTimeout(() => {
              navigate('/checkout', { replace: true })
            }, 3000)
            setError('Pagamento não confirmado. Redirecionando para página de planos...')
            setLoading(false)
          }
        } else {
          // Se ainda temos tentativas, tentar novamente
          if (attempt < maxRetries) {
            console.log(`⏳ Status não disponível. Tentativa ${attempt + 1}/${maxRetries}...`)
            setRetryCount(attempt + 1)
            setTimeout(() => verificarPagamento(attempt + 1), 3000)
            return
          }
          // Se não conseguiu validar após todas as tentativas, redirecionar
          console.warn('⚠️ Não foi possível validar pagamento. Redirecionando para checkout.')
          setTimeout(() => {
            navigate('/checkout', { replace: true })
          }, 3000)
          setError('Não foi possível verificar o pagamento. Redirecionando para página de planos...')
          setLoading(false)
        }
      } catch (err: any) {
        console.error('Erro ao verificar pagamento:', err)
        
        // Se ainda temos tentativas e não é erro de autenticação, tentar novamente
        if (attempt < maxRetries && err.response?.status !== 401 && err.response?.status !== 403) {
          console.log(`⏳ Erro ao verificar. Tentativa ${attempt + 1}/${maxRetries}...`)
          setRetryCount(attempt + 1)
          setTimeout(() => verificarPagamento(attempt + 1), 3000)
          return
        }
        
        // Erro de autenticação - redirecionar para login
        if (err.response?.status === 401 || err.response?.status === 403) {
          setTimeout(() => {
            navigate('/login', { 
              replace: true,
              state: { from: '/assinatura-confirmada' }
            })
          }, 1000)
          return
        }
        
        // Outros erros - após todas as tentativas, redirecionar para checkout
        if (attempt >= maxRetries) {
          setTimeout(() => {
            navigate('/checkout', { replace: true })
          }, 3000)
        }
        setError('Erro ao verificar pagamento. Redirecionando...')
        setLoading(false)
      }
    }

    verificarPagamento()
  }, [refreshUser, isAuthenticated, navigate])

  const getPlanoLabel = (plano?: string) => {
    switch (plano) {
      case 'MENSAL':
        return 'Mensal'
      case 'TRIMESTRAL':
        return 'Trimestral'
      case 'SEMESTRAL':
        return 'Semestral'
      default:
        return plano || 'Premium'
    }
  }

  const formatarData = (data?: string) => {
    if (!data) return ''
    try {
      const date = new Date(data)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return data
    }
  }

  // Se não validou pagamento ainda e está carregando, mostrar loading
  if (loading && !paymentValidated) {
    return (
      <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-dark via-dark-lighter to-dark flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-light-muted">Verificando assinatura...</p>
          {retryCount > 0 && (
            <p className="text-sm text-light-muted mt-2">
              Tentativa {retryCount} de {maxRetries}...
            </p>
          )}
        </div>
      </div>
    )
  }

  // Se erro e vai redirecionar
  if (error && !paymentValidated) {
    return (
      <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-dark via-dark-lighter to-dark flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-warning/20 border-2 border-warning/50 rounded-xl p-6 mb-4">
            <p className="text-warning font-semibold">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Só mostra conteúdo completo se pagamento foi validado
  if (!paymentValidated) {
    return null
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-dark via-dark-lighter to-dark">
      <div className="max-w-4xl mx-auto">
        {/* Header com ícone de sucesso */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-success/20 border-4 border-success mb-6">
            <IconeCheck />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-bold text-light mb-4">
            Assinatura Confirmada!
          </h1>
          
          <p className="text-2xl md:text-3xl text-light-muted mb-2">
            Seu plano foi ativado com sucesso
          </p>
          
          <p className="text-lg text-light-muted/80">
            Bem-vindo ao <span className="text-primary font-bold">AthletIA</span> - Sua transformação começa agora!
          </p>
        </div>

        {/* Card principal com informações */}
        <div className="card p-8 md:p-12 mb-8 animate-scale-in">
          {subscriptionStatus?.planoAtivo && subscriptionStatus?.plano && (
            <div className="bg-success/20 border-2 border-success/50 rounded-xl p-6 mb-8 text-center">
              <div className="mb-3 flex justify-center">
                <IconeCheck className="w-10 h-10 text-success" />
              </div>
              <p className="text-success font-bold text-xl mb-2">
                Plano <span className="text-light">{getPlanoLabel(subscriptionStatus.plano)}</span> ativado com sucesso!
              </p>
              {subscriptionStatus.dataExpiracao && (
                <p className="text-sm text-light-muted mt-2">
                  Válido até {formatarData(subscriptionStatus.dataExpiracao)}
                </p>
              )}
            </div>
          )}

          {/* Informações do plano */}
          {subscriptionStatus && (
            <div className="space-y-4 mb-8">
              {subscriptionStatus.plano && (
                <div className="bg-dark-lighter rounded-lg p-4 border border-grey/30">
                  <p className="text-sm text-light-muted mb-1">Plano</p>
                  <p className="text-lg font-bold text-light">{getPlanoLabel(subscriptionStatus.plano)}</p>
                </div>
              )}
              
              {subscriptionStatus.dataPagamento && (
                <div className="bg-dark-lighter rounded-lg p-4 border border-grey/30">
                  <p className="text-sm text-light-muted mb-1">Data do pagamento</p>
                  <p className="text-lg font-bold text-light">{formatarData(subscriptionStatus.dataPagamento)}</p>
                </div>
              )}
              
              {subscriptionStatus.dataExpiracao && (
                <div className="bg-dark-lighter rounded-lg p-4 border border-grey/30">
                  <p className="text-sm text-light-muted mb-1">Válido até</p>
                  <p className="text-lg font-bold text-light">{formatarData(subscriptionStatus.dataExpiracao)}</p>
                </div>
              )}
            </div>
          )}

          {/* Instruções de como acessar a plataforma */}
          <div className="mb-8">
            <h3 className="text-2xl font-display font-bold text-light mb-6 text-center">
              Como Acessar Sua Plataforma
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-dark-lighter rounded-lg border border-grey/30">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-dark font-bold text-xl flex items-center justify-center">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-light mb-1">Clique no botão abaixo</h3>
                  <p className="text-sm text-light-muted">
                    Você será direcionado para sua área de membros
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-dark-lighter rounded-lg border border-grey/30">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-dark font-bold text-xl flex items-center justify-center">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-light mb-1">Acesse seus treinos personalizados</h3>
                  <p className="text-sm text-light-muted">
                    Seus treinos já estão prontos e disponíveis na plataforma
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-dark-lighter rounded-lg border border-grey/30">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-dark font-bold text-xl flex items-center justify-center">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-light mb-1">Comece sua jornada</h3>
                  <p className="text-sm text-light-muted">
                    Explore todos os recursos e funcionalidades do seu plano premium
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botão de ação principal */}
          <div className="text-center">
            <button
              onClick={() => navigate('/meu-plano')}
              className="btn-primary text-lg md:text-xl px-12 py-4 font-bold w-full md:w-auto"
            >
              <span className="flex items-center justify-center gap-2">
                <span>Acessar Minha Conta</span>
                <IconeArrowRight />
              </span>
            </button>
          </div>
        </div>

        {/* Footer com suporte */}
        <div className="text-center">
          <p className="text-sm text-light-muted mb-2">
            Dúvidas sobre sua assinatura?
          </p>
          <p className="text-sm text-primary font-semibold">
            Entre em contato com nosso suporte
          </p>
        </div>
      </div>
    </div>
  )
}
