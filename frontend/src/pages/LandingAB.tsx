import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { useAuth } from '../contexts/AuthContext'
import { isAxiosError, getErrorMessage, getErrorStatus } from '../types/errors'
import { OnboardingData } from '../types/onboarding.types'
import HeroSection from '../components/landing-ab/HeroSection'
import OnboardingFormSection from '../components/landing-ab/OnboardingFormSection'
import PlansSection from '../components/landing-ab/PlansSection'

export default function LandingAB() {
  const navigate = useNavigate()
  const { setUserFromResponse } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    lesoes: [],
    preferencias: [],
    problemasAnteriores: [],
    objetivosAdicionais: []
  })
  const [selectedPlan, setSelectedPlan] = useState<'MENSAL' | 'TRIMESTRAL'>('TRIMESTRAL')
  const formRef = useRef<HTMLDivElement>(null)

  const handleScrollToForm = useCallback(() => {
    setTimeout(() => {
      const formElement = document.getElementById('formulario-onboarding')
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }, [])

  const handleOnboardingChange = useCallback((data: OnboardingData) => {
    setOnboardingData(data)
  }, [])

  const redirecionarParaCheckoutCakto = useCallback(async (novoUsuario: { id: string; email: string }) => {
    if (!novoUsuario?.email) {
      setError('Não conseguimos identificar seu e-mail para o pagamento. Tente novamente.')
      return false
    }

    try {
      const checkoutResponse = await api.post('/payment/checkout', {
        plano: selectedPlan,
        email: novoUsuario.email,
        userId: novoUsuario.id,
        source: 'landing_ab_test'
      })

      if (!checkoutResponse.data?.checkoutUrl) {
        throw new Error('URL de checkout não recebida')
      }

      window.location.href = checkoutResponse.data.checkoutUrl
      return true
    } catch (checkoutError: any) {
      console.error('[LandingAB] Erro ao gerar checkout do Cakto:', checkoutError)
      const errorMessage =
        checkoutError.response?.data?.error ||
        checkoutError.response?.data?.message ||
        'Não foi possível abrir a tela de pagamento agora. Tente novamente em instantes.'

      setError(errorMessage)
      return false
    }
  }, [selectedPlan])

  const handleSubmit = useCallback(async (formData: {
    nomeCompleto: string
    telefone: string
    email: string
    senha: string
  }) => {
    console.log('[LandingAB] Iniciando submit do formulário de cadastro', {
      email: formData.email,
      temNome: !!formData.nomeCompleto,
      temTelefone: !!formData.telefone,
      temSenha: !!formData.senha,
      temOnboarding: !!onboardingData,
      onboardingKeys: Object.keys(onboardingData)
    })
    
    setError('')
    setLoading(true)

    // Validar campos obrigatórios do onboarding
    const requiredFields: (keyof OnboardingData)[] = [
      'sexo', 'idade', 'altura', 'pesoAtual', 'tipoCorpo', 'aguaDiaria',
      'experiencia', 'objetivo', 'frequenciaSemanal', 'tempoDisponivel', 'localTreino'
    ]

    const missingFields = requiredFields.filter(field => !onboardingData[field])
    
    if (missingFields.length > 0) {
      setError(`Por favor, preencha todos os campos obrigatórios: ${missingFields.join(', ')}`)
      setLoading(false)
      return
    }

    // Garantir que lesoes existe e tem pelo menos um item
    if (!onboardingData.lesoes || onboardingData.lesoes.length === 0) {
      setError('Por favor, selecione pelo menos uma opção para lesões.')
      setLoading(false)
      return
    }

    try {
      // Preparar dados do onboarding com nome sincronizado
      const onboardingDataCompleto: OnboardingData = {
        ...onboardingData,
        nome: formData.nomeCompleto,
        lesoes: onboardingData.lesoes || [],
        preferencias: onboardingData.preferencias || [],
        problemasAnteriores: onboardingData.problemasAnteriores || [],
        objetivosAdicionais: onboardingData.objetivosAdicionais || []
      }

      // Criar usuário com cadastro sem trial
      console.log('[LandingAB] Enviando requisição para /auth/cadastro-sem-trial')
      const response = await api.post('/auth/cadastro-sem-trial', {
        nome: formData.nomeCompleto,
        telefone: formData.telefone,
        email: formData.email,
        senha: formData.senha,
        onboarding: onboardingDataCompleto,
      })
      
      console.log('[LandingAB] Resposta recebida do backend:', {
        hasUser: !!response.data?.user,
        hasTokens: !!(response.data?.accessToken && response.data?.refreshToken)
      })

      // Verificar se a resposta contém todos os dados necessários
      if (!response.data) {
        throw new Error('Resposta do servidor inválida')
      }

      const { accessToken, refreshToken, user } = response.data

      if (!accessToken || !refreshToken || !user) {
        throw new Error('Dados incompletos na resposta do servidor')
      }

      // Atualizar contexto de autenticação
      setUserFromResponse(user, accessToken, refreshToken)

      // Registrar evento de analytics
      try {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'form_submitted', {
            event_category: 'AB_Test',
            event_label: 'LandingAB_FormSubmitted'
          })
          (window as any).gtag('event', 'plan_selected', {
            event_category: 'AB_Test',
            event_label: `LandingAB_Plan_${selectedPlan}`
          })
        }
      } catch (analyticsError) {
        console.warn('[LandingAB] Erro ao registrar analytics:', analyticsError)
      }

      console.log('[LandingAB] Redirecionando para checkout')
      const redirecionado = await redirecionarParaCheckoutCakto(user)
      if (redirecionado) {
        console.log('[LandingAB] Redirecionamento para checkout bem-sucedido')
        return
      }
    } catch (err: unknown) {
      console.error('[LandingAB] Erro no cadastro:', err)
      const errorMessage = getErrorMessage(err)
      const status = getErrorStatus(err)
      
      console.error('[LandingAB] Detalhes do erro:', {
        message: errorMessage,
        status,
        isAxiosError: isAxiosError(err),
        response: isAxiosError(err) ? err.response?.data : null
      })
      
      // Tratamento específico de erros
      let finalErrorMessage = 'Erro ao realizar cadastro'
      
      if (isAxiosError(err) && err.response) {
        if (status === 400) {
          if (err.response.data?.details && Array.isArray(err.response.data.details) && err.response.data.details.length > 0) {
            const firstError = err.response.data.details[0]
            finalErrorMessage = firstError?.msg || firstError?.message || err.response.data.error || 'Dados inválidos. Verifique as informações e tente novamente.'
          } else {
            finalErrorMessage = err.response.data?.error || err.response.data?.message || 'Dados inválidos. Verifique as informações e tente novamente.'
          }
        } else if (status === 409 || err.response.data?.error?.includes('já cadastrado') || err.response.data?.error?.includes('já está cadastrado')) {
          finalErrorMessage = 'Este e-mail já está cadastrado. Você pode fazer login ou usar outro e-mail.'
        } else if (status && status >= 500) {
          finalErrorMessage = err.response.data?.error || err.response.data?.message || 'Erro no servidor. Tente novamente em alguns instantes.'
        } else {
          finalErrorMessage = err.response.data?.error || err.response.data?.message || finalErrorMessage
        }
      } else if (isAxiosError(err) && err.request) {
        console.error('[LandingAB] Erro de rede - requisição não chegou ao servidor')
        finalErrorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.'
      } else {
        console.error('[LandingAB] Erro de validação local:', errorMessage)
        finalErrorMessage = errorMessage
      }
      
      console.error('[LandingAB] Mensagem de erro final para o usuário:', finalErrorMessage)
      setError(finalErrorMessage)
    } finally {
      setLoading(false)
    }
  }, [onboardingData, setUserFromResponse, redirecionarParaCheckoutCakto, selectedPlan])

  // Estado para rastrear dados do formulário de cadastro (para calcular formReady)
  const [formDataReady, setFormDataReady] = useState<{
    nomeCompleto: boolean
    email: boolean
    telefone: boolean
    senha: boolean
  }>({
    nomeCompleto: false,
    email: false,
    telefone: false,
    senha: false
  })

  // Calcular se formulário está pronto para mostrar planos
  const formReady = !!(
    formDataReady.nomeCompleto &&
    formDataReady.email &&
    formDataReady.telefone &&
    formDataReady.senha &&
    onboardingData.sexo &&
    onboardingData.idade &&
    onboardingData.altura &&
    onboardingData.pesoAtual &&
    onboardingData.experiencia &&
    onboardingData.objetivo &&
    onboardingData.frequenciaSemanal
  )

  // Registrar evento de visualização da página
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'ab_test_viewed', {
          event_category: 'AB_Test',
          event_label: 'LandingAB_Viewed'
        })
      }
    } catch (error) {
      console.warn('[LandingAB] Erro ao registrar evento de analytics:', error)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark text-light">
      {/* Header */}
      <header className="w-full py-4 md:py-5 px-4 md:px-6 border-b border-grey/30 sticky top-0 z-50 bg-dark/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5 md:gap-3">
            <img
              src="/favicon.svg"
              alt="Logo AthletIA - Treino Personalizado Inteligente com IA"
              className="w-8 h-8 md:w-10 md:h-10 rounded-2xl shadow-lg"
              loading="eager"
              width="40"
              height="40"
            />
            <div className="text-lg md:text-xl font-display font-bold tracking-tight text-light">AthletIA</div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="text-sm md:text-base font-semibold bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-dark px-4 py-2 md:px-5 md:py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Entrar
          </button>
        </div>
      </header>

      <main role="main" id="main-content" aria-label="Conteúdo principal da landing page">
        {/* Hero Section */}
        <HeroSection onStartOnboarding={handleScrollToForm} />
        
        {/* Formulário Completo do Onboarding */}
        <OnboardingFormSection 
          onboardingData={onboardingData}
          onFormChange={handleOnboardingChange}
          onFormDataChange={setFormDataReady}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />

        {/* Seção de Planos - aparece quando formulário está pronto */}
        <PlansSection 
          selectedPlan={selectedPlan}
          onPlanSelect={setSelectedPlan}
          formReady={formReady}
        />

        {/* CTA Final */}
        {formReady && (
          <section className="py-12 px-4 md:px-6 bg-gradient-to-b from-dark-lighter/30 to-dark">
            <div className="max-w-4xl mx-auto text-center">
              <button
                type="button"
                onClick={() => {
                  const form = document.querySelector('form')
                  if (form) {
                    form.requestSubmit()
                  }
                }}
                disabled={loading || !selectedPlan}
                className="w-full btn-primary py-5 text-lg md:text-xl font-bold shadow-2xl shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 max-w-md mx-auto"
              >
                {loading ? 'Criando conta...' : 'Finalizar Cadastro e Continuar para Pagamento'}
              </button>
              <p className="text-sm text-light-muted mt-4">
                Você será redirecionado para a tela de pagamento segura
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Footer minimalista */}
      <footer className="py-8 px-4 md:px-6 border-t border-grey/20 bg-dark-lighter/30">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-light-muted">
            &copy; {new Date().getFullYear()} AthletIA. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
