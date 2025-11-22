import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ExercicioCard from '../components/ExercicioCard'
import ExercicioForm from '../components/ExercicioForm'
import { useToast } from '../hooks/useToast'
import { listarExercicios, Exercicio } from '../services/exercicio.service'
import {
  listarTreinosRecorrentes,
  criarOuEditarTreinoRecorrente,
  aplicarTreinoRecorrente,
  listarTreinosPersonalizados,
  listarTemplatesPersonalizados,
  deletarTreinoPersonalizado,
  deletarTemplatePersonalizado,
  duplicarTreinoPersonalizado,
  aplicarTemplatePersonalizado,
  ExercicioTreino
} from '../services/treino-personalizado.service'
import { TreinoResumo } from '../types/treino.types'
import TreinoLista from '../components/treino/TreinoLista'
import ModalDuplicarTreino from '../components/treino/ModalDuplicarTreino'

const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
]

const LETRAS_TREINO = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

export default function GerenciarTreinosRecorrentes() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  
  const [treinosRecorrentes, setTreinosRecorrentes] = useState<any[]>([])
  const [treinosPersonalizados, setTreinosPersonalizados] = useState<TreinoResumo[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [treinoEditando, setTreinoEditando] = useState<string | null>(null)
  const [abaAtiva, setAbaAtiva] = useState<'recorrentes' | 'personalizados' | 'templates'>('recorrentes')
  const [filtroConcluido, setFiltroConcluido] = useState<'todos' | 'pendente' | 'concluido'>('todos')
  const [mostrarModalAplicarTemplate, setMostrarModalAplicarTemplate] = useState(false)
  const [templateAplicar, setTemplateAplicar] = useState<string | null>(null)
  const [dataAplicarTemplate, setDataAplicarTemplate] = useState(new Date().toISOString().split('T')[0])
  const [mostrarModalDuplicar, setMostrarModalDuplicar] = useState(false)
  const [treinoParaDuplicar, setTreinoParaDuplicar] = useState<{ id: string; nome: string } | null>(null)
  
  // Estados para criar/editar treino
  const [nome, setNome] = useState('')
  const [letraTreino, setLetraTreino] = useState('')
  const [diaSemana, setDiaSemana] = useState<number | undefined>(undefined)
  const [exercicios, setExercicios] = useState<ExercicioTreino[]>([])
  const [exerciciosDisponiveis, setExerciciosDisponiveis] = useState<Exercicio[]>([])
  const [gruposMusculares, setGruposMusculares] = useState<string[]>([])
  const [niveisDificuldade, setNiveisDificuldade] = useState<string[]>([])
  
  // Filtros
  const [busca, setBusca] = useState('')
  const [filtroGrupo, setFiltroGrupo] = useState('')
  const [filtroNivel, setFiltroNivel] = useState('')
  
  // Estados do modal
  const [mostrarForm, setMostrarForm] = useState(false)
  const [exercicioSelecionado, setExercicioSelecionado] = useState<Exercicio | null>(null)
  const [exercicioEditando, setExercicioEditando] = useState<ExercicioTreino | null>(null)
  const [mostrarModalAplicar, setMostrarModalAplicar] = useState(false)
  const [letraAplicar, setLetraAplicar] = useState('')
  const [dataAplicar, setDataAplicar] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    carregarTreinosRecorrentes()
    carregarExercicios()
    carregarTreinosPersonalizados()
    carregarTemplates()
  }, [])

  useEffect(() => {
    if (treinoEditando) {
      const treino = treinosRecorrentes.find(t => t && t.letraTreino === treinoEditando)
      if (treino) {
        setNome(treino.nome)
        setDiaSemana(treino.diaSemana)
        setLetraTreino(treino.letraTreino)
        setExercicios(treino.exercicios.map((ex: any) => ({
          exercicioId: ex.exercicioId,
          ordem: ex.ordem,
          series: ex.series,
          repeticoes: ex.repeticoes,
          carga: ex.carga,
          descanso: ex.descanso,
          observacoes: ex.observacoes
        })))
      }
    } else {
      setNome('')
      setDiaSemana(undefined)
      setLetraTreino('')
      setExercicios([])
    }
  }, [treinoEditando, treinosRecorrentes])

  useEffect(() => {
    if (treinoEditando) {
      carregarExercicios()
    }
  }, [filtroGrupo, filtroNivel, busca])

  const carregarTreinosRecorrentes = async () => {
    try {
      const response = await listarTreinosRecorrentes()
      setTreinosRecorrentes(response.treinos || [])
    } catch (error: any) {
      showToast('Erro ao carregar treinos recorrentes', 'error')
      console.error('Erro ao carregar treinos recorrentes:', error)
    }
  }

  const carregarTreinosPersonalizados = async () => {
    try {
      const response = await listarTreinosPersonalizados()
      setTreinosPersonalizados(response.treinos || [])
    } catch (error: any) {
      console.error('Erro ao carregar treinos personalizados:', error)
    }
  }

  const carregarTemplates = async () => {
    try {
      const response = await listarTemplatesPersonalizados()
      setTemplates(response.templates || [])
    } catch (error: any) {
      console.error('Erro ao carregar templates:', error)
    }
  }

  const handleDeletarTreinoPersonalizado = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este treino?')) return

    try {
      await deletarTreinoPersonalizado(id)
      showToast('Treino deletado com sucesso', 'success')
      await carregarTreinosPersonalizados()
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erro ao deletar treino', 'error')
    }
  }

  const handleDeletarTemplate = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este template?')) return

    try {
      await deletarTemplatePersonalizado(id)
      showToast('Template deletado com sucesso', 'success')
      await carregarTemplates()
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erro ao deletar template', 'error')
    }
  }

  const handleDuplicarTreino = (treino: TreinoResumo) => {
    setTreinoParaDuplicar({ id: treino.id, nome: treino.nome || 'Treino' })
    setMostrarModalDuplicar(true)
  }

  const handleConfirmarDuplicar = async (data: string) => {
    if (!treinoParaDuplicar) return

    try {
      await duplicarTreinoPersonalizado(treinoParaDuplicar.id, data)
      showToast('Treino duplicado com sucesso', 'success')
      setMostrarModalDuplicar(false)
      setTreinoParaDuplicar(null)
      await carregarTreinosPersonalizados()
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erro ao duplicar treino', 'error')
    }
  }

  const handleAplicarTemplate = async () => {
    if (!templateAplicar) return

    try {
      await aplicarTemplatePersonalizado(templateAplicar, dataAplicarTemplate)
      showToast('Template aplicado com sucesso', 'success')
      setMostrarModalAplicarTemplate(false)
      setTemplateAplicar(null)
      await carregarTemplates()
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erro ao aplicar template', 'error')
    }
  }

  const handleAcaoTreino = (acao: string, treino: any) => {
    switch (acao) {
      case 'ver':
        navigate(`/treino?data=${treino.data.split('T')[0]}`)
        break
      case 'editar':
        // Navegar para edição (pode ser implementado depois)
        showToast('Funcionalidade de edição em desenvolvimento', 'info')
        break
      case 'duplicar':
        handleDuplicarTreino(treino)
        break
      case 'deletar':
        handleDeletarTreinoPersonalizado(treino.id)
        break
    }
  }

  const carregarExercicios = async () => {
    try {
      const response = await listarExercicios({
        grupoMuscular: filtroGrupo || undefined,
        nivelDificuldade: filtroNivel || undefined,
        busca: busca || undefined
      })
      setExerciciosDisponiveis(response.exercicios)
      setGruposMusculares(response.gruposMusculares)
      setNiveisDificuldade(response.niveisDificuldade)
    } catch (error: any) {
      console.error('Erro ao carregar exercícios:', error)
    }
  }

  const handleIniciarEdicao = (letra: string) => {
    setTreinoEditando(letra)
    setLetraTreino(letra)
  }

  const handleCancelarEdicao = () => {
    setTreinoEditando(null)
    setNome('')
    setDiaSemana(undefined)
    setLetraTreino('')
    setExercicios([])
  }

  const handleAdicionarExercicio = (exercicio: Exercicio) => {
    setExercicioSelecionado(exercicio)
    setExercicioEditando(null)
    setMostrarForm(true)
  }

  const handleEditarExercicio = (index: number) => {
    const ex = exercicios[index]
    const exercicio = exerciciosDisponiveis.find(e => e.id === ex.exercicioId)
    if (exercicio) {
      setExercicioSelecionado(exercicio)
      setExercicioEditando(ex)
      setMostrarForm(true)
    }
  }

  const handleSalvarExercicio = (data: ExercicioTreino) => {
    if (exercicioEditando) {
      const index = exercicios.findIndex(e => e.exercicioId === exercicioEditando.exercicioId && e.ordem === exercicioEditando.ordem)
      if (index !== -1) {
        const novosExercicios = [...exercicios]
        novosExercicios[index] = { ...data, ordem: exercicioEditando.ordem }
        setExercicios(novosExercicios)
      }
    } else {
      const novaOrdem = exercicios.length > 0 
        ? Math.max(...exercicios.map(e => e.ordem)) + 1 
        : 1
      setExercicios([...exercicios, { ...data, ordem: novaOrdem }])
    }
    setMostrarForm(false)
    setExercicioSelecionado(null)
    setExercicioEditando(null)
  }

  const handleRemoverExercicio = (index: number) => {
    const novosExercicios = exercicios.filter((_, i) => i !== index)
    const reordenados = novosExercicios.map((ex, i) => ({ ...ex, ordem: i + 1 }))
    setExercicios(reordenados)
  }

  const handleMoverExercicio = (index: number, direcao: 'up' | 'down') => {
    if (direcao === 'up' && index === 0) return
    if (direcao === 'down' && index === exercicios.length - 1) return

    const novosExercicios = [...exercicios]
    const temp = novosExercicios[index]
    novosExercicios[index] = novosExercicios[index + (direcao === 'up' ? -1 : 1)]
    novosExercicios[index + (direcao === 'up' ? -1 : 1)] = temp

    const reordenados = novosExercicios.map((ex, i) => ({ ...ex, ordem: i + 1 }))
    setExercicios(reordenados)
  }

  const handleSalvarTreino = async () => {
    if (!nome || nome.trim() === '') {
      showToast('Nome do treino é obrigatório', 'error')
      return
    }

    if (!letraTreino) {
      showToast('Selecione a letra do treino', 'error')
      return
    }

    if (diaSemana === undefined || diaSemana === null) {
      showToast('Selecione o dia da semana', 'error')
      return
    }

    if (exercicios.length === 0) {
      showToast('Adicione pelo menos um exercício ao treino', 'error')
      return
    }

    try {
      setSaving(true)
      await criarOuEditarTreinoRecorrente({
        letraTreino,
        nome,
        diaSemana,
        exercicios
      })
      showToast('Treino recorrente salvo com sucesso!', 'success')
      await carregarTreinosRecorrentes()
      handleCancelarEdicao()
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erro ao salvar treino', 'error')
      console.error('Erro ao salvar treino:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAplicarTreino = async () => {
    if (!letraAplicar) {
      showToast('Selecione um treino para aplicar', 'error')
      return
    }

    try {
      setSaving(true)
      await aplicarTreinoRecorrente(letraAplicar, dataAplicar)
      showToast('Treino aplicado com sucesso!', 'success')
      setMostrarModalAplicar(false)
      setLetraAplicar('')
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erro ao aplicar treino', 'error')
      console.error('Erro ao aplicar treino:', error)
    } finally {
      setSaving(false)
    }
  }

  const calcularTempoEstimado = () => {
    let tempoTotal = 0
    for (const ex of exercicios) {
      const tempoPorSerie = 30 + (ex.descanso || 90)
      const tempoExercicio = ex.series * tempoPorSerie
      tempoTotal += tempoExercicio
    }
    return Math.ceil(tempoTotal / 60) + 5
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

  // Se está editando um treino, mostrar interface de edição
  if (treinoEditando) {
    return (
      <div className="min-h-screen">
        <Navbar showBack onBack={handleCancelarEdicao} />
        <main className="container-custom section">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-light mb-2">
              {treinosRecorrentes.find(t => t && t.letraTreino === treinoEditando) 
                ? `Editar Treino ${treinoEditando}`
                : `Criar Treino ${treinoEditando}`}
            </h1>
            <p className="text-light-muted">Configure o treino recorrente</p>
          </div>

          {/* Informações do Treino */}
          <div className="card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label-field">
                  Letra do Treino
                </label>
                <input
                  type="text"
                  value={letraTreino}
                  disabled
                  className="input-field opacity-50"
                />
              </div>
              <div>
                <label className="label-field">
                  Dia da Semana *
                </label>
                <select
                  value={diaSemana !== undefined ? diaSemana : ''}
                  onChange={(e) => setDiaSemana(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="input-field"
                  required
                >
                  <option value="">Selecione</option>
                  {DIAS_SEMANA.map((dia, index) => (
                    <option key={index} value={index}>{dia}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field">
                  Nome do Treino *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Treino A - Peito e Tríceps"
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Exercícios Disponíveis */}
            <div>
              <h2 className="text-xl font-bold text-light mb-4">Exercícios Disponíveis</h2>
              
              {/* Filtros */}
              <div className="card mb-4 space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Buscar exercício..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={filtroGrupo}
                    onChange={(e) => setFiltroGrupo(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Todos os grupos</option>
                    {gruposMusculares.map(grupo => (
                      <option key={grupo} value={grupo}>{grupo}</option>
                    ))}
                  </select>
                  <select
                    value={filtroNivel}
                    onChange={(e) => setFiltroNivel(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Todos os níveis</option>
                    {niveisDificuldade.map(nivel => (
                      <option key={nivel} value={nivel}>{nivel}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lista de Exercícios */}
              {exerciciosDisponiveis.length === 0 ? (
                <div className="card text-center py-8">
                  <p className="text-light-muted">Nenhum exercício encontrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto">
                  {exerciciosDisponiveis.map(exercicio => (
                    <ExercicioCard
                      key={exercicio.id}
                      exercicio={exercicio}
                      onSelect={handleAdicionarExercicio}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Treino em Construção */}
            <div>
              <h2 className="text-xl font-bold text-light mb-4">
                Meu Treino ({exercicios.length} exercícios)
              </h2>

              {exercicios.length === 0 ? (
                <div className="card text-center py-12">
                  <p className="text-light-muted mb-4">
                    Adicione exercícios ao seu treino
                  </p>
                </div>
              ) : (
                <>
                  <div className="card mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-light-muted">Tempo estimado:</span>
                      <span className="text-sm font-semibold text-light">
                        {calcularTempoEstimado()} minutos
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {exercicios.map((ex, index) => {
                      const exercicio = exerciciosDisponiveis.find(e => e.id === ex.exercicioId)
                      if (!exercicio) return null

                      return (
                        <div key={`${ex.exercicioId}-${ex.ordem}`} className="card">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold text-primary bg-primary/20 px-2 py-1 rounded">
                                  #{ex.ordem}
                                </span>
                                <h3 className="font-semibold text-light">{exercicio.nome}</h3>
                              </div>
                              <div className="text-sm text-light-muted space-y-1">
                                <p>{ex.series} séries × {ex.repeticoes} reps</p>
                                {ex.carga && <p>Carga: {ex.carga}kg</p>}
                                {ex.descanso && <p>Descanso: {ex.descanso}s</p>}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleMoverExercicio(index, 'up')}
                                disabled={index === 0}
                                className="p-2 text-light-muted hover:text-light disabled:opacity-30"
                                title="Mover para cima"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleMoverExercicio(index, 'down')}
                                disabled={index === exercicios.length - 1}
                                className="p-2 text-light-muted hover:text-light disabled:opacity-30"
                                title="Mover para baixo"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleEditarExercicio(index)}
                                className="p-2 text-primary hover:text-primary/80"
                                title="Editar"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleRemoverExercicio(index)}
                                className="p-2 text-red-400 hover:text-red-300"
                                title="Remover"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSalvarTreino}
                      disabled={saving}
                      className="flex-1 btn-primary"
                    >
                      {saving ? 'Salvando...' : 'Salvar Treino'}
                    </button>
                    <button
                      onClick={handleCancelarEdicao}
                      disabled={saving}
                      className="btn-secondary"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>

        {/* Modal de Formulário de Exercício */}
        {mostrarForm && exercicioSelecionado && (
          <ExercicioForm
            exercicio={exercicioSelecionado}
            exercicioTreino={exercicioEditando || undefined}
            ordem={exercicioEditando?.ordem || exercicios.length + 1}
            onSave={handleSalvarExercicio}
            onCancel={() => {
              setMostrarForm(false)
              setExercicioSelecionado(null)
              setExercicioEditando(null)
            }}
          />
        )}

        <ToastContainer />
      </div>
    )
  }

  // Visualização principal - Grid de treinos A-G
  const treinosPersonalizadosFiltrados = treinosPersonalizados.filter(t => {
    if (filtroConcluido === 'concluido') return t.concluido
    if (filtroConcluido === 'pendente') return !t.concluido
    return true
  })

  return (
    <div className="min-h-screen">
      <Navbar showBack />
      <main className="container-custom section">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-light mb-2">Criar Treinos</h1>
            <p className="text-light-muted">Crie e gerencie seus treinos personalizados, templates e treinos A-G</p>
          </div>
          {abaAtiva === 'recorrentes' && (
            <button
              onClick={() => navigate('/configurar-treinos')}
              className="btn-secondary"
            >
              Configurar Treinos Padrão
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-dark-border">
          <button
            onClick={() => setAbaAtiva('recorrentes')}
            className={`px-4 py-2 font-medium transition-colors ${
              abaAtiva === 'recorrentes'
                ? 'text-primary border-b-2 border-primary'
                : 'text-light-muted hover:text-light'
            }`}
          >
            Treinos A-G ({treinosRecorrentes.filter(t => t !== null && t !== undefined).length})
          </button>
          <button
            onClick={() => setAbaAtiva('personalizados')}
            className={`px-4 py-2 font-medium transition-colors ${
              abaAtiva === 'personalizados'
                ? 'text-primary border-b-2 border-primary'
                : 'text-light-muted hover:text-light'
            }`}
          >
            Treinos Personalizados ({treinosPersonalizados.length})
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

        {/* Aba Treinos A-G */}
        {abaAtiva === 'recorrentes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {LETRAS_TREINO.map(letra => {
            const treino = treinosRecorrentes.find(t => t && t.letraTreino === letra)
            
            return (
              <div key={letra} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary text-dark flex items-center justify-center font-bold text-xl">
                    {letra}
                  </div>
                  {treino && (
                    <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                      Configurado
                    </span>
                  )}
                </div>

                {treino ? (
                  <>
                    <h3 className="text-lg font-bold text-light mb-2">
                      {treino.nome}
                    </h3>
                    <p className="text-sm text-light-muted mb-2">
                      {DIAS_SEMANA[treino.diaSemana]}
                    </p>
                    <p className="text-sm text-light-muted mb-4">
                      {treino.exercicios.length} exercícios
                      {treino.tempoEstimado && ` • ${treino.tempoEstimado} min`}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleIniciarEdicao(letra)}
                        className="flex-1 btn-primary"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setLetraAplicar(letra)
                          setMostrarModalAplicar(true)
                        }}
                        className="btn-secondary"
                        title="Aplicar em data específica"
                      >
                        Aplicar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-light-muted mb-4">
                      Treino {letra}
                    </h3>
                    <p className="text-sm text-light-muted mb-4">
                      Não configurado
                    </p>
                    <button
                      onClick={() => handleIniciarEdicao(letra)}
                      className="w-full btn-primary"
                    >
                      Criar Treino
                    </button>
                  </>
                )}
              </div>
            )
          })}
          </div>
        )}

        {/* Aba Treinos Personalizados */}
        {abaAtiva === 'personalizados' && (
          <>
            <div className="flex justify-between items-center mb-4">
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
              treinos={treinosPersonalizadosFiltrados}
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
            {templates.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-light-muted mb-4">
                  Nenhum template salvo ainda.
                </p>
                <p className="text-sm text-light-muted mb-4">
                  Crie um treino e salve como template para reutilizar depois.
                </p>
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
                            setMostrarModalAplicarTemplate(true)
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

      {/* Modal Aplicar Treino */}
      {mostrarModalAplicar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h2 className="text-xl font-bold text-light mb-4">Aplicar Treino Recorrente</h2>
            <div className="space-y-4">
              <div>
                <label className="label-field">
                  Treino
                </label>
                <select
                  value={letraAplicar}
                  onChange={(e) => setLetraAplicar(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Selecione</option>
                  {LETRAS_TREINO.map(letra => {
                    const treino = treinosRecorrentes.find(t => t && t.letraTreino === letra)
                    if (!treino) return null
                    return (
                      <option key={letra} value={letra}>
                        Treino {letra} - {treino.nome}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div>
                <label className="label-field">
                  Data *
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
                    setLetraAplicar('')
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAplicarTreino}
                  disabled={saving || !letraAplicar}
                  className="flex-1 btn-primary"
                >
                  {saving ? 'Aplicando...' : 'Aplicar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Aplicar Template */}
      {mostrarModalAplicarTemplate && (
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
                  value={dataAplicarTemplate}
                  onChange={(e) => setDataAplicarTemplate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setMostrarModalAplicarTemplate(false)
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

      {/* Modal Duplicar Treino */}
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

      <ToastContainer />
    </div>
  )
}

