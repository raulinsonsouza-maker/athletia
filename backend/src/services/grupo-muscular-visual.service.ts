import { prisma } from '../lib/prisma'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'grupo'

export async function listarGruposVisuaisAdmin() {
  return prisma.grupoMuscularVisual.findMany({
    orderBy: [{ ordem: 'asc' }, { nome: 'asc' }]
  })
}

export async function criarGrupoVisual(data: {
  nome: string
  descricao?: string | null
  imagemUrl?: string | null
  ativo?: boolean
  ordem?: number | null
}) {
  const slugBase = slugify(data.nome)
  let slug = slugBase
  let tentativa = 1
  while (await prisma.grupoMuscularVisual.findUnique({ where: { slug } })) {
    slug = `${slugBase}-${tentativa++}`
  }

  return prisma.grupoMuscularVisual.create({
    data: {
      nome: data.nome,
      slug,
      descricao: data.descricao || null,
      imagemUrl: data.imagemUrl || null,
      ativo: data.ativo ?? true,
      ordem: data.ordem ?? 0
    }
  })
}

export async function atualizarGrupoVisual(
  id: string,
  data: {
    nome?: string
    descricao?: string | null
    imagemUrl?: string | null
    ativo?: boolean
    ordem?: number | null
  }
) {
  let slugAtualizacao: string | undefined

  if (data.nome) {
    const novoSlug = slugify(data.nome)
    const existente = await prisma.grupoMuscularVisual.findUnique({ where: { slug: novoSlug } })
    if (!existente || existente.id === id) {
      slugAtualizacao = novoSlug
    }
  }

  return prisma.grupoMuscularVisual.update({
    where: { id },
    data: {
      nome: data.nome,
      slug: slugAtualizacao,
      descricao: data.descricao,
      imagemUrl: data.imagemUrl,
      ativo: data.ativo,
      ordem: data.ordem
    }
  })
}

export async function removerGrupoVisual(id: string) {
  await prisma.grupoMuscularVisual.delete({
    where: { id }
  })
}

export async function buscarVisuaisAtivos() {
  return prisma.grupoMuscularVisual.findMany({
    where: { ativo: true },
    orderBy: [{ ordem: 'asc' }, { nome: 'asc' }]
  })
}

export function gerarSlugGrupo(nome: string) {
  return slugify(nome)
}

