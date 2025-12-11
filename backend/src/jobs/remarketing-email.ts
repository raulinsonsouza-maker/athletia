/**
 * Job de Remarketing por E-mail
 * 
 * Executa periodicamente para enviar e-mails de remarketing para usuários
 * que completaram o onboarding mas não finalizaram o pagamento.
 * 
 * E-mails enviados:
 * - 10 minutos após cadastro
 * - 24 horas após cadastro
 * - 48 horas após cadastro
 */

import { processarFilaRemarketing } from '../services/remarketing.service';

/**
 * Executa o job de remarketing
 */
export async function executarJobRemarketing() {
  console.log('[JOB REMARKETING] Iniciando execução do job de remarketing...');
  const inicio = Date.now();

  try {
    const resultado = await processarFilaRemarketing();

    const tempoTotal = ((Date.now() - inicio) / 1000).toFixed(2);

    console.log('\n[JOB REMARKETING] Job concluído:');
    console.log(`  - E-mails enviados: ${resultado.enviados}`);
    console.log(`  - Erros: ${resultado.erros}`);
    console.log(`  - Tempo total: ${tempoTotal}s`);

    if (resultado.detalhes.length > 0) {
      console.log('\n[JOB REMARKETING] Detalhes por tipo:');
      resultado.detalhes.forEach(({ tipo, enviados, erros }) => {
        console.log(`  - ${tipo}: ${enviados} enviados, ${erros} erros`);
      });
    }

    return resultado;
  } catch (error: any) {
    console.error('[JOB REMARKETING] Erro fatal durante execução do job:', error);
    console.error('[JOB REMARKETING] Stack:', error.stack);
    throw error;
  }
}

// Executar se chamado diretamente (para testes)
if (require.main === module) {
  executarJobRemarketing()
    .then(() => {
      console.log('[JOB REMARKETING] Job executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[JOB REMARKETING] Job falhou:', error);
      process.exit(1);
    })
    .finally(() => {
      // Prisma Client não precisa desconectar explicitamente em jobs
      // mas podemos fazer se necessário
      process.exit(0);
    });
}

