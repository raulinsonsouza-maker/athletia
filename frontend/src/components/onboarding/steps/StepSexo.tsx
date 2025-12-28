import { OnboardingData } from '../../../types/onboarding.types'
import { SEXO_OPCOES } from '../../../constants/onboarding.constants'
import OnboardingStepCard from '../OnboardingStepCard'

interface StepSexoProps {
  onboardingData: OnboardingData
  onSelect: (value: string) => void
}

export default function StepSexo({ onboardingData, onSelect }: StepSexoProps) {
  return (
    <div className="text-center animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-display font-bold text-light mb-2">
        Qual é o seu sexo?
      </h2>
      <p className="text-light-muted mb-4 text-sm md:text-base">
        Homens e mulheres têm diferenças hormonais e estruturais importantes que afetam ganho de massa muscular, perda de gordura e distribuição de força.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 max-w-sm md:max-w-3xl mx-auto">
        {SEXO_OPCOES.map((sexo) => {
          const selected = onboardingData.sexo === sexo.value
          return (
            <OnboardingStepCard
              key={sexo.value}
              selected={selected}
              onClick={() => onSelect(sexo.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect(sexo.value)
                }
              }}
              ariaLabel={`Selecionar ${sexo.value}`}
              ariaPressed={selected}
            >
              <div className="w-full aspect-[4/3] sm:aspect-[3/4] bg-dark-lighter overflow-hidden max-h-[240px] sm:max-h-none">
                {'image' in sexo && sexo.image ? (
                  <img 
                    src={sexo.image} 
                    alt={`Treino personalizado inteligente para ${sexo.value} - Sistema adaptativo com IA`}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                    width="300"
                    height="400"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center px-6 text-light">
                    <div className="text-lg font-semibold mb-2 text-center">
                      {sexo.value}
                    </div>
                    {'description' in sexo && (
                      <p className="text-sm text-light-muted text-center leading-snug">
                        {sexo.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-4">
                <div className="text-white font-bold text-xl">{sexo.value}</div>
              </div>
            </OnboardingStepCard>
          )
        })}
      </div>
    </div>
  )
}

