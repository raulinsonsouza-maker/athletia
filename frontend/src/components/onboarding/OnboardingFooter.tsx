import { OnboardingStep, OnboardingData } from '../../types/onboarding.types'

interface OnboardingFooterProps {
  step: OnboardingStep
  onboardingData: OnboardingData
  onPrev: () => void
  onNext: () => void
  onFinish: () => void
}

export default function OnboardingFooter({
  step,
  onboardingData,
  onPrev,
  onNext,
  onFinish
}: OnboardingFooterProps) {
  const isDisabled = () => {
    if (step === 4 && !onboardingData.altura) return true
    if (step === 4.5 && !onboardingData.pesoAtual) return true
    if (step === 5 && !onboardingData.aguaDiaria) return true
    if (step === 5.5 && !onboardingData.aguaDiaria) return true
    if (step === 7 && !onboardingData.experiencia) return true
    if (step === 7.5 && !onboardingData.experiencia) return true
    if (step === 14 && !onboardingData.idade) return true
    if (step === 15 && !onboardingData.nome?.trim()) return true
    return false
  }

  const shouldShowButton = () => {
    // Mostrar apenas para: inputs (4, 4.5, 14, 15), feedbacks (5.5, 7.5), e múltiplas escolhas (11, 12, 13)
    return [4, 4.5, 5.5, 7.5, 11, 12, 13, 14, 15].includes(step)
  }

  return (
    <div className="w-full py-6 px-6 border-t border-slate-200">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        {step > 0 ? (
          <button
            type="button"
            onClick={onPrev}
            className="px-6 py-3 text-light-muted hover:text-light transition-colors flex items-center gap-2"
            aria-label="Voltar para o passo anterior"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
        ) : (
          <div></div>
        )}

        {step < 15 ? (
          shouldShowButton() && (
            <button
              type="button"
              onClick={onNext}
              disabled={isDisabled()}
              className={`btn-primary px-12 py-3 text-lg font-bold transition-all duration-200 ${
                isDisabled() 
                  ? 'opacity-40 cursor-not-allowed hover:opacity-40' 
                  : 'hover:scale-105 active:scale-95'
              }`}
              aria-disabled={isDisabled()}
            >
              {step === 5.5 || step === 7.5 ? 'Entendi' : 'Continuar'}
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={onFinish}
            disabled={isDisabled()}
            className={`btn-primary px-12 py-3 text-lg font-bold transition-all duration-200 ${
              isDisabled() 
                ? 'opacity-40 cursor-not-allowed hover:opacity-40' 
                : 'hover:scale-105 active:scale-95'
            }`}
            aria-disabled={isDisabled()}
          >
            Finalizar
          </button>
        )}
      </div>
    </div>
  )
}

