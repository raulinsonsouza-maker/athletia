import { prisma } from '../lib/prisma'
import { GRUPOS_ESPECIFICOS_LISTA } from './inteligencia-treinos.service'
import { buscarVisuaisAtivos, gerarSlugGrupo } from './grupo-muscular-visual.service'
import { gerarTreinoDoDiaUnico } from './treino-engine.service'

/**
 * Gera treino rápido usando motor centralizado
 * NOTA: Treino rápido agora usa o motor centralizado para garantir consistência
 * Os grupos selecionados serão respeitados através do split do usuário
 */
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
  // Usar motor centralizado para gerar treino
  // O motor já considera a frequência semanal e grupos do usuário
  const treinoGerado = await gerarTreinoDoDiaUnico(
    userId,
    data.data || new Date()
  );

  if (!treinoGerado) {
    throw new Error('Não foi possível gerar treino rápido. Verifique sua frequência semanal.');
  }

  // Buscar treino completo do banco
  const treinoCompleto = await prisma.treino.findUnique({
    where: { id: treinoGerado.id },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    }
  });

  return treinoCompleto;
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

