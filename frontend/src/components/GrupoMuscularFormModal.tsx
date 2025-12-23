import { useState, useEffect } from 'react'
import { useToast } from '../hooks/useToast'
import api from '../services/auth.service'
import { grupoMuscularAdminService } from '../services/grupo-muscular-admin.service'

interface GrupoMuscularFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: () => void
    grupoId?: string | null
    onSuccess?: () => void
}

const formInicial = {
    nome: '',
    descricao: '',
    imagemUrl: '',
    ativo: true,
    ordem: 0
}

export default function GrupoMuscularFormModal({
    isOpen,
    onClose,
    onSave,
    grupoId
}: GrupoMuscularFormModalProps) {
    const { showToast } = useToast()
    const [formData, setFormData] = useState(formInicial)
    const [loading, setLoading] = useState(false)
    const [uploadingImagem, setUploadingImagem] = useState(false)

    useEffect(() => {
        if (isOpen) {
            if (grupoId) {
                carregarGrupo(grupoId)
            } else {
                setFormData(formInicial)
            }
        }
    }, [isOpen, grupoId])

    const carregarGrupo = async (id: string) => {
        try {
            setLoading(true)
            const grupo = await grupoMuscularAdminService.buscarPorId(id)
            setFormData({
                nome: grupo.nome,
                descricao: grupo.descricao || '',
                imagemUrl: grupo.imagemUrl || '',
                ativo: grupo.ativo,
                ordem: grupo.ordem || 0
            })
        } catch (error) {
            console.error('Erro ao carregar grupo:', error)
            showToast('Erro ao carregar dados do grupo.', 'error')
            onClose()
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.nome.trim()) {
            showToast('Defina um nome para o grupo.', 'error')
            return
        }

        try {
            setLoading(true)
            if (grupoId) {
                await grupoMuscularAdminService.atualizar(grupoId, formData)
                showToast('Grupo atualizado com sucesso!', 'success')
            } else {
                await grupoMuscularAdminService.criar(formData)
                showToast('Grupo criado com sucesso!', 'success')
            }
            onSave()
            onClose()
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao salvar o grupo muscular'
            showToast(message, 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!grupoId) {
            showToast('Salve o grupo antes de enviar uma imagem.', 'error')
            e.target.value = ''
            return
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!validTypes.includes(file.type)) {
            showToast('Use JPG, PNG ou WEBP.', 'error')
            e.target.value = ''
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('Arquivo muito grande. Tamanho máximo: 5MB', 'error')
            e.target.value = ''
            return
        }

        try {
            setUploadingImagem(true)
            const form = new FormData()
            form.append('imagem', file)

            const response = await api.post(`/admin/grupos-musculares/${grupoId}/imagem`, form)
            const grupoAtualizado = response.data.grupo

            setFormData((prev) => ({
                ...prev,
                imagemUrl: grupoAtualizado.imagemUrl || prev.imagemUrl
            }))

            showToast('Imagem enviada com sucesso!', 'success')
        } catch (error: any) {
            console.error('Erro ao fazer upload da imagem do grupo:', error)
            const message =
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Erro ao enviar imagem do grupo muscular'
            showToast(message, 'error')
        } finally {
            setUploadingImagem(false)
            e.target.value = ''
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-primary/30">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-grey/30">
                    <h3 className="text-2xl font-display font-bold text-light">
                        {grupoId ? 'Editar Grupo Muscular' : 'Novo Grupo Muscular'}
                    </h3>
                    <button onClick={onClose} className="btn-secondary p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-light mb-2">
                                Nome <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.nome}
                                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                                className="input-field w-full"
                                placeholder="Ex: Peito"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light mb-2">Descrição</label>
                            <textarea
                                value={formData.descricao}
                                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                                className="input-field w-full h-24 resize-none"
                                placeholder="Breve descrição opcional"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-light mb-2">Ordem</label>
                                <input
                                    type="number"
                                    value={formData.ordem}
                                    onChange={(e) => setFormData(prev => ({ ...prev, ordem: Number(e.target.value) }))}
                                    className="input-field w-full"
                                />
                            </div>

                            <div className="flex items-center pt-8">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.ativo}
                                        onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                                        className="w-4 h-4 rounded border-white/20 bg-dark"
                                    />
                                    <span className="text-sm text-light">Grupo ativo</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light mb-2">Imagem (URL ou caminho)</label>
                            <input
                                type="text"
                                value={formData.imagemUrl}
                                onChange={(e) => setFormData(prev => ({ ...prev, imagemUrl: e.target.value }))}
                                className="input-field w-full"
                                placeholder="https:// ou /api/uploads/..."
                            />
                            <p className="text-xs text-light-muted mt-1">
                                Você pode informar uma URL completa (https://) ou um caminho relativo (/api/uploads/...). Opcionalmente, envie um arquivo abaixo.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light mb-2">Upload da imagem</label>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                disabled={uploadingImagem || !grupoId}
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-light-muted
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-dark
                  hover:file:bg-primary-dark
                  cursor-pointer"
                            />
                            {!grupoId && (
                                <p className="text-xs text-yellow-400 mt-1">
                                    Salve o grupo primeiro para habilitar o upload de imagem.
                                </p>
                            )}
                            <p className="text-xs text-light-muted mt-1">
                                Formatos aceitos: JPG, PNG, WEBP • Tamanho máximo: 5MB.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-grey/30">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Salvando...' : grupoId ? 'Salvar Alterações' : 'Criar Grupo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
