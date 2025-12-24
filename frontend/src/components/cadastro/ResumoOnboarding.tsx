import { OnboardingData } from '../../types/onboarding.types'

interface ResumoOnboardingProps {
  onboardingData: OnboardingData | null
}

export default function ResumoOnboarding({ onboardingData }: ResumoOnboardingProps) {
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
    <section className="py-16 md:py-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-4">
            Como você está agora
          </h2>
          <p className="text-lg text-light-muted">
            Seu perfil personalizado baseado nas suas respostas
          </p>
        </div>

        <div className="rounded-3xl bg-dark-lighter border-2 border-grey/30 p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-light-muted mb-1">Objetivo</p>
                  <p className="text-lg font-semibold text-light">{getObjetivoLabel()}</p>
                </div>
              </div>

              {onboardingData.experiencia && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-light-muted mb-1">Nível de experiência</p>
                    <p className="text-lg font-semibold text-light">{onboardingData.experiencia}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {onboardingData.frequenciaSemanal && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-light-muted mb-1">Frequência semanal</p>
                    <p className="text-lg font-semibold text-light">{onboardingData.frequenciaSemanal} treinos por semana</p>
                  </div>
                </div>
              )}

              {onboardingData.tempoDisponivel && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-light-muted mb-1">Tempo por treino</p>
                    <p className="text-lg font-semibold text-light">{onboardingData.tempoDisponivel} minutos</p>
                  </div>
                </div>
              )}

              {getLocalTreinoLabel() && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <div>
                    <p className="text-sm text-light-muted mb-1">Local de treino</p>
                    <p className="text-lg font-semibold text-light">{getLocalTreinoLabel()}</p>
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
