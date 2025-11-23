import { prisma } from '../lib/prisma';
import { gerarTreinoDoDia } from './treino.service';
import { gerarTreinos30Dias } from './treino.service';

/**
 * Função centralizada para gerenciar remoção e geração de treinos com IA
 * Esta é a única função que deve ser usada para gerar treinos
 */

/**
 * Remove treinos existentes para uma data específica
 */
async function removerTreinosPorData(userId: string, data: Date): Promise<number> {
  const inicioDia = new Date(data);
  inicioDia.setHours(0, 0, 0, 0);
  const fimDia = new Date(data);
  fimDia.setHours(23, 59, 59, 999);

  const treinosParaRemover = await prisma.treino.findMany({
    where: {
      userId,
      data: {
        gte: inicioDia,
        lte: fimDia
      }
    },
    select: { id: true }
  });

  if (treinosParaRemover.length > 0) {
    await prisma.treino.deleteMany({
      where: {
        userId,
        id: {
          in: treinosParaRemover.map(t => t.id)
        }
      }
    });
    console.log(`✅ ${treinosParaRemover.length} treino(s) removido(s) para ${data.toLocaleDateString('pt-BR')}`);
  }

  return treinosParaRemover.length;
}

/**
 * Remove treinos existentes para um período (data início até data fim)
 */
async function removerTreinosPorPeriodo(
  userId: string,
  dataInicio: Date,
  dataFim: Date
): Promise<number> {
  const inicio = new Date(dataInicio);
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date(dataFim);
  fim.setHours(23, 59, 59, 999);

  const treinosParaRemover = await prisma.treino.findMany({
    where: {
      userId,
      data: {
        gte: inicio,
        lte: fim
      }
    },
    select: { id: true }
  });

  if (treinosParaRemover.length > 0) {
    await prisma.treino.deleteMany({
      where: {
        userId,
        id: {
          in: treinosParaRemover.map(t => t.id)
        }
      }
    });
    console.log(`✅ ${treinosParaRemover.length} treino(s) removido(s) para o período ${inicio.toLocaleDateString('pt-BR')} até ${fim.toLocaleDateString('pt-BR')}`);
  }

  return treinosParaRemover.length;
}

/**
 * Calcula o período da semana atual (domingo a sábado)
 */
function calcularPeriodoSemana(data: Date = new Date()): { inicio: Date; fim: Date } {
  const hoje = new Date(data);
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay()); // Domingo
  inicioSemana.setHours(0, 0, 0, 0);
  
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6); // Sábado
  fimSemana.setHours(23, 59, 59, 999);

  return { inicio: inicioSemana, fim: fimSemana };
}

/**
 * FUNÇÃO CENTRALIZADA: Gera treino(s) com IA
 * 
 * @param userId - ID do usuário
 * @param data - Data específica (opcional, se não fornecido usa hoje)
 * @param gerarSemana - Se true, gera todos os treinos da semana. Se false, gera apenas para a data
 * @returns Treino(s) gerado(s)
 */
export async function gerarTreinoComIA(
  userId: string,
  data?: Date | string,
  gerarSemana: boolean = false
): Promise<{ treinos: any[]; removidos: number; mensagem: string }> {
  console.log(`🔄 [GERADOR CENTRALIZADO] Iniciando geração de treino(s) com IA...`);
  console.log(`   - UserId: ${userId}`);
  console.log(`   - Gerar Semana: ${gerarSemana}`);

  // Normalizar data
  let dataTreino: Date;
  if (data) {
    if (typeof data === 'string') {
      dataTreino = new Date(data + 'T00:00:00.000Z');
    } else {
      dataTreino = new Date(data);
    }
    dataTreino.setUTCHours(0, 0, 0, 0);
  } else {
    dataTreino = new Date();
    dataTreino.setUTCHours(0, 0, 0, 0);
  }

  console.log(`   - Data: ${dataTreino.toISOString()}`);

  let treinosRemovidos = 0;
  let treinosGerados: any[] = [];

  try {
    if (gerarSemana) {
      // GERAÇÃO DA SEMANA COMPLETA
      console.log(`📅 [GERADOR CENTRALIZADO] Modo: Semana Completa`);
      
      const { inicio, fim } = calcularPeriodoSemana(dataTreino);
      console.log(`   - Período: ${inicio.toLocaleDateString('pt-BR')} até ${fim.toLocaleDateString('pt-BR')}`);

      // 1. Remover todos os treinos da semana
      console.log(`🗑️ [GERADOR CENTRALIZADO] Removendo treinos existentes da semana...`);
      treinosRemovidos = await removerTreinosPorPeriodo(userId, inicio, fim);
      
      // 2. Gerar treinos para 30 dias (inclui a semana)
      console.log(`🚀 [GERADOR CENTRALIZADO] Gerando novos treinos...`);
      const todosTreinos = await gerarTreinos30Dias(userId);
      
      // 3. Filtrar apenas os treinos da semana atual
      treinosGerados = todosTreinos.filter((t: any) => {
        const dataT = new Date(t.data);
        return dataT >= inicio && dataT <= fim;
      });

      console.log(`✅ [GERADOR CENTRALIZADO] Semana gerada com sucesso!`);
      console.log(`   - Treinos removidos: ${treinosRemovidos}`);
      console.log(`   - Treinos gerados: ${treinosGerados.length}`);

      return {
        treinos: treinosGerados,
        removidos: treinosRemovidos,
        mensagem: `${treinosGerados.length} treino(s) da semana gerado(s) com sucesso`
      };
    } else {
      // GERAÇÃO DE UM DIA ESPECÍFICO
      console.log(`📅 [GERADOR CENTRALIZADO] Modo: Dia Específico`);
      console.log(`   - Data: ${dataTreino.toLocaleDateString('pt-BR')}`);

      // 1. Remover treino existente para esta data
      console.log(`🗑️ [GERADOR CENTRALIZADO] Removendo treino existente para esta data...`);
      treinosRemovidos = await removerTreinosPorData(userId, dataTreino);
      
      // 2. Gerar novo treino para esta data
      console.log(`🚀 [GERADOR CENTRALIZADO] Gerando novo treino...`);
      const treino = await gerarTreinoDoDia(userId, dataTreino);

      if (!treino) {
        throw new Error('Falha ao gerar treino. Nenhum treino foi criado.');
      }

      treinosGerados = [treino];

      console.log(`✅ [GERADOR CENTRALIZADO] Treino do dia gerado com sucesso!`);
      console.log(`   - Treinos removidos: ${treinosRemovidos}`);
      console.log(`   - Exercícios no treino: ${treino.exercicios?.length || 0}`);

      return {
        treinos: treinosGerados,
        removidos: treinosRemovidos,
        mensagem: 'Treino do dia gerado com sucesso'
      };
    }
  } catch (error: any) {
    console.error(`❌ [GERADOR CENTRALIZADO] Erro ao gerar treino(s):`, error);
    console.error(`   - Mensagem: ${error.message}`);
    console.error(`   - Stack: ${error.stack}`);
    
    throw error;
  }
}

/**
 * Remove treino de uma data específica (função auxiliar para uso externo)
 */
export async function removerTreinoPorData(userId: string, data: Date | string): Promise<number> {
  let dataTreino: Date;
  if (typeof data === 'string') {
    dataTreino = new Date(data + 'T00:00:00.000Z');
  } else {
    dataTreino = new Date(data);
  }
  dataTreino.setUTCHours(0, 0, 0, 0);

  return await removerTreinosPorData(userId, dataTreino);
}

