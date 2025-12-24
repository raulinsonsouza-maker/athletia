import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { useAuth } from '../contexts/AuthContext'
import { OnboardingData } from '../types/onboarding.types'
import CadastroHero from '../components/cadastro/CadastroHero'
import TrialInfoSection from '../components/cadastro/TrialInfoSection'
import CadastroForm from '../components/cadastro/CadastroForm'
import PreviaResultados from '../components/cadastro/PreviaResultados'
import PropostaValor from '../components/cadastro/PropostaValor'
import DepoimentoUnico from '../components/cadastro/DepoimentoUnico'
import GarantiaSection from '../components/cadastro/GarantiaSection'
import CTAFinal from '../components/cadastro/CTAFinal'

export default function Cadastro() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [showForm, setShowForm] = useState(false)
  
  const { setUserFromResponse } = useAuth()

  useEffect(() => {
    // Carregar dados do onboarding do localStorage
    const data = localStorage.getItem('onboardingData')
    if (!data) {
      // Se não tem dados, voltar para landing
      navigate('/')
      return
    }
    try {
      const parsedData = JSON.parse(data)
      if (!parsedData || typeof parsedData !== 'object') {
        throw new Error('Dados de onboarding inválidos')
      }
      setOnboardingData(parsedData)
    } catch (parseError) {
      console.error('Erro ao carregar dados do onboarding:', parseError)
      localStorage.removeItem('onboardingData')
      navigate('/')
    }
  }, [navigate])

  const scrollToForm = useCallback(() => {
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
      // Criar usuário com cadastro pré-pagamento
      const response = await api.post('/auth/cadastro-pre-pagamento', {
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

      // Redirecionar para dashboard (meu-plano) - usuário tem trial de 24 horas ativo
      navigate('/meu-plano')
    } catch (err: any) {
      console.error('Erro no cadastro:', err)
      
      // Tratamento específico de erros
      let errorMessage = 'Erro ao realizar cadastro'
      
      if (err.response) {
        // Erro da API
        if (err.response.status === 400) {
          errorMessage = err.response.data?.error || 'Dados inválidos. Verifique as informações e tente novamente.'
        } else if (err.response.status === 409 || err.response.data?.error?.includes('já cadastrado')) {
          errorMessage = 'Este e-mail já está cadastrado. Você pode fazer login ou usar outro e-mail.'
        } else if (err.response.status >= 500) {
          errorMessage = 'Erro no servidor. Tente novamente em alguns instantes.'
        } else {
          errorMessage = err.response.data?.error || err.response.data?.message || errorMessage
        }
      } else if (err.request) {
        // Erro de rede
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.'
      } else if (err.message) {
        // Erro de validação local
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [onboardingData, navigate, setUserFromResponse])

  // Não renderizar até os dados estarem carregados
  if (!onboardingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark via-dark-lighter to-dark">
        <div className="text-light">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark">
      {/* SEÇÃO 1 - HERO */}
      <CadastroHero onScrollToForm={scrollToForm} />

      {/* SEÇÃO 1.5 - INFORMAÇÕES SOBRE TRIAL E PLANOS */}
      <TrialInfoSection onScrollToForm={scrollToForm} />

      {/* SEÇÃO 2 - FORMULÁRIO */}
      <CadastroForm 
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        onScrollIntoView={showForm}
      />

      {/* SEÇÃO 3 - PRÉVIA DO RESULTADO */}
      <PreviaResultados onboardingData={onboardingData} />

      {/* SEÇÃO 4 - PROPOSTA DE VALOR */}
      <PropostaValor onScrollToForm={scrollToForm} />

      {/* SEÇÃO 5 - DEPOIMENTO ÚNICO */}
      <DepoimentoUnico />

      {/* SEÇÃO 6 - GARANTIA */}
      <GarantiaSection />

      {/* SEÇÃO 7 - CTA FINAL */}
      <CTAFinal onScrollToForm={scrollToForm} />
    </div>
  )
}
