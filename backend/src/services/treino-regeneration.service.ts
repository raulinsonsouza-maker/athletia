/**
 * TREINO REGENERATION SERVICE
 * 
 * Serviço para regenerar todos os treinos usando a nova lógica canônica
 */

import { prisma } from '../lib/prisma';
import { regenerarTreinos30Dias, PerfilCompleto } from './treino-core.service';
import { obterInicioSemana, normalizarData } from './treino-utils.service';

/**
 * Regenera todos os treinos de um usuário usando a lógica canônica
 * 
 * Remove treinos IA existentes (não concluídos) e gera novos
 */
export async function regenerarTreinosUsuarioCanonico(userId: string): Promise<void> {
  console.log(`[REGENERAÇÃO] Iniciando regeneração canônica para usuário ${userId}`);

  // Buscar perfil do usuário
  const perfil = await prisma.perfil.findUnique({
    where: { userId }
  });

  if (!perfil) {
    console.warn(`[REGENERAÇÃO] Perfil não encontrado para usuário ${userId}`);
    return;
  }

  // Converter perfil para formato completo
  const perfilCompleto: PerfilCompleto = {
    idade: perfil.idade,
    sexo: perfil.sexo,
    altura: perfil.altura,
    pesoAtual: perfil.pesoAtual,
    percentualGordura: perfil.percentualGordura,
    tipoCorpo: perfil.tipoCorpo,
    experiencia: perfil.experiencia,
    problemasAnteriores: perfil.problemasAnteriores || [],
    lesoes: perfil.lesoes || [],
    objetivo: perfil.objetivo,
    objetivosAdicionais: perfil.objetivosAdicionais || [],
    rpePreferido: perfil.rpePreferido,
    frequenciaSemanal: perfil.frequenciaSemanal,
    tempoDisponivel: perfil.tempoDisponivel,
    localTreino: perfil.localTreino,
    preferencias: perfil.preferencias || [],
    aguaDiaria: perfil.aguaDiaria
  };

  // Usar função existente de regeneração (já usa a nova lógica através do treino-core)
  await regenerarTreinos30Dias(userId, perfilCompleto);

  console.log(`[REGENERAÇÃO] Regeneração concluída para usuário ${userId}`);
}

/**
 * Regenera treinos para todos os usuários ou para um usuário específico
 * 
 * @param userId ID do usuário. Se undefined, regenera para todos os usuários ativos
 */
export async function regenerarTodosTreinosCanonico(userId?: string): Promise<void> {
  if (userId) {
    // Regenerar apenas para um usuário
    await regenerarTreinosUsuarioCanonico(userId);
    return;
  }

  // Regenerar para todos os usuários ativos
  console.log('[REGENERAÇÃO] Iniciando regeneração canônica para todos os usuários');

  const usuarios = await prisma.user.findMany({
    where: {
      ativo: true
    },
    select: {
      id: true
    }
  });

  console.log(`[REGENERAÇÃO] Encontrados ${usuarios.length} usuários para regeneração`);

  let sucesso = 0;
  let erros = 0;

  for (const usuario of usuarios) {
    try {
      await regenerarTreinosUsuarioCanonico(usuario.id);
      sucesso++;
    } catch (error) {
      console.error(`[REGENERAÇÃO] Erro ao regenerar treinos para usuário ${usuario.id}:`, error);
      erros++;
    }
  }

  console.log(`[REGENERAÇÃO] Regeneração concluída. Sucesso: ${sucesso}, Erros: ${erros}`);
}

/**
 * Remove treinos IA futuros (não concluídos) de um usuário
 */
export async function removerTreinosIAFuturos(userId: string): Promise<number> {
  const hoje = normalizarData(new Date());

  const resultado = await prisma.treino.deleteMany({
    where: {
      userId,
      criadoPor: 'IA',
      concluido: false,
      data: { gte: hoje }
    }
  });

  console.log(`[REGENERAÇÃO] Removidos ${resultado.count} treinos IA futuros para usuário ${userId}`);
  return resultado.count;
}

/**
 * Regenera treinos para uma semana específica
 */
export async function regenerarSemanaEspecifica(
  userId: string,
  dataInicioSemana: Date
): Promise<void> {
  console.log(`[REGENERAÇÃO] Regenerando semana específica para usuário ${userId}`);

  const perfil = await prisma.perfil.findUnique({
    where: { userId }
  });

  if (!perfil || !perfil.frequenciaSemanal) {
    console.warn(`[REGENERAÇÃO] Perfil não encontrado ou sem frequência para usuário ${userId}`);
    return;
  }

  const inicioSemana = normalizarData(obterInicioSemana(dataInicioSemana));
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(fimSemana.getDate() + 7);

  // Remover treinos da semana
  await prisma.treino.deleteMany({
    where: {
      userId,
      criadoPor: 'IA',
      data: {
        gte: inicioSemana,
        lt: fimSemana
      }
    }
  });

  // Regenerar usando a função principal (que gera 30 dias)
  const perfilCompleto: PerfilCompleto = {
    idade: perfil.idade,
    sexo: perfil.sexo,
    altura: perfil.altura,
    pesoAtual: perfil.pesoAtual,
    percentualGordura: perfil.percentualGordura,
    tipoCorpo: perfil.tipoCorpo,
    experiencia: perfil.experiencia,
    problemasAnteriores: perfil.problemasAnteriores || [],
    lesoes: perfil.lesoes || [],
    objetivo: perfil.objetivo,
    objetivosAdicionais: perfil.objetivosAdicionais || [],
    rpePreferido: perfil.rpePreferido,
    frequenciaSemanal: perfil.frequenciaSemanal,
    tempoDisponivel: perfil.tempoDisponivel,
    localTreino: perfil.localTreino,
    preferencias: perfil.preferencias || [],
    aguaDiaria: perfil.aguaDiaria
  };

  await regenerarTreinos30Dias(userId, perfilCompleto);

  console.log(`[REGENERAÇÃO] Semana regenerada para usuário ${userId}`);
}
