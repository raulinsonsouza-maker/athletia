interface BeneficiosSectionProps {
  onScrollToForm: () => void
}

export default function BeneficiosSection({ onScrollToForm }: BeneficiosSectionProps) {
  const beneficios = [
    {
      titulo: 'Treino personalizado',
      descricao: 'Baseado no seu perfil, objetivo e experiência'
    },
    {
      titulo: 'Ajustes automáticos',
      descricao: 'A IA adapta seu treino conforme seu progresso'
    },
    {
      titulo: 'Progressão inteligente',
      descricao: 'Evolua sem platôs com ajustes baseados em ciência'
    },
    {
      titulo: 'Histórico completo',
      descricao: 'Acompanhe sua evolução e resultados'
    }
  ]

  return (
    <section className="py-16 md:py-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-4">
            Benefícios simples e diretos
          </h2>
          <p className="text-lg text-light-muted">
            O que você ganha ao usar a plataforma
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {beneficios.map((beneficio, index) => (
            <div
              key={index}
              className="rounded-2xl bg-dark-lighter border-2 border-grey/30 p-6 hover:border-primary/50 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-light mb-2">{beneficio.titulo}</h3>
                  <p className="text-sm text-light-muted leading-relaxed">{beneficio.descricao}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onScrollToForm}
            className="btn-primary text-base md:text-lg px-8 md:px-12 py-4 md:py-5 font-bold shadow-xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Começar agora
          </button>
        </div>
      </div>
    </section>
  )
}

