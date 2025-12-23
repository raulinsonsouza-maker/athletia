/**
 * Script para refatorar nomes de treinos não concluídos
 * 
 * Atualiza nomes de todos os treinos com concluido: false para o novo formato:
 * - Treinos IA: "Treino A", "Treino B", etc. (sem grupos no nome)
 * - Treinos Personalizados: "Personalizado - [Grupo1] e [Grupo2]" (mantém formato)
 * - Treinos Rápidos: "Treino Rápido" (sem grupos no nome)
 * 
 * IMPORTANTE: Não modifica treinos concluídos (concluido: true)
 */

import { prisma } from '../lib/prisma';
import { extrairGruposMuscularesDeTreino } from '../services/treino-core.service';
import { gerarNomeTreinoPersonalizado } from '../services/treino-personalizado.service';
import { LETRAS_TREINO } from '../services/split-generator.service';

/**
 * Gera nome de treino IA baseado na letra
 */
function gerarNomeTreinoIA(letraTreino: string | null, indiceDia?: number): string {
  if (letraTreino && LETRAS_TREINO.includes(letraTreino)) {
    return `Treino ${letraTreino}`;
  }
  
  // Se não tem letra, calcular baseado no índice do dia
  if (indiceDia !== undefined) {
    const letra = LETRAS_TREINO[indiceDia % LETRAS_TREINO.length];
    return `Treino ${letra}`;
  }
  
  // Fallback: usar primeira letra
  return `Treino ${LETRAS_TREINO[0]}`;
}

/**
 * Gera nome de treino rápido
 */
function gerarNomeTreinoRapido(): string {
  return 'Treino Rápido';
}

/**
 * Refatora nomes de todos os treinos não concluídos
 */
async function refatorarNomesTreinosNaoConcluidos() {
  console.log('[REFATORAÇÃO] Iniciando refatoração de nomes de treinos não concluídos...');
  const inicio = Date.now();
  
  try {
    // Buscar todos os treinos não concluídos
    const treinos = await prisma.treino.findMany({
      where: {
        concluido: false
      },
      include: {
        exercicios: {
          include: {
            exercicio: true
          },
          orderBy: {
            ordem: 'asc'
          }
        },
        user: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        data: 'asc'
      }
    });
    
    console.log(`[REFATORAÇÃO] Total de treinos não concluídos encontrados: ${treinos.length}\n`);
    
    let processados = 0;
    let atualizados = 0;
    let mantidos = 0;
    let ignorados = 0;
    const erros: Array<{ id: string; nome: string; erro: string }> = [];
    
    for (const treino of treinos) {
      try {
        processados++;
        
        // Verificar se tem exercícios
        if (!treino.exercicios || treino.exercicios.length === 0) {
          console.log(`[REFATORAÇÃO] ⚠️  Treino ${treino.id} ignorado: sem exercícios`);
          ignorados++;
          continue;
        }
        
        // Extrair grupos musculares reais dos exercícios
        const gruposReais = extrairGruposMuscularesDeTreino(treino);
        
        // Gerar novo nome baseado no tipo de treino
        let novoNome: string;
        
        if (treino.criadoPor === 'USUARIO') {
          // Treino personalizado - manter formato com grupos
          novoNome = gerarNomeTreinoPersonalizado(gruposReais);
        } else if (treino.criadoPor === 'RAPIDO' || treino.nome?.includes('Rápido') || treino.nome?.includes('Rapido')) {
          // Treino rápido - simplificar para apenas "Treino Rápido"
          novoNome = gerarNomeTreinoRapido();
        } else if (treino.criadoPor === 'IA') {
          // Treino IA - usar letra do treino ou calcular
          if (treino.letraTreino) {
            novoNome = gerarNomeTreinoIA(treino.letraTreino);
          } else {
            // Calcular índice do dia baseado na data
            const diaSemana = treino.data.getDay();
            const indiceDia = diaSemana === 0 ? 6 : diaSemana - 1;
            novoNome = gerarNomeTreinoIA(null, indiceDia);
          }
        } else {
          // Tipo não identificado - manter nome atual
          console.log(`[REFATORAÇÃO] ⚠️  Treino ${treino.id} ignorado: tipo não identificado (criadoPor: ${treino.criadoPor})`);
          ignorados++;
          continue;
        }
        
        // Atualizar apenas se o nome mudou
        if (novoNome !== treino.nome) {
          await prisma.treino.update({
            where: { id: treino.id },
            data: { nome: novoNome }
          });
          
          atualizados++;
          console.log(`[REFATORAÇÃO] ✅ ${treino.id}: "${treino.nome}" → "${novoNome}"`);
        } else {
          mantidos++;
          if (processados % 50 === 0) {
            console.log(`[REFATORAÇÃO] ⏭️  ${treino.id}: já está atualizado ("${treino.nome}")`);
          }
        }
      } catch (error: any) {
        const erroMsg = error.message || 'Erro desconhecido';
        erros.push({ id: treino.id, nome: treino.nome, erro: erroMsg });
        console.error(`[REFATORAÇÃO] ❌ Erro ao processar treino ${treino.id}:`, erroMsg);
      }
    }
    
    const tempoTotal = ((Date.now() - inicio) / 1000).toFixed(2);
    
    console.log('\n[REFATORAÇÃO] Refatoração concluída:');
    console.log(`  - Total processado: ${processados}`);
    console.log(`  - Atualizados: ${atualizados}`);
    console.log(`  - Mantidos (já estavam corretos): ${mantidos}`);
    console.log(`  - Ignorados (sem exercícios/tipo inválido): ${ignorados}`);
    console.log(`  - Erros: ${erros.length}`);
    console.log(`  - Tempo total: ${tempoTotal}s`);
    
    if (erros.length > 0) {
      console.log('\n[REFATORAÇÃO] Erros detalhados:');
      erros.slice(0, 10).forEach(({ id, nome, erro }) => {
        console.log(`  - ${id} (${nome}): ${erro}`);
      });
      if (erros.length > 10) {
        console.log(`  ... e mais ${erros.length - 10} erros`);
      }
    }
    
    return {
      processados,
      atualizados,
      mantidos,
      ignorados,
      erros
    };
  } catch (error: any) {
    console.error('[REFATORAÇÃO] Erro fatal durante refatoração:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  refatorarNomesTreinosNaoConcluidos()
    .then(() => {
      console.log('\n✅ Refatoração executada com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Refatoração falhou:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

export { refatorarNomesTreinosNaoConcluidos };

