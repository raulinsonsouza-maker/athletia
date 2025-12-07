import { prisma } from '../lib/prisma';
import { progressionEngine, getEquipmentStep, nearestAllowedWeight } from './progression.service';
import { slugify } from '../utils/slugify';
import { calcularParametrosTreino as calcularParametrosTreinoCore } from './treino-parameters.service';

const hashTexto = (texto: string): number => {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash << 5) - hash + texto.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};
import { getObjectiveParameters } from './treino-knowledge.service';

/**
 * Mapeamento de lesões para grupos musculares afetados
 */
const LESOES_PARA_GRUPOS: Record<string, string[]> = {
  'Joelho': ['Quadríceps', 'Posteriores', 'Panturrilhas'],
  'Ombro': ['Ombros', 'Peito', 'Tríceps'],
  'Coluna': ['Costas', 'Posteriores', 'Abdômen'],
  'Pulso': ['Bíceps', 'Tríceps', 'Ombros'],
  'Tornozelo': ['Panturrilhas', 'Quadríceps', 'Posteriores']
};

const obterNomeGrupoDeReferencia = (fonte: any): string => {
  if (!fonte) return 'Outros';

  if (fonte.grupoMuscularPrincipal) {
    return fonte.grupoMuscularPrincipal;
  }

  const gruposRelacionados = fonte.gruposMusculares || fonte.exercicio?.gruposMusculares;
  if (Array.isArray(gruposRelacionados) && gruposRelacionados.length > 0) {
    const principal = gruposRelacionados.find(
      (rel: any) => rel.papel === 'PRINCIPAL' && rel.grupo?.nome
    );
    if (principal?.grupo?.nome) return principal.grupo.nome;

    const qualquer = gruposRelacionados.find((rel: any) => rel.grupo?.nome);
    if (qualquer?.grupo?.nome) return qualquer.grupo.nome;
  }

  if (fonte.exercicio?.grupoMuscularPrincipal) {
    return fonte.exercicio.grupoMuscularPrincipal;
  }

  return 'Outros';
};

/**
 * Lista de palavras-chave que indicam exercícios compostos
 */
const COMPOUND_KEYWORDS = [
  'supino', 'agachamento', 'desenvolvimento', 'levantamento terra',
  'remada', 'puxada', 'barra fixa', 'leg press', 'hack', 'stiff',
  'afundo', 'triceps testa', 'triceps paralelas', 'flexão'
];

/**
 * Lista de palavras-chave que indicam exercícios isolados
 */
const ISOLATION_KEYWORDS = [
  'crucifixo', 'elevação', 'rosca', 'tríceps coice', 'tríceps corda',
  'tríceps francês', 'extensão', 'flexão', 'panturrilha', 'abdominal',
  'peck deck', 'voador'
];

/**
 * Identifica se um exercício é composto (multiarticular)
 */
export function isExercicioComposto(exercicio: any): boolean {
  const nome = exercicio.nome?.toLowerCase() || '';
  
  // Verificar palavras-chave compostas
  const temKeywordComposto = COMPOUND_KEYWORDS.some(keyword => 
    nome.includes(keyword)
  );
  
  if (temKeywordComposto) {
    // Exceções: alguns exercícios com essas palavras são isolados
    if (nome.includes('crucifixo') || nome.includes('elevação lateral') || nome.includes('elevação frontal')) {
      return false;
    }
    return true;
  }
  
  // Verificar sinergistas (se tem múltiplos grupos, provavelmente é composto)
  const sinergistas = exercicio.sinergistas || [];
  if (sinergistas.length >= 2) {
    return true;
  }
  
  // Verificar se é exercício de peso corporal complexo
  const equipamentos = exercicio.equipamentoNecessario || [];
  const isPesoCorporal = equipamentos.some((eq: string) => 
    eq.toLowerCase().includes('peso corporal')
  );
  
  if (isPesoCorporal && (nome.includes('flexão') || nome.includes('barra fixa'))) {
    return true;
  }
  
  return false;
}

