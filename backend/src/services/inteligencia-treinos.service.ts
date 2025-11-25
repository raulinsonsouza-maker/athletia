import { prisma } from '../lib/prisma'
import {
  selecionarExercicioPrincipal,
  selecionarExercicioAcessorio,
  calcularParametrosTreino,
  evitarRedundancia
} from './workout-intelligence.service'
import { getVolumeGuideline } from './treino-knowledge.service'
import { buscarOuCriarExercicioAerobico, buscarOuCriarExercicioAlongamento } from './treino.service'

type NivelDificuldade = 'Iniciante' | 'Intermediário' | 'Avançado'

export const MAPEAMENTO_GRUPOS_ESPECIFICOS: Record<string, string[]> = {
  'Glúteos': ['Glúteos', 'Quadríceps', 'Posteriores'],
  'Posteriores': ['Posteriores', 'Glúteos'],
  'Abdômen': ['Abdômen'],
  'Adutores': ['Adutores', 'Quadríceps'],
  'Trapézio': ['Trapézio', 'Costas', 'Ombros'],
  'Panturrilhas': ['Panturrilhas'],
  'Antebraços': ['Antebraços', 'Bíceps', 'Tríceps'],
  'Oblíquos': ['Oblíquos', 'Abdômen'],
  'Lombar': ['Lombar', 'Costas', 'Posteriores'],
  'Abdutores': ['Abdutores', 'Glúteos'],
  'Peito': ['Peito', 'Tríceps', 'Ombros'],
  'Costas': ['Costas', 'Bíceps', 'Trapézio'],
  'Ombros': ['Ombros', 'Tríceps'],
  'Bíceps': ['Bíceps'],
  'Tríceps': ['Tríceps'],
  'Quadríceps': ['Quadríceps']
}

export const MAPEAMENTO_LOCAL: Record<string, string[]> = {
  'Academia comercial': ['Barra', 'Halteres', 'Máquinas', 'Polias', 'Smith', 'Leg Press', 'Esteira', 'Bicicleta Ergométrica', 'Elíptico'],
  'Academia Pequena': ['Halteres', 'Barra', 'Máquinas básicas', 'Esteira'],
  'Sem equipamento': ['Peso Corporal'],
  'Customizado': []
}

const DEFAULT_GRUPOS = ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Quadríceps', 'Posteriores', 'Glúteos', 'Panturrilhas', 'Abdômen']

const SPLITS_PADRAO: Record<number, string[][]> = {
  1: [DEFAULT_GRUPOS],
  2: [
    ['Peito', 'Ombros', 'Tríceps', 'Abdômen'],
    ['Costas', 'Bíceps', 'Quadríceps', 'Posteriores', 'Panturrilhas']
  ],
  3: [
    ['Peito', 'Ombros', 'Tríceps'],
    ['Costas', 'Bíceps', 'Posteriores'],
    ['Quadríceps', 'Glúteos', 'Panturrilhas', 'Abdômen']
  ],
  4: [
    ['Peito', 'Tríceps'],
    ['Costas', 'Bíceps'],
    ['Quadríceps', 'Panturrilhas'],
    ['Posteriores', 'Glúteos', 'Ombros', 'Abdômen']
  ],
  5: [
    ['Peito', 'Tríceps'],
    ['Costas', 'Bíceps'],
    ['Quadríceps', 'Glúteos'],
    ['Posteriores', 'Panturrilhas'],
    ['Ombros', 'Abdômen']
  ],
  6: [
    ['Peito'],
    ['Costas'],
    ['Quadríceps'],
    ['Posteriores'],
    ['Ombros'],
    ['Bíceps', 'Tríceps', 'Abdômen']
  ]
}

const DEFAULT_DURACAO = 45

