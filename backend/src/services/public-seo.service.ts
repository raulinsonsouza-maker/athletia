import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { LASTMOD_GUIA, PAGINAS, TEMAS } from '../data/guia/paginas'
import { renderGuiaHtml, renderLlmsFull, renderLlmsGuia } from './guia-html'

const prisma = new PrismaClient()

const BASE = 'https://athletia.site'

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function absoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${BASE}${url.startsWith('/') ? '' : '/'}${url}`
}

function day(date: Date | null | undefined): string {
  return (date || new Date()).toISOString().split('T')[0]
}

function stripUnsafe(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
}

export async function publishedPosts() {
  return prisma.blogArticle.findMany({
    where: { published: true, status: 'published' },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    include: {
      categoryRelation: { select: { name: true, slug: true, description: true } },
      authorRelation: { select: { name: true, role: true } },
    },
  })
}

export async function publishedCategories() {
  return prisma.blogCategory.findMany({ orderBy: { name: 'asc' } })
}

type PublicUrl = { loc: string; title: string; lastmod?: string; image?: string | null }

export async function publicUrls(): Promise<PublicUrl[]> {
  const posts = await publishedPosts()
  const categories = await publishedCategories()
  const today = day(new Date())
  const staticPages: PublicUrl[] = [
    { loc: `${BASE}/`, title: 'AthletIA', lastmod: today },
    { loc: `${BASE}/blog`, title: 'Blog AthletIA', lastmod: today },
    { loc: `${BASE}/blog/categorias`, title: 'Categorias do blog', lastmod: today },
    { loc: `${BASE}/termos`, title: 'Termos de Uso', lastmod: today },
    { loc: `${BASE}/privacidade`, title: 'Política de Privacidade', lastmod: today },
    { loc: `${BASE}/cookies`, title: 'Política de Cookies', lastmod: today },
  ]
  const categoryUrls = categories.map((category) => ({
    loc: `${BASE}/blog/categoria/${category.slug}`,
    title: category.name,
    lastmod: day(category.updatedAt),
  }))
  const postUrls = posts.map((post) => ({
    loc: `${BASE}/blog/${post.slug}`,
    title: post.title,
    lastmod: day(post.updatedAt || post.publishedAt),
    image: absoluteUrl(post.featuredImage),
  }))
  const guiaUrls = [
    { loc: `${BASE}/guia`, title: 'Guia AthletIA', lastmod: LASTMOD_GUIA },
    ...TEMAS.map((tema) => ({
      loc: `${BASE}/guia/${tema.slug}`,
      title: tema.titulo,
      lastmod: LASTMOD_GUIA,
    })),
    ...PAGINAS.map((pagina) => ({
      loc: `${BASE}/guia/${pagina.tema}/${pagina.slug}`,
      title: pagina.pergunta,
      lastmod: LASTMOD_GUIA,
    })),
  ]
  return [...staticPages, ...guiaUrls, ...categoryUrls, ...postUrls]
}

export async function renderSitemap(): Promise<string> {
  const urls = await publicUrls()
  const body = urls.map((url) => {
    const image = url.image
      ? `\n    <image:image><image:loc>${escapeHtml(url.image)}</image:loc></image:image>`
      : ''
    const lastmod = url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''
    return `  <url>\n    <loc>${escapeHtml(url.loc)}</loc>${lastmod}${image}\n  </url>`
  }).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>\n`
}

export async function renderFeed(): Promise<string> {
  const posts = await publishedPosts()
  const items = posts.map((post) => {
    const link = `${BASE}/blog/${post.slug}`
    const date = (post.publishedAt || post.createdAt).toUTCString()
    return `  <item>\n    <title>${escapeHtml(post.metaTitle || post.title)}</title>\n    <link>${link}</link>\n    <guid>${link}</guid>\n    <pubDate>${date}</pubDate>\n    <description>${escapeHtml(post.metaDescription || post.excerpt || '')}</description>\n  </item>`
  }).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n  <title>AthletIA</title>\n  <link>${BASE}/blog</link>\n  <description>Artigos publicados no AthletIA</description>\n${items}\n</channel>\n</rss>\n`
}

export async function renderLlms(): Promise<string> {
  const posts = await publishedPosts()
  const artigos = posts.length
    ? posts.map((post) => `- [${post.title}](${BASE}/blog/${post.slug})`).join('\n')
    : '- Nenhum artigo publicado.'
  return renderLlmsGuia().replace(
    '## Optional',
    `## Artigos publicados\n\n${artigos}\n\n## Optional`
  )
}

