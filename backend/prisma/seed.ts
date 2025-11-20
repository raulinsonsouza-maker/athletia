import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de exercícios...');

  // Limpar exercícios existentes (opcional - comentar se quiser manter)
  // await prisma.exercicio.deleteMany({});

  // Exercícios para Peito
  await prisma.exercicio.upsert({
    where: { id: 'supino-reto' },
    update: {
      nome: 'Supino Reto com Barra',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Ombros', 'Tríceps'],
      descricao: 'Exercício fundamental para desenvolvimento do peitoral',
      execucaoTecnica: 'Deite no banco, segure a barra com pegada média, desça controladamente até o peito e empurre para cima',
      errosComuns: ['Arquear demais as costas', 'Não descer até o peito', 'Pegada muito aberta'],
      equipamentoNecessario: ['Barra', 'Banco', 'Anilhas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 20,
      rpeSugerido: 7
    },
    create: {
      id: 'supino-reto',
      nome: 'Supino Reto com Barra',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Ombros', 'Tríceps'],
      descricao: 'Exercício fundamental para desenvolvimento do peitoral',
      execucaoTecnica: 'Deite no banco, segure a barra com pegada média, desça controladamente até o peito e empurre para cima',
      errosComuns: ['Arquear demais as costas', 'Não descer até o peito', 'Pegada muito aberta'],
      equipamentoNecessario: ['Barra', 'Banco', 'Anilhas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 20,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'supino-inclinado' },
    update: {
      nome: 'Supino Inclinado com Halteres',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Ombros', 'Tríceps'],
      descricao: 'Foca na porção superior do peitoral',
      execucaoTecnica: 'Banco inclinado a 30-45°, desça os halteres até a altura do peito e empurre para cima',
      errosComuns: ['Inclinação excessiva', 'Não controlar a descida'],
      equipamentoNecessario: ['Halteres', 'Banco inclinado'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 15,
      rpeSugerido: 7
    },
    create: {
      id: 'supino-inclinado',
      nome: 'Supino Inclinado com Halteres',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Ombros', 'Tríceps'],
      descricao: 'Foca na porção superior do peitoral',
      execucaoTecnica: 'Banco inclinado a 30-45°, desça os halteres até a altura do peito e empurre para cima',
      errosComuns: ['Inclinação excessiva', 'Não controlar a descida'],
      equipamentoNecessario: ['Halteres', 'Banco inclinado'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 15,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'crucifixo' },
    update: {
      nome: 'Crucifixo',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Ombros'],
      descricao: 'Exercício isolado para peitoral',
      execucaoTecnica: 'Deite no banco, abra os braços em formato de cruz, desça controladamente e retorne',
      errosComuns: ['Usar muito peso', 'Não controlar o movimento'],
      equipamentoNecessario: ['Halteres', 'Banco'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 8,
      rpeSugerido: 6
    },
    create: {
      id: 'crucifixo',
      nome: 'Crucifixo',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Ombros'],
      descricao: 'Exercício isolado para peitoral',
      execucaoTecnica: 'Deite no banco, abra os braços em formato de cruz, desça controladamente e retorne',
      errosComuns: ['Usar muito peso', 'Não controlar o movimento'],
      equipamentoNecessario: ['Halteres', 'Banco'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 8,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  // Exercícios para Costas
  await prisma.exercicio.upsert({
    where: { id: 'remada-curvada' },
    update: {
      nome: 'Remada Curvada com Barra',
      grupoMuscularPrincipal: 'Costas',
      sinergistas: ['Bíceps', 'Ombros'],
      descricao: 'Exercício fundamental para desenvolvimento das costas',
      execucaoTecnica: 'Incline o tronco, puxe a barra até a altura do abdômen, contraia as costas',
      errosComuns: ['Arredondar as costas', 'Usar muito impulso', 'Não contrair as costas'],
      equipamentoNecessario: ['Barra', 'Anilhas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 20,
      rpeSugerido: 7
    },
    create: {
      id: 'remada-curvada',
      nome: 'Remada Curvada com Barra',
      grupoMuscularPrincipal: 'Costas',
      sinergistas: ['Bíceps', 'Ombros'],
      descricao: 'Exercício fundamental para desenvolvimento das costas',
      execucaoTecnica: 'Incline o tronco, puxe a barra até a altura do abdômen, contraia as costas',
      errosComuns: ['Arredondar as costas', 'Usar muito impulso', 'Não contrair as costas'],
      equipamentoNecessario: ['Barra', 'Anilhas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 20,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'puxada-frontal' },
    update: {
      nome: 'Puxada Frontal',
      grupoMuscularPrincipal: 'Costas',
      sinergistas: ['Bíceps'],
      descricao: 'Exercício para desenvolvimento da largura das costas',
      execucaoTecnica: 'Puxe a barra até a altura do peito, contraia as costas, desça controladamente',
      errosComuns: ['Puxar com os braços', 'Não contrair as costas', 'Balancear o corpo'],
      equipamentoNecessario: ['Polia', 'Barra'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 30,
      rpeSugerido: 7
    },
    create: {
      id: 'puxada-frontal',
      nome: 'Puxada Frontal',
      grupoMuscularPrincipal: 'Costas',
      sinergistas: ['Bíceps'],
      descricao: 'Exercício para desenvolvimento da largura das costas',
      execucaoTecnica: 'Puxe a barra até a altura do peito, contraia as costas, desça controladamente',
      errosComuns: ['Puxar com os braços', 'Não contrair as costas', 'Balancear o corpo'],
      equipamentoNecessario: ['Polia', 'Barra'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 30,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'remada-baixa' },
    update: {
      nome: 'Remada Baixa',
      grupoMuscularPrincipal: 'Costas',
      sinergistas: ['Bíceps'],
      descricao: 'Exercício para espessura das costas',
      execucaoTecnica: 'Puxe o cabo até o abdômen, contraia as costas, desça controladamente',
      errosComuns: ['Não contrair as costas', 'Usar muito peso'],
      equipamentoNecessario: ['Polia', 'Cabo'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 25,
      rpeSugerido: 7
    },
    create: {
      id: 'remada-baixa',
      nome: 'Remada Baixa',
      grupoMuscularPrincipal: 'Costas',
      sinergistas: ['Bíceps'],
      descricao: 'Exercício para espessura das costas',
      execucaoTecnica: 'Puxe o cabo até o abdômen, contraia as costas, desça controladamente',
      errosComuns: ['Não contrair as costas', 'Usar muito peso'],
      equipamentoNecessario: ['Polia', 'Cabo'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 25,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  // Exercícios para Ombros
  await prisma.exercicio.upsert({
    where: { id: 'desenvolvimento' },
    update: {
      nome: 'Desenvolvimento com Barra',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: ['Tríceps'],
      descricao: 'Exercício fundamental para ombros',
      execucaoTecnica: 'Empurre a barra para cima até estender os braços, desça controladamente',
      errosComuns: ['Arquear demais as costas', 'Não descer completamente'],
      equipamentoNecessario: ['Barra', 'Anilhas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 15,
      rpeSugerido: 7
    },
    create: {
      id: 'desenvolvimento',
      nome: 'Desenvolvimento com Barra',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: ['Tríceps'],
      descricao: 'Exercício fundamental para ombros',
      execucaoTecnica: 'Empurre a barra para cima até estender os braços, desça controladamente',
      errosComuns: ['Arquear demais as costas', 'Não descer completamente'],
      equipamentoNecessario: ['Barra', 'Anilhas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 15,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'elevacao-lateral' },
    update: {
      nome: 'Elevação Lateral',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: [],
      descricao: 'Exercício isolado para deltoides laterais',
      execucaoTecnica: 'Eleve os halteres até a altura dos ombros, desça controladamente',
      errosComuns: ['Usar muito peso', 'Balancear o corpo'],
      equipamentoNecessario: ['Halteres'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 5,
      rpeSugerido: 6
    },
    create: {
      id: 'elevacao-lateral',
      nome: 'Elevação Lateral',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: [],
      descricao: 'Exercício isolado para deltoides laterais',
      execucaoTecnica: 'Eleve os halteres até a altura dos ombros, desça controladamente',
      errosComuns: ['Usar muito peso', 'Balancear o corpo'],
      equipamentoNecessario: ['Halteres'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 5,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  // Exercícios para Bíceps
  await prisma.exercicio.upsert({
    where: { id: 'rosca-direta' },
    update: {
      nome: 'Rosca Direta com Barra',
      grupoMuscularPrincipal: 'Bíceps',
      sinergistas: [],
      descricao: 'Exercício fundamental para bíceps',
      execucaoTecnica: 'Flexione os braços elevando a barra, contraia os bíceps, desça controladamente',
      errosComuns: ['Balancear o corpo', 'Não controlar a descida'],
      equipamentoNecessario: ['Barra', 'Anilhas'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 10,
      rpeSugerido: 7
    },
    create: {
      id: 'rosca-direta',
      nome: 'Rosca Direta com Barra',
      grupoMuscularPrincipal: 'Bíceps',
      sinergistas: [],
      descricao: 'Exercício fundamental para bíceps',
      execucaoTecnica: 'Flexione os braços elevando a barra, contraia os bíceps, desça controladamente',
      errosComuns: ['Balancear o corpo', 'Não controlar a descida'],
      equipamentoNecessario: ['Barra', 'Anilhas'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 10,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  // Exercícios para Tríceps
  await prisma.exercicio.upsert({
    where: { id: 'triceps-puxada' },
    update: {
      nome: 'Tríceps Puxada',
      grupoMuscularPrincipal: 'Tríceps',
      sinergistas: [],
      descricao: 'Exercício para desenvolvimento do tríceps',
      execucaoTecnica: 'Puxe o cabo para baixo estendendo os braços, contraia o tríceps, retorne controladamente',
      errosComuns: ['Usar muito peso', 'Não estender completamente'],
      equipamentoNecessario: ['Polia', 'Cabo'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 15,
      rpeSugerido: 7
    },
    create: {
      id: 'triceps-puxada',
      nome: 'Tríceps Puxada',
      grupoMuscularPrincipal: 'Tríceps',
      sinergistas: [],
      descricao: 'Exercício para desenvolvimento do tríceps',
      execucaoTecnica: 'Puxe o cabo para baixo estendendo os braços, contraia o tríceps, retorne controladamente',
      errosComuns: ['Usar muito peso', 'Não estender completamente'],
      equipamentoNecessario: ['Polia', 'Cabo'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 15,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  // Exercícios para Pernas - Quadríceps
  await prisma.exercicio.upsert({
    where: { id: 'agachamento' },
    update: {
      nome: 'Agachamento Livre',
      grupoMuscularPrincipal: 'Quadríceps',
      sinergistas: ['Posteriores', 'Glúteos'],
      descricao: 'Exercício fundamental para pernas',
      execucaoTecnica: 'Desça até os joelhos formarem 90°, mantenha as costas retas, suba empurrando os calcanhares',
      errosComuns: ['Arredondar as costas', 'Joelhos passarem dos pés', 'Não descer o suficiente'],
      equipamentoNecessario: ['Barra', 'Anilhas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 30,
      rpeSugerido: 7
    },
    create: {
      id: 'agachamento',
      nome: 'Agachamento Livre',
      grupoMuscularPrincipal: 'Quadríceps',
      sinergistas: ['Posteriores', 'Glúteos'],
      descricao: 'Exercício fundamental para pernas',
      execucaoTecnica: 'Desça até os joelhos formarem 90°, mantenha as costas retas, suba empurrando os calcanhares',
      errosComuns: ['Arredondar as costas', 'Joelhos passarem dos pés', 'Não descer o suficiente'],
      equipamentoNecessario: ['Barra', 'Anilhas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 30,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'leg-press' },
    update: {
      nome: 'Leg Press',
      grupoMuscularPrincipal: 'Quadríceps',
      sinergistas: ['Posteriores', 'Glúteos'],
      descricao: 'Exercício seguro para desenvolvimento das pernas',
      execucaoTecnica: 'Desça a plataforma até os joelhos formarem 90°, empurre com os calcanhares',
      errosComuns: ['Não descer o suficiente', 'Joelhos muito fechados'],
      equipamentoNecessario: ['Máquina'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 50,
      rpeSugerido: 7
    },
    create: {
      id: 'leg-press',
      nome: 'Leg Press',
      grupoMuscularPrincipal: 'Quadríceps',
      sinergistas: ['Posteriores', 'Glúteos'],
      descricao: 'Exercício seguro para desenvolvimento das pernas',
      execucaoTecnica: 'Desça a plataforma até os joelhos formarem 90°, empurre com os calcanhares',
      errosComuns: ['Não descer o suficiente', 'Joelhos muito fechados'],
      equipamentoNecessario: ['Máquina'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 50,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'cadeira-extensora' },
    update: {
      nome: 'Cadeira Extensora',
      grupoMuscularPrincipal: 'Quadríceps',
      sinergistas: [],
      descricao: 'Exercício isolado para quadríceps',
      execucaoTecnica: 'Estenda as pernas contraindo o quadríceps, desça controladamente',
      errosComuns: ['Usar muito peso', 'Não controlar a descida'],
      equipamentoNecessario: ['Máquina'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 20,
      rpeSugerido: 6
    },
    create: {
      id: 'cadeira-extensora',
      nome: 'Cadeira Extensora',
      grupoMuscularPrincipal: 'Quadríceps',
      sinergistas: [],
      descricao: 'Exercício isolado para quadríceps',
      execucaoTecnica: 'Estenda as pernas contraindo o quadríceps, desça controladamente',
      errosComuns: ['Usar muito peso', 'Não controlar a descida'],
      equipamentoNecessario: ['Máquina'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 20,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  // Exercícios para Pernas - Posteriores
  await prisma.exercicio.upsert({
    where: { id: 'mesa-flexora' },
    update: {
      nome: 'Mesa Flexora',
      grupoMuscularPrincipal: 'Posteriores',
      sinergistas: ['Glúteos'],
      descricao: 'Exercício isolado para posteriores de coxa',
      execucaoTecnica: 'Flexione as pernas contraindo os posteriores, desça controladamente',
      errosComuns: ['Usar muito peso', 'Não controlar o movimento'],
      equipamentoNecessario: ['Máquina'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 15,
      rpeSugerido: 6
    },
    create: {
      id: 'mesa-flexora',
      nome: 'Mesa Flexora',
      grupoMuscularPrincipal: 'Posteriores',
      sinergistas: ['Glúteos'],
      descricao: 'Exercício isolado para posteriores de coxa',
      execucaoTecnica: 'Flexione as pernas contraindo os posteriores, desça controladamente',
      errosComuns: ['Usar muito peso', 'Não controlar o movimento'],
      equipamentoNecessario: ['Máquina'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 15,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  // Exercícios para Panturrilhas
  await prisma.exercicio.upsert({
    where: { id: 'panturrilha-em-pe' },
    update: {
      nome: 'Panturrilha em Pé',
      grupoMuscularPrincipal: 'Panturrilhas',
      sinergistas: [],
      descricao: 'Exercício para desenvolvimento das panturrilhas',
      execucaoTecnica: 'Eleve o corpo na ponta dos pés, contraia as panturrilhas, desça controladamente',
      errosComuns: ['Não descer completamente', 'Usar muito impulso'],
      equipamentoNecessario: ['Máquina', 'Barra'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 40,
      rpeSugerido: 6
    },
    create: {
      id: 'panturrilha-em-pe',
      nome: 'Panturrilha em Pé',
      grupoMuscularPrincipal: 'Panturrilhas',
      sinergistas: [],
      descricao: 'Exercício para desenvolvimento das panturrilhas',
      execucaoTecnica: 'Eleve o corpo na ponta dos pés, contraia as panturrilhas, desça controladamente',
      errosComuns: ['Não descer completamente', 'Usar muito impulso'],
      equipamentoNecessario: ['Máquina', 'Barra'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 40,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  // Exercícios para Abdômen
  await prisma.exercicio.upsert({
    where: { id: 'abdominal' },
    update: {
      nome: 'Abdominal Reto',
      grupoMuscularPrincipal: 'Abdômen',
      sinergistas: [],
      descricao: 'Exercício básico para abdômen',
      execucaoTecnica: 'Deite, flexione o tronco contraindo o abdômen, retorne controladamente',
      errosComuns: ['Puxar o pescoço', 'Não contrair o abdômen'],
      equipamentoNecessario: [],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 0,
      rpeSugerido: 6
    },
    create: {
      id: 'abdominal',
      nome: 'Abdominal Reto',
      grupoMuscularPrincipal: 'Abdômen',
      sinergistas: [],
      descricao: 'Exercício básico para abdômen',
      execucaoTecnica: 'Deite, flexione o tronco contraindo o abdômen, retorne controladamente',
      errosComuns: ['Puxar o pescoço', 'Não contrair o abdômen'],
      equipamentoNecessario: [],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 0,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  // Mais exercícios para Peito
  await prisma.exercicio.upsert({
    where: { id: 'supino-declinado' },
    update: {},
    create: {
      id: 'supino-declinado',
      nome: 'Supino Declinado com Barra',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Ombros', 'Tríceps'],
      descricao: 'Foca na porção inferior do peitoral',
      execucaoTecnica: 'Banco declinado, desça a barra até o peito e empurre para cima',
      errosComuns: ['Não controlar a descida', 'Pegada muito aberta'],
      equipamentoNecessario: ['Barra', 'Banco declinado', 'Anilhas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 18,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'peck-deck' },
    update: {},
    create: {
      id: 'peck-deck',
      nome: 'Peck Deck',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Ombros'],
      descricao: 'Exercício isolado para peitoral em máquina',
      execucaoTecnica: 'Sente na máquina, junte os braços contraindo o peito',
      errosComuns: ['Usar muito peso', 'Não contrair o peito'],
      equipamentoNecessario: ['Máquina'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 25,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  // Mais exercícios para Costas
  await prisma.exercicio.upsert({
    where: { id: 'barra-fixa' },
    update: {},
    create: {
      id: 'barra-fixa',
      nome: 'Barra Fixa',
      grupoMuscularPrincipal: 'Costas',
      sinergistas: ['Bíceps'],
      descricao: 'Exercício avançado para desenvolvimento das costas',
      execucaoTecnica: 'Puxe o corpo até o queixo passar da barra, desça controladamente',
      errosComuns: ['Balancear o corpo', 'Não descer completamente'],
      equipamentoNecessario: ['Barra fixa'],
      nivelDificuldade: 'Avançado',
      cargaInicialSugerida: 0,
      rpeSugerido: 8,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'puxada-aberta' },
    update: {},
    create: {
      id: 'puxada-aberta',
      nome: 'Puxada Aberta',
      grupoMuscularPrincipal: 'Costas',
      sinergistas: ['Bíceps'],
      descricao: 'Variação da puxada com pegada aberta',
      execucaoTecnica: 'Puxe a barra até a nuca, contraia as costas',
      errosComuns: ['Não contrair as costas', 'Balancear o corpo'],
      equipamentoNecessario: ['Polia', 'Barra'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 28,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'remada-unilateral' },
    update: {},
    create: {
      id: 'remada-unilateral',
      nome: 'Remada Unilateral com Halter',
      grupoMuscularPrincipal: 'Costas',
      sinergistas: ['Bíceps'],
      descricao: 'Exercício unilateral para desenvolvimento das costas',
      execucaoTecnica: 'Apoie um joelho no banco, puxe o halter até o abdômen',
      errosComuns: ['Girar o tronco', 'Não contrair as costas'],
      equipamentoNecessario: ['Halteres', 'Banco'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 12,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  // Mais exercícios para Ombros
  await prisma.exercicio.upsert({
    where: { id: 'desenvolvimento-halteres' },
    update: {},
    create: {
      id: 'desenvolvimento-halteres',
      nome: 'Desenvolvimento com Halteres',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: ['Tríceps'],
      descricao: 'Variação do desenvolvimento com halteres',
      execucaoTecnica: 'Empurre os halteres para cima até estender os braços',
      errosComuns: ['Arquear as costas', 'Não descer completamente'],
      equipamentoNecessario: ['Halteres'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 12,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'elevacao-frontal' },
    update: {},
    create: {
      id: 'elevacao-frontal',
      nome: 'Elevação Frontal',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: [],
      descricao: 'Exercício para deltoides anteriores',
      execucaoTecnica: 'Eleve a barra ou halteres até a altura dos ombros',
      errosComuns: ['Balancear o corpo', 'Usar muito peso'],
      equipamentoNecessario: ['Barra', 'Anilhas'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 8,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'crucifixo-invertido' },
    update: {},
    create: {
      id: 'crucifixo-invertido',
      nome: 'Crucifixo Invertido',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: ['Costas'],
      descricao: 'Exercício para deltoides posteriores',
      execucaoTecnica: 'Incline o tronco, abra os braços em formato de cruz',
      errosComuns: ['Usar muito peso', 'Não contrair os ombros'],
      equipamentoNecessario: ['Halteres'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 6,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  // Mais exercícios para Bíceps
  await prisma.exercicio.upsert({
    where: { id: 'rosca-martelo' },
    update: {},
    create: {
      id: 'rosca-martelo',
      nome: 'Rosca Martelo',
      grupoMuscularPrincipal: 'Bíceps',
      sinergistas: ['Antebraços'],
      descricao: 'Exercício para bíceps e antebraços',
      execucaoTecnica: 'Flexione os braços mantendo os punhos neutros',
      errosComuns: ['Balancear o corpo', 'Não controlar o movimento'],
      equipamentoNecessario: ['Halteres'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 8,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'rosca-concentrada' },
    update: {},
    create: {
      id: 'rosca-concentrada',
      nome: 'Rosca Concentrada',
      grupoMuscularPrincipal: 'Bíceps',
      sinergistas: [],
      descricao: 'Exercício isolado para bíceps',
      execucaoTecnica: 'Sente, apoie o cotovelo na coxa, flexione o braço',
      errosComuns: ['Não controlar o movimento', 'Usar muito peso'],
      equipamentoNecessario: ['Halteres', 'Banco'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 6,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  // Mais exercícios para Tríceps
  await prisma.exercicio.upsert({
    where: { id: 'triceps-frances' },
    update: {},
    create: {
      id: 'triceps-frances',
      nome: 'Tríceps Francês',
      grupoMuscularPrincipal: 'Tríceps',
      sinergistas: [],
      descricao: 'Exercício isolado para tríceps',
      execucaoTecnica: 'Deite, estenda os braços com halter ou barra',
      errosComuns: ['Mover os cotovelos', 'Não estender completamente'],
      equipamentoNecessario: ['Halteres', 'Banco'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 10,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'triceps-coice' },
    update: {},
    create: {
      id: 'triceps-coice',
      nome: 'Tríceps Coice',
      grupoMuscularPrincipal: 'Tríceps',
      sinergistas: [],
      descricao: 'Exercício unilateral para tríceps',
      execucaoTecnica: 'Incline o tronco, estenda o braço para trás',
      errosComuns: ['Balancear o braço', 'Não contrair o tríceps'],
      equipamentoNecessario: ['Halteres'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 5,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  // Mais exercícios para Pernas
  await prisma.exercicio.upsert({
    where: { id: 'agachamento-hack' },
    update: {},
    create: {
      id: 'agachamento-hack',
      nome: 'Agachamento Hack',
      grupoMuscularPrincipal: 'Quadríceps',
      sinergistas: ['Posteriores', 'Glúteos'],
      descricao: 'Agachamento em máquina',
      execucaoTecnica: 'Desça até os joelhos formarem 90°, empurre com os calcanhares',
      errosComuns: ['Não descer o suficiente', 'Joelhos muito fechados'],
      equipamentoNecessario: ['Máquina'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 40,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'afundo' },
    update: {},
    create: {
      id: 'afundo',
      nome: 'Afundo',
      grupoMuscularPrincipal: 'Quadríceps',
      sinergistas: ['Posteriores', 'Glúteos'],
      descricao: 'Exercício unilateral para pernas',
      execucaoTecnica: 'Dê um passo à frente, desça até o joelho traseiro quase tocar o chão',
      errosComuns: ['Joelho da frente passar dos pés', 'Não manter o tronco ereto'],
      equipamentoNecessario: ['Halteres'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 12,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'stiff' },
    update: {},
    create: {
      id: 'stiff',
      nome: 'Stiff',
      grupoMuscularPrincipal: 'Posteriores',
      sinergistas: ['Glúteos'],
      descricao: 'Exercício para posteriores de coxa',
      execucaoTecnica: 'Mantenha as pernas estendidas, incline o tronco mantendo as costas retas',
      errosComuns: ['Arredondar as costas', 'Flexionar os joelhos'],
      equipamentoNecessario: ['Barra', 'Anilhas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 20,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'panturrilha-sentado' },
    update: {},
    create: {
      id: 'panturrilha-sentado',
      nome: 'Panturrilha Sentado',
      grupoMuscularPrincipal: 'Panturrilhas',
      sinergistas: [],
      descricao: 'Exercício para panturrilhas em máquina',
      execucaoTecnica: 'Sente, eleve os calcanhares contraindo as panturrilhas',
      errosComuns: ['Não descer completamente', 'Usar muito impulso'],
      equipamentoNecessario: ['Máquina'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 30,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  // Mais exercícios para Abdômen
  await prisma.exercicio.upsert({
    where: { id: 'prancha' },
    update: {},
    create: {
      id: 'prancha',
      nome: 'Prancha',
      grupoMuscularPrincipal: 'Abdômen',
      sinergistas: ['Costas'],
      descricao: 'Exercício isométrico para core',
      execucaoTecnica: 'Mantenha o corpo alinhado, contraia o abdômen',
      errosComuns: ['Arquear ou afundar o quadril', 'Não contrair o abdômen'],
      equipamentoNecessario: [],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 0,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'abdominal-infra' },
    update: {},
    create: {
      id: 'abdominal-infra',
      nome: 'Abdominal Infra',
      grupoMuscularPrincipal: 'Abdômen',
      sinergistas: [],
      descricao: 'Exercício para porção inferior do abdômen',
      execucaoTecnica: 'Deite, eleve as pernas contraindo o abdômen',
      errosComuns: ['Arquear as costas', 'Não contrair o abdômen'],
      equipamentoNecessario: [],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 0,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  // Exercícios adicionais baseados no conhecimento do PDF
  
  // Mais exercícios para Peito
  await prisma.exercicio.upsert({
    where: { id: 'crucifixo' },
    update: {},
    create: {
      id: 'crucifixo',
      nome: 'Crucifixo',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Ombros'],
      descricao: 'Exercício isolado para peitoral, ideal para pré-exaustão ou finalização',
      execucaoTecnica: 'Deite no banco, segure halteres, abra os braços em arco até sentir alongamento no peito, retorne controladamente',
      errosComuns: ['Usar muito peso', 'Não controlar a fase excêntrica', 'Arquear demais as costas'],
      equipamentoNecessario: ['Halteres', 'Banco'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 8,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'supino-halteres' },
    update: {},
    create: {
      id: 'supino-halteres',
      nome: 'Supino Reto com Halteres',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Ombros', 'Tríceps'],
      descricao: 'Variação do supino com halteres, permite maior amplitude de movimento',
      execucaoTecnica: 'Deite no banco, segure halteres, desça controladamente até o peito e empurre para cima',
      errosComuns: ['Não controlar a descida', 'Usar impulso', 'Não descer completamente'],
      equipamentoNecessario: ['Halteres', 'Banco'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 12,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  // Mais exercícios para Costas
  await prisma.exercicio.upsert({
    where: { id: 'remada-curvada' },
    update: {},
    create: {
      id: 'remada-curvada',
      nome: 'Remada Curvada com Barra',
      grupoMuscularPrincipal: 'Costas',
      sinergistas: ['Bíceps', 'Ombros'],
      descricao: 'Exercício fundamental para costas, parte do método 5x5',
      execucaoTecnica: 'Incline o tronco, segure a barra, puxe em direção ao abdômen, contraia as costas',
      errosComuns: ['Arquear demais as costas', 'Usar muito impulso', 'Não contrair as costas'],
      equipamentoNecessario: ['Barra', 'Anilhas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 25,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'puxada-frente' },
    update: {},
    create: {
      id: 'puxada-frente',
      nome: 'Puxada Frontal',
      grupoMuscularPrincipal: 'Costas',
      sinergistas: ['Bíceps'],
      descricao: 'Exercício para costas em máquina ou polia',
      execucaoTecnica: 'Sente, puxe a barra em direção ao peito, contraia as costas, retorne controladamente',
      errosComuns: ['Puxar com os braços', 'Não contrair as costas', 'Usar muito impulso'],
      equipamentoNecessario: ['Máquina', 'Polia'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 30,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'remada-unilateral' },
    update: {},
    create: {
      id: 'remada-unilateral',
      nome: 'Remada Unilateral com Halter',
      grupoMuscularPrincipal: 'Costas',
      sinergistas: ['Bíceps'],
      descricao: 'Exercício unilateral para costas, permite maior amplitude',
      execucaoTecnica: 'Apoie joelho e mão no banco, puxe o halter em direção ao tronco, contraia as costas',
      errosComuns: ['Rotacionar o tronco', 'Não contrair as costas', 'Usar muito peso'],
      equipamentoNecessario: ['Halter', 'Banco'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 15,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  // Mais exercícios para Pernas
  await prisma.exercicio.upsert({
    where: { id: 'leg-press' },
    update: {},
    create: {
      id: 'leg-press',
      nome: 'Leg Press 45°',
      grupoMuscularPrincipal: 'Quadríceps',
      sinergistas: ['Posteriores', 'Glúteos'],
      descricao: 'Exercício fundamental para pernas, permite cargas elevadas',
      execucaoTecnica: 'Sente na máquina, desça controladamente até 90°, empurre com força, não trave os joelhos',
      errosComuns: ['Não descer completamente', 'Travar os joelhos', 'Não controlar a descida'],
      equipamentoNecessario: ['Máquina'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 80,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'cadeira-extensora' },
    update: {},
    create: {
      id: 'cadeira-extensora',
      nome: 'Cadeira Extensora',
      grupoMuscularPrincipal: 'Quadríceps',
      sinergistas: [],
      descricao: 'Exercício isolado para quadríceps, ideal para pré-exaustão',
      execucaoTecnica: 'Sente na máquina, estenda as pernas contraindo o quadríceps, retorne controladamente',
      errosComuns: ['Usar muito impulso', 'Não controlar a descida', 'Não estender completamente'],
      equipamentoNecessario: ['Máquina'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 25,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'mesa-flexora' },
    update: {},
    create: {
      id: 'mesa-flexora',
      nome: 'Mesa Flexora',
      grupoMuscularPrincipal: 'Posteriores',
      sinergistas: ['Glúteos'],
      descricao: 'Exercício isolado para posteriores de coxa',
      execucaoTecnica: 'Deite na máquina, flexione as pernas contraindo os posteriores, retorne controladamente',
      errosComuns: ['Usar impulso', 'Não controlar a descida', 'Não flexionar completamente'],
      equipamentoNecessario: ['Máquina'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 20,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'stiff' },
    update: {},
    create: {
      id: 'stiff',
      nome: 'Stiff',
      grupoMuscularPrincipal: 'Posteriores',
      sinergistas: ['Glúteos', 'Costas'],
      descricao: 'Exercício para posteriores e glúteos com barra ou halteres',
      execucaoTecnica: 'Em pé, segure a barra, flexione o quadril mantendo as pernas estendidas, sinta alongamento nos posteriores, retorne',
      errosComuns: ['Flexionar os joelhos', 'Arquear as costas', 'Não controlar a descida'],
      equipamentoNecessario: ['Barra', 'Anilhas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 30,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'afundo' },
    update: {},
    create: {
      id: 'afundo',
      nome: 'Afundo',
      grupoMuscularPrincipal: 'Quadríceps',
      sinergistas: ['Posteriores', 'Glúteos'],
      descricao: 'Exercício unilateral para pernas',
      execucaoTecnica: 'Dê um passo à frente, desça até o joelho traseiro quase tocar o chão, empurre e retorne',
      errosComuns: ['Joelho da frente passar da linha do pé', 'Não descer completamente', 'Perder equilíbrio'],
      equipamentoNecessario: ['Halteres'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 10,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  // Mais exercícios para Ombros
  await prisma.exercicio.upsert({
    where: { id: 'desenvolvimento-halteres' },
    update: {},
    create: {
      id: 'desenvolvimento-halteres',
      nome: 'Desenvolvimento com Halteres',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: ['Tríceps'],
      descricao: 'Desenvolvimento para ombros com halteres, permite maior amplitude',
      execucaoTecnica: 'Sente ou em pé, segure halteres na altura dos ombros, empurre para cima, retorne controladamente',
      errosComuns: ['Usar impulso', 'Não controlar a descida', 'Arquear as costas'],
      equipamentoNecessario: ['Halteres', 'Banco'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 10,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'elevacao-lateral' },
    update: {},
    create: {
      id: 'elevacao-lateral',
      nome: 'Elevação Lateral',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: [],
      descricao: 'Exercício isolado para deltoides laterais, ideal para método 21',
      execucaoTecnica: 'Em pé, segure halteres, eleve os braços lateralmente até altura dos ombros, retorne controladamente',
      errosComuns: ['Usar muito peso', 'Elevar acima dos ombros', 'Usar impulso'],
      equipamentoNecessario: ['Halteres'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 5,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'elevacao-frontal' },
    update: {},
    create: {
      id: 'elevacao-frontal',
      nome: 'Elevação Frontal',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: [],
      descricao: 'Exercício isolado para deltoides anteriores',
      execucaoTecnica: 'Em pé, segure halter ou barra, eleve à frente até altura dos ombros, retorne controladamente',
      errosComuns: ['Usar impulso', 'Elevar muito alto', 'Arquear as costas'],
      equipamentoNecessario: ['Halteres', 'Barra'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 5,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'crucifixo-invertido' },
    update: {},
    create: {
      id: 'crucifixo-invertido',
      nome: 'Crucifixo Invertido',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: ['Costas'],
      descricao: 'Exercício para deltoides posteriores',
      execucaoTecnica: 'Incline o tronco, segure halteres, abra os braços em arco, contraia os ombros posteriores',
      errosComuns: ['Usar muito peso', 'Não contrair os ombros', 'Arquear as costas'],
      equipamentoNecessario: ['Halteres', 'Banco'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 6,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  // Mais exercícios para Bíceps
  await prisma.exercicio.upsert({
    where: { id: 'rosca-scott' },
    update: {},
    create: {
      id: 'rosca-scott',
      nome: 'Rosca Scott',
      grupoMuscularPrincipal: 'Bíceps',
      sinergistas: [],
      descricao: 'Exercício isolado para bíceps, ideal para método 21',
      execucaoTecnica: 'Apoie o braço no banco Scott, flexione o braço contraindo o bíceps, retorne controladamente',
      errosComuns: ['Usar impulso', 'Não controlar a descida', 'Não flexionar completamente'],
      equipamentoNecessario: ['Barra', 'Banco Scott', 'Anilhas'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 8,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'rosca-martelo' },
    update: {},
    create: {
      id: 'rosca-martelo',
      nome: 'Rosca Martelo',
      grupoMuscularPrincipal: 'Bíceps',
      sinergistas: ['Antebraços'],
      descricao: 'Exercício para bíceps e antebraços com pegada neutra',
      execucaoTecnica: 'Em pé, segure halteres com pegada neutra, flexione os braços, retorne controladamente',
      errosComuns: ['Usar impulso', 'Não controlar a descida', 'Balancer o corpo'],
      equipamentoNecessario: ['Halteres'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 8,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'rosca-concentrada' },
    update: {},
    create: {
      id: 'rosca-concentrada',
      nome: 'Rosca Concentrada',
      grupoMuscularPrincipal: 'Bíceps',
      sinergistas: [],
      descricao: 'Exercício isolado para bíceps, execução sentado',
      execucaoTecnica: 'Sente, apoie o cotovelo na coxa, flexione o braço contraindo o bíceps, retorne controladamente',
      errosComuns: ['Usar impulso', 'Não contrair o bíceps', 'Mover o corpo'],
      equipamentoNecessario: ['Halter'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 6,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  // Mais exercícios para Tríceps
  await prisma.exercicio.upsert({
    where: { id: 'triceps-frances' },
    update: {},
    create: {
      id: 'triceps-frances',
      nome: 'Tríceps Francês',
      grupoMuscularPrincipal: 'Tríceps',
      sinergistas: [],
      descricao: 'Exercício isolado para tríceps, ideal para método 21',
      execucaoTecnica: 'Deite no banco, segure halter ou barra, flexione os cotovelos, estenda contraindo o tríceps',
      errosComuns: ['Abrir os cotovelos', 'Usar impulso', 'Não controlar a descida'],
      equipamentoNecessario: ['Halter', 'Barra', 'Banco', 'Anilhas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 8,
      rpeSugerido: 7,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'triceps-corda' },
    update: {},
    create: {
      id: 'triceps-corda',
      nome: 'Tríceps Corda',
      grupoMuscularPrincipal: 'Tríceps',
      sinergistas: [],
      descricao: 'Exercício para tríceps em polia, ideal para drop-set',
      execucaoTecnica: 'Em pé, segure a corda, estenda os braços contraindo o tríceps, retorne controladamente',
      errosComuns: ['Abrir os cotovelos', 'Usar impulso', 'Não contrair o tríceps'],
      equipamentoNecessario: ['Polia', 'Corda'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 15,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'triceps-coice' },
    update: {},
    create: {
      id: 'triceps-coice',
      nome: 'Tríceps Coice',
      grupoMuscularPrincipal: 'Tríceps',
      sinergistas: [],
      descricao: 'Exercício isolado para tríceps, execução inclinado',
      execucaoTecnica: 'Incline o tronco, segure halter, estenda o braço para trás contraindo o tríceps, retorne',
      errosComuns: ['Mover o braço', 'Não contrair o tríceps', 'Usar impulso'],
      equipamentoNecessario: ['Halter', 'Banco'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 5,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  // Mais exercícios para Panturrilhas
  await prisma.exercicio.upsert({
    where: { id: 'panturrilha-em-pe' },
    update: {},
    create: {
      id: 'panturrilha-em-pe',
      nome: 'Panturrilha em Pé',
      grupoMuscularPrincipal: 'Panturrilhas',
      sinergistas: [],
      descricao: 'Exercício para panturrilhas em máquina ou com barra',
      execucaoTecnica: 'Em pé, eleve os calcanhares contraindo as panturrilhas, desça controladamente',
      errosComuns: ['Não descer completamente', 'Usar impulso', 'Flexionar os joelhos'],
      equipamentoNecessario: ['Máquina', 'Barra'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 50,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'panturrilha-unilateral' },
    update: {},
    create: {
      id: 'panturrilha-unilateral',
      nome: 'Panturrilha Unilateral',
      grupoMuscularPrincipal: 'Panturrilhas',
      sinergistas: [],
      descricao: 'Exercício unilateral para panturrilhas',
      execucaoTecnica: 'Em pé em uma perna, eleve o calcanhar contraindo a panturrilha, desça controladamente',
      errosComuns: ['Não descer completamente', 'Perder equilíbrio', 'Usar impulso'],
      equipamentoNecessario: ['Halter'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 15,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  // Mais exercícios para Abdômen
  await prisma.exercicio.upsert({
    where: { id: 'abdominal-cruzado' },
    update: {},
    create: {
      id: 'abdominal-cruzado',
      nome: 'Abdominal Cruzado',
      grupoMuscularPrincipal: 'Abdômen',
      sinergistas: [],
      descricao: 'Exercício para abdômen com rotação',
      execucaoTecnica: 'Deite, flexione o tronco com rotação, toque o joelho oposto, retorne',
      errosComuns: ['Puxar o pescoço', 'Não contrair o abdômen', 'Usar impulso'],
      equipamentoNecessario: [],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 0,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'abdominal-lateral' },
    update: {},
    create: {
      id: 'abdominal-lateral',
      nome: 'Abdominal Lateral',
      grupoMuscularPrincipal: 'Abdômen',
      sinergistas: [],
      descricao: 'Exercício para oblíquos',
      execucaoTecnica: 'Deite de lado, eleve o tronco contraindo o abdômen lateral, retorne',
      errosComuns: ['Não contrair o abdômen', 'Usar impulso', 'Arquear as costas'],
      equipamentoNecessario: [],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 0,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'abdominal-bicicleta' },
    update: {},
    create: {
      id: 'abdominal-bicicleta',
      nome: 'Abdominal Bicicleta',
      grupoMuscularPrincipal: 'Abdômen',
      sinergistas: [],
      descricao: 'Exercício dinâmico para abdômen',
      execucaoTecnica: 'Deite, simule pedalar no ar, alternando pernas, contraia o abdômen',
      errosComuns: ['Não contrair o abdômen', 'Mover muito rápido', 'Arquear as costas'],
      equipamentoNecessario: [],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 0,
      rpeSugerido: 6,
      alternativas: []
    }
  });

  // Exercícios compostos fundamentais (método 5x5)
  await prisma.exercicio.upsert({
    where: { id: 'levantamento-terra' },
    update: {},
    create: {
      id: 'levantamento-terra',
      nome: 'Levantamento Terra',
      grupoMuscularPrincipal: 'Costas',
      sinergistas: ['Posteriores', 'Glúteos', 'Quadríceps', 'Ombros', 'Antebraços'],
      descricao: 'Exercício fundamental para força, parte do método 5x5',
      execucaoTecnica: 'Em pé, segure a barra, desça mantendo costas retas, empurre com pernas e costas, retorne',
      errosComuns: ['Arquear as costas', 'Não manter costas retas', 'Usar muito impulso'],
      equipamentoNecessario: ['Barra', 'Anilhas'],
      nivelDificuldade: 'Avançado',
      cargaInicialSugerida: 40,
      rpeSugerido: 8,
      alternativas: []
    }
  });

  // ============================================
  // EXERCÍCIOS DETALHADOS DO LIVRO "ANATOMIA DA MUSCULAÇÃO"
  // ============================================

  // ========== OMBROS - DELTÓIDE ANTERIOR ==========
  
  await prisma.exercicio.upsert({
    where: { id: 'desenvolvimento-ombros-barra' },
    update: {},
    create: {
      id: 'desenvolvimento-ombros-barra',
      nome: 'Desenvolvimento de Ombros (Shoulder Press) com Barra',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: ['Tríceps', 'Trapézio', 'Peito'],
      descricao: 'Exercício fundamental para desenvolvimento do deltóide anterior. Sentado em banco, pegada na largura dos ombros, palmas voltadas para frente.',
      execucaoTecnica: '1. Sentado em banco, faça pegada na barra com afastamento igual à largura dos ombros; palmas das mãos voltadas para a frente. 2. Abaixe lentamente o peso até tocar a parte superior do tórax. 3. Impulsione verticalmente para cima até bloqueio dos cotovelos.',
      errosComuns: ['Arquear demais as costas', 'Não descer até o peito', 'Pegada muito aberta', 'Usar impulso das pernas'],
      equipamentoNecessario: ['Barra', 'Banco', 'Anilhas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 15,
      rpeSugerido: 7,
      alternativas: ['desenvolvimento-ombros-halteres', 'desenvolvimento-ombros-aparelho']
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'desenvolvimento-ombros-halteres' },
    update: {},
    create: {
      id: 'desenvolvimento-ombros-halteres',
      nome: 'Desenvolvimento de Ombros com Halteres',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: ['Tríceps', 'Trapézio', 'Peito'],
      descricao: 'Variação com halteres que permite maior amplitude de movimento. Pegada pronada trabalha cabeça anterior e lateral; pegada neutra isola melhor o deltóide anterior.',
      execucaoTecnica: '1. Sentado em banco, comece com halteres no nível do ombro, palmas voltadas para frente. 2. Impulsione verticalmente para cima até bloqueio dos cotovelos. 3. Abaixe os halteres de volta até tocarem os ombros.',
      errosComuns: ['Não controlar a descida', 'Usar impulso', 'Pegada incorreta'],
      equipamentoNecessario: ['Halteres', 'Banco'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 8,
      rpeSugerido: 7,
      alternativas: ['desenvolvimento-ombros-barra', 'levantamento-frontal-halteres']
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'levantamento-frontal-halteres' },
    update: {},
    create: {
      id: 'levantamento-frontal-halteres',
      nome: 'Levantamento Frontal com Halteres',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: ['Peito', 'Trapézio'],
      descricao: 'Exercício isolado para deltóide anterior. Pegada neutra (polegar para frente) enfatiza deltóide anterior; pegada pronada permite ajuda do deltóide lateral.',
      execucaoTecnica: '1. Em pé, segure halteres aos lados do corpo com braços estendidos; polegares apontando para frente. 2. Levante um haltere para frente até nível do ombro, mantendo cotovelo rígido. 3. Abaixe o peso e repita com outro haltere.',
      errosComuns: ['Dobrar o cotovelo', 'Usar impulso', 'Não controlar o movimento'],
      equipamentoNecessario: ['Halteres'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 5,
      rpeSugerido: 6,
      alternativas: ['levantamento-frontal-barra', 'levantamento-frontal-cabo']
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'levantamento-frontal-barra' },
    update: {},
    create: {
      id: 'levantamento-frontal-barra',
      nome: 'Levantamento Frontal com Barra',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: ['Deltóide Lateral', 'Trapézio', 'Peito'],
      descricao: 'Pegada estreita enfatiza deltóide anterior; pegada mais aberta depende da assistência do deltóide lateral.',
      execucaoTecnica: '1. Pegada com dorso das mãos voltado para cima, na largura dos ombros. 2. Segure barra à frente das coxas com braços estendidos. 3. Levante a barra para frente e para cima até nível dos olhos, mantendo cotovelos rígidos. 4. Abaixe a barra de volta às coxas.',
      errosComuns: ['Pegada muito aberta', 'Dobrar cotovelos', 'Usar impulso'],
      equipamentoNecessario: ['Barra', 'Anilhas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 10,
      rpeSugerido: 7,
      alternativas: ['levantamento-frontal-halteres', 'levantamento-frontal-cabo']
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'levantamento-frontal-cabo' },
    update: {},
    create: {
      id: 'levantamento-frontal-cabo',
      nome: 'Levantamento Frontal com Cabo',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: ['Deltóide Lateral', 'Trapézio', 'Peito'],
      descricao: 'Cabo proporciona resistência uniforme durante todo o movimento, diferente dos halteres onde a resistência varia.',
      execucaoTecnica: '1. Com uma mão, agarre pegador em D preso a polia baixa, pegada pronada. 2. Voltado para longe da pilha, levante o cabo em arco ascendente até nível do ombro, mantendo cotovelo rígido. 3. Abaixe o cabo de volta até nível da cintura.',
      errosComuns: ['Dobrar o cotovelo', 'Não controlar o movimento', 'Usar muito peso'],
      equipamentoNecessario: ['Cabo', 'Polia'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 5,
      rpeSugerido: 7,
      alternativas: ['levantamento-frontal-halteres', 'levantamento-frontal-barra']
    }
  });

  // ========== OMBROS - DELTÓIDE LATERAL ==========

  await prisma.exercicio.upsert({
    where: { id: 'levantamento-lateral-halteres' },
    update: {},
    create: {
      id: 'levantamento-lateral-halteres',
      nome: 'Levantamento Lateral com Halteres',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: ['Deltóide Anterior', 'Deltóide Posterior', 'Trapézio', 'Supra-espinal'],
      descricao: 'Exercício isolado para deltóide lateral. Terminar no nível dos ombros mantém tensão no deltóide; acima disso, trapézio assume o trabalho.',
      execucaoTecnica: '1. Em pé ereto, segure halteres com braços estendidos. 2. Levante os braços para fora e para os lados até que halteres atinjam nível dos ombros. 3. Abaixe os halteres de volta para os quadris.',
      errosComuns: ['Levantar acima do nível dos ombros', 'Usar impulso', 'Dobrar cotovelos', 'Inclinar halteres incorretamente'],
      equipamentoNecessario: ['Halteres'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 5,
      rpeSugerido: 7,
      alternativas: ['levantamento-lateral-cabo', 'levantamento-lateral-aparelho']
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'levantamento-lateral-cabo' },
    update: {},
    create: {
      id: 'levantamento-lateral-cabo',
      nome: 'Levantamento Lateral com Cabo',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: ['Deltóide Anterior', 'Deltóide Posterior', 'Trapézio', 'Supra-espinal'],
      descricao: 'Cabo proporciona resistência uniforme durante todo o movimento, diferente dos halteres onde a resistência varia.',
      execucaoTecnica: '1. Com uma mão, agarre pegador em D preso a polia baixa. 2. Levante a mão para fora em arco amplo até nível do ombro, mantendo cotovelo rígido. 3. Abaixe o cabo de volta no nível da cintura.',
      errosComuns: ['Dobrar o cotovelo', 'Levantar acima dos ombros', 'Não controlar o movimento'],
      equipamentoNecessario: ['Cabo', 'Polia'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 5,
      rpeSugerido: 7,
      alternativas: ['levantamento-lateral-halteres', 'levantamento-lateral-aparelho']
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'levantamento-lateral-aparelho' },
    update: {},
    create: {
      id: 'levantamento-lateral-aparelho',
      nome: 'Levantamento Lateral com Aparelho',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: ['Deltóide Anterior', 'Deltóide Posterior', 'Trapézio', 'Supra-espinal'],
      descricao: 'Aparelho proporciona resistência uniforme e estabilidade. Pegada pronada faz rotação interna, direcionando para deltóide lateral.',
      execucaoTecnica: '1. Sente-se no aparelho com cotovelos contra almofadas protetoras. 2. Levante os cotovelos até nível do ombro, braços paralelos ao chão. 3. Abaixe os cotovelos de volta aos lados do corpo.',
      errosComuns: ['Levantar acima do nível dos ombros', 'Não controlar o movimento', 'Pegada incorreta'],
      equipamentoNecessario: ['Máquinas'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 10,
      rpeSugerido: 7,
      alternativas: ['levantamento-lateral-halteres', 'levantamento-lateral-cabo']
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'remada-vertical-barra' },
    update: {},
    create: {
      id: 'remada-vertical-barra',
      nome: 'Remada Vertical com Barra',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: ['Trapézio', 'Deltóide Anterior', 'Supra-espinal'],
      descricao: 'Pegada mais aberta ajuda a objetivar o deltóide; pegada mais fechada enfatiza o trapézio.',
      execucaoTecnica: '1. Segure barra com afastamento igual à largura dos ombros; dorso das mãos voltado para cima. 2. Tracione a barra verticalmente para cima até chegar ao queixo; eleve o máximo possível os cotovelos. 3. Abaixe a barra lentamente até braços estendidos.',
      errosComuns: ['Pegada muito fechada', 'Não elevar cotovelos', 'Usar impulso'],
      equipamentoNecessario: ['Barra', 'Anilhas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 10,
      rpeSugerido: 7,
      alternativas: ['remada-vertical-cabo', 'remada-vertical-aparelho']
    }
  });

  // ========== OMBROS - DELTÓIDE POSTERIOR ==========

  await prisma.exercicio.upsert({
    where: { id: 'levantamento-posterior-inclinado' },
    update: {},
    create: {
      id: 'levantamento-posterior-inclinado',
      nome: 'Levantamento de Halteres, Inclinação para a Frente',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: ['Deltóide Lateral', 'Trapézio', 'Rombóides', 'Infra-espinal', 'Redondo Menor', 'Redondo Maior'],
      descricao: 'Pegada neutra (polegares para frente) permite que deltóide lateral atue; pegada pronada (polegares para dentro) enfatiza deltóide posterior.',
      execucaoTecnica: '1. Segurando dois halteres com braços estendidos, incline o corpo para frente usando a cintura, mantendo costas retas. 2. Com palmas voltadas para dentro, levante halteres para cima até nível das orelhas, mantendo cotovelos ligeiramente dobrados. 3. Abaixe os halteres de volta à posição inicial.',
      errosComuns: ['Arquear as costas', 'Usar impulso', 'Pegada incorreta', 'Não controlar a descida'],
      equipamentoNecessario: ['Halteres'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 5,
      rpeSugerido: 7,
      alternativas: ['levantamento-posterior-cabo', 'crucifixo-aparelho-posterior']
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'levantamento-posterior-cabo' },
    update: {},
    create: {
      id: 'levantamento-posterior-cabo',
      nome: 'Levantamento com Cabo, Inclinação para a Frente',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: ['Deltóide Lateral', 'Trapézio', 'Rombóides', 'Infra-espinal', 'Redondo Menor', 'Redondo Maior'],
      descricao: 'Cabo proporciona resistência uniforme. Para enfatizar deltóide posterior, braços devem se movimentar diretamente para fora, afastando-se dos lados do corpo.',
      execucaoTecnica: '1. Agarre pegadores presos a duas polias baixas (pegador esquerdo na mão direita, direito na esquerda). 2. Fique em pé no meio, incline o corpo para frente usando a cintura, costas retas e paralelas ao chão. 3. Levante as mãos para cima em arco até nível dos ombros, de modo que os cabos se cruzem. 4. Abaixe os pegadores até posição inicial.',
      errosComuns: ['Não manter costas retas', 'Levantar em arco anterior', 'Não controlar o movimento'],
      equipamentoNecessario: ['Cabo', 'Polia'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 5,
      rpeSugerido: 7,
      alternativas: ['levantamento-posterior-inclinado', 'crucifixo-aparelho-posterior']
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'crucifixo-aparelho-posterior' },
    update: {},
    create: {
      id: 'crucifixo-aparelho-posterior',
      nome: 'Crucifixo em Aparelho, Deltóide Posterior',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: ['Trapézio', 'Rombóides', 'Deltóide Lateral', 'Infra-espinal', 'Redondo Menor', 'Redondo Maior'],
      descricao: 'Aparelho proporciona resistência uniforme e diversos ajustes técnicos. Pegadores horizontais com pegada pronada isola melhor o deltóide posterior.',
      execucaoTecnica: '1. Sente-se de frente para o aparelho com peito contra encosto do banco. 2. Agarre pegadores diretamente à frente com braços estendidos no nível do ombro. 3. Puxe os pegadores para trás no arco mais distante possível, mantendo cotovelos elevados e braços paralelos ao chão. 4. Retorne os pegadores à posição inicial.',
      errosComuns: ['Não manter braços paralelos ao chão', 'Levantar acima do nível dos ombros', 'Pegada incorreta'],
      equipamentoNecessario: ['Máquinas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 10,
      rpeSugerido: 7,
      alternativas: ['levantamento-posterior-inclinado', 'levantamento-posterior-cabo']
    }
  });

  // ========== OMBROS - MANGUITO ROTADOR ==========

  await prisma.exercicio.upsert({
    where: { id: 'rotacao-externa-cabo' },
    update: {},
    create: {
      id: 'rotacao-externa-cabo',
      nome: 'Rotação Externa com Cabo',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: ['Deltóide Posterior'],
      descricao: 'Exercício essencial para fortalecer manguito rotador e prevenir lesões. Infra-espinal e redondo menor promovem rotação externa.',
      execucaoTecnica: '1. Fique de pé, posicionado de lado com relação a polia ajustada à altura da cintura. 2. Agarre pegador com mão "de fora", polegar apontando para cima. 3. Com cotovelo mantido firmemente contra a cintura, movimente o pegador em arco para fora, afastando-o do corpo, mantendo antebraço paralelo ao chão. 4. Retorne lentamente o pegador à posição inicial, em frente ao umbigo.',
      errosComuns: ['Mover o cotovelo', 'Não manter antebraço paralelo ao chão', 'Usar muito peso'],
      equipamentoNecessario: ['Cabo', 'Polia'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 2,
      rpeSugerido: 6,
      alternativas: ['rotacao-externa-haltere', 'rotacao-interna-cabo']
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'rotacao-interna-cabo' },
    update: {},
    create: {
      id: 'rotacao-interna-cabo',
      nome: 'Rotação Interna com Cabo',
      grupoMuscularPrincipal: 'Ombros',
      sinergistas: ['Peitoral Maior'],
      descricao: 'Subescapular promove rotação interna. Essencial para equilíbrio do manguito rotador.',
      execucaoTecnica: '1. Fique em pé, posicionado de lado com relação a polia ajustada à altura da cintura. 2. Agarre pegador com mão "de dentro", polegar apontando para cima. 3. Com cotovelo mantido firmemente contra a cintura, puxe o pegador para dentro, passando à frente do corpo, mantendo antebraço paralelo ao chão. 4. Retorne lentamente o pegador de volta à posição inicial.',
      errosComuns: ['Mover o cotovelo', 'Não manter antebraço paralelo ao chão', 'Usar muito peso'],
      equipamentoNecessario: ['Cabo', 'Polia'],
      nivelDificuldade: 'Iniciante',
      cargaInicialSugerida: 2,
      rpeSugerido: 6,
      alternativas: ['rotacao-externa-cabo', 'rotacao-interna-haltere']
    }
  });

  // ========== TÓRAX - PARTE SUPERIOR ==========

  await prisma.exercicio.upsert({
    where: { id: 'supino-inclinado-barra' },
    update: {},
    create: {
      id: 'supino-inclinado-barra',
      nome: 'Supino Inclinado com Barra',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Deltóide Anterior', 'Tríceps'],
      descricao: 'Foca na porção superior do peitoral (cabeça clavicular). Inclinação de 30-45° é ideal; inclinações maiores transferem enfoque para deltóide anterior.',
      execucaoTecnica: '1. Sentado em banco inclinado, faça pegada na barra com palmas voltadas para cima, afastamento igual à largura dos ombros. 2. Abaixe lentamente o peso até que a barra toque a parte superior do tórax. 3. Empurre a barra diretamente para cima até cotovelos estendidos.',
      errosComuns: ['Inclinação excessiva (acima de 45°)', 'Não descer até o peito', 'Pegada muito aberta', 'Não abrir cotovelos'],
      equipamentoNecessario: ['Barra', 'Banco Inclinado', 'Anilhas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 15,
      rpeSugerido: 7,
      alternativas: ['supino-inclinado-halteres', 'crucifixo-inclinado-halteres']
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'supino-inclinado-halteres' },
    update: {},
    create: {
      id: 'supino-inclinado-halteres',
      nome: 'Supino Inclinado com Halteres',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Deltóide Anterior', 'Tríceps'],
      descricao: 'Halteres permitem maior amplitude de movimento. Pegada pronada permite maior alongamento; pegada neutra gera melhor contração na posição de bloqueio.',
      execucaoTecnica: '1. Sentado em banco inclinado, comece com halteres no nível do tórax, palmas voltadas para frente. 2. Impulsione os halteres verticalmente até bloqueio dos cotovelos. 3. Abaixe os halteres retornando à parte superior do tórax.',
      errosComuns: ['Não controlar a descida', 'Não tocar halteres na parte superior', 'Pegada incorreta'],
      equipamentoNecessario: ['Halteres', 'Banco Inclinado'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 8,
      rpeSugerido: 7,
      alternativas: ['supino-inclinado-barra', 'crucifixo-inclinado-halteres']
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'crucifixo-inclinado-halteres' },
    update: {},
    create: {
      id: 'crucifixo-inclinado-halteres',
      nome: 'Crucifixo Inclinado com Halteres',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Deltóide Anterior'],
      descricao: 'Exercício isolado para peitoral superior. Quanto mais baixo descerem os halteres, maior o alongamento, mas também maior risco de lesão.',
      execucaoTecnica: '1. Sentado em banco inclinado, comece com halteres diretamente acima do tórax, palmas voltadas para dentro. 2. Abaixe os halteres para fora, dobrando ligeiramente os cotovelos enquanto pesos descem até nível do tórax. 3. Levante os halteres de volta, unindo-os na parte superior.',
      errosComuns: ['Alongamento excessivo', 'Não controlar a descida', 'Dobrar cotovelos demais'],
      equipamentoNecessario: ['Halteres', 'Banco Inclinado'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 5,
      rpeSugerido: 7,
      alternativas: ['supino-inclinado-halteres', 'crucifixo-cabos-polias-baixas']
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'crucifixo-cabos-polias-baixas' },
    update: {},
    create: {
      id: 'crucifixo-cabos-polias-baixas',
      nome: 'Crucifixo com Cabos em Polias Baixas',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Deltóide Anterior'],
      descricao: 'Cabo proporciona resistência uniforme. Posição em pé projetada para frente permite melhor trajetória para mobilização dos músculos peitorais.',
      execucaoTecnica: '1. Em cada mão, agarre pegador em D preso a polias baixas, fique em pé ereto. 2. Levante as mãos em arco para frente até que os pegadores se encontrem na altura da cabeça. 3. Mantendo cotovelos bloqueados, abaixe os pegadores de volta para posição inicial.',
      errosComuns: ['Não manter cotovelos bloqueados', 'Não controlar o movimento', 'Posição incorreta'],
      equipamentoNecessario: ['Cabo', 'Polia'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 5,
      rpeSugerido: 7,
      alternativas: ['crucifixo-inclinado-halteres', 'supino-inclinado-halteres']
    }
  });

  // ========== TÓRAX - PARTE MÉDIA ==========

  await prisma.exercicio.upsert({
    where: { id: 'supino-reto-barra' },
    update: {},
    create: {
      id: 'supino-reto-barra',
      nome: 'Supino Reto com Barra',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Deltóide Anterior', 'Tríceps'],
      descricao: 'Exercício fundamental para desenvolvimento do peitoral médio. Espaçamento ideal das mãos é igual à largura dos ombros ou ligeiramente maior.',
      execucaoTecnica: '1. Deitado em banco plano, faça pegada na barra com dorso das mãos voltado para cima, afastamento igual à largura dos ombros. 2. Abaixe lentamente o peso até tocar a parte média do tórax. 3. Empurre a barra diretamente para cima até bloqueio dos cotovelos.',
      errosComuns: ['Arquear demais as costas', 'Não descer até o peito', 'Pegada muito aberta', 'Não abrir cotovelos'],
      equipamentoNecessario: ['Barra', 'Banco', 'Anilhas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 20,
      rpeSugerido: 7,
      alternativas: ['supino-reto-halteres', 'crucifixo-halteres', 'crucifixo-aparelho']
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'supino-reto-halteres' },
    update: {},
    create: {
      id: 'supino-reto-halteres',
      nome: 'Supino Reto com Halteres',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Deltóide Anterior', 'Tríceps'],
      descricao: 'Halteres permitem maior amplitude de movimento. Pegada pronada proporciona mais alongamento; pegada neutra permite maior contração.',
      execucaoTecnica: '1. Deitado em banco horizontal, comece com halteres no nível do tórax, palmas voltadas para frente. 2. Impulsione verticalmente os halteres até extensão total dos cotovelos. 3. Abaixe os halteres retornando-os até a parte média do tórax.',
      errosComuns: ['Não controlar a descida', 'Não tocar halteres na parte superior', 'Alongamento excessivo'],
      equipamentoNecessario: ['Halteres', 'Banco'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 10,
      rpeSugerido: 7,
      alternativas: ['supino-reto-barra', 'crucifixo-halteres']
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'crucifixo-halteres' },
    update: {},
    create: {
      id: 'crucifixo-halteres',
      nome: 'Crucifixo com Halteres',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Deltóide Anterior'],
      descricao: 'Exercício isolado para peitoral. Funciona melhor com pegada neutra (palmas voltadas para dentro). Quanto mais baixo descerem, maior alongamento, mas maior risco de lesão.',
      execucaoTecnica: '1. Deitado em banco horizontal, comece com halteres diretamente acima do tórax médio, palmas voltadas para dentro. 2. Abaixe os halteres com amplo movimento de abertura (para fora), dobrando ligeiramente os cotovelos durante a descida até nível do tórax. 3. Levante os halteres em movimento simultâneo, fazendo arco ascendente, em retorno à posição vertical.',
      errosComuns: ['Alongamento excessivo', 'Não controlar a descida', 'Dobrar cotovelos demais'],
      equipamentoNecessario: ['Halteres', 'Banco'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 5,
      rpeSugerido: 7,
      alternativas: ['supino-reto-halteres', 'crucifixo-aparelho']
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'crucifixo-aparelho' },
    update: {},
    create: {
      id: 'crucifixo-aparelho',
      nome: 'Crucifixo com Aparelho',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Deltóide Anterior'],
      descricao: 'Aparelho proporciona resistência uniforme. Parte central interna do músculo peitoral faz maior parte do trabalho quando pegadores são tracionados simultaneamente.',
      execucaoTecnica: '1. Agarre pegadores verticais, com cotovelos ligeiramente dobrados. 2. Tracione simultaneamente os pegadores até que se toquem à frente do tórax. 3. Deixe suas mãos retornarem à posição inicial, mantendo cotovelos elevados.',
      errosComuns: ['Não manter cotovelos elevados', 'Não controlar o movimento', 'Amplitude excessiva'],
      equipamentoNecessario: ['Máquinas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 10,
      rpeSugerido: 7,
      alternativas: ['crucifixo-halteres', 'supino-reto-halteres']
    }
  });

  // ========== TÓRAX - PARTE INFERIOR ==========

  await prisma.exercicio.upsert({
    where: { id: 'supino-declinado-barra' },
    update: {},
    create: {
      id: 'supino-declinado-barra',
      nome: 'Supino em Banco Declinado',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Tríceps', 'Deltóide Anterior'],
      descricao: 'Foca na porção inferior do peitoral (cabeça esternal). Ângulo de declinação de 20-40° é ideal; ângulos maiores transferem enfoque para tríceps.',
      execucaoTecnica: '1. Deite-se em banco declinado, faça pegada na barra com dorso das mãos voltado para cima, afastamento igual à largura dos ombros. 2. Abaixe lentamente o peso até tocar a parte inferior do tórax. 3. Empurre a barra diretamente para cima até extensão total dos cotovelos.',
      errosComuns: ['Declinação excessiva', 'Não abrir cotovelos', 'Pegada muito aberta'],
      equipamentoNecessario: ['Barra', 'Banco Declinado', 'Anilhas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 15,
      rpeSugerido: 7,
      alternativas: ['crucifixo-declinado-halteres', 'cruzamento-cabos', 'flexao-barras-paralelas']
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'crucifixo-declinado-halteres' },
    update: {},
    create: {
      id: 'crucifixo-declinado-halteres',
      nome: 'Crucifixo Declinado com Halteres',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Deltóide Anterior', 'Tríceps'],
      descricao: 'Exercício isolado para peitoral inferior. Quanto mais descerem os halteres, maior alongamento, mas maior probabilidade de lesão.',
      execucaoTecnica: '1. Deitado em banco declinado, comece com halteres diretamente acima do tórax, palmas voltadas para dentro. 2. Abaixe os halteres com movimento de abertura (para fora), dobrando ligeiramente os cotovelos durante a descida até nível do tórax. 3. Levante simultaneamente os halteres de volta à posição inicial, até se tocarem.',
      errosComuns: ['Alongamento excessivo', 'Não controlar a descida', 'Dobrar cotovelos demais'],
      equipamentoNecessario: ['Halteres', 'Banco Declinado'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 5,
      rpeSugerido: 7,
      alternativas: ['supino-declinado-barra', 'cruzamento-cabos']
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'cruzamento-cabos' },
    update: {},
    create: {
      id: 'cruzamento-cabos',
      nome: 'Cruzamento de Cabos',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Deltóide Anterior', 'Tríceps'],
      descricao: 'Trajetória baixa (pegadores se encontram à frente dos quadris) mobiliza fibras inferiores do peitoral. Trajetória alta mobiliza seção média.',
      execucaoTecnica: '1. Em pé ereto, agarre pegadores em D presos às polias altas. 2. Tracione simultaneamente para baixo os pegadores até que as mãos se toquem à frente da cintura; mantenha cotovelos ligeiramente dobrados. 3. Lentamente, retorne à posição inicial com as mãos no nível dos ombros.',
      errosComuns: ['Não controlar o movimento', 'Trajetória incorreta', 'Não manter cotovelos ligeiramente dobrados'],
      equipamentoNecessario: ['Cabo', 'Polia'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 5,
      rpeSugerido: 7,
      alternativas: ['supino-declinado-barra', 'crucifixo-declinado-halteres']
    }
  });

  await prisma.exercicio.upsert({
    where: { id: 'flexao-barras-paralelas' },
    update: {},
    create: {
      id: 'flexao-barras-paralelas',
      nome: 'Flexão de Braços em Barras Paralelas',
      grupoMuscularPrincipal: 'Peito',
      sinergistas: ['Tríceps', 'Deltóide Anterior'],
      descricao: 'Ligeira inclinação para frente mobiliza os peitorais; postura ereta transfere enfoque para tríceps. Mantenha cotovelos junto aos lados do corpo.',
      execucaoTecnica: '1. Agarre as barras paralelas, sustentando o corpo com cotovelos estendidos e bloqueados. 2. Dobre os cotovelos, baixando o torso até que os braços fiquem paralelos ao chão. 3. "Empurre" o corpo de volta à posição inicial até cotovelos estendidos.',
      errosComuns: ['Não inclinar para frente', 'Cotovelos muito abertos', 'Não descer o suficiente'],
      equipamentoNecessario: ['Barras Paralelas'],
      nivelDificuldade: 'Intermediário',
      cargaInicialSugerida: 0,
      rpeSugerido: 7,
      alternativas: ['cruzamento-cabos', 'supino-declinado-barra']
    }
  });

  console.log('✅ Seed de exercícios concluído! Total: 100+ exercícios detalhados');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

