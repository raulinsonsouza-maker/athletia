export interface DiaDesafio {
  dia: number;
  nome: string;
  duracaoSegundos: number;
  youtubeId: string;
}

export interface DesafioCatalogo {
  slug: string;
  titulo: string;
  descricao: string;
  dias: DiaDesafio[];
}

const QUEIMA: DiaDesafio[] = [
  { dia: 1, nome: 'Cardio Intenso e Força para Queima de Gordura', duracaoSegundos: 31 * 60 + 14, youtubeId: 'iXahum2NUv4' },
  { dia: 2, nome: 'HIIT Queima Calorias – Cardio para o Corpo Inteiro', duracaoSegundos: 33 * 60 + 59, youtubeId: 'JfHilkH6ukQ' },
  { dia: 3, nome: 'Cardio de Baixo Impacto e Fortalecimento do Corpo Inteiro', duracaoSegundos: 33 * 60 + 36, youtubeId: 'WTZxqnsAjG4' },
  { dia: 4, nome: 'HIIT em Pé – Cardio para o Corpo Inteiro', duracaoSegundos: 31 * 60 + 28, youtubeId: 'EPhk8CnoRgI' },
  { dia: 5, nome: 'Alongamento Completo e Mobilidade', duracaoSegundos: 10 * 60 + 35, youtubeId: 'efseyecXFWY' },
  { dia: 6, nome: 'HIIT para Queima de Gordura e Condicionamento', duracaoSegundos: 33 * 60 + 18, youtubeId: 'rZMgzA_n--o' },
  { dia: 7, nome: 'HIIT sem Saltos – Alto Gasto Calórico', duracaoSegundos: 34 * 60 + 55, youtubeId: 'a8nhh-2SHZ4' },
  { dia: 8, nome: 'Treino de Força para Emagrecimento – Corpo Inteiro', duracaoSegundos: 32 * 60 + 10, youtubeId: 'bLtzpPrNOW0' },
  { dia: 9, nome: 'Cardio HIIT em Pé', duracaoSegundos: 35 * 60 + 52, youtubeId: 'MF-IyFGgOrM' },
  { dia: 10, nome: 'Alongamento e Relaxamento Pós-Treino', duracaoSegundos: 16 * 60 + 17, youtubeId: 'I0-09OdBKTg' },
  { dia: 11, nome: 'Fortalecimento Muscular e Queima de Gordura', duracaoSegundos: 33 * 60 + 57, youtubeId: 'Q8pckO5550A' },
  { dia: 12, nome: 'HIIT e Cardio para Queima de Gordura', duracaoSegundos: 38 * 60 + 33, youtubeId: 'L-ZQt0EBDTA' },
  { dia: 13, nome: 'Força e Condicionamento – Corpo Inteiro', duracaoSegundos: 33 * 60 + 4, youtubeId: 'YhVf6tgbLk0' },
  { dia: 14, nome: 'HIIT Intenso para Queima de Gordura', duracaoSegundos: 34 * 60 + 56, youtubeId: 'JhVDHAWL2QY' },
  { dia: 15, nome: 'Alongamento Completo para Recuperação Muscular', duracaoSegundos: 11 * 60 + 4, youtubeId: 'llNpwgxRSGs' },
  { dia: 16, nome: 'HIIT para o Corpo Inteiro sem Saltos', duracaoSegundos: 33 * 60 + 46, youtubeId: '_DbrG3Bn7-E' },
  { dia: 17, nome: 'Treino de Força e Queima de Gordura sem Saltos', duracaoSegundos: 29 * 60 + 59, youtubeId: 'hq63mFT35Mw' },
  { dia: 18, nome: 'Cardio de Baixo Impacto para Queima de Gordura', duracaoSegundos: 34 * 60 + 22, youtubeId: 'wIXXSVhr5hY' },
  { dia: 19, nome: 'HIIT Completo para Queima de Gordura e Condicionamento', duracaoSegundos: 32 * 60 + 43, youtubeId: 'nGQHYZVdw_U' },
  { dia: 20, nome: 'Alongamento Completo e Relaxamento Pós-Treino', duracaoSegundos: 11 * 60 + 9, youtubeId: 'qwcwu8447yY' }
];

