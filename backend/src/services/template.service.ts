import { PrismaClient } from '@prisma/client';
import { progressionEngine, getEquipmentStep, nearestAllowedWeight } from './progression.service';
import { calcularCargaExercicio } from './workout-intelligence.service';

const prisma = new PrismaClient();

/**
 * Calcula pontuação de um template baseado na compatibilidade com o objetivo
 */
export function calcularPontuacaoTemplate(
  template: any,
  objetivo: string,
  nivelExperiencia: string,
  frequenciaSemanal: number,
  divisaoTreino?: string
): number {
  let pontuacao = 0;

  // Pontuação base: compatibilidade com objetivo (peso maior)
  if (template.objetivo === objetivo) {
    pontuacao += 100;
  }

  // Compatibilidade com nível de experiência
  if (template.nivelExperiencia === nivelExperiencia) {
    pontuacao += 50;
  }

  // Compatibilidade com frequência semanal
  if (template.frequenciaSemanal === frequenciaSemanal) {
    pontuacao += 30;
  }

  // Compatibilidade com divisão de treino
  if (divisaoTreino && template.divisaoTreino === divisaoTreino) {
    pontuacao += 20;
  }

  // Bonus por número de exercícios (templates com mais exercícios são mais completos)
  const numExercicios = template.exercicios?.length || 0;
  if (numExercicios >= 6 && numExercicios <= 10) {
    pontuacao += 15; // Número ideal de exercícios
  } else if (numExercicios > 10) {
    pontuacao += 10; // Muitos exercícios pode ser excessivo
  } else if (numExercicios < 4) {
    pontuacao -= 10; // Poucos exercícios
  }

  // Bonus por variedade de grupos musculares
  const gruposUnicos = new Set(template.gruposMusculares || []).size;
  if (gruposUnicos >= 3) {
    pontuacao += 10; // Boa variedade
  }

  // Bonus específico por objetivo
  if (objetivo === 'Emagrecimento') {
    // Priorizar templates com mais volume e exercícios compostos
    if (numExercicios >= 6) {
      pontuacao += 10;
    }
    // Verificar se tem exercícios compostos (mais grupos musculares)
    if (gruposUnicos >= 4) {
      pontuacao += 10;
    }
  } else if (objetivo === 'Hipertrofia') {
    // Priorizar templates com volume adequado (6-8 exercícios)
    if (numExercicios >= 6 && numExercicios <= 8) {
      pontuacao += 15;
    }
  } else if (objetivo === 'Força') {
    // Priorizar templates com menos exercícios mas mais focados
    if (numExercicios >= 4 && numExercicios <= 6) {
      pontuacao += 15;
    }
  }

  return pontuacao;
}

/**
 * Busca o template de treino mais adequado baseado no perfil do usuário e dia da semana
 */
