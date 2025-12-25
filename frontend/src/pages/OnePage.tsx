import { useState, useEffect, useCallback, useRef } from 'react'
import { OnboardingData, OnboardingStep } from '../types/onboarding.types'
import { useOnboardingNavigation } from '../hooks/onboarding/useOnboardingNavigation'
import { DEFAULT_VALUES } from '../constants/onboarding.constants'
import HeroSection from '../components/onepage/HeroSection'
import ComoFuncionaSection from '../components/onepage/ComoFuncionaSection'
import OnboardingFlow from '../components/onepage/OnboardingFlow'
import ConsolidacaoSection from '../components/onepage/ConsolidacaoSection'
import CadastroSection from '../components/onepage/CadastroSection'
import ProvaValorSection from '../components/onepage/ProvaValorSection'

export default function OnePage() {
  const [step, setStep] = useState<OnboardingStep>(0)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    lesoes: [],
    preferencias: [],
    problemasAnteriores: [],
    objetivosAdicionais: []
  })

  const onboardingRef = useRef<HTMLDivElement>(null)
  const consolidacaoRef = useRef<HTMLDivElement>(null)
  const cadastroRef = useRef<HTMLDivElement>(null)

  const { nextStep, prevStep } = useOnboardingNavigation(step, setStep)

  const handleChange = useCallback((field: keyof OnboardingData, value: any) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleChangeAndAdvance = useCallback((field: keyof OnboardingData, value: any) => {
    handleChange(field, value)
    setTimeout(() => {
      nextStep()
    }, 400)
  }, [handleChange, nextStep])

  const handleArrayChange = (field: 'lesoes' | 'preferencias', value: string) => {
    setOnboardingData(prev => {
      const current = prev[field] || []
      const index = current.indexOf(value)
      if (index > -1) {
        return { ...prev, [field]: current.filter((item: string) => item !== value) }
      } else {
        return { ...prev, [field]: [...current, value] }
      }
    })
  }

  const calcularIdadeAPartirData = (data?: string | null) => {
    if (!data) return null
    const numbers = data.replace(/\D/g, '')
    if (numbers.length !== 8) return null

    const dia = parseInt(numbers.slice(0, 2), 10)
    const mes = parseInt(numbers.slice(2, 4), 10) - 1
    const ano = parseInt(numbers.slice(4, 8), 10)

    if (Number.isNaN(dia) || Number.isNaN(mes) || Number.isNaN(ano)) return null

    const dataNascimento = new Date(ano, mes, dia)
    if (Number.isNaN(dataNascimento.getTime())) return null

    const hoje = new Date()
    let idade = hoje.getFullYear() - dataNascimento.getFullYear()
    const mesAtual = hoje.getMonth()
    const diaAtual = hoje.getDate()

    if (mesAtual < mes || (mesAtual === mes && diaAtual < dia)) {
      idade--
    }

    return idade
  }

  useEffect(() => {
    if (step === 4 && !onboardingData.altura) {
      setOnboardingData((prev) => ({ ...prev, altura: DEFAULT_VALUES.altura }))
    } else if (step === 4.5 && !onboardingData.pesoAtual) {
      setOnboardingData((prev) => ({ ...prev, pesoAtual: DEFAULT_VALUES.pesoAtual }))
    } else if (step === 14 && !onboardingData.idade) {
      const idadeCalculada = calcularIdadeAPartirData(onboardingData.dataNascimento)
      setOnboardingData((prev) => ({ ...prev, idade: idadeCalculada ?? DEFAULT_VALUES.idade }))
    }
  }, [step, onboardingData.altura, onboardingData.pesoAtual, onboardingData.idade, onboardingData.dataNascimento])

  // Scroll automático quando step muda
  useEffect(() => {
    if (step > 0 && onboardingRef.current) {
      onboardingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [step])

  // Scroll para onboarding quando clicar no CTA do Hero
  const handleCtaClick = useCallback(() => {
    setStep(1)
    setTimeout(() => {
      onboardingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [])

  // Estado para controlar quando onboarding foi finalizado
  const [onboardingFinalizado, setOnboardingFinalizado] = useState(false)

  // Finalizar onboarding - scroll para consolidação
  const finalizarOnboarding = useCallback(() => {
    try {
      // Garantir que arrays existam antes de salvar
      const dataToSave: OnboardingData = {
        ...onboardingData,
        lesoes: Array.isArray(onboardingData.lesoes) ? onboardingData.lesoes : [],
        preferencias: Array.isArray(onboardingData.preferencias) ? onboardingData.preferencias : [],
        problemasAnteriores: Array.isArray(onboardingData.problemasAnteriores) ? onboardingData.problemasAnteriores : [],
        objetivosAdicionais: Array.isArray(onboardingData.objetivosAdicionais) ? onboardingData.objetivosAdicionais : [],
      }
      
      const jsonData = JSON.stringify(dataToSave)
      
      // Validar se o JSON foi criado corretamente
      if (!jsonData || jsonData === 'null' || jsonData === 'undefined') {
        throw new Error('Erro ao serializar dados do onboarding')
      }
      
      // Tentar fazer parse para validar
      const parsed = JSON.parse(jsonData)
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Dados do onboarding inválidos após serialização')
      }
      
      localStorage.setItem('onboardingData', jsonData)
      console.log('[OnePage] Dados do onboarding salvos com sucesso:', dataToSave)
      
      setOnboardingFinalizado(true)
      setTimeout(() => {
        consolidacaoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    } catch (error: any) {
      console.error('[OnePage] Erro ao salvar dados do onboarding:', {
        error,
        message: error?.message,
        onboardingData
      })
      alert('Erro ao salvar dados do onboarding. Por favor, tente novamente.')
    }
  }, [onboardingData])

  // Verificar se onboarding foi completado
  const onboardingCompleto = onboardingFinalizado

  // SEO: Atualizar título da página
  useEffect(() => {
    document.title = 'Treinos Personalizados com IA | AthletIA - Teste Grátis por 24 Horas'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Treinos inteligentes criados para o seu corpo, seus objetivos e sua rotina. Teste grátis por 24 horas. Treino personalizado com IA que evolui com você.')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark text-white">
        {/* Hero Section */}
        <HeroSection onCtaClick={handleCtaClick} />

        {/* Como Funciona */}
        <ComoFuncionaSection />

        {/* Onboarding Flow */}
        <div ref={onboardingRef}>
          {step > 0 && !onboardingFinalizado && (
            <OnboardingFlow
              step={step}
              onboardingData={onboardingData}
              setStep={setStep}
              handleChange={handleChange}
              handleChangeAndAdvance={handleChangeAndAdvance}
              handleArrayChange={handleArrayChange}
              onFinish={finalizarOnboarding}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}
        </div>

        {/* Consolidação - aparece após onboarding completo */}
        {onboardingCompleto && (
          <div ref={consolidacaoRef}>
            <ConsolidacaoSection onboardingData={onboardingData} />
          </div>
        )}

        {/* Cadastro - aparece após consolidação */}
        {onboardingCompleto && (
          <div ref={cadastroRef}>
            <CadastroSection onboardingData={onboardingData} />
          </div>
        )}

        {/* Prova de Valor - leve */}
        <ProvaValorSection />
      </div>
  )
}
