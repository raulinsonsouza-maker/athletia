import { prisma } from '../lib/prisma'
import { gerarTreinoPersonalizado, GRUPOS_ESPECIFICOS_LISTA } from './inteligencia-treinos.service'

export async function gerarTreinoRapido(
  userId: string,
  data: {
    gruposMusculares: string[]
    duracao: number
    dificuldade: 'Iniciante' | 'Intermediário' | 'Avançado'
    localTreino: string
    focoMuscular?: string[]
    corpoTodo?: boolean
    data?: Date
  }
) {
  return gerarTreinoPersonalizado({
    userId,
    data: data.data || new Date(),
    nome: `Treino Rápido - ${data.gruposMusculares.slice(0, 3).join(', ') || 'Personalizado'}`,
    origem: 'Treino Rápido',
    gruposSelecionados: data.gruposMusculares,
    focoMuscular: data.focoMuscular,
    corpoTodo: data.corpoTodo,
    duracao: data.duracao,
    dificuldade: data.dificuldade,
    localTreinoPreferido: data.localTreino,
    incluirCardio: false,
    incluirAlongamento: false
  })
}

export async function listarGruposMuscularesDisponiveis(): Promise<{
  gruposPrincipais: string[]
  gruposEspecificos: string[]
}> {
  const gruposPrincipais = await prisma.exercicio.findMany({
    where: { ativo: true },
    select: { grupoMuscularPrincipal: true },
    distinct: ['grupoMuscularPrincipal']
  })

  const gruposPrincipaisList = gruposPrincipais
    .map((g) => g.grupoMuscularPrincipal)
    .filter((g) => g && g !== 'Cardio')
    .sort()

  return {
    gruposPrincipais: gruposPrincipaisList,
    gruposEspecificos: GRUPOS_ESPECIFICOS_LISTA
  }
}

