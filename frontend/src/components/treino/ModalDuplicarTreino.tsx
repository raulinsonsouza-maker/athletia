import { useState } from 'react'
import { useToast } from '../../hooks/useToast'

interface ModalDuplicarTreinoProps {
  treinoId: string
  treinoNome: string
  onClose: () => void
  onConfirm: (data: string) => void
}

export default function ModalDuplicarTreino({
  treinoId,
  treinoNome,
  onClose,
  onConfirm
}: ModalDuplicarTreinoProps) {
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const { showToast, ToastContainer } = useToast()

  const handleConfirmar = () => {
    if (!data) {
      showToast('Selecione uma data', 'error')
      return
    }

    onConfirm(data)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-light">Duplicar Treino</h3>
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
          <label className="block text-light mb-2">Data para duplicar:</label>
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
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            className="btn-primary flex-1"
          >
            Duplicar
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

