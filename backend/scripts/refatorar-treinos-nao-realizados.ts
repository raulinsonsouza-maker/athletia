/**
 * Script para refatorar treinos não realizados
 * 
 * Este script:
 * 1. Busca todos os treinos não concluídos (concluido: false) criados pela IA
 * 2. Agrupa treinos por usuário para otimizar o processamento
 * 3. Para cada usuário, busca o perfil completo
 * 4. Deleta treinos antigos não realizados
 * 5. Regere todos os treinos usando regenerarTreinos30Dias com os novos exercícios disponíveis
 * 6. Mantém as datas originais dos treinos (próximos 30 dias)
 * 
 * IMPORTANTE:
 * - Apenas refatora treinos futuros (data >= hoje)
 * - Apenas refatora treinos criados pela IA (criadoPor: 'IA')
 * - Apenas refatora treinos não concluídos (concluido: false)
 * - Mantém treinos concluídos intactos
 * 
 * Uso:
 *   cd backend
 *   npm run refatorar-treinos-nao-realizados
 * 
 * Ou diretamente:
 *   npx tsx scripts/refatorar-treinos-nao-realizados.ts
 */

import { PrismaClient } from '@prisma/client';
import { regenerarTreinos30Dias, type PerfilCompleto } from '../src/services/treino-core.service';

const prisma = new PrismaClient();

interface Estatisticas {
  totalTreinos: number;
  treinosRefatorados: number;
  treinosComErro: number;
  usuariosProcessados: number;
  erros: Array<{ treinoId: string; userId: string; erro: string }>;
}

async function refatorarTreinosNaoRealizados() {
  console.log('🚀 Iniciando refatoração de treinos não realizados...\n');

  const estatisticas: Estatisticas = {
    totalTreinos: 0,
    treinosRefatorados: 0,
    treinosComErro: 0,
    usuariosProcessados: 0,
    erros: []
  };

  try {
    // Buscar todos os treinos não concluídos criados pela IA
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const treinosNaoRealizados = await prisma.treino.findMany({
      where: {
        concluido: false,
        criadoPor: 'IA',
        data: { gte: hoje } // Apenas treinos futuros ou de hoje
      },
      include: {
        user: {
          include: {
            perfil: true
          }
        },
        exercicios: {
          include: {
            exercicio: true
          }
        }
      },
      orderBy: {
        data: 'asc'
      }
    });

    estatisticas.totalTreinos = treinosNaoRealizados.length;
    console.log(`📊 Encontrados ${estatisticas.totalTreinos} treinos não realizados para refatorar\n`);

    if (estatisticas.totalTreinos === 0) {
      console.log('✅ Nenhum treino para refatorar. Finalizando...');
      return;
    }

    // Agrupar treinos por usuário para otimizar
    const treinosPorUsuario = new Map<string, typeof treinosNaoRealizados>();
    
    for (const treino of treinosNaoRealizados) {
      const userId = treino.userId;
      if (!treinosPorUsuario.has(userId)) {
        treinosPorUsuario.set(userId, []);
      }
      treinosPorUsuario.get(userId)!.push(treino);
    }

    console.log(`👥 Processando ${treinosPorUsuario.size} usuário(s) único(s)\n`);

    // Processar cada usuário
    for (const [userId, treinos] of treinosPorUsuario.entries()) {
      try {
        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`👤 Processando usuário: ${userId}`);
        console.log(`   Treinos para refatorar: ${treinos.length}`);

        const user = treinos[0].user;
        const perfil = user.perfil;

        if (!perfil) {
          console.log(`   ⚠️  Usuário sem perfil. Pulando...`);
          estatisticas.treinosComErro += treinos.length;
          treinos.forEach(t => {
            estatisticas.erros.push({
              treinoId: t.id,
              userId: userId,
              erro: 'Usuário sem perfil'
            });
          });
          continue;
        }

        // Validar dados mínimos do perfil
        if (!perfil.experiencia || !perfil.objetivo || !perfil.frequenciaSemanal) {
          console.log(`   ⚠️  Perfil incompleto. Pulando...`);
          estatisticas.treinosComErro += treinos.length;
          treinos.forEach(t => {
            estatisticas.erros.push({
              treinoId: t.id,
              userId: userId,
              erro: 'Perfil incompleto (falta experiência, objetivo ou frequência)'
            });
          });
          continue;
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

        console.log(`   ✅ Perfil válido - Objetivo: ${perfil.objetivo}, Experiência: ${perfil.experiencia}, Frequência: ${perfil.frequenciaSemanal}x/semana`);

        // Deletar treinos antigos não realizados deste usuário
        const treinosDeletados = await prisma.treino.deleteMany({
          where: {
            userId: userId,
            criadoPor: 'IA',
            concluido: false,
            data: { gte: hoje }
          }
        });

        console.log(`   🗑️  ${treinosDeletados.count} treino(s) antigo(s) deletado(s)`);

        // Regenerar treinos usando a função centralizada
        console.log(`   🔄 Regenerando treinos com novos exercícios...`);
        await regenerarTreinos30Dias(userId, perfilCompleto);

        // Buscar treinos regenerados para confirmar
        const treinosRegenerados = await prisma.treino.findMany({
          where: {
            userId: userId,
            criadoPor: 'IA',
            concluido: false,
            data: { gte: hoje }
          },
          include: {
            exercicios: {
              include: {
                exercicio: true
              }
            }
          }
        });

        const totalExercicios = treinosRegenerados.reduce((sum, t) => sum + t.exercicios.length, 0);
        console.log(`   ✅ ${treinosRegenerados.length} treino(s) regenerado(s) com ${totalExercicios} exercício(s) total`);

        estatisticas.treinosRefatorados += treinosRegenerados.length;
        estatisticas.usuariosProcessados++;

      } catch (error: any) {
        console.error(`   ❌ Erro ao processar usuário ${userId}:`, error.message);
        estatisticas.treinosComErro += treinos.length;
        treinos.forEach(t => {
          estatisticas.erros.push({
            treinoId: t.id,
            userId: userId,
            erro: error.message || 'Erro desconhecido'
          });
        });
      }
    }

    // Exibir estatísticas finais
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ESTATÍSTICAS FINAIS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total de treinos encontrados: ${estatisticas.totalTreinos}`);
    console.log(`Usuários processados: ${estatisticas.usuariosProcessados}`);
    console.log(`Treinos refatorados com sucesso: ${estatisticas.treinosRefatorados}`);
    console.log(`Treinos com erro: ${estatisticas.treinosComErro}`);

    if (estatisticas.erros.length > 0) {
      console.log('\n❌ ERROS ENCONTRADOS:');
      estatisticas.erros.forEach((erro, index) => {
        console.log(`   ${index + 1}. Treino ${erro.treinoId} (User: ${erro.userId}): ${erro.erro}`);
      });
    }

    console.log('\n✅ Refatoração concluída!');

  } catch (error: any) {
    console.error('\n❌ Erro fatal durante refatoração:', error);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar script
if (require.main === module) {
  refatorarTreinosNaoRealizados()
    .then(() => {
      console.log('\n🎉 Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Erro ao executar script:', error);
      process.exit(1);
    });
}

export { refatorarTreinosNaoRealizados };

