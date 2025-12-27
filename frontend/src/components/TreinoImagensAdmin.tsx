import { useState, useEffect, useCallback } from 'react'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'

interface TreinoImagem {
    id: string
    letra: string
    imagemUrl: string
}

export default function TreinoImagensAdmin() {
    const { showToast } = useToast()
    const [imagens, setImagens] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState<string | null>(null)

    const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

    const carregarImagens = useCallback(async () => {
        try {
            const response = await api.get('/admin/treino-imagens')
            const mapa: Record<string, string> = {}
            response.data.forEach((img: TreinoImagem) => {
                mapa[img.letra] = img.imagemUrl
            })
            setImagens(mapa)
        } catch (error) {
            console.error('Erro ao carregar imagens:', error)
            showToast('Erro ao carregar imagens padrão', 'error')
        } finally {
            setLoading(false)
        }
    }, [showToast])

    useEffect(() => {
        carregarImagens()
    }, [carregarImagens])

    const handleSaveUrl = async (letra: string, url: string) => {
        try {
            await api.post('/admin/treino-imagens', {
                letra,
                imagemUrl: url
            })
            setImagens(prev => ({ ...prev, [letra]: url }))
            showToast(`Imagem do Treino ${letra} salva com sucesso!`, 'success')
        } catch (error) {
            console.error('Erro ao salvar:', error)
            showToast('Erro ao salvar imagem', 'error')
        }
    }

    const handleFileUpload = async (letra: string, file: File) => {
        if (!file) return

        // Validar tipo e tamanho
        if (!file.type.startsWith('image/')) {
            showToast('Selecione apenas arquivos de imagem', 'error')
            return
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            showToast('A imagem deve ter no máximo 5MB', 'error')
            return
        }

        setUploading(letra)
        const formData = new FormData()
        formData.append('imagem', file)

        try {
            const response = await api.post(`/admin/treino-imagens/${letra}/imagem`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            const novaUrl = response.data.imagemUrl
            setImagens(prev => ({ ...prev, [letra]: novaUrl }))
            showToast(`Upload da imagem do Treino ${letra} realizado com sucesso!`, 'success')
        } catch (error) {
            console.error('Erro ao fazer upload:', error)
            showToast('Erro ao fazer upload da imagem', 'error')
        } finally {
            setUploading(null)
        }
    }

    if (loading) {
        return <div className="p-8 text-center text-light-muted">Carregando imagens...</div>
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-light">Imagens Padrão de Treino</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {letras.map((letra) => (
                    <div key={letra} className="card bg-dark-lighter border border-grey/30 p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-primary">Treino {letra}</h3>
                            {uploading === letra && <span className="text-xs text-primary animate-pulse">Enviando...</span>}
                        </div>

                        <div className="aspect-video bg-black/50 rounded-lg overflow-hidden mb-4 relative group">
                            {imagens[letra] ? (
                                <img
                                    src={imagens[letra]}
                                    alt={`Treino ${letra}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-light-muted">
                                    <span className="text-sm">Sem imagem definida</span>
                                </div>
                            )}

                            {/* Overlay de Upload */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <label className="cursor-pointer p-2 bg-primary text-dark rounded-full hover:bg-primary-dark transition-colors" title="Fazer Upload">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                handleFileUpload(letra, e.target.files[0])
                                            }
                                        }}
                                        disabled={uploading === letra}
                                    />
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-light-muted">URL da Imagem</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    defaultValue={imagens[letra] || ''}
                                    className="input-field text-sm flex-1"
                                    placeholder="https://..."
                                    onBlur={(e) => {
                                        if (e.target.value !== imagens[letra]) {
                                            handleSaveUrl(letra, e.target.value)
                                        }
                                    }}
                                />
                            </div>
                            <p className="text-xs text-light-muted/50">
                                Faça upload ou cole a URL da imagem.
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
