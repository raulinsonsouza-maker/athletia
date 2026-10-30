import { PapelGrupoMuscular, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EXERCICIOS = [
  { grupo: 'Peito', nome: 'Flexão de braços no chão', execucao: 'Mãos na largura dos ombros, corpo reto e peito desce até perto do chão.' },
  { grupo: 'Peito', nome: 'Flexão com joelhos no chão', execucao: 'Joelhos apoiados, desça o peito mantendo o tronco firme.' },
  { grupo: 'Peito', nome: 'Flexão inclinada na parede', execucao: 'Mãos na parede, corpo inclinado e cotovelos dobrando até o rosto se aproximar.' },
  { grupo: 'Peito', nome: 'Flexão com mãos afastadas no chão', execucao: 'Mãos mais abertas que os ombros, desça o peito sem deixar o quadril cair.' },
  { grupo: 'Costas', nome: 'Superman no chão', execucao: 'De bruços, eleve peito, braços e pernas ao mesmo tempo e volte devagar.' },
  { grupo: 'Costas', nome: 'Nadador no chão', execucao: 'De bruços, alterne o braço e a perna oposta como se estivesse nadando.' },
  { grupo: 'Costas', nome: 'Retração das escápulas no chão', execucao: 'De bruços, junte as escápulas sem erguer o pescoço.' },
  { grupo: 'Costas', nome: 'Extensão de coluna no chão', execucao: 'De bruços, eleve só o peito, com as mãos ao lado do corpo.' },
  { grupo: 'Bíceps', nome: 'Rosca isométrica na parede', execucao: 'Pressione as palmas na parede com os cotovelos flexionados e segure a contração.' },
  { grupo: 'Bíceps', nome: 'Flexão supinada no chão', execucao: 'Flexão com as palmas viradas uma para a outra e os cotovelos junto ao tronco.' },
  { grupo: 'Bíceps', nome: 'Curl de bíceps na parede', execucao: 'De costas para a parede, deslize os cotovelos para baixo como em uma rosca.' },
  { grupo: 'Bíceps', nome: 'Isometria de bíceps no chão', execucao: 'De joelhos, puxe os punhos em direção aos ombros e segure sem balançar o tronco.' },
  { grupo: 'Tríceps', nome: 'Flexão diamante no chão', execucao: 'Mãos juntas formando um diamante e cotovelos fechados na descida.' },
  { grupo: 'Tríceps', nome: 'Extensão de tríceps no chão', execucao: 'Deitado, estenda os antebraços para cima sem tirar os cotovelos do lugar.' },
  { grupo: 'Tríceps', nome: 'Mergulho de tríceps no chão', execucao: 'Mãos atrás do quadril, no chão, e dobre os cotovelos até quase 90 graus.' },
  { grupo: 'Tríceps', nome: 'Flexão com cotovelos junto ao corpo no chão', execucao: 'Flexão estreita, cotovelos raspando o tronco na descida e na subida.' },
  { grupo: 'Ombros', nome: 'Flexão pike no chão', execucao: 'Quadril alto, em V invertido, e desça a cabeça em direção ao chão.' },
  { grupo: 'Ombros', nome: 'Elevação em Y no chão', execucao: 'De bruços, eleve os braços em Y, com os polegares para cima.' },
  { grupo: 'Ombros', nome: 'Elevação em T no chão', execucao: 'De bruços, abra os braços em T até a altura dos ombros.' },
  { grupo: 'Ombros', nome: 'Desenvolvimento na parede', execucao: 'Mãos na parede na altura dos ombros e empurre o corpo para longe.' },
  { grupo: 'Trapézio', nome: 'Encolhimento escapular no chão', execucao: 'De bruços, encolha os ombros em direção às orelhas e solte devagar.' },
  { grupo: 'Trapézio', nome: 'Anjos na parede', execucao: 'Costas na parede, deslize os braços para cima e para baixo sem tirar os cotovelos.' },
  { grupo: 'Trapézio', nome: 'Retração na prancha no chão', execucao: 'Na prancha, junte as escápulas e afaste, sem mexer o quadril.' },
  { grupo: 'Trapézio', nome: 'Superman com retração no chão', execucao: 'No superman, puxe as escápulas para trás antes de descer.' },
  { grupo: 'Quadríceps', nome: 'Agachamento livre no chão', execucao: 'Pés na largura do quadril, desça até as coxas ficarem paralelas ao chão.' },
  { grupo: 'Quadríceps', nome: 'Afundo alternado no chão', execucao: 'Dê um passo à frente e desça o joelho de trás em direção ao chão.' },
  { grupo: 'Quadríceps', nome: 'Agachamento sumô no chão', execucao: 'Pés afastados e pontas para fora, desça mantendo o peito alto.' },
  { grupo: 'Quadríceps', nome: 'Agachamento com pausa no chão', execucao: 'Agache e segure dois segundos embaixo antes de subir.' },
  { grupo: 'Posteriores', nome: 'Ponte de quadril no chão', execucao: 'Deitado, pés no chão e eleve o quadril até o corpo formar uma linha.' },
  { grupo: 'Posteriores', nome: 'Elevação de quadril unilateral no chão', execucao: 'A mesma ponte, com uma perna estendida e o quadril nivelado.' },
  { grupo: 'Posteriores', nome: 'Good morning no chão', execucao: 'Em pé, incline o tronco à frente com as costas retas e volte.' },
  { grupo: 'Posteriores', nome: 'Deslize de calcanhar no chão', execucao: 'Deitado, deslize um calcanhar para longe e traga de volta sem tirar o quadril.' },
  { grupo: 'Glúteos', nome: 'Ponte de glúteos no chão', execucao: 'Eleve o quadril apertando os glúteos no topo, sem arquear a lombar.' },
  { grupo: 'Glúteos', nome: 'Coice no quatro apoios no chão', execucao: 'De quatro, estenda uma perna para trás e suba o calcanhar.' },
  { grupo: 'Glúteos', nome: 'Agachamento profundo no chão', execucao: 'Desça o máximo que a mobilidade permitir, com os calcanhares no chão.' },
  { grupo: 'Glúteos', nome: 'Abdução de quadril deitado no chão', execucao: 'De lado, eleve o joelho de cima mantendo o pé apoiado.' },
  { grupo: 'Panturrilhas', nome: 'Elevação de panturrilha no chão', execucao: 'Em pé, suba nos dois antepés e desça até o calcanhar tocar o chão.' },
  { grupo: 'Panturrilhas', nome: 'Elevação de panturrilha unilateral no chão', execucao: 'A mesma elevação, apoiado em uma perna de cada vez.' },
  { grupo: 'Panturrilhas', nome: 'Panturrilha na parede', execucao: 'Mãos na parede, eleve os calcanhares e segure um segundo no alto.' },
  { grupo: 'Panturrilhas', nome: 'Saltito de panturrilha no chão', execucao: 'Pequenos saltos usando só o impulso dos antepés.' },
  { grupo: 'Core', nome: 'Prancha frontal no chão', execucao: 'Apoie antebraços e pontas dos pés, com o corpo em linha reta.' },
  { grupo: 'Core', nome: 'Abdominal curto no chão', execucao: 'Deitado, tire as escápulas do chão sem puxar o pescoço.' },
  { grupo: 'Core', nome: 'Prancha lateral no chão', execucao: 'Apoie um antebraço e mantenha o quadril elevado.' },
  { grupo: 'Core', nome: 'Dead bug no chão', execucao: 'Deitado, estenda o braço e a perna oposta sem tirar a lombar do chão.' },
  { grupo: 'Lombar', nome: 'Extensão lombar no chão', execucao: 'De bruços, eleve o peito só um pouco e desça controlando.' },
  { grupo: 'Lombar', nome: 'Bird dog no chão', execucao: 'De quatro, estenda o braço e a perna oposta sem girar o quadril.' },
  { grupo: 'Lombar', nome: 'Superman lombar no chão', execucao: 'Eleve peito e pernas e segure, mantendo o pescoço neutro.' },
  { grupo: 'Lombar', nome: 'Gato-camelo no chão', execucao: 'De quatro, alterne arredondar e alongar a coluna.' },
];

function normalizar(valor: string): string {
  return valor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

async function main() {
  const grupos = await prisma.grupoMuscularVisual.findMany({ where: { ativo: true } });
  let criados = 0;

  for (const item of EXERCICIOS) {
    const existente = await prisma.exercicio.findFirst({ where: { nome: item.nome } });
    const exercicio = existente
      ? await prisma.exercicio.update({
          where: { id: existente.id },
          data: {
            grupoMuscularPrincipal: item.grupo,
            equipamentoNecessario: ['Peso Corporal'],
            semEquipamento: true,
            nivelDificuldade: 'Iniciante',
            ativo: true,
            execucaoTecnica: item.execucao,
          },
        })
      : await prisma.exercicio.create({
          data: {
            nome: item.nome,
            grupoMuscularPrincipal: item.grupo,
            sinergistas: [],
            descricao: item.execucao,
            execucaoTecnica: item.execucao,
            errosComuns: [],
            equipamentoNecessario: ['Peso Corporal'],
            semEquipamento: true,
            nivelDificuldade: 'Iniciante',
            alternativas: [],
            ativo: true,
          },
        });

    if (!existente) criados += 1;

    const grupo = grupos.find((candidato) => normalizar(candidato.nome) === normalizar(item.grupo));
    if (!grupo) {
      console.warn('grupo visual nao encontrado', item.grupo);
      continue;
    }

    await prisma.exercicioGrupoMuscular.upsert({
      where: {
        exercicioId_grupoVisualId_papel: {
          exercicioId: exercicio.id,
          grupoVisualId: grupo.id,
          papel: PapelGrupoMuscular.PRINCIPAL,
        },
      },
      update: {},
      create: {
        exercicioId: exercicio.id,
        grupoVisualId: grupo.id,
        papel: PapelGrupoMuscular.PRINCIPAL,
      },
    });
  }

  console.log('exercicios_peso_corporal', EXERCICIOS.length, 'novos', criados);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
