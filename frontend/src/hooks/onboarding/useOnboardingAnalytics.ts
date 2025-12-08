import { useMemo } from 'react'
import { OnboardingData, AnaliseAgua, AnaliseCondicionamento } from '../../types/onboarding.types'

/**
 * Hook para análises de onboarding (água e condicionamento físico)
 * Consolida lógica de análise com memoização para performance
 */
export function useOnboardingAnalytics(onboardingData: OnboardingData) {
  const analiseAgua = useMemo((): AnaliseAgua | null => {
    const agua = onboardingData.aguaDiaria
    if (!agua) return null

    // Padrão de consumo baseado em dados médios
    const analises: Record<string, AnaliseAgua> = {
      'Menos de 2 copos': {
        porcentagem: 15,
        status: 'muito_baixo',
        mensagem: 'Você bebe menos água do que 85% dos usuários*',
        recomendacao: 'Sua hidratação está muito abaixo do recomendado. Tente aumentar gradualmente para 7-10 copos por dia.',
        cor: 'error'
      },
      '2-6 copos': {
        porcentagem: 35,
        status: 'baixo',
        mensagem: 'Você bebe menos água do que 65% dos usuários*',
        recomendacao: 'Sua hidratação está abaixo do ideal. O recomendado é 7-10 copos por dia para melhor desempenho.',
        cor: 'warning'
      },
      '7-10 copos': {
        porcentagem: 40,
        status: 'bom',
        mensagem: 'Você bebe mais água do que 60% dos usuários*',
        recomendacao: 'Parabéns! Você está no nível ideal de hidratação. Continue assim para manter seu desempenho.',
        cor: 'success'
      },
      'Mais de 10 copos': {
        porcentagem: 8,
        status: 'excelente',
        mensagem: 'Uau! Impressionante! Você bebe mais água do que 92% dos usuários*',
        recomendacao: 'Excelente! Você está muito bem hidratado. Continue mantendo esse hábito saudável.',
        cor: 'success'
      },
      'Bebo apenas café ou chá': {
        porcentagem: 2,
        status: 'muito_baixo',
        mensagem: 'Você bebe menos água do que 98% dos usuários*',
        recomendacao: 'Café e chá não substituem água pura. Tente adicionar pelo menos 4-6 copos de água por dia.',
        cor: 'error'
      }
    }

    return analises[agua] || null
  }, [onboardingData.aguaDiaria])

  const analiseCondicionamento = useMemo((): AnaliseCondicionamento | null => {
    const experiencia = onboardingData.experiencia
    if (!experiencia) return null

    // Padrão de condicionamento baseado em dados médios
    const analises: Record<string, AnaliseCondicionamento> = {
      'Iniciante': {
        porcentagem: 45,
        status: 'regular',
        mensagem: 'Você está no mesmo nível de 45% dos usuários*',
        recomendacao: 'Perfeito! Vamos começar do básico e construir sua base de forma segura. Cada treino te levará mais longe.',
        cor: 'success'
      },
      'Intermediário': {
        porcentagem: 40,
        status: 'regular',
        mensagem: 'Você está no mesmo nível de 40% dos usuários*',
        recomendacao: 'Ótimo! Você já tem uma base. Vamos intensificar gradualmente e alcançar novos patamares.',
        cor: 'success'
      },
      'Avançado': {
        porcentagem: 15,
        status: 'excelente',
        mensagem: 'Uau! Impressionante! Você está no mesmo nível de apenas 15% dos usuários*',
        recomendacao: 'Excelente! Você está em ótima forma. Vamos criar treinos desafiadores para manter e superar seu nível atual.',
        cor: 'success'
      }
    }

    return analises[experiencia] || null
  }, [onboardingData.experiencia])

  return {
    analiseAgua,
    analiseCondicionamento
  }
}

