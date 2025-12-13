import { useState, useEffect } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'auto' | 'sync'
  onError?: () => void
  onLoad?: () => void
}

// Cache de imagens carregadas para evitar múltiplas requisições
const imageCache = new Map<string, { loaded: boolean; error: boolean; retries: number }>()

// Cache de promises de carregamento para evitar requisições simultâneas
const loadingPromises = new Map<string, Promise<void>>()

export default function OptimizedImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  decoding = 'async',
  onError,
  onLoad
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const maxRetries = 2
  const retryDelay = 1000 // 1 segundo

  useEffect(() => {
    if (!src) {
      setHasError(true)
      setIsLoading(false)
      return
    }

    // Verificar cache
    const cached = imageCache.get(src)
    if (cached?.loaded) {
      setImageSrc(src)
      setIsLoading(false)
      return
    }

    if (cached?.error && cached.retries >= maxRetries) {
      setHasError(true)
      setIsLoading(false)
      return
    }

    // Se já existe uma requisição em andamento para esta imagem, aguardar
    const existingPromise = loadingPromises.get(src)
    if (existingPromise) {
      existingPromise
        .then(() => {
          setImageSrc(src)
          setIsLoading(false)
        })
        .catch(() => {
          setHasError(true)
          setIsLoading(false)
        })
      return
    }

    // Criar nova promise de carregamento
    const loadImage = (isRetry = false): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        
        img.onload = () => {
          imageCache.set(src, { loaded: true, error: false, retries: 0 })
          setImageSrc(src)
          setIsLoading(false)
          onLoad?.()
          resolve()
        }

        img.onerror = () => {
          const currentCache = imageCache.get(src) || { loaded: false, error: false, retries: 0 }
          const newRetries = currentCache.retries + 1
          
          if (newRetries < maxRetries) {
            // Delay exponencial para evitar sobrecarga (especialmente útil para erro 429)
            const delay = retryDelay * Math.pow(2, newRetries) // 1s, 2s, 4s...
            
            imageCache.set(src, { ...currentCache, retries: newRetries })
            
            setTimeout(() => {
              loadImage(true).then(resolve).catch(reject)
            }, delay)
          } else {
            imageCache.set(src, { loaded: false, error: true, retries: newRetries })
            setHasError(true)
            setIsLoading(false)
            onError?.()
            reject(new Error('Failed to load image'))
          }
        }

        // Para retries, adicionar timestamp para evitar cache
        const cacheBuster = isRetry ? `?t=${Date.now()}` : ''
        // Remover cache buster se já existir na URL
        const cleanSrc = src.split('?')[0]
        img.src = cleanSrc + cacheBuster
      })
    }

    const promise = loadImage()
    loadingPromises.set(src, promise)

    promise.finally(() => {
      // Remover promise após 5 segundos para permitir novas tentativas se necessário
      setTimeout(() => {
        loadingPromises.delete(src)
      }, 5000)
    })
  }, [src, onError, onLoad])

  if (hasError) {
    return (
      <div className={`bg-dark-lighter flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <p className="text-light-muted text-sm">Imagem não disponível</p>
        </div>
      </div>
    )
  }

  if (isLoading || !imageSrc) {
    return (
      <div className={`bg-dark-lighter animate-pulse flex items-center justify-center ${className}`}>
        <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      onError={() => {
        setHasError(true)
        onError?.()
      }}
      onLoad={onLoad}
    />
  )
}
