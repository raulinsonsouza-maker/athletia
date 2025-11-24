import { prisma } from '../lib/prisma';

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

export async function obterResumoTreinos(userId: string) {
  const perfil = await prisma.perfil.findUnique({
    where: { userId }
  });

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
      destino: '/treino/atual'
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

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

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
    destaquePlanoAtual: planosAtivos[0] || null
  };
}

export async function buscarPlanoAtual(userId: string) {
  const perfil = await prisma.perfil.findUnique({
    where: { userId }
  });

  const experiencia = perfil?.experiencia || 'Intermediário';
  const local = perfil?.localTreino || 'Academia Comercial';

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

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
      ordem: ex.ordem
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
    blocos
  };
}

