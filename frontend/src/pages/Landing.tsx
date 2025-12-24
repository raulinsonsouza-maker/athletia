import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import LegalModal from '../components/legal/LegalModal'
import TermosContent from '../components/legal/TermosContent'
import PrivacidadeContent from '../components/legal/PrivacidadeContent'
import CookiesContent from '../components/legal/CookiesContent'
import MobileNumberPicker from '../components/MobileNumberPicker'
import { OnboardingData, OnboardingStep } from '../types/onboarding.types'
import { useOnboardingNavigation } from '../hooks/onboarding/useOnboardingNavigation'
import { useOnboardingAnalytics } from '../hooks/onboarding/useOnboardingAnalytics'
import { useGenderContent } from '../hooks/onboarding/useGenderContent'
import OnboardingHeader from '../components/onboarding/OnboardingHeader'
import OnboardingFooter from '../components/onboarding/OnboardingFooter'
import FeedbackCard from '../components/onboarding/FeedbackCard'
import LandingHero from '../components/landing/LandingHero'
import ComparisonTable from '../components/landing/ComparisonTable'
import StepIdade from '../components/onboarding/steps/StepIdade'
import StepSexo from '../components/onboarding/steps/StepSexo'
import { DEFAULT_VALUES } from '../constants/onboarding.constants'
import { 
  AGUA_OPCOES, 
  OBJETIVO_OPCOES_FEMININO, 
  OBJETIVO_OPCOES_MASCULINO,
  EXPERIENCIA_OPCOES,
  FREQUENCIA_OPCOES,
  TEMPO_OPCOES,
  LOCAL_TREINO_OPCOES,
  PROBLEMAS_ANTERIORES_OPCOES,
  OBJETIVOS_ADICIONAIS_OPCOES,
  LESOES_OPCOES,
  TIPO_CORPO_FEMININO,
  TIPO_CORPO_MASCULINO
} from '../constants/onboarding.constants'

