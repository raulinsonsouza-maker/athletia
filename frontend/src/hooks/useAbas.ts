import { useState, useCallback } from 'react'

export type AbaTreino = 'alvo' | 'instrucoes' | 'equipamento'

/**
 * Hook para gerenciar abas do exercício
 */
export function useAbas(initial: AbaTreino = 'alvo') {
  const [abaAtiva, setAbaAtiva] = useState<AbaTreino>(initial)

  const trocarAba = useCallback((aba: AbaTreino) => {
    setAbaAtiva(aba)
  }, [])

  return {
    abaAtiva,
    trocarAba
  }
}

