import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';
import { clearBlogCache } from '../middleware/blog-cache.middleware';

const prisma = new PrismaClient();

// Obter configurações do blog
export const obterConfiguracoes = async (req: AuthRequest, res: Response) => {
  try {
    let settings = await prisma.blogSettings.findUnique({
      where: { id: 'global' },
      include: {
        heroPost: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        globalCta: true
      }
    });

    // Se não existir, criar configurações padrão
    if (!settings) {
      const firstPublished = await prisma.blogArticle.findFirst({
        where: { published: true },
        orderBy: { publishedAt: 'desc' }
      });

      const categoriesForHome = await prisma.blogCategory.findMany({
        take: 6,
        orderBy: { name: 'asc' }
      });

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
              title: true,
              slug: true
            }
          },
          globalCta: true
        }
      });
    }

    res.json(settings);
  } catch (error: any) {
    console.error('Erro ao obter configurações:', error);
    res.status(500).json({
      error: 'Erro ao obter configurações',
      message: error.message
    });
  }
};

// Atualizar configurações do blog
export const atualizarConfiguracoes = async (req: AuthRequest, res: Response) => {
  try {
    const {
      heroPostId,
      featuredCount,
      categoriesDisplay,
      globalCtaId,
      blogIntroText,
      globalMetaTitle,
      globalMetaDescription
    } = req.body;

    // Verificar se post hero existe (se fornecido)
    if (heroPostId) {
      const heroPost = await prisma.blogArticle.findUnique({
        where: { id: heroPostId }
      });

      if (!heroPost) {
        return res.status(404).json({
          error: 'Post hero não encontrado'
        });
      }
    }

    // Verificar se CTA global existe (se fornecido)
    if (globalCtaId) {
      const globalCta = await prisma.blogCTA.findUnique({
        where: { id: globalCtaId }
      });

      if (!globalCta) {
        return res.status(404).json({
          error: 'CTA global não encontrado'
        });
      }
    }

    // Verificar se categorias existem (se fornecido)
    if (categoriesDisplay && Array.isArray(categoriesDisplay)) {
      const categories = await prisma.blogCategory.findMany({
        where: {
          id: { in: categoriesDisplay }
        }
      });

      if (categories.length !== categoriesDisplay.length) {
        return res.status(400).json({
          error: 'Uma ou mais categorias não foram encontradas'
        });
      }
    }

    const updateData: any = {};
    if (heroPostId !== undefined) updateData.heroPostId = heroPostId || null;
    if (featuredCount !== undefined) updateData.featuredCount = parseInt(String(featuredCount)) || 3;
    if (categoriesDisplay !== undefined) updateData.categoriesDisplay = categoriesDisplay || [];
    if (globalCtaId !== undefined) updateData.globalCtaId = globalCtaId || null;
    if (blogIntroText !== undefined) updateData.blogIntroText = blogIntroText?.trim() || null;
    if (globalMetaTitle !== undefined) updateData.globalMetaTitle = globalMetaTitle?.trim() || null;
    if (globalMetaDescription !== undefined) updateData.globalMetaDescription = globalMetaDescription?.trim() || null;

    let settings = await prisma.blogSettings.findUnique({
      where: { id: 'global' }
    });

    if (!settings) {
      settings = await prisma.blogSettings.create({
        data: {
          id: 'global',
          ...updateData
        },
        include: {
          heroPost: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          },
          globalCta: true
        }
      });
    } else {
      settings = await prisma.blogSettings.update({
        where: { id: 'global' },
        data: updateData,
        include: {
          heroPost: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          },
          globalCta: true
        }
      });
    }

    clearBlogCache();

    res.json({
      message: 'Configurações atualizadas com sucesso',
      settings
    });
  } catch (error: any) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({
      error: 'Erro ao atualizar configurações',
      message: error.message
    });
  }
};
