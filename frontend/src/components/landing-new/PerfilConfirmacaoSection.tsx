import { OnboardingData } from '../../types/onboarding.types'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import { getResumoPerfil } from '../../utils/onboardingFormatters'

interface PerfilConfirmacaoSectionProps {
  onboardingData: OnboardingData | null
}

export default function PerfilConfirmacaoSection({ onboardingData }: PerfilConfirmacaoSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })
  
  if (!onboardingData) return null

  const resumo = getResumoPerfil(onboardingData)

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-12 md:py-16 px-4 md:px-6 bg-gradient-to-b from-dark via-dark-lighter/40 to-dark border-y border-grey/20"
    >
      <div className="max-w-4xl mx-auto">
        <div className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-light mb-6 text-center">
            Seu perfil analisado
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Objetivo */}
            <div className="bg-dark-lighter/60 backdrop-blur-xl rounded-xl p-4 border border-primary/30 text-center">
              <p className="text-xs text-light-muted font-medium mb-2">Objetivo</p>
              <p className="text-base md:text-lg font-bold text-light">{resumo.objetivo}</p>
            </div>

            {/* Nível */}
            <div className="bg-dark-lighter/60 backdrop-blur-xl rounded-xl p-4 border border-primary/30 text-center">
              <p className="text-xs text-light-muted font-medium mb-2">Nível</p>
              <p className="text-base md:text-lg font-bold text-light">{resumo.nivel}</p>
            </div>

            {/* Frequência */}
            <div className="bg-dark-lighter/60 backdrop-blur-xl rounded-xl p-4 border border-primary/30 text-center">
              <p className="text-xs text-light-muted font-medium mb-2">Frequência</p>
              <p className="text-base md:text-lg font-bold text-light">{resumo.frequencia}</p>
            </div>

            {/* Ambiente */}
            <div className="bg-dark-lighter/60 backdrop-blur-xl rounded-xl p-4 border border-primary/30 text-center">
              <p className="text-xs text-light-muted font-medium mb-2">Ambiente</p>
              <p className="text-base md:text-lg font-bold text-light">{resumo.ambiente}</p>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 md:p-6 text-center">
            <p className="text-sm md:text-base text-light-muted italic">
              O treino completo com exercícios, séries, repetições e progressão automática será liberado após a assinatura.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
