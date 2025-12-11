/**
 * Constantes estáticas para o onboarding
 * Arrays de opções e configurações compartilhadas
 */

export const IDADE_OPCOES = [
  { label: '18-29', value: 25, image: '/images/onboarding/18 aos 29.webp' },
  { label: '30-39', value: 35, image: '/images/onboarding/30 aos 39.webp' },
  { label: '40-49', value: 45, image: '/images/onboarding/40 aos 49.webp' },
  { label: '50+', value: 55, image: '/images/onboarding/50+.webp' }
] as const

export const SEXO_OPCOES = [
  { 
    value: 'Masculino', 
    image: '/images/onboarding/Homem.webp'
  },
  { 
    value: 'Feminino', 
    image: '/images/onboarding/Mulher.webp'
  },
  {
    value: 'Outro',
    description: 'Quero recomendações neutras'
  }
] as const

export const TIPO_CORPO_FEMININO = [
  {
    value: 'Em Forma',
    label: 'Em Forma',
    desc: 'Corpo tonificado e definido',
    image: '/images/onboarding/Em_forma.webp'
  },
  {
    value: 'Sobrepeso',
    label: 'Sobrepeso',
    desc: 'Pouco acima do peso ideal',
    image: '/images/onboarding/sobrepeso.webp'
  },
  {
    value: 'Acima do Peso',
    label: 'Acima do Peso',
    desc: 'Significativamente acima do peso',
    image: '/images/onboarding/Acima do peso.webp'
  },
  {
    value: 'Obesidade',
    label: 'Obesidade',
    desc: 'Obesidade que precisa de atenção',
    image: '/images/onboarding/Obesidade.webp'
  }
] as const

export const TIPO_CORPO_MASCULINO = [
  {
    value: 'Ectomorfo',
    label: 'Em Forma',
    desc: 'Corpo tonificado e definido',
    image: '/images/onboarding/magro.webp'
  },
  {
    value: 'Mesomorfo',
    label: 'Sobrepeso',
    desc: 'Pouco acima do peso ideal',
    image: '/images/onboarding/sobrepeso.webp'
  },
  {
    value: 'Endomorfo',
    label: 'Acima do Peso',
    desc: 'Significativamente acima do peso',
    image: '/images/onboarding/acima_do_peso.webp'
  },
  {
    value: 'Obesidade',
    label: 'Obesidade',
    desc: 'Obesidade que precisa de atenção',
    image: '/images/onboarding/obeso.webp'
  }
] as const

export const AGUA_OPCOES = [
  {
    value: 'Menos de 2 copos',
    label: 'Menos de 2 copos',
    desc: 'até 0,5 litros',
    iconCount: 1
  },
  {
    value: '2-6 copos',
    label: '2-6 copos',
    desc: '0,5 a 1,5 litros',
    iconCount: 2
  },
  {
    value: '7-10 copos',
    label: '7-10 copos',
    desc: '1,5 a 2,5 litros',
    iconCount: 3
  },
  {
    value: 'Mais de 10 copos',
    label: 'Mais de 10 copos',
    desc: 'mais de 2,5 litros',
    iconCount: 1
  },
  {
    value: 'Bebo apenas café ou chá',
    label: 'Bebo apenas café ou chá',
    desc: 'Não bebo água pura',
    iconCount: 1
  }
] as const

export const OBJETIVO_OPCOES_FEMININO = [
  {
    value: 'Emagrecimento',
    title: 'Perder peso',
    desc: 'Queimar gordura e definir o corpo',
    image: '/images/onboarding/Perder_peso.webp'
  },
  {
    value: 'Hipertrofia',
    title: 'Ganhar Massa Muscular',
    desc: 'Aumentar volume e definição muscular',
    image: '/images/onboarding/Ganhar_massa_muscular.webp'
  },
  {
    value: 'Força',
    title: 'Ficar Musculosa',
    desc: 'Desenvolver força e massa muscular',
    image: '/images/onboarding/Ficar_musculosa.webp'
  }
] as const

