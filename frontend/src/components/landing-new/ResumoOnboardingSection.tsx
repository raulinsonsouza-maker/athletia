import { OnboardingData } from '../../types/onboarding.types'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

interface ResumoOnboardingSectionProps {
  onboardingData: OnboardingData | null
}

export default function ResumoOnboardingSection({ onboardingData }: ResumoOnboardingSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 })

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

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 md:py-32 px-4 md:px-6 bg-gradient-to-b from-dark via-dark-lighter/30 to-dark relative overflow-hidden"
    >
      <div className="max-w-5xl mx-auto">
        <div className={`text-center mb-12 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-light mb-4">
            Seu perfil{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              personalizado
            </span>
          </h2>
          <p className="text-xl text-light-muted max-w-3xl mx-auto">
            Baseado nas suas respostas, criamos um plano totalmente adaptado ao seu corpo e objetivos
          </p>
        </div>

        <div className={`rounded-3xl bg-dark-lighter/50 backdrop-blur-xl border border-grey/20 p-6 md:p-8 transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-light-muted mb-1">Objetivo</p>
                  <p className="text-lg md:text-xl font-semibold text-light">{getObjetivoLabel()}</p>
                </div>
              </div>

              {onboardingData.experiencia && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-light-muted mb-1">Nível de experiência</p>
                    <p className="text-lg md:text-xl font-semibold text-light">{onboardingData.experiencia}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {onboardingData.frequenciaSemanal && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-light-muted mb-1">Frequência semanal</p>
                    <p className="text-lg md:text-xl font-semibold text-light">{onboardingData.frequenciaSemanal} treinos por semana</p>
                  </div>
                </div>
              )}

              {onboardingData.tempoDisponivel && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-light-muted mb-1">Tempo por treino</p>
                    <p className="text-lg md:text-xl font-semibold text-light">{onboardingData.tempoDisponivel} minutos</p>
                  </div>
                </div>
              )}

              {getLocalTreinoLabel() && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-light-muted mb-1">Local de treino</p>
                    <p className="text-lg md:text-xl font-semibold text-light">{getLocalTreinoLabel()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

