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

export default function PagamentoSucesso() {
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verificarPagamento = async () => {
      try {
        // Aguardar alguns segundos para garantir que o webhook foi processado
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Verificar status da assinatura
        const response = await api.get('/payment/status')
        
        if (response.data?.success && response.data?.user) {
          setSubscriptionStatus(response.data.user)
          
          // Atualizar dados do usuário no contexto
          if (updateUser) {
            updateUser({
              planoAtivo: response.data.user.planoAtivo,
              plano: response.data.user.plano
            })
          }

          // Disparar evento de conversão do Google Ads quando plano estiver ativo
          if (response.data.user.planoAtivo && typeof window !== 'undefined' && (window as any).gtag) {
            console.log('✅ Disparando evento de conversão do Google Ads na página de pagamento sucesso')
            ;(window as any).gtag('event', 'conversion', {
              'send_to': 'AW-448210685/2_AoCMyDkM8bEP3N3NUB',
              'value': 1.0,
              'currency': 'BRL',
              'transaction_id': ''
            })
          }
        } else {
          setError('Não foi possível verificar o status do pagamento. Mas não se preocupe, se o pagamento foi aprovado, seu plano será ativado em breve.')
        }
      } catch (err: any) {
        console.error('Erro ao verificar pagamento:', err)
        // Não mostrar erro crítico, pois o webhook pode ainda estar processando
        setError('Verificando status do pagamento... Se o pagamento foi aprovado, seu plano será ativado em breve.')
      } finally {
        setLoading(false)
      }
    }

    verificarPagamento()
  }, [updateUser])

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

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-dark via-dark-lighter to-dark">
      <div className="max-w-4xl mx-auto">
        {/* Header com ícone de sucesso */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-success/20 border-4 border-success mb-6">
            <IconeCheck />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-bold text-light mb-4">
            Pagamento Realizado!
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
          {loading ? (
            <div className="text-center py-8">
              <div className="spinner h-12 w-12 mx-auto mb-4"></div>
              <p className="text-light-muted">Verificando status do pagamento...</p>
            </div>
          ) : error ? (
            <div className="bg-warning/20 border-2 border-warning/50 rounded-xl p-6 mb-6 text-center">
              <p className="text-warning font-semibold">{error}</p>
            </div>
          ) : subscriptionStatus ? (
            <>
              {/* Plano ativado */}
              {subscriptionStatus.planoAtivo && subscriptionStatus.plano && (
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
            </>
          ) : null}

          {/* Próximos passos */}
          <div className="mb-8">
            <h3 className="text-2xl font-display font-bold text-light mb-6 text-center">
              Próximos Passos
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-dark-lighter rounded-lg border border-grey/30">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-dark font-bold text-xl flex items-center justify-center">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-light mb-1">Acesse seus treinos</h3>
                  <p className="text-sm text-light-muted">
                    Seus treinos personalizados já estão disponíveis na plataforma
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-dark-lighter rounded-lg border border-grey/30">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-dark font-bold text-xl flex items-center justify-center">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-light mb-1">Comece sua jornada</h3>
                  <p className="text-sm text-light-muted">
                    Acesse o dashboard e comece a usar todos os recursos do seu plano
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
            Dúvidas sobre seu pagamento?
          </p>
          <p className="text-sm text-primary font-semibold">
            Entre em contato com nosso suporte
          </p>
        </div>
      </div>
    </div>
  )
}

