import { prisma } from '../lib/prisma';
import { garantirPlanoSemanal, aplicarCardioAoTreino } from './treino-engine.service';
import { garantirPerfilParaInteligencia, obterPerfilBasico } from './perfil.service';
import { obterImagemTreino, obterImagemGrupo } from '../utils/imagens-treino';

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function normalizarData(data: Date): Date {
  const normalizada = new Date(data);
  normalizada.setHours(0, 0, 0, 0);
  return normalizada;
}

function extrairRepeticoes(valor: string): number {
  const match = valor?.match(/\d+/);
  return match ? parseInt(match[0], 10) : 10;
}

function calcularVolumeTreino(treino: any): number {
  if (!treino || !treino.exercicios || !Array.isArray(treino.exercicios)) {
    return 0;
  }
  
  return treino.exercicios.reduce((total: number, exercicio: any) => {
    // Ignorar exercícios de cardio e alongamento no cálculo de volume
    const grupo = exercicio.exercicio?.grupoMuscularPrincipal || exercicio.grupoMuscularPrincipal || '';
    if (grupo === 'Cardio' || grupo === 'Flexibilidade' || exercicio.exercicio?.nome?.toLowerCase().includes('alongamento')) {
      return total;
    }
    
    const repeticoes = extrairRepeticoes(exercicio.repeticoes);
    // Usar carga registrada ou carga sugerida como fallback
    let carga = exercicio.carga || 0;
    if (carga <= 0 && exercicio.exercicio?.cargaInicialSugerida) {
      carga = exercicio.exercicio.cargaInicialSugerida;
    }
    
    // Validar valores numéricos válidos
    if (isNaN(repeticoes) || isNaN(carga) || repeticoes <= 0 || carga <= 0) {
      return total;
    }
    
    return total + exercicio.series * repeticoes * carga;
  }, 0);
}

function extrairGruposPrincipais(exercicios: any[]): string[] {
  const grupos = new Set<string>();
  exercicios.forEach(ex => {
    const grupo = ex.exercicio?.grupoMuscularPrincipal || ex.grupoMuscularPrincipal;
    if (grupo) grupos.add(grupo);
  });
  return Array.from(grupos).slice(0, 3);
}

// ============================================================================
// FUNÇÕES PRINCIPAIS
// ============================================================================