function gerarHashTexto(texto: string, seed: number = 0) {
  let hash = seed
  for (let i = 0; i < texto.length; i++) {
    hash = (hash << 5) - hash + texto.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

interface TreinoExercicioInput {
  exercicioId: string
  ordem: number
  series: number
  repeticoes: string
  carga?: number | null
  rpe?: number | null
  descanso?: number | null
  observacoes?: string | null
}

export interface GerarTreinoOptions {
  userId: string
  data?: Date
  nome?: string
  origem?: string
  gruposSelecionados?: string[]
  focoMuscular?: string[]
  corpoTodo?: boolean
  splitGrupos?: string[]
  dificuldade?: NivelDificuldade
  localTreinoPreferido?: string
  duracao?: number
  incluirCardio?: boolean
  incluirAlongamento?: boolean
}

function normalizarData(data: Date): Date {
  const dt = new Date(data)
  dt.setHours(0, 0, 0, 0)
  return dt
}

async function carregarPerfil(userId: string) {
  const perfil = await prisma.perfil.findUnique({
    where: { userId }
  })

  if (!perfil) {
    throw new Error('Perfil não encontrado. Complete o onboarding para gerar treinos.')
  }

  if (!perfil.objetivo || !perfil.experiencia || !perfil.frequenciaSemanal) {
    throw new Error('Perfil incompleto. Objetivo, experiência e frequência semanal são obrigatórios.')
  }

  return perfil
}

function calcularSplitSemana(frequencia?: number): string[][] {
  const freq = Math.min(Math.max(frequencia || 3, 1), 6)
  return SPLITS_PADRAO[freq] || SPLITS_PADRAO[3]
}

function mapearGruposSelecionados(entrada: string[]): string[] {
  const grupos = new Set<string>()
  entrada.forEach((grupo) => {
    const principais = MAPEAMENTO_GRUPOS_ESPECIFICOS[grupo] || [grupo]
    principais.forEach((item) => grupos.add(item))
  })
  return Array.from(grupos)
}

function filtrarGruposPorLesoes(grupos: string[], lesoes: string[] | null | undefined): string[] {
  if (!lesoes || lesoes.length === 0) return grupos

  const gruposEvitar = new Set<string>()
  lesoes.forEach((lesao) => {
    const afetados = MAPEAMENTO_GRUPOS_ESPECIFICOS[lesao]
    if (afetados) {
      afetados.forEach((grupo) => gruposEvitar.add(grupo))
    }
  })

  return grupos.filter((grupo) => !gruposEvitar.has(grupo))
}

function determinarGruposParaTreino(options: GerarTreinoOptions, perfil: Awaited<ReturnType<typeof carregarPerfil>>): string[] {
  if (options.splitGrupos && options.splitGrupos.length > 0) {
    return options.splitGrupos
  }

  if (options.corpoTodo) {
    return DEFAULT_GRUPOS
  }

  if (options.focoMuscular && options.focoMuscular.length > 0) {
    return options.focoMuscular
  }

  if (options.gruposSelecionados && options.gruposSelecionados.length > 0) {
    return mapearGruposSelecionados(options.gruposSelecionados)
  }

  return calcularSplitSemana(perfil.frequenciaSemanal ?? undefined)[0] || DEFAULT_GRUPOS
}

function calcularNumeroExercicios(duracao?: number, frequencia?: number): { min: number; max: number } {
  const guideline = getVolumeGuideline(frequencia)
  const duracaoUtilizada = duracao || DEFAULT_DURACAO
  const fatorDuracao = Math.max(0.6, Math.min(1.4, duracaoUtilizada / DEFAULT_DURACAO))

  const min = Math.max(3, Math.round(guideline.exerciciosRange.min * fatorDuracao))
  const max = Math.max(min + 1, Math.round(guideline.exerciciosRange.max * fatorDuracao))

  return { min, max }
}

async function selecionarExerciciosParaContexto(params: {
  perfil: Awaited<ReturnType<typeof carregarPerfil>>
  grupos: string[]
  maxExercicios: number
  dificuldade: NivelDificuldade
  objetivo: string
  seed?: number
}) {
  const { perfil, grupos, maxExercicios, dificuldade, objetivo, seed } = params

  const exerciciosSelecionados: any[] = []
  const perfilContextualizado = perfil

  const gruposProcessados =
    seed !== undefined
      ? [...grupos].sort(
          (a, b) =>
            gerarHashTexto(`${a}-${seed}`) - gerarHashTexto(`${b}-${seed}`)
        )
      : grupos

  for (let i = 0; i < gruposProcessados.length; i++) {
    if (exerciciosSelecionados.length >= maxExercicios) break

    const grupo = gruposProcessados[i]
    const principal = await selecionarExercicioPrincipal(
      grupo,
      perfilContextualizado,
      objetivo,
      dificuldade,
      i,
      exerciciosSelecionados,
      seed
    )

    if (principal) {
      exerciciosSelecionados.push(principal)
    }

    if (exerciciosSelecionados.length >= maxExercicios) break

    const acessorio = principal
      ? await selecionarExercicioAcessorio(
          grupo,
          principal,
          perfilContextualizado,
          exerciciosSelecionados,
          seed
        )
      : null

    if (acessorio) {
      exerciciosSelecionados.push(acessorio)
    }
  }

  const deduplicados = evitarRedundancia(exerciciosSelecionados, 0.75)
  return deduplicados.slice(0, maxExercicios)
}

async function criarTreinoPersistido(params: {
  userId: string
  data: Date
  nome: string
  tipo: string
  exercicios: TreinoExercicioInput[]
}): Promise<any> {
  const { userId, data, nome, tipo, exercicios } = params

  const tempoEstimado = exercicios.reduce((total, exercicio) => {
    const descanso = exercicio.descanso ?? 90
    const tempoSerie = 30 + descanso
    return total + exercicio.series * tempoSerie
  }, 0)

  const treino = await prisma.treino.create({
    data: {
      userId,
      data,
      tipo,
      nome,
      criadoPor: tipo,
      tempoEstimado: Math.ceil(tempoEstimado / 60),
      concluido: false
    }
  })

  for (const exercicio of exercicios) {
    await prisma.exercicioTreino.create({
      data: {
        treinoId: treino.id,
        exercicioId: exercicio.exercicioId,
        ordem: exercicio.ordem,
        series: exercicio.series,
        repeticoes: exercicio.repeticoes,
        carga: exercicio.carga ?? null,
        rpe: exercicio.rpe ?? null,
        descanso: exercicio.descanso ?? null,
        observacoes: exercicio.observacoes ?? undefined,
        concluido: false
      }
    })
  }

  return prisma.treino.findUnique({
    where: { id: treino.id },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    }
  })
}

async function adicionarCardioEAlongamento(exercicios: TreinoExercicioInput[]) {
  const lista = [...exercicios]
  const cardio = await buscarOuCriarExercicioAerobico('Esteira')
  lista.unshift({
    exercicioId: cardio.id,
    ordem: 0,
    series: 1,
    repeticoes: '10-15 min',
    carga: null,
    rpe: 5,
    descanso: 0,
    observacoes: 'Aquecimento'
  })

  const alongamento = await buscarOuCriarExercicioAlongamento()
  lista.push({
    exercicioId: alongamento.id,
    ordem: lista.length,
    series: 1,
    repeticoes: '5-10 min',
    carga: null,
    rpe: 3,
    descanso: 0,
    observacoes: 'Desaceleração'
  })

  return lista
}

export async function gerarTreinoPersonalizado(options: GerarTreinoOptions) {
  const perfil = await carregarPerfil(options.userId)
  const gruposBase = determinarGruposParaTreino(options, perfil)
  const gruposFiltrados = filtrarGruposPorLesoes(gruposBase, perfil.lesoes)

  if (gruposFiltrados.length === 0) {
    throw new Error('Não é possível gerar treino devido às restrições de lesões informadas.')
  }

  const objetivo = perfil.objetivo || 'Hipertrofia'
  const dificuldade = options.dificuldade || (perfil.experiencia as NivelDificuldade) || 'Intermediário'
  const duracaoAlvo =
    typeof options.duracao === 'number'
      ? options.duracao
      : typeof perfil.tempoDisponivel === 'number'
        ? perfil.tempoDisponivel
        : DEFAULT_DURACAO
  const frequenciaAlvo = typeof perfil.frequenciaSemanal === 'number' ? perfil.frequenciaSemanal : undefined
  const limites = calcularNumeroExercicios(duracaoAlvo, frequenciaAlvo)
  const maxExercicios = limites.max

  const seedVaria =
    options.data instanceof Date
      ? Math.floor(options.data.getTime() / (1000 * 60 * 60 * 24))
      : Math.floor(Date.now() / (1000 * 60 * 60 * 24))

  const exerciciosSelecionados = await selecionarExerciciosParaContexto({
    perfil: {
      ...perfil,
      localTreino: options.localTreinoPreferido || perfil.localTreino
    },
    grupos: gruposFiltrados,
    maxExercicios,
    dificuldade,
    objetivo,
    seed: seedVaria
  })

  if (exerciciosSelecionados.length === 0) {
    throw new Error('Não encontramos exercícios adequados para o seu perfil. Tente ajustar as preferências.')
  }

  const { series, repeticoes, rpe, descanso } = calcularParametrosTreino(
    objetivo,
    dificuldade,
    perfil.rpePreferido
  )

  const exerciciosFormatados: TreinoExercicioInput[] = exerciciosSelecionados.map((ex, index) => ({
    exercicioId: ex.id,
    ordem: index + 1,
    series,
    repeticoes,
    carga: null,
    rpe,
    descanso
  }))

  const incluirCardio = options.incluirCardio ?? options.origem === 'IA'
  const incluirAlongamento = options.incluirAlongamento ?? options.origem === 'IA'

  const finalizados =
    incluirCardio || incluirAlongamento
      ? await adicionarCardioEAlongamento(exerciciosFormatados)
      : exerciciosFormatados

  const dataTreino = normalizarData(options.data || new Date())
  const nome = options.nome || 'Treino Inteligente'
  const tipo = options.origem || 'IA'

  return criarTreinoPersistido({
    userId: options.userId,
    data: dataTreino,
    nome,
    tipo,
    exercicios: finalizados.map((ex, ordem) => ({
      ...ex,
      ordem
    }))
  })
}

export async function garantirPlanoSemanalInteligente(userId: string, referencia: Date = new Date()) {
  const perfil = await carregarPerfil(userId)
  const split = calcularSplitSemana(perfil.frequenciaSemanal || 3)
  const inicioSemana = normalizarData(referencia)
  const diaSemana = inicioSemana.getDay()
  const diff = diaSemana === 0 ? -6 : 1 - diaSemana
  inicioSemana.setDate(inicioSemana.getDate() + diff)
  const fimSemana = new Date(inicioSemana)
  fimSemana.setDate(inicioSemana.getDate() + 6)
  fimSemana.setHours(23, 59, 59, 999)

  const treinosExistentes = await prisma.treino.count({
    where: {
      userId,
      data: {
        gte: inicioSemana,
        lte: fimSemana
      },
      criadoPor: 'IA'
    }
  })

  if (treinosExistentes >= split.length) {
    return
  }

  await prisma.treino.deleteMany({
    where: {
      userId,
      data: {
        gte: inicioSemana,
        lte: fimSemana
      },
      criadoPor: 'IA'
    }
  })

  for (let i = 0; i < split.length; i++) {
    const dataTreino = new Date(inicioSemana)
    dataTreino.setDate(inicioSemana.getDate() + i)

    await gerarTreinoPersonalizado({
      userId,
      data: dataTreino,
      nome: `Treino Inteligente ${String.fromCharCode(65 + i)}`,
      origem: 'IA',
      splitGrupos: split[i],
      incluirCardio: true,
      incluirAlongamento: true
    })
  }
}

export const GRUPOS_ESPECIFICOS_LISTA = Object.keys(MAPEAMENTO_GRUPOS_ESPECIFICOS)


