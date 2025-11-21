interface MinhaEvolucaoProps {
  evolucao: {
    peso: {
      primeiro: number | null
      atual: number | null
      diferenca: number | null
    }
    progressaoForca: Record<string, number>
    semanasSeguidas: number
  }
  sequencia: {
    atual: number
    melhor: number
  }
}

export default function MinhaEvolucao({ evolucao, sequencia }: MinhaEvolucaoProps) {
  const pesoDiferenca = evolucao.peso.diferenca
  const pesoFormatado = pesoDiferenca 
    ? pesoDiferenca > 0 
      ? `+${pesoDiferenca.toFixed(1)} kg`
      : `${pesoDiferenca.toFixed(1)} kg`
    : null

  // Pegar o maior ganho de força
  const maiorGanhoForca = Object.entries(evolucao.progressaoForca)
    .sort(([, a], [, b]) => b - a)[0]

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <h3 className="text-xl font-display font-bold text-light">Minha Evolução</h3>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Peso */}
        {evolucao.peso.primeiro && evolucao.peso.atual && (
          <div className="card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <div className="text-xs text-light-muted uppercase tracking-wider mb-2">Peso</div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-light">
                {evolucao.peso.primeiro.toFixed(1)}
              </span>
              <span className="text-light-muted">→</span>
              <span className="text-2xl font-bold text-primary">
                {evolucao.peso.atual.toFixed(1)} kg
              </span>
            </div>
            {pesoFormatado && (
              <div className={`text-sm font-semibold ${pesoDiferenca && pesoDiferenca < 0 ? 'text-success' : 'text-warning'}`}>
                {pesoFormatado}
              </div>
            )}
          </div>
        )}

        {/* Força */}
        {maiorGanhoForca && maiorGanhoForca[1] > 0 && (
          <div className="card bg-gradient-to-br from-success/10 to-success/5 border-success/30">
            <div className="text-xs text-light-muted uppercase tracking-wider mb-2">Força</div>
            <div className="text-2xl font-bold text-success mb-1">
              +{maiorGanhoForca[1].toFixed(0)}%
            </div>
            <div className="text-sm text-light-muted">
              em {maiorGanhoForca[0]} neste mês
            </div>
          </div>
        )}

        {/* Melhor Sequência */}
        <div className="card bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30">
          <div className="text-xs text-light-muted uppercase tracking-wider mb-2">Melhor Sequência</div>
          <div className="text-2xl font-bold text-warning mb-1">
            {sequencia.melhor} dias
          </div>
          <div className="text-sm text-light-muted">
            Sequência atual: {sequencia.atual} dias
          </div>
        </div>
      </div>
    </div>
  )
}

