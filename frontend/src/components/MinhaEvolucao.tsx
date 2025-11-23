interface MinhaEvolucaoProps {
  evolucao: {
    peso: {
      primeiro: number | null
      atual: number | null
      diferenca: number | null
    }
    progressaoForca: Record<string, number>
    semanasSeguidas: number
    totalTreinosMes?: number
  }
  sequencia: {
    atual: number
    melhor: number
  }
  totalTreinos?: number
}

export default function MinhaEvolucao({ evolucao, sequencia, totalTreinos = 0 }: MinhaEvolucaoProps) {
  const pesoDiferenca = evolucao.peso.diferenca
  const pesoFormatado = pesoDiferenca && Math.abs(pesoDiferenca) > 0.1
    ? pesoDiferenca > 0 
      ? `+${pesoDiferenca.toFixed(1)} kg`
      : `${pesoDiferenca.toFixed(1)} kg`
    : null

  // Pegar o maior ganho de força
  const maiorGanhoForca = Object.entries(evolucao.progressaoForca)
    .filter(([, valor]) => valor > 0)
    .sort(([, a], [, b]) => b - a)[0]

  // Determinar se há dados relevantes para mostrar
  const temPeso = evolucao.peso.primeiro && evolucao.peso.atual && Math.abs(pesoDiferenca || 0) > 0.1
  const temForca = maiorGanhoForca && maiorGanhoForca[1] > 0
  const temSequencia = sequencia.atual > 0 || sequencia.melhor > 0
  const temTreinos = totalTreinos > 0
  const temDados = temPeso || temForca || temSequencia || temTreinos || (evolucao.totalTreinosMes || 0) > 0

  if (!temDados) {
    return null
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <h3 className="text-xl font-display font-bold text-light">Minha Evolução</h3>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Peso Corporal - Só mostrar se houver mudança significativa */}
        {temPeso && evolucao.peso.atual && (
          <div className="card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <div className="text-xs text-light-muted uppercase tracking-wider mb-2">Peso Corporal</div>
            <div className="text-2xl font-bold text-primary mb-1">
              {evolucao.peso.atual.toFixed(1)} kg
            </div>
            {pesoFormatado && (
              <div className={`text-xs font-semibold ${pesoDiferenca && pesoDiferenca < 0 ? 'text-success' : 'text-primary'}`}>
                {pesoFormatado}
              </div>
            )}
          </div>
        )}

        {/* Progresso de Força - Só mostrar se houver progresso */}
        {temForca && (
          <div className="card bg-gradient-to-br from-success/10 to-success/5 border-success/30">
            <div className="text-xs text-light-muted uppercase tracking-wider mb-2">Progresso de Força</div>
            <div className="text-2xl font-bold text-success mb-1">
              +{maiorGanhoForca[1].toFixed(0)}%
            </div>
            <div className="text-xs text-light-muted">
              {maiorGanhoForca[0]}
            </div>
          </div>
        )}

        {/* Sequência */}
        {temSequencia && (
          <div className="card bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30">
            <div className="text-xs text-light-muted uppercase tracking-wider mb-2">Sequência</div>
            <div className="text-2xl font-bold text-warning mb-1">
              {sequencia.atual} dias
            </div>
            <div className="text-xs text-light-muted">
              {sequencia.atual === sequencia.melhor ? '🎉 Recorde!' : `Melhor: ${sequencia.melhor} dias`}
            </div>
          </div>
        )}

        {/* Treinos */}
        {temTreinos && (
          <div className="card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <div className="text-xs text-light-muted uppercase tracking-wider mb-2">Treinos Completados</div>
            <div className="text-2xl font-bold text-primary mb-1">
              {totalTreinos}
            </div>
            {evolucao.totalTreinosMes && evolucao.totalTreinosMes > 0 && (
              <div className="text-xs text-light-muted">
                {evolucao.totalTreinosMes} este mês
              </div>
            )}
            {evolucao.semanasSeguidas > 0 && (
              <div className="text-xs text-light-muted mt-1">
                {evolucao.semanasSeguidas} semanas seguidas
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

