import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalizar(valor: string): string {
  return valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

async function main() {
  const [exercicios, grupos, usos] = await Promise.all([
    prisma.exercicio.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        grupoMuscularPrincipal: true,
        sinergistas: true,
        nivelDificuldade: true,
        semEquipamento: true,
        equipamentoNecessario: true,
        descricao: true,
        execucaoTecnica: true,
        errosComuns: true,
        imagemUrl: true,
        gruposMusculares: { select: { papel: true, grupo: { select: { nome: true } } } },
      },
      orderBy: { nome: 'asc' },
    }),
    prisma.grupoMuscularVisual.findMany({
      where: { ativo: true },
      select: { nome: true, slug: true },
      orderBy: { ordem: 'asc' },
    }),
    prisma.exercicioTreino.groupBy({
      by: ['exercicioId'],
      _count: { _all: true },
    }),
  ]);

  const usoPorId = new Map(usos.map((item) => [item.exercicioId, item._count._all]));
  const niveisValidos = new Set(['Iniciante', 'Intermediário', 'Avançado']);

  const linhas = exercicios.map((item) => ({
    id: item.id,
    nome: item.nome,
    grupo: item.grupoMuscularPrincipal,
    sinergistas: item.sinergistas,
    nivel: item.nivelDificuldade,
    semEquipamento: item.semEquipamento,
    equipamento: item.equipamentoNecessario,
    descricao: item.descricao || '',
    execucao: item.execucaoTecnica || '',
    erros: item.errosComuns,
    temImagem: Boolean(item.imagemUrl),
    usos: usoPorId.get(item.id) || 0,
    visuais: item.gruposMusculares.map((relacao) => `${relacao.papel}:${relacao.grupo.nome}`),
    nivelInvalido: !niveisValidos.has(item.nivelDificuldade),
  }));

  const porNome = new Map<string, string[]>();
  for (const item of linhas) {
    const chave = normalizar(item.nome).replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
    const lista = porNome.get(chave) || [];
    lista.push(item.nome);
    porNome.set(chave, lista);
  }
  const duplicatas = [...porNome.entries()].filter(([, nomes]) => nomes.length > 1);

  console.log(JSON.stringify({
    total: linhas.length,
    gruposVisuais: grupos,
    semDescricao: linhas.filter((item) => item.descricao.trim().length < 40).length,
    semExecucao: linhas.filter((item) => item.execucao.trim().length < 40).length,
    semErros: linhas.filter((item) => item.erros.length < 3).length,
    nivelInvalido: linhas.filter((item) => item.nivelInvalido).length,
    semVisual: linhas.filter((item) => !item.visuais.some((nome) => nome.startsWith('PRINCIPAL:'))).length,
    duplicatas,
    exercicios: linhas,
  }));
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
