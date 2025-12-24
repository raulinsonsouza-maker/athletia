import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Listar artigos públicos (apenas publicados)
export const listarArtigosPublicos = async (req: Request, res: Response) => {
  try {
    const { category, categorySlug, search, limit, featured, pillar } = req.query

    const where: any = {
      published: true,
      status: 'published'
    }

    if (category) {
      where.category = category as string
    }

    if (categorySlug) {
      where.categoryRelation = {
        slug: categorySlug as string
      }
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    if (pillar === 'true') {
      where.isPillar = true
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { excerpt: { contains: search as string, mode: 'insensitive' } },
        { subtitle: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    const take = limit ? parseInt(limit as string) : undefined

    console.log('[Blog] Listando artigos públicos:', {
      where,
      take,
      query: req.query
    })

    const artigos = await prisma.blogArticle.findMany({
      where,
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      take,
      include: {
        categoryRelation: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true
          }
        },
        authorRelation: {
          select: {
            id: true,
            name: true,
            role: true,
            avatar: true
          }
        }
      }
    })

    console.log('[Blog] Artigos encontrados:', {
      total: artigos.length,
      artigos: artigos.map(a => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        published: a.published,
        status: a.status,
        publishedAt: a.publishedAt
      }))
    })

    res.json(artigos)
  } catch (error: any) {
    console.error('Erro ao listar artigos públicos:', error)
    res.status(500).json({
      error: 'Erro ao listar artigos',
      message: error.message
    })
  }
}

// Obter artigo público por slug
export const obterArtigoPublicoPorSlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params

    const artigo = await prisma.blogArticle.findFirst({
      where: {
        slug,
        published: true,
        status: 'published'
      },
      include: {
        categoryRelation: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            description: true
          }
        },
        authorRelation: {
          select: {
            id: true,
            name: true,
            role: true,
            bio: true,
            avatar: true,
            externalLink: true
          }
        },
        ctaConfig: {
          select: {
            id: true,
            name: true,
            type: true,
            title: true,
            description: true,
            buttonText: true,
            link: true,
            style: true
          }
        }
      }
    })

    if (!artigo) {
      return res.status(404).json({
        error: 'Artigo não encontrado'
      })
    }

    // Buscar posts relacionados
    let relatedPosts: any[] = []
    if (artigo.relatedPosts && artigo.relatedPosts.length > 0) {
      // Buscar posts relacionados configurados manualmente
      relatedPosts = await prisma.blogArticle.findMany({
        where: {
          id: { in: artigo.relatedPosts },
          published: true,
          status: 'published'
        },
        select: {
          id: true,
          slug: true,
          title: true,
          subtitle: true,
          featuredImage: true,
          featuredImageAlt: true,
          excerpt: true,
          readingTime: true,
          publishedAt: true,
          categoryRelation: {
            select: {
              name: true,
              slug: true
            }
          },
          authorRelation: {
            select: {
              name: true,
              avatar: true
            }
          }
        },
        take: 3
      })
    }
    
    // Se não houver posts relacionados configurados, buscar automaticamente
    if (relatedPosts.length === 0) {
      const whereClause: any = {
        id: { not: artigo.id },
        published: true,
        status: 'published'
      }
      
      // Tentar buscar da mesma categoria primeiro
      if (artigo.categoryId) {
        whereClause.categoryId = artigo.categoryId
      }
      
      relatedPosts = await prisma.blogArticle.findMany({
        where: whereClause,
        select: {
          id: true,
          slug: true,
          title: true,
          subtitle: true,
          featuredImage: true,
          featuredImageAlt: true,
          excerpt: true,
          readingTime: true,
          publishedAt: true,
          categoryRelation: {
            select: {
              name: true,
              slug: true
            }
          },
          authorRelation: {
            select: {
              name: true,
              avatar: true
            }
          }
        },
        orderBy: {
          publishedAt: 'desc'
        },
        take: 3
      })
      
      // Se ainda não houver posts da mesma categoria, buscar posts mais recentes
      if (relatedPosts.length < 3 && artigo.categoryId) {
        const additionalPosts = await prisma.blogArticle.findMany({
          where: {
            id: { 
              notIn: [artigo.id, ...relatedPosts.map(p => p.id)]
            },
            published: true,
            status: 'published',
            categoryId: { not: artigo.categoryId }
          },
          select: {
            id: true,
            slug: true,
            title: true,
            subtitle: true,
            featuredImage: true,
            featuredImageAlt: true,
            excerpt: true,
            readingTime: true,
            publishedAt: true,
            categoryRelation: {
              select: {
                name: true,
                slug: true
              }
            },
            authorRelation: {
              select: {
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            publishedAt: 'desc'
          },
          take: 3 - relatedPosts.length
        })
        
        relatedPosts = [...relatedPosts, ...additionalPosts]
      }
    }

    res.json({
      ...artigo,
      relatedPosts
    })
  } catch (error: any) {
    console.error('Erro ao obter artigo público:', error)
    res.status(500).json({
      error: 'Erro ao obter artigo',
      message: error.message
    })
  }
}

