import { ReactNode } from 'react'

interface OnboardingStepCardProps {
  selected?: boolean
  onClick: () => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  children: ReactNode
  className?: string
  ariaLabel?: string
  ariaPressed?: boolean
}

export default function OnboardingStepCard({
  selected = false,
  onClick,
  onKeyDown,
  children,
  className = '',
  ariaLabel,
  ariaPressed
}: OnboardingStepCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`relative overflow-hidden rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
        selected
          ? 'ring-4 ring-primary scale-105'
          : 'ring-2 ring-slate-300 hover:ring-primary/50'
      } ${className}`}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
    >
      {children}
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  )
}

