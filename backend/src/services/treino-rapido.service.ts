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

export async function listarGruposMuscularesDisponiveis(): Promise<{
  gruposPrincipais: Array<{ nome: string; slug: string; imagemUrl: string | null; descricao?: string | null }>
  gruposEspecificos: string[]
}> {
  const [gruposPrincipais, visuais] = await Promise.all([
    prisma.exercicio.findMany({
      where: { ativo: true },
      select: { grupoMuscularPrincipal: true },
      distinct: ['grupoMuscularPrincipal']
    }),
    buscarVisuaisAtivos()
  ])

  const visuaisPorSlug = new Map(visuais.map((visual) => [visual.slug, visual]))

  const gruposPrincipaisList = gruposPrincipais
    .map((g) => g.grupoMuscularPrincipal)
    .filter((g) => g && g !== 'Cardio')
    .sort()

  const gruposPrincipaisDetalhados = gruposPrincipaisList.map((nome) => {
    const slug = gerarSlugGrupo(nome!)
    const visual = visuaisPorSlug.get(slug)
    return {
      nome: nome!,
      slug,
      imagemUrl: visual?.imagemUrl || null,
      descricao: visual?.descricao ?? null
    }
  })

  const visuaisExtras = visuais
    .filter((visual) => !gruposPrincipaisDetalhados.some((grupo) => grupo.slug === visual.slug))
    .map((visual) => ({
      nome: visual.nome,
      slug: visual.slug,
      imagemUrl: visual.imagemUrl || null,
      descricao: visual.descricao ?? null
    }))

  return {
    gruposPrincipais: [...gruposPrincipaisDetalhados, ...visuaisExtras],
    gruposEspecificos: GRUPOS_ESPECIFICOS_LISTA
  }
}

