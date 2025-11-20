import { useState, useEffect } from 'react'

/**
 * Hook para gerenciar auto-avanço de exercícios
 */
export function useAutoAdvance() {
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(() => {
    // Carregar preferência do localStorage
    const saved = localStorage.getItem('autoAdvanceEnabled')
    return saved !== null ? saved === 'true' : true // Padrão: ativado
  })

  useEffect(() => {
    // Salvar preferência no localStorage
    localStorage.setItem('autoAdvanceEnabled', String(autoAdvanceEnabled))
  }, [autoAdvanceEnabled])

  const toggleAutoAdvance = () => {
    setAutoAdvanceEnabled(prev => !prev)
  }

  return {
    autoAdvanceEnabled,
    toggleAutoAdvance,
    setAutoAdvanceEnabled
  }
}

