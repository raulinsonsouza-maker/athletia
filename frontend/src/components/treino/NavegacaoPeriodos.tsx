import { useState, useEffect, useRef } from 'react'

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
  const [mostrarDropdown, setMostrarDropdown] = useState(false)
  const [mostrarModalCustomizado, setMostrarModalCustomizado] = useState(false)
  const [tempDataInicio, setTempDataInicio] = useState(
    dataInicioCustomizado ? dataInicioCustomizado.toISOString().split('T')[0] : ''
  )
  const [tempDataFim, setTempDataFim] = useState(
    dataFimCustomizado ? dataFimCustomizado.toISOString().split('T')[0] : ''
  )
  const dropdownRef = useRef<HTMLDivElement>(null)

  const periodos: Array<{ valor: TipoPeriodo; label: string; shortLabel: string; icon: string }> = [
    { valor: 'semana', label: 'Semana Atual', shortLabel: '7 dias', icon: '📅' },
    { valor: '15dias', label: 'Próximos 15 Dias', shortLabel: '15 dias', icon: '📆' },
    { valor: '4semanas', label: 'Próximas 4 Semanas', shortLabel: '28 dias', icon: '🗓️' },
    { valor: 'mes', label: 'Mês Atual', shortLabel: 'Mês', icon: '📊' },
    { valor: 'mesSeguinte', label: 'Mês Seguinte', shortLabel: 'Próximo', icon: '⏭️' },
    { valor: 'customizado', label: 'Período Customizado', shortLabel: 'Custom', icon: '⚙️' }
  ]

  const periodoAtual = periodos.find(p => p.valor === periodoSelecionado) || periodos[0]

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMostrarDropdown(false)
      }
    }

    if (mostrarDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mostrarDropdown])

  const handlePeriodoClick = (periodo: TipoPeriodo) => {
    if (periodo === 'customizado') {
      setMostrarModalCustomizado(true)
      setMostrarDropdown(false)
    } else {
      onPeriodoChange(periodo)
      setMostrarDropdown(false)
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
        {/* Botão Dropdown de Período */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setMostrarDropdown(!mostrarDropdown)}
            className="w-full sm:w-auto px-4 py-2.5 bg-dark-lighter border-2 border-grey/30 rounded-lg text-light hover:border-primary/50 transition-all flex items-center justify-between gap-3 font-medium"
            aria-label="Selecionar período"
            aria-expanded={mostrarDropdown}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">{periodoAtual.label}</span>
            </div>
            <svg 
              className={`w-5 h-5 transition-transform ${mostrarDropdown ? 'transform rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {mostrarDropdown && (
            <div className="absolute top-full left-0 mt-2 w-full sm:w-64 bg-dark-lighter border-2 border-grey/30 rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="py-2">
                {periodos.map((periodo) => (
                  <button
                    key={periodo.valor}
                    onClick={() => handlePeriodoClick(periodo.valor)}
                    className={`
                      w-full px-4 py-3 text-left transition-all flex items-center gap-3
                      ${
                        periodoSelecionado === periodo.valor
                          ? 'bg-primary/20 text-primary border-l-4 border-primary'
                          : 'text-light hover:bg-dark/50 hover:text-primary'
                      }
                    `}
                  >
                    <span className="text-lg">{periodo.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{periodo.label}</div>
                      <div className="text-xs text-light-muted mt-0.5">{periodo.shortLabel}</div>
                    </div>
                    {periodoSelecionado === periodo.valor && (
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
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

