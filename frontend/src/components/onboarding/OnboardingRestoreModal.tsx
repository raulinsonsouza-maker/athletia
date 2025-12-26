import { useEffect } from 'react'
import { OnboardingStep } from '../../types/onboarding.types'

interface OnboardingRestoreModalProps {
  isOpen: boolean
  onClose: () => void
  onRestore: () => void
  onDiscard: () => void
  savedStep: OnboardingStep
}

const STEP_NAMES: Record<OnboardingStep, string> = {
  0: 'início',
  1: 'idade',
  2: 'sexo',
  3: 'tipo de corpo',
  4: 'altura',
  4.5: 'peso',
  5: 'consumo de água',
  5.5: 'feedback de água',
  6: 'objetivo',
  7: 'nível de condicionamento',
  7.5: 'feedback de condicionamento',
  8: 'frequência semanal',
  9: 'tempo disponível',
  10: 'local de treino',
  11: 'problemas anteriores',
  12: 'objetivos adicionais',
  13: 'limitações físicas',
  14: 'idade',
  15: 'nome'
}

export default function OnboardingRestoreModal({
  isOpen,
  onClose,
  onRestore,
  onDiscard,
  savedStep
}: OnboardingRestoreModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const stepName = STEP_NAMES[savedStep] || 'passo anterior'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-dark rounded-2xl border border-grey/30 shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-grey/20 bg-dark-lighter/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-light">Continuar de onde parou?</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-light-muted leading-relaxed">
            Vimos que você parou no passo <strong className="text-light">"{stepName}"</strong>. Deseja continuar de onde parou ou começar do zero?
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-grey/20 bg-dark-lighter/30 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              onDiscard()
              onClose()
            }}
            className="flex-1 px-6 py-3 bg-dark-lighter border border-grey/30 text-light rounded-xl font-semibold hover:bg-dark-lighter/80 transition-colors"
          >
            Começar do zero
          </button>
          <button
            onClick={() => {
              onRestore()
              onClose()
            }}
            className="btn-primary flex-1 px-6 py-3 font-bold"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

