interface ComparisonTableProps {
  onStartOnboarding: () => void
}

export default function ComparisonTable({ onStartOnboarding }: ComparisonTableProps) {
  return (
    <section aria-label="A comparação que importa" className="py-16 md:py-20 px-4 md:px-6 bg-gradient-to-b from-dark via-dark-lighter/50 to-dark">
      <div className="max-w-5xl mx-auto space-y-8 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light">
          A comparação que importa
        </h2>

        <div className="grid md:grid-cols-3 gap-6 pt-8">
          {/* Treinos Genéricos */}
          <div className="rounded-2xl border-2 border-error/30 bg-dark/90 p-6 space-y-3 shadow-xl">
            <h3 className="text-xl font-bold text-light">Treinos genéricos</h3>
            <p className="text-lg font-semibold text-error">não evoluem</p>
          </div>

          {/* Personal Trainer */}
          <div className="rounded-2xl border-2 border-warning/30 bg-dark/90 p-6 space-y-3 shadow-xl">
            <h3 className="text-xl font-bold text-light">Personal trainer</h3>
            <p className="text-lg font-semibold text-warning">caro</p>
          </div>

          {/* AthletIA */}
          <div className="rounded-2xl border-4 border-primary bg-gradient-to-br from-primary/20 to-primary/10 p-6 space-y-3 shadow-2xl shadow-primary/30">
            <h3 className="text-xl font-bold text-primary">AthletIA</h3>
            <p className="text-lg font-semibold text-light">personalizado, automático e acessível</p>
          </div>
        </div>

        <div className="pt-8">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onStartOnboarding()
            }}
            className="btn-primary text-lg md:text-xl px-10 md:px-16 py-5 md:py-6 font-bold shadow-2xl shadow-primary/50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
            aria-label="Criar meu treino personalizado agora"
          >
            Criar meu treino agora
          </button>
        </div>
      </div>
    </section>
  )
}

