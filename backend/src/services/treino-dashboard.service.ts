import { prisma } from '../lib/prisma';
import { garantirPlanoSemanal } from './treino-engine.service';
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
  return treino.exercicios.reduce((total: number, exercicio: any) => {
    const repeticoes = extrairRepeticoes(exercicio.repeticoes);
    const carga = exercicio.carga || 0;
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

  const proximosTreinos = await prisma.treino.findMany({
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

  const realizados = treinosSemana.filter(treino => treino.concluido).length;
  const planejados = treinosSemana.length;
  const volumeTotal = treinosSemana.reduce((acc, treino) => acc + calcularVolumeTreino(treino), 0);
  const seriesTotais = treinosSemana.reduce(
    (acc, treino) => acc + treino.exercicios.reduce((soma: number, exercicio: any) => soma + exercicio.series, 0),
    0
  );
  const diasSemTreino = semana.filter(dia => !dia.hasTreino).length;

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

  const blocos = treinos.map((treino) => {
    const gruposPrincipais = extrairGruposPrincipais(treino.exercicios);
    
    return {
      id: treino.id,
      titulo: treino.nome || 'Treino',
      data: treino.data,
      letraTreino: treino.letraTreino,
      gruposPrincipais,
      totalExercicios: treino.exercicios.length,
      imagem: obterImagemTreino(gruposPrincipais, genero),
      exercicios: treino.exercicios.map(ex => ({
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
  });

  const tempoMedio = Math.round(
    treinos.reduce((acc, treino) => acc + (treino.tempoEstimado || 60), 0) / treinos.length
  );

  // Grupos principais do primeiro treino para a capa
  const gruposPrimeiro = extrairGruposPrincipais(treinos[0].exercicios);

  return {
    plano: {
      nivel: experiencia,
      tempoMedio,
      local,
      imagemCapa: obterImagemTreino(gruposPrimeiro, genero),
      totalTreinos: blocos.length
    },
    blocos,
    genero
  };
}
