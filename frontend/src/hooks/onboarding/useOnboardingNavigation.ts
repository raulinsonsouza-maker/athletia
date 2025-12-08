import { useCallback } from 'react'
import { OnboardingStep } from '../../types/onboarding.types'

/**
 * Hook para gerenciar navegação entre steps do onboarding
 */
export function useOnboardingNavigation(
  step: OnboardingStep,
  setStep: (step: OnboardingStep) => void
) {
  const nextStep = useCallback(() => {
    // Após altura (step 4), ir para peso (4.5)
    if (step === 4) {
      setStep(4.5)
    }
    // Após peso (step 4.5), ir para água (5)
    else if (step === 4.5) {
      setStep(5)
    }
    // Após selecionar água (step 5), ir para feedback (5.5)
    else if (step === 5) {
      setStep(5.5)
    }
    // Após feedback água (step 5.5), ir para objetivo (6)
    else if (step === 5.5) {
      setStep(6)
    }
    // Após selecionar experiência (step 7), ir para feedback (7.5)
    else if (step === 7) {
      setStep(7.5)
    }
    // Após feedback experiência (step 7.5), ir para frequência (8)
    else if (step === 7.5) {
      setStep(8)
    }
    // Demais passos seguem normalmente
    else if (step < 15) {
      setStep((step + 1) as OnboardingStep)
    }
  }, [step, setStep])

  const prevStep = useCallback(() => {
    // Se estiver no peso (4.5), voltar para altura (4)
    if (step === 4.5) {
      setStep(4)
    }
    // Se estiver na água (5), voltar para peso (4.5)
    else if (step === 5) {
      setStep(4.5)
    }
    // Se estiver no feedback água (5.5), voltar para água (5)
    else if (step === 5.5) {
      setStep(5)
    }
    // Se estiver no objetivo (6), voltar para feedback água (5.5)
    else if (step === 6) {
      setStep(5.5)
    }
    // Se estiver na experiência (7), voltar para objetivo (6)
    else if (step === 7) {
      setStep(6)
    }
    // Se estiver no feedback experiência (7.5), voltar para experiência (7)
    else if (step === 7.5) {
      setStep(7)
    }
    // Se estiver na frequência (8), voltar para feedback experiência (7.5)
    else if (step === 8) {
      setStep(7.5)
    }
    // Se estiver no tempo (9), voltar para frequência (8)
    else if (step === 9) {
      setStep(8)
    }
    // Se estiver no local do treino (10), voltar para tempo (9)
    else if (step === 10) {
      setStep(9)
    }
    // Se estiver nos problemas anteriores (11), voltar para local do treino (10)
    else if (step === 11) {
      setStep(10)
    }
    // Se estiver nos objetivos adicionais (12), voltar para problemas anteriores (11)
    else if (step === 12) {
      setStep(11)
    }
    // Se estiver nas limitações (13), voltar para objetivos adicionais (12)
    else if (step === 13) {
      setStep(12)
    }
    // Se estiver no nome (14), voltar para limitações (13)
    else if (step === 14) {
      setStep(13)
    }
    // Se estiver na data de nascimento (15), voltar para nome (14)
    else if (step === 15) {
      setStep(14)
    }
    // Demais passos seguem normalmente
    else if (step > 0) {
      setStep((step - 1) as OnboardingStep)
    }
  }, [step, setStep])

  return {
    nextStep,
    prevStep
  }
}