export async function obterResumoTreinos(userId: string) {
  const perfil = await obterPerfilBasico(userId);
  const genero = perfil?.sexo || null;

  // Garantir plano semanal usando novo engine
  await garantirPlanoSemanal({ userId });

  const experiencia = perfil?.experiencia || 'Intermediário';
  const localPreferencial = perfil?.localTreino || 'Academia Comercial';

  const recursosPersonalizados = [
    {
      id: 'treino-rapido',
      titulo: 'Criar um Novo Treino Rápido',
      descricao: 'Monte um treino sob medida em segundos',
      icone: 'zap',
      destino: '/treino-rapido'
    },
    {
      id: 'plano-atual',
      titulo: 'Meu Plano de Treino Atual',
      descricao: 'Veja os treinos da semana',
      icone: 'list',
      destino: '/meu-plano'
    }
  ];

  const templates = await prisma.treinoTemplate.findMany({
    where: {
      ativo: true,
      nivelExperiencia: experiencia
    },
    orderBy: {
      updatedAt: 'desc'
    },
    take: 6
  });

  const treinosRapidos = templates.map(template => ({
    id: template.id,
    titulo: template.nome,
    nivel: template.nivelExperiencia,
    duracao: template.tempoEstimado,
    local: localPreferencial,
    imagem: obterImagemTreino(template.gruposMusculares || [], genero),
    destaque: template.descricao
  }));

  const hoje = normalizarData(new Date());

  const proximosTreinosBrutos = await prisma.treino.findMany({
    where: {
      userId,
      data: {
        gte: hoje
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
      }
    },
    orderBy: {
      data: 'asc'
    },
    take: 6
  });

  // Evitar treinos duplicados (ex.: mesmos nome/data/letra gerados em execuções antigas)
  const mapaProximosTreinos = new Map<string, typeof proximosTreinosBrutos[number]>();

  for (const treino of proximosTreinosBrutos) {
    const chaveData = normalizarData(treino.data).toISOString();
    const chave = `${chaveData}-${treino.letraTreino || treino.nome}`;

    // Se já existe um treino para a mesma chave, manter o mais recente
    const existente = mapaProximosTreinos.get(chave);
    if (!existente || existente.createdAt < treino.createdAt) {
      mapaProximosTreinos.set(chave, treino);
    }
  }

  const proximosTreinos = Array.from(mapaProximosTreinos.values())
    .sort((a, b) => a.data.getTime() - b.data.getTime())
    .slice(0, 6);

  // Gerar planosAtivos com imagens inteligentes
  const planosAtivos = proximosTreinos.map((treino) => {
    const gruposPrincipais = extrairGruposPrincipais(treino.exercicios);
    
    return {
      id: treino.id,
      titulo: treino.nome || 'Treino',
      nivel: experiencia,
      duracao: treino.tempoEstimado || 60,
      local: localPreferencial,
      data: treino.data,
      totalExercicios: treino.exercicios.length,
      gruposPrincipais,
      imagem: obterImagemTreino(gruposPrincipais, genero)
    };
  });

  // Calcular período da semana
  const inicioSemana = normalizarData(new Date(hoje));
  const diaSemana = inicioSemana.getDay();
  const diff = diaSemana === 0 ? -6 : 1 - diaSemana;
  inicioSemana.setDate(inicioSemana.getDate() + diff);
  const fimSemana = normalizarData(new Date(inicioSemana));
  fimSemana.setDate(fimSemana.getDate() + 6);

  const treinosSemana = await prisma.treino.findMany({
    where: {
      userId,
      data: {
        gte: inicioSemana,
        lte: fimSemana
      }
    },
    include: {
      exercicios: true
    },
    orderBy: {
      data: 'asc'
    }
  });

  const mapaTreinosSemana = treinosSemana.reduce<Record<string, typeof treinosSemana>>((acc, treino) => {
    const key = normalizarData(treino.data).toISOString();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(treino);
    return acc;
  }, {});

  const diasSemanaLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const semana = Array.from({ length: 7 }).map((_, index) => {
    const dataDia = normalizarData(new Date(inicioSemana));
    dataDia.setDate(inicioSemana.getDate() + index);
    const key = dataDia.toISOString();
    const treinosDia = mapaTreinosSemana[key] || [];
    const concluido = treinosDia.some(treino => treino.concluido);
    const status = dataDia.getTime() === hoje.getTime()
      ? 'hoje'
      : dataDia.getTime() < hoje.getTime()
        ? 'passado'
        : 'futuro';

    return {
      label: diasSemanaLabels[(index + 1) % 7], // Segunda = índice 0
      data: dataDia.toISOString(),
      status,
      hasTreino: treinosDia.length > 0,
      concluido,
      treinoId: treinosDia[0]?.id || null
    };
  });

  // Validar dados reais do banco
  const realizados = treinosSemana.filter(treino => treino.concluido === true).length;
  const planejados = treinosSemana.length;
  
  // Calcular volume total apenas de treinos concluídos com exercícios válidos
  const volumeTotal = treinosSemana
    .filter(treino => treino.concluido === true)
    .reduce((acc, treino) => {
      const volume = calcularVolumeTreino(treino);
      return acc + (isNaN(volume) ? 0 : volume);
    }, 0);
  
  // Calcular séries totais apenas de treinos concluídos, excluindo cardio e alongamento
  const seriesTotais = treinosSemana
    .filter(treino => treino.concluido === true)
    .reduce((acc, treino) => {
      if (!treino.exercicios || !Array.isArray(treino.exercicios)) {
        return acc;
      }
      
      const seriesTreino = treino.exercicios.reduce((soma: number, exercicio: any) => {
        const grupo = exercicio.exercicio?.grupoMuscularPrincipal || exercicio.grupoMuscularPrincipal || '';
        // Ignorar cardio e alongamento
        if (grupo === 'Cardio' || grupo === 'Flexibilidade' || exercicio.exercicio?.nome?.toLowerCase().includes('alongamento')) {
          return soma;
        }
        
        const series = exercicio.series || 0;
        return soma + (isNaN(series) ? 0 : Math.max(0, series));
      }, 0);
      
      return acc + seriesTreino;
    }, 0);
  
  // Contar dias sem treino apenas dos dias passados (não futuros)
  const diasSemTreino = semana.filter(dia => {
    const dataDia = new Date(dia.data);
    const hoje = normalizarData(new Date());
    return dataDia.getTime() < hoje.getTime() && !dia.hasTreino;
  }).length;

  const recomendacoes: string[] = [];
  if (planejados > 0 && realizados < Math.ceil(planejados * 0.5)) {
    recomendacoes.push('Adicione um treino extra nesta semana para manter o ritmo.');
  }
  if (diasSemTreino >= 3) {
    recomendacoes.push('Separe alguns minutos para mobilidade nos dias sem treino.');
  }
  if (volumeTotal === 0) {
    recomendacoes.push('Registre as cargas utilizadas para acompanhar sua evolução.');
  }
  if (recomendacoes.length === 0) {
    recomendacoes.push('Excelente consistência! Continue seguindo seu plano.');
  }

  return {
    recursos: recursosPersonalizados,
    secoes: [
      {
        id: 'treinos-rapidos',
        titulo: `Treinos rápidos para ${experiencia}`,
        subtitulo: 'Sugestões baseadas no seu perfil',
        itens: treinosRapidos
      }
    ],
    planosAtivos,
    destaquePlanoAtual: planosAtivos[0] || null,
    semana,
    insights: {
      progressoSemana: {
        realizados,
        planejados
      },
      volumeTotal,
      seriesTotais,
      diasSemTreino
    },
    recomendacoes,
    genero
  };
}

