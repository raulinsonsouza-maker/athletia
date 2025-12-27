import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { useAuth } from '../contexts/AuthContext'
import { OnboardingData } from '../types/onboarding.types'
import CadastroHero from '../components/cadastro/CadastroHero'
import ResumoOnboarding from '../components/cadastro/ResumoOnboarding'
import ProcessoTimeline from '../components/cadastro/ProcessoTimeline'
import BeneficiosSection from '../components/cadastro/BeneficiosSection'
import PlanosSection from '../components/cadastro/PlanosSection'
import CadastroForm from '../components/cadastro/CadastroForm'
import PropostaValor from '../components/cadastro/PropostaValor'
import PreviaResultados from '../components/cadastro/PreviaResultados'
import FAQCadastro from '../components/cadastro/FAQCadastro'
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
      console.warn('[Cadastro] Nenhum dado de onboarding encontrado no localStorage')
      // Se não tem dados, voltar para landing
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
      
      console.log('[Cadastro] Dados do onboarding carregados com sucesso:', validatedData)
      setOnboardingData(validatedData)
    } catch (parseError: any) {
      console.error('[Cadastro] Erro ao carregar dados do onboarding:', {
        error: parseError,
        message: parseError?.message,
        data: data?.substring(0, 200), // Primeiros 200 caracteres para debug
        stack: parseError?.stack
      })
      
      // Limpar dados corrompidos
      localStorage.removeItem('onboardingData')
      
      // Mostrar mensagem de erro mais detalhada
      setError('Erro ao carregar dados do onboarding. Por favor, complete o processo novamente.')
      
      // Redirecionar após um pequeno delay para mostrar o erro
      setTimeout(() => {
        navigate('/')
      }, 2000)
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

      // Redirecionar para dashboard (meu-plano) - usuário tem trial de 3 dias ativo
      navigate('/meu-plano')
    } catch (err: any) {
      console.error('Erro no cadastro:', err)
      console.error('Detalhes do erro:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        stack: err.stack
      })
      
      // Tratamento específico de erros
      let errorMessage = 'Erro ao realizar cadastro'
      
      if (err.response) {
        // Erro da API
        if (err.response.status === 400) {
          // Verificar se há detalhes de validação
          if (err.response.data?.details && Array.isArray(err.response.data.details) && err.response.data.details.length > 0) {
            // Pegar a primeira mensagem de erro de validação
            const firstError = err.response.data.details[0]
            errorMessage = firstError?.msg || firstError?.message || err.response.data.error || 'Dados inválidos. Verifique as informações e tente novamente.'
            
            // Log detalhado para debug
            console.error('Erros de validação:', err.response.data.details)
          } else {
            errorMessage = err.response.data?.error || err.response.data?.message || 'Dados inválidos. Verifique as informações e tente novamente.'
          }
          
          // Log completo da resposta para debug
          console.error('Resposta completa do servidor (400):', JSON.stringify(err.response.data, null, 2))
        } else if (err.response.status === 409 || err.response.data?.error?.includes('já cadastrado')) {
          errorMessage = 'Este e-mail já está cadastrado. Você pode fazer login ou usar outro e-mail.'
        } else if (err.response.status >= 500) {
          errorMessage = err.response.data?.error || err.response.data?.message || 'Erro no servidor. Tente novamente em alguns instantes.'
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
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark">
      {/* SEÇÃO 1 - HERO: "Seu plano está quase finalizado" */}
      <CadastroHero onScrollToForm={scrollToForm} />

      {/* SEÇÃO 2 - COMO VOCÊ ESTÁ AGORA: Dados do onboarding */}
      <ResumoOnboarding onboardingData={onboardingData} />

      {/* SEÇÃO 3 - COMO FUNCIONA O PROCESSO: Timeline simples */}
      <ProcessoTimeline onScrollToForm={scrollToForm} />

      {/* SEÇÃO 4 - BENEFÍCIOS: Lista simples e resumida */}
      <BeneficiosSection onScrollToForm={scrollToForm} />

      {/* SEÇÃO 5 - VALORES DOS PLANOS: Após 3 dias */}
      <PlanosSection onScrollToForm={scrollToForm} />

      {/* SEÇÃO 6 - FORMULÁRIO DE CADASTRO: Com texto claro */}
      <CadastroForm 
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        onScrollIntoView={showForm}
      />

      {/* SEÇÃO 7 - O QUE A PLATAFORMA FAZ: Proposta de valor */}
      <PropostaValor onScrollToForm={scrollToForm} />

      {/* SEÇÃO 8 - RESULTADOS: Prévia dos resultados */}
      <PreviaResultados onboardingData={onboardingData} />

      {/* SEÇÃO 9 - FAQ: Perguntas frequentes */}
      <FAQCadastro />

      {/* SEÇÃO 10 - CTA FINAL: Última chamada */}
      <CTAFinal onScrollToForm={scrollToForm} />
    </div>
  )
}
