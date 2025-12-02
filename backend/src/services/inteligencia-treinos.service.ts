import { prisma } from '../lib/prisma'
import {
  selecionarExercicioPrincipal,
  selecionarExercicioAcessorio,
  calcularParametrosTreino,
  evitarRedundancia,
  isExercicioComposto
} from './workout-intelligence.service'
import { getVolumeGuideline } from './treino-knowledge.service'
import { buscarOuCriarExercicioAerobico, buscarOuCriarExercicioAlongamento } from './treino.service'
import { garantirPerfilParaInteligencia } from './perfil.service'

type PerfilTreino = Awaited<ReturnType<typeof garantirPerfilParaInteligencia>>

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

function determinarGruposParaTreino(options: GerarTreinoOptions, perfil: PerfilTreino): string[] {
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
  perfil: PerfilTreino
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

// Função gerarTreinoPersonalizado removida - usar gerarTreinoDoDiaUnico do treino-engine.service.ts

// Re-exportar do treino-engine para compatibilidade
export { garantirPlanoSemanal as garantirPlanoSemanalInteligente } from './treino-engine.service'

export const GRUPOS_ESPECIFICOS_LISTA = Object.keys(MAPEAMENTO_GRUPOS_ESPECIFICOS)

// ============================================================================
// FUNCOES PARA TREINOS MANUAIS/PERSONALIZADOS
// ============================================================================

export interface ExercicioTreinoInput {
  exercicioId: string
  ordem: number
  series: number
  repeticoes: string
  carga?: number | null
  rpe?: number | null
  descanso?: number | null
  observacoes?: string | null
}

export interface CriarTreinoManualInput {
  data: Date
  nome: string
  exercicios: ExercicioTreinoInput[]
  tipo?: string
  letraTreino?: string
  criadoPor?: 'IA' | 'USUARIO' | 'TEMPLATE' | 'RECORRENTE'
  diaSemana?: number
  recorrente?: boolean
}

/**
 * Cria treino personalizado manual
 */
export async function criarTreinoPersonalizadoManual(
  userId: string,
  input: CriarTreinoManualInput
): Promise<any> {
  if (!input.nome || input.nome.trim() === '') {
    throw new Error('Nome do treino é obrigatório')
  }

  if (!input.exercicios || input.exercicios.length === 0) {
    throw new Error('Treino deve ter pelo menos um exercício')
  }

  const dataTreino = normalizarData(input.data)

  // Remover treino existente para a data
  await prisma.treino.deleteMany({
    where: {
      userId,
      data: {
        gte: dataTreino,
        lte: new Date(dataTreino.getTime() + 24 * 60 * 60 * 1000 - 1)
      }
    }
  })

  // Criar treino
  const treino = await prisma.treino.create({
    data: {
      userId,
      data: dataTreino,
      tipo: input.tipo || 'Treino Personalizado',
      nome: input.nome,
      criadoPor: input.criadoPor || 'USUARIO',
      letraTreino: input.letraTreino,
      diaSemana: input.diaSemana,
      recorrente: input.recorrente || false,
      concluido: false,
      tempoEstimado: input.exercicios.length * 10
    }
  })

  // Criar exercícios
  for (const ex of input.exercicios) {
    await prisma.exercicioTreino.create({
      data: {
        treinoId: treino.id,
        exercicioId: ex.exercicioId,
        ordem: ex.ordem,
        series: ex.series,
        repeticoes: ex.repeticoes,
        carga: ex.carga,
        rpe: ex.rpe,
        descanso: ex.descanso,
        observacoes: ex.observacoes,
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

/**
 * Aplica template personalizado em uma data
 */
export async function aplicarTemplatePersonalizado(
  userId: string,
  templateId: string,
  data: Date
): Promise<{ treino: any; mensagem: string }> {
  const template = await prisma.treinoPersonalizadoTemplate.findFirst({
    where: { id: templateId, userId },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    }
  })

  if (!template) {
    throw new Error('Template não encontrado')
  }

  const exercicios = template.exercicios.map((ex: any) => ({
    exercicioId: ex.exercicioId,
    ordem: ex.ordem,
    series: ex.series,
    repeticoes: ex.repeticoes,
    carga: ex.carga,
    rpe: ex.rpe || null,
    descanso: ex.descanso,
    observacoes: ex.observacoes
  }))

  const treino = await criarTreinoPersonalizadoManual(userId, {
    data,
    nome: template.nome,
    exercicios,
    criadoPor: 'TEMPLATE'
  })

  await prisma.treino.update({
    where: { id: treino.id },
    data: { templateId: template.id }
  })

  return { treino, mensagem: 'Template aplicado com sucesso' }
}

/**
 * Aplica treino recorrente (A-G) em uma data
 */
export async function aplicarTreinoRecorrente(
  userId: string,
  letraTreino: string,
  data: Date
): Promise<{ treino: any; mensagem: string }> {
  const letra = letraTreino.toUpperCase()
  if (!['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(letra)) {
    throw new Error('Letra do treino deve ser A, B, C, D, E, F ou G')
  }

  const treinoRecorrente = await prisma.treino.findFirst({
    where: {
      userId,
      criadoPor: 'USUARIO',
      recorrente: true,
      letraTreino: letra
    },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    }
  })

  if (!treinoRecorrente) {
    throw new Error(`Treino recorrente ${letra} não encontrado`)
  }

  const exercicios = treinoRecorrente.exercicios.map((ex: any) => ({
    exercicioId: ex.exercicioId,
    ordem: ex.ordem,
    series: ex.series,
    repeticoes: ex.repeticoes,
    carga: ex.carga,
    rpe: ex.rpe,
    descanso: ex.descanso,
    observacoes: ex.observacoes
  }))

  const treino = await criarTreinoPersonalizadoManual(userId, {
    data,
    nome: treinoRecorrente.nome,
    exercicios,
    tipo: treinoRecorrente.tipo || undefined,
    letraTreino: letra,
    criadoPor: 'RECORRENTE'
  })

  return { treino, mensagem: `Treino recorrente ${letra} aplicado com sucesso` }
}

