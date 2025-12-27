import { useMemo, useState, useEffect } from 'react'
import { resolveApiPath } from '../utils/api-url'

interface ExercicioMediaOptions {
  imagemUrl?: string | null
  fallbackChain?: string[]
  onError?: () => void
}

/**
 * Hook unificado para gerenciar URLs de mídia de exercícios
 * Centraliza lógica de resolução, fallback e tratamento de erros
 */
export function useExercicioMedia(options: ExercicioMediaOptions) {
  const { imagemUrl, fallbackChain = [], onError } = options
  const [imageError, setImageError] = useState(false)
  const [fallbackIndex, setFallbackIndex] = useState(0)

  // Resetar erros quando URLs mudarem
  useEffect(() => {
    setImageError(false)
    setFallbackIndex(0)
  }, [imagemUrl])

  const resolvedImageUrl = useMemo(() => {
    if (!imagemUrl || imageError) return null
    return resolveApiPath(imagemUrl)
  }, [imagemUrl, imageError])

  const currentFallback = useMemo(() => {
    return fallbackChain[fallbackIndex] || null
  }, [fallbackChain, fallbackIndex])

  // Determinar URL atual baseado na prioridade: imagemUrl > fallbackChain
  const currentUrl = useMemo(() => {
    if (resolvedImageUrl && !imageError) return resolvedImageUrl
    if (currentFallback) return currentFallback
    return null
  }, [resolvedImageUrl, currentFallback, imageError])

  // Handler de erro unificado
  const handleError = () => {
    if (resolvedImageUrl && !imageError) {
      setImageError(true)
      return
    }
    if (fallbackIndex < fallbackChain.length - 1) {
      setFallbackIndex(prev => prev + 1)
      return
    }
    onError?.()
  }

  return {
    url: currentUrl,
    isVideo: currentUrl ? /\.(mp4|webm)$/i.test(currentUrl) : false,
    hasMedia: !!currentUrl,
    handleError
  }
}