const CONDICIONAMENTO: DiaDesafio[] = [
  { dia: 1, nome: 'HIIT para Queima de Gordura e Condicionamento', duracaoSegundos: 33 * 60 + 18, youtubeId: 'rZMgzA_n--o' },
  { dia: 2, nome: 'Cardio HIIT em Pé', duracaoSegundos: 35 * 60 + 52, youtubeId: 'MF-IyFGgOrM' },
  { dia: 3, nome: 'HIIT em Pé para Queima de Gordura – Corpo Inteiro', duracaoSegundos: 31 * 60 + 28, youtubeId: 'EPhk8CnoRgI' },
  { dia: 4, nome: 'Força e Condicionamento – Corpo Inteiro', duracaoSegundos: 33 * 60 + 4, youtubeId: 'YhVf6tgbLk0' },
  { dia: 5, nome: 'Alongamento Completo e Mobilidade', duracaoSegundos: 10 * 60 + 35, youtubeId: 'efseyecXFWY' },
  { dia: 6, nome: 'HIIT Intenso para Queima de Gordura', duracaoSegundos: 34 * 60 + 56, youtubeId: 'JhVDHAWL2QY' },
  { dia: 7, nome: 'Cardio HIIT em Pé – Sem Agachamentos ou Afundos', duracaoSegundos: 36 * 60 + 51, youtubeId: '2X3BaRa1jpM' },
  { dia: 8, nome: 'HIIT Completo para Queima de Gordura e Condicionamento', duracaoSegundos: 32 * 60 + 43, youtubeId: 'nGQHYZVdw_U' },
  { dia: 9, nome: 'Cardio de Baixo Impacto para Queima de Gordura', duracaoSegundos: 34 * 60 + 22, youtubeId: 'wIXXSVhr5hY' },
  { dia: 10, nome: 'Alongamento e Relaxamento Pós-Treino', duracaoSegundos: 16 * 60 + 17, youtubeId: 'I0-09OdBKTg' },
  { dia: 11, nome: 'HIIT para Queima de Gordura e Fortalecimento Muscular', duracaoSegundos: 35 * 60 + 43, youtubeId: 'DG9yoj148_Y' },
  { dia: 12, nome: 'Cardio HIIT em Pé – Sem Equipamentos', duracaoSegundos: 37 * 60 + 59, youtubeId: 'gHcOa-A5CTk' },
  { dia: 13, nome: 'HIIT Intenso para Queima de Gordura e Condicionamento', duracaoSegundos: 36 * 60 + 1, youtubeId: '0kw0EMS7APU' },
  { dia: 14, nome: 'HIIT e Cardio para Queima de Gordura', duracaoSegundos: 37 * 60 + 56, youtubeId: 'hJY3moMrMMM' },
  { dia: 15, nome: 'Alongamento Completo para Recuperação Muscular', duracaoSegundos: 11 * 60 + 4, youtubeId: 'llNpwgxRSGs' },
  { dia: 16, nome: 'HIIT para o Corpo Inteiro sem Saltos', duracaoSegundos: 33 * 60 + 46, youtubeId: '_DbrG3Bn7-E' },
  { dia: 17, nome: 'Cardio Intenso e Força para Emagrecimento', duracaoSegundos: 31 * 60 + 14, youtubeId: 'iXahum2NUv4' },
  { dia: 18, nome: 'Cardio HIIT em Pé para Queima de Gordura', duracaoSegundos: 36 * 60 + 36, youtubeId: 'wFFMX-k7TMI' },
  { dia: 19, nome: 'HIIT para Emagrecimento – Corpo Inteiro', duracaoSegundos: 35 * 60 + 52, youtubeId: 'tdisYTL1W7w' },
  { dia: 20, nome: 'Alongamento Completo e Relaxamento Pós-Treino', duracaoSegundos: 11 * 60 + 9, youtubeId: 'qwcwu8447yY' }
];