export function renderLlmsFullText(): string {
  return renderLlmsFull()
}

function loadShell(): string {
  const dist = process.env.FRONTEND_DIST || '/opt/athletia/frontend/dist'
  return fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
}

function documentFromShell(options: {
  title: string
  description: string
  canonical: string
  body: string
  jsonLd?: unknown[]
}): string {
  let html = loadShell()
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(options.title)}</title>`)
  html = html.replace(
    /(<meta name="description" content=")[^"]*(")/,
    `$1${escapeHtml(options.description)}$2`
  )
  const json = (options.jsonLd || [])
    .map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`)
    .join('\n')
  const head = `<link rel="canonical" href="${options.canonical}" />\n${json}\n`
  html = html.replace('</head>', `${head}</head>`)
  html = html.replace('<div id="root"></div>', `<div id="root">${options.body}</div>`)
  return html
}

function articleBody(content: string): string {
  const trimmed = content.trim()
  if (!trimmed) return ''
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return stripUnsafe(trimmed)
  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('\n')
}

const LEGAL: Record<string, { title: string; description: string; html: string }> = {
  termos: {
    title: 'Termos de Uso',
    description: 'Termos de Uso do AthletIA.',
    html: `<main><h1>Termos de Uso</h1>
<h2>1. Aceitação dos Termos</h2><p>Ao acessar e utilizar o serviço AthletIA, você concorda em cumprir e estar vinculado aos seguintes Termos de Uso. Se você não concorda com qualquer parte destes termos, não deve utilizar nosso serviço.</p>
<h2>2. Descrição do Serviço</h2><p>O AthletIA é uma plataforma digital que oferece treinos personalizados gerados por inteligência artificial. Nossos serviços incluem:</p><ul><li>Criação de planos de treino personalizados baseados em seus dados físicos e objetivos</li><li>Ajuste automático de treinos conforme seu progresso</li><li>Acompanhamento de histórico de treinos e evolução</li><li>Acesso a exercícios e instruções detalhadas</li></ul>
<h2>3. Elegibilidade</h2><p>Para utilizar o AthletIA, você deve:</p><ul><li>Ter pelo menos 18 anos de idade ou ter autorização de um responsável legal</li><li>Fornecer informações precisas e atualizadas durante o cadastro</li><li>Manter a segurança de sua conta e senha</li><li>Ser responsável por todas as atividades que ocorrem sob sua conta</li></ul>
<h2>4. Assinatura e Pagamento</h2><p>O acesso aos serviços do AthletIA requer uma assinatura ativa. Os planos disponíveis e preços estão claramente indicados em nossa página de checkout. Ao assinar, você concorda em pagar as taxas aplicáveis conforme o plano escolhido.</p><p>As assinaturas são renovadas automaticamente, a menos que você cancele antes do término do período de assinatura. Você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta.</p>
<h2>5. Uso do Serviço</h2><p>Você concorda em:</p><ul><li>Usar o serviço apenas para fins legais e de acordo com estes Termos</li><li>Não tentar acessar áreas restritas do sistema</li><li>Não interferir ou interromper o funcionamento do serviço</li><li>Não usar o serviço de forma que possa danificar, desabilitar ou sobrecarregar nossos servidores</li><li>Não tentar obter acesso não autorizado a qualquer parte do serviço</li></ul>
<h2>6. Limitação de Responsabilidade</h2><p>IMPORTANTE: O AthletIA fornece informações e orientações sobre exercícios físicos, mas não substitui o aconselhamento médico profissional. Antes de iniciar qualquer programa de exercícios, consulte um médico ou profissional de saúde qualificado.</p><ul><li>O uso do serviço é por sua conta e risco</li><li>O AthletIA não se responsabiliza por lesões ou danos resultantes do uso do serviço</li><li>Você é responsável por avaliar sua capacidade física antes de realizar qualquer exercício</li><li>Você deve interromper qualquer exercício se sentir dor ou desconforto</li></ul>
<h2>7. Propriedade Intelectual</h2><p>Todo o conteúdo do AthletIA, incluindo mas não limitado a textos, gráficos, logos, ícones, imagens, software e compilações de dados, é propriedade do AthletIA ou de seus fornecedores de conteúdo e está protegido por leis de direitos autorais e outras leis de propriedade intelectual.</p>
<h2>8. Modificações do Serviço</h2><p>Reservamos o direito de modificar, suspender ou descontinuar qualquer aspecto do serviço a qualquer momento, com ou sem aviso prévio. Não seremos responsáveis perante você ou terceiros por qualquer modificação, suspensão ou descontinuação do serviço.</p>
<h2>9. Rescisão</h2><p>Podemos encerrar ou suspender sua conta e acesso ao serviço imediatamente, sem aviso prévio, por qualquer motivo, incluindo se você violar estes Termos de Uso. Após a rescisão, seu direito de usar o serviço cessará imediatamente.</p>
<h2>10. Alterações nos Termos</h2><p>Reservamos o direito de modificar estes Termos de Uso a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação. Seu uso continuado do serviço após tais alterações constitui sua aceitação dos novos termos.</p>
<h2>11. Lei Aplicável</h2><p>Estes Termos de Uso são regidos pelas leis do Brasil. Qualquer disputa relacionada a estes termos será resolvida nos tribunais competentes do Brasil.</p>
<h2>12. Contato</h2><p>Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através dos canais de suporte disponíveis em nossa plataforma.</p>
<p><a href="${BASE}/">Voltar para o início</a></p></main>`,
  },
  privacidade: {
    title: 'Política de Privacidade',
    description: 'Política de Privacidade do AthletIA.',
    html: `<main><h1>Política de Privacidade</h1>
<h2>1. Introdução</h2><p>O AthletIA ("nós", "nosso" ou "plataforma") está comprometido em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você utiliza nosso serviço.</p>
<h2>2. Informações que Coletamos</h2><p>Coletamos os seguintes tipos de informações:</p><h3>2.1. Informações Fornecidas por Você</h3><ul><li>Dados de cadastro: nome, e-mail, telefone</li><li>Dados físicos: altura, peso, idade, sexo, tipo de corpo</li><li>Dados de treino: objetivos, nível de experiência, frequência, tempo disponível</li><li>Informações de pagamento: processadas através de provedores de pagamento seguros</li><li>Dados de saúde: lesões, limitações físicas (fornecidos voluntariamente)</li></ul><h3>2.2. Informações Coletadas Automaticamente</h3><ul><li>Dados de uso: treinos realizados, exercícios concluídos, progresso</li><li>Dados técnicos: endereço IP, tipo de navegador, dispositivo utilizado</li><li>Cookies e tecnologias similares (conforme nossa Política de Cookies)</li></ul>
<h2>3. Como Usamos suas Informações</h2><ul><li>Criar e personalizar seus treinos baseados em seus dados físicos e objetivos</li><li>Ajustar automaticamente seus treinos conforme seu progresso</li><li>Processar pagamentos e gerenciar sua assinatura</li><li>Enviar comunicações importantes sobre sua conta e o serviço</li><li>Melhorar nossos serviços e desenvolver novos recursos</li><li>Garantir a segurança e prevenir fraudes</li><li>Cumprir obrigações legais e regulatórias</li></ul>
<h2>4. Compartilhamento de Informações</h2><p>Não vendemos suas informações pessoais. Podemos compartilhar suas informações apenas nas seguintes situações:</p><ul><li>Provedores de Serviços: com empresas que nos auxiliam a operar nossa plataforma (processamento de pagamentos, hospedagem, análise de dados)</li><li>Obrigações Legais: quando exigido por lei ou para proteger nossos direitos legais</li><li>Com seu Consentimento: quando você autorizar explicitamente o compartilhamento</li></ul>
<h2>5. Segurança dos Dados</h2><p>Implementamos medidas de segurança técnicas e organizacionais adequadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui criptografia de dados sensíveis, acesso restrito, monitoramento regular de segurança e backups regulares dos dados.</p>
<h2>6. Retenção de Dados</h2><p>Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos descritos nesta política, a menos que um período de retenção mais longo seja exigido ou permitido por lei. Quando você cancela sua conta, podemos reter certas informações conforme necessário para cumprir obrigações legais ou resolver disputas.</p>
<h2>7. Seus Direitos</h2><p>De acordo com a LGPD (Lei Geral de Proteção de Dados), você tem os seguintes direitos: acesso, correção, exclusão, portabilidade, revogação e oposição. Para exercer esses direitos, entre em contato conosco através dos canais de suporte disponíveis em nossa plataforma.</p>
<h2>8. Cookies e Tecnologias Similares</h2><p>Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso do serviço e personalizar conteúdo. Para mais informações, consulte nossa <a href="${BASE}/cookies">Política de Cookies</a>.</p>
<h2>9. Privacidade de Menores</h2><p>Nossos serviços são destinados a usuários com 18 anos ou mais. Não coletamos intencionalmente informações pessoais de menores de 18 anos. Se tomarmos conhecimento de que coletamos informações de um menor sem consentimento dos pais, tomaremos medidas para excluir essas informações.</p>
<h2>10. Transferência Internacional de Dados</h2><p>Seus dados podem ser processados e armazenados em servidores localizados fora do Brasil. Ao utilizar nosso serviço, você consente com a transferência de suas informações para esses servidores. Garantimos que medidas adequadas de segurança sejam implementadas para proteger seus dados.</p>
<h2>11. Alterações nesta Política</h2><p>Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre alterações significativas publicando a nova política nesta página e atualizando a data de última atualização.</p>
<h2>12. Contato</h2><p>Se você tiver dúvidas, preocupações ou solicitações relacionadas a esta Política de Privacidade ou ao tratamento de suas informações pessoais, entre em contato conosco através dos canais de suporte disponíveis em nossa plataforma.</p>
<p><a href="${BASE}/">Voltar para o início</a></p></main>`,
  },
  cookies: {
    title: 'Política de Cookies',
    description: 'Política de Cookies do AthletIA.',
    html: `<main><h1>Política de Cookies</h1>
<h2>1. O que são Cookies?</h2><p>Cookies são pequenos arquivos de texto armazenados em seu dispositivo quando você visita um site. Eles são utilizados para fazer os sites funcionarem de forma mais eficiente e para fornecer informações aos proprietários do site.</p>
<h2>2. Como Usamos Cookies</h2><ul><li>Autenticação: manter você conectado à sua conta</li><li>Preferências: lembrar suas configurações e preferências</li><li>Análise: entender como você utiliza nosso serviço para melhorias</li><li>Segurança: proteger contra atividades fraudulentas</li><li>Marketing: personalizar anúncios e medir eficácia de campanhas</li></ul>
<h2>3. Tipos de Cookies que Utilizamos</h2><h3>3.1. Cookies Essenciais</h3><p>Esses cookies são necessários para o funcionamento básico do site e não podem ser desativados. Eles geralmente são definidos apenas em resposta a ações feitas por você, como definir suas preferências de privacidade, fazer login ou preencher formulários.</p><h3>3.2. Cookies de Performance</h3><p>Esses cookies nos permitem contar visitas e fontes de tráfego para que possamos medir e melhorar o desempenho do nosso site.</p><h3>3.3. Cookies de Funcionalidade</h3><p>Esses cookies permitem que o site forneça funcionalidades e personalização aprimoradas.</p><h3>3.4. Cookies de Marketing</h3><p>Esses cookies podem ser definidos através do nosso site por nossos parceiros de publicidade.</p>
<h2>4. Cookies de Terceiros</h2><ul><li>Google Analytics: para análise de tráfego e comportamento dos usuários</li><li>Google Ads: para rastreamento de conversões e personalização de anúncios</li><li>Provedores de Pagamento: para processar transações de forma segura</li></ul>
<h2>5. Gerenciamento de Cookies</h2><p>Você tem controle sobre os cookies. A maioria dos navegadores permite ver, excluir e bloquear cookies. Se você bloquear ou excluir cookies, algumas funcionalidades do nosso site podem não funcionar corretamente.</p>
<h2>6. Como Gerenciar Cookies em Seu Navegador</h2><p>Google Chrome: Configurações, Privacidade e segurança, Cookies e outros dados de sites. Mozilla Firefox: Opções, Privacidade e Segurança, Cookies e Dados de Sites. Safari: Preferências, Privacidade, Gerenciar Dados do Site. Microsoft Edge: Configurações, Cookies e permissões de site.</p>
<h2>7. Cookies e Dispositivos Móveis</h2><p>Em dispositivos móveis, você pode gerenciar cookies através das configurações do navegador.</p>
<h2>8. Atualizações desta Política</h2><p>Podemos atualizar esta Política de Cookies periodicamente para refletir mudanças em nossas práticas ou por outras razões operacionais, legais ou regulatórias.</p>
<h2>9. Mais Informações</h2><ul><li><a href="https://www.allaboutcookies.org">www.allaboutcookies.org</a></li><li><a href="https://www.youronlinechoices.com">www.youronlinechoices.com</a></li></ul>
<h2>10. Contato</h2><p>Se você tiver dúvidas sobre nossa Política de Cookies, entre em contato conosco através dos canais de suporte disponíveis em nossa plataforma.</p>
<p><a href="${BASE}/">Voltar para o início</a></p></main>`,
  },
}

