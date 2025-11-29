import { useState, useCallback } from 'react'

/**
 * Hook genérico para gerenciar modais
 */
export function useModal(initial: boolean = false) {
  const [aberto, setAberto] = useState(initial)

  const abrir = useCallback(() => {
    setAberto(true)
  }, [])

  const fechar = useCallback(() => {
    setAberto(false)
  }, [])

  const toggle = useCallback(() => {
    setAberto(prev => !prev)
  }, [])

  return {
    aberto,
    abrir,
    fechar,
    toggle
  }
}

