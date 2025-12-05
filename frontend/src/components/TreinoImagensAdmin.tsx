import { useState, useEffect } from 'react'
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

    const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

    useEffect(() => {
        carregarImagens()
    }, [])

    const carregarImagens = async () => {
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
    }

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
                                Cole a URL da imagem e clique fora para salvar.
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
