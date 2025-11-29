import { useEffect, useState, useRef, useCallback } from 'react'

/**
 * Hook isolado para cronômetro
 * Encapsula toda lógica de timer, previne múltiplos timers
 */
export function useCronometro(autostart: boolean = true) {
  const [segundos, setSegundos] = useState(0)
  const [ativo, setAtivo] = useState(autostart)
  const intervaloRef = useRef<NodeJS.Timeout | null>(null)

  // Limpar intervalo ao desmontar
  useEffect(() => {
    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current)
      }
    }
  }, [])

  // Controlar timer
  useEffect(() => {
    if (!ativo) {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current)
        intervaloRef.current = null
      }
      return
    }

    // Garantir que não há múltiplos intervalos
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current)
    }

    intervaloRef.current = setInterval(() => {
      setSegundos(prev => prev + 1)
    }, 1000)

    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current)
        intervaloRef.current = null
      }
    }
  }, [ativo])

  const pausar = useCallback(() => {
    setAtivo(false)
  }, [])

  const retomar = useCallback(() => {
    setAtivo(true)
  }, [])

  const resetar = useCallback(() => {
    setSegundos(0)
    setAtivo(autostart)
  }, [autostart])

  const formatar = useCallback((totalSegundos: number) => {
    const minutos = Math.floor(totalSegundos / 60)
    const segs = totalSegundos % 60
    return `${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`
  }, [])

  return {
    segundos,
    formatado: formatar(segundos),
    ativo,
    pausar,
    retomar,
    resetar,
    toggle: ativo ? pausar : retomar
  }
}

