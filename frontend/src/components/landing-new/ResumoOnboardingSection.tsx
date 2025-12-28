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

  const getLocalTreinoLabel = () => {
    if (!onboardingData.localTreino) return null
    const labels: Record<string, string> = {
      'Casa': 'Casa',
      'Academia': 'Academia',
      'Misto': 'Casa e Academia'
    }
    return labels[onboardingData.localTreino] || onboardingData.localTreino
  }

  const formatarNumero = (numero: string | null): string => {
    if (!numero) return ''
    return numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const formatarAgua = (agua: string | null): string => {
    if (!agua) return ''
    return agua.replace('.', ',')
  }

  const getObjetivoDescricao = () => {
    const objetivo = onboardingData.objetivo
    if (objetivo === 'Emagrecimento') return 'Plano focado em queima de gordura e definição muscular'
    if (objetivo === 'Hipertrofia') return 'Plano otimizado para crescimento muscular e ganho de massa'
    if (objetivo === 'Força') return 'Plano desenvolvido para aumento de força e potência muscular'
    return 'Plano personalizado para seus objetivos específicos'
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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-3 text-center">
            Seu perfil{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              personalizado
            </span>
          </h2>
          <p className="text-base md:text-lg text-light-muted text-center mb-8 max-w-2xl mx-auto">
            Analisamos seu estado atual e objetivo para criarmos uma jornada de transformação juntos
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            {/* Objetivo */}
            <div className="bg-dark-lighter/60 backdrop-blur-xl rounded-xl p-4 md:p-5 border border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-light-muted font-medium">Objetivo</p>
              </div>
              <p className="text-lg md:text-xl font-bold text-light">{getObjetivoLabel()}</p>
              <p className="text-xs text-light-muted mt-1">{getObjetivoDescricao()}</p>
            </div>

            {/* IMC */}
            {imc && classificacaoIMC && (
              <div className="bg-dark-lighter/60 backdrop-blur-xl rounded-xl p-4 md:p-5 border border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-xs text-light-muted font-medium">IMC</p>
                </div>
                <p className="text-lg md:text-xl font-bold text-light">{imc}</p>
                <p className="text-xs text-light-muted mt-1">{classificacaoIMC}</p>
              </div>
            )}

            {/* Calorias */}
            {calorias && (
              <div className="bg-dark-lighter/60 backdrop-blur-xl rounded-xl p-4 md:p-5 border border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <p className="text-xs text-light-muted font-medium">Calorias/dia</p>
                </div>
                <p className="text-lg md:text-xl font-bold text-light">{formatarNumero(calorias)} kcal</p>
                <p className="text-xs text-light-muted mt-1">Baseado no seu metabolismo</p>
              </div>
            )}

            {/* Água */}
            {agua && (
              <div className="bg-dark-lighter/60 backdrop-blur-xl rounded-xl p-4 md:p-5 border border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <p className="text-xs text-light-muted font-medium">Água/dia</p>
                </div>
                <p className="text-lg md:text-xl font-bold text-light">{formatarAgua(agua)}L</p>
                <p className="text-xs text-light-muted mt-1">Hidratação ideal</p>
              </div>
            )}
          </div>

          {/* Detalhes do Treino */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {onboardingData.experiencia && (
              <div className="bg-dark-lighter/40 backdrop-blur-sm rounded-xl p-4 border border-grey/20">
                <p className="text-xs text-light-muted mb-1">Nível</p>
                <p className="text-base md:text-lg font-semibold text-light">{onboardingData.experiencia}</p>
              </div>
            )}
            {onboardingData.frequenciaSemanal && (
              <div className="bg-dark-lighter/40 backdrop-blur-sm rounded-xl p-4 border border-grey/20">
                <p className="text-xs text-light-muted mb-1">Frequência</p>
                <p className="text-base md:text-lg font-semibold text-light">{onboardingData.frequenciaSemanal}x por semana</p>
              </div>
            )}
            {onboardingData.tempoDisponivel && getLocalTreinoLabel() && (
              <div className="bg-dark-lighter/40 backdrop-blur-sm rounded-xl p-4 border border-grey/20">
                <p className="text-xs text-light-muted mb-1">Treino</p>
                <p className="text-base md:text-lg font-semibold text-light">{onboardingData.tempoDisponivel}min • {getLocalTreinoLabel()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
