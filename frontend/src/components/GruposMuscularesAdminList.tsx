import { useState } from 'react'
import { GrupoMuscularVisual } from '../services/grupo-muscular-admin.service'

interface GruposMuscularesAdminListProps {
    grupos: GrupoMuscularVisual[]
    loading: boolean
    onEdit: (grupo: GrupoMuscularVisual) => void
    onCreate: () => void
    onDelete: (id: string) => void
}

export default function GruposMuscularesAdminList({
    grupos,
    loading,
    onEdit,
    onCreate,
    onDelete
}: GruposMuscularesAdminListProps) {
    const [viewMode, setViewMode] = useState<'cards' | 'list' | 'table'>('cards')
    const [searchTerm, setSearchTerm] = useState('')

    const gruposFiltrados = grupos.filter(grupo =>
        grupo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (grupo.descricao && grupo.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="spinner h-8 w-8"></div>
                <p className="ml-4 text-light-muted">Carregando grupos musculares...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header e Controles */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold text-light flex items-center gap-2">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Grupos Musculares
                    </h2>
                    <p className="text-light-muted text-sm mt-1">
                        {gruposFiltrados.length} grupos cadastrados
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 bg-dark-lighter rounded-lg p-1 border border-grey/30">
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`p-2 rounded transition-colors ${viewMode === 'cards' ? 'bg-primary text-dark' : 'text-light-muted hover:text-light'
                                }`}
                            title="Visualização em Cards"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-primary text-dark' : 'text-light-muted hover:text-light'
                                }`}
                            title="Visualização em Lista"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded transition-colors ${viewMode === 'table' ? 'bg-primary text-dark' : 'text-light-muted hover:text-light'
                                }`}
                            title="Visualização em Tabela"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>

                    <button onClick={onCreate} className="btn-primary flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Novo Grupo
                    </button>
                </div>
            </div>

            {/* Busca */}
            <div className="card p-4">
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar grupo muscular..."
                        className="input-field w-full pl-10"
                    />
                    <svg className="w-5 h-5 text-light-muted absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Lista Vazia */}
            {gruposFiltrados.length === 0 && (
                <div className="card text-center py-12">
                    <p className="text-light-muted">Nenhum grupo muscular encontrado.</p>
                </div>
            )}

            {/* Visualização: Cards */}
            {viewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gruposFiltrados.map(grupo => (
                        <div key={grupo.id} className="card-hover p-0 overflow-hidden flex flex-col">
                            <div className="h-32 relative bg-dark-lighter">
                                {grupo.imagemUrl ? (
                                    <img src={grupo.imagemUrl} alt={grupo.nome} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-light-muted">
                                        <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${grupo.ativo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {grupo.ativo ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-light mb-1">{grupo.nome}</h3>
                                {grupo.descricao && (
                                    <p className="text-sm text-light-muted line-clamp-2 mb-4 flex-1">{grupo.descricao}</p>
                                )}

                                <div className="flex gap-2 mt-auto pt-4 border-t border-grey/10">
                                    <button
                                        onClick={() => onEdit(grupo)}
                                        className="flex-1 btn-secondary text-xs py-2"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => onDelete(grupo.id)}
                                        className="flex-1 btn-secondary text-xs py-2 text-red-400 hover:text-red-300 hover:border-red-400/50"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Visualização: Lista */}
            {viewMode === 'list' && (
                <div className="space-y-2">
                    {gruposFiltrados.map(grupo => (
                        <div key={grupo.id} className="card-hover p-3 flex items-center gap-4">
                            <div className="w-12 h-12 rounded bg-dark-lighter flex-shrink-0 overflow-hidden">
                                {grupo.imagemUrl ? (
                                    <img src={grupo.imagemUrl} alt={grupo.nome} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-light-muted opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-bold text-light truncate">{grupo.nome}</h3>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${grupo.ativo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {grupo.ativo ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                                {grupo.descricao && (
                                    <p className="text-sm text-light-muted truncate">{grupo.descricao}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onEdit(grupo)}
                                    className="p-2 text-light-muted hover:text-primary transition-colors"
                                    title="Editar"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => onDelete(grupo.id)}
                                    className="p-2 text-light-muted hover:text-red-400 transition-colors"
                                    title="Excluir"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Visualização: Tabela */}
            {viewMode === 'table' && (
                <div className="card overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-grey/30 bg-dark-lighter">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted w-16">Img</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Nome</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Descrição</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-light-muted w-24">Ordem</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-light-muted w-24">Status</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-light-muted w-32">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gruposFiltrados.map(grupo => (
                                    <tr key={grupo.id} className="border-b border-grey/10 hover:bg-dark-lighter/50 transition-colors">
                                        <td className="py-2 px-4">
                                            <div className="w-10 h-10 rounded bg-dark-lighter overflow-hidden">
                                                {grupo.imagemUrl ? (
                                                    <img src={grupo.imagemUrl} alt={grupo.nome} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-light-muted opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-2 px-4 text-sm font-medium text-light">{grupo.nome}</td>
                                        <td className="py-2 px-4 text-sm text-light-muted truncate max-w-xs">{grupo.descricao}</td>
                                        <td className="py-2 px-4 text-sm text-light-muted text-center">{grupo.ordem}</td>
                                        <td className="py-2 px-4 text-center">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${grupo.ativo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {grupo.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => onEdit(grupo)}
                                                    className="p-1.5 text-light-muted hover:text-primary transition-colors"
                                                    title="Editar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => onDelete(grupo.id)}
                                                    className="p-1.5 text-light-muted hover:text-red-400 transition-colors"
                                                    title="Excluir"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
