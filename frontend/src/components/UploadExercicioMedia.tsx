import { useState, useRef } from 'react'
import api, { uploadExercicioMedia } from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import { useExercicioMedia } from '../hooks/useExercicioMedia'
import { resolveApiPath } from '../utils/api-url'

interface UploadExercicioMediaProps {
  exercicioId: string
  exercicioNome: string
  imagemUrl?: string | null
  onUploadSuccess?: () => void
}

export default function UploadExercicioMedia({
  exercicioId,
  exercicioNome,
  imagemUrl,
  onUploadSuccess
}: UploadExercicioMediaProps) {
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Hook para exibir mídia atual
  const { url: currentMediaUrl, isVideo: isCurrentVideo, hasMedia: hasCurrentMedia } = useExercicioMedia({
    imagemUrl: imagemUrl || undefined,
    fallbackChain: []
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.webm']
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExt)) {
      showToast('Formato não suportado. Use JPEG, PNG, WebP, MP4 ou WebM.', 'error')
      return
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Arquivo muito grande. Tamanho máximo: 5MB', 'error')
      return
    }

    setSelectedFile(file)

    // Criar preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast('Selecione um arquivo primeiro', 'error')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Simular progresso (já que axios não tem progresso nativo fácil)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await uploadExercicioMedia(exercicioId, selectedFile)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      showToast('Mídia enviada com sucesso!', 'success')
      
      // Limpar estado
      setSelectedFile(null)
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Chamar callback de sucesso
      if (onUploadSuccess) {
        setTimeout(() => {
          onUploadSuccess()
        }, 500)
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Erro ao fazer upload da mídia'
      showToast(errorMessage, 'error')
      console.error('Erro ao fazer upload:', error)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveCurrent = async () => {
    if (!confirm('Tem certeza que deseja remover a mídia atual?')) {
      return
    }

    try {
      // Atualizar exercício removendo imagemUrl
      await api.put(`/admin/exercicios/${exercicioId}`, { imagemUrl: null })

      showToast('Mídia removida com sucesso!', 'success')
      if (onUploadSuccess) {
        setTimeout(() => {
          onUploadSuccess()
        }, 500)
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Erro ao remover mídia'
      showToast(errorMessage, 'error')
      console.error('Erro ao remover mídia:', error)
    }
  }

  const displayUrl = previewUrl || currentMediaUrl
  const isVideo = previewUrl 
    ? selectedFile?.type.startsWith('video/') || false
    : isCurrentVideo

  return (
    <div className="space-y-6">
      {/* Mídia Atual */}
      {hasCurrentMedia && !selectedFile && (
        <div className="bg-dark-lighter rounded-lg p-4 border border-grey/30">
          <label className="block text-sm font-medium text-light mb-3">
            Mídia Atual
          </label>
          <div className="relative">
            {isCurrentVideo ? (
              <video
                src={resolveApiPath(currentMediaUrl!) || ''}
                className="w-full h-auto max-h-96 rounded-lg"
                controls
              />
            ) : (
              <img
                src={resolveApiPath(currentMediaUrl!) || ''}
                alt={`Demonstração de execução de ${exercicioNome}`}
                className="w-full h-auto max-h-96 rounded-lg object-contain"
              />
            )}
            <button
              onClick={handleRemoveCurrent}
              className="absolute top-2 right-2 btn-secondary p-2 text-xs"
              title="Remover mídia atual"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Upload de Nova Mídia */}
      <div className="bg-dark-lighter rounded-lg p-6 border border-grey/30">
        <label className="block text-sm font-medium text-light mb-3">
          {hasCurrentMedia ? 'Substituir Mídia' : 'Adicionar Mídia'}
        </label>

        {/* Input de Arquivo */}
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            onChange={handleFileSelect}
            className="hidden"
            id="media-upload"
            disabled={uploading}
          />
          <label
            htmlFor="media-upload"
            className={`block w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              uploading
                ? 'border-grey/30 bg-dark text-light-muted cursor-not-allowed'
                : 'border-grey/50 bg-dark-lighter hover:border-primary/50 hover:bg-dark-lighter/80'
            }`}
          >
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-2 text-light-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-light mb-1">
                {selectedFile ? selectedFile.name : 'Clique para selecionar ou arraste um arquivo'}
              </p>
              <p className="text-xs text-light-muted">
                Formatos aceitos: JPEG, PNG, WebP, MP4, WebM. Tamanho máximo: 5MB
              </p>
            </div>
          </label>
        </div>

        {/* Preview do Arquivo Selecionado */}
        {selectedFile && previewUrl && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-light mb-2">
              Preview
            </label>
            <div className="relative bg-dark rounded-lg overflow-hidden">
              {isVideo ? (
                <video
                  src={previewUrl}
                  className="w-full h-auto max-h-96"
                  controls
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-auto max-h-96 object-contain"
                />
              )}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-light-muted">
              <span>{selectedFile.name}</span>
              <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
        )}

        {/* Barra de Progresso */}
        {uploading && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-light-muted mb-2">
              <span>Enviando...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-dark rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-3">
          {selectedFile && (
            <>
              <button
                onClick={handleRemove}
                className="btn-secondary flex-1"
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="spinner h-4 w-4"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Enviar Mídia
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