export async function buscarTemplateAdequado(
  objetivo: string,
  nivelExperiencia: string,
  frequenciaSemanal: number,
  data: Date = new Date(),
  divisaoTreino?: string
): Promise<any | null> {
  console.log(`🔍 Buscando template adequado...`);
  console.log(`   Objetivo: ${objetivo}`);
  console.log(`   Nível: ${nivelExperiencia}`);
  console.log(`   Frequência: ${frequenciaSemanal}x/semana`);
  console.log(`   Data: ${data.toLocaleDateString('pt-BR')}`);
  console.log(`   Divisão: ${divisaoTreino || 'auto'}`);

  // Determinar divisão de treino se não fornecida
  let divisao = divisaoTreino;
  if (!divisao) {
    if (nivelExperiencia === 'Iniciante') {
      divisao = frequenciaSemanal <= 2 ? 'Full Body' : 'A-B';
    } else if (nivelExperiencia === 'Intermediário') {
      divisao = 'A-B-C';
    } else {
      divisao = frequenciaSemanal >= 5 ? 'A-B-C-D-E' : frequenciaSemanal === 4 ? 'A-B-C-D' : 'Push Pull Legs';
    }
  }

  // Determinar qual dia do ciclo para divisões A-B-C
  let diaSemana = data.getDay(); // 0=domingo, 1=segunda, etc.
  if (diaSemana === 0) diaSemana = 7; // Ajustar domingo

  // Para divisão A-B-C, determinar qual template buscar (A, B ou C)
  let templateEspecifico = null;
  if (divisao === 'A-B-C' && nivelExperiencia === 'Intermediário') {
    const ciclo = (diaSemana - 1) % 3;
    if (ciclo === 0) {
      // Dia A - Pernas
      templateEspecifico = await prisma.treinoTemplate.findFirst({
        where: {
          objetivo,
          nivelExperiencia,
          frequenciaSemanal,
          divisaoTreino: divisao,
          gruposMusculares: { has: 'Quadríceps' },
          ativo: true
        },
        include: {
          exercicios: {
            include: { exercicio: true },
            orderBy: { ordem: 'asc' }
          }
        }
      });
    } else if (ciclo === 1) {
      // Dia B - Push
      templateEspecifico = await prisma.treinoTemplate.findFirst({
        where: {
          objetivo,
          nivelExperiencia,
          frequenciaSemanal,
          divisaoTreino: divisao,
          gruposMusculares: { has: 'Peito' },
          ativo: true
        },
        include: {
          exercicios: {
            include: { exercicio: true },
            orderBy: { ordem: 'asc' }
          }
        }
      });
    } else {
      // Dia C - Pull
      templateEspecifico = await prisma.treinoTemplate.findFirst({
        where: {
          objetivo,
          nivelExperiencia,
          frequenciaSemanal,
          divisaoTreino: divisao,
          gruposMusculares: { has: 'Costas' },
          ativo: true
        },
        include: {
          exercicios: {
            include: { exercicio: true },
            orderBy: { ordem: 'asc' }
          }
        }
      });
    }
  }

  if (templateEspecifico) {
    console.log(`✅ Template específico encontrado: ${templateEspecifico.nome}`);
    return templateEspecifico;
  }

  // Buscar template exato
  let template = await prisma.treinoTemplate.findFirst({
    where: {
      objetivo,
      nivelExperiencia,
      frequenciaSemanal,
      divisaoTreino: divisao,
      ativo: true
    },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    }
  });

  // Se não encontrou exato, buscar alternativas e classificar por pontuação
  if (!template) {
    console.log(`⚠️ Template exato não encontrado, buscando alternativas...`);
    
    // Buscar todos os templates compatíveis
    let templatesAlternativos = await prisma.treinoTemplate.findMany({
      where: {
        objetivo,
        nivelExperiencia,
        frequenciaSemanal,
        ativo: true
      },
      include: {
        exercicios: {
          include: { exercicio: true },
          orderBy: { ordem: 'asc' }
        }
      }
    });

    // Se ainda não encontrou, buscar por objetivo e nível apenas
    if (templatesAlternativos.length === 0) {
      templatesAlternativos = await prisma.treinoTemplate.findMany({
        where: {
          objetivo,
          nivelExperiencia,
          ativo: true
        },
        include: {
          exercicios: {
            include: { exercicio: true },
            orderBy: { ordem: 'asc' }
          }
        }
      });
    }

    // Filtrar apenas templates com exercícios
    templatesAlternativos = templatesAlternativos.filter(t => t.exercicios && t.exercicios.length > 0);

    if (templatesAlternativos.length > 0) {
      // Classificar por pontuação
      const templatesComPontuacao = templatesAlternativos.map(t => ({
        template: t,
        pontuacao: calcularPontuacaoTemplate(t, objetivo, nivelExperiencia, frequenciaSemanal, divisao)
      }));

      // Ordenar por pontuação (maior primeiro)
      templatesComPontuacao.sort((a, b) => b.pontuacao - a.pontuacao);

      template = templatesComPontuacao[0].template;
      console.log(`✅ Template selecionado por pontuação: ${template.nome} (pontuação: ${templatesComPontuacao[0].pontuacao})`);
    }
  }

  if (template) {
    console.log(`✅ Template encontrado: ${template.nome}`);
    console.log(`   Exercícios: ${template.exercicios.length}`);
  } else {
    console.log(`❌ Nenhum template encontrado`);
  }

  return template;
}

/**
 * Adapta um template de treino considerando lesões e equipamentos do usuário
 */
