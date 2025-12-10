interface ComparisonTableProps {
  onStartOnboarding: () => void
}

const COMPARISON_DATA = [
  {
    feature: 'Personalização',
    generico: 'Sem personalização',
    trainer: 'Personalização boa',
    athletia: 'Personalização total'
  },
  {
    feature: 'Progressão real',
    generico: 'Sem progressão real',
    trainer: 'Depende do profissional',
    athletia: 'Ajustes automáticos diários'
  },
  {
    feature: 'Histórico de evolução',
    generico: 'Sem histórico',
    trainer: 'Anotações manuais',
    athletia: 'Histórico completo'
  },
  {
    feature: 'Acesso',
    generico: 'Imediato',
    trainer: 'Agenda limitada',
    athletia: 'Acesso imediato'
  },
  {
    feature: 'Preço médio mensal',
    generico: 'Médio',
    trainer: 'Caro',
    athletia: 'Preço muito menor'
  }
] as const

export default function ComparisonTable({ onStartOnboarding }: ComparisonTableProps) {
  return (
    <section aria-label="Comparação: AthletIA vs treinos genéricos e personal trainer" className="py-20 md:py-28 px-4 md:px-6 bg-gradient-to-b from-dark via-dark-lighter/50 to-dark">
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-light leading-tight max-w-4xl mx-auto">
            O AthletIA entrega o que nenhum treino genérico e nenhum personal entrega ao mesmo tempo.
          </h2>
          <p className="text-xl md:text-2xl font-semibold text-primary">
            Compare e veja a diferença
          </p>
        </div>

        {/* Versão mobile: cards empilhados */}
        <div className="grid gap-6 md:hidden">
          <div className="rounded-3xl border-2 border-error/30 bg-dark/90 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <h3 className="text-xl font-bold text-light">Treinos Genéricos</h3>
            </div>
            <ul className="space-y-2.5 text-base text-light-muted">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-error mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Sem personalização</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-error mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Sem progressão real</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-error mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Sem histórico</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-error mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Preço médio mensal</span>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border-2 border-warning/30 bg-dark/90 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-bold text-light">Personal Trainer</h3>
            </div>
            <ul className="space-y-2.5 text-base text-light-muted">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Personalização boa</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-error mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Caro (R$ 200-500/mês)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-error mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Agenda limitada</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-error mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Sem ajustes automáticos</span>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border-4 border-primary bg-gradient-to-br from-primary/20 to-primary/10 p-6 space-y-4 shadow-2xl shadow-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-dark px-4 py-1 rounded-bl-2xl font-bold text-sm">
              RECOMENDADO
            </div>
            <div className="flex items-center gap-3 pt-2">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-2xl font-extrabold text-primary">AthletIA</h3>
            </div>
            <ul className="space-y-2.5 text-base text-light">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">Personalização total</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">Ajustes automáticos diários</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">Histórico completo</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">Acesso imediato 24/7</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">Preço muito menor</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Versão desktop: tabela completa */}
        <div className="hidden md:block overflow-x-auto rounded-3xl border-2 border-grey/30 bg-dark-lighter shadow-2xl">
          <table className="w-full min-w-[700px] text-base">
            <thead className="bg-dark border-b-2 border-primary/30">
              <tr>
                <th className="px-6 py-5 text-left text-light font-bold text-lg"></th>
                <th className="px-6 py-5 text-center text-error font-semibold text-lg">
                  Treinos Genéricos
                </th>
                <th className="px-6 py-5 text-center text-warning font-semibold text-lg">
                  Personal Trainer
                </th>
                <th className="px-6 py-5 text-center text-primary font-extrabold text-xl bg-primary/10 relative">
                  <span className="absolute top-0 right-0 bg-primary text-dark px-3 py-1 rounded-bl-lg text-xs font-bold">
                    RECOMENDADO
                  </span>
                  AthletIA
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_DATA.map((row, index) => (
                <tr key={row.feature} className={`border-t border-grey/20 ${index % 2 === 0 ? 'bg-dark/30' : 'bg-dark/50'} hover:bg-dark transition-colors`}>
                  <td className="px-6 py-5 text-light font-bold text-left">
                    {row.feature}
                  </td>
                  <td className="px-6 py-5 text-center text-light-muted">
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {row.generico}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center text-light-muted">
                    <span className="flex items-center justify-center gap-2">
                      {row.trainer.includes('boa') ? (
                        <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {row.trainer}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-primary text-lg bg-primary/5">
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {row.athletia}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center pt-8">
          <button
            onClick={onStartOnboarding}
            className="btn-primary text-xl md:text-2xl px-12 md:px-20 py-6 md:py-7 font-bold shadow-2xl shadow-primary/50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
          >
            Criar meu treino agora
          </button>
        </div>
      </div>
    </section>
  )
}

