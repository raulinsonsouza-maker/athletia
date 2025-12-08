import { useOnboardingProgress } from '../../hooks/onboarding/useOnboardingProgress'
import { OnboardingStep } from '../../types/onboarding.types'

interface OnboardingHeaderProps {
  step: OnboardingStep
}

export default function OnboardingHeader({ step }: OnboardingHeaderProps) {
  const { progress, currentStepDisplay, totalSteps } = useOnboardingProgress(step)

  return (
    <div className="w-full py-4 md:py-5 px-4 md:px-6 border-b border-grey/30 bg-dark/95 backdrop-blur-md">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-3">
          <div className="text-lg md:text-xl font-display font-bold text-primary">AthletIA</div>
          <div className="text-sm md:text-base text-light-muted">
            Passo {currentStepDisplay} de {totalSteps}
          </div>
        </div>
        <div className="w-full bg-dark-lighter rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

