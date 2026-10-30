import { prisma } from '../lib/prisma';
import { DESAFIOS, buscarDesafio, DiaDesafio } from '../data/desafios';
import { normalizarData } from './treino-utils.service';

function intervaloDoDia(data: Date): { inicio: Date; fim: Date } {
  const inicio = normalizarData(data);
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 1);
  return { inicio, fim };
}

function statusDoDia(dia: number, concluidos: Set<number>, proximo: number): 'concluido' | 'atual' | 'bloqueado' {
  if (concluidos.has(dia)) return 'concluido';
  if (dia === proximo) return 'atual';
  return 'bloqueado';
}

export async function listarDesafios(userId: string) {
  const progressos = await prisma.desafioProgresso.groupBy({
    by: ['desafioSlug'],
    where: { userId },
    _count: { dia: true }
  });
  const contagem = new Map(progressos.map((item) => [item.desafioSlug, item._count.dia]));

  return DESAFIOS.map((desafio) => ({
    slug: desafio.slug,
    titulo: desafio.titulo,
    descricao: desafio.descricao,
    totalDias: desafio.dias.length,
    diasConcluidos: contagem.get(desafio.slug) || 0,
    disponivel: desafio.dias.length > 0
  }));
}

export async function detalharDesafio(userId: string, slug: string) {
  const desafio = buscarDesafio(slug);
  if (!desafio) return null;

  const progressos = await prisma.desafioProgresso.findMany({
    where: { userId, desafioSlug: slug },
    select: { dia: true }
  });
  const concluidos = new Set(progressos.map((item) => item.dia));
  const proximo = desafio.dias.find((item) => !concluidos.has(item.dia))?.dia ?? desafio.dias.length + 1;

  return {
    slug: desafio.slug,
    titulo: desafio.titulo,
    descricao: desafio.descricao,
    disponivel: desafio.dias.length > 0,
    totalDias: desafio.dias.length,
    diasConcluidos: concluidos.size,
    dias: desafio.dias.map((item) => ({
      dia: item.dia,
      nome: item.nome,
      duracaoSegundos: item.duracaoSegundos,
      youtubeId: item.youtubeId,
      status: statusDoDia(item.dia, concluidos, proximo)
    }))
  };
}

async function garantirTreinoDoDia(userId: string, dia: DiaDesafio) {
  const { inicio, fim } = intervaloDoDia(new Date());
  const jaConta = await prisma.treino.findFirst({
    where: {
      userId,
      concluido: true,
      data: { gte: inicio, lt: fim }
    },
    select: { id: true }
  });
  if (jaConta) return;

  await prisma.treino.create({
    data: {
      userId,
      data: inicio,
      tipo: 'Desafio',
      concluido: true,
      criadoPor: 'DESAFIO',
      nome: dia.nome,
      tempoEstimado: Math.max(1, Math.round(dia.duracaoSegundos / 60))
    }
  });
}

export async function concluirDiaDesafio(userId: string, slug: string, dia: number) {
  const desafio = buscarDesafio(slug);
  const item = desafio?.dias.find((entrada) => entrada.dia === dia);
  if (!desafio || !item) {
    return { erro: 'Dia do desafio não encontrado', status: 404 as const };
  }

  const feitos = await prisma.desafioProgresso.findMany({
    where: { userId, desafioSlug: slug },
    select: { dia: true }
  });
  const concluidos = new Set(feitos.map((entrada) => entrada.dia));
  if (concluidos.has(dia)) {
    return detalharDesafio(userId, slug);
  }
  if (dia > 1 && !concluidos.has(dia - 1)) {
    return { erro: 'Conclua o dia anterior antes deste', status: 400 as const };
  }

  await prisma.desafioProgresso.create({
    data: {
      userId,
      desafioSlug: slug,
      dia,
      concluidoEm: new Date()
    }
  });
  await garantirTreinoDoDia(userId, item);
  return detalharDesafio(userId, slug);
}

export async function desmarcarDiaDesafio(userId: string, slug: string, dia: number) {
  const desafio = buscarDesafio(slug);
  if (!desafio || !desafio.dias.some((item) => item.dia === dia)) {
    return { erro: 'Dia do desafio não encontrado', status: 404 as const };
  }

  const ultimo = await prisma.desafioProgresso.findFirst({
    where: { userId, desafioSlug: slug },
    orderBy: { dia: 'desc' }
  });
  if (!ultimo || ultimo.dia !== dia) {
    return { erro: 'Só dá para desmarcar o último dia feito', status: 400 as const };
  }

  const { inicio, fim } = intervaloDoDia(ultimo.concluidoEm);
  await prisma.desafioProgresso.delete({ where: { id: ultimo.id } });

  const outroDesafioNoDia = await prisma.desafioProgresso.count({
    where: { userId, concluidoEm: { gte: inicio, lt: fim } }
  });
  const outroTreino = await prisma.treino.count({
    where: {
      userId,
      concluido: true,
      criadoPor: { not: 'DESAFIO' },
      data: { gte: inicio, lt: fim }
    }
  });
  if (outroDesafioNoDia === 0 && outroTreino === 0) {
    await prisma.treino.deleteMany({
      where: {
        userId,
        criadoPor: 'DESAFIO',
        data: { gte: inicio, lt: fim }
      }
    });
  }

  return detalharDesafio(userId, slug);
}
