/**
 * Script de Migração de Treinos - Nova Lógica Centralizada
 * 
 * Apaga treinos IA futuros e regenera usando a nova lógica centralizada
 * Aplica para todos os usuários ativos
 */

import { prisma } from '../src/lib/prisma';
import { regenerarTreinos30Dias, PerfilCompleto } from '../src/services/treino-core.service';

interface OpcoesMigracao {
  apagarTreinosFuturos: boolean; // Sempre true
  apagarTreinosConcluidos: boolean; // Opcional, default false
  manterTreinosManuais: boolean; // Sempre true
  manterTreinosPersonalizados: boolean; // Sempre true
  diasParaRegenerar: number; // Default 30
  processarEmLotes: boolean; // Default true
  tamanhoLote: number; // Default 50 usuários
}

const OPCOES_PADRAO: OpcoesMigracao = {
  apagarTreinosFuturos: true,
  apagarTreinosConcluidos: false,
  manterTreinosManuais: true,
  manterTreinosPersonalizados: true,
  diasParaRegenerar: 30,
  processarEmLotes: true,
  tamanhoLote: 50
};

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
 * Valida que o perfil tem dados necessários
 */
function validarPerfil(perfil: any): boolean {
  return !!(
    perfil &&
    perfil.objetivo &&
    perfil.experiencia &&
    perfil.frequenciaSemanal
  );
}

/**
 * Processa um lote de usuários
 */
async function processarLote(
  usuarios: any[],
  opcoes: OpcoesMigracao
): Promise<{ sucesso: number; erros: number; errosDetalhes: Array<{ userId: string; erro: string }> }> {
  let sucesso = 0;
  let erros = 0;
  const errosDetalhes: Array<{ userId: string; erro: string }> = [];

  for (const usuario of usuarios) {
    try {
      if (!usuario.perfil) {
        console.log(`[SKIP] Usuário ${usuario.id} sem perfil`);
        continue;
      }

      if (!validarPerfil(usuario.perfil)) {
        console.log(`[SKIP] Usuário ${usuario.id} com perfil incompleto`);
        continue;
      }

      // Apagar treinos IA futuros
      if (opcoes.apagarTreinosFuturos) {
        const deletados = await prisma.treino.deleteMany({
          where: {
            userId: usuario.id,
            criadoPor: 'IA',
            concluido: false,
            data: { gte: new Date() }
          }
        });
        console.log(`[${usuario.id}] ${deletados.count} treinos futuros apagados`);
      }

      // Apagar treinos IA concluídos (se opção escolhida)
      if (opcoes.apagarTreinosConcluidos) {
        const deletados = await prisma.treino.deleteMany({
          where: {
            userId: usuario.id,
            criadoPor: 'IA',
            concluido: true
          }
        });
        console.log(`[${usuario.id}] ${deletados.count} treinos concluídos apagados`);
      }

      // Converter perfil
      const perfilCompleto = converterPerfilParaCompleto(usuario.perfil);

      // Regenerar treinos
      await regenerarTreinos30Dias(usuario.id, perfilCompleto);

      sucesso++;
      console.log(`[OK] Usuário ${usuario.id} processado com sucesso`);
    } catch (error: any) {
      erros++;
      const erroMsg = error.message || 'Erro desconhecido';
      errosDetalhes.push({ userId: usuario.id, erro: erroMsg });
      console.error(`[ERRO] Usuário ${usuario.id}: ${erroMsg}`);
    }
  }

  return { sucesso, erros, errosDetalhes };
}

/**
 * Executa migração completa
 */
