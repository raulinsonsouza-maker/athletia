import { useState } from 'react'
import {
  aplicarTreinoRecorrente,
  aplicarTemplatePersonalizado
} from '../../services/treino-personalizado.service'

interface ModalAplicarTreinoProps {
  tipo: 'recorrente' | 'template' | 'personalizado'
  treinoId: string
  treinoNome: string
  onClose: () => void
  onSuccess: () => void
}

export default function ModalAplicarTreino({
  tipo,
  treinoId,
  treinoNome,
  onClose,
  onSuccess
}: ModalAplicarTreinoProps) {
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [aplicando, setAplicando] = useState(false)

  const handleAplicar = async () => {
    try {
      setAplicando(true)
      
      if (tipo === 'recorrente') {
        await aplicarTreinoRecorrente(treinoId, data)
      } else if (tipo === 'template') {
        await aplicarTemplatePersonalizado(treinoId, data)
      }
      // Para personalizado, seria necessário outro endpoint

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Erro ao aplicar treino:', error)
      alert(error.response?.data?.message || 'Erro ao aplicar treino')
    } finally {
      setAplicando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-light">Aplicar Treino</h3>
          <button
            onClick={onClose}
            className="text-light-muted hover:text-light"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-light-muted mb-2">Treino:</p>
          <p className="text-light font-medium">{treinoNome}</p>
        </div>

        <div className="mb-6">
          <label className="block text-light mb-2">Data:</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="input w-full"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
            disabled={aplicando}
          >
            Cancelar
          </button>
          <button
            onClick={handleAplicar}
            className="btn-primary flex-1"
            disabled={aplicando}
          >
            {aplicando ? 'Aplicando...' : 'Aplicar'}
          </button>
        </div>
      </div>
    </div>
  )
}

