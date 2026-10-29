import { ATUALIZADO } from './fatos'
import { paginasAthletia } from './temas/athletia'
import { paginasDuvidas } from './temas/duvidas'
import { paginasGlossario } from './temas/glossario'
import { paginasObjetivos } from './temas/objetivos'
import { paginasPerfis } from './temas/perfis'
import { paginasTreino } from './temas/treino'
import type { PaginaGuia, TemaGuia } from './tipos'

export type { PaginaGuia, TemaGuia }

export const TEMAS: TemaGuia[] = [
  { slug: 'athletia', titulo: 'O AthletIA', descricao: 'O que o aplicativo é, quanto custa e como o treino é montado.' },
  { slug: 'objetivos', titulo: 'Objetivos', descricao: 'Perder peso, ganhar massa, ficar mais forte e manter o treino.' },
  { slug: 'perfis', titulo: 'Perfis', descricao: 'Iniciante, avançado, idade e rotina de quem vai treinar.' },
  { slug: 'treino', titulo: 'Treino', descricao: 'Dias, tempo, descanso, progressão e o que não dá para prometer.' },
  { slug: 'duvidas', titulo: 'Dúvidas', descricao: 'Personal, academia, equipamento, dieta, preço e como assinar.' },
  { slug: 'glossario', titulo: 'Glossário', descricao: 'Série, repetição, carga, cardio e treino personalizado.' },
]

export const PAGINAS: PaginaGuia[] = [
  ...paginasAthletia,
  ...paginasObjetivos,
  ...paginasPerfis,
  ...paginasTreino,
  ...paginasDuvidas,
  ...paginasGlossario,
]

const ESPERADO: Record<string, number> = {
  athletia: 14,
  objetivos: 8,
  perfis: 11,
  treino: 22,
  duvidas: 12,
  glossario: 12,
}

function validar(): void {
  if (TEMAS.length !== 6) throw new Error(`Guia: ${TEMAS.length} temas`)
  if (PAGINAS.length !== 79) throw new Error(`Guia: ${PAGINAS.length} páginas`)
  for (const [slug, total] of Object.entries(ESPERADO)) {
    const n = PAGINAS.filter((pagina) => pagina.tema === slug).length
    if (n !== total) throw new Error(`Guia: tema ${slug} tem ${n}, esperado ${total}`)
  }
  const chaves = new Set<string>()
  for (const pagina of PAGINAS) {
    const chave = `${pagina.tema}/${pagina.slug}`
    if (chaves.has(chave)) throw new Error(`Guia: slug repetido ${chave}`)
    chaves.add(chave)
    if (!TEMAS.some((tema) => tema.slug === pagina.tema)) throw new Error(`Guia: tema ausente ${pagina.tema}`)
  }
}

validar()

export function paginasDoTema(slug: string): PaginaGuia[] {
  return PAGINAS.filter((pagina) => pagina.tema === slug)
}

export function buscarPagina(tema: string, slug: string): PaginaGuia | undefined {
  return PAGINAS.find((pagina) => pagina.tema === tema && pagina.slug === slug)
}

export const LASTMOD_GUIA = ATUALIZADO
