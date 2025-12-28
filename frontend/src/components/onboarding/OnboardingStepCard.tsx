import { ReactNode } from 'react'

interface OnboardingStepCardProps {
  selected?: boolean
  onClick: () => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  children: ReactNode
  className?: string
  ariaLabel?: string
  ariaPressed?: boolean
  variant?: 'compact' | 'normal'
  imageFit?: 'top' | 'center' | 'cover'
}

export default function OnboardingStepCard({
  selected = false,
  onClick,
  onKeyDown,
  children,
  className = '',
  ariaLabel,
  ariaPressed,
  variant,
  imageFit = 'cover'
}: OnboardingStepCardProps) {
  // Detectar mobile automaticamente se variant não for especificado
  const isCompact = variant === 'compact' || (variant === undefined && typeof window !== 'undefined' && window.innerWidth < 640)
  const ringClass = isCompact 
    ? (selected ? 'ring-2 ring-primary' : 'ring-2 ring-slate-300 hover:ring-primary/50')
    : (selected ? 'ring-4 ring-primary' : 'ring-2 ring-slate-300 hover:ring-primary/50')

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`relative overflow-hidden rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary ${ringClass} ${className}`}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
    >
      {children}
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 md:w-6 md:h-6 bg-primary rounded-full flex items-center justify-center z-10">
          <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  )
}

