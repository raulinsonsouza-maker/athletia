/**
 * Job de Validação Semanal de Treinos
 * 
 * Executa todo domingo à noite (23:00) para validar e corrigir treinos da semana seguinte
 * Garante que todos os usuários têm treinos conforme configurações do onboarding
 * 
 * Validações:
 * - Quantidade de treinos = frequência semanal configurada
 * - Treinos estão nos dias corretos conforme distribuição
 * - Cada treino tem exercícios válidos
 * - Cardio está no final (não no início)
 * - Não há exercícios de flexibilidade/alongamento
 * - Grupos musculares estão corretos conforme split
 */

import { prisma } from '../lib/prisma';
import { 
  validarEstruturaTreino, 
  corrigirEstruturaTreino,
  gerarTreinoUnificado,
  PerfilCompleto,
  distribuirDiasSemana
} from '../services/treino-core.service';

/**
 * Converte perfil do banco para PerfilCompleto
 */
function converterPerfilParaCompleto(perfil: any): PerfilCompleto {
  return {
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
}

/**
 * Calcula domingo da semana seguinte (início da semana)
 */
function calcularDomingoSemanaSeguinte(): Date {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  // Dia da semana (0=domingo, 1=segunda...)
  const diaSemana = hoje.getDay();
  
  // Calcular domingo da semana seguinte
  const diasAteDomingo = diaSemana === 0 ? 7 : 7 - diaSemana;
  const domingoSemanaSeguinte = new Date(hoje);
  domingoSemanaSeguinte.setDate(hoje.getDate() + diasAteDomingo);
  
  return domingoSemanaSeguinte;
}

/**
 * Calcula sábado da semana seguinte (fim da semana)
 */
function calcularSabadoSemanaSeguinte(): Date {
  const domingo = calcularDomingoSemanaSeguinte();
  const sabado = new Date(domingo);
  sabado.setDate(domingo.getDate() + 6);
  sabado.setHours(23, 59, 59, 999);
  return sabado;
}

/**
 * Valida estrutura de um treino individual
 */
async function validarTreinoIndividual(treino: any): Promise<{
  valido: boolean;
  problemas: string[];
}> {
  const validacao = await validarEstruturaTreino(treino);
  return {
    valido: validacao.valido,
    problemas: validacao.problemas
  };
}

/**
 * Valida se os treinos da semana estão corretos
 */
async function validarTreinosSemana(
  userId: string,
  perfil: PerfilCompleto,
  treinosSemana: any[]
): Promise<{
  valido: boolean;
  problemas: string[];
  treinosFaltantes: Date[];
  treinosIncorretos: Array<{ treinoId: string; problemas: string[] }>;
}> {
  const problemas: string[] = [];
  const treinosFaltantes: Date[] = [];
  const treinosIncorretos: Array<{ treinoId: string; problemas: string[] }> = [];
  
  // Calcular dias esperados de treino
  const frequencia = perfil.frequenciaSemanal || 3;
  const diasEsperados = distribuirDiasSemana(frequencia);
  
  // Calcular datas da semana seguinte
  const domingo = calcularDomingoSemanaSeguinte();
  const datasEsperadas = diasEsperados.map(dia => {
    const data = new Date(domingo);
    data.setDate(domingo.getDate() + dia);
    return data;
  });
  
  // Verificar quantidade de treinos
  if (treinosSemana.length !== frequencia) {
    problemas.push(`Quantidade de treinos incorreta: esperado ${frequencia}, encontrado ${treinosSemana.length}`);
  }
  
  // Verificar se há treinos nos dias corretos
  const datasComTreino = treinosSemana.map(t => {
    const data = new Date(t.data);
    data.setHours(0, 0, 0, 0);
    return data.getTime();
  });
  
  for (const dataEsperada of datasEsperadas) {
    const dataEsperadaTime = dataEsperada.getTime();
    if (!datasComTreino.includes(dataEsperadaTime)) {
      treinosFaltantes.push(dataEsperada);
      problemas.push(`Treino faltante para ${dataEsperada.toLocaleDateString('pt-BR')}`);
    }
  }
  
  // Validar cada treino individual
  for (const treino of treinosSemana) {
    const validacao = await validarTreinoIndividual(treino);
    if (!validacao.valido) {
      treinosIncorretos.push({
        treinoId: treino.id,
        problemas: validacao.problemas
      });
      problemas.push(`Treino ${treino.id} (${new Date(treino.data).toLocaleDateString('pt-BR')}): ${validacao.problemas.join(', ')}`);
    }
  }
  
  return {
    valido: problemas.length === 0,
    problemas,
    treinosFaltantes,
    treinosIncorretos
  };
}

/**
 * Regenera treinos faltantes ou incorretos
 */
async function regenerarTreinos(
  userId: string,
  perfil: PerfilCompleto,
  treinosFaltantes: Date[],
  treinosIncorretos: Array<{ treinoId: string; problemas: string[] }>
): Promise<{
  regenerados: number;
  corrigidos: number;
}> {
  let regenerados = 0;
  let corrigidos = 0;
  
  // Regenerar treinos faltantes
  for (const data of treinosFaltantes) {
    try {
      // Calcular índice do dia na semana (0 = primeiro dia de treino, 1 = segundo, etc.)
      const frequencia = perfil.frequenciaSemanal || 3;
      const diasTreino = distribuirDiasSemana(frequencia);
      const domingo = calcularDomingoSemanaSeguinte();
      const diasDesdeDomingo = Math.floor((data.getTime() - domingo.getTime()) / (1000 * 60 * 60 * 24));
      const diaSemana = data.getDay() === 0 ? 7 : data.getDay();
      const indiceDia = diasTreino.indexOf(diaSemana);
      
      // Buscar grupos do dia usando a lógica centralizada
      const { obterGruposDoDia } = await import('../services/split-generator.service');
      const grupos = await obterGruposDoDia(frequencia, indiceDia >= 0 ? indiceDia : 0);
      
      await gerarTreinoUnificado({
        userId,
        data,
        gruposMusculares: grupos,
        perfil
      });
      
      regenerados++;
      console.log(`[VALIDAÇÃO] Treino regenerado para ${data.toLocaleDateString('pt-BR')}`);
    } catch (error: any) {
      console.error(`[VALIDAÇÃO] Erro ao regenerar treino para ${data.toLocaleDateString('pt-BR')}:`, error.message);
    }
  }
  
  // Corrigir treinos incorretos
  for (const { treinoId } of treinosIncorretos) {
    try {
      const resultado = await corrigirEstruturaTreino(treinoId);
      if (resultado.corrigido) {
        corrigidos++;
        console.log(`[VALIDAÇÃO] Treino ${treinoId} corrigido: ${resultado.alteracoes.join(', ')}`);
      }
    } catch (error: any) {
      console.error(`[VALIDAÇÃO] Erro ao corrigir treino ${treinoId}:`, error.message);
    }
  }
  
  return { regenerados, corrigidos };
}

/**
 * Executa validação semanal de treinos
 */
export async function executarValidacaoSemanal() {
  console.log('[VALIDAÇÃO SEMANAL] Iniciando validação de treinos da semana seguinte...');
  const inicio = Date.now();
  
  try {
    // Calcular período da semana seguinte
    const domingo = calcularDomingoSemanaSeguinte();
    const sabado = calcularSabadoSemanaSeguinte();
    
    console.log(`[VALIDAÇÃO SEMANAL] Período: ${domingo.toLocaleDateString('pt-BR')} até ${sabado.toLocaleDateString('pt-BR')}`);
    
    // Buscar todos os usuários ativos com perfil completo
    const usuarios = await prisma.user.findMany({
      where: { planoAtivo: true },
      include: { perfil: true }
    });
    
    console.log(`[VALIDAÇÃO SEMANAL] Total de usuários ativos: ${usuarios.length}`);
    
    let usuariosValidados = 0;
    let usuariosComProblemas = 0;
    let treinosRegenerados = 0;
    let treinosCorrigidos = 0;
    const erros: Array<{ userId: string; erro: string }> = [];
    
    for (const usuario of usuarios) {
      try {
        if (!usuario.perfil) {
          console.log(`[VALIDAÇÃO SEMANAL] Usuário ${usuario.id} sem perfil, pulando...`);
          continue;
        }
        
        // Validar perfil
        if (!usuario.perfil.objetivo || !usuario.perfil.experiencia || !usuario.perfil.frequenciaSemanal) {
          console.log(`[VALIDAÇÃO SEMANAL] Usuário ${usuario.id} com perfil incompleto, pulando...`);
          continue;
        }
        
        // Converter perfil
        const perfilCompleto = converterPerfilParaCompleto(usuario.perfil);
        
        // Buscar treinos da semana seguinte
        const treinosSemana = await prisma.treino.findMany({
          where: {
            userId: usuario.id,
            data: {
              gte: domingo,
              lte: sabado
            },
            concluido: false
          },
          include: {
            exercicios: {
              include: { exercicio: true },
              orderBy: { ordem: 'asc' }
            }
          }
        });
        
        // Validar treinos
        const validacao = await validarTreinosSemana(usuario.id, perfilCompleto, treinosSemana);
        
        if (validacao.valido) {
          usuariosValidados++;
          console.log(`[VALIDAÇÃO SEMANAL] Usuário ${usuario.id}: OK`);
        } else {
          usuariosComProblemas++;
          console.log(`[VALIDAÇÃO SEMANAL] Usuário ${usuario.id}: PROBLEMAS encontrados`);
          console.log(`  Problemas: ${validacao.problemas.join('; ')}`);
          
          // Regenerar/corrigir treinos
          const resultado = await regenerarTreinos(
            usuario.id,
            perfilCompleto,
            validacao.treinosFaltantes,
            validacao.treinosIncorretos
          );
          
          treinosRegenerados += resultado.regenerados;
          treinosCorrigidos += resultado.corrigidos;
        }
      } catch (error: any) {
        const erroMsg = error.message || 'Erro desconhecido';
        erros.push({ userId: usuario.id, erro: erroMsg });
        console.error(`[VALIDAÇÃO SEMANAL] Erro ao validar usuário ${usuario.id}:`, erroMsg);
      }
    }
    
    const tempoTotal = ((Date.now() - inicio) / 1000).toFixed(2);
    
    console.log('\n[VALIDAÇÃO SEMANAL] Validação concluída:');
    console.log(`  - Usuários validados (OK): ${usuariosValidados}`);
    console.log(`  - Usuários com problemas: ${usuariosComProblemas}`);
    console.log(`  - Treinos regenerados: ${treinosRegenerados}`);
    console.log(`  - Treinos corrigidos: ${treinosCorrigidos}`);
    console.log(`  - Erros: ${erros.length}`);
    console.log(`  - Tempo total: ${tempoTotal}s`);
    
    if (erros.length > 0) {
      console.log('\n[VALIDAÇÃO SEMANAL] Erros detalhados:');
      erros.forEach(({ userId, erro }) => {
        console.log(`  - ${userId}: ${erro}`);
      });
    }
    
    return {
      usuariosValidados,
      usuariosComProblemas,
      treinosRegenerados,
      treinosCorrigidos,
      erros
    };
  } catch (error: any) {
    console.error('[VALIDAÇÃO SEMANAL] Erro fatal durante validação:', error);
    throw error;
  }
}

// Executar se chamado diretamente (para testes)
if (require.main === module) {
  executarValidacaoSemanal()
    .then(() => {
      console.log('Validação semanal executada com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Validação semanal falhou:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