export default function Landing() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [step, setStep] = useState<OnboardingStep>(0)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    lesoes: [],
    preferencias: [],
    problemasAnteriores: [],
    objetivosAdicionais: []
  })
  
  // Estados para modais legais
  const [modalTermos, setModalTermos] = useState(false)
  const [modalPrivacidade, setModalPrivacidade] = useState(false)
  const [modalCookies, setModalCookies] = useState(false)

  // Hooks customizados
  const { nextStep, prevStep } = useOnboardingNavigation(step, setStep)
  const { analiseAgua, analiseCondicionamento } = useOnboardingAnalytics(onboardingData)
  const genderContent = useGenderContent(onboardingData)

  const handleChange = useCallback((field: keyof OnboardingData, value: any) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Função para escolhas únicas que avança automaticamente
  const handleChangeAndAdvance = useCallback((field: keyof OnboardingData, value: any) => {
    handleChange(field, value)
    // Aguarda um delay para dar feedback visual antes de avançar
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

  const finalizarOnboarding = useCallback(() => {
    localStorage.setItem('onboardingData', JSON.stringify(onboardingData))
    navigate('/cadastro')
  }, [onboardingData, navigate])

  // Sinalizar quando deve mostrar o popup de instalação PWA
  // Mostrar quando estiver no último passo (step 15) e nome estiver preenchido
  useEffect(() => {
    if (step === 15 && onboardingData.nome && onboardingData.nome.trim().length >= 2) {
      // Sinalizar que o onboarding está completo e deve mostrar o popup
      sessionStorage.setItem('pwa-show-onboarding-complete', 'true')
    } else {
      // Limpar o flag se não estiver no passo final
      sessionStorage.removeItem('pwa-show-onboarding-complete')
    }
  }, [step, onboardingData.nome])

  // Scroll automático para o topo quando o step muda (importante para mobile)
  useEffect(() => {
    if (step > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [step])

  // Função para iniciar o onboarding com tracking de conversão
  const iniciarOnboarding = useCallback(() => {
    // Disparar evento de conversão do Google Ads
    if (typeof window !== 'undefined' && (window as any).gtag_report_conversion) {
      (window as any).gtag_report_conversion()
    }
    setStep(1)
  }, [])

  // Detectar parâmetro start=true na URL e iniciar onboarding automaticamente
  useEffect(() => {
    const startParam = searchParams.get('start')
    if (startParam === 'true' && step === 0) {
      // Remover parâmetro da URL para limpar
      setSearchParams({}, { replace: true })
      // Iniciar onboarding
      iniciarOnboarding()
    }
  }, [searchParams, step, setSearchParams, iniciarOnboarding])

  // Tela inicial - Landing Page Completa
  if (step === 0) {
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

        <main role="main" id="main-content">
          {/* SEÇÃO 1 – HERO ULTRA AGRESSIVO */}
          <LandingHero 
            onStartOnboarding={iniciarOnboarding}
          />

          {/* SEÇÃO 2 – A DOR QUE IMPEDE EVOLUÇÃO */}
          <section aria-label="A dor que impede sua evolução" className="py-16 md:py-20 px-4 md:px-6 border-t border-grey/20">
            <div className="max-w-3xl mx-auto space-y-6 text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light">
                A dor que impede sua evolução
              </h2>
              <p className="text-lg md:text-xl text-light-muted leading-relaxed">
                Você não evolui porque treina com rotinas genéricas que não foram feitas para o seu corpo.
              </p>
              <p className="text-xl md:text-2xl font-display font-semibold text-light">
                Seu corpo muda. Seu treino precisa mudar junto.
              </p>
              <div className="pt-6">
                <button
                  onClick={iniciarOnboarding}
                  className="btn-primary text-base md:text-lg px-10 md:px-14 py-4 md:py-5 font-bold shadow-xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Quero meu treino personalizado
                </button>
              </div>
            </div>
          </section>

          {/* SEÇÃO 4 – O QUE VOCÊ GANHA */}
          <section aria-label="O que você ganha" className="py-16 md:py-20 px-4 md:px-6 bg-gradient-to-b from-dark via-dark-lighter/30 to-dark">
            <div className="max-w-6xl mx-auto space-y-8 text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light">
                O que você ganha
              </h2>
              <p className="text-lg md:text-xl text-light-muted max-w-3xl mx-auto">
                Conteúdo sobre treino, saúde, evolução física e qualidade de vida. Aprenda estratégias práticas para acelerar seus resultados.
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
                {[
                  {
                    icon: (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    ),
                    title: 'Treinos personalizados',
                    description: 'O AthletIA cria um plano de treinamento exclusivo com base no seu nível de condicionamento físico, objetivos e equipamentos disponíveis.'
                  },
                  {
                    icon: (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ),
                    title: 'Evolução automática',
                    description: 'A IA ajusta automaticamente peso, repetições e volume a cada treino baseado no seu desempenho real. Você só treina, o sistema evolui.'
                  },
                  {
                    icon: (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    ),
                    title: 'Progresso visível',
                    description: 'Mantenha-se motivado com acompanhamento de progresso em tempo real, estatísticas detalhadas e conquistas para comemorar suas vitórias.'
                  },
                  {
                    icon: (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    ),
                    title: '300 exercícios validados',
                    description: 'Do iniciante ao avançado, explore uma biblioteca com mais de 300 exercícios com guias em vídeo para garantir a forma correta e maximizar os resultados.'
                  },
                  {
                    icon: (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    ),
                    title: 'Funciona em qualquer academia',
                    description: 'Em casa ou na academia, o AthletIA adapta seu plano ao seu ambiente. Sem equipamentos? Sem problemas. Treine onde e quando quiser.'
                  },
                  {
                    icon: (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    ),
                    title: 'Garantia',
                    description: 'Teste por 7 dias. Não gostou, devolvemos 100% do valor. Zero riscos. Comece sua jornada de transformação com total segurança e confiança.'
                  }
                ].map((beneficio, index) => (
                  <div key={index} className="bg-dark-lighter rounded-xl p-6 border border-grey/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all h-full flex flex-col group">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 group-hover:bg-primary/30 mb-5 mx-auto transition-colors">
                      <div className="text-primary">
                        {beneficio.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-light mb-3 text-center">
                      {beneficio.title}
                    </h3>
                    <p className="text-light-muted text-sm leading-relaxed flex-grow text-center">
                      {beneficio.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SEÇÃO 3 – COMO FUNCIONA */}
          <section id="como-funciona" aria-label="Como funciona o sistema de treino personalizado" className="py-16 md:py-20 px-4 md:px-6 bg-dark-lighter/50 border-y border-grey/20">
            <div className="max-w-6xl mx-auto space-y-8 text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light">
                Como funciona
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 pt-8">
                {[
                  {
                    numero: 1,
                    titulo: 'Responda perguntas rápidas'
                  },
                  {
                    numero: 2,
                    titulo: 'A IA analisa seu corpo e objetivo'
                  },
                  {
                    numero: 3,
                    titulo: 'Gera um treino completo em segundos'
                  },
                  {
                    numero: 4,
                    titulo: 'Ajusta peso, repetições e volume automaticamente a cada treino'
                  }
                ].map((passo) => (
                  <div key={passo.numero} className="space-y-4">
                    <div className="h-16 w-16 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-primary mx-auto">
                      {passo.numero}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg md:text-xl font-bold text-light">{passo.titulo}</h3>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8">
                <button
                  onClick={iniciarOnboarding}
                  className="btn-primary text-lg md:text-xl px-10 md:px-16 py-5 md:py-6 font-bold shadow-2xl shadow-primary/50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
                >
                  Criar meu treino em 2 minutos
                </button>
              </div>
            </div>
          </section>

          {/* SEÇÃO 5 – DEPOIMENTOS */}
          <section aria-label="Depoimentos" className="py-16 md:py-20 px-4 md:px-6 bg-gradient-to-b from-dark-lighter/50 to-dark">
            <div className="max-w-6xl mx-auto space-y-8 md:space-y-10">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light">
                  O que as pessoas estão dizendo sobre o <span className="text-primary">AthletIA</span> por aí?
                </h2>
                <p className="text-lg md:text-xl text-light-muted max-w-3xl mx-auto">
                  Junte-se a milhares de usuários em todo o mundo e experimente o futuro do treinamento personalizado. Baixe agora e comece sua jornada!
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                {/* Depoimento 1 - Miguel */}
                <div className="rounded-2xl border border-grey/20 bg-dark-lighter p-6 space-y-4 shadow-xl h-full flex flex-col">
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-base md:text-lg font-medium text-light leading-relaxed flex-grow">
                    "Aplicativo incrível! Os treinos personalizados me mantêm motivado e estou vendo um progresso real!"
                  </p>
                  <p className="text-sm text-light-muted font-semibold">Miguel S.</p>
                </div>

                {/* Depoimento 2 - Ana */}
                <div className="rounded-2xl border border-grey/20 bg-dark-lighter p-6 space-y-4 shadow-xl h-full flex flex-col">
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-base md:text-lg font-medium text-light leading-relaxed flex-grow">
                    "Super fácil de usar e repleto de recursos incríveis. Acompanhar meu progresso nunca foi tão simples!"
                  </p>
                  <p className="text-sm text-light-muted font-semibold">Ana M.</p>
                </div>

                {/* Depoimento 3 - João */}
                <div className="rounded-2xl border border-grey/20 bg-dark-lighter p-6 space-y-4 shadow-xl h-full flex flex-col">
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-base md:text-lg font-medium text-light leading-relaxed flex-grow">
                    "Em casa ou na academia, o AthletIA adapta seu plano ao seu ambiente. Sem equipamentos? Sem problemas."
                  </p>
                  <p className="text-sm text-light-muted font-semibold">João R.</p>
                </div>
              </div>

              <div className="pt-6 text-center">
                <button
                  onClick={iniciarOnboarding}
                  className="btn-primary text-base md:text-lg px-10 md:px-14 py-4 md:py-5 font-bold shadow-xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Quero resultados assim
                </button>
              </div>
            </div>
          </section>

          {/* SEÇÃO 6 – A COMPARAÇÃO QUE IMPORTA */}
          <ComparisonTable onStartOnboarding={iniciarOnboarding} />

          {/* SEÇÃO 6.5 – POR QUE ATHLETIA */}
          <section aria-label="Por que AthletIA" className="py-16 md:py-20 px-4 md:px-6 bg-gradient-to-br from-dark via-dark-lighter/30 to-dark">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Lado esquerdo - Visual placeholder (pode adicionar imagem de app depois) */}
                <div className="hidden md:block">
                  <div className="relative">
                    <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl border border-primary/30 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="w-32 h-56 bg-dark-lighter rounded-3xl mx-auto border-4 border-primary/30 shadow-2xl"></div>
                        <p className="text-light-muted text-sm">Visualização do App</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lado direito - Benefícios */}
                <div className="space-y-8">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light">
                    Por que <span className="text-primary">AthletIA</span>?
                  </h2>
                  
                  <div className="space-y-6">
                    {[
                      {
                        title: 'Inteligente e adaptável',
                        description: 'A IA do AthletIA aprende com seu desempenho e se ajusta para mantê-lo desafiado.'
                      },
                      {
                        title: 'Todos os níveis são bem-vindos',
                        description: 'De iniciantes a entusiastas do fitness, o AthletIA atende a todos os níveis de experiência.'
                      },
                      {
                        title: 'Conveniência em primeiro lugar',
                        description: 'Treine quando e onde quiser. Chega de perder treinos por falta de planejamento.'
                      },
                      {
                        title: 'Sem suposições',
                        description: 'Obtenha orientação especializada sem o alto custo de um personal trainer.'
                      }
                    ].map((beneficio, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-light mb-2">
                            {beneficio.title}
                          </h3>
                          <p className="text-light-muted leading-relaxed">
                            {beneficio.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SEÇÃO 7 – GARANTIA */}
          <section aria-label="Garantia" className="py-16 md:py-20 px-4 md:px-6 bg-gradient-to-br from-primary/20 via-primary/10 to-dark border-y border-primary/30">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light">
                Garantia
              </h2>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-primary leading-relaxed">
                Teste por 7 dias. Não gostou, devolvemos 100% do valor. Zero riscos.
              </p>
            </div>
          </section>

          {/* SEÇÃO 8 – CTA FINAL */}
          <section aria-label="Chamada para ação final" className="py-20 md:py-28 px-4 md:px-6 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
            <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-dark leading-tight drop-shadow-lg">
                Seu treino inteligente está a 2 minutos. Evolução real começa agora.
              </h2>
              <div className="pt-6">
                <button
                  onClick={iniciarOnboarding}
                  className="bg-dark text-primary text-xl md:text-2xl px-12 md:px-20 py-6 md:py-8 font-black shadow-2xl shadow-dark/50 hover:scale-[1.05] active:scale-[0.95] transition-all duration-200 rounded-2xl border-4 border-dark/20 hover:border-dark/40"
                >
                  Começar agora
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Rodapé */}
        <footer role="contentinfo" className="py-10 md:py-12 px-4 md:px-6 border-t border-grey/20 bg-dark">
          <div className="max-w-6xl mx-auto space-y-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-primary font-display font-bold text-lg md:text-xl">AthletIA</span>
              </div>
              <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6 text-xs md:text-sm text-light-muted">
                <button
                  onClick={() => setModalTermos(true)}
                  className="hover:text-primary transition-colors"
                >
                  Termos
                </button>
                <button
                  onClick={() => setModalPrivacidade(true)}
                  className="hover:text-primary transition-colors"
                >
                  Privacidade
                </button>
                <button
                  onClick={() => setModalCookies(true)}
                  className="hover:text-primary transition-colors"
                >
                  Cookies
                </button>
              </div>
            </div>
            <div className="text-[11px] md:text-xs text-light-muted space-y-1">
              <p>Consulte seu médico antes de iniciar qualquer programa de exercícios</p>
              <p>© 2025 AthletIA</p>
            </div>
          </div>
        </footer>

        {/* Modais Legais */}
        <LegalModal
          isOpen={modalTermos}
          onClose={() => setModalTermos(false)}
          title="Termos de Uso"
        >
          <TermosContent />
        </LegalModal>

        <LegalModal
          isOpen={modalPrivacidade}
          onClose={() => setModalPrivacidade(false)}
          title="Política de Privacidade"
        >
          <PrivacidadeContent />
        </LegalModal>

        <LegalModal
          isOpen={modalCookies}
          onClose={() => setModalCookies(false)}
          title="Política de Cookies"
        >
          <CookiesContent />
        </LegalModal>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-dark via-dark-lighter to-dark">
      {/* Header com progresso */}
      <OnboardingHeader step={step} />

      {/* Conteúdo principal - estilo MadMuscles: uma pergunta por vez, centralizada */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-4xl w-full">
          {/* Passo 1: Idade */}
          {step === 1 && (
            <StepIdade 
              onboardingData={onboardingData}
              onSelect={(value) => handleChangeAndAdvance('idade', value)}
            />
          )}

          {/* Passo 2: Sexo */}
          {step === 2 && (
            <StepSexo 
              onboardingData={onboardingData}
              onSelect={(value) => handleChangeAndAdvance('sexo', value)}
            />
          )}

          {/* Passo 3: Tipo de Corpo */}
          {step === 3 && (
            <div className="text-center animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                {genderContent.tipoCorpo.title}
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                {genderContent.tipoCorpo.subtitle}
              </p>
              <p className="text-sm text-light-muted mb-8">
                {genderContent.tipoCorpo.desc}
              </p>
              
              <div className={`grid grid-cols-1 ${onboardingData.sexo === 'Feminino' ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-4'} gap-6 mt-8`}>
                {(onboardingData.sexo === 'Feminino' ? TIPO_CORPO_FEMININO : TIPO_CORPO_MASCULINO).map((tipo) => {
                  const selected = onboardingData.tipoCorpo === tipo.value
                  return (
                    <button
                      key={tipo.value}
                      type="button"
                      onClick={() => handleChangeAndAdvance('tipoCorpo', tipo.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleChangeAndAdvance('tipoCorpo', tipo.value)
                        }
                      }}
                      className={`relative overflow-hidden rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                        selected
                          ? 'ring-4 ring-primary scale-105'
                          : 'ring-2 ring-slate-300 hover:ring-primary/50'
                      }`}
                      aria-label={`Selecionar tipo de corpo: ${tipo.label}`}
                      aria-pressed={selected}
                    >
                      <div className="w-full aspect-[3/4] bg-dark-lighter">
                        <img 
                          src={tipo.image} 
                          alt={`Treino personalizado para ${tipo.label} - Sistema inteligente de treinos adaptativos`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          width="300"
                          height="400"
                          onError={(e) => {
                            e.currentTarget.src = `https://via.placeholder.com/300x400/4A4946/F9A620?text=${tipo.label}`
                          }}
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-4">
                        <div className="text-white font-bold text-xl mb-1">{tipo.label}</div>
                        <div className="text-white/80 text-sm">{tipo.desc}</div>
                      </div>
                      {selected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Passo 4: Altura */}
          {step === 4 && (
            <div className="text-center animate-fade-in max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-8">
                Qual é a sua altura?
              </h2>
              <p className="text-light-muted mb-6 text-lg">
                Ajuste deslizando — selecionamos a altura exata para montar seus treinos.
              </p>

              <div className="max-w-xs mx-auto mt-8">
                <MobileNumberPicker
                  min={120}
                  max={230}
                  value={onboardingData.altura ?? 170}
                  onChange={(valor) => handleChange('altura', valor)}
                  unit="cm"
                />
                <p className="text-xs text-light-muted mt-4">Arraste para cima ou para baixo para ajustar.</p>
              </div>
            </div>
          )}

          {/* Passo 4.5: Peso */}
          {step === 4.5 && (
            <div className="text-center animate-fade-in max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-8">
                Qual é o seu peso atual?
              </h2>
              <p className="text-light-muted mb-6 text-lg">
                Use o seletor para informar o peso atual. Ajustamos automaticamente conforme sua evolução.
              </p>

              <div className="max-w-xs mx-auto mt-8 space-y-6">
                <MobileNumberPicker
                  min={35}
                  max={250}
                  value={onboardingData.pesoAtual ?? 70}
                  onChange={(valor) => handleChange('pesoAtual', valor)}
                  unit="kg"
                />

                {onboardingData.altura && onboardingData.pesoAtual && (
                  <div className="bg-primary/15 border border-primary/40 rounded-lg p-4">
                    <p className="text-xs text-light-muted uppercase tracking-wide">Seu IMC estimado</p>
                    <p className="text-3xl font-bold text-primary mt-1">
                      {(() => {
                        const alturaMetros = (onboardingData.altura ?? 170) / 100
                        if (alturaMetros <= 0) return '—'
                        const imcValor = onboardingData.pesoAtual / (alturaMetros * alturaMetros)
                        return imcValor.toFixed(1)
                      })()}
                    </p>
                    <p className="text-xs text-light-muted mt-2">
                      {(() => {
                        const alturaMetros = (onboardingData.altura ?? 170) / 100
                        if (alturaMetros <= 0) return '—'
                        const imc = onboardingData.pesoAtual / (alturaMetros * alturaMetros)
                        if (imc < 18.5) return 'Abaixo do peso'
                        if (imc < 25) return 'Peso normal'
                        if (imc < 30) return 'Sobrepeso'
                        return 'Obesidade'
                      })()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Passo 5: Consumo de Água */}
          {step === 5 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Quanta água você bebe diariamente?
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                A hidratação adequada é fundamental para o desempenho e recuperação
              </p>
              <p className="text-sm text-light-muted mb-8">
                Isso nos ajuda a personalizar recomendações de hidratação para seus treinos
              </p>
              
              <div className="grid grid-cols-1 gap-4 mt-8 max-w-2xl mx-auto">
                {AGUA_OPCOES.map((agua) => {
                  const selected = onboardingData.aguaDiaria === agua.value
                  return (
                    <button
                      key={agua.value}
                      type="button"
                      onClick={() => {
                        handleChange('aguaDiaria', agua.value)
                        // Após selecionar, ir automaticamente para feedback após 600ms
                        setTimeout(() => {
                          setStep(5.5)
                        }, 600)
                      }}
                      className={`relative overflow-hidden rounded-lg transition-all p-4 text-left ${
                        selected
                          ? 'ring-4 ring-primary scale-105 bg-dark-lighter'
                          : 'ring-2 ring-slate-300 hover:ring-primary/50 bg-dark-lighter'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold text-lg mb-1">{agua.label}</div>
                          <div className="text-white/80 text-sm">{agua.desc}</div>
                        </div>
                      </div>
                      {selected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Passo 5.5: Feedback de Água */}
          {step === 5.5 && (
            <FeedbackCard analise={analiseAgua} tipo="agua" />
          )}

          {/* Passo 6: Objetivo */}
          {step === 6 && (
            <div className="text-center animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                {genderContent.objetivos.title}
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                {genderContent.objetivos.subtitle}
              </p>
              <p className="text-sm text-light-muted mb-8">
                {genderContent.objetivos.desc}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {(onboardingData.sexo === 'Feminino' ? OBJETIVO_OPCOES_FEMININO : OBJETIVO_OPCOES_MASCULINO).map((obj) => {
                  const selected = onboardingData.objetivo === obj.value
                  return (
                    <button
                      key={obj.value}
                      type="button"
                      onClick={() => handleChangeAndAdvance('objetivo', obj.value)}
                      className={`relative overflow-hidden rounded-lg transition-all ${
                        selected
                          ? 'ring-4 ring-primary scale-105'
                          : 'ring-2 ring-slate-300 hover:ring-primary/50'
                      }`}
                    >
                      <div className="w-full aspect-[3/4] bg-dark-lighter">
                        <img 
                          src={obj.image} 
                          alt={`Treino personalizado para objetivo: ${obj.title} - Sistema inteligente de treinos com IA`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          width="300"
                          height="400"
                          onError={(e) => {
                            e.currentTarget.src = `https://via.placeholder.com/300x400/4A4946/F9A620?text=${obj.title}`
                          }}
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-4">
                        <div className="text-white font-bold text-xl mb-1">{obj.title}</div>
                        <div className="text-white/80 text-sm">{obj.desc}</div>
                      </div>
                      {selected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Passo 7: Nível de Condicionamento Físico */}
          {step === 7 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Qual é o seu nível de condicionamento físico?
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                Isso nos ajuda a criar treinos adequados ao seu nível
              </p>
              <p className="text-sm text-light-muted mb-8">
                Seja honesto para receber treinos personalizados e seguros
              </p>

              <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto mt-8">
                {EXPERIENCIA_OPCOES.map((exp) => {
                  const icon = exp.value === 'Iniciante' ? (
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : exp.value === 'Intermediário' ? (
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  )
                  return { ...exp, icon }
                }).map((exp) => {
                  const selected = onboardingData.experiencia === exp.value
                  return (
                    <button
                      key={exp.value}
                      type="button"
                      onClick={() => {
                        handleChange('experiencia', exp.value)
                        // Após selecionar, ir automaticamente para feedback após 600ms
                        setTimeout(() => {
                          setStep(7.5)
                        }, 600)
                      }}
                      className={`relative overflow-hidden rounded-lg transition-all p-6 text-left ${
                        selected
                          ? 'ring-4 ring-primary scale-105 bg-dark-lighter border-2 border-primary/50'
                          : 'ring-2 ring-slate-300 hover:ring-primary/50 bg-dark-lighter hover:border-primary/30 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                          {exp.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold text-xl mb-2">{exp.value}</div>
                          <div className="text-white/80 text-sm leading-relaxed">{exp.desc}</div>
                        </div>
                      </div>
                      {selected && (
                        <div className="absolute top-3 right-3 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Passo 7.5: Feedback de Condicionamento Físico */}
          {step === 7.5 && (
            <FeedbackCard analise={analiseCondicionamento} tipo="condicionamento" />
          )}

          {/* Passo 8: Frequência Semanal */}
          {step === 8 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Quantas vezes por semana você quer treinar?
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                Vamos ajustar os treinos ao seu ritmo
              </p>
              <p className="text-sm text-light-muted mb-8">
                Escolha a frequência ideal para seus treinos
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mt-8">
                {FREQUENCIA_OPCOES.map((freq) => {
                  const icon = freq.value === 2 ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : freq.value === 3 ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ) : freq.value === 4 ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  ) : freq.value === 5 ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  )
                  return { ...freq, icon }
                }).map((freq) => {
                  const selected = onboardingData.frequenciaSemanal === freq.value
                  return (
                    <button
                      key={freq.value}
                      type="button"
                      onClick={() => handleChangeAndAdvance('frequenciaSemanal', freq.value)}
                      className={`relative overflow-hidden rounded-xl transition-all p-6 text-left ${
                        selected
                          ? 'ring-4 ring-primary scale-105 bg-dark-lighter border-2 border-primary/50'
                          : 'ring-2 ring-slate-300 hover:ring-primary/50 bg-dark-lighter hover:border-primary/30 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                          selected ? 'bg-primary text-dark' : 'bg-primary/20 text-primary'
                        }`}>
                          {freq.icon}
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold text-xl mb-2 ${selected ? 'text-primary' : 'text-light'}`}>
                            {freq.label}
                          </div>
                          <div className={`text-sm leading-relaxed ${selected ? 'text-light/90' : 'text-light-muted'}`}>
                            {freq.desc}
                          </div>
                        </div>
                      </div>
                      {selected && (
                        <div className="absolute top-3 right-3 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Passo 9: Tempo de Treino */}
          {step === 9 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Quanto tempo você quer que seus treinos durem?
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                Selecione a duração ideal para seus treinos
              </p>
              <p className="text-sm text-light-muted mb-8">
                Isso nos ajuda a criar treinos que se encaixam na sua rotina
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mt-8">
                {TEMPO_OPCOES.map((tempo) => {
                  const selected = onboardingData.tempoDisponivel === tempo.value
                  return (
                    <button
                      key={tempo.value}
                      type="button"
                      onClick={() => handleChangeAndAdvance('tempoDisponivel', tempo.value)}
                      className={`relative overflow-hidden rounded-xl transition-all p-6 text-left ${
                        selected
                          ? 'ring-4 ring-primary scale-105 bg-dark-lighter border-2 border-primary/50'
                          : 'ring-2 ring-slate-300 hover:ring-primary/50 bg-dark-lighter hover:border-primary/30 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                          selected ? 'bg-primary text-dark' : 'bg-primary/20 text-primary'
                        }`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold text-xl mb-2 ${selected ? 'text-primary' : 'text-light'}`}>
                            {tempo.label}
                          </div>
                          <div className={`text-sm leading-relaxed ${selected ? 'text-light/90' : 'text-light-muted'}`}>
                            {tempo.desc}
                          </div>
                        </div>
                      </div>
                      {selected && (
                        <div className="absolute top-3 right-3 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Passo 10: Local do Treino */}
          {step === 10 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Escolha o local do seu treino
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                Onde você prefere treinar?
              </p>
              <p className="text-sm text-light-muted mb-8">
                Isso nos ajuda a criar treinos adequados ao seu ambiente
              </p>

              <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto mt-8">
                {LOCAL_TREINO_OPCOES.map((local) => {
                  const selected = onboardingData.localTreino === local.value
                  return (
                    <button
                      key={local.value}
                      type="button"
                      onClick={() => handleChangeAndAdvance('localTreino', local.value)}
                      className={`relative overflow-hidden rounded-lg transition-all p-6 text-left ${
                        selected
                          ? 'ring-4 ring-primary scale-105 bg-dark-lighter'
                          : 'ring-2 ring-slate-300 hover:ring-primary/50 bg-dark-lighter'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                          <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold text-xl mb-2">{local.value}</div>
                          <div className="text-white/80 text-sm">{local.desc}</div>
                        </div>
                      </div>
                      {selected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Passo 11: Problemas em Tentativas Anteriores */}
          {step === 11 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Problemas em suas tentativas anteriores de condicionamento físico?
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                Conte-nos o que dificultou seus treinos anteriores
              </p>
              <p className="text-sm text-light-muted mb-8">
                Isso nos ajuda a criar uma experiência melhor e evitar os mesmos problemas
              </p>

              <div className="grid grid-cols-1 gap-3 max-w-2xl mx-auto mt-8">
                {PROBLEMAS_ANTERIORES_OPCOES.map((problema) => {
                  const selected = onboardingData.problemasAnteriores?.includes(problema.value) || false
                  return (
                    <button
                      key={problema.value}
                      type="button"
                      onClick={() => {
                        const current = onboardingData.problemasAnteriores || []
                        if (selected) {
                          handleChange('problemasAnteriores', current.filter(p => p !== problema.value))
                        } else {
                          handleChange('problemasAnteriores', [...current, problema.value])
                        }
                      }}
                      className={`relative overflow-hidden rounded-lg transition-all p-4 text-left flex items-center justify-between ${
                        selected
                          ? 'ring-4 ring-primary scale-105 bg-dark-lighter'
                          : 'ring-2 ring-slate-300 hover:ring-primary/50 bg-dark-lighter'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-white font-bold text-lg mb-1">{problema.value}</div>
                          <div className="text-white/70 text-sm">{problema.desc}</div>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        selected
                          ? 'bg-primary border-primary'
                          : 'border-slate-300 bg-transparent'
                      }`}>
                        {selected && (
                          <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {onboardingData.problemasAnteriores && onboardingData.problemasAnteriores.length > 0 && (
                <div className="mt-6 text-sm text-light-muted">
                  <p>Você selecionou {onboardingData.problemasAnteriores.length} {onboardingData.problemasAnteriores.length === 1 ? 'problema' : 'problemas'}</p>
                </div>
              )}
            </div>
          )}

          {/* Passo 12: Objetivos Adicionais */}
          {step === 12 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-4">
                Marque seus objetivos adicionais abaixo:
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                Temos certeza de que você deseja não apenas um corpo melhor, mas também melhorar seu estilo de vida.
              </p>
              <p className="text-sm text-light-muted mb-8">
                Selecione todos os benefícios que você deseja alcançar
              </p>

              <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto mt-8">
                {OBJETIVOS_ADICIONAIS_OPCOES.map((objetivo) => {
                  const icon = objetivo.value === 'Melhorar o sono' ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : objetivo.value === 'Criar um hábito físico' ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : objetivo.value === 'Sentir-se mais saudável' ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  ) : objetivo.value === 'Reduzir o estresse' ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )
                  return { ...objetivo, icon }
                }).map((objetivo) => {
                  const selected = onboardingData.objetivosAdicionais?.includes(objetivo.value) || false
                  return (
                    <button
                      key={objetivo.value}
                      type="button"
                      onClick={() => {
                        const current = onboardingData.objetivosAdicionais || []
                        if (selected) {
                          handleChange('objetivosAdicionais', current.filter(o => o !== objetivo.value))
                        } else {
                          handleChange('objetivosAdicionais', [...current, objetivo.value])
                        }
                      }}
                      className={`relative overflow-hidden rounded-xl transition-all p-6 text-left ${
                        selected
                          ? 'ring-4 ring-primary scale-105 bg-dark-lighter border-2 border-primary/50'
                          : 'ring-2 ring-slate-300 hover:ring-primary/50 bg-dark-lighter hover:border-primary/30 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                          selected ? 'bg-primary text-dark' : 'bg-primary/20 text-primary'
                        }`}>
                          {objetivo.icon}
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold text-xl mb-2 ${selected ? 'text-primary' : 'text-light'}`}>
                            {objetivo.value}
                          </div>
                          <div className={`text-sm leading-relaxed ${selected ? 'text-light/90' : 'text-light-muted'}`}>
                            {objetivo.desc}
                          </div>
                        </div>
                        <div className={`flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                          selected
                            ? 'bg-primary border-primary'
                            : 'border-slate-300 bg-transparent'
                        }`}>
                          {selected && (
                            <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {onboardingData.objetivosAdicionais && onboardingData.objetivosAdicionais.length > 0 && (
                <div className="mt-6 text-sm text-light-muted">
                  <p>Você selecionou {onboardingData.objetivosAdicionais.length} {onboardingData.objetivosAdicionais.length === 1 ? 'objetivo' : 'objetivos'}</p>
                </div>
              )}
            </div>
          )}

          {/* Passo 13: Limitações Físicas */}
          {step === 13 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Lesões ou Limitações Físicas
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                Informar lesões garante treinos seguros e adaptados
              </p>
              <p className="text-sm text-light-muted mb-8">
                Adaptamos exercícios para suas condições, mantendo a eficácia do treino
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto mt-8">
                {LESOES_OPCOES.map((lesao) => {
                  const selected = onboardingData.lesoes?.includes(lesao) || 
                    (lesao === 'Nenhuma' && (!onboardingData.lesoes || onboardingData.lesoes.length === 0))
                  return (
                    <button
                      key={lesao}
                      type="button"
                      onClick={() => {
                        if (lesao === 'Nenhuma') {
                          handleChange('lesoes', [])
                        } else {
                          handleArrayChange('lesoes', lesao)
                        }
                      }}
                      className={`py-4 rounded-lg font-semibold transition-all text-lg ${
                        selected
                          ? 'bg-primary text-dark ring-4 ring-primary/50 scale-105'
                          : 'bg-dark-lighter text-light ring-2 ring-slate-300 hover:ring-primary/50'
                      }`}
                    >
                      {lesao}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Passo 14: Idade */}
          {step === 14 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Qual é a sua idade?
              </h2>
              <p className="text-light-muted mb-8 text-lg">
                A idade nos ajuda a ajustar o volume e a intensidade dos treinos para você.
              </p>

              <div className="max-w-xs mx-auto mt-8">
                <MobileNumberPicker
                  min={14}
                  max={80}
                  value={onboardingData.idade ?? 30}
                  onChange={(valor) => handleChange('idade', valor)}
                  unit="anos"
                />
                <p className="text-xs text-light-muted mt-4">
                  Arraste para selecionar. Ajustaremos isso automaticamente conforme o tempo passa.
                </p>
              </div>
            </div>
          )}

          {/* Passo 15: Nome */}
          {step === 15 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Para finalizar, como podemos te chamar?
              </h2>
              <p className="text-light-muted mb-8 text-lg">
                Queremos que tudo seja personalizado para você.
              </p>

              <div className="max-w-md mx-auto mt-8">
                <input
                  type="text"
                  value={onboardingData.nome || ''}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  className="w-full bg-transparent border-b-2 border-slate-300 text-center text-2xl md:text-4xl font-bold text-light focus:border-primary focus:outline-none py-4 transition-colors"
                  placeholder="Seu nome"
                  autoFocus
                  aria-label="Digite seu nome completo"
                  aria-required="true"
                />
                {onboardingData.nome && onboardingData.nome.trim().length < 2 && (
                  <p className="text-error text-sm mt-2">Nome deve ter pelo menos 2 caracteres</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer com botões - estilo MadMuscles */}
      <OnboardingFooter
        step={step}
        onboardingData={onboardingData}
        onPrev={prevStep}
        onNext={nextStep}
        onFinish={finalizarOnboarding}
      />
    </div>
  )
}
