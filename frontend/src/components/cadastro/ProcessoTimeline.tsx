export default function ProcessoTimeline() {
  const etapas = [
    {
      numero: 1,
      icone: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      titulo: 'Cadastro Agora',
      pontos: [
        'Crie sua conta em 30 segundos',
        'Acesso imediato ao seu treino personalizado',
        'Sem cartão de crédito necessário'
      ]
    },
    {
      numero: 2,
      icone: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      titulo: 'Trial 24 Horas',
      pontos: [
        '24 horas de acesso completo e gratuito',
        'Teste todos os recursos sem compromisso',
        'Treinos, progresso, ajustes automáticos'
      ]
    },
    {
      numero: 3,
      icone: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      titulo: 'Escolha Seu Plano',
      pontos: [
        'Após 24h, escolha o plano ideal',
        'Continue sua evolução sem interrupções',
        'Garantia de 7 dias ou seu dinheiro de volta'
      ]
    }
  ]

  return (
    <section className="py-16 md:py-20 px-4 md:px-6 bg-dark-lighter/30">
      <div className="max-w-6xl mx-auto">
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
            {etapas.map((etapa, index) => (
              <div key={etapa.numero} className="relative">
                {/* Círculo com número */}
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="w-10 h-10 rounded-full bg-primary border-4 border-dark flex items-center justify-center">
                    <span className="text-dark font-bold text-sm">{etapa.numero}</span>
                  </div>
                </div>

                {/* Card da etapa */}
                <div className="mt-20 rounded-2xl bg-dark border-2 border-grey/30 p-6 hover:border-primary/50 transition-all duration-300">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
                      {etapa.icone}
                    </div>
                    <h3 className="text-xl font-bold text-light mb-4">{etapa.titulo}</h3>
                    <ul className="space-y-2 text-left w-full">
                      {etapa.pontos.map((ponto, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-light-muted">{ponto}</span>
                        </li>
                      ))}
                    </ul>
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
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      {etapa.icone}
                    </div>
                    <h3 className="text-xl font-bold text-light">{etapa.titulo}</h3>
                  </div>
                  <ul className="space-y-2">
                    {etapa.pontos.map((ponto, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-light-muted">{ponto}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

