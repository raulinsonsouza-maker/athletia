/**
 * Script de migração para refatorar nomes dos treinos existentes
 * 
 * Atualiza nomes dos treinos futuros (não concluídos) para seguir o novo padrão:
 * - Treinos IA: "Treino [Letra] - [Grupo1] e [Grupo2]"
 * - Treinos Personalizados: "Personalizado - [Grupo1] e [Grupo2]"
 * - Treinos Rápidos: "Treino Rápido - [Grupo1], [Grupo2] e mais"
 */

import { prisma } from '../lib/prisma';
import { extrairGruposMuscularesDeTreino } from '../services/treino-core.service';
import { gerarNomeTreinoPersonalizado } from '../services/treino-personalizado.service';
import { LETRAS_TREINO, NOMES_SPLITS } from '../services/split-generator.service';

/**
 * Gera nome de treino IA baseado em grupos musculares
 */
function gerarNomeTreinoIA(
  frequencia: number,
  indiceDia: number,
  gruposMusculares: string[]
): string {
  const letra = LETRAS_TREINO[indiceDia % LETRAS_TREINO.length];
  
  if (gruposMusculares && gruposMusculares.length > 0) {
    const gruposForca = gruposMusculares.filter(g => 
      !['Cardio', 'Alongamento', 'Flexibilidade'].includes(g)
    );
    
    if (gruposForca.length > 0) {
      const gruposPrincipais = gruposForca.slice(0, 3);
      
      if (gruposPrincipais.length === 1) {
        return `Treino ${letra} - ${gruposPrincipais[0]}`;
      } else if (gruposPrincipais.length === 2) {
        return `Treino ${letra} - ${gruposPrincipais[0]} e ${gruposPrincipais[1]}`;
      } else {
        return `Treino ${letra} - ${gruposPrincipais[0]}, ${gruposPrincipais[1]} e mais`;
      }
    }
  }
  
  // Fallback: usar nome padrão do split
  const nomeBase = NOMES_SPLITS[frequencia]?.[indiceDia % frequencia];
  if (nomeBase) {
    return `Treino ${letra} - ${nomeBase}`;
  }
  
  return `Treino ${letra}`;
}

/**
 * Gera nome de treino rápido baseado em grupos musculares
 */
function gerarNomeTreinoRapido(gruposMusculares: string[]): string {
  if (!gruposMusculares || gruposMusculares.length === 0) {
    return 'Treino Rápido';
  }
  
  const gruposForca = gruposMusculares.filter(g => 
    !['Cardio', 'Alongamento', 'Flexibilidade'].includes(g)
  );
  
  if (gruposForca.length === 0) {
    return 'Treino Rápido';
  }
  
  const gruposPrincipais = gruposForca.slice(0, 3);
  
  if (gruposPrincipais.length === 1) {
    return `Treino Rápido - ${gruposPrincipais[0]}`;
  } else if (gruposPrincipais.length === 2) {
    return `Treino Rápido - ${gruposPrincipais[0]} e ${gruposPrincipais[1]}`;
  } else {
    return `Treino Rápido - ${gruposPrincipais[0]}, ${gruposPrincipais[1]} e mais`;
  }
}

async function refatorarNomesTreinos() {
  console.log('🔄 Iniciando refatoração de nomes de treinos...\n');
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  // Buscar treinos futuros não concluídos que precisam ser atualizados
  const treinos = await prisma.treino.findMany({
    where: {
      data: {
        gte: hoje
      },
      concluido: false,
      exercicios: {
        some: {}
      }
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
  
  console.log(`📊 Encontrados ${treinos.length} treinos para refatorar\n`);
  
  let atualizados = 0;
  let ignorados = 0;
  let erros = 0;
  
  for (const treino of treinos) {
    try {
      // Extrair grupos musculares reais dos exercícios
      const gruposReais = extrairGruposMuscularesDeTreino(treino);
      
      // Validar que tem grupos válidos
      if (gruposReais.length === 0) {
        console.log(`⚠️  Treino ${treino.id} ignorado: sem grupos musculares válidos`);
        ignorados++;
        continue;
      }
      
      // Gerar novo nome baseado no tipo de treino
      let novoNome: string;
      
      if (treino.criadoPor === 'USUARIO') {
        // Treino personalizado
        novoNome = gerarNomeTreinoPersonalizado(gruposReais);
      } else if (treino.tipo?.includes('Rápido') || treino.nome?.includes('Rápido')) {
        // Treino rápido
        novoNome = gerarNomeTreinoRapido(gruposReais);
      } else {
        // Treino IA - precisa determinar frequência e índice do dia
        // Buscar perfil do usuário para obter frequência semanal
        const perfil = await prisma.perfil.findUnique({
          where: { userId: treino.userId },
          select: { frequenciaSemanal: true }
        });
        const frequencia = perfil?.frequenciaSemanal || 3;
        
        // Determinar índice do dia baseado na letra do treino ou calcular
        let indiceDia = 0;
        if (treino.letraTreino) {
          const letraIndex = LETRAS_TREINO.indexOf(treino.letraTreino);
          if (letraIndex !== -1) {
            indiceDia = letraIndex;
          } else {
            // Calcular índice baseado na data
            const diaSemana = treino.data.getDay();
            indiceDia = diaSemana === 0 ? 6 : diaSemana - 1;
          }
        } else {
          // Calcular índice baseado na data
          const diaSemana = treino.data.getDay();
          indiceDia = diaSemana === 0 ? 6 : diaSemana - 1;
        }
        
        novoNome = gerarNomeTreinoIA(frequencia, indiceDia, gruposReais);
      }
      
      // Atualizar apenas se o nome mudou
      if (novoNome !== treino.nome) {
        await prisma.treino.update({
          where: { id: treino.id },
          data: { 
            nome: novoNome,
            tipo: treino.criadoPor === 'IA' ? novoNome : treino.tipo
          }
        });
        
        console.log(`✅ ${treino.id}: "${treino.nome}" → "${novoNome}" (${gruposReais.join(', ')})`);
        atualizados++;
      } else {
        console.log(`⏭️  ${treino.id}: já está atualizado ("${treino.nome}")`);
        ignorados++;
      }
    } catch (error: any) {
      console.error(`❌ Erro ao processar treino ${treino.id}:`, error.message);
      erros++;
    }
  }
  
  console.log('\n📈 Estatísticas:');
  console.log(`   ✅ Atualizados: ${atualizados}`);
  console.log(`   ⏭️  Ignorados: ${ignorados}`);
  console.log(`   ❌ Erros: ${erros}`);
  console.log(`   📊 Total processado: ${treinos.length}`);
  
  console.log('\n✨ Refatoração concluída!');
}

// Executar script
refatorarNomesTreinos()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });

