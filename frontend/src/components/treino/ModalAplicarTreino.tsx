import { useState } from 'react'
import {
  aplicarTreinoRecorrente,
  aplicarTemplatePersonalizado,
  duplicarTreinoPersonalizado
} from '../../services/treino-personalizado.service'
import { useToast } from '../../hooks/useToast'

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
  const { showToast, ToastContainer } = useToast()

  const handleAplicar = async () => {
    if (aplicando) {
      return // Prevenir múltiplas requisições
    }

    // Validações
    if (!data) {
      showToast('Selecione uma data', 'error')
      return
    }

    if (!treinoId) {
      showToast('ID do treino inválido', 'error')
      return
    }

    // Validar formato de data
    const dataRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dataRegex.test(data)) {
      showToast('Formato de data inválido', 'error')
      return
    }

    // Validar que data não é no passado
    const dataSelecionada = new Date(data)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    if (dataSelecionada < hoje) {
      showToast('Não é possível aplicar treino em data passada', 'error')
      return
    }

    try {
      setAplicando(true)
      
      if (tipo === 'recorrente') {
        await aplicarTreinoRecorrente(treinoId, data)
        showToast('Treino recorrente aplicado com sucesso!', 'success')
      } else if (tipo === 'template') {
        await aplicarTemplatePersonalizado(treinoId, data)
        showToast('Template aplicado com sucesso!', 'success')
      } else if (tipo === 'personalizado') {
        await duplicarTreinoPersonalizado(treinoId, data)
        showToast('Treino duplicado com sucesso!', 'success')
      } else {
        showToast('Tipo de treino inválido', 'error')
        return
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Erro ao aplicar treino:', error)
      
      // Tratar diferentes tipos de erro
      if ((error as any).isNetworkError || !error.response) {
        showToast('Erro de conexão. Verifique sua internet.', 'error')
      } else if (error.response?.status === 401) {
        showToast('Sessão expirada. Faça login novamente.', 'error')
      } else if (error.response?.status === 404) {
        showToast('Treino não encontrado', 'error')
      } else if (error.response?.status >= 500) {
        showToast('Erro no servidor. Tente novamente mais tarde.', 'error')
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Erro ao aplicar treino. Tente novamente.'
        showToast(errorMessage, 'error')
      }
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
            disabled={aplicando || !data}
          >
            {aplicando ? (
              <span className="flex items-center gap-2">
                <div className="spinner w-4 h-4"></div>
                Aplicando...
              </span>
            ) : (
              'Aplicar'
            )}
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

