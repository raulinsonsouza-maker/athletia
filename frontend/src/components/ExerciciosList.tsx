import { useMemo } from 'react'
import ExercicioImage from './ExercicioImage'

interface Exercicio {
  id: string
  nome: string
  grupoMuscularPrincipal: string
  nivelDificuldade: string
  descricao?: string
  ativo: boolean
  gifUrl?: string | null
  imagemUrl?: string | null
}

interface ExerciciosListProps {
  exercicios: Exercicio[]
  loading: boolean
  error: string | null
  gruposMusculares: string[]
  searchTerm: string
  filtroGrupo: string
  viewMode: 'cards' | 'list' | 'table'
  onSearchChange: (value: string) => void
  onFiltroChange: (value: string) => void
  onViewModeChange: (mode: 'cards' | 'list' | 'table') => void
  onEdit: (id: string) => void
  onPreview: (exercicio: Exercicio) => void
  onCreate: () => void
  onRetry: () => void
}

export default function ExerciciosList({
  exercicios,
  loading,
  error,
  gruposMusculares,
  searchTerm,
  filtroGrupo,
  viewMode,
  onSearchChange,
  onFiltroChange,
  onViewModeChange,
  onEdit,
  onPreview,
  onCreate,
  onRetry
}: ExerciciosListProps) {
  // Estatísticas calculadas
  const stats = useMemo(() => {
    const total = exercicios.length
    const ativos = exercicios.filter(e => e.ativo).length
    const inativos = total - ativos
    const comMidia = exercicios.filter(e => e.gifUrl || e.imagemUrl).length
    return { total, ativos, inativos, comMidia }
  }, [exercicios])

  // Exercícios filtrados
  const exerciciosFiltrados = useMemo(() => {
    return exercicios.filter(exercicio => {
      const matchSearch = !searchTerm || 
        exercicio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exercicio.descricao && exercicio.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchGrupo = !filtroGrupo || exercicio.grupoMuscularPrincipal === filtroGrupo
      return matchSearch && matchGrupo
    })
  }, [exercicios, searchTerm, filtroGrupo])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="spinner h-8 w-8 mx-auto"></div>
        <p className="mt-4 text-light-muted">Carregando exercícios...</p>
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
      {/* Header com Ações e Estatísticas */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-light mb-2">Gerenciar Exercícios</h2>
          <p className="text-sm text-light-muted">
            Gerencie todos os exercícios do sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Estatísticas Rápidas */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-light-muted">{stats.total} total</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-light-muted">{stats.ativos} ativos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <span className="text-light-muted">{stats.inativos} inativos</span>
            </div>
          </div>
          
          {/* Seletor de Visualização */}
          <div className="flex items-center gap-2 bg-dark-lighter rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('cards')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'cards'
                  ? 'bg-primary text-dark'
                  : 'text-light-muted hover:text-light'
              }`}
              title="Visualização em Cards"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary text-dark'
                  : 'text-light-muted hover:text-light'
              }`}
              title="Visualização em Lista"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-primary text-dark'
                  : 'text-light-muted hover:text-light'
              }`}
              title="Visualização em Tabela"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          
          {/* Botão Adicionar */}
          <button 
            onClick={onCreate}
            className="btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Adicionar Exercício</span>
            <span className="sm:hidden">Adicionar</span>
          </button>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="bg-dark-lighter rounded-lg p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light-muted" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input-field pl-10"
              placeholder="Buscar por nome ou descrição..."
            />
          </div>
          
          {/* Filtro por Grupo */}
          <div className="md:w-64">
            <select
              value={filtroGrupo}
              onChange={(e) => onFiltroChange(e.target.value)}
              className="input-field"
            >
              <option value="">Todos os grupos musculares</option>
              {gruposMusculares.map((grupo) => (
                <option key={grupo} value={grupo}>
                  {grupo}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Estatísticas dos Filtros */}
        {exerciciosFiltrados.length !== exercicios.length && (
          <div className="text-sm text-light-muted pt-2 border-t border-grey/30">
            Mostrando {exerciciosFiltrados.length} de {exercicios.length} exercícios
          </div>
        )}
      </div>

      {/* Lista de Exercícios */}
      {exerciciosFiltrados.length > 0 ? (
        <>
          {/* Visualização em Cards */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exerciciosFiltrados.map((exercicio) => (
                <div
                  key={exercicio.id}
                  className="card-hover p-5 flex flex-col group"
                >
                  {/* Miniatura */}
                  <div className="mb-4 relative">
                    <ExercicioImage
                      exercicio={exercicio}
                      size="large"
                      onPreview={() => onPreview(exercicio)}
                    />
                    {/* Badge de Status */}
                    <div className="absolute top-2 right-2">
                      {exercicio.ativo ? (
                        <span className="badge-success text-xs">Ativo</span>
                      ) : (
                        <span className="badge-error text-xs">Inativo</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Informações */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-light mb-2 line-clamp-2">
                      {exercicio.nome}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="badge-primary text-xs">{exercicio.grupoMuscularPrincipal}</span>
                      <span className="badge-secondary text-xs">{exercicio.nivelDificuldade}</span>
                    </div>
                    {exercicio.descricao && (
                      <p className="text-sm text-light-muted line-clamp-2 mb-3">
                        {exercicio.descricao}
                      </p>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="pt-4 border-t border-grey/30 flex gap-2">
                    <button
                      onClick={() => onEdit(exercicio.id)}
                      className="btn-secondary btn-sm flex-1 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    {(exercicio.gifUrl || exercicio.imagemUrl) && (
                      <button
                        onClick={() => onPreview(exercicio)}
                        className="btn-secondary btn-sm flex items-center justify-center gap-2 px-3"
                        title="Visualizar demonstração"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Visualização em Lista */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {exerciciosFiltrados.map((exercicio) => (
                <div
                  key={exercicio.id}
                  className="card-hover p-4 flex items-center gap-4 group"
                >
                  <ExercicioImage
                    exercicio={exercicio}
                    size="medium"
                    onPreview={() => onPreview(exercicio)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-light truncate">
                        {exercicio.nome}
                      </h3>
                      {exercicio.ativo ? (
                        <span className="badge-success text-xs flex-shrink-0">Ativo</span>
                      ) : (
                        <span className="badge-error text-xs flex-shrink-0">Inativo</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="badge-primary text-xs">{exercicio.grupoMuscularPrincipal}</span>
                      <span className="badge-secondary text-xs">{exercicio.nivelDificuldade}</span>
                    </div>
                    {exercicio.descricao && (
                      <p className="text-sm text-light-muted line-clamp-1">
                        {exercicio.descricao}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {(exercicio.gifUrl || exercicio.imagemUrl) && (
                      <button
                        onClick={() => onPreview(exercicio)}
                        className="btn-secondary btn-sm p-2"
                        title="Visualizar demonstração"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(exercicio.id)}
                      className="btn-secondary btn-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Visualização em Tabela */}
          {viewMode === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-grey/30">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Demonstração</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Nome</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Grupo Muscular</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Nível</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {exerciciosFiltrados.map((exercicio) => (
                    <tr
                      key={exercicio.id}
                      className="border-b border-grey/10 hover:bg-dark-lighter transition-colors"
                    >
                      <td className="py-3 px-4">
                        <ExercicioImage
                          exercicio={exercicio}
                          size="small"
                          onPreview={() => onPreview(exercicio)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-light font-medium">{exercicio.nome}</div>
                        {exercicio.descricao && (
                          <div className="text-xs text-light-muted line-clamp-1 mt-1">
                            {exercicio.descricao}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="badge-primary text-xs">{exercicio.grupoMuscularPrincipal}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="badge-secondary text-xs">{exercicio.nivelDificuldade}</span>
                      </td>
                      <td className="py-3 px-4">
                        {exercicio.ativo ? (
                          <span className="badge-success text-xs">Ativo</span>
                        ) : (
                          <span className="badge-error text-xs">Inativo</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {(exercicio.gifUrl || exercicio.imagemUrl) && (
                            <button
                              onClick={() => onPreview(exercicio)}
                              className="btn-secondary text-xs p-1.5"
                              title="Visualizar demonstração"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => onEdit(exercicio.id)}
                            className="btn-secondary text-xs flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-light-muted">
          {searchTerm || filtroGrupo ? (
            <>
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-lg mb-2">Nenhum exercício encontrado</p>
              <p className="text-sm">Tente buscar com outro termo ou filtrar por outro grupo</p>
            </>
          ) : (
            <>
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <p className="text-lg mb-2">Nenhum exercício cadastrado</p>
              <p className="text-sm mb-4">Os exercícios aparecerão aqui quando forem cadastrados</p>
              <button onClick={onCreate} className="btn-primary">
                Adicionar Primeiro Exercício
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

