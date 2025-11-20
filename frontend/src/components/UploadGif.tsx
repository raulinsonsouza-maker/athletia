import { useState, useRef, useEffect } from 'react'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'

interface UploadGifProps {
  exercicioId: string
  exercicioNome: string
  gifUrl: string | null
  onUploadSuccess: () => void
}

export default function UploadGif({ exercicioId, exercicioNome, gifUrl, onUploadSuccess }: UploadGifProps) {
  const { showToast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Resetar estados quando gifUrl mudar
  useEffect(() => {
    setImageError(false)
    setImageLoading(true)
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

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir a demonstração do exercício "${exercicioNome}"?`)) {
      return
    }

    setDeleting(true)

    try {
      await api.delete(`/admin/exercicios/${exercicioId}/gif`)
      showToast('Demonstração excluída com sucesso!', 'success')
      onUploadSuccess()
    } catch (error: any) {
      console.error('Erro ao deletar demonstração:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erro ao deletar demonstração'
      showToast(errorMessage, 'error')
    } finally {
      setDeleting(false)
    }
  }

  const getGifUrl = () => {
    if (!gifUrl) {
      return null
    }
    
    // Se já é uma URL completa, retornar como está
    if (gifUrl.startsWith('http://') || gifUrl.startsWith('https://')) {
      return gifUrl
    }
    
    // Construir URL completa baseada na configuração do ambiente
    // VITE_API_URL pode ser 'http://localhost:3001/api' ou 'http://localhost:3001'
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    
    // Remover /api do final se existir, pois a URL do GIF já inclui /api
    let baseUrl = apiBaseUrl.replace(/\/api$/, '').replace(/\/$/, '')
    
    // A URL do gifUrl já vem como /api/uploads/exercicios/{id}/exercicio.gif
    // Garantir que comece com /
    const relativeUrl = gifUrl.startsWith('/') ? gifUrl : `/${gifUrl}`
    
    // Construir URL completa
    const fullUrl = `${baseUrl}${relativeUrl}`
    
    // Em desenvolvimento, usar URL relativa se o proxy estiver configurado
    if (import.meta.env.DEV && relativeUrl.startsWith('/api/')) {
      return relativeUrl
    }
    
    return fullUrl
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
          <p className="text-xs text-light-muted mt-2 text-center">
            Formatos aceitos: GIF, Imagem ou Vídeo • Tamanho máximo: 5MB
          </p>
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

