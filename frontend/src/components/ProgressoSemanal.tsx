interface ProgressoSemanalProps {
  concluidos: number
  meta: number
  porcentagem: number
  faltam: number
  sequenciaAtual: number
  melhorSequencia: number
  ehRecorde: boolean
}

export default function ProgressoSemanal({
  concluidos,
  meta,
  porcentagem,
  faltam,
  sequenciaAtual,
  melhorSequencia,
  ehRecorde
}: ProgressoSemanalProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <h3 className="text-xl font-display font-bold text-light">Sua Semana Até Agora</h3>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      </div>

      {/* Barra de Progresso Principal */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-bold text-light mb-1">Progresso Semanal</h4>
            <p className="text-sm text-light-muted">
              {concluidos} de {meta} treinos realizados
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{porcentagem}%</div>
            {faltam > 0 && (
              <p className="text-xs text-light-muted mt-1">Faltam {faltam} treino{faltam > 1 ? 's' : ''}</p>
            )}
          </div>
        </div>

        {/* Barra de Progresso Visual */}
        <div className="w-full bg-dark-lighter rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
            style={{ width: `${Math.min(porcentagem, 100)}%` }}
          >
            {porcentagem >= 100 && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sequência Atual */}
        <div className={`card ${ehRecorde ? 'border-warning/50 bg-warning/10' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-light-muted uppercase tracking-wider font-semibold">Sequência</div>
            {ehRecorde && (
              <span className="badge-warning text-xs flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-4 1.5-5.5C11.5 6 12 8 13 9c0-2 1-4 3-5s4 1 5 2c0 2-1 4-2 5 1 1 2 2 2 4a8 8 0 01-4.343 4.657z" />
                </svg>
                Recorde!
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-primary mb-1">{sequenciaAtual}</div>
          <div className="text-xs text-light-muted">Dias consecutivos</div>
          {melhorSequencia > sequenciaAtual && (
            <div className="text-xs text-light-muted mt-2">
              Melhor: {melhorSequencia} dias
            </div>
          )}
        </div>

        {/* Taxa de Conclusão */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-light-muted uppercase tracking-wider font-semibold">Taxa de Conclusão</div>
            <svg className="w-5 h-5 text-success/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-success mb-1">{porcentagem}%</div>
          <div className="text-xs text-light-muted">Desta semana</div>
        </div>

        {/* Status da Meta */}
        <div className={`card ${porcentagem >= 100 ? 'border-success/50 bg-success/10' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-light-muted uppercase tracking-wider font-semibold">Meta Semanal</div>
            {porcentagem >= 100 ? (
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-warning/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="text-3xl font-bold mb-1">
            <span className={porcentagem >= 100 ? 'text-success' : 'text-warning'}>
              {concluidos}/{meta}
            </span>
          </div>
          <div className="text-xs text-light-muted">
            {porcentagem >= 100 ? 'Meta alcançada!' : faltam > 0 ? `Faltam ${faltam} treino${faltam > 1 ? 's' : ''}` : 'Quase lá!'}
          </div>
        </div>
      </div>
    </div>
  )
}

