import { OnboardingData } from '../../types/onboarding.types'
import { useOnboardingCalculations } from '../../hooks/useOnboardingCalculations'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

interface ResumoOnboardingSectionProps {
  onboardingData: OnboardingData | null
}

export default function ResumoOnboardingSection({ onboardingData }: ResumoOnboardingSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })
  const { imc, classificacaoIMC, calorias, agua } = useOnboardingCalculations(onboardingData)

  if (!onboardingData) return null

  // Funções auxiliares para formatar dados
  const getObjetivoLabel = () => {
    if (!onboardingData.objetivo) return 'Personalizado'
    const labels: Record<string, string> = {
      'Emagrecimento': 'Emagrecimento',
      'Hipertrofia': 'Ganhar Massa Muscular',
      'Força': 'Força'
    }
    return labels[onboardingData.objetivo] || onboardingData.objetivo
  }

  const getObjetivoDescricao = () => {
    const objetivo = onboardingData.objetivo
    if (objetivo === 'Emagrecimento') return 'Vamos transformar seu corpo através de treinos focados em queima de gordura e definição'
    if (objetivo === 'Hipertrofia') return 'Juntos vamos construir massa muscular e transformar seu físico de forma inteligente'
    if (objetivo === 'Força') return 'Vamos aumentar sua força e potência através de treinos progressivos e eficientes'
    return 'Vamos criar um plano personalizado para transformar seu corpo e alcançar seus objetivos'
  }

  const getEstadoAtualDescricao = () => {
    if (classificacaoIMC && onboardingData.experiencia) {
      return `Você está em ${classificacaoIMC.toLowerCase()} e tem nível ${onboardingData.experiencia.toLowerCase()} de experiência. Estamos prontos para começar sua transformação.`
    }
    if (classificacaoIMC) {
      return `Você está em ${classificacaoIMC.toLowerCase()}. Vamos trabalhar juntos para alcançar seus objetivos.`
    }
    if (onboardingData.experiencia) {
      return `Com seu nível ${onboardingData.experiencia.toLowerCase()} de experiência, vamos criar treinos que realmente vão desafiar você.`
    }
    return 'Vamos criar treinos personalizados que vão transformar seu corpo e sua vida.'
  }

  const formatarNumero = (numero: string | null): string => {
    if (!numero) return ''
    return numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const formatarAgua = (agua: string | null): string => {
    if (!agua) return ''
    return agua.replace('.', ',')
  }

  const getLocalTreinoLabel = () => {
    if (!onboardingData.localTreino) return null
    const labels: Record<string, string> = {
      'Casa': 'Casa',
      'Academia': 'Academia',
      'Misto': 'Casa e Academia'
    }
    return labels[onboardingData.localTreino] || onboardingData.localTreino
  }

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-12 md:py-16 px-4 md:px-6 bg-gradient-to-b from-dark via-dark-lighter/40 to-dark border-b border-grey/20"
    >
      <div className="max-w-6xl mx-auto">
        <div className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {/* Título focado na jornada */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-4">
              Sua jornada de{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                transformação começa aqui
              </span>
            </h2>
            <p className="text-base md:text-lg text-light-muted max-w-3xl mx-auto leading-relaxed">
              {getEstadoAtualDescricao()}
            </p>
          </div>

          {/* Card principal - Estado Atual e Objetivo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10">
            {/* Estado Atual */}
            <div className="bg-dark-lighter/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-grey/30">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-12 h-12 rounded-xl bg-grey/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-light-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-light-muted">Estado Atual</h3>
                  <p className="text-sm text-light-muted/80">Onde você está agora</p>
                </div>
              </div>
              <div className="space-y-4">
                {imc && classificacaoIMC && (
                  <div>
                    <p className="text-xs text-light-muted mb-1">IMC</p>
                    <p className="text-2xl md:text-3xl font-bold text-light">{imc}</p>
                    <p className="text-sm text-light-muted mt-1">{classificacaoIMC}</p>
                  </div>
                )}
                {onboardingData.experiencia && (
                  <div className="pt-4 border-t border-grey/20">
                    <p className="text-xs text-light-muted mb-1">Nível de Experiência</p>
                    <p className="text-xl font-semibold text-light">{onboardingData.experiencia}</p>
                  </div>
                )}
                {onboardingData.frequenciaSemanal && onboardingData.tempoDisponivel && (
                  <div className="pt-4 border-t border-grey/20">
                    <p className="text-xs text-light-muted mb-1">Rotina Atual</p>
                    <p className="text-lg font-semibold text-light">
                      {onboardingData.frequenciaSemanal}x por semana • {onboardingData.tempoDisponivel}min
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Objetivo */}
            <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 backdrop-blur-xl rounded-2xl p-6 md:p-8 border-2 border-primary/40">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-primary">Seu Objetivo</h3>
                  <p className="text-sm text-light-muted">Onde vamos chegar juntos</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-light-muted mb-1">Foco Principal</p>
                  <p className="text-2xl md:text-3xl font-bold text-light">{getObjetivoLabel()}</p>
                  <p className="text-sm text-light-muted mt-2 leading-relaxed">{getObjetivoDescricao()}</p>
                </div>
                {calorias && (
                  <div className="pt-4 border-t border-primary/20">
                    <p className="text-xs text-light-muted mb-1">Calorias Diárias Recomendadas</p>
                    <p className="text-xl font-semibold text-primary">{formatarNumero(calorias)} kcal</p>
                    <p className="text-xs text-light-muted mt-1">Otimizado para seu metabolismo</p>
                  </div>
                )}
                {agua && (
                  <div className="pt-4 border-t border-primary/20">
                    <p className="text-xs text-light-muted mb-1">Hidratação Ideal</p>
                    <p className="text-xl font-semibold text-primary">{formatarAgua(agua)}L por dia</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resumo da Jornada */}
          <div className="bg-dark-lighter/40 backdrop-blur-sm rounded-xl p-5 md:p-6 border border-primary/20">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-base md:text-lg font-bold text-light mb-2">
                  Plano Personalizado Criado
                </h4>
                <p className="text-sm md:text-base text-light-muted leading-relaxed mb-3">
                  Com base nas suas informações, criamos um plano completo que vai te levar do seu estado atual até seu objetivo. 
                  {onboardingData.frequenciaSemanal && getLocalTreinoLabel() && (
                    <> Os treinos estão ajustados para <strong className="text-primary">{onboardingData.frequenciaSemanal}x por semana</strong> e podem ser feitos <strong className="text-primary">{getLocalTreinoLabel()?.toLowerCase()}</strong>.</>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-primary/20 text-primary text-xs font-semibold rounded-full border border-primary/30">
                    Treinos Personalizados
                  </span>
                  <span className="px-3 py-1.5 bg-primary/20 text-primary text-xs font-semibold rounded-full border border-primary/30">
                    Progressão Automática
                  </span>
                  <span className="px-3 py-1.5 bg-primary/20 text-primary text-xs font-semibold rounded-full border border-primary/30">
                    Ajuste Inteligente
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
