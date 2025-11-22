import { useState, useEffect } from 'react'
import {
  listarTreinosRecorrentes,
  aplicarTreinoRecorrente
} from '../../services/treino-personalizado.service'
import {
  listarTemplatesPersonalizados,
  aplicarTemplatePersonalizado
} from '../../services/treino-personalizado.service'
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
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<'recorrente' | 'template' | 'ia' | 'remover'>('recorrente')
  const [treinosRecorrentes, setTreinosRecorrentes] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [treinoSelecionado, setTreinoSelecionado] = useState<string | null>(null)
  const [gerando, setGerando] = useState(false)
  const [loading, setLoading] = useState(true)
  const { showToast, ToastContainer } = useToast()

  useEffect(() => {
    carregarOpcoes()
  }, [])

  const carregarOpcoes = async () => {
    try {
      setLoading(true)
      const [recorrentesRes, templatesRes] = await Promise.all([
        listarTreinosRecorrentes().catch(() => ({ treinos: [] })),
        listarTemplatesPersonalizados().catch(() => ({ templates: [] }))
      ])
      setTreinosRecorrentes(recorrentesRes.treinos || [])
      setTemplates(templatesRes.templates || [])
    } catch (error) {
      console.error('Erro ao carregar opções:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAplicar = async () => {
    try {
      const dataStr = data.toISOString().split('T')[0]

      if (opcaoSelecionada === 'remover') {
        // Buscar treino pela data e remover
        const hoje = new Date(data)
        hoje.setHours(0, 0, 0, 0)
        const amanha = new Date(hoje)
        amanha.setDate(hoje.getDate() + 1)
        
        const response = await api.get(`/treino?dataInicio=${hoje.toISOString()}&dataFim=${amanha.toISOString()}`)
        const treinos = response.data || []
        
        if (treinos.length === 0) {
          showToast('Nenhum treino encontrado para esta data', 'warning')
          return
        }
        
        // Verificar se o treino é personalizado antes de deletar
        const treino = treinos[0]
        if (treino.criadoPor !== 'USUARIO') {
          showToast('Apenas treinos personalizados podem ser removidos', 'error')
          return
        }
        
        // Deletar o primeiro treino encontrado (deve haver apenas um por data)
        await api.delete(`/treino/personalizado/${treino.id}`)
        showToast('Treino removido com sucesso!', 'success')
        onSuccess()
        onClose()
        return
      }

      if (opcaoSelecionada === 'ia') {
        setGerando(true)
        await gerarTreino(dataStr, false)
        showToast('Treino gerado com sucesso!', 'success')
        onSuccess()
        onClose()
        return
      }

      if (!treinoSelecionado) {
        showToast('Selecione um treino', 'warning')
        return
      }

      if (opcaoSelecionada === 'recorrente') {
        await aplicarTreinoRecorrente(treinoSelecionado, dataStr)
        showToast('Treino recorrente aplicado com sucesso!', 'success')
      } else if (opcaoSelecionada === 'template') {
        await aplicarTemplatePersonalizado(treinoSelecionado, dataStr)
        showToast('Template aplicado com sucesso!', 'success')
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Erro ao aplicar treino:', error)
      showToast(error.response?.data?.message || 'Erro ao aplicar treino', 'error')
    } finally {
      setGerando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-light">Trocar Treino</h3>
          <button
            onClick={onClose}
            className="text-light-muted hover:text-light"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-light-muted mb-6">
          Data: {data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        {/* Opções */}
        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-3 p-3 border border-grey/20 rounded-lg cursor-pointer hover:bg-dark-lighter">
            <input
              type="radio"
              name="opcao"
              value="recorrente"
              checked={opcaoSelecionada === 'recorrente'}
              onChange={() => setOpcaoSelecionada('recorrente')}
              className="w-4 h-4 text-primary"
            />
            <span className="text-light">Aplicar treino A-G</span>
          </label>

          <label className="flex items-center gap-3 p-3 border border-grey/20 rounded-lg cursor-pointer hover:bg-dark-lighter">
            <input
              type="radio"
              name="opcao"
              value="template"
              checked={opcaoSelecionada === 'template'}
              onChange={() => setOpcaoSelecionada('template')}
              className="w-4 h-4 text-primary"
            />
            <span className="text-light">Aplicar template personalizado</span>
          </label>

          <label className="flex items-center gap-3 p-3 border border-grey/20 rounded-lg cursor-pointer hover:bg-dark-lighter">
            <input
              type="radio"
              name="opcao"
              value="ia"
              checked={opcaoSelecionada === 'ia'}
              onChange={() => setOpcaoSelecionada('ia')}
              className="w-4 h-4 text-primary"
            />
            <span className="text-light">Gerar novo treino com IA</span>
          </label>

          <label className="flex items-center gap-3 p-3 border border-grey/20 rounded-lg cursor-pointer hover:bg-dark-lighter">
            <input
              type="radio"
              name="opcao"
              value="remover"
              checked={opcaoSelecionada === 'remover'}
              onChange={() => setOpcaoSelecionada('remover')}
              className="w-4 h-4 text-primary"
            />
            <span className="text-light">Remover treino</span>
          </label>
        </div>

        {/* Seleção de treino */}
        {(opcaoSelecionada === 'recorrente' || opcaoSelecionada === 'template') && (
          <div className="mb-6">
            {loading ? (
              <p className="text-light-muted text-center py-4">Carregando...</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(opcaoSelecionada === 'recorrente' ? treinosRecorrentes : templates).map((item: any) => (
                  <label
                    key={item.id || item.letraTreino}
                    className="flex items-center gap-3 p-3 border border-grey/20 rounded-lg cursor-pointer hover:bg-dark-lighter"
                  >
                    <input
                      type="radio"
                      name="treino"
                      value={item.id || item.letraTreino}
                      checked={treinoSelecionado === (item.id || item.letraTreino)}
                      onChange={() => setTreinoSelecionado(item.id || item.letraTreino)}
                      className="w-4 h-4 text-primary"
                    />
                    <div className="flex-1">
                      {item.letraTreino && (
                        <div className="w-8 h-8 rounded bg-primary text-dark flex items-center justify-center font-bold text-sm mb-1">
                          {item.letraTreino}
                        </div>
                      )}
                      <span className="text-light font-medium">{item.nome}</span>
                      {item.exercicios && (
                        <p className="text-xs text-light-muted">
                          {item.exercicios.length} exercícios
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

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
            disabled={gerando || (opcaoSelecionada !== 'ia' && opcaoSelecionada !== 'remover' && !treinoSelecionado)}
          >
            {gerando ? 'Processando...' : 'Confirmar'}
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

