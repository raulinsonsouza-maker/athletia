import { ATUALIZADO_VISIVEL, FONTES, LIMITACOES, PLANOS, SITE, fatosDoProduto, textoNoAthletia } from '../data/guia/fatos'
import { LASTMOD_GUIA, PAGINAS, TEMAS, buscarPagina, paginasDoTema } from '../data/guia/paginas'
import { camadas } from '../data/guia/profundidade'
import type { PaginaGuia, TemaGuia } from '../data/guia/tipos'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const BASE = SITE

const CSS = `
:root{--bg:#0a0a0a;--card:#141210;--line:rgba(255,255,255,.08);--text:#f5f5f4;--muted:#a8a29e;--gold:#F9A620;--ink:#1a1203}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--text);font-family:"Segoe UI",system-ui,-apple-system,sans-serif;line-height:1.6}
a{color:#ffe1a8;text-decoration:none}
a:hover{color:#fff}
img{max-width:100%}
.wrap{width:min(1120px,calc(100% - 32px));margin:0 auto}
.narrow{width:min(760px,100%)}
.top{position:sticky;top:0;z-index:5;background:rgba(10,10,10,.9);border-bottom:1px solid var(--line);backdrop-filter:blur(16px)}
.top .wrap{min-height:68px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.brand{color:#fff;font-weight:750;font-size:1.2rem;letter-spacing:-.04em}
.brand b{color:var(--gold);font-weight:750}
.menu{display:flex;gap:18px;align-items:center;flex-wrap:wrap}
.menu a{color:var(--muted);font-size:.95rem}
.btn{display:inline-flex;align-items:center;justify-content:center;background:var(--gold);color:var(--ink);font-weight:700;border-radius:999px;padding:12px 18px;text-decoration:none}
.btn:hover{color:var(--ink);filter:brightness(1.05)}
.btn.ghost{background:transparent;color:#fff;border:1px solid var(--line)}
.hero{padding:56px 0 12px}
.kicker{color:var(--gold);font-size:.75rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;margin:0 0 10px}
h1{font-size:clamp(2.1rem,5vw,3.6rem);line-height:1.02;letter-spacing:-.045em;margin:0 0 16px}
h2{font-size:1.45rem;letter-spacing:-.03em;margin:0 0 12px}
h3{margin:0 0 8px;font-size:1.02rem}
.lead{color:#d6d3d1;font-size:1.12rem;max-width:44rem;margin:0}
.crumbs{color:var(--muted);font-size:.9rem;margin:0 0 18px}
.crumbs a{color:var(--muted)}
.section{margin:34px 0}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
.grid.two{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.card{display:block;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;height:100%}
.card:hover{border-color:rgba(249,166,32,.45)}
.card p,.muted{color:var(--muted)}
.card .meta{color:var(--gold);font-size:.75rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.answer{background:#1c160d;border:1px solid rgba(249,166,32,.28);border-radius:18px;padding:22px 22px 8px;margin:22px 0}
.answer p{font-size:1.12rem;margin-top:0}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;margin:0;padding:0;list-style:none}
.facts li{background:#111;border:1px solid var(--line);border-radius:14px;padding:14px 14px 12px}
.prose p{font-size:1.05rem;color:#e7e5e4}
.steps{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.steps li{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px 16px 14px 62px;position:relative}
.steps li span{position:absolute;left:14px;top:14px;width:32px;height:32px;border-radius:50%;background:var(--gold);color:var(--ink);font-weight:800;display:grid;place-items:center}
.errors{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.errors li{border-left:3px solid #b45309;background:#14100c;border-radius:0 14px 14px 0;padding:12px 14px}
.cta{margin:36px 0;padding:26px;border-radius:22px;background:linear-gradient(180deg,#241a0d,#12100c);border:1px solid rgba(249,166,32,.4)}
.prices{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:16px 0}
.price{background:#0c0c0c;border:1px solid var(--line);border-radius:14px;padding:14px}
.price b{display:block;color:var(--gold);font-size:1.35rem;letter-spacing:-.03em}
.price small{color:var(--muted)}
details{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 16px;margin:8px 0}
summary{cursor:pointer;font-weight:650}
details p{color:var(--d, var(--muted));margin:8px 0 4px}
.note{color:var(--muted);font-size:.95rem}
.foot{border-top:1px solid var(--line);margin-top:48px;padding:28px 0 48px;color:var(--muted)}
.foot .wrap{display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap}
@media(max-width:640px){
  .hero{padding-top:32px}
  h1{font-size:2.15rem}
}
`

