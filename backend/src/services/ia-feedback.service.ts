import { prisma } from '../lib/prisma'

/**
 * Gera feedback contextual da IA baseado no desempenho do treino
 */
export async function gerarFeedbackTreino(userId: string, treinoId: string): Promise<string> {
  try {
    const treino = await prisma.treino.findUnique({
      where: { id: treinoId },
      include: {
        exercicios: {
          include: {
            exercicio: true
          }
        }
      }
    })

    if (!treino) {
      return 'Treino concluído com sucesso! Continue assim!'
    }

    const exerciciosConcluidos = treino.exercicios.filter(ex => ex.concluido).length
    const totalExercicios = treino.exercicios.length

    // Buscar histórico recente para comparação
    const treinosRecentes = await prisma.treino.findMany({
      where: {
        userId,
        concluido: true,
        data: {
          lte: new Date(treino.data)
        }
      },
      orderBy: {
        data: 'desc'
      },
      take: 5,
      include: {
        exercicios: true
      }
    })

    // Análise básica
    if (exerciciosConcluidos === totalExercicios) {
      if (treinosRecentes.length >= 3) {
        return 'Parabéns! Você completou todos os exercícios. Excelente consistência!'
      }
      return 'Parabéns! Você completou todos os exercícios do treino. Continue assim!'
    }

    const porcentagem = (exerciciosConcluidos / totalExercicios) * 100
    
    if (porcentagem >= 80) {
      return 'Bom trabalho! Você completou a maior parte do treino. Continue assim!'
    }

    return 'Treino concluído! Continue treinando regularmente para alcançar seus objetivos.'
  } catch (error) {
    console.error('Erro ao gerar feedback da IA:', error)
    return 'Treino concluído com sucesso! Continue assim!'
  }
}

/**
 * Detecta se o usuário está em risco de abandono
 */
export async function detectarRiscoAbandono(userId: string): Promise<{
  emRisco: boolean
  diasSemTreinar: number
  mensagem?: string
}> {
  try {
    const ultimoTreino = await prisma.treino.findFirst({
      where: {
        userId,
        concluido: true
      },
      orderBy: {
        data: 'desc'
      }
    })

    if (!ultimoTreino) {
      return {
        emRisco: false,
        diasSemTreinar: 0
      }
    }

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const dataUltimoTreino = new Date(ultimoTreino.data)
    dataUltimoTreino.setHours(0, 0, 0, 0)

    const diffTime = hoje.getTime() - dataUltimoTreino.getTime()
    const diasSemTreinar = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diasSemTreinar >= 3) {
      return {
        emRisco: true,
        diasSemTreinar,
        mensagem: `Você está perto de quebrar sua sequência. Topa um treino rápido de 12 minutos agora?`
      }
    }

    return {
      emRisco: false,
      diasSemTreinar
    }
  } catch (error) {
    console.error('Erro ao detectar risco de abandono:', error)
    return {
      emRisco: false,
      diasSemTreinar: 0
    }
  }
}

