import { prisma } from '../lib/prisma';
import { garantirPlanoSemanalInteligente } from './inteligencia-treinos.service';

const CAPAS_TREINO = [
  'https://images.unsplash.com/photo-1517964603305-11c0f6f66012?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1549476464-37392f717541?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1600180758890-6b94519a8c51?auto=format&fit=crop&w=1000&q=80'
];

function selecionarCapa(grupo?: string | null): string {
  if (!grupo) {
    return CAPAS_TREINO[0];
  }

  const index = Math.abs(
    grupo
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % CAPAS_TREINO.length;

  return CAPAS_TREINO[index];
}

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

export async function obterResumoTreinos(userId: string) {
  const perfil = await prisma.perfil.findUnique({
    where: { userId }
  });

  await garantirPlanoSemanalInteligente(userId);

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
    imagem: selecionarCapa(template.gruposMusculares?.[0]),
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

  const planosAtivos = proximosTreinos.map((treino, index) => ({
    id: treino.id,
    titulo: treino.nome || `Treino ${index + 1}`,
    nivel: experiencia,
    duracao: treino.tempoEstimado || 60,
    local: localPreferencial,
    data: treino.data,
    totalExercicios: treino.exercicios.length,
    imagem: selecionarCapa(treino.exercicios[0]?.exercicio?.grupoMuscularPrincipal)
  }));

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
      label: `Dia ${index + 1}`,
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
    recomendacoes
  };
}

export async function buscarPlanoAtual(userId: string) {
  const perfil = await prisma.perfil.findUnique({
    where: { userId }
  });

  await garantirPlanoSemanalInteligente(userId);

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
        imagemCapa: CAPAS_TREINO[0],
        totalTreinos: 0
      },
      blocos: []
    };
  }

  const blocos = treinos.map((treino, index) => ({
    id: treino.id,
    titulo: `Treino ${index + 1}`,
    data: treino.data,
    totalExercicios: treino.exercicios.length,
    exercicios: treino.exercicios.map(ex => ({
      id: ex.id,
      nome: ex.exercicio.nome,
      grupo: ex.exercicio.grupoMuscularPrincipal,
      series: ex.series,
      repeticoes: ex.repeticoes,
      ordem: ex.ordem,
      concluido: ex.concluido,
      descricao: ex.exercicio.descricao,
      execucao: ex.exercicio.execucaoTecnica,
      errosComuns: ex.exercicio.errosComuns,
      gifUrl: ex.exercicio.gifUrl,
      equipamentos: ex.exercicio.equipamentoNecessario
    }))
  }));

  const tempoMedio = Math.round(
    treinos.reduce((acc, treino) => acc + (treino.tempoEstimado || 60), 0) / treinos.length
  );

  return {
    plano: {
      nivel: experiencia,
      tempoMedio,
      local,
      imagemCapa: selecionarCapa(treinos[0].exercicios[0]?.exercicio?.grupoMuscularPrincipal),
      totalTreinos: blocos.length
    },
    blocos,
    genero: perfil?.sexo || null
  };
}

