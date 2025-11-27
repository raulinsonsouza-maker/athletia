/**
 * Script de Migração: Regenerar todos os treinos usando o motor centralizado
 * 
 * Este script aplica o novo motor centralizado (treino-engine.service.ts) em todos os
 * treinos existentes na base de dados, incluindo clientes já ativos.
 * 
 * Opções:
 * - Regenerar apenas treinos futuros (não concluídos)
 * - Regenerar todos os treinos IA (incluindo concluídos)
 * - Regenerar treinos das próximas 4 semanas
 * 
 * USO:
 *   npm run migrar-treinos
 *   ou
 *   tsx scripts/migrar-treinos-motor-centralizado.ts
 */

import { PrismaClient } from '@prisma/client';
import { garantirPlanoSemanal } from '../src/services/treino-engine.service';

const prisma = new PrismaClient();

interface OpcoesMigracao {
  apenasFuturos?: boolean; // Apenas treinos futuros (não concluídos)
  incluirConcluidos?: boolean; // Incluir treinos já concluídos
  semanas?: number; // Quantas semanas regenerar (padrão: 4)
  userId?: string; // Migrar apenas um usuário específico (opcional)
}

async function migrarTreinosParaMotorCentralizado(opcoes: OpcoesMigracao = {}) {
  const {
    apenasFuturos = true,
    incluirConcluidos = false,
    semanas = 4,
    userId: userIdEspecifico
  } = opcoes;

  console.log('\n🔄 ============================================');
  console.log('🔄 MIGRAÇÃO: Regenerar Treinos com Motor Centralizado');
  console.log('🔄 ============================================\n');

  console.log(`📋 Configurações:`);
  console.log(`   - Apenas futuros: ${apenasFuturos ? 'Sim' : 'Não'}`);
  console.log(`   - Incluir concluídos: ${incluirConcluidos ? 'Sim' : 'Não'}`);
  console.log(`   - Semanas: ${semanas}`);
  console.log(`   - Usuário específico: ${userIdEspecifico || 'Todos'}\n`);

  try {
    // Buscar usuários com perfil completo
    const whereClause: any = {
      perfil: {
        objetivo: { not: null },
        experiencia: { not: null },
        frequenciaSemanal: { not: null }
      }
    };

    if (userIdEspecifico) {
      whereClause.id = userIdEspecifico;
    }

    const usuarios = await prisma.user.findMany({
      where: whereClause,
      include: {
        perfil: true
      }
    });

    console.log(`📊 Encontrados ${usuarios.length} usuários com perfil completo\n`);

    if (usuarios.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado com perfil completo.');
      return;
    }

    let totalTreinosRegenerados = 0;
    let totalUsuariosProcessados = 0;
    let totalErros = 0;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Calcular data limite (semanas futuras)
    const dataLimite = new Date(hoje);
    dataLimite.setDate(dataLimite.getDate() + (semanas * 7));

    for (const usuario of usuarios) {
      try {
        console.log(`\n👤 Processando usuário: ${usuario.email || usuario.id}`);
        console.log(`   Frequência: ${usuario.perfil?.frequenciaSemanal || 'N/A'} dias/semana`);
        console.log(`   Objetivo: ${usuario.perfil?.objetivo || 'N/A'}`);

        // Se apenas futuros, deletar treinos IA futuros antes de regenerar
        if (apenasFuturos) {
          const whereDelete: any = {
            userId: usuario.id,
            criadoPor: 'IA',
            data: { gte: hoje }
          };

          if (!incluirConcluidos) {
            whereDelete.concluido = false;
          }

          const treinosDeletados = await prisma.treino.deleteMany({
            where: whereDelete
          });

          console.log(`   🗑️  Removidos ${treinosDeletados.count} treinos antigos`);
        } else {
          // Deletar todos os treinos IA (futuros e passados)
          const whereDelete: any = {
            userId: usuario.id,
            criadoPor: 'IA',
            data: { gte: hoje, lte: dataLimite }
          };

          if (!incluirConcluidos) {
            whereDelete.concluido = false;
          }

          const treinosDeletados = await prisma.treino.deleteMany({
            where: whereDelete
          });

          console.log(`   🗑️  Removidos ${treinosDeletados.count} treinos antigos`);
        }

        // Regenerar treinos semana por semana usando motor centralizado
        let treinosGeradosUsuario = 0;

        for (let semana = 0; semana < semanas; semana++) {
          const dataReferencia = new Date(hoje);
          dataReferencia.setDate(hoje.getDate() + (semana * 7));

          try {
            const treinosSemana = await garantirPlanoSemanal({
              userId: usuario.id,
              dataReferencia,
              forcarRegeneracao: true // Forçar regeneração mesmo se já existir
            });

            treinosGeradosUsuario += treinosSemana.length;
            console.log(`   ✅ Semana ${semana + 1}/${semanas}: ${treinosSemana.length} treinos gerados`);
          } catch (error: any) {
            console.error(`   ❌ Erro na semana ${semana + 1}: ${error.message}`);
            totalErros++;
          }
        }

        totalTreinosRegenerados += treinosGeradosUsuario;
        totalUsuariosProcessados++;

        console.log(`   ✅ Total: ${treinosGeradosUsuario} treinos regenerados para este usuário`);

      } catch (error: any) {
        console.error(`\n❌ Erro ao processar usuário ${usuario.email || usuario.id}:`);
        console.error(`   ${error.message}`);
        totalErros++;
        continue;
      }
    }

    console.log('\n📊 ============================================');
    console.log('📊 RESUMO DA MIGRAÇÃO');
    console.log('📊 ============================================');
    console.log(`✅ Usuários processados: ${totalUsuariosProcessados}/${usuarios.length}`);
    console.log(`✅ Treinos regenerados: ${totalTreinosRegenerados}`);
    console.log(`❌ Erros encontrados: ${totalErros}`);
    console.log('📊 ============================================\n');

    if (totalErros > 0) {
      console.log('⚠️  Alguns erros ocorreram durante a migração. Verifique os logs acima.');
    } else {
      console.log('✅ Migração concluída com sucesso!');
    }

  } catch (error: any) {
    console.error('\n❌ Erro fatal na migração:');
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração
async function main() {
  const args = process.argv.slice(2);
  
  // Parse argumentos
  const opcoes: OpcoesMigracao = {
    apenasFuturos: !args.includes('--todos'),
    incluirConcluidos: args.includes('--incluir-concluidos'),
    semanas: parseInt(args.find(arg => arg.startsWith('--semanas='))?.split('=')[1] || '4'),
  };

  // Se passar userId como argumento
  const userIdArg = args.find(arg => arg.startsWith('--userId='));
  if (userIdArg) {
    opcoes.userId = userIdArg.split('=')[1];
  }

  await migrarTreinosParaMotorCentralizado(opcoes);
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Script finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro ao executar script:', error);
      process.exit(1);
    });
}

export { migrarTreinosParaMotorCentralizado };