// Obter artigo público por ID (para compatibilidade)
export const obterArtigoPublicoPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const artigo = await prisma.blogArticle.findUnique({
      where: {
        id
      },
      include: {
        categoryRelation: true,
        authorRelation: true,
        ctaConfig: true
      }
    })

    if (!artigo || !artigo.published || artigo.status !== 'published') {
      return res.status(404).json({
        error: 'Artigo não encontrado'
      })
    }

    res.json(artigo)
  } catch (error: any) {
    console.error('Erro ao obter artigo público:', error)
    res.status(500).json({
      error: 'Erro ao obter artigo',
      message: error.message
    })
  }
}

// Listar categorias públicas
export const listarCategoriasPublicas = async (req: Request, res: Response) => {
  try {
    const categorias = await prisma.blogCategory.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        metaTitle: true,
        metaDescription: true,
        _count: {
          select: {
            articles: {
              where: {
                published: true,
                status: 'published'
              }
            }
          }
        }
      }
    })

    res.json(categorias)
  } catch (error: any) {
    console.error('Erro ao listar categorias:', error)
    res.status(500).json({
      error: 'Erro ao listar categorias',
      message: error.message
    })
  }
}

// Obter categoria pública por slug
export const obterCategoriaPublicaPorSlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params
    const { page = '1', limit = '10' } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const categoria = await prisma.blogCategory.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            articles: {
              where: {
                published: true,
                status: 'published'
              }
            }
          }
        }
      }
    })

    if (!categoria) {
      return res.status(404).json({
        error: 'Categoria não encontrada'
      })
    }

    const artigos = await prisma.blogArticle.findMany({
      where: {
        categoryRelation: {
          slug
        },
        published: true,
        status: 'published'
      },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limitNum,
      include: {
        categoryRelation: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true
          }
        },
        authorRelation: {
          select: {
            id: true,
            name: true,
            role: true,
            avatar: true
          }
        }
      }
    })

    const total = await prisma.blogArticle.count({
      where: {
        categoryRelation: {
          slug
        },
        published: true,
        status: 'published'
      }
    })

    res.json({
      ...categoria,
      artigos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error: any) {
    console.error('Erro ao obter categoria:', error)
    res.status(500).json({
      error: 'Erro ao obter categoria',
      message: error.message
    })
  }
}

// Listar artigos em destaque
export const listarArtigosDestaque = async (req: Request, res: Response) => {
  try {
    const { limit } = req.query
    const take = limit ? parseInt(limit as string) : 3

    console.log('[Blog] Listando artigos em destaque:', { limit: take })

    const artigos = await prisma.blogArticle.findMany({
      where: {
        published: true,
        status: 'published',
        isFeatured: true
      },
      orderBy: [
        { publishedAt: 'desc' },
        { viewsCount: 'desc' }
      ],
      take,
      include: {
        categoryRelation: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true
          }
        },
        authorRelation: {
          select: {
            id: true,
            name: true,
            role: true,
            avatar: true
          }
        }
      }
    })

    console.log('[Blog] Artigos em destaque encontrados:', {
      total: artigos.length,
      artigos: artigos.map(a => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        published: a.published,
        status: a.status
      }))
    })

    res.json(artigos)
  } catch (error: any) {
    console.error('Erro ao listar artigos em destaque:', error)
    res.status(500).json({
      error: 'Erro ao listar artigos em destaque',
      message: error.message
    })
  }
}

// Listar artigos pilar (evergreen)
export const listarArtigosPilar = async (req: Request, res: Response) => {
  try {
    const { limit } = req.query
    const take = limit ? parseInt(limit as string) : 6

    console.log('[Blog] Listando artigos pilar:', { limit: take })

    const artigos = await prisma.blogArticle.findMany({
      where: {
        published: true,
        status: 'published',
        isPillar: true
      },
      orderBy: [
        { viewsCount: 'desc' },
        { publishedAt: 'desc' }
      ],
      take,
      include: {
        categoryRelation: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true
          }
        },
        authorRelation: {
          select: {
            id: true,
            name: true,
            role: true,
            avatar: true
          }
        }
      }
    })

    console.log('[Blog] Artigos pilar encontrados:', {
      total: artigos.length,
      artigos: artigos.map(a => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        published: a.published,
        status: a.status
      }))
    })

    res.json(artigos)
  } catch (error: any) {
    console.error('Erro ao listar artigos pilar:', error)
    res.status(500).json({
      error: 'Erro ao listar artigos pilar',
      message: error.message
    })
  }
}

