/**
 * Hook para vibrar o dispositivo (feedback tátil)
 * Usa Vibration API do navegador
 */
export function useVibration() {
  const vibrar = (pattern: number | number[] = 100) => {
    // Verificar se a API está disponível
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern)
      } catch (error) {
        // Silenciosamente falhar se não suportado
        console.debug('Vibration API não suportada ou bloqueada')
      }
    }
  }

  const vibrarSucesso = () => {
    vibrar(100) // Vibração curta de 100ms
  }

  const vibrarErro = () => {
    vibrar([100, 50, 100]) // Vibração dupla
  }

  const vibrarLongo = () => {
    vibrar(200) // Vibração mais longa
  }

  return {
    vibrar,
    vibrarSucesso,
    vibrarErro,
    vibrarLongo
  }
}

