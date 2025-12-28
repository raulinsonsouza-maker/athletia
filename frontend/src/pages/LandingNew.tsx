import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { useAuth } from '../contexts/AuthContext'
import { isAxiosError, getErrorMessage, getErrorStatus } from '../types/errors'
import { OnboardingData } from '../types/onboarding.types'
import HeroSection from '../components/landing-new/HeroSection'
import StatisticsSection from '../components/landing-new/StatisticsSection'
import FeaturesSection from '../components/landing-new/FeaturesSection'
import ResumoOnboardingSection from '../components/landing-new/ResumoOnboardingSection'
import HowItWorksSection from '../components/landing-new/HowItWorksSection'
import TestimonialsSection from '../components/landing-new/TestimonialsSection'
import CadastroFormSection from '../components/landing-new/CadastroFormSection'
import FAQSection from '../components/landing-new/FAQSection'
import CTASection from '../components/landing-new/CTASection'

export default function LandingNew() {
  const navigate = useNavigate()
  const { setUserFromResponse } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Carregar dados do onboarding do localStorage
  useEffect(() => {
    const data = localStorage.getItem('onboardingData')
    if (!data) {
      console.warn('[LandingNew] Nenhum dado de onboarding encontrado no localStorage')
      // Se não tem dados, voltar para landing (onboarding)
      navigate('/')
      return
    }
    
    try {
      const parsedData = JSON.parse(data)
      
      // Validar se é um objeto válido
      if (!parsedData || typeof parsedData !== 'object' || Array.isArray(parsedData)) {
        throw new Error('Dados de onboarding inválidos: não é um objeto válido')
      }
      
      // Garantir que arrays existam e sejam arrays válidos
      const validatedData: OnboardingData = {
        ...parsedData,
        lesoes: Array.isArray(parsedData.lesoes) ? parsedData.lesoes : [],
        preferencias: Array.isArray(parsedData.preferencias) ? parsedData.preferencias : [],
        problemasAnteriores: Array.isArray(parsedData.problemasAnteriores) ? parsedData.problemasAnteriores : [],
        objetivosAdicionais: Array.isArray(parsedData.objetivosAdicionais) ? parsedData.objetivosAdicionais : [],
      }
      
      console.log('[LandingNew] Dados do onboarding carregados com sucesso:', validatedData)
      setOnboardingData(validatedData)
    } catch (parseError: any) {
      console.error('[LandingNew] Erro ao carregar dados do onboarding:', {
        error: parseError,
        message: parseError?.message,
        data: data?.substring(0, 200),
        stack: parseError?.stack
      })
      
      // Limpar dados corrompidos
      localStorage.removeItem('onboardingData')
      
      // Redirecionar para onboarding
      navigate('/')
    }
  }, [navigate])

  const handleScrollToForm = useCallback(() => {
    setShowForm(true)
    setTimeout(() => {
      const formElement = document.getElementById('formulario-cadastro')
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }, [])

  const handleSubmit = useCallback(async (formData: {
    nomeCompleto: string
    telefone: string
    email: string
    senha: string
  }) => {
    setError('')
    setLoading(true)

    try {
      // Criar usuário com cadastro sem trial
      const response = await api.post('/auth/cadastro-sem-trial', {
        nome: formData.nomeCompleto,
        telefone: formData.telefone,
        email: formData.email,
        senha: formData.senha,
        onboarding: onboardingData,
      })

      // Verificar se a resposta contém todos os dados necessários
      if (!response.data) {
        throw new Error('Resposta do servidor inválida')
      }

      const { accessToken, refreshToken, user } = response.data

      if (!accessToken || !refreshToken || !user) {
        throw new Error('Dados incompletos na resposta do servidor')
      }

      // Atualizar contexto de autenticação diretamente com os dados do endpoint
      setUserFromResponse(user, accessToken, refreshToken)

      // Limpar dados do onboarding do localStorage após cadastro bem-sucedido
      localStorage.removeItem('onboardingData')
      
      // Limpar também dados temporários de sessão se existirem
      try {
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.startsWith('onboarding') || key.startsWith('temp_'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      } catch (error) {
        console.warn('Erro ao limpar localStorage:', error)
      }

      // Redirecionar para checkout (não para meu-plano, pois ainda não pagou)
      navigate('/checkout')
    } catch (err: unknown) {
      console.error('Erro no cadastro:', err)
      const errorMessage = getErrorMessage(err)
      const status = getErrorStatus(err)
      
      console.error('Detalhes do erro:', {
        message: errorMessage,
        status,
        isAxiosError: isAxiosError(err)
      })
      
      // Tratamento específico de erros
      let finalErrorMessage = 'Erro ao realizar cadastro'
      
      if (isAxiosError(err) && err.response) {
        // Erro da API
        if (status === 400) {
          // Verificar se há detalhes de validação
          if (err.response.data?.details && Array.isArray(err.response.data.details) && err.response.data.details.length > 0) {
            // Pegar a primeira mensagem de erro de validação
            const firstError = err.response.data.details[0]
            finalErrorMessage = firstError?.msg || firstError?.message || err.response.data.error || 'Dados inválidos. Verifique as informações e tente novamente.'
            
            // Log detalhado para debug
            console.error('Erros de validação:', err.response.data.details)
          } else {
            finalErrorMessage = err.response.data?.error || err.response.data?.message || 'Dados inválidos. Verifique as informações e tente novamente.'
          }
          
          // Log completo da resposta para debug
          console.error('Resposta completa do servidor (400):', JSON.stringify(err.response.data, null, 2))
        } else if (status === 409 || err.response.data?.error?.includes('já cadastrado')) {
          finalErrorMessage = 'Este e-mail já está cadastrado. Você pode fazer login ou usar outro e-mail.'
        } else if (status && status >= 500) {
          finalErrorMessage = err.response.data?.error || err.response.data?.message || 'Erro no servidor. Tente novamente em alguns instantes.'
        } else {
          finalErrorMessage = err.response.data?.error || err.response.data?.message || finalErrorMessage
        }
      } else if (isAxiosError(err) && err.request) {
        // Erro de rede
        finalErrorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.'
      } else {
        // Erro de validação local
        finalErrorMessage = errorMessage
      }
      
      setError(finalErrorMessage)
    } finally {
      setLoading(false)
    }
  }, [onboardingData, navigate, setUserFromResponse])


  // Não renderizar até os dados estarem carregados
  if (!onboardingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark via-dark-lighter to-dark">
        <div className="text-center">
          <div className="text-light mb-4">Carregando seus dados...</div>
          {error && (
            <div className="text-red-400 text-sm max-w-md mx-auto px-4">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark text-light">
      {/* Header minimalista - foco em conversão */}
      <header className="w-full py-4 md:py-5 px-4 md:px-6 border-b border-grey/30 sticky top-0 z-50 bg-dark/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-center items-center">
          <div className="flex items-center gap-2.5 md:gap-3">
            <img
              src="/favicon.svg"
              alt="Logo AthletIA"
              className="w-8 h-8 md:w-10 md:h-10 rounded-2xl shadow-lg"
              loading="eager"
              width="40"
              height="40"
            />
            <div className="text-lg md:text-xl font-display font-bold tracking-tight text-light">
              AthletIA
            </div>
          </div>
        </div>
      </header>

      <main role="main" id="main-content" aria-label="Conteúdo principal da landing page">
        {/* Hero com nome do usuário - primeiro */}
        <HeroSection onStartOnboarding={handleScrollToForm} nomeUsuario={onboardingData.nome} />
        
        {/* Análise do onboarding logo após hero - foco em jornada */}
        <ResumoOnboardingSection onboardingData={onboardingData} />
        
        {/* Jornada em passos pós-análise */}
        <HowItWorksSection onStartOnboarding={handleScrollToForm} />
        
        <StatisticsSection />
        <FeaturesSection onStartOnboarding={handleScrollToForm} />
        <TestimonialsSection onStartOnboarding={handleScrollToForm} />
        <CadastroFormSection 
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          onScrollIntoView={showForm}
        />
        <FAQSection />
        <CTASection onStartOnboarding={handleScrollToForm} />
      </main>

      {/* Footer minimalista - foco em conversão */}
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

