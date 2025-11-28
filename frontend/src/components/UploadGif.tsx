import { useState, useRef, useEffect } from 'react'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import { resolveApiPath } from '../utils/api-url'

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

export default function UploadGif({ exercicioId, exercicioNome, gifUrl, onUploadSuccess }: UploadGifProps) {
  const { showToast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Resetar estados quando gifUrl mudar
  useEffect(() => {
    // Estados resetados quando necessário
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

      console.log('[UploadGif] Enviando GIF para exercício:', exercicioId)
      const response = await api.post(`/admin/exercicios/${exercicioId}/gif`, formData)
      console.log('[UploadGif] Resposta do upload:', response.data)

      showToast('Demonstração enviada com sucesso!', 'success')
      
      // Aguardar um pouco para garantir que o arquivo foi salvo
      setTimeout(() => {
        onUploadSuccess()
      }, 100)
    } catch (error: any) {
      console.error('[UploadGif] Erro ao fazer upload:', error)
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

  // Função de delete removida - não está sendo usada no componente

  const getGifUrl = () => {
    if (import.meta.env.DEV && gifUrl?.startsWith('/api/')) {
      return gifUrl
    }
    return resolveApiPath(gifUrl)
  }

  const gifFullUrl = getGifUrl()

  return (
    <div className="space-y-3">
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
          ) : gifFullUrl ? (
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
        {!gifFullUrl && (
          <div className="text-xs text-light-muted mt-2 text-center flex items-center justify-center gap-2">
            <span>Formatos aceitos: GIF, Imagem ou Vídeo</span>
            <IconeSeparador className="w-1.5 h-1.5 text-light-muted/60" />
            <span>Tamanho máximo: 5MB</span>
          </div>
        )}
      </div>

      {/* Modal de Preview */}
      {showPreview && gifFullUrl && (
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
            <img
              src={gifFullUrl}
              alt={`Demonstração de execução de ${exercicioNome}`}
              className="w-full h-auto rounded-lg"
              onError={(e) => {
                console.error('Erro ao carregar imagem no preview:', gifFullUrl)
                e.currentTarget.style.display = 'none'
              }}
            />
            <p className="text-center text-light-muted mt-4">{exercicioNome}</p>
          </div>
        </div>
      )}
    </div>
  )
}

