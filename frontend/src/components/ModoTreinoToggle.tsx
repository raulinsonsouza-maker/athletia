import { useState, useEffect } from 'react'
import { obterModoTreino, atualizarModoTreino, ModoTreino } from '../services/modo-treino.service'
import { useToast } from '../hooks/useToast'

interface ModoTreinoToggleProps {
  onModoChange?: (modo: ModoTreino) => void
}

export default function ModoTreinoToggle({ onModoChange }: ModoTreinoToggleProps) {
  const { showToast } = useToast()
  const [modoTreino, setModoTreino] = useState<ModoTreino>('IA')
  const [loading, setLoading] = useState(true)
  const [alterando, setAlterando] = useState(false)

  useEffect(() => {
    carregarModoTreino()
  }, [])

  const carregarModoTreino = async () => {
    try {
      setLoading(true)
      const modo = await obterModoTreino()
      setModoTreino(modo)
      // Chamar onModoChange para sincronizar com o componente pai
      if (onModoChange) {
        onModoChange(modo)
      }
    } catch (error: any) {
      console.error('Erro ao carregar modo de treino:', error)
      // Em caso de erro, usar padrão IA
      const modoPadrao = 'IA'
      setModoTreino(modoPadrao)
      if (onModoChange) {
        onModoChange(modoPadrao)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (novoModo: ModoTreino) => {
    if (novoModo === modoTreino || alterando) return

    try {
      setAlterando(true)
      await atualizarModoTreino(novoModo)
      setModoTreino(novoModo)
      
      if (onModoChange) {
        onModoChange(novoModo)
      }

      showToast(
        novoModo === 'IA' 
          ? 'Modo alterado para treinos gerados pela IA' 
          : 'Modo alterado para treinos manuais',
        'success'
      )
    } catch (error: any) {
      console.error('Erro ao atualizar modo de treino:', error)
      showToast('Erro ao alterar modo de treino', 'error')
    } finally {
      setAlterando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-dark-secondary rounded-lg">
        <div className="h-5 w-20 bg-dark-tertiary rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="bg-dark-secondary rounded-lg p-3 border border-dark-tertiary">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-light-muted">Modo de Treino</span>
        <span className="text-xs text-light-muted">
          {modoTreino === 'IA' ? 'Gerado pela IA' : 'Manual'}
        </span>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => handleToggle('IA')}
          disabled={alterando}
          className={`
            flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all
            ${modoTreino === 'IA'
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'bg-dark-tertiary text-light-muted hover:bg-dark-tertiary/80'
            }
            ${alterando ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          IA
        </button>
        
        <button
          onClick={() => handleToggle('MANUAL')}
          disabled={alterando}
          className={`
            flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all
            ${modoTreino === 'MANUAL'
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'bg-dark-tertiary text-light-muted hover:bg-dark-tertiary/80'
            }
            ${alterando ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          Manual
        </button>
      </div>
    </div>
  )
}

