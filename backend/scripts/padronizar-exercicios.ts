import { PrismaClient } from '@prisma/client';
import { gerarConteudo } from './conteudo-exercicios';
import { sincronizarGruposDoExercicio } from '../src/services/grupo-muscular.service';

const prisma = new PrismaClient();

const RENOMEAR: Record<string, string> = {
  'Abdominal Cruzado (Cross Crunch)': 'Abdominal cruzado',
  'Afundo Pêndulo (Pendulum Lunge)': 'Afundo pêndulo',
  'Afundo Reverso (Reverse Lunge)': 'Afundo reverso',
  'Agachamento Isométrico na Parede (Wall Sit)': 'Agachamento isométrico na parede',
  'Banded Single Leg Glute Bridge': 'Ponte de glúteo unilateral com elástico',
  'Band Pull-Apart': 'Abertura com elástico',
  'Crab Toe Touch Alternado': 'Toque alternado de tornozelo',
  'Dumbbell Goblet Curtsey Lunge': 'Afundo cruzado com halter',
  'Dumbbell Pull Through': 'Puxada por entre as pernas com halter',
  'Frog Pump (Elevação de Quadril com Pés Unidos)': 'Elevação de quadril com pés unidos',
  'Frog Reverse Hyperextension': 'Hiperextensão reversa com pés unidos',
  'Gittleson Shrug': 'Encolhimento Gittleson com halteres',
  'Máquina de Mosca Delt Traseira': 'Crucifixo inverso na máquina',
  'Cabo traseiro Delt Fly': 'Crucifixo inverso no cabo',
  'Mountain Climber Cruzado': 'Montanhista cruzado',
  'Voo de cabo reverso dobrado': 'Crucifixo inverso no cabo inclinado',
  'Dead bug no chão': 'Abdominal com membros opostos',
};

const DUPLICATAS: Array<{ remover: string; manter: string }> = [
  { remover: 'Remada inclinada a 45 graus com halteres', manter: 'Remada com Halteres no Banco Inclinado a 45°' },
  { remover: 'Flexão de Joelhos na Máquina', manter: 'Mesa Flexora' },
  { remover: 'Abdução de Quadril na Máquina', manter: 'Cadeira Abdutora' },
  { remover: 'Elevação lateral com o corpo inclinado', manter: 'Elevação Lateral Inclinada' },
  { remover: 'Abdominal Cruzado em T', manter: 'Abdominal cruzado' },
  { remover: 'Elevação de Panturrilha no Leg Press', manter: 'Panturrilha em Pé' },
  { remover: 'Elevação de Panturrilha no Leg Press Sentado', manter: 'Elevação de Panturrilha Sentado na Máquina' },
  { remover: 'Elevação de Panturrilha Unilateral no Leg Press', manter: 'Panturrilha Unilateral' },
  { remover: 'Elevação de Panturrilha no Hack Squat', manter: 'Elevação de Panturrilha Sentado na Máquina' },
  { remover: 'Elevação de Panturrilha Unilateral no Hack Squat', manter: 'Panturrilha Unilateral' },
  { remover: 'Elevação de Panturrilha na Máquina de Supino', manter: 'Elevação de Panturrilha Sentado na Máquina' },
  { remover: 'Elevação de Panturrilha Inclinada Unilateral', manter: 'Elevação de Panturrilha Inclinada' },
  { remover: 'Encolhimento de ombros sem pegas com alavanca', manter: 'Encolher de ombros com alavanca' },
  { remover: 'Encolhimento de ombros inclinado em decúbito ventral', manter: 'Encolhimento de ombros inclinado com halteres' },
  { remover: 'Alongamento de Gastrocnêmio em Pé', manter: 'Alongamento de Panturrilha na Parede' },
  { remover: 'Alongamento de Panturrilha Unilateral com Descida do Calcanhar', manter: 'Alongamento de Panturrilha Unilateral' },
  { remover: 'Alongamento de Aquiles com Dedos Elevados', manter: 'Alongamento de Panturrilha na Parede' },
];

