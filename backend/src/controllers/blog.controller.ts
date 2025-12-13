import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listar artigos públicos (apenas publicados)
export const listarArtigosPublicos = async (req: Request, res: Response) => {
  try {
    const { category, search, limit } = req.query;

    const where: any = {
      published: true
    };

    if (category) {
      where.category = category as string;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { excerpt: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const take = limit ? parseInt(limit as string) : undefined;

    const artigos = await prisma.blogArticle.findMany({
      where,
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      take,
      select: {
        id: true,
        slug: true,
        title: true,
        metaTitle: true,
        category: true,
        featuredImage: true,
        featuredImageAlt: true,
        excerpt: true,
        author: true,
        publishedAt: true,
        readingTime: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(artigos);
  } catch (error: any) {
    console.error('Erro ao listar artigos públicos:', error);
    res.status(500).json({
      error: 'Erro ao listar artigos',
      message: error.message
    });
  }
};

// Obter artigo público por slug
export const obterArtigoPublicoPorSlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const artigo = await prisma.blogArticle.findUnique({
      where: { 
        slug,
        published: true
      }
    });

    if (!artigo) {
      return res.status(404).json({
        error: 'Artigo não encontrado'
      });
    }

    res.json(artigo);
  } catch (error: any) {
    console.error('Erro ao obter artigo público:', error);
    res.status(500).json({
      error: 'Erro ao obter artigo',
      message: error.message
    });
  }
};

// Obter artigo público por ID (para compatibilidade)
export const obterArtigoPublicoPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const artigo = await prisma.blogArticle.findUnique({
      where: { 
        id,
        published: true
      }
    });

    if (!artigo) {
      return res.status(404).json({
        error: 'Artigo não encontrado'
      });
    }

    res.json(artigo);
  } catch (error: any) {
    console.error('Erro ao obter artigo público:', error);
    res.status(500).json({
      error: 'Erro ao obter artigo',
      message: error.message
    });
  }
};
