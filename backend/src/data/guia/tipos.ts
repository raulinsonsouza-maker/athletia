export type Fonte = { nome: string; url?: string }
export type Faq = { pergunta: string; resposta: string }

export type PaginaGuia = {
  tema: string
  slug: string
  pergunta: string
  resposta: string
  fatos: string[]
  corpo: string[]
  foco: string
  faq: Faq[]
}

export type TemaGuia = {
  slug: string
  titulo: string
  descricao: string
}