const NIVEL: Record<string, string> = {
  'Crucifixo com Aparelho': 'Iniciante',
  'Remada Unilateral com Halter': 'Iniciante',
  'Levantamento Terra Romeno com Halteres': 'Iniciante',
  'Tríceps Francês': 'Iniciante',
};

const SINERGISTAS: Record<string, string[]> = {
  Peito: ['Tríceps'],
  Costas: ['Bíceps'],
  Ombros: ['Trapézio'],
  Tríceps: ['Peito'],
  Bíceps: ['Antebraços'],
  Quadríceps: ['Glúteos'],
  'Posteriores de coxa': ['Glúteos'],
  Glúteos: ['Posteriores de coxa'],
  Lombar: ['Glúteos'],
  Trapézio: ['Ombros'],
  Adutores: ['Quadríceps'],
  Antebraços: ['Bíceps'],
};

const NOVOS: Array<{ nome: string; grupo: string; equipamento: string[]; semEquipamento: boolean }> = [
  { nome: 'Supino reto com barra', grupo: 'Peito', equipamento: ['Barra'], semEquipamento: false },
  { nome: 'Supino com halteres', grupo: 'Peito', equipamento: ['Halteres'], semEquipamento: false },
  { nome: 'Supino na máquina', grupo: 'Peito', equipamento: ['Máquinas'], semEquipamento: false },
  { nome: 'Puxada com pegada supinada', grupo: 'Costas', equipamento: ['Cabo'], semEquipamento: false },
  { nome: 'Remada curvada com halteres', grupo: 'Costas', equipamento: ['Halteres'], semEquipamento: false },
  { nome: 'Cadeira flexora', grupo: 'Posteriores de coxa', equipamento: ['Máquinas'], semEquipamento: false },
  { nome: 'Flexora em pé na máquina', grupo: 'Posteriores de coxa', equipamento: ['Máquinas'], semEquipamento: false },
  { nome: 'Deslize de calcanhar no chão', grupo: 'Posteriores de coxa', equipamento: ['Peso Corporal'], semEquipamento: true },
  { nome: 'Superman lombar no chão', grupo: 'Lombar', equipamento: ['Peso Corporal'], semEquipamento: true },
  { nome: 'Hiperextensão no banco romano', grupo: 'Lombar', equipamento: ['Máquinas'], semEquipamento: false },
  { nome: 'Extensão lombar na máquina', grupo: 'Lombar', equipamento: ['Máquinas'], semEquipamento: false },
  { nome: 'Extensão lombar com halteres', grupo: 'Lombar', equipamento: ['Halteres'], semEquipamento: false },
  { nome: 'Bom dia no cabo', grupo: 'Lombar', equipamento: ['Cabo'], semEquipamento: false },
  { nome: 'Abdominal na máquina', grupo: 'Core', equipamento: ['Máquinas'], semEquipamento: false },
  { nome: 'Abdominal no cabo', grupo: 'Core', equipamento: ['Cabo'], semEquipamento: false },
  { nome: 'Elevação de joelhos na barra', grupo: 'Core', equipamento: ['Barra'], semEquipamento: false },
  { nome: 'Rotação de tronco no cabo', grupo: 'Core', equipamento: ['Cabo'], semEquipamento: false },
  { nome: 'Elevação frontal no chão', grupo: 'Ombros', equipamento: ['Peso Corporal'], semEquipamento: true },
];