const FORCA: DiaDesafio[] = [
  { dia: 1, nome: 'Treino de Força com Halteres – Corpo Inteiro', duracaoSegundos: 31 * 60 + 40, youtubeId: '9wAYnol3RB8' },
  { dia: 2, nome: 'Treino de Membros Superiores com Halteres – Força e Hipertrofia', duracaoSegundos: 31 * 60 + 19, youtubeId: 'PoBibSd8a1g' },
  { dia: 3, nome: 'Treino de Membros Inferiores com Halteres – Ganho de Massa Muscular', duracaoSegundos: 31 * 60 + 39, youtubeId: 'ROsY15GSNGQ' },
  { dia: 4, nome: 'Treino de Braços e Abdômen com Halteres', duracaoSegundos: 34 * 60 + 9, youtubeId: 'kFn_tkoDdxs' },
  { dia: 5, nome: 'Alongamento Completo e Mobilidade', duracaoSegundos: 10 * 60 + 35, youtubeId: 'efseyecXFWY' },
  { dia: 6, nome: 'Treino Completo com Halteres – Ganho de Massa Muscular', duracaoSegundos: 31 * 60 + 57, youtubeId: 'UPK2rSPcYP4' },
  { dia: 7, nome: 'Treino de Membros Superiores com Halteres – Ganho de Massa', duracaoSegundos: 37 * 60 + 17, youtubeId: 'Cd5edkxf5bM' },
  { dia: 8, nome: 'Treino de Pernas com Halteres – Fortalecimento Muscular', duracaoSegundos: 31 * 60 + 58, youtubeId: 'YjeuK8T5a4Y' },
  { dia: 9, nome: 'Treino de Peito, Ombros e Costas com Halteres', duracaoSegundos: 33 * 60 + 33, youtubeId: '16ilNZR_B5A' },
  { dia: 10, nome: 'Alongamento e Relaxamento Pós-Treino', duracaoSegundos: 16 * 60 + 17, youtubeId: 'I0-09OdBKTg' },
  { dia: 11, nome: 'Treino de Força e Hipertrofia com Halteres – Corpo Inteiro', duracaoSegundos: 32 * 60 + 43, youtubeId: '4zs2tzQrGUI' },
  { dia: 12, nome: 'Treino de Braços e Abdômen com Halteres', duracaoSegundos: 36 * 60 + 38, youtubeId: '9SIWa2OQVlM' },
  { dia: 13, nome: 'Treino de Pernas com Halteres – Fortalecimento e Resistência', duracaoSegundos: 32 * 60, youtubeId: 'OEBtDTrSEpI' },
  { dia: 14, nome: 'Treino de Força com Halteres – Corpo Inteiro', duracaoSegundos: 35 * 60 + 16, youtubeId: '8g_tOYqAxew' },
  { dia: 15, nome: 'Alongamento Completo para Recuperação Muscular', duracaoSegundos: 11 * 60 + 4, youtubeId: 'llNpwgxRSGs' },
  { dia: 16, nome: 'Treino Completo com Halteres – Força e Hipertrofia', duracaoSegundos: 31 * 60 + 51, youtubeId: 'p9GEd5tfF-k' },
  { dia: 17, nome: 'Treino de Membros Superiores com Halteres – Força e Hipertrofia', duracaoSegundos: 31 * 60 + 1, youtubeId: '6eH5IetB3Og' },
  { dia: 18, nome: 'Treino de Pernas e Abdômen com Halteres', duracaoSegundos: 33 * 60 + 17, youtubeId: '6FQBPWCVqI8' },
  { dia: 19, nome: 'Treino Completo com Halteres – Ganho de Força e Massa Muscular', duracaoSegundos: 34 * 60 + 15, youtubeId: 'eIwe4O7gSo8' },
  { dia: 20, nome: 'Alongamento Completo e Relaxamento Pós-Treino', duracaoSegundos: 11 * 60 + 9, youtubeId: 'qwcwu8447yY' }
];

export const DESAFIOS: DesafioCatalogo[] = [
  {
    slug: 'queima-de-gordura',
    titulo: 'Desafio Queima de Gordura',
    descricao: '20 treinos em vídeo para queimar gordura em casa, sem equipamento.',
    dias: QUEIMA
  },
  {
    slug: 'condicionamento',
    titulo: 'Desafio Condicionamento',
    descricao: '20 treinos para melhorar o fôlego e a resistência.',
    dias: CONDICIONAMENTO
  },
  {
    slug: 'forca-e-definicao',
    titulo: 'Desafio Força e Definição',
    descricao: '20 treinos com halteres para ganhar força e definição.',
    dias: FORCA
  }
];

export function buscarDesafio(slug: string): DesafioCatalogo | undefined {
  return DESAFIOS.find((desafio) => desafio.slug === slug);
}
