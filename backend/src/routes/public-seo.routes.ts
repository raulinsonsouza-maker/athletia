import { Router, Request, Response } from 'express'
import { renderFeed, renderLlms, renderLlmsFullText, renderPublicHtml, renderSitemap, submitIndexNow } from '../services/public-seo.service'

const router = Router()

router.get('/sitemap.xml', async (_req, res) => {
  try {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.send(await renderSitemap())
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error)
    res.status(500).send('Erro ao gerar sitemap')
  }
})

router.get('/feed.xml', async (_req, res) => {
  try {
    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
    res.send(await renderFeed())
  } catch (error) {
    console.error('Erro ao gerar feed:', error)
    res.status(500).send('Erro ao gerar feed')
  }
})

router.get('/llms-full.txt', (_req, res) => {
  try {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.send(renderLlmsFullText())
  } catch (error) {
    console.error('Erro ao gerar llms-full.txt:', error)
    res.status(500).send('Erro ao gerar llms-full.txt')
  }
})

router.get('/llms.txt', async (_req, res) => {
  try {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.send(await renderLlms())
  } catch (error) {
    console.error('Erro ao gerar llms.txt:', error)
    res.status(500).send('Erro ao gerar llms.txt')
  }
})

router.get('/indexnow/:file', (req, res) => {
  const key = process.env.INDEXNOW_KEY
  if (!key || req.params.file !== `${key}.txt`) {
    res.status(404).end()
    return
  }
  res.type('text/plain').send(key)
})

router.post('/indexnow/submit', async (req: Request, res: Response) => {
  const ip = req.socket.remoteAddress || ''
  const local = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1'
  if (!local) {
    res.status(404).end()
    return
  }
  try {
    const result = await submitIndexNow()
    res.json(result)
  } catch (error) {
    console.error('Erro no IndexNow:', error)
    res.status(500).json({ skipped: false })
  }
})

router.use('/seo-html', async (req, res) => {
  try {
    const full = req.originalUrl.split('?')[0]
    const result = await renderPublicHtml(full.replace(/^\/api\/seo-html/, '') || '/')
    if (result.status !== 200) {
      res.status(404).type('text/html').send('<!doctype html><title>Não encontrado</title><h1>Página não encontrada</h1>')
      return
    }
    res.status(200).type('html').send(result.html)
  } catch (error) {
    console.error('Erro ao renderizar HTML público:', error)
    res.status(500).send('Erro ao renderizar página')
  }
})

export default router
