import { OnboardingData } from '../../types/onboarding.types'
import { useOnboardingCalculations } from '../../hooks/useOnboardingCalculations'

interface PreviaResultadosProps {
  onboardingData: OnboardingData | null
}

export default function PreviaResultados({ onboardingData }: PreviaResultadosProps) {
  const { imc, classificacaoIMC } = useOnboardingCalculations(onboardingData)

  if (!onboardingData) return null

  const getExperienciaLabel = () => {
    if (!onboardingData.experiencia) return 'Seu nível'
    const labels: Record<string, string> = {
      'Iniciante': 'Iniciante',
      'Intermediário': 'Intermediário',
      'Avançado': 'Avançado'
    }
    return labels[onboardingData.experiencia] || 'Seu nível'
  }

  const getObjetivoLabel = () => {
    if (!onboardingData.objetivo) return 'Seu objetivo'
    const labels: Record<string, string> = {
      'Emagrecimento': 'Emagrecimento',
      'Hipertrofia': 'Ganhar Massa Muscular',
      'Força': 'Força'
    }
    return labels[onboardingData.objetivo] || 'Seu objetivo'
  }

  const cards = [
    {
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: 'Seu nível atual',
      description: onboardingData.experiencia 
        ? `Ajustamos sua progressão inicial para nível ${getExperienciaLabel().toLowerCase()}`
        : 'Ajustamos sua progressão inicial',
      highlight: onboardingData.experiencia || 'Personalizado'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      title: 'Seu objetivo',
      description: onboardingData.objetivo
        ? `Estratégia focada no resultado que você escolheu: ${getObjetivoLabel()}`
        : 'Estratégia focada no resultado que você escolheu',
      highlight: onboardingData.objetivo || 'Personalizado'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'Como você vai evoluir',
      description: 'Treinos adaptativos ajustados pela IA a cada sessão',
      highlight: 'IA Ativa'
    }
  ]

  return (
    <section className="py-16 md:py-20 px-4 md:px-6 bg-dark-lighter/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-4">
            Primeiros insights gerados para você
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className="rounded-2xl bg-dark border border-grey/20 p-6 hover:border-primary/30 transition-all animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  {card.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-light mb-1">{card.title}</h3>
                  <p className="text-sm text-primary font-medium">{card.highlight}</p>
                </div>
              </div>
              <p className="text-sm text-light-muted leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-light-muted">
            Isso é só a prévia. O plano completo é liberado após sua conta.
          </p>
        </div>
      </div>
    </section>
  )
}

