import { OnboardingData } from '../../types/onboarding.types'

interface ConsolidacaoSectionProps {
  onboardingData: OnboardingData
}

export default function ConsolidacaoSection({ onboardingData }: ConsolidacaoSectionProps) {
  const getObjetivoTexto = () => {
    if (!onboardingData.objetivo) return ''
    const objetivoMap: Record<string, string> = {
      'Emagrecimento': 'emagrecer e definir',
      'Hipertrofia': 'ganhar massa muscular',
      'Força': 'ganhar força',
      'Condicionamento': 'melhorar condicionamento'
    }
    return objetivoMap[onboardingData.objetivo] || onboardingData.objetivo.toLowerCase()
  }

  const getExperienciaTexto = () => {
    if (!onboardingData.experiencia) return ''
    return onboardingData.experiencia.toLowerCase()
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-dark to-dark-lighter">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-8">
          Isso é para mim
        </h2>

        <div className="bg-dark-lighter/80 backdrop-blur border border-white/10 rounded-2xl p-8 md:p-12 space-y-8">
          {/* Onde está hoje */}
          {onboardingData.experiencia && (
            <div className="text-left">
              <p className="text-white/60 text-sm uppercase tracking-wide mb-2">Onde você está hoje</p>
              <p className="text-white text-xl font-semibold">
                Nível {getExperienciaTexto()}
              </p>
            </div>
          )}

          {/* Onde quer chegar */}
          {onboardingData.objetivo && (
            <div className="text-left">
              <p className="text-white/60 text-sm uppercase tracking-wide mb-2">Onde você quer chegar</p>
              <p className="text-white text-xl font-semibold">
                {getObjetivoTexto()}
              </p>
            </div>
          )}

          {/* Como vamos ajudar */}
          <div className="text-left border-t border-white/10 pt-8">
            <p className="text-white/60 text-sm uppercase tracking-wide mb-2">Como o Athletia vai ajudar</p>
            <p className="text-white text-xl font-semibold leading-relaxed">
              {onboardingData.frequenciaSemanal && `${onboardingData.frequenciaSemanal} treinos personalizados por semana, `}
              criados especificamente para você, que evoluem junto com seu progresso
            </p>
          </div>

          {/* Mensagem-chave */}
          <div className="bg-primary/20 border border-primary/40 rounded-xl p-6 mt-8">
            <p className="text-white text-lg font-medium leading-relaxed">
              Com base nas suas respostas, o Athletia já está pronto para criar seus treinos personalizados.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
