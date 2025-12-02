import { SyntheticEvent } from 'react'
import { useExercicioMedia } from '../hooks/useExercicioMedia'

interface ExercicioImageProps {
  exercicio: {
    id: string
    nome: string
    imagemUrl?: string | null
  }
  imageChain?: string[] // Opcional - mantido para compatibilidade, mas não usado mais
  size?: 'small' | 'medium' | 'large'
  onPreview?: () => void
  onError?: (event: SyntheticEvent<HTMLImageElement, Event>) => void
  className?: string
}

export default function ExercicioImage({
  exercicio,
  imageChain = [],
  size = 'medium',
  onPreview,
  onError,
  className = ''
}: ExercicioImageProps) {
  // Usar hook unificado: apenas imagemUrl do banco (sem fallbacks que geram 404)
  const { url: mediaUrl, isVideo, hasMedia, handleError } = useExercicioMedia({
    imagemUrl: exercicio.imagemUrl || undefined,
    fallbackChain: [], // Removido imageChain para evitar tentativas de carregar imagens inexistentes
    onError: () => {
      // Silenciosamente falhar - não mostrar erro no console para evitar spam de 404s
      if (onError) {
        onError({} as SyntheticEvent<HTMLImageElement, Event>)
      }
    }
  })

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-20 h-20',
    large: 'w-full h-32'
  }

  const containerClasses = {
    small: 'w-12 h-12',
    medium: 'w-20 h-20',
    large: 'w-full h-32'
  }

  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    handleError()
    if (!hasMedia && onError) {
      onError(e)
    }
  }

  if (!hasMedia) {
    return (
      <div className={`${containerClasses[size]} ${size === 'large' ? 'rounded-lg' : 'rounded-md'} border border-grey/30 bg-dark-lighter flex items-center justify-center flex-shrink-0 ${className}`}>
        <svg className={`${size === 'small' ? 'w-5 h-5' : size === 'medium' ? 'w-8 h-8' : 'w-8 h-8'} text-light-muted`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  return (
    <div className={`relative ${containerClasses[size]} ${size === 'large' ? 'rounded-lg' : 'rounded-md'} border border-grey/30 overflow-hidden bg-dark-lighter flex items-center justify-center ${className}`}>
      {isVideo ? (
        <video
          src={mediaUrl!}
          className={`${sizeClasses[size]} object-contain ${onPreview ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
          onClick={onPreview}
          muted
          loop
          onError={() => handleImageError({} as SyntheticEvent<HTMLImageElement, Event>)}
        />
      ) : (
        <img
          src={mediaUrl!}
          alt={`Demonstração de execução de ${exercicio.nome}`}
          className={`${sizeClasses[size]} object-contain ${onPreview ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
          onClick={onPreview}
          onError={handleImageError}
        />
      )}
      {onPreview && size !== 'small' && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPreview()
          }}
          className={`absolute ${size === 'large' ? 'top-2 right-2 p-1.5' : 'top-1 right-1 p-1'} btn-secondary text-xs rounded z-10`}
          title="Visualizar em tamanho maior"
        >
          <svg className={`${size === 'large' ? 'w-4 h-4' : 'w-3 h-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>
      )}
    </div>
  )
}

