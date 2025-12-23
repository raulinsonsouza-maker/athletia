/**
 * Script para marcar exercícios existentes como "sem equipamento"
 * 
 * Busca todos os exercícios ativos e marca como semEquipamento = true
 * se equipamentoNecessario estiver vazio ou contiver apenas "Peso Corporal"
 */

import { prisma } from '../lib/prisma';

/**
 * Verifica se um exercício deve ser marcado como sem equipamento
 */
function deveSerSemEquipamento(equipamentos: string[]): boolean {
  if (equipamentos.length === 0) {
    return true; // Sem equipamentos listados = peso corporal
  }
  
  // Verificar se TODOS os equipamentos são apenas peso corporal
  const todosPesoCorporal = equipamentos.every((eq: string) => {
    const eqLower = eq.toLowerCase().trim();
    return eqLower === '' ||
           eqLower.includes('peso corporal') ||
           eqLower.includes('corpo') ||
           eqLower === 'nenhum' ||
           eqLower === 'peso do corpo';
  });
  
  return todosPesoCorporal;
}

/**
 * Marca exercícios como sem equipamento baseado em equipamentoNecessario
 */
async function marcarExerciciosSemEquipamento() {
  console.log('[MIGRAÇÃO] Iniciando marcação de exercícios sem equipamento...');
  const inicio = Date.now();
  
  try {
    // Buscar todos os exercícios ativos
    // Nota: não selecionamos semEquipamento aqui porque pode não existir ainda no banco
    // Vamos verificar se o campo existe antes de tentar atualizá-lo
    const exercicios = await prisma.exercicio.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        equipamentoNecessario: true
      }
    });
    
    console.log(`[MIGRAÇÃO] Total de exercícios ativos encontrados: ${exercicios.length}`);
    
    let processados = 0;
    let marcados = 0;
    let jaMarcados = 0;
    let naoMarcados = 0;
    const erros: Array<{ id: string; nome: string; erro: string }> = [];
    
    // Verificar se o campo semEquipamento existe no banco
    let campoExiste = false;
    try {
      // Tentar fazer uma query que inclui semEquipamento para verificar se existe
      await prisma.$queryRaw`SELECT sem_equipamento FROM exercicios LIMIT 1`;
      campoExiste = true;
      console.log('[MIGRAÇÃO] Campo semEquipamento encontrado no banco de dados');
    } catch (error: any) {
      console.log('[MIGRAÇÃO] Campo semEquipamento ainda não existe no banco. Apenas verificando quais exercícios devem ser marcados.');
      console.log('[MIGRAÇÃO] Execute a migration primeiro: npx prisma migrate dev --name add_sem_equipamento');
    }
    
    for (const exercicio of exercicios) {
      try {
        processados++;
        
        // Verificar se deve ser marcado como sem equipamento
        const equipamentos = exercicio.equipamentoNecessario || [];
        const deveMarcar = deveSerSemEquipamento(equipamentos);
        
        if (deveMarcar) {
          if (campoExiste) {
            // Verificar se já está marcado (só se o campo existe)
            try {
              const exercicioCompleto = await prisma.exercicio.findUnique({
                where: { id: exercicio.id },
                select: { semEquipamento: true }
              });
              
              if (exercicioCompleto?.semEquipamento === true) {
                jaMarcados++;
                continue;
              }
            } catch (error) {
              // Ignorar erro se campo não existe
            }
            
            // Atualizar apenas se o campo existe
            await prisma.exercicio.update({
              where: { id: exercicio.id },
              data: { semEquipamento: true }
            });
            marcados++;
            console.log(`[MIGRAÇÃO] ✓ Marcado: ${exercicio.nome} (equipamentos: ${equipamentos.length === 0 ? 'nenhum' : equipamentos.join(', ')})`);
          } else {
            // Se campo não existe, apenas logar que seria marcado
            marcados++;
            console.log(`[MIGRAÇÃO] [SIMULAÇÃO] Seria marcado: ${exercicio.nome} (equipamentos: ${equipamentos.length === 0 ? 'nenhum' : equipamentos.join(', ')})`);
          }
        } else {
          naoMarcados++;
        }
      } catch (error: any) {
        const erroMsg = error.message || 'Erro desconhecido';
        erros.push({ id: exercicio.id, nome: exercicio.nome, erro: erroMsg });
        console.error(`[MIGRAÇÃO] ✗ Erro ao processar ${exercicio.nome}:`, erroMsg);
      }
    }
    
    const tempoTotal = ((Date.now() - inicio) / 1000).toFixed(2);
    
    console.log('\n[MIGRAÇÃO] Migração concluída:');
    console.log(`  - Total processado: ${processados}`);
    if (campoExiste) {
      console.log(`  - Marcados como sem equipamento: ${marcados}`);
      console.log(`  - Já estavam marcados: ${jaMarcados}`);
    } else {
      console.log(`  - Exercícios que SERÃO marcados (após migration): ${marcados}`);
      console.log(`  - ⚠️  Execute a migration primeiro para aplicar as mudanças!`);
    }
    console.log(`  - Não marcados (têm equipamentos): ${naoMarcados}`);
    console.log(`  - Erros: ${erros.length}`);
    console.log(`  - Tempo total: ${tempoTotal}s`);
    
    if (erros.length > 0) {
      console.log('\n[MIGRAÇÃO] Erros detalhados:');
      erros.forEach(({ nome, erro }) => {
        console.log(`  - ${nome}: ${erro}`);
      });
    }
    
    return {
      processados,
      marcados,
      jaMarcados,
      naoMarcados,
      erros
    };
  } catch (error: any) {
    console.error('[MIGRAÇÃO] Erro fatal durante migração:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  marcarExerciciosSemEquipamento()
    .then(() => {
      console.log('\n✅ Migração executada com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migração falhou:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

export { marcarExerciciosSemEquipamento };

