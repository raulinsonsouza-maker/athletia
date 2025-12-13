import { ReactNode } from 'react'

interface BlogTipBoxProps {
  children: ReactNode
  title?: string
  type?: 'tip' | 'warning' | 'info'
}

/**
 * Componente para destacar dicas e informações importantes
 * Similar ao padrão Befit, mas mantendo o design dark do AthletIA
 */
export default function BlogTipBox({ 
  children, 
  title,
  type = 'tip' 
}: BlogTipBoxProps) {
  const typeStyles = {
    tip: {
      bg: 'bg-primary/10',
      border: 'border-primary/30',
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      icon: (
        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      icon: (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  }

  const style = typeStyles[type]

  return (
    <div className={`blog-tip-box ${style.bg} ${style.border} border rounded-xl p-6 my-6`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          {style.icon}
        </div>
        <div className="flex-1">
          {title && (
            <h4 className="text-lg font-bold text-light mb-2">
              {title}
            </h4>
          )}
          <div className="text-light-muted leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
