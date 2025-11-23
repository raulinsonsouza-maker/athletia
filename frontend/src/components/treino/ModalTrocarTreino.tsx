import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gerarTreino } from '../../services/treino.service'
import { useToast } from '../../hooks/useToast'
import api from '../../services/auth.service'

interface ModalTrocarTreinoProps {
  data: Date
  onClose: () => void
  onSuccess: () => void
}

export default function ModalTrocarTreino({
  data,
  onClose,
  onSuccess
}: ModalTrocarTreinoProps) {
  const navigate = useNavigate()
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<'ia' | 'criar' | 'remover'>('ia')
  const [gerando, setGerando] = useState(false)
  const { showToast, ToastContainer } = useToast()


  const handleAplicar = async () => {
    if (gerando) {
      return // Prevenir múltiplas requisições
    }

    try {
      const dataStr = data.toISOString().split('T')[0]

      if (opcaoSelecionada === 'criar') {
        // Navegar para página de criar treino com a data pré-selecionada
        onClose()
        navigate(`/treinos-recorrentes?data=${dataStr}`)
        return
      }

      if (opcaoSelecionada === 'remover') {
        setGerando(true)
        // Buscar treino pela data e remover
        const hoje = new Date(data)
        hoje.setHours(0, 0, 0, 0)
        const amanha = new Date(hoje)
        amanha.setDate(hoje.getDate() + 1)
        
        try {
          const response = await api.get(`/treino/personalizado?dataInicio=${hoje.toISOString()}&dataFim=${amanha.toISOString()}`)
          // A resposta vem como { treinos: [...], total: ... }
          const treinos = Array.isArray(response.data?.treinos) ? response.data.treinos : (Array.isArray(response.data) ? response.data : [])
          
          if (treinos.length === 0) {
            showToast('Nenhum treino encontrado para esta data', 'warning')
            setGerando(false)
            return
          }
          
          // Verificar se o treino é personalizado antes de deletar
          const treino = treinos[0]
          if (!treino || !treino.id) {
            showToast('Treino inválido', 'error')
            setGerando(false)
            return
          }

          if (treino.criadoPor !== 'USUARIO') {
            showToast('Apenas treinos personalizados podem ser removidos', 'error')
            setGerando(false)
            return
          }
          
          // Deletar o primeiro treino encontrado (deve haver apenas um por data)
          await api.delete(`/treino/personalizado/${treino.id}`)
          showToast('Treino removido com sucesso!', 'success')
          await onSuccess()
          onClose()
        } catch (err: any) {
          console.error('Erro ao remover treino:', err)
          
          // Tratar diferentes tipos de erro
          if ((err as any).isNetworkError || !err.response) {
            showToast('Erro de conexão. Verifique sua internet.', 'error')
          } else if (err.response?.status === 404) {
            showToast('Treino não encontrado', 'error')
          } else if (err.response?.status === 403) {
            showToast('Você não tem permissão para remover este treino', 'error')
          } else {
            const errorMessage = err.response?.data?.message || err.message || 'Erro ao remover treino'
            showToast(errorMessage, 'error')
          }
        } finally {
          setGerando(false)
        }
        return
      }

      if (opcaoSelecionada === 'ia') {
        setGerando(true)
        try {
          // Garantir que a data está no formato correto (YYYY-MM-DD)
          const dataFormatada = data.toISOString().split('T')[0]
          console.log('Gerando treino para data:', dataFormatada)
          
          const resultado = await gerarTreino(dataFormatada, false)
          console.log('Treino gerado com sucesso:', resultado)
          showToast('Treino gerado com sucesso!', 'success')
          // Aguardar um pouco antes de fechar para garantir que o treino foi salvo
          setTimeout(async () => {
            await onSuccess()
            onClose()
          }, 1000)
        } catch (err: any) {
          console.error('Erro ao gerar treino:', err)
          console.error('Detalhes do erro:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
          })
          
          // Tratar diferentes tipos de erro
          if ((err as any).isNetworkError || !err.response) {
            showToast('Erro de conexão. Verifique sua internet.', 'error')
          } else if (err.response?.status === 401) {
            showToast('Sessão expirada. Faça login novamente.', 'error')
          } else if (err.response?.status === 429) {
            showToast('Muitas requisições. Aguarde alguns segundos e tente novamente.', 'error')
          } else if (err.response?.status >= 500) {
            showToast('Erro no servidor. Tente novamente mais tarde.', 'error')
          } else {
            const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao gerar treino'
            showToast(errorMessage, 'error')
          }
        } finally {
          setGerando(false)
        }
        return
      }

    } catch (error: any) {
      console.error('Erro inesperado:', error)
      
      // Tratar diferentes tipos de erro
      if ((error as any).isNetworkError || !error.response) {
        showToast('Erro de conexão. Verifique sua internet.', 'error')
      } else if (error.response?.status === 401) {
        showToast('Sessão expirada. Faça login novamente.', 'error')
      } else if (error.response?.status >= 500) {
        showToast('Erro no servidor. Tente novamente mais tarde.', 'error')
      } else {
        showToast('Erro inesperado. Tente novamente.', 'error')
      }
      setGerando(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-light" id="modal-title">Trocar Treino</h3>
          <button
            onClick={onClose}
            className="text-light-muted hover:text-light"
            aria-label="Fechar modal"
            title="Fechar modal de trocar treino"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-light-muted mb-6" id="modal-description">
          Data: {data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        {/* Opções Simplificadas */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => setOpcaoSelecionada('ia')}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              opcaoSelecionada === 'ia'
                ? 'border-primary bg-primary/20 text-primary'
                : 'border-grey/20 hover:border-primary/50 text-light'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                opcaoSelecionada === 'ia' ? 'border-primary bg-primary' : 'border-grey/50'
              }`}>
                {opcaoSelecionada === 'ia' && (
                  <svg className="w-3 h-3 text-light" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="font-semibold">Gerar treino com IA</span>
                </div>
                <p className="text-sm text-light-muted">
                  Nossa IA criará um treino personalizado para esta data baseado no seu perfil
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setOpcaoSelecionada('criar')}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              opcaoSelecionada === 'criar'
                ? 'border-primary bg-primary/20 text-primary'
                : 'border-grey/20 hover:border-primary/50 text-light'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                opcaoSelecionada === 'criar' ? 'border-primary bg-primary' : 'border-grey/50'
              }`}>
                {opcaoSelecionada === 'criar' && (
                  <svg className="w-3 h-3 text-light" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="font-semibold">Criar treino manualmente</span>
                </div>
                <p className="text-sm text-light-muted">
                  Crie um treino personalizado escolhendo exercícios, séries e repetições
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setOpcaoSelecionada('remover')}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              opcaoSelecionada === 'remover'
                ? 'border-error bg-error/20 text-error'
                : 'border-grey/20 hover:border-error/50 text-light'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                opcaoSelecionada === 'remover' ? 'border-error bg-error' : 'border-grey/50'
              }`}>
                {opcaoSelecionada === 'remover' && (
                  <svg className="w-3 h-3 text-light" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="font-semibold">Remover treino</span>
                </div>
                <p className="text-sm text-light-muted">
                  Remove o treino programado para esta data
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
            disabled={gerando}
          >
            Cancelar
          </button>
          <button
            onClick={handleAplicar}
            className="btn-primary flex-1"
            disabled={gerando}
            aria-label={
              gerando ? 'Processando alteração do treino...' : 
              'Confirmar alteração do treino'
            }
            title={gerando ? 'Processando...' : 'Confirmar'}
          >
            {gerando ? (
              <>
                <div className="spinner w-4 h-4 mr-2"></div>
                Processando...
              </>
            ) : opcaoSelecionada === 'criar' ? (
              'Abrir Criador de Treino'
            ) : opcaoSelecionada === 'remover' ? (
              'Remover Treino'
            ) : (
              'Gerar Treino'
            )}
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