/**
 * Calcula similaridade entre dois exercícios (0-1)
 */
export function calcularSimilaridadeExercicios(ex1: any, ex2: any): number {
  const nome1 = (ex1.nome || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const nome2 = (ex2.nome || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  if (nome1 === nome2) return 1.0;
  
  // Verificar se um contém o outro
  if (nome1.includes(nome2) || nome2.includes(nome1)) {
    const menor = Math.min(nome1.length, nome2.length);
    const maior = Math.max(nome1.length, nome2.length);
    return menor / maior;
  }
  
  // Calcular palavras em comum
  const palavras1 = nome1.split(' ').filter((p: string) => p.length > 2);
  const palavras2 = nome2.split(' ').filter((p: string) => p.length > 2);
  
  if (palavras1.length === 0 || palavras2.length === 0) return 0;
  
  const palavrasComuns = palavras1.filter((p: string) => palavras2.includes(p));
  const totalPalavras = Math.max(palavras1.length, palavras2.length);
  
  return palavrasComuns.length / totalPalavras;
}

/**
 * Filtra exercícios para evitar redundâncias
 */
export function evitarRedundancia(
  exercicios: any[],
  threshold: number = 0.7
): any[] {
  const filtrados: any[] = [];
  
  for (const exercicio of exercicios) {
    const isRedundante = filtrados.some(ex => {
      const similaridade = calcularSimilaridadeExercicios(exercicio, ex);
      const grupoAtual = obterNomeGrupoDeReferencia(exercicio);
      const grupoComparado = obterNomeGrupoDeReferencia(ex);
      return similaridade >= threshold && grupoAtual === grupoComparado;
    });
    
    if (!isRedundante) {
      filtrados.push(exercicio);
    }
  }
  
  return filtrados;
}

/**
 * Filtra exercícios por local de treino
 */
function filtrarPorLocalTreino(exercicios: any[], localTreino?: string | null): any[] {
  if (!localTreino) {
    return exercicios; // Sem filtro se não especificado
  }

  const localLower = localTreino.toLowerCase();
  
  // Academia comercial: permite todos os equipamentos
  if (localLower.includes('comercial') || localLower === 'academia') {
    return exercicios;
  }

  // Academia Pequena: permite halteres, barras e máquinas básicas
  if (localLower.includes('pequena')) {
    return exercicios.filter(ex => {
      const equipamentos = ex.equipamentoNecessario || [];
      const temEquipamentoBasico = equipamentos.some((eq: string) => {
        const eqLower = eq.toLowerCase();
        return eqLower.includes('halter') || 
               eqLower.includes('dumbbell') ||
               eqLower.includes('barra') ||
               eqLower.includes('peso corporal') ||
               eqLower.includes('corpo') ||
               eqLower.includes('máquina básica') ||
               eqLower.includes('esteira');
      });
      return temEquipamentoBasico || equipamentos.length === 0;
    });
  }

  // Sem equipamento: apenas peso corporal
  if (localLower.includes('sem equipamento') || localLower.includes('sem equipamento')) {
    return exercicios.filter(ex => {
      const equipamentos = ex.equipamentoNecessario || [];
      const temPesoCorporal = equipamentos.some((eq: string) => 
        eq.toLowerCase().includes('peso corporal') || 
        eq.toLowerCase().includes('corpo')
      );
      return temPesoCorporal || equipamentos.length === 0;
    });
  }

  // Customizado: sem filtro (usuário escolhe)
  if (localLower.includes('customizado')) {
    return exercicios;
  }

  return exercicios;
}

/**
 * Ordena exercícios por prioridade: compostos antes de isolados
 */
export function ordenarExerciciosPorPrioridade(
  exercicios: any[],
  objetivo: string
): any[] {
  const ordenados = [...exercicios];
  
  // Separar compostos e isolados
  const compostos: any[] = [];
  const isolados: any[] = [];
  
  for (const ex of ordenados) {
    if (isExercicioComposto(ex)) {
      compostos.push(ex);
    } else {
      isolados.push(ex);
    }
  }
  
  // Ordenar compostos: multiarticulares primeiro, depois por equipamento
  compostos.sort((a, b) => {
    // Priorizar exercícios com mais sinergistas
    const aSinergistas = (a.sinergistas?.length || 0);
    const bSinergistas = (b.sinergistas?.length || 0);
    if (aSinergistas !== bSinergistas) {
      return bSinergistas - aSinergistas;
    }
    
    // Priorizar exercícios livres sobre máquinas
    const aMaquina = (a.equipamentoNecessario || []).some((eq: string) => 
      eq.includes('Máquina') || eq.includes('Aparelho')
    ) ? 1 : 0;
    const bMaquina = (b.equipamentoNecessario || []).some((eq: string) => 
      eq.includes('Máquina') || eq.includes('Aparelho')
    ) ? 1 : 0;
    
    return aMaquina - bMaquina;
  });
  
  // Ordenar isolados: por equipamento (livres antes de máquinas)
  isolados.sort((a, b) => {
    const aMaquina = (a.equipamentoNecessario || []).some((eq: string) => 
      eq.includes('Máquina') || eq.includes('Aparelho')
    ) ? 1 : 0;
    const bMaquina = (b.equipamentoNecessario || []).some((eq: string) => 
      eq.includes('Máquina') || eq.includes('Aparelho')
    ) ? 1 : 0;
    
    return aMaquina - bMaquina;
  });
  
  // Retornar: compostos primeiro, depois isolados
  return [...compostos, ...isolados];
}

/**
 * Seleciona exercício principal de um grupo muscular (prioriza compostos)
 */
export async function selecionarExercicioPrincipal(
  grupoMuscular: string,
  perfil: any,
  objetivo: string,
  experiencia: string,
  ciclo: number = 0,
  exerciciosJaSelecionados: any[] = [],
  seed?: number
): Promise<any | null> {
  console.log(`[Intelligence] Selecionando exercício principal para ${grupoMuscular}...`);

  // 1. Buscar exercícios do grupo
  const slugGrupo = slugify(grupoMuscular, 'grupo');

  let exercicios = await prisma.exercicio.findMany({
    where: {
      ativo: true,
      gruposMusculares: {
        some: {
          grupo: {
            slug: slugGrupo
          },
          papel: 'PRINCIPAL'
        }
      }
    },
    include: {
      gruposMusculares: {
        include: { grupo: true }
      }
    },
    take: 50
  });

  if (exercicios.length === 0) {
    console.warn(`[Warn] Nenhum exercício relacionado ao slug ${slugGrupo}. Aplicando fallback por nome.`);
    exercicios = await prisma.exercicio.findMany({
      where: {
        grupoMuscularPrincipal: grupoMuscular,
        ativo: true
      },
      include: {
        gruposMusculares: {
          include: { grupo: true }
        }
      },
      take: 50
    });
  }

  if (exercicios.length === 0) {
    console.error(`[Error] Nenhum exercício encontrado para ${grupoMuscular}`);
    return null;
  }

  // 2. Filtrar por lesões
  const gruposEvitar = new Set<string>();
  (perfil.lesoes || []).forEach((lesao: string) => {
    const grupos = LESOES_PARA_GRUPOS[lesao] || [];
    grupos.forEach(grupo => gruposEvitar.add(grupo));
  });

  if (gruposEvitar.has(grupoMuscular)) {
    console.log(`[Intelligence] Grupo ${grupoMuscular} afetado por lesão, pulando...`);
    return null;
  }

  // 3. Filtrar por local de treino
  exercicios = filtrarPorLocalTreino(exercicios, perfil.localTreino);

  if (exercicios.length === 0) {
    console.warn(`[Warn] Nenhum exercício disponível após filtro de local`);
    // Tentar sem filtro de local
    exercicios = await prisma.exercicio.findMany({
      where: {
        grupoMuscularPrincipal: grupoMuscular,
        ativo: true
      },
      include: {
        gruposMusculares: {
          include: { grupo: true }
        }
      },
      take: 20
    });
  }

  // 4. Remover exercícios já selecionados (evitar duplicatas)
  const idsJaSelecionados = new Set(exerciciosJaSelecionados.map(ex => ex.id));
  exercicios = exercicios.filter(ex => !idsJaSelecionados.has(ex.id));

  // 5. Ordenar por prioridade: compostos primeiro
  exercicios = ordenarExerciciosPorPrioridade(exercicios, objetivo);

  // 6. Considerar histórico para variação (se ciclo > 0 e userId fornecido)
  if (ciclo > 0) {
    // Histórico será implementado quando userId for passado como parâmetro
    // Por enquanto, mantemos a ordem já estabelecida
  }

  const indiceBase =
    seed !== undefined
      ? Math.abs(hashTexto(`${grupoMuscular}-${seed}-${ciclo}`)) % exercicios.length
      : 0;
  const selecionado = exercicios[indiceBase];
  if (selecionado) {
    console.log(`[Intelligence] Exercício principal selecionado: ${selecionado.nome} (${isExercicioComposto(selecionado) ? 'Composto' : 'Isolado'})`);
  }
  
  return selecionado || null;
}

/**
 * Seleciona exercício acessório de um grupo muscular (prioriza isolados se principal for composto)
 */
export async function selecionarExercicioAcessorio(
  grupoMuscular: string,
  exercicioPrincipal: any,
  perfil: any,
  exerciciosJaSelecionados: any[] = [],
  seed?: number
): Promise<any | null> {
  console.log(`[Intelligence] Selecionando exercício acessório para ${grupoMuscular}...`);

  // 1. Buscar exercícios do grupo
  const slugGrupo = slugify(grupoMuscular, 'grupo');

  let exercicios = await prisma.exercicio.findMany({
    where: {
      ativo: true,
      id: { not: exercicioPrincipal.id },
      gruposMusculares: {
        some: {
          grupo: {
            slug: slugGrupo
          }
        }
      }
    },
    include: {
      gruposMusculares: {
        include: { grupo: true }
      }
    },
    take: 50
  });

  if (exercicios.length === 0) {
    exercicios = await prisma.exercicio.findMany({
      where: {
        grupoMuscularPrincipal: grupoMuscular,
        ativo: true,
        id: { not: exercicioPrincipal.id }
      },
      include: {
        gruposMusculares: {
          include: { grupo: true }
        }
      },
      take: 50
    });
  }

  if (exercicios.length === 0) {
    console.warn(`[Warn] Nenhum exercício acessório disponível para ${grupoMuscular}`);
    return null;
  }

  // 2. Filtrar por lesões
  const gruposEvitar = new Set<string>();
  (perfil.lesoes || []).forEach((lesao: string) => {
    const grupos = LESOES_PARA_GRUPOS[lesao] || [];
    grupos.forEach(grupo => gruposEvitar.add(grupo));
  });

  if (gruposEvitar.has(grupoMuscular)) {
    return null;
  }

  // 3. Filtrar por local de treino
  exercicios = filtrarPorLocalTreino(exercicios, perfil.localTreino);

  // 4. Remover exercícios já selecionados
  const idsJaSelecionados = new Set(exerciciosJaSelecionados.map(ex => ex.id));
  exercicios = exercicios.filter(ex => !idsJaSelecionados.has(ex.id));

  // 5. Evitar redundância com exercício principal
  exercicios = evitarRedundancia([exercicioPrincipal, ...exercicios], 0.7);
  exercicios = exercicios.filter(ex => ex.id !== exercicioPrincipal.id);

  // 6. Se principal é composto, preferir isolado
  const principalIsComposto = isExercicioComposto(exercicioPrincipal);
  
  if (principalIsComposto) {
    // Priorizar isolados
    exercicios.sort((a, b) => {
      const aIsolado = isExercicioComposto(a) ? 0 : 1;
      const bIsolado = isExercicioComposto(b) ? 0 : 1;
      return bIsolado - aIsolado;
    });
  } else {
    // Se principal é isolado, pode escolher outro isolado ou composto
    // Mas priorizar variação diferente
    exercicios = ordenarExerciciosPorPrioridade(exercicios, perfil.objetivo || 'Hipertrofia');
  }

  const indiceBase =
    seed !== undefined
      ? Math.abs(hashTexto(`acc-${grupoMuscular}-${seed}-${exercicioPrincipal.id}`)) %
        exercicios.length
      : 0;
  const selecionado = exercicios[indiceBase];
  if (selecionado) {
    console.log(`[Intelligence] Exercício acessório selecionado: ${selecionado.nome} (${isExercicioComposto(selecionado) ? 'Composto' : 'Isolado'})`);
  }
  
  return selecionado || null;
}

/**
 * Calcula parâmetros de treino (séries, reps, RPE, descanso)
 * DEPRECATED: Usar calcularParametrosTreino de treino-core.service.ts
 * Mantido para compatibilidade - delega para o core
 */
export function calcularParametrosTreino(
  objetivo: string,
  experiencia: string,
  rpePreferido?: number | null
): { series: number; repeticoes: string; rpe: number; descanso: number } {
  // Usar função do core
  return calcularParametrosTreinoCore(objetivo, experiencia, undefined, undefined, rpePreferido);
}

/**
 * Calcula carga do exercício usando o engine de progressão - FUNÇÃO ÚNICA
 */
export async function calcularCargaExercicio(
  userId: string,
  exercicioId: string,
  pesoUsuario: number,
  grupoMuscular: string,
  experiencia: string,
  repeticoes: string = '8-12',
  objetivo?: string
): Promise<number | null> {
  // Buscar exercício completo
  const exercicio = await prisma.exercicio.findUnique({
    where: { id: exercicioId }
  });

  if (!exercicio) {
    return null;
  }

  // Buscar objetivo do perfil se não foi fornecido
  let objetivoUsuario = objetivo;
  if (!objetivoUsuario) {
    const perfil = await prisma.perfil.findUnique({
      where: { userId },
      select: { objetivo: true }
    });
    objetivoUsuario = perfil?.objetivo || 'Hipertrofia';
  }

  // Criar perfil do usuário para o engine
  const userProfile = {
    id: userId,
    level: (experiencia || 'Iniciante') as 'Iniciante' | 'Intermediário' | 'Avançado',
    goal: objetivoUsuario,
    bodyweight: pesoUsuario,
    availabilityDays: 3
  };

  // Usar engine de progressão
  let carga = await progressionEngine.calculateRecommendedWeight(
    {
      id: exercicioId,
      equipamentoNecessario: exercicio.equipamentoNecessario,
      grupoMuscularPrincipal: exercicio.grupoMuscularPrincipal,
      cargaInicialSugerida: exercicio.cargaInicialSugerida
    },
    userId,
    userProfile,
    repeticoes
  );

  // Validação final: garantir que a carga seja sempre um múltiplo válido do step do equipamento
  if (carga !== null && carga > 0) {
    const equipment = getEquipmentStep(exercicio.equipamentoNecessario);
    if (equipment.stepTotal > 0) {
      carga = nearestAllowedWeight(carga, [equipment.stepTotal]);
    } else {
      carga = Math.round(carga);
    }
  }

  return carga;
}

/**
 * Valida ordem de exercícios (compostos antes de isolados)
 */
export function validarOrdemExercicios(exercicios: any[]): {
  valido: boolean;
  erros: string[];
  sugestoes: string[];
} {
  const erros: string[] = [];
  const sugestoes: string[] = [];
  
  // Agrupar por grupo muscular
  const grupos: Record<string, any[]> = {};
  
  for (const ex of exercicios) {
    const grupo = ex.grupoMuscularPrincipal || ex.exercicio?.grupoMuscularPrincipal || 'Outros';
    if (!grupos[grupo]) {
      grupos[grupo] = [];
    }
    grupos[grupo].push(ex);
  }
  
  // Verificar ordem em cada grupo
  for (const [grupo, exerciciosGrupo] of Object.entries(grupos)) {
    if (exerciciosGrupo.length < 2) continue;
    
    let ultimoTipo: 'composto' | 'isolado' | null = null;
    
    for (const ex of exerciciosGrupo) {
      const exercicio = ex.exercicio || ex;
      const isComposto = isExercicioComposto(exercicio);
      const tipo = isComposto ? 'composto' : 'isolado';
      
      if (ultimoTipo === 'isolado' && tipo === 'composto') {
        erros.push(
          `No grupo ${grupo}, exercício composto "${exercicio.nome}" aparece após isolado. ` +
          `Compostos devem vir antes de isolados.`
        );
      }
      
      ultimoTipo = tipo;
    }
  }
  
  return {
    valido: erros.length === 0,
    erros,
    sugestoes
  };
}

/**
 * Valida volume mínimo por grupo no treino
 */
export function validarVolumeMinimoTreino(
  exercicios: any[],
  seriesPorExercicio: number
): {
  valido: boolean;
  gruposAbaixoMinimo: Record<string, number>;
  sugestoes: string[];
} {
  const gruposAbaixoMinimo: Record<string, number> = {};
  const sugestoes: string[] = [];
  
  // Calcular séries por grupo
  const seriesPorGrupo: Record<string, number> = {};
  
  for (const ex of exercicios) {
    const grupo = ex.grupoMuscularPrincipal || ex.exercicio?.grupoMuscularPrincipal || 'Outros';
    if (!seriesPorGrupo[grupo]) {
      seriesPorGrupo[grupo] = 0;
    }
    seriesPorGrupo[grupo] += seriesPorExercicio;
  }
  
  // Verificar volume mínimo (mínimo 6 séries por grupo no treino)
  const VOLUME_MINIMO_TREINO = 6;
  
  for (const [grupo, series] of Object.entries(seriesPorGrupo)) {
    if (series < VOLUME_MINIMO_TREINO && grupo !== 'Cardio' && grupo !== 'Flexibilidade') {
      gruposAbaixoMinimo[grupo] = series;
      sugestoes.push(
        `Grupo ${grupo} tem apenas ${series} séries. Recomendado mínimo de ${VOLUME_MINIMO_TREINO} séries por grupo no treino.`
      );
    }
  }
  
  return {
    valido: Object.keys(gruposAbaixoMinimo).length === 0,
    gruposAbaixoMinimo,
    sugestoes
  };
}

/**
 * Valida treino completo antes de salvar
 */
export function validarTreinoCompleto(
  exercicios: any[],
  seriesPorExercicio: number
): {
  valido: boolean;
  erros: string[];
  avisos: string[];
  sugestoes: string[];
} {
  const erros: string[] = [];
  const avisos: string[] = [];
  const sugestoes: string[] = [];
  
  // Validar ordem
  const validacaoOrdem = validarOrdemExercicios(exercicios);
  erros.push(...validacaoOrdem.erros);
  sugestoes.push(...validacaoOrdem.sugestoes);
  
  // Validar volume mínimo
  const validacaoVolume = validarVolumeMinimoTreino(exercicios, seriesPorExercicio);
  if (!validacaoVolume.valido) {
    avisos.push(...validacaoVolume.sugestoes);
  }
  
  // Validar redundâncias
  const exerciciosUnicos = evitarRedundancia(exercicios, 0.8);
  if (exerciciosUnicos.length < exercicios.length) {
    avisos.push(
      `Foram detectados exercícios muito similares. ` +
      `Recomendado variar mais os exercícios.`
    );
  }
  
  return {
    valido: erros.length === 0,
    erros,
    avisos,
    sugestoes
  };
}