function normalizar(valor: string): string {
  return valor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function equipamentoDe(nome: string, atual: string[]): { equipamentoNecessario: string[]; semEquipamento: boolean } {
  const n = normalizar(nome);
  if (n === 'esteira') return { equipamentoNecessario: ['Esteira'], semEquipamento: false };
  if (n.includes('bicicleta')) return { equipamentoNecessario: ['Bicicleta Ergométrica'], semEquipamento: false };
  if (n.includes('elipt')) return { equipamentoNecessario: ['Elíptico'], semEquipamento: false };
  if (n === 'escada') return { equipamentoNecessario: ['Escada'], semEquipamento: false };
  if (/alongamento/.test(n)) {
    if (/elast|faixa/.test(n)) return { equipamentoNecessario: ['Elásticos'], semEquipamento: false };
    return { equipamentoNecessario: ['Peso Corporal'], semEquipamento: true };
  }
  if (/bosu/.test(n)) return { equipamentoNecessario: ['Máquinas'], semEquipamento: false };
  if (/no chao|na parede|peso corporal|no solo/.test(n)) {
    return { equipamentoNecessario: ['Peso Corporal'], semEquipamento: true };
  }
  if (/elast|faixa|banded/.test(n) && !/cabo|maquina|halter|barra/.test(n)) {
    return { equipamentoNecessario: ['Elásticos'], semEquipamento: false };
  }
  if (/cabo|polia/.test(n)) return { equipamentoNecessario: ['Cabo'], semEquipamento: false };
  if (/maquina|cadeira|leg press|hack|smith|aparelho|alavanca|mesa flexora|flexora/.test(n)) {
    return { equipamentoNecessario: ['Máquinas'], semEquipamento: false };
  }
  if (/halter/.test(n)) return { equipamentoNecessario: ['Halteres'], semEquipamento: false };
  if (/barra|puxada|remada baixa/.test(n)) {
    if (/puxada|remada baixa/.test(n) && !/barra fixa/.test(n)) {
      return { equipamentoNecessario: ['Cabo'], semEquipamento: false };
    }
    return { equipamentoNecessario: ['Barra'], semEquipamento: false };
  }
  if (/kettle/.test(n)) return { equipamentoNecessario: ['Kettlebell'], semEquipamento: false };

  const mapa: Array<[RegExp, string]> = [
    [/elast|faixa/, 'Elásticos'],
    [/kettle/, 'Kettlebell'],
    [/halter/, 'Halteres'],
    [/anilha/, 'Anilhas'],
    [/cabo|polia|corda/, 'Cabo'],
    [/maquina|aparelho|smith|ginasio|academia/, 'Máquinas'],
    [/barra/, 'Barra'],
    [/corporal|sem equipamento/, 'Peso Corporal'],
  ];
  const saida = new Set<string>();
  for (const item of atual) {
    const texto = normalizar(item);
    for (const [regra, nomeEquipamento] of mapa) {
      if (regra.test(texto)) saida.add(nomeEquipamento);
    }
  }
  if (saida.size === 0) return { equipamentoNecessario: ['Peso Corporal'], semEquipamento: true };
  const preferida = ['Halteres', 'Cabo', 'Máquinas', 'Barra', 'Elásticos', 'Kettlebell', 'Anilhas', 'Peso Corporal']
    .find((item) => saida.has(item));
  const lista = preferida ? [preferida] : [...saida];
  return {
    equipamentoNecessario: lista,
    semEquipamento: lista.length === 1 && lista[0] === 'Peso Corporal',
  };
}

function iguais(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((item, indice) => item === b[indice]);
}

async function main() {
  let renomeados = 0;
  for (const [antigo, novo] of Object.entries(RENOMEAR)) {
    const destino = await prisma.exercicio.findFirst({ where: { nome: novo } });
    const origem = await prisma.exercicio.findFirst({ where: { nome: antigo, ativo: true } });
    if (!origem) continue;
    if (destino && destino.id !== origem.id) {
      await prisma.exercicio.update({
        where: { id: origem.id },
        data: { ativo: false, alternativas: [destino.id] },
      });
    } else {
      await prisma.exercicio.update({ where: { id: origem.id }, data: { nome: novo } });
      renomeados += 1;
    }
  }

  let desativados = 0;
  for (const par of DUPLICATAS) {
    const manter = await prisma.exercicio.findFirst({ where: { nome: par.manter } });
    const remover = await prisma.exercicio.findFirst({ where: { nome: par.remover, ativo: true } });
    if (!remover || (manter && manter.id === remover.id)) continue;
    await prisma.exercicio.update({
      where: { id: remover.id },
      data: { ativo: false, alternativas: manter ? [manter.id] : remover.alternativas },
    });
    desativados += 1;
  }

  const ativos = await prisma.exercicio.findMany({ where: { ativo: true } });
  let textos = 0;
  let campos = 0;

  for (const item of ativos) {
    const grupo = item.grupoMuscularPrincipal === 'Posteriores'
      ? 'Posteriores de coxa'
      : item.grupoMuscularPrincipal;
    const nivel = NIVEL[item.nome] || item.nivelDificuldade;
    const equipamento = equipamentoDe(item.nome, item.equipamentoNecessario);
    const sinergistas = item.sinergistas.length > 0 ? item.sinergistas : (SINERGISTAS[grupo] || []);
    const textoCurto = (item.descricao || '').trim().length < 40
      || (item.execucaoTecnica || '').trim().length < 80
      || item.errosComuns.length < 3;
    const conteudo = textoCurto ? gerarConteudo(item.nome, grupo) : null;

    const mudaCampo = grupo !== item.grupoMuscularPrincipal
      || nivel !== item.nivelDificuldade
      || equipamento.semEquipamento !== item.semEquipamento
      || !iguais(equipamento.equipamentoNecessario, item.equipamentoNecessario)
      || !iguais(sinergistas, item.sinergistas);

    if (!conteudo && !mudaCampo) {
      await sincronizarGruposDoExercicio(item.id, grupo, sinergistas);
      continue;
    }

    await prisma.exercicio.update({
      where: { id: item.id },
      data: {
        grupoMuscularPrincipal: grupo,
        nivelDificuldade: nivel,
        equipamentoNecessario: equipamento.equipamentoNecessario,
        semEquipamento: equipamento.semEquipamento,
        sinergistas,
        ...(conteudo
          ? {
              descricao: conteudo.descricao,
              execucaoTecnica: conteudo.execucao,
              errosComuns: conteudo.erros,
            }
          : {}),
      },
    });
    await sincronizarGruposDoExercicio(item.id, grupo, sinergistas);
    if (conteudo) textos += 1;
    if (mudaCampo) campos += 1;
  }

  let criados = 0;
  for (const item of NOVOS) {
    const existente = await prisma.exercicio.findFirst({ where: { nome: item.nome } });
    if (existente) {
      if (!existente.ativo) {
        await prisma.exercicio.update({ where: { id: existente.id }, data: { ativo: true } });
      }
      await sincronizarGruposDoExercicio(existente.id, item.grupo, SINERGISTAS[item.grupo] || []);
      continue;
    }
    const conteudo = gerarConteudo(item.nome, item.grupo);
    const criado = await prisma.exercicio.create({
      data: {
        nome: item.nome,
        grupoMuscularPrincipal: item.grupo,
        sinergistas: SINERGISTAS[item.grupo] || [],
        descricao: conteudo.descricao,
        execucaoTecnica: conteudo.execucao,
        errosComuns: conteudo.erros,
        equipamentoNecessario: item.equipamento,
        semEquipamento: item.semEquipamento,
        nivelDificuldade: 'Iniciante',
        alternativas: [],
        ativo: true,
      },
    });
    await sincronizarGruposDoExercicio(criado.id, item.grupo, SINERGISTAS[item.grupo] || []);
    criados += 1;
  }

  const finais = await prisma.exercicio.findMany({
    where: { ativo: true },
    select: { grupoMuscularPrincipal: true, nivelDificuldade: true, semEquipamento: true, equipamentoNecessario: true },
  });
  const grupos12 = ['Peito', 'Costas', 'Ombros', 'Tríceps', 'Bíceps', 'Quadríceps', 'Posteriores de coxa', 'Glúteos', 'Panturrilhas', 'Core', 'Lombar', 'Trapézio'];
  const cobertura = grupos12.map((grupo) => {
    const itens = finais.filter((item) => item.grupoMuscularPrincipal === grupo);
    const corporal = (item: { semEquipamento: boolean; equipamentoNecessario: string[] }) =>
      item.semEquipamento || item.equipamentoNecessario.every((equipamento) => normalizar(equipamento).includes('corporal'));
    return {
      grupo,
      corporal: itens.filter(corporal).length,
      academiaIniciante: itens.filter((item) => item.nivelDificuldade === 'Iniciante' && !corporal(item)).length,
    };
  });

  console.log(JSON.stringify({ renomeados, desativados, textos, campos, criados, cobertura }));
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
