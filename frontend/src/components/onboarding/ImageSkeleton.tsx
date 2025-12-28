import { useState } from 'react'

interface ImageSkeletonProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
  style?: React.CSSProperties
}

export default function ImageSkeleton({
  src,
  alt,
  className = '',
  width,
  height,
  onError,
  style
}: ImageSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false)
    setHasError(true)
    if (onError) {
      onError(e)
    }
  }

  // Extrair classes de objeto do className passado, ou usar object-cover como padrão
  const hasObjectClass = className.includes('object-')
  const imageClassName = hasObjectClass 
    ? className 
    : `${className} object-cover`.trim()

  return (
    <div className="relative" style={{ width, height, ...style }}>
      {/* Skeleton placeholder - efeito de pulsação */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-dark-lighter via-dark-lighter/80 to-dark-lighter animate-pulse rounded-lg"
          style={{ width, height }}
        >
          <div className="absolute inset-0 bg-dark-lighter/50" />
        </div>
      )}
      
      {/* Imagem real */}
      {!hasError && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full rounded-lg transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } ${imageClassName}`}
          onLoad={handleLoad}
          onError={handleError}
          width={width}
          height={height}
          loading="lazy"
        />
      )}
      
      {/* Placeholder de erro */}
      {hasError && (
        <div 
          className="absolute inset-0 bg-dark-lighter flex items-center justify-center rounded-lg"
          style={{ width, height }}
        >
          <div className="text-light-muted text-sm text-center px-4">
            Erro ao carregar imagem
          </div>
        </div>
      )}
    </div>
  )
}

