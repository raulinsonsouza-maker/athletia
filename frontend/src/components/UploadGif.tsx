import { useState, useRef, useEffect } from 'react'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import { resolveApiPath } from '../utils/api-url'
import { useExercicioMedia } from '../hooks/useExercicioMedia'

interface UploadGifProps {
  exercicioId: string
  exercicioNome: string
  gifUrl: string | null
  onUploadSuccess: () => void
}

const IconeSeparador = ({ className = 'w-1.5 h-1.5 text-light-muted' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" fill="currentColor" className={className}>
    <circle cx="4" cy="4" r="4" />
  </svg>
)

// Extensões aceitas para tentar carregar
const MEDIA_EXTENSIONS = ['.gif', '.jpg', '.jpeg', '.png', '.webp', '.mp4', '.webm'] as const

export default function UploadGif({ exercicioId, exercicioNome, gifUrl, onUploadSuccess }: UploadGifProps) {
  const { showToast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Construir cadeia de fallback: gifUrl do banco > URL construída com ID do exercício
  // O backend vai tentar todas as extensões automaticamente quando receber a requisição
  const fallbackUrl = resolveApiPath(`/api/uploads/exercicios/${exercicioId}/exercicio.gif`)

  // Usar hook unificado para gerenciar mídia
  // Prioridade: gifUrl do banco > URL construída com ID do exercício
  const exercicioMedia = useExercicioMedia({
    gifUrl: gifUrl || undefined,
    fallbackChain: fallbackUrl ? [fallbackUrl] : [],
    onError: () => {
      // Silenciosamente falhar - não mostrar erro no console para evitar spam de 404s
      // O componente simplesmente não mostrará a mídia se não existir
    }
  })

  // Resetar estados quando gifUrl mudar
  useEffect(() => {
    setShowPreview(false)
  }, [gifUrl, exercicioId])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo (aceita GIF e outros formatos de imagem/vídeo)
    const validTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
    const validExtensions = ['.gif', '.jpg', '.jpeg', '.png', '.webp', '.mp4', '.webm']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      showToast('Formato de arquivo não suportado. Use GIF, imagem ou vídeo.', 'error')
      return
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Arquivo muito grande. Tamanho máximo: 5MB', 'error')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('gif', file)

      if (import.meta.env.DEV) {
        console.log('[UploadGif] Enviando mídia para exercício:', exercicioId)
      }
      const response = await api.post(`/admin/exercicios/${exercicioId}/gif`, formData)
      if (import.meta.env.DEV) {
        console.log('[UploadGif] Resposta do upload:', response.data)
      }

      showToast('Demonstração enviada com sucesso!', 'success')
      
      // Aguardar um pouco para garantir que o arquivo foi salvo
      setTimeout(() => {
        onUploadSuccess()
      }, 100)
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('[UploadGif] Erro ao fazer upload:', error)
      }
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erro ao fazer upload da demonstração'
      showToast(errorMessage, 'error')
    } finally {
      setUploading(false)
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-3">
      {/* Preview do GIF/Video existente */}
      {exercicioMedia.hasMedia && exercicioMedia.url && (
        <div className="relative rounded-lg overflow-hidden border border-grey/30 bg-dark-lighter">
          {exercicioMedia.isVideo ? (
            <video
              src={exercicioMedia.url}
              className="w-full h-auto max-h-48 object-contain"
              controls
              muted
              loop
              onError={exercicioMedia.handleError}
            />
          ) : (
            <img
              src={exercicioMedia.url}
              alt={`Demonstração de execução de ${exercicioNome}`}
              className="w-full h-auto max-h-48 object-contain"
              onError={exercicioMedia.handleError}
            />
          )}
          <button
            onClick={() => setShowPreview(true)}
            className="absolute top-2 right-2 btn-secondary p-1.5 text-xs"
            title="Visualizar em tamanho maior"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
        </div>
      )}

      {/* Botão de Upload */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/gif,image/jpeg,image/png,image/webp,video/mp4,video/webm"
          onChange={handleFileSelect}
          className="hidden"
          id={`gif-upload-${exercicioId}`}
        />
        <label
          htmlFor={`gif-upload-${exercicioId}`}
          className={`btn-primary text-xs w-full cursor-pointer flex items-center justify-center gap-2 ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? (
            <>
              <div className="spinner h-3 w-3"></div>
              Enviando...
            </>
          ) : exercicioMedia.hasMedia ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Substituir Demonstração
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Demonstração
            </>
          )}
        </label>
        {!exercicioMedia.hasMedia && (
          <div className="text-xs text-light-muted mt-2 text-center flex items-center justify-center gap-2">
            <span>Formatos aceitos: GIF, Imagem ou Vídeo</span>
            <IconeSeparador className="w-1.5 h-1.5 text-light-muted/60" />
            <span>Tamanho máximo: 5MB</span>
          </div>
        )}
      </div>

      {/* Modal de Preview */}
      {showPreview && exercicioMedia.hasMedia && exercicioMedia.url && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 btn-secondary p-2 z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {exercicioMedia.isVideo ? (
              <video
                src={exercicioMedia.url}
                className="w-full h-auto rounded-lg"
                controls
                autoPlay
                loop
                onError={exercicioMedia.handleError}
              />
            ) : (
              <img
                src={exercicioMedia.url}
                alt={`Demonstração de execução de ${exercicioNome}`}
                className="w-full h-auto rounded-lg"
                onError={exercicioMedia.handleError}
              />
            )}
            <p className="text-center text-light-muted mt-4">{exercicioNome}</p>
          </div>
        </div>
      )}
    </div>
  )
}

