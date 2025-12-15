/**
 * Script CLI para regenerar todos os treinos usando a lógica canônica
 * 
 * Uso:
 *   npm run regenerate-workouts [userId?]
 * 
 * Se userId for fornecido, regenera apenas para aquele usuário
 * Se não for fornecido, regenera para todos os usuários ativos
 */

import { regenerarTodosTreinosCanonico } from '../services/treino-regeneration.service';

async function main() {
  const args = process.argv.slice(2);
  const userId = args[0]; // Primeiro argumento opcional

  console.log('========================================');
  console.log('Regeneração de Treinos - Lógica Canônica');
  console.log('========================================\n');

  if (userId) {
    console.log(`Regenerando treinos para usuário: ${userId}`);
  } else {
    console.log('Regenerando treinos para TODOS os usuários ativos');
  }

  console.log('');

  try {
    await regenerarTodosTreinosCanonico(userId);
    console.log('\n✅ Regeneração concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro durante regeneração:', error);
    process.exit(1);
  }
}

// Executar apenas se for chamado diretamente
if (require.main === module) {
  main();
}
