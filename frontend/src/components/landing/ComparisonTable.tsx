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
    <section aria-label="Comparação: AthletIA vs treinos genéricos e personal trainer" className="py-16 md:py-20 px-4 md:px-6 bg-dark-lighter/50 border-y border-grey/20">
      <div className="max-w-6xl mx-auto space-y-10 md:space-y-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light max-w-3xl text-center md:text-left">
          O AthletIA entrega o que nenhum treino genérico e nenhum personal entrega ao mesmo tempo.
        </h2>

        {/* Versão mobile: cards empilhados */}
        <div className="grid gap-4 md:hidden">
          <div className="rounded-2xl border border-grey/20 bg-dark p-5 space-y-3">
            <h3 className="text-base font-semibold text-light">Treinos Genéricos</h3>
            <ul className="space-y-1.5 text-sm text-light-muted">
              <li>• Sem personalização</li>
              <li>• Sem progressão real</li>
              <li>• Sem histórico</li>
              <li>• Preço médio mensal</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-grey/20 bg-dark p-5 space-y-3">
            <h3 className="text-base font-semibold text-light">Personal Trainer</h3>
            <ul className="space-y-1.5 text-sm text-light-muted">
              <li>• Personalização boa</li>
              <li>• Caro</li>
              <li>• Agenda limitada</li>
              <li>• Sem ajustes automáticos</li>
            </ul>
          </div>

          <div className="rounded-2xl border-2 border-primary bg-primary/10 p-5 space-y-3">
            <h3 className="text-base font-semibold text-primary">AthletIA</h3>
            <ul className="space-y-1.5 text-sm text-light">
              <li>• Personalização total</li>
              <li>• Ajustes automáticos diários</li>
              <li>• Histórico completo</li>
              <li>• Acesso imediato</li>
              <li>• Preço muito menor</li>
            </ul>
          </div>
        </div>

        {/* Versão desktop: tabela completa */}
        <div className="hidden md:block overflow-x-auto rounded-3xl border border-grey/20 bg-dark-lighter shadow-xl">
          <table className="w-full min-w-[640px] text-sm md:text-base">
            <thead className="bg-dark border-b border-grey/20">
              <tr>
                <th className="px-4 md:px-6 py-4 text-left text-light-muted font-medium"></th>
                <th className="px-4 md:px-6 py-4 text-center text-light-muted font-semibold">
                  Treinos Genéricos
                </th>
                <th className="px-4 md:px-6 py-4 text-center text-light-muted font-semibold">
                  Personal Trainer
                </th>
                <th className="px-4 md:px-6 py-4 text-center text-primary font-semibold">
                  AthletIA
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_DATA.map((row) => (
                <tr key={row.feature} className="border-t border-grey/20 hover:bg-dark/50 transition-colors">
                  <td className="px-4 md:px-6 py-4 text-light font-medium text-left">
                    {row.feature}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-center text-light-muted">{row.generico}</td>
                  <td className="px-4 md:px-6 py-4 text-center text-light-muted">{row.trainer}</td>
                  <td className="px-4 md:px-6 py-4 text-center font-semibold text-primary">{row.athletia}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center md:text-left">
          <button
            onClick={onStartOnboarding}
            className="btn-primary text-base md:text-lg px-10 md:px-14 py-4 md:py-5 font-bold shadow-xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Criar meu treino agora
          </button>
        </div>
      </div>
    </section>
  )
}