export async function adaptarTemplate(
  template: any,
  lesoes: string[],
  equipamentos: string[],
  pesoAtual?: number,
  experiencia?: string
): Promise<any[]> {
  console.log(`🔄 Adaptando template...`);
  console.log(`   Lesões: ${lesoes.join(', ') || 'Nenhuma'}`);
  console.log(`   Equipamentos: ${equipamentos.join(', ') || 'Nenhum'}`);

  const exerciciosAdaptados: any[] = [];

  for (const templateEx of template.exercicios) {
    const exercicio = templateEx.exercicio;

    // Verificar se exercício é compatível com lesões
    if (lesoes.length > 0) {
      const textoExercicio = `${exercicio.descricao || ''} ${exercicio.execucaoTecnica || ''} ${exercicio.errosComuns.join(' ')}`.toLowerCase();
      const temLesaoIncompativel = lesoes.some(lesao => 
        textoExercicio.includes(lesao.toLowerCase())
      );

      if (temLesaoIncompativel && templateEx.obrigatorio) {
        console.log(`⚠️ Exercício ${exercicio.nome} incompatível com lesões, mas é obrigatório. Mantendo.`);
      } else if (temLesaoIncompativel && !templateEx.obrigatorio) {
        console.log(`⏭️ Exercício ${exercicio.nome} incompatível com lesões, buscando alternativa...`);
        
        // Buscar alternativa
        if (exercicio.alternativas && exercicio.alternativas.length > 0) {
          const alternativa = await prisma.exercicio.findFirst({
            where: {
              id: { in: exercicio.alternativas },
              ativo: true,
              grupoMuscularPrincipal: exercicio.grupoMuscularPrincipal
            }
          });

          if (alternativa) {
            console.log(`✅ Alternativa encontrada: ${alternativa.nome}`);
            exerciciosAdaptados.push({
              ...templateEx,
              exercicio: alternativa,
              exercicioId: alternativa.id
            });
            continue;
          }
        }

        // Se não encontrou alternativa, pular exercício não obrigatório
        if (!templateEx.obrigatorio) {
          console.log(`⏭️ Pulando exercício ${exercicio.nome}`);
          continue;
        }
      }
    }

    // Verificar equipamentos (mas não bloquear se não tiver)
    if (equipamentos.length > 0 && exercicio.equipamentoNecessario.length > 0) {
      const temEquipamento = exercicio.equipamentoNecessario.some((eq: string) =>
        equipamentos.includes(eq)
      );

      if (!temEquipamento && !templateEx.obrigatorio) {
        console.log(`⚠️ Exercício ${exercicio.nome} requer equipamentos não disponíveis, buscando alternativa...`);
        
        // Buscar alternativa com equipamentos disponíveis
        if (exercicio.alternativas && exercicio.alternativas.length > 0) {
          const alternativa = await prisma.exercicio.findFirst({
            where: {
              id: { in: exercicio.alternativas },
              ativo: true,
              grupoMuscularPrincipal: exercicio.grupoMuscularPrincipal,
              OR: [
                { equipamentoNecessario: { isEmpty: true } },
                { equipamentoNecessario: { hasSome: equipamentos } }
              ]
            }
          });

          if (alternativa) {
            console.log(`✅ Alternativa encontrada: ${alternativa.nome}`);
            exerciciosAdaptados.push({
              ...templateEx,
              exercicio: alternativa,
              exercicioId: alternativa.id
            });
            continue;
          }
        }
      }
    }

    // Adicionar exercício original
    exerciciosAdaptados.push(templateEx);
  }

  console.log(`✅ Template adaptado: ${exerciciosAdaptados.length} exercícios`);

  // Se não há exercícios adaptados, retornar os originais do template (fallback)
  if (exerciciosAdaptados.length === 0) {
    console.warn(`⚠️ Nenhum exercício adaptado, usando exercícios originais do template`);
    const exerciciosOriginais = template.exercicios.map((ex: any) => ({
      ...ex,
      exercicio: ex.exercicio,
      exercicioId: ex.exercicioId || ex.exercicio?.id
    }));
    
    if (exerciciosOriginais.length === 0) {
      console.error(`❌ ERRO CRÍTICO: Template não tem exercícios!`);
      throw new Error(`Template ${template.nome} não possui exercícios`);
    }
    
    return exerciciosOriginais;
  }

  console.log(`✅ Template adaptado: ${exerciciosAdaptados.length} exercícios`);
  return exerciciosAdaptados;
}

/**
 * Calcula carga inicial para um exercício usando o serviço centralizado de inteligência
 * @deprecated Use calcularCargaExercicio de workout-intelligence.service.ts diretamente
 */