function document(options: {
  title: string
  description: string
  canonical: string
  body: string
  jsonLd?: unknown[]
  wide?: boolean
}): string {
  const json = (options.jsonLd || [])
    .map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`)
    .join('\n')
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#F9A620">
<title>${escapeHtml(options.title)}</title>
<meta name="description" content="${escapeHtml(options.description)}">
<link rel="canonical" href="${escapeHtml(options.canonical)}">
<meta name="robots" content="index, follow">
<meta property="og:title" content="${escapeHtml(options.title)}">
<meta property="og:description" content="${escapeHtml(options.description)}">
<meta property="og:url" content="${escapeHtml(options.canonical)}">
<meta property="og:type" content="article">
<meta property="og:locale" content="pt_BR">
${json}
<style>${CSS}</style>
</head>
<body>
<header class="top"><div class="wrap"><a class="brand" href="${BASE}/guia">Athlet<b>IA</b></a><nav class="menu"><a href="${BASE}/guia">Guia</a><a href="${BASE}/blog">Blog</a><a href="${BASE}/termos">Termos</a><a class="btn" href="${BASE}/">Ver planos</a></nav></div></header>
${options.body}
<footer class="foot"><div class="wrap"><span>AthletIA · guia atualizado em ${escapeHtml(ATUALIZADO_VISIVEL)}</span><span><a href="${BASE}/privacidade">Privacidade</a> · <a href="${BASE}/llms.txt">llms.txt</a></span></div></footer>
</body>
</html>`
}

function crumbs(items: { nome: string; href?: string }[]): string {
  const parts = items.map((item, index) => {
    const last = index === items.length - 1
    const inner = item.href && !last ? `<a href="${item.href}">${escapeHtml(item.nome)}</a>` : escapeHtml(item.nome)
    return `<span>${inner}</span>`
  })
  return `<p class="crumbs">${parts.join(' · ')}</p>`
}

function precos(): string {
  return `<div class="prices">
    <div class="price"><small>Mensal</small><b>${escapeHtml(PLANOS[0].preco)}</b><small>${escapeHtml(PLANOS[0].periodo)}</small></div>
    <div class="price"><small>Trimestral</small><b>${escapeHtml(PLANOS[1].preco)}</b><small>${escapeHtml(PLANOS[1].precoMensal)} por mês</small></div>
    <div class="price"><small>Semestral</small><b>${escapeHtml(PLANOS[2].preco)}</b><small>${escapeHtml(PLANOS[2].precoMensal)} por mês</small></div>
  </div>`
}

function cta(foco: string): string {
  const resto = textoNoAthletia(foco).slice(foco.length).trim()
  return `<section class="cta"><p class="kicker">No AthletIA</p><h2>${escapeHtml(foco)}</h2><p class="muted">${escapeHtml(resto)}</p>${precos()}<a class="btn" href="${BASE}/">Ver o AthletIA</a></section>`
}

function jsonBreadcrumb(items: { nome: string; href: string }[]): unknown {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.nome,
      item: item.href,
    })),
  }
}

function cartoes(paginas: PaginaGuia[], tema: string): string {
  return paginas.map((pagina) => `<a class="card" href="${BASE}/guia/${tema}/${pagina.slug}"><p class="meta">Resposta</p><h3>${escapeHtml(pagina.pergunta)}</h3><p>${escapeHtml(pagina.resposta)}</p></a>`).join('')
}

export function renderGuiaHtml(requestPath: string): { status: number; html: string } {
  const clean = requestPath.replace(/\/+$/, '') || '/'
  if (clean === '/guia') return { status: 200, html: renderIndice() }
  const partes = clean.split('/').filter(Boolean)
  if (partes[0] !== 'guia') return { status: 404, html: '' }
  if (partes.length === 2) {
    const tema = TEMAS.find((item) => item.slug === partes[1])
    if (!tema) return { status: 404, html: '' }
    return { status: 200, html: renderTema(tema) }
  }
  if (partes.length === 3) {
    const pagina = buscarPagina(partes[1], partes[2])
    if (!pagina) return { status: 404, html: '' }
    return { status: 200, html: renderPagina(pagina) }
  }
  return { status: 404, html: '' }
}

