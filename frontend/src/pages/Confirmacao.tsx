import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const IconeCheck = ({ className = 'w-12 h-12 text-success' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

const IconeEmail = ({ className = 'w-5 h-5 text-primary' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 7l-10 6L2 7" />
  </svg>
)

const IconeClipboard = ({ className = 'w-6 h-6 text-primary' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h6M9 3h6a2 2 0 012 2v1h1a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h1V5a2 2 0 012-2z" />
  </svg>
)

const IconeLock = ({ className = 'w-5 h-5 text-warning' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
)

const IconeArrowRight = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
)

const IconePonto = ({ className = 'w-4 h-4 text-warning translate-y-[6px]' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" fill="currentColor" className={className}>
    <circle cx="4" cy="4" r="4" />
  </svg>
)

export default function Confirmacao() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [plano, setPlano] = useState('')

  useEffect(() => {
    if (location.state) {
      setEmail(location.state.email || '')
      setPlano(location.state.plano || '')
      
      // Disparar evento de conversão do Google Ads quando o plano estiver presente
      if (location.state.plano && typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          'send_to': 'AW-448210685/2_AoCMyDkM8bEP3N3NUB',
          'value': 1.0,
          'currency': 'BRL',
          'transaction_id': ''
        })
        
        // Disparar evento manual de assinatura paga
        ;(window as any).gtag('event', 'manual_event_SUBSCRIBE_PAID', {
          // Event parameters
        })
        
        console.log('✅ Evento de conversão do Google Ads disparado')
      }
    } else {
      // Se não tem dados, redirecionar para landing
      navigate('/')
    }
  }, [location, navigate])

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-dark via-dark-lighter to-dark">
      <div className="max-w-4xl mx-auto">
        {/* Header com ícone de sucesso */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-success/20 border-4 border-success mb-6">
            <IconeCheck />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-bold text-light mb-4">
            Parabéns!
          </h1>
          
          <p className="text-2xl md:text-3xl text-light-muted mb-2">
            Seu cadastro foi realizado com sucesso!
          </p>
          
          <p className="text-lg text-light-muted/80">
            Bem-vindo ao <span className="text-primary font-bold">AthletIA</span> - Sua transformação começa agora!
          </p>
        </div>

        {/* Card principal com informações */}
        <div className="card p-8 md:p-12 mb-8 animate-scale-in">
          {/* Email destacado */}
          <div className="bg-primary/10 border-2 border-primary/30 rounded-xl p-6 mb-8 text-center">
            <div className="text-sm text-light-muted mb-2 flex items-center justify-center gap-2">
              <IconeEmail />
              <span>E-mail de confirmação enviado para:</span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-primary break-all">{email}</div>
          </div>

          {/* Próximos passos */}
          <div className="mb-8">
            <div className="text-2xl font-display font-bold text-light mb-6 text-center flex items-center justify-center gap-2">
              <IconeClipboard />
              <span>Próximos Passos</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-dark-lighter rounded-lg border border-grey/30">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-dark font-bold text-xl flex items-center justify-center">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-light mb-1">Verifique seu e-mail</h3>
                  <p className="text-sm text-light-muted">
                    Enviamos suas credenciais de acesso para <strong>{email}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-dark-lighter rounded-lg border border-grey/30">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-dark font-bold text-xl flex items-center justify-center">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-light mb-1">Acesse sua conta</h3>
                  <p className="text-sm text-light-muted">
                    Use o usuário e senha enviados por e-mail para fazer login
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-dark-lighter rounded-lg border border-grey/30">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-dark font-bold text-xl flex items-center justify-center">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-light mb-1">Comece seus treinos</h3>
                  <p className="text-sm text-light-muted">
                    Seus treinos personalizados já estão sendo gerados especialmente para você!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Plano ativado */}
          {plano && (
            <div className="bg-success/20 border-2 border-success/50 rounded-xl p-6 mb-8 text-center">
              <div className="mb-3 flex justify-center">
                <IconeCheck className="w-10 h-10 text-success" />
              </div>
              <p className="text-success font-bold text-xl">
                Plano <span className="text-light">{plano}</span> ativado com sucesso!
              </p>
            </div>
          )}

          {/* Informações importantes */}
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-light mb-4 flex items-center gap-2">
              <IconeLock />
              <span>Informações Importantes</span>
            </h3>
            <ul className="text-sm text-light-muted space-y-2 text-left">
              <li className="flex items-start gap-2">
                <IconePonto />
                <span>Guarde suas credenciais em local seguro</span>
              </li>
              <li className="flex items-start gap-2">
                <IconePonto />
                <span>Se não receber o e-mail, verifique a pasta de spam</span>
              </li>
              <li className="flex items-start gap-2">
                <IconePonto />
                <span>O link de acesso estará no e-mail enviado</span>
              </li>
              <li className="flex items-start gap-2">
                <IconePonto />
                <span>Seus treinos estarão disponíveis após o primeiro login</span>
              </li>
            </ul>
          </div>

          {/* Botão de ação principal */}
          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-lg md:text-xl px-12 py-4 font-bold w-full md:w-auto"
            >
              <span className="flex items-center justify-center gap-2">
                <span>Ir para Tela de Login</span>
                <IconeArrowRight />
              </span>
            </button>
          </div>
        </div>

        {/* Footer com suporte */}
        <div className="text-center">
          <p className="text-sm text-light-muted mb-2">
            Não recebeu o e-mail?
          </p>
          <p className="text-sm text-primary font-semibold">
            Entre em contato com nosso suporte
          </p>
        </div>
      </div>
    </div>
  )
}

