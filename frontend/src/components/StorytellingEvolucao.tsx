interface StorytellingEvolucaoProps {
  evolucaoPeso: {
    primeiro: number | null
    atual: number | null
    diferenca: number | null
  }
  progressaoForca: Record<string, number>
  totalTreinosMes: number
  semanasSeguidas: number
  totalTreinos: number
}

export default function StorytellingEvolucao({
  evolucaoPeso,
  progressaoForca,
  totalTreinosMes,
  semanasSeguidas,
  totalTreinos
}: StorytellingEvolucaoProps) {
  const getMensagemEvolucao = () => {
    if (totalTreinos === 0) {
      return 'Comece sua jornada hoje!'
    }
    if (totalTreinos === 1) {
      return 'Hoje é seu primeiro treino!'
    }
    if (totalTreinos < 10) {
      return `Hoje é seu treino #${totalTreinos}. Continue assim!`
    }
    if (totalTreinos < 25) {
      return `Você já fez ${totalTreinos} treinos. Dedicação exemplar!`
    }
    return `Incrível! Você já completou ${totalTreinos} treinos. Você é um exemplo!`
  }

  const getProgressaoForcaTexto = () => {
    const grupos = Object.keys(progressaoForca)
    if (grupos.length === 0) return null

    const maiorProgressao = grupos.reduce((max, grupo) => 
      progressaoForca[grupo] > progressaoForca[max] ? grupo : max
    )

    const valor = progressaoForca[maiorProgressao]
    if (valor > 0) {
      return `+${valor.toFixed(0)}% em ${maiorProgressao}`
    }
    return null
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <h3 className="text-xl font-display font-bold text-light">Sua Jornada</h3>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      </div>

      {/* Mensagem Motivacional - Apenas se houver dados relevantes */}
      {totalTreinos > 0 && (
        <div className="card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 mb-6">
          <p className="text-lg font-semibold text-light text-center">
            {getMensagemEvolucao()}
          </p>
        </div>
      )}

      {/* Cards de Evolução */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Evolução de Peso */}
        {evolucaoPeso.primeiro && evolucaoPeso.atual && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-light-muted uppercase tracking-wider font-semibold">Peso</div>
              <svg className="w-5 h-5 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-light-muted">{evolucaoPeso.primeiro.toFixed(1)}</span>
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="text-2xl font-bold text-primary">{evolucaoPeso.atual.toFixed(1)}</span>
              <span className="text-sm text-light-muted">kg</span>
            </div>
            {evolucaoPeso.diferenca !== null && (
              <div className={`text-sm font-semibold ${evolucaoPeso.diferenca < 0 ? 'text-success' : evolucaoPeso.diferenca > 0 ? 'text-primary' : 'text-light-muted'}`}>
                {evolucaoPeso.diferenca > 0 ? '+' : ''}{evolucaoPeso.diferenca.toFixed(1)} kg
              </div>
            )}
          </div>
        )}

        {/* Total de Treinos no Mês */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-light-muted uppercase tracking-wider font-semibold">Este Mês</div>
            <svg className="w-5 h-5 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-primary mb-1">{totalTreinosMes}</div>
          <div className="text-xs text-light-muted">Treinos concluídos este mês</div>
        </div>

        {/* Semanas Seguidas */}
        {semanasSeguidas > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-light-muted uppercase tracking-wider font-semibold">Consistência</div>
              <svg className="w-5 h-5 text-warning/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-warning mb-1">{semanasSeguidas}</div>
            <div className="text-xs text-light-muted">Semanas seguidas</div>
          </div>
        )}
      </div>
    </div>
  )
}