export async function calcularCargaInicial(
  exercicio: any,
  pesoAtual?: number,
  experiencia?: string,
  userId?: string,
  repeticoes: string = '8-12'
): Promise<number> {
  // Se não tem peso ou userId, usar método antigo simplificado
  if (!pesoAtual || pesoAtual <= 0 || !userId) {
    const cargaSugerida = exercicio.cargaInicialSugerida || 0;
    if (cargaSugerida > 0) {
      // Aplicar validação mesmo para carga sugerida
      const equipment = getEquipmentStep(exercicio.equipamentoNecessario || []);
      if (equipment.stepTotal > 0) {
        return nearestAllowedWeight(cargaSugerida, [equipment.stepTotal]);
      }
      return Math.round(cargaSugerida);
    }
    return 0;
  }

  // Usar serviço centralizado de inteligência
  const carga = await calcularCargaExercicio(
    userId,
    exercicio.id || '',
    pesoAtual,
    exercicio.grupoMuscularPrincipal || '',
    experiencia || 'Iniciante',
    repeticoes
  );

  return carga || 0;
}

/**
 * Cria um treino a partir de um template adaptado
 */
export async function criarTreinoDoTemplate(
  userId: string,
  template: any,
  exerciciosAdaptados: any[],
  data: Date = new Date()
): Promise<any> {
  console.log(`🏋️ Criando treino do template...`);

  // Verificar se já existe treino para esta data
  const inicioDia = new Date(data);
  inicioDia.setHours(0, 0, 0, 0);
  const fimDia = new Date(data);
  fimDia.setHours(23, 59, 59, 999);

  const treinoExistente = await prisma.treino.findFirst({
    where: {
      userId,
      data: { gte: inicioDia, lte: fimDia }
    }
  });

  if (treinoExistente) {
    console.log(`✅ Treino já existe para esta data, verificando cardio e alongamento...`);
    
    // Garantir que treino existente tem cardio e alongamento
    const { garantirCardioEAlongamento } = await import('./treino.service');
    const resultado = await garantirCardioEAlongamento(treinoExistente.id, data);
    
    if (resultado.cardioAdicionado || resultado.alongamentoAdicionado) {
      console.log(`✅ Cardio/Alongamento adicionados ao treino existente`);
    }
    
    // Definir treino existente como ativo
    try {
      const { definirTreinoAtivo } = await import('./treino.service');
      await definirTreinoAtivo(userId, treinoExistente.id);
    } catch (error) {
      console.error('Erro ao definir treino como ativo:', error);
    }

    // Retornar treino atualizado
    return await prisma.treino.findUnique({
      where: { id: treinoExistente.id },
      include: {
        exercicios: {
          include: { exercicio: true },
          orderBy: { ordem: 'asc' }
        }
      }
    });
  }

  // Buscar perfil para calcular cargas
  const perfil = await prisma.perfil.findUnique({
    where: { userId }
  });

  // Criar treino
  const treino = await prisma.treino.create({
    data: {
      userId,
      data,
      tipo: template.divisaoTreino,
      tempoEstimado: template.tempoEstimado,
      concluido: false
    }
  });

  // Criar exercícios do treino
  const exerciciosTreino = [];
  for (let i = 0; i < exerciciosAdaptados.length; i++) {
    const templateEx = exerciciosAdaptados[i];
    const exercicio = templateEx.exercicio;

    // Validar que o exercício existe
    if (!exercicio || !exercicio.id) {
      console.error(`❌ Exercício inválido no índice ${i}`);
      continue;
    }

    const carga = await calcularCargaInicial(
      exercicio,
      perfil?.pesoAtual || undefined,
      perfil?.experiencia || undefined,
      userId,
      templateEx.repeticoes || '10-12'
    );

    try {
      const exercicioTreino = await prisma.exercicioTreino.create({
        data: {
          treinoId: treino.id,
          exercicioId: exercicio.id,
          ordem: i + 1,
          series: templateEx.series || 3,
          repeticoes: templateEx.repeticoes || '10-12',
          carga: carga > 0 ? carga : null,
          rpe: templateEx.rpeSugerido || perfil?.rpePreferido || null,
          descanso: templateEx.descanso || 60,
          concluido: false,
          observacoes: templateEx.observacoes || null
        }
      });

      exerciciosTreino.push(exercicioTreino);
    } catch (error: any) {
      console.error(`❌ Erro ao criar exercício ${exercicio.nome}:`, error.message);
      // Continuar com os outros exercícios
    }
  }

  // Adicionar exercício aeróbico após os exercícios de força
  const { selecionarExercicioAerobicoDoDia, buscarOuCriarExercicioAlongamento } = await import('./treino.service');
  const exercicioAerobico = await selecionarExercicioAerobicoDoDia(data);
  
  try {
    const exercicioAerobicoTreino = await prisma.exercicioTreino.create({
      data: {
        treinoId: treino.id,
        exercicioId: exercicioAerobico.id,
        ordem: exerciciosTreino.length + 1,
        series: 1,
        repeticoes: '20-30 min',
        carga: null,
        rpe: 5,
        descanso: 0,
        concluido: false,
        observacoes: 'Exercício aeróbico - ritmo moderado'
      }
    });
    exerciciosTreino.push(exercicioAerobicoTreino);
    console.log(`✅ Exercício aeróbico adicionado: ${exercicioAerobico.nome}`);
  } catch (error: any) {
    console.error(`❌ Erro ao adicionar exercício aeróbico:`, error.message);
  }

  // Adicionar exercício de alongamento no final
  const exercicioAlongamento = await buscarOuCriarExercicioAlongamento();
  
  try {
    const exercicioAlongamentoTreino = await prisma.exercicioTreino.create({
      data: {
        treinoId: treino.id,
        exercicioId: exercicioAlongamento.id,
        ordem: exerciciosTreino.length + 1,
        series: 1,
        repeticoes: '5-10 min',
        carga: null,
        rpe: 3,
        descanso: 0,
        concluido: false,
        observacoes: 'Alongamento geral de todos os grupos musculares'
      }
    });
    exerciciosTreino.push(exercicioAlongamentoTreino);
    console.log(`✅ Exercício de alongamento adicionado`);
  } catch (error: any) {
    console.error(`❌ Erro ao adicionar exercício de alongamento:`, error.message);
  }

  console.log(`✅ Treino criado: ${treino.id}`);
  console.log(`   Exercícios criados: ${exerciciosTreino.length}`);

  if (exerciciosTreino.length === 0) {
    console.error(`❌ ERRO: Treino criado sem exercícios!`);
    console.error(`   Template: ${template.nome}`);
    console.error(`   Exercícios adaptados recebidos: ${exerciciosAdaptados.length}`);
    throw new Error(`Treino criado sem exercícios. Template: ${template.nome}, Exercícios adaptados: ${exerciciosAdaptados.length}`);
  }

  // Retornar treino completo
  const treinoCompleto = await prisma.treino.findUnique({
    where: { id: treino.id },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    }
  });

  if (!treinoCompleto || !treinoCompleto.exercicios || treinoCompleto.exercicios.length === 0) {
    console.error(`❌ ERRO: Treino completo retornado sem exercícios!`);
    console.error(`   Treino ID: ${treino.id}`);
    console.error(`   Exercícios criados: ${exerciciosTreino.length}`);
    throw new Error(`Treino retornado sem exercícios. ID: ${treino.id}`);
  }

  console.log(`✅ Treino completo retornado com ${treinoCompleto.exercicios.length} exercícios`);
  
  // Garantir que o treino recém-criado tem cardio e alongamento (dupla verificação)
  const { garantirCardioEAlongamento } = await import('./treino.service');
  await garantirCardioEAlongamento(treino.id, data);
  
  // Retornar treino atualizado após garantir cardio/alongamento
  const treinoFinal = await prisma.treino.findUnique({
    where: { id: treino.id },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    }
  });
  
  if (!treinoFinal || !treinoFinal.exercicios || treinoFinal.exercicios.length === 0) {
    throw new Error(`Treino final sem exercícios. ID: ${treino.id}`);
  }
  
  // Contar exercícios por tipo
  const exerciciosForca = treinoFinal.exercicios.filter((ex: any) => {
    const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
    return grupo !== 'Cardio' && grupo !== 'Flexibilidade';
  });
  const exerciciosCardio = treinoFinal.exercicios.filter((ex: any) => 
    ex.exercicio?.grupoMuscularPrincipal === 'Cardio'
  );
  const exerciciosAlongamento = treinoFinal.exercicios.filter((ex: any) => 
    ex.exercicio?.grupoMuscularPrincipal === 'Flexibilidade'
  );
  
  console.log(`📊 Resumo do treino: ${exerciciosForca.length} força, ${exerciciosCardio.length} cardio, ${exerciciosAlongamento.length} alongamento`);

  // Definir treino gerado como ativo
  try {
    const { definirTreinoAtivo } = await import('./treino.service');
    await definirTreinoAtivo(userId, treino.id);
  } catch (error) {
    console.error('Erro ao definir treino como ativo:', error);
    // Continuar mesmo se falhar
  }

  return treinoFinal;
}

