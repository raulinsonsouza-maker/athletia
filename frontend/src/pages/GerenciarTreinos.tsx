import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useToast } from '../hooks/useToast'
import { buscarTreinoDoDia, buscarTreinosSemanais, gerarTreino } from '../services/treino.service'
import {
  listarTreinosPersonalizados,
  listarTemplatesPersonalizados,
  listarTreinosRecorrentes,
  deletarTreinoPersonalizado,
  deletarTemplatePersonalizado,
  duplicarTreinoPersonalizado
} from '../services/treino-personalizado.service'
import { TreinoCompleto, TreinoSemanal } from '../types/treino.types'
import CardTreinoHoje from '../components/treino/CardTreinoHoje'
import CalendarioSemanalInterativo from '../components/treino/CalendarioSemanalInterativo'
import ModalTrocarTreino from '../components/treino/ModalTrocarTreino'
import ModalAplicarTreino from '../components/treino/ModalAplicarTreino'
import ModalDuplicarTreino from '../components/treino/ModalDuplicarTreino'

export default function GerenciarTreinos() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()

  // Estados principais
  const [treinoHoje, setTreinoHoje] = useState<TreinoCompleto | null>(null)
  const [treinosSemanais, setTreinosSemanais] = useState<TreinoSemanal[]>([])
  const [treinosPersonalizados, setTreinosPersonalizados] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [treinosRecorrentes, setTreinosRecorrentes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [gerandoSemana, setGerandoSemana] = useState(false)

  // Estados para modais
  const [mostrarModalTrocarTreino, setMostrarModalTrocarTreino] = useState(false)
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null)
  const [mostrarModalAplicarTreino, setMostrarModalAplicarTreino] = useState(false)
  const [treinoParaAplicar, setTreinoParaAplicar] = useState<{ tipo: 'recorrente' | 'template' | 'personalizado', id: string, nome: string } | null>(null)
  const [mostrarModalDuplicar, setMostrarModalDuplicar] = useState(false)
  const [treinoParaDuplicar, setTreinoParaDuplicar] = useState<{ id: string, nome: string } | null>(null)
  const [deletando, setDeletando] = useState<string | null>(null)

  // Aba ativa para "Meus Treinos"
  const [abaAtiva, setAbaAtiva] = useState<'personalizados' | 'templates' | 'recorrentes'>('personalizados')

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [
        treinoHojeRes,
        treinosSemanaRes,
        treinosPersRes,
        templatesRes,
        recorrentesRes
      ] = await Promise.all([
        buscarTreinoDoDia().catch(() => null),
        buscarTreinosSemanais().catch(() => ({ treinos: [] })),
        listarTreinosPersonalizados().catch(() => ({ treinos: [] })),
        listarTemplatesPersonalizados().catch(() => ({ templates: [] })),
        listarTreinosRecorrentes().catch(() => ({ treinos: [] }))
      ])

      setTreinoHoje(treinoHojeRes)
      setTreinosSemanais(treinosSemanaRes.treinos || [])
      setTreinosPersonalizados(treinosPersRes.treinos || [])
      setTemplates(templatesRes.templates || [])
      setTreinosRecorrentes(recorrentesRes.treinos || [])
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
      showToast('Erro ao carregar dados', 'error')
    } finally {
      setLoading(false)
    }
  }

  const gerarSemanaCompleta = async () => {
    try {
      setGerandoSemana(true)
      await gerarTreino(undefined, true)
      showToast('Semana gerada com sucesso!', 'success')
      await carregarDados()
    } catch (error: any) {
      console.error('Erro ao gerar semana:', error)
      showToast(error.response?.data?.message || 'Erro ao gerar semana', 'error')
    } finally {
      setGerandoSemana(false)
    }
  }

  const handleTrocarTreino = (data: Date) => {
    setDiaSelecionado(data)
    setMostrarModalTrocarTreino(true)
  }

  const handleDeletarTreino = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este treino?')) {
      return
    }

    try {
      setDeletando(id)
      await deletarTreinoPersonalizado(id)
      showToast('Treino deletado com sucesso!', 'success')
      await carregarDados()
    } catch (error: any) {
      console.error('Erro ao deletar treino:', error)
      showToast(error.response?.data?.message || 'Erro ao deletar treino', 'error')
    } finally {
      setDeletando(null)
    }
  }

  const handleDeletarTemplate = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este template?')) {
      return
    }

    try {
      setDeletando(id)
      await deletarTemplatePersonalizado(id)
      showToast('Template deletado com sucesso!', 'success')
      await carregarDados()
    } catch (error: any) {
      console.error('Erro ao deletar template:', error)
      showToast(error.response?.data?.message || 'Erro ao deletar template', 'error')
    } finally {
      setDeletando(null)
    }
  }

  const handleDuplicarTreino = (id: string, nome: string) => {
    setTreinoParaDuplicar({ id, nome })
    setMostrarModalDuplicar(true)
  }

  const handleConfirmarDuplicar = async (data: string) => {
    if (!treinoParaDuplicar) return

    try {
      await duplicarTreinoPersonalizado(treinoParaDuplicar.id, data)
      showToast('Treino duplicado com sucesso!', 'success')
      setMostrarModalDuplicar(false)
      setTreinoParaDuplicar(null)
      await carregarDados()
    } catch (error: any) {
      console.error('Erro ao duplicar treino:', error)
      showToast(error.response?.data?.message || 'Erro ao duplicar treino', 'error')
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
      <Navbar title="Gerenciar Treinos" />
      <main className="container-custom section">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-light mb-2">
            Gerenciar Treinos
          </h1>
          <p className="text-light-muted">
            Gerencie seus treinos, crie novos e organize sua semana
          </p>
        </div>

        {/* Seção 1: Treino de Hoje */}
        {treinoHoje && (
          <div className="mb-8">
            <CardTreinoHoje treino={treinoHoje} />
          </div>
        )}

        {/* Seção 2: Calendário Semanal Interativo */}
        <div className="mb-8">
          <div className="card p-6">
            <h3 className="text-xl font-bold text-light mb-4">Semana Atual</h3>
            <CalendarioSemanalInterativo
              treinos={treinosSemanais}
              treinoHojeId={treinoHoje?.id}
              onTrocarTreino={handleTrocarTreino}
              onTreinoClick={() => navigate('/treino')}
            />
          </div>
        </div>

        {/* Seção 3: Ações Rápidas */}
        <div className="mb-8">
          {/* AcoesRapidas será criado como componente separado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={gerarSemanaCompleta}
              disabled={gerandoSemana}
              className="btn-primary p-6 text-center flex flex-col items-center gap-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-bold">Gerar Semana com IA</span>
              {gerandoSemana && <span className="text-sm">Gerando...</span>}
            </button>
            <button
              onClick={() => navigate('/meus-treinos')}
              className="btn-secondary p-6 text-center flex flex-col items-center gap-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-bold">Criar Treino</span>
            </button>
            <button
              onClick={() => navigate('/treinos-recorrentes')}
              className="btn-secondary p-6 text-center flex flex-col items-center gap-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="font-bold">Treinos A-G</span>
            </button>
            <button
              onClick={() => navigate('/configurar-treinos')}
              className="btn-secondary p-6 text-center flex flex-col items-center gap-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-bold">Configurar</span>
            </button>
          </div>
        </div>

        {/* Seção 4: Meus Treinos (Tabs) */}
        <div className="card">
          <div className="flex border-b border-grey/20 mb-4">
            <button
              onClick={() => setAbaAtiva('personalizados')}
              className={`px-6 py-3 font-semibold transition-colors ${
                abaAtiva === 'personalizados'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-light-muted hover:text-light'
              }`}
            >
              Treinos Personalizados
            </button>
            <button
              onClick={() => setAbaAtiva('templates')}
              className={`px-6 py-3 font-semibold transition-colors ${
                abaAtiva === 'templates'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-light-muted hover:text-light'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setAbaAtiva('recorrentes')}
              className={`px-6 py-3 font-semibold transition-colors ${
                abaAtiva === 'recorrentes'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-light-muted hover:text-light'
              }`}
            >
              Treinos A-G
            </button>
          </div>

          <div className="mt-4">
            {abaAtiva === 'personalizados' && (
              <div>
                {treinosPersonalizados.length === 0 ? (
                  <p className="text-light-muted text-center py-8">Nenhum treino personalizado criado</p>
                ) : (
                  <div className="space-y-3">
                    {treinosPersonalizados.map((treino: any) => (
                      <div key={treino.id} className="p-4 bg-dark-lighter rounded-lg border border-grey/20">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-light">{treino.nome}</h4>
                            <p className="text-sm text-light-muted">
                              {new Date(treino.data).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setTreinoParaAplicar({
                                  tipo: 'personalizado',
                                  id: treino.id,
                                  nome: treino.nome
                                })
                                setMostrarModalAplicarTreino(true)
                              }}
                              className="btn-secondary text-sm"
                              title="Aplicar em outra data"
                            >
                              Aplicar
                            </button>
                            <button
                              onClick={() => handleDuplicarTreino(treino.id, treino.nome)}
                              className="btn-secondary text-sm"
                              title="Duplicar treino"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => navigate(`/meus-treinos?edit=${treino.id}`)}
                              className="btn-secondary text-sm"
                              title="Editar treino"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeletarTreino(treino.id)}
                              disabled={deletando === treino.id}
                              className="btn-secondary text-sm text-red-400 hover:text-red-300"
                              title="Deletar treino"
                            >
                              {deletando === treino.id ? (
                                <div className="spinner w-4 h-4"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {abaAtiva === 'templates' && (
              <div>
                {templates.length === 0 ? (
                  <p className="text-light-muted text-center py-8">Nenhum template criado</p>
                ) : (
                  <div className="space-y-3">
                    {templates.map((template: any) => (
                      <div key={template.id} className="p-4 bg-dark-lighter rounded-lg border border-grey/20">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-light">{template.nome}</h4>
                            <p className="text-sm text-light-muted">
                              {template.exercicios?.length || 0} exercícios
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setTreinoParaAplicar({
                                  tipo: 'template',
                                  id: template.id,
                                  nome: template.nome
                                })
                                setMostrarModalAplicarTreino(true)
                              }}
                              className="btn-secondary text-sm"
                              title="Aplicar template"
                            >
                              Aplicar
                            </button>
                            <button
                              onClick={() => navigate(`/meus-treinos?editTemplate=${template.id}`)}
                              className="btn-secondary text-sm"
                              title="Editar template"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeletarTemplate(template.id)}
                              disabled={deletando === template.id}
                              className="btn-secondary text-sm text-red-400 hover:text-red-300"
                              title="Deletar template"
                            >
                              {deletando === template.id ? (
                                <div className="spinner w-4 h-4"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {abaAtiva === 'recorrentes' && (
              <div>
                {treinosRecorrentes.length === 0 ? (
                  <p className="text-light-muted text-center py-8">Nenhum treino recorrente configurado</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {treinosRecorrentes.map((treino: any) => (
                      <div key={treino.letraTreino} className="p-4 bg-dark-lighter rounded-lg border border-grey/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-12 h-12 rounded-lg bg-primary text-dark flex items-center justify-center font-bold text-2xl">
                            {treino.letraTreino}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setTreinoParaAplicar({
                                  tipo: 'recorrente',
                                  id: treino.letraTreino,
                                  nome: treino.nome
                                })
                                setMostrarModalAplicarTreino(true)
                              }}
                              className="btn-secondary text-sm"
                              title="Aplicar treino recorrente"
                            >
                              Aplicar
                            </button>
                            <button
                              onClick={() => navigate(`/treinos-recorrentes?edit=${treino.letraTreino}`)}
                              className="btn-secondary text-sm"
                              title="Editar treino recorrente"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <h4 className="font-bold text-light mb-1">{treino.nome}</h4>
                        <p className="text-sm text-light-muted">
                          {treino.exercicios?.length || 0} exercícios
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modais */}
        {mostrarModalTrocarTreino && diaSelecionado && (
          <ModalTrocarTreino
            data={diaSelecionado}
            onClose={() => {
              setMostrarModalTrocarTreino(false)
              setDiaSelecionado(null)
            }}
            onSuccess={() => {
              carregarDados()
            }}
          />
        )}

        {mostrarModalAplicarTreino && treinoParaAplicar && (
          <ModalAplicarTreino
            tipo={treinoParaAplicar.tipo}
            treinoId={treinoParaAplicar.id}
            treinoNome={treinoParaAplicar.nome}
            onClose={() => {
              setMostrarModalAplicarTreino(false)
              setTreinoParaAplicar(null)
            }}
            onSuccess={() => {
              carregarDados()
            }}
          />
        )}

        {mostrarModalDuplicar && treinoParaDuplicar && (
          <ModalDuplicarTreino
            treinoId={treinoParaDuplicar.id}
            treinoNome={treinoParaDuplicar.nome}
            onClose={() => {
              setMostrarModalDuplicar(false)
              setTreinoParaDuplicar(null)
            }}
            onConfirm={handleConfirmarDuplicar}
          />
        )}
      </main>
      <ToastContainer />
    </div>
  )
}