export const OBJETIVO_OPCOES_MASCULINO = [
  {
    value: 'Emagrecimento',
    title: 'Perder peso',
    desc: 'Queimar gordura e definir o corpo',
    image: '/images/onboarding/perder_peso_homem.webp'
  },
  {
    value: 'Hipertrofia',
    title: 'Ganhar Massa Muscular',
    desc: 'Aumentar volume e definição muscular',
    image: '/images/onboarding/ganahr_massa.webp'
  },
  {
    value: 'Força',
    title: 'Ficar Musculoso',
    desc: 'Desenvolver força e massa muscular',
    image: '/images/onboarding/ficar_musculoso.webp'
  }
] as const

export const EXPERIENCIA_OPCOES = [
  { 
    value: 'Iniciante', 
    desc: 'Sempre que me sento no chão, é difícil me levantar.',
  },
  { 
    value: 'Intermediário', 
    desc: 'Tento me exercitar uma vez por semana, mas ainda não é regular.',
  },
  { 
    value: 'Avançado', 
    desc: 'Estou pegando fogo! Estou na melhor forma da minha vida.',
  }
] as const

export const FREQUENCIA_OPCOES = [
  { 
    value: 2, 
    label: '2x por semana',
    desc: 'Ideal para iniciantes ou quem tem pouco tempo',
  },
  { 
    value: 3, 
    label: '3x por semana',
    desc: 'Perfeito para progressão constante',
  },
  { 
    value: 4, 
    label: '4x por semana',
    desc: 'Para quem quer resultados mais rápidos',
  },
  { 
    value: 5, 
    label: '5x por semana',
    desc: 'Para atletas experientes',
  },
  { 
    value: 6, 
    label: '6x por semana',
    desc: 'Para profissionais dedicados',
  }
] as const

export const TEMPO_OPCOES = [
  { 
    value: 30, 
    label: '30 a 45 minutos',
    desc: 'Treinos rápidos e eficientes para quem tem pouco tempo'
  },
  { 
    value: 45, 
    label: '45 a 60 minutos',
    desc: 'Duração ideal para treinos completos e bem estruturados'
  },
  { 
    value: 60, 
    label: '60 a 75 minutos',
    desc: 'Treinos mais longos para quem busca resultados intensos'
  },
  { 
    value: 75, 
    label: 'Mais de 75 minutos',
    desc: 'Treinos extensos para atletas dedicados e experientes'
  }
] as const

export const LOCAL_TREINO_OPCOES = [
  { 
    value: 'Casa', 
    desc: 'Treino em casa com equipamentos básicos ou sem equipamentos'
  },
  { 
    value: 'Academia', 
    desc: 'Treino em academia com acesso a equipamentos completos'
  },
  { 
    value: 'Misto', 
    desc: 'Treino tanto em casa quanto na academia'
  }
] as const

export const PROBLEMAS_ANTERIORES_OPCOES = [
  { 
    value: 'Falta de motivação', 
    desc: 'Tinha dificuldade em manter a consistência'
  },
  { 
    value: 'Não tinha um plano claro', 
    desc: 'Não sabia o que fazer em cada treino'
  },
  { 
    value: 'Meus treinos eram muito duros', 
    desc: 'A intensidade estava acima do meu nível'
  },
  { 
    value: 'Falta de tempo', 
    desc: 'Não conseguia encaixar os treinos na rotina'
  }
] as const

export const OBJETIVOS_ADICIONAIS_OPCOES = [
  { 
    value: 'Melhorar o sono', 
    desc: 'Ter noites mais tranquilas e descansadas',
  },
  { 
    value: 'Criar um hábito físico', 
    desc: 'Transformar o exercício em parte da rotina',
  },
  { 
    value: 'Sentir-se mais saudável', 
    desc: 'Aumentar o bem-estar geral e qualidade de vida',
  },
  { 
    value: 'Reduzir o estresse', 
    desc: 'Aliviar tensões e ansiedade do dia a dia',
  },
  { 
    value: 'Aumentar a energia', 
    desc: 'Ter mais disposição para atividades diárias',
  }
] as const

export const LESOES_OPCOES = ['Joelho', 'Ombro', 'Coluna', 'Pulso', 'Tornozelo', 'Nenhuma'] as const

export const TOTAL_STEPS = 18

export const DEFAULT_VALUES = {
  altura: 170,
  pesoAtual: 70,
  idade: 30
} as const

