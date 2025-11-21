import { prisma } from '../lib/prisma'

/**
 * Gera relatório humano (não só números) sobre o desempenho
 */
export async function gerarRelatorioSemanal(userId: string): Promise<string> {
  try {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    const inicioSemana = new Date(hoje)
    inicioSemana.setDate(hoje.getDate() - hoje.getDay())
    inicioSemana.setHours(0, 0, 0, 0)

    const treinosSemana = await prisma.treino.findMany({
      where: {
        userId,
        concluido: true,
        data: {
          gte: inicioSemana,
          lte: hoje
        }
      }
    })

    const totalTreinos = treinosSemana.length

    // Buscar melhor semana anterior para comparação
    const inicioSemanaAnterior = new Date(inicioSemana)
    inicioSemanaAnterior.setDate(inicioSemana.getDate() - 7)
    const fimSemanaAnterior = new Date(inicioSemana)

    const treinosSemanaAnterior = await prisma.treino.count({
      where: {
        userId,
        concluido: true,
        data: {
          gte: inicioSemanaAnterior,
          lt: fimSemanaAnterior
        }
      }
    })

    if (totalTreinos === 0) {
      return 'Esta semana ainda não teve treinos. Que tal começar hoje?'
    }

    if (totalTreinos > treinosSemanaAnterior) {
      return `Você treinou ${totalTreinos} vezes esta semana, sua melhor marca deste mês!`
    }

    if (totalTreinos === treinosSemanaAnterior) {
      return `Você treinou ${totalTreinos} vezes esta semana, mantendo o mesmo ritmo da semana anterior.`
    }

    return `Você treinou ${totalTreinos} vezes esta semana. Continue assim!`
  } catch (error) {
    console.error('Erro ao gerar relatório semanal:', error)
    return 'Continue treinando regularmente para alcançar seus objetivos.'
  }
}

