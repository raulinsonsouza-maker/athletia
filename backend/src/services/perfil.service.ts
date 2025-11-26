import { prisma } from '../lib/prisma'

export async function obterPerfilBasico(userId: string) {
  return prisma.perfil.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          plano: true,
          planoAtivo: true,
          dataPagamento: true
        }
      }
    }
  })
}

export async function garantirPerfilParaInteligencia(userId: string) {
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


