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
      <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
        Qual é a sua idade?
      </h2>
      <p className="text-light-muted mb-2 text-lg">
        A idade influencia diretamente no metabolismo e capacidade de recuperação
      </p>
      <p className="text-sm text-light-muted mb-8">
        Treinos personalizados por idade garantem resultados mais seguros e eficazes
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
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
              <div className="w-full aspect-[3/4] bg-dark-lighter overflow-hidden">
                <img 
                  src={faixa.image} 
                  alt={`Pessoa na faixa etária ${faixa.label} anos - Treino personalizado inteligente para sua idade`}
                  className="w-full h-full object-cover"
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

