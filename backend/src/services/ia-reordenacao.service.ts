import { prisma } from '../lib/prisma'

/**
 * Sugere reordenação de treinos quando o usuário pula um dia
 * Mantém equilíbrio muscular
 */
export async function sugerirReordenacao(
  userId: string,
  diaPulado: Date
): Promise<{
  sugerir: boolean
  motivo: string
  novaOrdem?: Array<{ data: Date; letraTreino: string }>
}> {
  try {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    // Buscar treinos da semana
    const inicioSemana = new Date(hoje)
    inicioSemana.setDate(hoje.getDate() - hoje.getDay())
    inicioSemana.setHours(0, 0, 0, 0)

    const fimSemana = new Date(inicioSemana)
    fimSemana.setDate(inicioSemana.getDate() + 6)
    fimSemana.setHours(23, 59, 59, 999)

    const treinosSemana = await prisma.treino.findMany({
      where: {
        userId,
        data: {
          gte: inicioSemana,
          lte: fimSemana
        }
      },
      orderBy: {
        data: 'asc'
      }
    })

    // Verificar se há treino não concluído antes de hoje
    const treinosPendentes = treinosSemana.filter(t => {
      const dataTreino = new Date(t.data)
      dataTreino.setHours(0, 0, 0, 0)
      return !t.concluido && dataTreino < hoje
    })

    if (treinosPendentes.length > 0) {
      return {
        sugerir: true,
        motivo: 'Você não treinou ontem. Recomendação: Ajustei a ordem para equilibrar músculos.',
        novaOrdem: treinosSemana.map(t => ({
          data: new Date(t.data),
          letraTreino: t.letraTreino || 'A'
        }))
      }
    }

    return {
      sugerir: false,
      motivo: ''
    }
  } catch (error) {
    console.error('Erro ao sugerir reordenação:', error)
    return {
      sugerir: false,
      motivo: ''
    }
  }
}

