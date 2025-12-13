import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Listar todos os artigos
export const listarArtigos = async (req: AuthRequest, res: Response) => {
  try {
    const { published, category, search } = req.query;

    const where: any = {};

    if (published !== undefined) {
      where.published = published === 'true';
    }

    if (category) {
      where.category = category as string;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { excerpt: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const artigos = await prisma.blogArticle.findMany({
      where,
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        slug: true,
        title: true,
        metaTitle: true,
        category: true,
        featuredImage: true,
        excerpt: true,
        author: true,
        published: true,
        publishedAt: true,
        readingTime: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(artigos);
  } catch (error: any) {
    console.error('Erro ao listar artigos:', error);
    res.status(500).json({
      error: 'Erro ao listar artigos',
      message: error.message
    });
  }
};

// Obter um artigo específico
export const obterArtigo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const artigo = await prisma.blogArticle.findUnique({
      where: { id }
    });

    if (!artigo) {
      return res.status(404).json({
        error: 'Artigo não encontrado'
      });
    }

    res.json(artigo);
  } catch (error: any) {
    console.error('Erro ao obter artigo:', error);
    res.status(500).json({
      error: 'Erro ao obter artigo',
      message: error.message
    });
  }
};

// Criar novo artigo
export const criarArtigo = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      metaTitle,
      metaDescription,
      keywords,
      author,
      category,
      featuredImage,
      featuredImageAlt,
      excerpt,
      content,
      ctaTitle,
      ctaDescription,
      ctaButtonText,
      readingTime,
      published,
      publishedAt
    } = req.body;

    // Validações básicas
    if (!title || !title.trim()) {
      return res.status(400).json({
        error: 'Título é obrigatório'
      });
    }

    // Gerar slug se não fornecido
    const slug = req.body.slug?.trim() || generateSlug(title);

    // Verificar se slug já existe
    const existingArticle = await prisma.blogArticle.findUnique({
      where: { slug }
    });

    if (existingArticle) {
      return res.status(400).json({
        error: 'Já existe um artigo com este slug'
      });
    }

    const artigo = await prisma.blogArticle.create({
      data: {
        slug,
        title: title.trim(),
        metaTitle: metaTitle?.trim() || title.trim(),
        metaDescription: metaDescription?.trim() || excerpt?.trim() || '',
        keywords: Array.isArray(keywords) ? keywords : [],
        author: author?.trim() || 'Equipe AthletIA',
        category: category?.trim() || 'Geral',
        featuredImage: featuredImage || null,
        featuredImageAlt: featuredImageAlt || null,
        excerpt: excerpt?.trim() || '',
        content: content || '',
        ctaTitle: ctaTitle || null,
        ctaDescription: ctaDescription || null,
        ctaButtonText: ctaButtonText || null,
        readingTime: readingTime ? parseInt(readingTime) : 0,
        published: published === true || published === 'true',
        publishedAt: publishedAt ? new Date(publishedAt) : (published ? new Date() : null)
      }
    });

    res.status(201).json({
      message: 'Artigo criado com sucesso',
      artigo
    });
  } catch (error: any) {
    console.error('Erro ao criar artigo:', error);
    res.status(500).json({
      error: 'Erro ao criar artigo',
      message: error.message
    });
  }
};

// Atualizar artigo
export const atualizarArtigo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      metaTitle,
      metaDescription,
      keywords,
      author,
      category,
      featuredImage,
      featuredImageAlt,
      excerpt,
      content,
      ctaTitle,
      ctaDescription,
      ctaButtonText,
      readingTime,
      published,
      publishedAt
    } = req.body;

    // Verificar se artigo existe
    const existingArticle = await prisma.blogArticle.findUnique({
      where: { id }
    });

    if (!existingArticle) {
      return res.status(404).json({
        error: 'Artigo não encontrado'
      });
    }

    // Verificar se novo slug já existe (se foi alterado)
    if (slug && slug !== existingArticle.slug) {
      const slugExists = await prisma.blogArticle.findUnique({
        where: { slug }
      });

      if (slugExists) {
        return res.status(400).json({
          error: 'Já existe um artigo com este slug'
        });
      }
    }

    const updateData: any = {};

    if (title !== undefined) updateData.title = title.trim();
    if (slug !== undefined) updateData.slug = slug.trim();
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle.trim();
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription.trim();
    if (keywords !== undefined) updateData.keywords = Array.isArray(keywords) ? keywords : [];
    if (author !== undefined) updateData.author = author.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage || null;
    if (featuredImageAlt !== undefined) updateData.featuredImageAlt = featuredImageAlt || null;
    if (excerpt !== undefined) updateData.excerpt = excerpt.trim();
    if (content !== undefined) updateData.content = content;
    if (ctaTitle !== undefined) updateData.ctaTitle = ctaTitle || null;
    if (ctaDescription !== undefined) updateData.ctaDescription = ctaDescription || null;
    if (ctaButtonText !== undefined) updateData.ctaButtonText = ctaButtonText || null;
    if (readingTime !== undefined) updateData.readingTime = parseInt(readingTime);
    if (published !== undefined) updateData.published = published === true || published === 'true';
    if (publishedAt !== undefined) {
      updateData.publishedAt = publishedAt ? new Date(publishedAt) : null;
    } else if (published === true && !existingArticle.publishedAt) {
      // Se está publicando pela primeira vez, definir data de publicação
      updateData.publishedAt = new Date();
    }

    const artigo = await prisma.blogArticle.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Artigo atualizado com sucesso',
      artigo
    });
  } catch (error: any) {
    console.error('Erro ao atualizar artigo:', error);
    res.status(500).json({
      error: 'Erro ao atualizar artigo',
      message: error.message
    });
  }
};

// Deletar artigo
export const deletarArtigo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const artigo = await prisma.blogArticle.findUnique({
      where: { id }
    });

    if (!artigo) {
      return res.status(404).json({
        error: 'Artigo não encontrado'
      });
    }

    // Deletar imagem de capa se existir
    if (artigo.featuredImage) {
      const imagePath = path.join(process.cwd(), 'uploads', 'blog', artigo.featuredImage);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (error) {
          console.error('Erro ao deletar imagem:', error);
        }
      }
    }

    await prisma.blogArticle.delete({
      where: { id }
    });

    res.json({
      message: 'Artigo deletado com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao deletar artigo:', error);
    res.status(500).json({
      error: 'Erro ao deletar artigo',
      message: error.message
    });
  }
};

// Função auxiliar para gerar slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

