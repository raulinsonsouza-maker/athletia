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
    const exercicios = await prisma.exercicio.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        equipamentoNecessario: true,
        semEquipamento: true
      }
    });
    
    console.log(`[MIGRAÇÃO] Total de exercícios ativos encontrados: ${exercicios.length}`);
    
    let processados = 0;
    let marcados = 0;
    let jaMarcados = 0;
    let naoMarcados = 0;
    const erros: Array<{ id: string; nome: string; erro: string }> = [];
    
    for (const exercicio of exercicios) {
      try {
        processados++;
        
        // Se já está marcado como sem equipamento, pular
        if (exercicio.semEquipamento === true) {
          jaMarcados++;
          continue;
        }
        
        // Verificar se deve ser marcado como sem equipamento
        const equipamentos = exercicio.equipamentoNecessario || [];
        const deveMarcar = deveSerSemEquipamento(equipamentos);
        
        if (deveMarcar) {
          await prisma.exercicio.update({
            where: { id: exercicio.id },
            data: { semEquipamento: true }
          });
          marcados++;
          console.log(`[MIGRAÇÃO] ✓ Marcado: ${exercicio.nome} (equipamentos: ${equipamentos.length === 0 ? 'nenhum' : equipamentos.join(', ')})`);
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
    console.log(`  - Marcados como sem equipamento: ${marcados}`);
    console.log(`  - Já estavam marcados: ${jaMarcados}`);
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

