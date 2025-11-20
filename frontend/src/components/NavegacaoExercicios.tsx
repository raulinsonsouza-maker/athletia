interface NavegacaoExerciciosProps {
  podeAnterior: boolean
  podeProximo: boolean
  onAnterior: () => void
  onProximo: () => void
}

export default function NavegacaoExercicios({
  podeAnterior,
  podeProximo,
  onAnterior,
  onProximo
}: NavegacaoExerciciosProps) {
  return (
    <div className="w-full px-4 py-4 flex gap-4">
      <button
        onClick={onAnterior}
        disabled={!podeAnterior}
        className={`
          flex-1 h-14 md:h-16 rounded-xl font-bold text-base md:text-lg
          transition-all duration-200 shadow-lg
          ${podeAnterior
            ? 'bg-dark-lighter text-light hover:bg-dark-lighter/80 active:scale-95 border-2 border-primary/30'
            : 'bg-dark-lighter/50 text-light-muted cursor-not-allowed border-2 border-grey/20'
          }
        `}
      >
        <div className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </div>
      </button>

      <button
        onClick={onProximo}
        disabled={!podeProximo}
        className={`
          flex-1 h-14 md:h-16 rounded-xl font-bold text-base md:text-lg
          transition-all duration-200 shadow-lg
          ${podeProximo
            ? 'bg-primary text-white hover:bg-primary/90 active:scale-95'
            : 'bg-dark-lighter/50 text-light-muted cursor-not-allowed border-2 border-grey/20'
          }
        `}
      >
        <div className="flex items-center justify-center gap-2">
          Próximo
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </div>
  )
}

