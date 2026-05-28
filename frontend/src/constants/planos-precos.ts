/** Preços exibidos na página de venda, checkout e copy de marketing */
export const PRECO_MENSAL = 29.9
export const PRECO_MENSAL_FORMATADO = 'R$ 29,90'
export const PRECO_MENSAL_POR_MES = 'R$ 29,90/mês'

export const PLANOS_CHECKOUT = [
  {
    id: 'MENSAL',
    nome: 'Mensal',
    preco: PRECO_MENSAL,
    precoMensal: PRECO_MENSAL,
    periodo: 'por mês',
  },
  {
    id: 'TRIMESTRAL',
    nome: 'Trimestral',
    preco: 49.9,
    precoMensal: 16.63,
    periodo: 'a cada 3 meses',
    economia: 'Economize R$ 39,80',
    popular: true,
  },
  {
    id: 'SEMESTRAL',
    nome: 'Semestral',
    preco: 89.9,
    precoMensal: 14.98,
    periodo: 'a cada 6 meses',
    economia: 'Economize R$ 89,50',
  },
] as const
