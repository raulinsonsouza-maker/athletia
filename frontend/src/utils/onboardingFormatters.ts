import { OnboardingData } from '../types/onboarding.types'

/**
 * Funções auxiliares para formatar dados do onboarding
 * Usadas na LP de conversão para exibir informações resumidas
 */

export const formatarObjetivo = (objetivo?: string): string => {
  if (!objetivo) return 'Personalizado'
  
  const labels: Record<string, string> = {
    'Emagrecimento': 'Perder peso',
    'Hipertrofia': 'Ganhar massa muscular',
    'Força': 'Força',
    'Definição': 'Definição',
    'Condicionamento': 'Condicionamento',
    'Glúteos': 'Glúteos'
  }
  
  return labels[objetivo] || objetivo
}

export const formatarExperiencia = (experiencia?: string): string => {
  if (!experiencia) return 'Não informado'
  return experiencia
}

export const formatarFrequencia = (frequencia?: number): string => {
  if (!frequencia) return 'Não informado'
  return `${frequencia}x por semana`
}

export const formatarLocalTreino = (local?: string): string => {
  if (!local) return 'Não informado'
  
  const labels: Record<string, string> = {
    'Casa': 'Casa',
    'Academia': 'Academia',
    'Misto': 'Casa e Academia'
  }
  
  return labels[local] || local
}

/**
 * Resumo formatado do perfil para exibição na LP
 */
export const getResumoPerfil = (onboardingData: OnboardingData | null) => {
  if (!onboardingData) {
    return {
      objetivo: 'Não informado',
      nivel: 'Não informado',
      frequencia: 'Não informado',
      ambiente: 'Não informado'
    }
  }

  return {
    objetivo: formatarObjetivo(onboardingData.objetivo),
    nivel: formatarExperiencia(onboardingData.experiencia),
    frequencia: formatarFrequencia(onboardingData.frequenciaSemanal),
    ambiente: formatarLocalTreino(onboardingData.localTreino)
  }
}
