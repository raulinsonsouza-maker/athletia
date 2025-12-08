import { useMemo } from 'react'
import { OnboardingStep } from '../../types/onboarding.types'
import { TOTAL_STEPS } from '../../constants/onboarding.constants'

/**
 * Hook para calcular progresso do onboarding com memoização
 */
export function useOnboardingProgress(step: OnboardingStep) {
  const getStepNumber = (currentStep: OnboardingStep): number => {
    if (currentStep === 0) return 0
    if (currentStep === 4.5) return 5
    if (currentStep === 5.5) return 7
    if (currentStep === 7.5) return 10
    return currentStep
  }

  const progress = useMemo(() => {
    if (step === 0) return 0
    const stepNumber = getStepNumber(step)
    return (stepNumber / TOTAL_STEPS) * 100
  }, [step])

  const currentStepDisplay = useMemo(() => {
    if (step === 4.5) return '4.5'
    if (step === 5.5) return '5.5'
    if (step === 7.5) return '7.5'
    return step.toString()
  }, [step])

  return {
    progress,
    currentStepDisplay,
    totalSteps: TOTAL_STEPS
  }
}

