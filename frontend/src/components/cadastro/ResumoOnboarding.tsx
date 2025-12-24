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
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-4">
            Seu perfil está pronto. Agora é sua vez.
          </h2>
          <p className="text-lg text-light-muted">
            Veja o que você já tem e o que vai ganhar ao criar sua conta
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Parte 1: Como Você Está Agora */}
          <div className="rounded-3xl bg-gradient-to-br from-dark-lighter to-dark border-2 border-grey/30 p-6 md:p-8 hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-light">Como você está agora</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-light-muted">Objetivo</p>
                  <p className="text-lg font-semibold text-primary">{getObjetivoLabel()}</p>
                </div>
              </div>

              {onboardingData.experiencia && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-light-muted">Nível de experiência</p>
                    <p className="text-lg font-semibold text-light">{onboardingData.experiencia}</p>
                  </div>
                </div>
              )}

              {onboardingData.frequenciaSemanal && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-light-muted">Frequência semanal</p>
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
                    <p className="text-sm text-light-muted">Tempo por treino</p>
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
                    <p className="text-sm text-light-muted">Local de treino</p>
                    <p className="text-lg font-semibold text-light">{getLocalTreinoLabel()}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-grey/20">
              <p className="text-base font-semibold text-primary">
                ✨ Seu perfil personalizado está pronto!
              </p>
            </div>
          </div>

          {/* Parte 2: O Que Você Vai Ter */}
          <div className="rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20 border-2 border-primary/50 p-6 md:p-8 hover:border-primary hover:shadow-xl shadow-primary/20 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-light">O que você vai ter</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <p className="text-base font-semibold text-light">Acesso imediato</p>
                  <p className="text-sm text-light-muted">Seu treino gerado em segundos após cadastro</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-base font-semibold text-light">24 horas GRÁTIS</p>
                  <p className="text-sm text-light-muted">Teste completo sem cartão de crédito</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <div>
                  <p className="text-base font-semibold text-light">Treino personalizado</p>
                  <p className="text-sm text-light-muted">Baseado no seu perfil único</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <div>
                  <p className="text-base font-semibold text-light">Ajustes automáticos</p>
                  <p className="text-sm text-light-muted">IA adapta conforme seu progresso</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div>
                  <p className="text-base font-semibold text-light">Histórico completo</p>
                  <p className="text-sm text-light-muted">Acompanhe sua evolução</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <p className="text-base font-semibold text-light">Sem compromisso</p>
                  <p className="text-sm text-light-muted">Cancele quando quiser</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-primary/30">
              <p className="text-base font-bold text-primary">
                🎁 Tudo isso sem pagar nada agora!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

