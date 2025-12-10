import { useEffect } from 'react'

interface LegalModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function LegalModal({ isOpen, onClose, title, children }: LegalModalProps) {
  // Fechar com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevenir scroll do body quando modal está aberto
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-dark rounded-2xl border border-grey/30 shadow-2xl overflow-hidden flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-grey/20 bg-dark-lighter/50 sticky top-0 z-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-light">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-grey/20 transition-colors text-light-muted hover:text-light"
            aria-label="Fechar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="prose prose-invert max-w-none space-y-6 text-light-muted leading-relaxed">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-grey/20 bg-dark-lighter/30">
          <button
            onClick={onClose}
            className="btn-primary w-full md:w-auto px-8 py-3 font-bold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

