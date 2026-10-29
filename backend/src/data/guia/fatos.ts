/** Fatos publicáveis do AthletIA. Preços iguais a frontend/src/constants/planos-precos.ts. Cadastro igual a frontend/src/constants/onboarding.constants.ts. */

export const SITE = 'https://athletia.site'
export const ATUALIZADO = '2026-10-29'
export const ATUALIZADO_VISIVEL = '29 de outubro de 2026'

export const PLANOS = [
  { nome: 'Mensal', preco: 'R$ 29,90', periodo: 'por mês' },
  { nome: 'Trimestral', preco: 'R$ 49,90', precoMensal: 'R$ 16,63', periodo: 'a cada 3 meses' },
  { nome: 'Semestral', preco: 'R$ 89,90', precoMensal: 'R$ 14,98', periodo: 'a cada 6 meses' },
] as const

export const IDADES = ['18-29', '30-39', '40-49', '50+'] as const
export const OBJETIVOS = ['perder peso', 'ganhar massa muscular', 'ficar mais forte'] as const
export const EXPERIENCIA = ['iniciante', 'intermediário', 'avançado'] as const
export const FREQUENCIA = ['2', '3', '4', '5', '6'] as const
export const DURACOES = ['30 a 45 minutos', '45 a 60 minutos', '60 a 75 minutos', 'mais de 75 minutos'] as const
export const LOCAIS = ['casa', 'academia', 'casa e academia'] as const

export const LIMITES = 'O AthletIA não passa dieta e não substitui médico nem profissional de educação física.'

export const LIMITACOES = [
  'Este texto explica o tema. Não é prescrição individual de treino.',
  'O AthletIA não substitui médico nem profissional de educação física.',
  'Não há prazo garantido de resultado em semanas ou meses.',
]

export const FONTES = [
  { nome: 'OMS — Atividade física', url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity' },
  { nome: 'Termos de Uso do AthletIA', url: `${SITE}/termos` },
]

export function textoPlanos(): string {
  return `Os planos publicados são Mensal a ${PLANOS[0].preco}, Trimestral a ${PLANOS[1].preco} e Semestral a ${PLANOS[2].preco}.`
}

export function textoNoAthletia(foco: string): string {
  return `${foco} O AthletIA monta o treino com a faixa etária (${IDADES.join(', ')}), o objetivo (${OBJETIVOS.join(', ')}), a experiência (${EXPERIENCIA.join(', ')}), a frequência de 2 a 6 vezes por semana, a duração da sessão (de 30 a 45 minutos até mais de 75 minutos) e o local (casa, academia ou os dois). ${textoPlanos()} ${LIMITES}`
}

export function fatosDoProduto(): string[] {
  return [
    `Mensal ${PLANOS[0].preco}, trimestral ${PLANOS[1].preco} e semestral ${PLANOS[2].preco}.`,
    `Objetivos no cadastro: ${OBJETIVOS.join(', ')}.`,
    `Frequência de 2 a 6 vezes por semana e sessão de 30 a 45 minutos até mais de 75 minutos.`,
    `Local: casa, academia ou os dois.`,
    LIMITES,
  ]
}