async function executarMigracao(opcoes: OpcoesMigracao = OPCOES_PADRAO) {
  console.log('========================================');
  console.log('MIGRAÇÃO DE TREINOS - NOVA LÓGICA');
  console.log('========================================');
  console.log(`Opções:`);
  console.log(`- Apagar treinos futuros: ${opcoes.apagarTreinosFuturos}`);
  console.log(`- Apagar treinos concluídos: ${opcoes.apagarTreinosConcluidos}`);
  console.log(`- Dias para regenerar: ${opcoes.diasParaRegenerar}`);
  console.log(`- Processar em lotes: ${opcoes.processarEmLotes}`);
  console.log(`- Tamanho do lote: ${opcoes.tamanhoLote}`);
  console.log('========================================\n');

  const inicio = Date.now();

  try {
    // Buscar todos os usuários ativos com perfil
    const totalUsuarios = await prisma.user.count({
      where: { planoAtivo: true }
    });

    console.log(`[INFO] Total de usuários ativos: ${totalUsuarios}\n`);

    let processados = 0;
    let totalSucesso = 0;
    let totalErros = 0;
    const todosErrosDetalhes: Array<{ userId: string; erro: string }> = [];

    if (opcoes.processarEmLotes) {
      // Processar em lotes
      let offset = 0;
      const limit = opcoes.tamanhoLote;

      while (offset < totalUsuarios) {
        console.log(`\n[LOTE] Processando usuários ${offset + 1} a ${Math.min(offset + limit, totalUsuarios)}...`);

        const usuarios = await prisma.user.findMany({
          where: { planoAtivo: true },
          include: { perfil: true },
          skip: offset,
          take: limit
        });

        if (usuarios.length === 0) break;

        const resultado = await processarLote(usuarios, opcoes);
        totalSucesso += resultado.sucesso;
        totalErros += resultado.erros;
        todosErrosDetalhes.push(...resultado.errosDetalhes);
        processados += usuarios.length;

        console.log(`[LOTE] Concluído: ${resultado.sucesso} sucesso, ${resultado.erros} erros`);

        offset += limit;

        // Pequena pausa entre lotes para não sobrecarregar
        if (offset < totalUsuarios) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } else {
      // Processar todos de uma vez
      const usuarios = await prisma.user.findMany({
        where: { planoAtivo: true },
        include: { perfil: true }
      });

      const resultado = await processarLote(usuarios, opcoes);
      totalSucesso = resultado.sucesso;
      totalErros = resultado.erros;
      todosErrosDetalhes.push(...resultado.errosDetalhes);
      processados = usuarios.length;
    }

    const tempoTotal = ((Date.now() - inicio) / 1000).toFixed(2);

    console.log('\n========================================');
    console.log('MIGRAÇÃO CONCLUÍDA');
    console.log('========================================');
    console.log(`Total processado: ${processados} usuários`);
    console.log(`Sucesso: ${totalSucesso}`);
    console.log(`Erros: ${totalErros}`);
    console.log(`Tempo total: ${tempoTotal}s`);
    console.log('========================================\n');

    if (todosErrosDetalhes.length > 0) {
      console.log('ERROS DETALHADOS:');
      todosErrosDetalhes.forEach(({ userId, erro }) => {
        console.log(`  - ${userId}: ${erro}`);
      });
      console.log('');
    }

    if (totalErros > 0) {
      console.log(`⚠️  ${totalErros} usuários falharam. Verifique os logs acima.`);
    }

  } catch (error: any) {
    console.error('\n[ERRO FATAL] Erro durante migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);
  const opcoes: OpcoesMigracao = { ...OPCOES_PADRAO };

  // Parse argumentos simples
  if (args.includes('--apagar-concluidos')) {
    opcoes.apagarTreinosConcluidos = true;
  }

  if (args.includes('--sem-lotes')) {
    opcoes.processarEmLotes = false;
  }

  const tamanhoLoteMatch = args.find(arg => arg.startsWith('--lote='));
  if (tamanhoLoteMatch) {
    opcoes.tamanhoLote = parseInt(tamanhoLoteMatch.split('=')[1], 10) || 50;
  }

  executarMigracao(opcoes)
    .then(() => {
      console.log('Migração finalizada com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migração falhou:', error);
      process.exit(1);
    });
}

export { executarMigracao, OpcoesMigracao };

