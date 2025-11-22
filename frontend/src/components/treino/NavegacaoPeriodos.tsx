import { useState } from 'react'

export type TipoPeriodo = 'semana' | '15dias' | '4semanas' | 'mes' | 'mesSeguinte' | 'customizado'

interface NavegacaoPeriodosProps {
  periodoSelecionado: TipoPeriodo
  onPeriodoChange: (periodo: TipoPeriodo) => void
  onDataInicioChange?: (data: Date) => void
  onDataFimChange?: (data: Date) => void
  dataInicioCustomizado?: Date
  dataFimCustomizado?: Date
  onAnterior?: () => void
  onProximo?: () => void
  mostrarNavegacao?: boolean
}

export default function NavegacaoPeriodos({
  periodoSelecionado,
  onPeriodoChange,
  onDataInicioChange,
  onDataFimChange,
  dataInicioCustomizado,
  dataFimCustomizado,
  onAnterior,
  onProximo,
  mostrarNavegacao = true
}: NavegacaoPeriodosProps) {
  const [mostrarModalCustomizado, setMostrarModalCustomizado] = useState(false)
  const [tempDataInicio, setTempDataInicio] = useState(
    dataInicioCustomizado ? dataInicioCustomizado.toISOString().split('T')[0] : ''
  )
  const [tempDataFim, setTempDataFim] = useState(
    dataFimCustomizado ? dataFimCustomizado.toISOString().split('T')[0] : ''
  )

  const periodos: Array<{ valor: TipoPeriodo; label: string; shortLabel: string }> = [
    { valor: 'semana', label: 'Semana Atual', shortLabel: '7 dias' },
    { valor: '15dias', label: 'Próximos 15 Dias', shortLabel: '15 dias' },
    { valor: '4semanas', label: 'Próximas 4 Semanas', shortLabel: '28 dias' },
    { valor: 'mes', label: 'Mês Atual', shortLabel: 'Mês' },
    { valor: 'mesSeguinte', label: 'Mês Seguinte', shortLabel: 'Próximo' },
    { valor: 'customizado', label: 'Período Customizado', shortLabel: 'Custom' }
  ]

  const handlePeriodoClick = (periodo: TipoPeriodo) => {
    if (periodo === 'customizado') {
      setMostrarModalCustomizado(true)
    } else {
      onPeriodoChange(periodo)
    }
  }

  const handleConfirmarCustomizado = () => {
    if (tempDataInicio && tempDataFim) {
      const inicio = new Date(tempDataInicio)
      const fim = new Date(tempDataFim)
      
      if (inicio > fim) {
        alert('A data de início deve ser anterior à data de fim')
        return
      }
      
      if (onDataInicioChange) onDataInicioChange(inicio)
      if (onDataFimChange) onDataFimChange(fim)
      onPeriodoChange('customizado')
      setMostrarModalCustomizado(false)
    }
  }

  return (
    <>
      <div className="mb-6">
        {/* Botões de período */}
        <div className="flex flex-wrap gap-2 mb-4">
          {periodos.map((periodo) => (
            <button
              key={periodo.valor}
              onClick={() => handlePeriodoClick(periodo.valor)}
              className={`
                px-3 py-2 rounded-lg font-medium transition-all text-sm
                flex items-center gap-2
                ${
                  periodoSelecionado === periodo.valor
                    ? 'bg-primary text-light border-2 border-primary shadow-lg shadow-primary/20'
                    : 'bg-dark-lighter text-light-muted border-2 border-grey/30 hover:border-primary/50 hover:text-light'
                }
              `}
            >
              {periodoSelecionado === periodo.valor ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
              <span className="hidden sm:inline">{periodo.label}</span>
              <span className="sm:hidden">{periodo.shortLabel}</span>
            </button>
          ))}
        </div>

        {/* Navegação anterior/próximo */}
        {mostrarNavegacao && (onAnterior || onProximo) && (
          <div className="flex items-center justify-between">
            <button
              onClick={onAnterior}
              disabled={!onAnterior}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${
                  onAnterior
                    ? 'bg-dark-lighter text-light hover:bg-primary/20 border-2 border-transparent hover:border-primary/50'
                    : 'bg-dark-lighter/50 text-light-muted cursor-not-allowed border-2 border-transparent'
                }
              `}
            >
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>

            <div className="text-sm text-light-muted">
              {periodoSelecionado === 'semana' && 'Semana Atual'}
              {periodoSelecionado === '15dias' && 'Próximos 15 Dias'}
              {periodoSelecionado === '4semanas' && 'Próximas 4 Semanas'}
              {periodoSelecionado === 'mes' && 'Mês Atual'}
              {periodoSelecionado === 'mesSeguinte' && 'Mês Seguinte'}
              {periodoSelecionado === 'customizado' && 'Período Customizado'}
            </div>

            <button
              onClick={onProximo}
              disabled={!onProximo}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${
                  onProximo
                    ? 'bg-dark-lighter text-light hover:bg-primary/20 border-2 border-transparent hover:border-primary/50'
                    : 'bg-dark-lighter/50 text-light-muted cursor-not-allowed border-2 border-transparent'
                }
              `}
            >
              Próximo
              <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Modal para período customizado */}
      {mostrarModalCustomizado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark rounded-xl p-6 max-w-md w-full mx-4 border-2 border-primary/30">
            <h3 className="text-xl font-bold text-light mb-4">Período Customizado</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-muted mb-2">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={tempDataInicio}
                  onChange={(e) => setTempDataInicio(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-lighter border-2 border-grey/30 rounded-lg text-light focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-muted mb-2">
                  Data de Fim
                </label>
                <input
                  type="date"
                  value={tempDataFim}
                  onChange={(e) => setTempDataFim(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-lighter border-2 border-grey/30 rounded-lg text-light focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setMostrarModalCustomizado(false)}
                className="flex-1 px-4 py-2 bg-dark-lighter text-light rounded-lg hover:bg-dark-lighter/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarCustomizado}
                className="flex-1 px-4 py-2 bg-primary text-light rounded-lg hover:bg-primary/80 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

