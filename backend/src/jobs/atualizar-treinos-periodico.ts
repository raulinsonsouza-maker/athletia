/**
 * Job de Atualização Periódica de Treinos
 * 
 * Executa diariamente para atualizar treinos de usuários que precisam
 * Atualiza treinos a cada 30 dias usando a nova lógica centralizada
 */

import { prisma } from '../lib/prisma';
import { regenerarTreinos30Dias, PerfilCompleto } from '../services/treino-core.service';

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
 * Verifica se usuário precisa de atualização
 */
function precisaAtualizarTreinos(
  ultimaAtualizacao: Date | null
): boolean {
  if (!ultimaAtualizacao) {
    return true; // Nunca foi atualizado
  }

  const diasDesdeAtualizacao = Math.floor(
    (Date.now() - ultimaAtualizacao.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Atualizar a cada 30 dias
  return diasDesdeAtualizacao >= 30;
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
 * Executa atualização periódica de treinos
 */
export async function executarAtualizacaoPeriodica() {
  console.log('[JOB] Iniciando atualização periódica de treinos...');
  const inicio = Date.now();

  try {
    // Buscar todos os usuários ativos com perfil
    const usuarios = await prisma.user.findMany({
      where: { planoAtivo: true },
      include: { perfil: true }
    });

    console.log(`[JOB] Total de usuários ativos: ${usuarios.length}`);

    let atualizados = 0;
    let pulados = 0;
    let erros = 0;
    const errosDetalhes: Array<{ userId: string; erro: string }> = [];

    for (const usuario of usuarios) {
      try {
        if (!usuario.perfil) {
          pulados++;
          continue;
        }

        if (!validarPerfil(usuario.perfil)) {
          pulados++;
          console.log(`[JOB] Usuário ${usuario.id} com perfil incompleto, pulando...`);
          continue;
        }

        // Verificar se precisa atualizar
        const precisaAtualizar = precisaAtualizarTreinos(
          usuario.perfil.ultimaAtualizacaoPeriodica
        );

        if (!precisaAtualizar) {
          pulados++;
          continue;
        }

        // Converter perfil
        const perfilCompleto = converterPerfilParaCompleto(usuario.perfil);

        // Regenerar treinos
        await regenerarTreinos30Dias(usuario.id, perfilCompleto);

        // Atualizar data da última atualização periódica
        await prisma.perfil.update({
          where: { userId: usuario.id },
          data: {
            ultimaAtualizacaoPeriodica: new Date()
          }
        });

        atualizados++;
        console.log(`[JOB] Treinos atualizados para usuário ${usuario.id}`);
      } catch (error: any) {
        erros++;
        const erroMsg = error.message || 'Erro desconhecido';
        errosDetalhes.push({ userId: usuario.id, erro: erroMsg });
        console.error(`[JOB] Erro ao atualizar treinos do usuário ${usuario.id}:`, erroMsg);
      }
    }

    const tempoTotal = ((Date.now() - inicio) / 1000).toFixed(2);

    console.log('\n[JOB] Atualização periódica concluída:');
    console.log(`  - Atualizados: ${atualizados}`);
    console.log(`  - Pulados: ${pulados}`);
    console.log(`  - Erros: ${erros}`);
    console.log(`  - Tempo total: ${tempoTotal}s`);

    if (errosDetalhes.length > 0) {
      console.log('\n[JOB] Erros detalhados:');
      errosDetalhes.forEach(({ userId, erro }) => {
        console.log(`  - ${userId}: ${erro}`);
      });
    }

    return {
      atualizados,
      pulados,
      erros,
      errosDetalhes
    };
  } catch (error: any) {
    console.error('[JOB] Erro fatal durante atualização periódica:', error);
    throw error;
  }
}

// Executar se chamado diretamente (para testes)
if (require.main === module) {
  executarAtualizacaoPeriodica()
    .then(() => {
      console.log('Job executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Job falhou:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

