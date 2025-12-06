import { PapelGrupoMuscular } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { slugify } from '../utils/slugify'

const limparNome = (nome?: string | null) => nome?.trim() ?? ''

/**
 * Localiza um grupo visual EXISTENTE para o nome informado.
 *
 * IMPORTANTE: não cria mais grupos automaticamente.
 * Isso garante que novos grupos só serão criados manualmente pelo painel de admin.
 */
async function garantirGrupoVisual(nome: string) {
  const nomeLimpo = limparNome(nome)
  if (!nomeLimpo) {
    return null
  }

  const slug = slugify(nomeLimpo, 'grupo')

  const existente = await prisma.grupoMuscularVisual.findUnique({
    where: { slug }
  })

  if (!existente) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[GruposMusculares] Grupo visual não encontrado para nome:', nomeLimpo, 'slug:', slug)
    }
    // Não criar automaticamente - retornamos null para que o chamador apenas ignore esse grupo
    return null
  }

  // Retornar o grupo existente sem alterar nome/ativo,
  // para manter o controle 100% manual no painel de grupos.
  return existente
}

type GrupoTarget = {
  nome: string
  papel: PapelGrupoMuscular
  ordem: number
}

export async function sincronizarGruposDoExercicio(
  exercicioId: string,
  principal?: string | null,
  sinergistas?: string[] | null
) {
  const alvos: GrupoTarget[] = []
  const nomePrincipal = limparNome(principal)
  if (nomePrincipal) {
    alvos.push({
      nome: nomePrincipal,
      papel: PapelGrupoMuscular.PRINCIPAL,
      ordem: 0
    })
  }

  const sinergistasUnicos = Array.from(
    new Set(
      (sinergistas || [])
        .map((item) => limparNome(typeof item === 'string' ? item : String(item)))
        .filter(Boolean)
    )
  )

  sinergistasUnicos.forEach((nome, index) => {
    alvos.push({
      nome,
      papel: PapelGrupoMuscular.SINERGISTA,
      ordem: index
    })
  })

  if (alvos.length === 0) {
    await prisma.exercicioGrupoMuscular.deleteMany({
      where: { exercicioId }
    })
    return
  }

  const registrosMantidos: Array<{ grupoId: string; papel: PapelGrupoMuscular }> = []

  for (const alvo of alvos) {
    const grupo = await garantirGrupoVisual(alvo.nome)
    if (!grupo) continue

    registrosMantidos.push({ grupoId: grupo.id, papel: alvo.papel })

    await prisma.exercicioGrupoMuscular.upsert({
      where: {
        exercicioId_grupoVisualId_papel: {
          exercicioId,
          grupoVisualId: grupo.id,
          papel: alvo.papel
        }
      },
      update: {
        ordem: alvo.ordem
      },
      create: {
        exercicioId,
        grupoVisualId: grupo.id,
        papel: alvo.papel,
        ordem: alvo.ordem
      }
    })
  }

  const existentes = await prisma.exercicioGrupoMuscular.findMany({
    where: { exercicioId },
    select: { id: true, grupoVisualId: true, papel: true }
  })

  const manter = new Set(registrosMantidos.map((registro) => `${registro.grupoId}:${registro.papel}`))
  const paraRemover = existentes
    .filter((rel) => !manter.has(`${rel.grupoVisualId}:${rel.papel}`))
    .map((rel) => rel.id)

  if (paraRemover.length > 0) {
    await prisma.exercicioGrupoMuscular.deleteMany({
      where: { id: { in: paraRemover } }
    })
  }
}

export async function sincronizarTodosExerciciosComGrupos() {
  const exercicios = await prisma.exercicio.findMany({
    select: {
      id: true,
      grupoMuscularPrincipal: true,
      sinergistas: true
    }
  })

  for (const exercicio of exercicios) {
    try {
      await sincronizarGruposDoExercicio(
        exercicio.id,
        exercicio.grupoMuscularPrincipal,
        exercicio.sinergistas
      )
    } catch (error) {
      console.error('[GruposMusculares] Falha ao sincronizar exercício', exercicio.id, error)
    }
  }
}


