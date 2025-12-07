/**
 * Componente de ícone para dia da semana
 * Mostra check (✓) quando treinou, X quando não treinou, ou relógio quando ainda vai treinar
 */

interface DiaSemanaIconProps {
  status: 'concluido' | 'nao-treinou' | 'futuro' | 'hoje'
  size?: number
  className?: string
}

export default function DiaSemanaIcon({ status, size = 20, className = '' }: DiaSemanaIconProps) {
  const baseClasses = `flex-shrink-0 ${className}`

  if (status === 'concluido') {
    // Check verde - treinou
    return (
      <svg
        className={baseClasses}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" fill="#10B981" />
        <path
          d="M8 12L11 15L16 9"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (status === 'nao-treinou') {
    // X vermelho - não treinou
    return (
      <svg
        className={baseClasses}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" fill="#EF4444" />
        <path
          d="M9 9L15 15M15 9L9 15"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  // Relógio amarelo - ainda vai treinar (futuro ou hoje)
  return (
    <svg
      className={baseClasses}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" fill="#F9A620" />
      <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.5" fill="none" />
      <path
        d="M12 8V12L15 15"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

