import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useToast } from '../hooks/useToast'
import {
  listarTreinosPersonalizados,
  listarTemplatesPersonalizados,
  deletarTreinoPersonalizado,
  deletarTemplatePersonalizado,
  duplicarTreinoPersonalizado,
  aplicarTemplatePersonalizado
} from '../services/treino-personalizado.service'
import { TreinoResumo } from '../types/treino.types'
import TreinoLista from '../components/treino/TreinoLista'

type Treino = TreinoResumo

interface Template {
  id: string
  nome: string
  descricao: string | null
  createdAt: string
  exercicios: Array<{
    ordem: number
    series: number
    repeticoes: string
    exercicio: {
      id: string
      nome: string
      grupoMuscularPrincipal: string
    }
  }>
}

export default function MeusTreinos() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  
  const [treinos, setTreinos] = useState<Treino[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState<'treinos' | 'templates'>('treinos')
  const [filtroConcluido, setFiltroConcluido] = useState<'todos' | 'pendente' | 'concluido'>('todos')
  const [mostrarModalAplicar, setMostrarModalAplicar] = useState(false)
  const [templateAplicar, setTemplateAplicar] = useState<string | null>(null)
  const [dataAplicar, setDataAplicar] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [treinosRes, templatesRes] = await Promise.all([
        listarTreinosPersonalizados(),
        listarTemplatesPersonalizados()
      ])
      setTreinos(treinosRes.treinos || [])
      setTemplates(templatesRes.templates || [])
    } catch (error: any) {
      showToast('Erro ao carregar dados', 'error')
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletarTreino = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este treino?')) return

    try {
      await deletarTreinoPersonalizado(id)
      showToast('Treino deletado com sucesso', 'success')
      carregarDados()
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erro ao deletar treino', 'error')
    }
  }

  const handleDeletarTemplate = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este template?')) return

    try {
      await deletarTemplatePersonalizado(id)
      showToast('Template deletado com sucesso', 'success')
      carregarDados()
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erro ao deletar template', 'error')
    }
  }

  const handleDuplicarTreino = async (id: string) => {
    const novaData = prompt('Digite a data para o novo treino (YYYY-MM-DD):')
    if (!novaData) return

    try {
      await duplicarTreinoPersonalizado(id, novaData)
      showToast('Treino duplicado com sucesso', 'success')
      carregarDados()
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erro ao duplicar treino', 'error')
    }
  }

  const handleAplicarTemplate = async () => {
    if (!templateAplicar) return

    try {
      await aplicarTemplatePersonalizado(templateAplicar, dataAplicar)
      showToast('Template aplicado com sucesso', 'success')
      setMostrarModalAplicar(false)
      setTemplateAplicar(null)
      carregarDados()
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erro ao aplicar template', 'error')
    }
  }

  const treinosFiltrados = treinos.filter(t => {
    if (filtroConcluido === 'concluido') return t.concluido
    if (filtroConcluido === 'pendente') return !t.concluido
    return true
  })

  const handleAcaoTreino = (acao: string, treino: Treino) => {
    switch (acao) {
      case 'ver':
        navigate(`/treino?data=${treino.data.split('T')[0]}`)
        break
      case 'editar':
        navigate('/treinos-recorrentes')
        break
      case 'duplicar':
        handleDuplicarTreino(treino.id)
        break
      case 'deletar':
        handleDeletarTreino(treino.id)
        break
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto"></div>
          <p className="mt-4 text-light-muted">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar showBack />
      <main className="container-custom section">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-light mb-2">Meus Treinos</h1>
          <p className="text-light-muted">Gerencie seus treinos personalizados e templates</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-dark-border">
          <button
            onClick={() => setAbaAtiva('treinos')}
            className={`px-4 py-2 font-medium transition-colors ${
              abaAtiva === 'treinos'
                ? 'text-primary border-b-2 border-primary'
                : 'text-light-muted hover:text-light'
            }`}
          >
            Treinos ({treinos.length})
          </button>
          <button
            onClick={() => setAbaAtiva('templates')}
            className={`px-4 py-2 font-medium transition-colors ${
              abaAtiva === 'templates'
                ? 'text-primary border-b-2 border-primary'
                : 'text-light-muted hover:text-light'
            }`}
          >
            Templates ({templates.length})
          </button>
        </div>

        {/* Aba Treinos */}
        {abaAtiva === 'treinos' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => navigate('/treinos-recorrentes')}
                className="btn-primary"
              >
                + Criar Novo Treino
              </button>
              <select
                value={filtroConcluido}
                onChange={(e) => setFiltroConcluido(e.target.value as any)}
                className="input-field"
              >
                <option value="todos">Todos</option>
                <option value="pendente">Pendentes</option>
                <option value="concluido">Concluídos</option>
              </select>
            </div>

            <TreinoLista
              treinos={treinosFiltrados}
              variante="resumo"
              mostrarFiltros={false}
              mostrarAcoes={true}
              onAcao={handleAcaoTreino}
              emptyMessage={
                filtroConcluido === 'todos' 
                  ? 'Nenhum treino personalizado criado ainda.'
                  : filtroConcluido === 'concluido'
                  ? 'Nenhum treino concluído.'
                  : 'Nenhum treino pendente.'
              }
            />
          </>
        )}

        {/* Aba Templates */}
        {abaAtiva === 'templates' && (
          <>
            <div className="mb-4">
              <button
                onClick={() => navigate('/treinos-recorrentes')}
                className="btn-primary"
              >
                + Criar Novo Template
              </button>
            </div>

            {templates.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-light-muted mb-4">
                  Nenhum template salvo ainda.
                </p>
                <p className="text-sm text-light-muted mb-4">
                  Crie um treino e salve como template para reutilizar depois.
                </p>
                <button
                  onClick={() => navigate('/treinos-recorrentes')}
                  className="btn-primary"
                >
                  Criar Primeiro Template
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {templates.map(template => (
                  <div key={template.id} className="card">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-light mb-2">
                          {template.nome}
                        </h3>
                        {template.descricao && (
                          <p className="text-sm text-light-muted mb-2">
                            {template.descricao}
                          </p>
                        )}
                        <p className="text-sm text-light-muted">
                          {template.exercicios.length} exercícios
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setTemplateAplicar(template.id)
                            setMostrarModalAplicar(true)
                          }}
                          className="px-3 py-1 text-sm btn-primary"
                        >
                          Aplicar
                        </button>
                        <button
                          onClick={() => handleDeletarTemplate(template.id)}
                          className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                          title="Deletar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-light-muted">
                      <p className="font-medium mb-1">Exercícios:</p>
                      <div className="flex flex-wrap gap-2">
                        {template.exercicios.slice(0, 5).map((ex, index) => (
                          <span key={index} className="px-2 py-1 rounded bg-dark-lighter border border-grey-dark">
                            {ex.exercicio.nome}
                          </span>
                        ))}
                        {template.exercicios.length > 5 && (
                          <span className="px-2 py-1 rounded bg-dark-lighter border border-grey-dark">
                            +{template.exercicios.length - 5} mais
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal Aplicar Template */}
      {mostrarModalAplicar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h2 className="text-xl font-bold text-light mb-4">Aplicar Template</h2>
            <div className="space-y-4">
              <div>
                <label className="label-field">
                  Data do Treino *
                </label>
                <input
                  type="date"
                  value={dataAplicar}
                  onChange={(e) => setDataAplicar(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setMostrarModalAplicar(false)
                    setTemplateAplicar(null)
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAplicarTemplate}
                  className="flex-1 btn-primary"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  )
}