export async function renderPublicHtml(requestPath: string): Promise<{ status: number; html: string }> {
  const clean = requestPath.replace(/\/+$/, '') || '/'
  if (clean === '/guia' || clean.startsWith('/guia/')) {
    return renderGuiaHtml(clean)
  }
  const legal = LEGAL[clean.replace(/^\//, '')]
  if (legal) {
    return {
      status: 200,
      html: documentFromShell({
        title: legal.title,
        description: legal.description,
        canonical: `${BASE}${clean}`,
        body: legal.html,
      }),
    }
  }

  if (clean === '/blog' || clean === '/blog/categorias') {
    const posts = await publishedPosts()
    const categories = await publishedCategories()
    const list = posts.map((post) => `<li><a href="${BASE}/blog/${post.slug}">${escapeHtml(post.title)}</a><p>${escapeHtml(post.excerpt || '')}</p></li>`).join('')
    const cats = categories.map((category) => `<li><a href="${BASE}/blog/categoria/${category.slug}">${escapeHtml(category.name)}</a></li>`).join('')
    const title = clean === '/blog' ? 'Blog AthletIA' : 'Categorias do blog'
    return {
      status: 200,
      html: documentFromShell({
        title,
        description: title,
        canonical: `${BASE}${clean}`,
        body: `<main><h1>${title}</h1>${clean === '/blog' ? `<p><a href="${BASE}/guia">Guia AthletIA: respostas sobre treino e o aplicativo</a></p>` : ''}<ul>${cats}</ul><ul>${list}</ul></main>`,
      }),
    }
  }

  const categoryMatch = clean.match(/^\/blog\/categoria\/([^/]+)$/)
  if (categoryMatch) {
    const category = await prisma.blogCategory.findUnique({ where: { slug: categoryMatch[1] } })
    if (!category) return { status: 404, html: '' }
    const posts = await prisma.blogArticle.findMany({
      where: { published: true, status: 'published', categoryId: category.id },
      orderBy: { publishedAt: 'desc' },
    })
    const list = posts.map((post) => `<li><a href="${BASE}/blog/${post.slug}">${escapeHtml(post.title)}</a></li>`).join('')
    return {
      status: 200,
      html: documentFromShell({
        title: category.metaTitle || category.name,
        description: category.metaDescription || category.description || category.name,
        canonical: `${BASE}${clean}`,
        body: `<main><h1>${escapeHtml(category.name)}</h1><p>${escapeHtml(category.description || '')}</p><ul>${list}</ul></main>`,
      }),
    }
  }

  const postMatch = clean.match(/^\/blog\/([^/]+)$/)
  if (postMatch && postMatch[1] !== 'categorias') {
    const post = await prisma.blogArticle.findFirst({
      where: { slug: postMatch[1], published: true, status: 'published' },
      include: { categoryRelation: true, authorRelation: true },
    })
    if (!post) return { status: 404, html: '' }
    const authorName = post.authorRelation?.name || post.author || 'Equipe AthletIA'
    const canonical = `${BASE}/blog/${post.slug}`
    const image = absoluteUrl(post.featuredImage)
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.metaDescription,
      image: image || undefined,
      datePublished: (post.publishedAt || post.createdAt).toISOString(),
      dateModified: (post.updatedAt || post.publishedAt || post.createdAt).toISOString(),
      inLanguage: 'pt-BR',
      author: { '@type': 'Person', name: authorName, jobTitle: post.authorRelation?.role || undefined },
      publisher: {
        '@type': 'Organization',
        name: 'AthletIA',
        logo: { '@type': 'ImageObject', url: `${BASE}/favicon.svg` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    }
    return {
      status: 200,
      html: documentFromShell({
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
        canonical,
        jsonLd: [jsonLd],
        body: `<main><h1>${escapeHtml(post.title)}</h1><p>${escapeHtml(post.excerpt || '')}</p>${articleBody(post.content)}</main>`,
      }),
    }
  }

  return { status: 404, html: '' }
}

export async function submitIndexNow(): Promise<{ skipped: boolean; status?: number }> {
  const key = process.env.INDEXNOW_KEY
  if (!key) return { skipped: true }
  const urls = (await publicUrls()).map((url) => url.loc).slice(0, 10000)
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: 'athletia.site',
      key,
      keyLocation: `${BASE}/${key}.txt`,
      urlList: urls,
    }),
  })
  return { skipped: false, status: response.status }
}