function renderIndice(): string {
  const canonical = `${BASE}/guia`
  const blocos = TEMAS.map((tema) => {
    const paginas = paginasDoTema(tema.slug)
    return `<section class="section"><div class="wrap"><p class="kicker">${paginas.length} respostas</p><h2><a href="${BASE}/guia/${tema.slug}">${escapeHtml(tema.titulo)}</a></h2><p class="lead">${escapeHtml(tema.descricao)}</p><div class="grid" style="margin-top:16px">${cartoes(paginas, tema.slug)}</div></div></section>`
  }).join('')
  const fatos = fatosDoProduto().map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  const body = `<main>
<section class="hero"><div class="wrap">
${crumbs([{ nome: 'AthletIA', href: `${BASE}/` }, { nome: 'Guia' }])}
<p class="kicker">Guia de treino</p>
<h1>Respostas para montar a semana e saber o que o AthletIA faz.</h1>
<p class="lead">Cada página responde uma pergunta de treino com o que dá para afirmar de verdade: os preços publicados, o que o cadastro pergunta e o limite do aplicativo. Sem nota inventada e sem prazo de resultado.</p>
${precos()}
</div></section>
<section class="section"><div class="wrap"><h2>Fatos publicados</h2><ul class="facts">${fatos}</ul></div></section>
${blocos}
</main>`
  return document({
    title: 'Guia AthletIA',
    description: 'Respostas sobre treino, preços e o que o AthletIA faz e não faz.',
    canonical,
    body,
    wide: true,
    jsonLd: [jsonBreadcrumb([{ nome: 'AthletIA', href: `${BASE}/` }, { nome: 'Guia', href: canonical }])],
  })
}

function renderTema(tema: TemaGuia): string {
  const canonical = `${BASE}/guia/${tema.slug}`
  const paginas = paginasDoTema(tema.slug)
  const outros = TEMAS.filter((item) => item.slug !== tema.slug)
    .map((item) => `<a class="card" href="${BASE}/guia/${item.slug}"><p class="meta">Tema</p><h3>${escapeHtml(item.titulo)}</h3><p>${escapeHtml(item.descricao)}</p></a>`)
    .join('')
  const body = `<main><div class="wrap">
${crumbs([{ nome: 'AthletIA', href: `${BASE}/` }, { nome: 'Guia', href: `${BASE}/guia` }, { nome: tema.titulo }])}
<section class="hero" style="padding-top:28px"><p class="kicker">${paginas.length} respostas</p><h1>${escapeHtml(tema.titulo)}</h1><p class="lead">${escapeHtml(tema.descricao)}</p></section>
<div class="grid">${cartoes(paginas, tema.slug)}</div>
<section class="section"><h2>Outros temas</h2><div class="grid">${outros}</div></section>
</div></main>`
  return document({
    title: `${tema.titulo} · Guia AthletIA`,
    description: tema.descricao,
    canonical,
    body,
    wide: true,
    jsonLd: [jsonBreadcrumb([
      { nome: 'AthletIA', href: `${BASE}/` },
      { nome: 'Guia', href: `${BASE}/guia` },
      { nome: tema.titulo, href: canonical },
    ])],
  })
}

