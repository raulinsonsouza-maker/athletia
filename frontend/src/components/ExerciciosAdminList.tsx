import { useState, useMemo } from 'react'
import { useExercicioMedia } from '../hooks/useExercicioMedia'

interface Exercicio {
  id: string
  nome: string
  grupoMuscularPrincipal: string
  nivelDificuldade: string
  imagemUrl: string | null
  ativo: boolean
  descricao: string | null
  execucaoTecnica: string | null
}

interface ExerciciosAdminListProps {
  exercicios: Exercicio[]
  loading: boolean
  error: string | null
  gruposMusculares: string[]
  onEdit: (exercicioId: string) => void
  onCreate: () => void
  onRetry: () => void
}

export default function ExerciciosAdminList({
  exercicios,
  loading,
  error,
  gruposMusculares,
  onEdit,
  onCreate,
  onRetry
}: ExerciciosAdminListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroGrupo, setFiltroGrupo] = useState<string>('')
  const [filtroDificuldade, setFiltroDificuldade] = useState<string>('')
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativos' | 'inativos'>('ativos')

  const exerciciosFiltrados = useMemo(() => {
    return exercicios.filter(ex => {
      // Filtro de busca
      if (searchTerm) {
        const termo = searchTerm.toLowerCase()
        if (!ex.nome.toLowerCase().includes(termo)) {
          return false
        }
      }

      // Filtro de grupo
      if (filtroGrupo && ex.grupoMuscularPrincipal !== filtroGrupo) {
        return false
      }

      // Filtro de dificuldade
      if (filtroDificuldade && ex.nivelDificuldade !== filtroDificuldade) {
        return false
      }

      // Filtro de status
      if (filtroStatus === 'ativos' && !ex.ativo) {
        return false
      }
      if (filtroStatus === 'inativos' && ex.ativo) {
        return false
      }

      return true
    })
  }, [exercicios, searchTerm, filtroGrupo, filtroDificuldade, filtroStatus])

  const niveisDificuldade = useMemo(() => {
    const niveis = new Set(exercicios.map(ex => ex.nivelDificuldade))
    return Array.from(niveis).sort()
  }, [exercicios])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner h-8 w-8"></div>
        <p className="ml-4 text-light-muted">Carregando exercícios...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-400 mb-2">{error}</p>
        <button onClick={onRetry} className="btn-secondary text-sm mt-4">
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-light flex items-center gap-2">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Exercícios
          </h2>
          <p className="text-light-muted text-sm mt-1">
            {exerciciosFiltrados.length} de {exercicios.length} exercícios
          </p>
        </div>
        <button onClick={onCreate} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Exercício
        </button>
      </div>

      {/* Filtros */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Busca */}
          <div>
            <label className="block text-sm font-medium text-light-muted mb-2">Buscar</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome do exercício..."
                className="input-field w-full pl-10"
              />
              <svg className="w-5 h-5 text-light-muted absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filtro Grupo */}
          <div>
            <label className="block text-sm font-medium text-light-muted mb-2">Grupo Muscular</label>
            <select
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
              className="input-field w-full"
            >
              <option value="">Todos</option>
              {gruposMusculares.map(grupo => (
                <option key={grupo} value={grupo}>{grupo}</option>
              ))}
            </select>
          </div>

          {/* Filtro Dificuldade */}
          <div>
            <label className="block text-sm font-medium text-light-muted mb-2">Dificuldade</label>
            <select
              value={filtroDificuldade}
              onChange={(e) => setFiltroDificuldade(e.target.value)}
              className="input-field w-full"
            >
              <option value="">Todas</option>
              {niveisDificuldade.map(nivel => (
                <option key={nivel} value={nivel}>{nivel}</option>
              ))}
            </select>
          </div>

          {/* Filtro Status */}
          <div>
            <label className="block text-sm font-medium text-light-muted mb-2">Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as 'todos' | 'ativos' | 'inativos')}
              className="input-field w-full"
            >
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Exercícios */}
      {exerciciosFiltrados.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 mx-auto mb-4 text-light-muted opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-lg text-light-muted mb-2">Nenhum exercício encontrado</p>
          <p className="text-sm text-light-muted">
            {searchTerm || filtroGrupo || filtroDificuldade || filtroStatus !== 'todos'
              ? 'Tente ajustar os filtros'
              : 'Clique em "Novo Exercício" para começar'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exerciciosFiltrados.map(exercicio => (
            <ExercicioCard
              key={exercicio.id}
              exercicio={exercicio}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ExercicioCard({ exercicio, onEdit }: { exercicio: Exercicio; onEdit: (id: string) => void }) {
  const { url: mediaUrl, isVideo, hasMedia } = useExercicioMedia({
    imagemUrl: exercicio.imagemUrl || undefined,
    fallbackChain: []
  })

  return (
    <div className="card-hover p-4 cursor-pointer" onClick={() => onEdit(exercicio.id)}>
      {/* Imagem */}
      <div className="w-full h-48 bg-dark-lighter rounded-lg mb-4 overflow-hidden flex items-center justify-center">
        {hasMedia && mediaUrl ? (
          isVideo ? (
            <video
              src={mediaUrl}
              className="w-full h-full object-cover"
              muted
              loop
            />
          ) : (
            <img
              src={mediaUrl}
              alt={exercicio.nome}
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <svg className="w-16 h-16 text-light-muted opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>

      {/* Informações */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-light line-clamp-2">{exercicio.nome}</h3>
          {!exercicio.ativo && (
            <span className="badge-error text-xs ml-2">Inativo</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="badge-primary text-xs">{exercicio.grupoMuscularPrincipal}</span>
          <span className="badge-secondary text-xs">{exercicio.nivelDificuldade}</span>
        </div>

        {exercicio.descricao && (
          <p className="text-sm text-light-muted line-clamp-2">{exercicio.descricao}</p>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(exercicio.id)
          }}
          className="btn-secondary w-full text-sm mt-4"
        >
          Editar Exercício
        </button>
      </div>
    </div>
  )
}

