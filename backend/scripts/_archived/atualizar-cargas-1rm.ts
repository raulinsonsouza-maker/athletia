import { PrismaClient } from '@prisma/client';
import { ajustarCargaParaPercentual1RMIdeal } from '../src/services/progression.service';

const prisma = new PrismaClient();

/**
 * Script para atualizar cargas de todos os exercícios de todos os usuários
 * Aplica cálculo de %1RM baseado no objetivo do usuário
 */
async function atualizarCargas1RM() {
  console.log('🔄 Iniciando atualização de cargas baseadas em %1RM para todos os usuários...\n');

  try {
    // Buscar todos os usuários com perfil
    const usuarios = await prisma.user.findMany({
      include: {
        perfil: true
      },
      where: {
        perfil: {
          isNot: null
        }
      }
    });

    console.log(`📊 Encontrados ${usuarios.length} usuários com perfil\n`);

    let totalAtualizados = 0;
    let totalMantidos = 0;
    let totalErros = 0;
    let totalExercicios = 0;

    for (const usuario of usuarios) {
      console.log(`\n👤 Processando usuário: ${usuario.nome || usuario.email} (${usuario.id})`);

      if (!usuario.perfil) {
        console.log('  ⏭️ Usuário sem perfil, pulando...');
        continue;
      }

      const objetivo = usuario.perfil.objetivo || 'Hipertrofia';
      const experiencia = usuario.perfil.experiencia || 'Iniciante';
      const pesoUsuario = usuario.perfil.pesoAtual || 70;

      console.log(`  📋 Objetivo: ${objetivo}, Experiência: ${experiencia}, Peso: ${pesoUsuario}kg`);

      // Buscar todos os treinos do usuário (não concluídos ou futuros)
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const treinos = await prisma.treino.findMany({
        where: {
          userId: usuario.id,
          data: {
            gte: hoje // Apenas treinos futuros ou de hoje
          }
        },
        include: {
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

      console.log(`  📅 Treinos futuros/hoje: ${treinos.length}`);

      if (treinos.length === 0) {
        console.log('  ⏭️ Nenhum treino futuro para atualizar');
        continue;
      }

      // Processar cada treino
      for (const treino of treinos) {
        const exerciciosForca = treino.exercicios.filter(ex => {
          const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
          return grupo !== 'Cardio' && grupo !== 'Flexibilidade';
        });

        console.log(`  🏋️ Treino ${treino.tipo} (${new Date(treino.data).toLocaleDateString('pt-BR')}): ${exerciciosForca.length} exercícios de força`);

        for (const exercicioTreino of exerciciosForca) {
          totalExercicios++;

          // Pular se não tem carga ou se é peso corporal
          if (!exercicioTreino.carga || exercicioTreino.carga <= 0) {
            continue;
          }

          const equipamentos = exercicioTreino.exercicio?.equipamentoNecessario || [];
          const isPesoCorporal = equipamentos.some((eq: string) => 
            eq.toLowerCase().includes('peso corporal') || 
            eq.toLowerCase().includes('corpo')
          );

          if (isPesoCorporal) {
            continue;
          }

          try {
            // Calcular nova carga baseada em %1RM
            const repeticoes = exercicioTreino.repeticoes || '8-12';
            const cargaAtual = exercicioTreino.carga;

            // Estimar 1RM e ajustar para faixa ideal
            const cargaAjustada = ajustarCargaParaPercentual1RMIdeal(
              cargaAtual,
              repeticoes,
              objetivo,
              equipamentos
            );

            // Se a carga mudou (qualquer diferença), atualizar para garantir consistência
            const diferenca = Math.abs(cargaAjustada - cargaAtual);
            if (diferenca > 0.1) { // Atualizar se diferença > 0.1kg
              await prisma.exercicioTreino.update({
                where: { id: exercicioTreino.id },
                data: { carga: cargaAjustada }
              });

              totalAtualizados++;
              console.log(`    ✅ ${exercicioTreino.exercicio?.nome}: ${cargaAtual}kg → ${cargaAjustada}kg (${diferenca > 0 ? '+' : ''}${(cargaAjustada - cargaAtual).toFixed(1)}kg)`);
            } else {
              totalMantidos++;
            }
          } catch (error: any) {
            totalErros++;
            console.error(`    ❌ Erro ao atualizar ${exercicioTreino.exercicio?.nome}:`, error.message);
          }
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA ATUALIZAÇÃO');
    console.log('='.repeat(60));
    console.log(`✅ Exercícios atualizados: ${totalAtualizados}`);
    console.log(`⏭️ Exercícios mantidos: ${totalMantidos}`);
    console.log(`❌ Erros: ${totalErros}`);
    console.log(`📦 Total de exercícios processados: ${totalExercicios}`);
    console.log('='.repeat(60) + '\n');

  } catch (error: any) {
    console.error('❌ Erro ao atualizar cargas:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar script
atualizarCargas1RM()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