function renderPagina(pagina: PaginaGuia): string {
  const tema = TEMAS.find((item) => item.slug === pagina.tema)!
  const canonical = `${BASE}/guia/${pagina.tema}/${pagina.slug}`
  const camada = camadas(pagina)
  const irmas = paginasDoTema(pagina.tema).filter((item) => item.slug !== pagina.slug)
  const inicio = irmas.findIndex((item) => item.slug > pagina.slug)
  const relacionadas = [...irmas.slice(inicio), ...irmas.slice(0, inicio)].slice(0, 3)
  const fatos = pagina.fatos.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  const passos = camada.passos.map((item, index) => `<li><span>${index + 1}</span>${escapeHtml(item)}</li>`).join('')
  const erros = camada.erros.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  const leitura = camada.leitura.map((item) => `<p>${escapeHtml(item)}</p>`).join('')
  const corpo = pagina.corpo.map((item) => `<p>${escapeHtml(item)}</p>`).join('')
  const faq = pagina.faq.map((item) => `<details open><summary>${escapeHtml(item.pergunta)}</summary><p>${escapeHtml(item.resposta)}</p></details>`).join('')
  const fontes = FONTES.map((fonte) => fonte.url
    ? `<li><a href="${escapeHtml(fonte.url)}">${escapeHtml(fonte.nome)}</a></li>`
    : `<li>${escapeHtml(fonte.nome)}</li>`).join('')
  const limites = LIMITACOES.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  const body = `<main><article class="wrap narrow">
${crumbs([
    { nome: 'AthletIA', href: `${BASE}/` },
    { nome: 'Guia', href: `${BASE}/guia` },
    { nome: tema.titulo, href: `${BASE}/guia/${tema.slug}` },
    { nome: pagina.pergunta },
  ])}
<p class="kicker">${escapeHtml(tema.titulo)}</p>
<h1>${escapeHtml(pagina.pergunta)}</h1>
<p class="muted">Por AthletIA · Atualizado em ${escapeHtml(ATUALIZADO_VISIVEL)}</p>
<section class="answer"><p class="kicker">Resposta direta</p><p>${escapeHtml(pagina.resposta)}</p></section>
<section class="section"><h2>O que dá para afirmar</h2><ul class="facts">${fatos}</ul></section>
<section class="section prose"><h2>Como isso funciona</h2>${corpo}</section>
<section class="section prose"><h2>Para ler com calma</h2>${leitura}</section>
<section class="section"><h2>Na prática</h2><ol class="steps">${passos}</ol></section>
<section class="section"><h2>O que enfraquece o plano</h2><ul class="errors">${erros}</ul></section>
${cta(pagina.foco)}
<section class="section"><h2>Perguntas frequentes</h2><div class="faq">${faq}</div></section>
<section class="section"><h2>Limitações</h2><ul class="errors">${limites}</ul></section>
<section class="section"><h2>Fontes</h2><ul class="note">${fontes}</ul></section>
<section class="section"><h2>Continuar neste tema</h2><div class="grid">${cartoes(relacionadas, pagina.tema)}</div></section>
</article></main>`
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: pagina.pergunta,
    description: pagina.resposta,
    inLanguage: 'pt-BR',
    dateModified: LASTMOD_GUIA,
    datePublished: LASTMOD_GUIA,
    author: { '@type': 'Organization', name: 'AthletIA', url: BASE },
    publisher: { '@type': 'Organization', name: 'AthletIA', url: BASE },
    mainEntityOfPage: canonical,
  }
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pagina.faq.map((item) => ({
      '@type': 'Question',
      name: item.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: item.resposta },
    })),
  }
  return document({
    title: `${pagina.pergunta} · Guia AthletIA`,
    description: pagina.resposta,
    canonical,
    body,
    jsonLd: [
      article,
      faqLd,
      jsonBreadcrumb([
        { nome: 'AthletIA', href: `${BASE}/` },
        { nome: 'Guia', href: `${BASE}/guia` },
        { nome: tema.titulo, href: `${BASE}/guia/${tema.slug}` },
        { nome: pagina.pergunta, href: canonical },
      ]),
    ],
  })
}

export function renderLlmsGuia(): string {
  const fatos = fatosDoProduto().map((item) => `- ${item}`).join('\n')
  const secoes = TEMAS.map((tema) => {
    const linhas = paginasDoTema(tema.slug).map((pagina) => {
      return `- [${pagina.pergunta}](${BASE}/guia/${tema.slug}/${pagina.slug}): ${pagina.resposta}`
    })
    return `## ${tema.titulo}\n\n${tema.descricao}\n\n${linhas.join('\n')}`
  }).join('\n\n')
  return `# AthletIA

> Aplicativo que monta treino com os dados do cadastro. Não passa dieta e não substitui médico nem profissional de educação física.

${fatos}

## Guia

- [Guia AthletIA](${BASE}/guia): índice das respostas
${TEMAS.map((tema) => `- [${tema.titulo}](${BASE}/guia/${tema.slug}): ${tema.descricao}`).join('\n')}

${secoes}

## Site

- [Página do AthletIA](${BASE}/)
- [Blog](${BASE}/blog)
- [Termos de Uso](${BASE}/termos)
- [Privacidade](${BASE}/privacidade)
- [Cookies](${BASE}/cookies)

## Optional

- [Conteúdo completo em texto](${BASE}/llms-full.txt)
`
}

export function renderLlmsFull(): string {
  const blocos = PAGINAS.map((pagina) => {
    const camada = camadas(pagina)
    const faq = pagina.faq.map((item) => `P: ${item.pergunta}\nR: ${item.resposta}`).join('\n\n')
    return `## ${pagina.pergunta}\n\nURL: ${BASE}/guia/${pagina.tema}/${pagina.slug}\n\n${pagina.resposta}\n\n${pagina.fatos.map((item) => `- ${item}`).join('\n')}\n\n${pagina.corpo.join('\n\n')}\n\n${camada.leitura.join('\n\n')}\n\nNa prática:\n${camada.passos.map((item) => `- ${item}`).join('\n')}\n\nErros:\n${camada.erros.map((item) => `- ${item}`).join('\n')}\n\n${faq}`
  }).join('\n\n')
  return `# AthletIA\n\nAtualizado em ${ATUALIZADO_VISIVEL}.\n\n${blocos}\n`
}
