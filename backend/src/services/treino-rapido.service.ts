import { prisma } from '../lib/prisma'
import { gerarTreinoPersonalizado, GRUPOS_ESPECIFICOS_LISTA } from './inteligencia-treinos.service'
import { buscarVisuaisAtivos, gerarSlugGrupo } from './grupo-muscular-visual.service'

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

type VisualItem = Awaited<ReturnType<typeof buscarVisuaisAtivos>>[number]

export async function listarGruposMuscularesDisponiveis(): Promise<{
  gruposPrincipais: Array<{ nome: string; slug: string; imagemUrl: string | null; descricao?: string | null }>
  gruposEspecificos: string[]
}> {
  // Buscar apenas grupos visuais ativos (mesma fonte do painel admin)
  const visuais = await buscarVisuaisAtivos()

  // Mapear para o formato esperado pelo frontend
  const gruposPrincipais = visuais.map((visual) => ({
    nome: visual.nome,
    slug: visual.slug,
    imagemUrl: visual.imagemUrl || null,
    descricao: visual.descricao ?? null
  }))

  return {
    gruposPrincipais,
    gruposEspecificos: GRUPOS_ESPECIFICOS_LISTA
  }
}