// Incrementar visualizações de um artigo
export const incrementarVisualizacoes = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params

    const artigo = await prisma.blogArticle.findUnique({
      where: { slug }
    })

    if (!artigo) {
      return res.status(404).json({
        error: 'Artigo não encontrado'
      })
    }

    const updated = await prisma.blogArticle.update({
      where: { slug },
      data: {
        viewsCount: {
          increment: 1
        }
      },
      select: {
        viewsCount: true
      }
    })

    res.json({ viewsCount: updated.viewsCount })
  } catch (error: any) {
    console.error('Erro ao incrementar visualizações:', error)
    res.status(500).json({
      error: 'Erro ao incrementar visualizações',
      message: error.message
    })
  }
}

// Obter configurações públicas do blog
export const obterConfiguracoesPublicas = async (req: Request, res: Response) => {
  try {
    // Verificar se o modelo existe
    if (!prisma.blogSettings) {
      console.error('❌ Prisma Client não tem blogSettings. Execute: npx prisma generate')
      return res.status(500).json({
        error: 'Modelo não disponível',
        message: 'Prisma Client precisa ser regenerado. Execute: npx prisma generate'
      })
    }

    let settings = await prisma.blogSettings.findUnique({
      where: { id: 'global' },
      include: {
        heroPost: {
          select: {
            id: true,
            slug: true,
            title: true,
            subtitle: true,
            featuredImage: true,
            featuredImageAlt: true,
            excerpt: true,
            published: true,
            status: true,
            categoryRelation: {
              select: {
                id: true,
                name: true,
                slug: true,
                icon: true
              }
            },
            authorRelation: {
              select: {
                id: true,
                name: true,
                role: true,
                avatar: true
              }
            },
            author: true,
            publishedAt: true,
            readingTime: true
          }
        },
        globalCta: true
      }
    })

    console.log('[Blog] Buscando configurações públicas')

    // Filtrar heroPost se não estiver publicado
    if (settings?.heroPost && (!settings.heroPost.published || settings.heroPost.status !== 'published')) {
      console.log('[Blog] HeroPost filtrado (não publicado):', {
        id: settings.heroPost.id,
        published: settings.heroPost.published,
        status: settings.heroPost.status
      })
      settings.heroPost = null
    }

    // Se não existir, criar configurações padrão
    if (!settings) {
      console.log('[Blog] Configurações não encontradas, criando padrão...')
      const firstPublished = await prisma.blogArticle.findFirst({
        where: { published: true, status: 'published' },
        orderBy: { publishedAt: 'desc' }
      })
      
      console.log('[Blog] Primeiro artigo publicado encontrado:', {
        encontrado: !!firstPublished,
        id: firstPublished?.id,
        slug: firstPublished?.slug
      })

      const categoriesForHome = await prisma.blogCategory.findMany({
        take: 6,
        orderBy: { name: 'asc' }
      })

      settings = await prisma.blogSettings.create({
        data: {
          id: 'global',
          heroPostId: firstPublished?.id || null,
          featuredCount: 3,
          categoriesDisplay: categoriesForHome.map(c => c.id),
          blogIntroText: 'Conteúdo sobre treino, saúde, evolução física e qualidade de vida. Aprenda estratégias práticas para acelerar seus resultados.',
          globalMetaTitle: 'Blog AthletIA | Treino, Saúde e Evolução Física',
          globalMetaDescription: 'Descubra estratégias práticas de treino, saúde e evolução física. Conteúdo especializado para acelerar seus resultados na academia.'
        },
        include: {
          heroPost: {
            select: {
              id: true,
              slug: true,
              title: true,
              subtitle: true,
              featuredImage: true,
              featuredImageAlt: true,
              excerpt: true,
              published: true,
              status: true,
              categoryRelation: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  icon: true
                }
              },
              authorRelation: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  avatar: true
                }
              },
              author: true,
              publishedAt: true,
              readingTime: true
            }
          },
          globalCta: true
        }
      })

      // Filtrar heroPost se não estiver publicado após criar
      if (settings?.heroPost && (!settings.heroPost.published || settings.heroPost.status !== 'published')) {
        console.log('[Blog] HeroPost filtrado após criar configurações')
        settings.heroPost = null
      }
    }

    console.log('[Blog] Configurações retornadas:', {
      heroPostId: settings?.heroPostId,
      heroPost: settings?.heroPost ? {
        id: settings.heroPost.id,
        slug: settings.heroPost.slug,
        published: settings.heroPost.published,
        status: settings.heroPost.status
      } : null,
      featuredCount: settings?.featuredCount
    })

    res.json(settings)
  } catch (error: any) {
    console.error('Erro ao obter configurações:', error)
    res.status(500).json({
      error: 'Erro ao obter configurações',
      message: error.message
    })
  }
}
