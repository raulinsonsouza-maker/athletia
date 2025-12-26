interface ProcessoTimelineProps {
  onScrollToForm: () => void
}

export default function ProcessoTimeline({ onScrollToForm }: ProcessoTimelineProps) {
  const etapas = [
    {
      numero: 1,
      titulo: 'O que acontece agora',
      descricao: 'Você cria sua conta em menos de 30 segundos. Sem cartão de crédito necessário.',
      resultado: 'Acesso imediato ao seu treino personalizado'
    },
    {
      numero: 2,
      titulo: 'Durante 3 dias',
      descricao: 'Teste todos os recursos da plataforma sem nenhum custo.',
      resultado: 'Treinos, progresso e ajustes automáticos disponíveis'
    },
    {
      numero: 3,
      titulo: 'Após 3 dias',
      descricao: 'Escolha um dos planos para continuar sua evolução sem interrupções.',
      resultado: 'Acesso contínuo com treinos gerados para 30 dias'
    }
  ]

  return (
    <section className="py-16 md:py-20 px-4 md:px-6 bg-dark-lighter/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-4">
            Como funciona o processo
          </h2>
          <p className="text-lg text-light-muted">
            Simples, rápido e sem complicações
          </p>
        </div>

        {/* Timeline Desktop */}
        <div className="hidden md:block relative">
          {/* Linha conectora */}
          <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50"></div>

          <div className="grid grid-cols-3 gap-8 relative">
            {etapas.map((etapa) => (
              <div key={etapa.numero} className="relative">
                {/* Círculo com número */}
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="w-10 h-10 rounded-full bg-primary border-4 border-dark flex items-center justify-center">
                    <span className="text-dark font-bold text-sm">{etapa.numero}</span>
                  </div>
                </div>

                {/* Card da etapa */}
                <div className="mt-20 rounded-2xl bg-dark border-2 border-grey/30 p-6 hover:border-primary/50 transition-all duration-300">
                  <h3 className="text-xl font-bold text-light mb-3">{etapa.titulo}</h3>
                  <p className="text-sm text-light-muted mb-4 leading-relaxed">{etapa.descricao}</p>
                  <div className="flex items-start gap-2 pt-4 border-t border-grey/20">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-primary">{etapa.resultado}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Mobile */}
        <div className="md:hidden space-y-8">
          {etapas.map((etapa, index) => (
            <div key={etapa.numero} className="relative">
              {/* Linha conectora (exceto última) */}
              {index < etapas.length - 1 && (
                <div className="absolute top-16 left-8 w-0.5 h-full bg-gradient-to-b from-primary/50 to-primary/50"></div>
              )}

              <div className="flex gap-4">
                {/* Círculo com número */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-primary border-4 border-dark flex items-center justify-center">
                    <span className="text-dark font-bold">{etapa.numero}</span>
                  </div>
                </div>

                {/* Card da etapa */}
                <div className="flex-1 rounded-2xl bg-dark border-2 border-grey/30 p-6">
                  <h3 className="text-xl font-bold text-light mb-3">{etapa.titulo}</h3>
                  <p className="text-sm text-light-muted mb-4 leading-relaxed">{etapa.descricao}</p>
                  <div className="flex items-start gap-2 pt-4 border-t border-grey/20">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-primary">{etapa.resultado}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button
            onClick={onScrollToForm}
            className="btn-primary text-base md:text-lg px-8 md:px-12 py-4 md:py-5 font-bold shadow-xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Finalizar meu cadastro
          </button>
        </div>
      </div>
    </section>
  )
}