export async function buscarPlanoAtual(userId: string) {
  const perfil = await garantirPerfilParaInteligencia(userId);
  const genero = perfil?.sexo || null;
  const objetivo = perfil?.objetivo || 'Hipertrofia';

  // Garantir plano semanal usando novo engine
  await garantirPlanoSemanal({ userId });

  const experiencia = perfil?.experiencia || 'Intermediário';
  const local = perfil?.localTreino || 'Academia Comercial';

  const hoje = normalizarData(new Date());

  const treinos = await prisma.treino.findMany({
    where: {
      userId,
      data: {
        gte: hoje
      }
    },
    include: {
      exercicios: {
        include: {
          exercicio: true
        },
        orderBy: { ordem: 'asc' }
      }
    },
    orderBy: { data: 'asc' },
    take: 7
  });

  if (treinos.length === 0) {
    return {
      plano: {
        nivel: experiencia,
        tempoMedio: 0,
        local,
        imagemCapa: obterImagemTreino([], genero),
        totalTreinos: 0
      },
      blocos: [],
      genero
    };
  }

  const blocos = treinos
    .map((treino) => {
      // Remover exercícios duplicados (mesmo exercicioId) dentro do mesmo treino
      const vistos = new Set<string>()
      const exerciciosUnicos = treino.exercicios.filter((ex: any) => {
        const key = ex.exercicioId || ex.exercicio?.id
        if (!key) return true
        if (vistos.has(key)) return false
        vistos.add(key)
        return true
      })

      // Filtrar exercícios que não têm dados válidos
      const exerciciosValidos = exerciciosUnicos.filter((ex: any) => ex.exercicio && ex.exercicio.nome)

      // Se não tiver exercícios válidos, retornar null para filtrar depois
      if (exerciciosValidos.length === 0) {
        return null
      }

      const gruposPrincipais = extrairGruposPrincipais(exerciciosValidos)
      
      // Extrair informações do cardio do exercício (se existir)
      const exercicioCardio = treino.exercicios.find(
        (ex: any) => ex.exercicio?.grupoMuscularPrincipal === 'Cardio'
      );

      // Criar objeto cardio estruturado usando função centralizada
      const treinoTemp: any = {};
      if (exercicioCardio) {
        const tempoMatch = exercicioCardio.repeticoes?.match(/(\d+)/);
        const tempoMinutos = tempoMatch ? parseInt(tempoMatch[1], 10) : 0;
        
        const nomeCardio = exercicioCardio.exercicio?.nome?.toLowerCase() || '';
        let tipo = 'esteira';
        if (nomeCardio.includes('bicicleta')) tipo = 'bicicleta';
        else if (nomeCardio.includes('eliptico') || nomeCardio.includes('elíptico')) tipo = 'eliptico';
        else if (nomeCardio.includes('remada')) tipo = 'remada';
        
        treinoTemp.cardio = {
          ativo: true,
          tipo,
          tempoMinutos: tempoMinutos || 15,
          intensidade: 'moderada' as const,
          momento: exercicioCardio.ordem === 0 ? 'inicio' as const : 'final' as const
        };
      }
      
      // Garantir que sempre tenha campo cardio (usar função centralizada)
      aplicarCardioAoTreino(treinoTemp, objetivo);
      const cardio = treinoTemp.cardio || { ativo: false };
      
      return {
        id: treino.id,
        titulo: treino.nome || 'Treino',
        data: treino.data,
        letraTreino: treino.letraTreino,
        gruposPrincipais,
        totalExercicios: exerciciosValidos.length,
        imagem: obterImagemTreino(gruposPrincipais, genero),
        cardio,
        exercicios: exerciciosValidos.map(ex => ({
          id: ex.id,
          nome: ex.exercicio.nome,
          grupo: ex.exercicio.grupoMuscularPrincipal,
          series: ex.series,
          repeticoes: ex.repeticoes,
          carga: ex.carga,
          ordem: ex.ordem,
          concluido: ex.concluido,
          descricao: ex.exercicio.descricao,
          execucao: ex.exercicio.execucaoTecnica,
          errosComuns: ex.exercicio.errosComuns,
          gifUrl: ex.exercicio.gifUrl,
          equipamentos: ex.exercicio.equipamentoNecessario
        }))
      };
    })
    .filter((bloco): bloco is NonNullable<typeof bloco> => bloco !== null); // Filtrar treinos sem exercícios

  // Calcular tempo médio apenas dos treinos válidos (com exercícios)
  // Se tempoEstimado não estiver disponível, recalcular baseado nos exercícios
  const treinosComExercicios = treinos.filter(t => t.exercicios && t.exercicios.length > 0)
  
  const calcularTempoRealTreino = (treino: any): number => {
    // Se tem tempoEstimado válido, usar ele
    if (treino.tempoEstimado && treino.tempoEstimado > 0) {
      return treino.tempoEstimado;
    }
    
    // Caso contrário, recalcular baseado nos exercícios
    let tempoTotal = 0;
    
    // Tempo de cardio (primeiro exercício se for cardio)
    const exercicioCardio = treino.exercicios.find((ex: any) => 
      ex.exercicio?.grupoMuscularPrincipal === 'Cardio'
    );
    if (exercicioCardio) {
      const tempoCardioMatch = exercicioCardio.repeticoes?.match(/(\d+)/);
      tempoTotal += tempoCardioMatch ? parseInt(tempoCardioMatch[1], 10) : 10;
    }
    
    // Tempo dos exercícios de força
    treino.exercicios.forEach((ex: any) => {
      const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
      if (grupo !== 'Cardio' && grupo !== 'Flexibilidade') {
        const tempoPorSerie = 30 + (ex.descanso || 90); // 30s execução + descanso
        tempoTotal += (ex.series || 3) * tempoPorSerie / 60; // Converter para minutos
      }
    });
    
    // Tempo de alongamento (último exercício se for alongamento)
    const exercicioAlongamento = treino.exercicios.find((ex: any) => 
      ex.exercicio?.grupoMuscularPrincipal === 'Flexibilidade'
    );
    if (exercicioAlongamento) {
      const tempoAlongMatch = exercicioAlongamento.repeticoes?.match(/(\d+)/);
      tempoTotal += tempoAlongMatch ? parseInt(tempoAlongMatch[1], 10) : 5;
    }
    
    return Math.ceil(tempoTotal);
  };
  
  const tempoMedio = treinosComExercicios.length > 0
    ? Math.round(
        treinosComExercicios.reduce((acc, treino) => acc + calcularTempoRealTreino(treino), 0) / treinosComExercicios.length
      )
    : 0;

  // Grupos principais do primeiro treino válido para a capa
  const primeiroTreinoValido = treinosComExercicios[0]
  const gruposPrimeiro = primeiroTreinoValido 
    ? extrairGruposPrincipais(primeiroTreinoValido.exercicios)
    : [];

  // CORREÇÃO: totalTreinos deve mostrar frequência semanal do usuário, não quantidade de treinos no banco
  const frequenciaSemanal = perfil.frequenciaSemanal || 3;

  return {
    plano: {
      nivel: experiencia,
      tempoMedio,
      local,
      imagemCapa: obterImagemTreino(gruposPrimeiro, genero),
      totalTreinos: frequenciaSemanal // Mostrar frequência configurada, não quantidade de treinos gerados
    },
    blocos,
    genero
  };
}
