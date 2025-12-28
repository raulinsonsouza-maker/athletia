import { OnboardingData } from '../../../types/onboarding.types'
import { IDADE_OPCOES } from '../../../constants/onboarding.constants'
import OnboardingStepCard from '../OnboardingStepCard'

interface StepIdadeProps {
  onboardingData: OnboardingData
  onSelect: (value: number) => void
}

export default function StepIdade({ onboardingData, onSelect }: StepIdadeProps) {
  return (
    <div className="text-center animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-display font-bold text-light mb-2">
        Qual é a sua idade?
      </h2>
      <p className="text-light-muted mb-4 text-sm md:text-base">
        A idade influencia diretamente no metabolismo e capacidade de recuperação. Treinos personalizados por idade garantem resultados mais seguros e eficazes.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4 max-w-sm sm:max-w-2xl md:max-w-full mx-auto">
        {IDADE_OPCOES.map((faixa) => {
          const selected = onboardingData.idade ? 
            (faixa.label === '18-29' && onboardingData.idade >= 18 && onboardingData.idade <= 29) ||
            (faixa.label === '30-39' && onboardingData.idade >= 30 && onboardingData.idade <= 39) ||
            (faixa.label === '40-49' && onboardingData.idade >= 40 && onboardingData.idade <= 49) ||
            (faixa.label === '50+' && onboardingData.idade >= 50) : false

          return (
            <OnboardingStepCard
              key={faixa.label}
              selected={selected}
              onClick={() => onSelect(faixa.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect(faixa.value)
                }
              }}
              ariaLabel={`Selecionar idade ${faixa.label}`}
              ariaPressed={selected}
            >
              <div className="w-full aspect-[4/3] sm:aspect-[3/4] bg-dark-lighter overflow-hidden max-h-[240px] sm:max-h-none">
                <img 
                  src={faixa.image} 
                  alt={`Pessoa na faixa etária ${faixa.label} anos - Treino personalizado inteligente para sua idade`}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                  width="300"
                  height="400"
                  decoding="async"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-3">
                <div className="text-white font-bold text-lg">{faixa.label}</div>
              </div>
            </OnboardingStepCard>
          )
        })}
      </div>
    </div>
  )
}

