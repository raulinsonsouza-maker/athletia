import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { invalidatePostCache, clearBlogCache } from '../middleware/blog-cache.middleware';

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
      include: {
        categoryRelation: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        authorRelation: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
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
    // Processar dados do FormData ou JSON
    const isMultipart = req.file !== undefined;
    
    // Log para debug
    console.log('[Blog] Criar artigo:', {
      isMultipart,
      hasFile: !!req.file,
      contentType: req.headers['content-type'],
      bodyKeys: Object.keys(req.body),
      bodyTitle: req.body.title,
      bodySlug: req.body.slug
    });
    
    let title, subtitle, slug, metaTitle, metaDescription, keywords, author, category, categoryId, authorId, ctaType, ctaConfigId, featuredImage, featuredImageAlt, excerpt, content, ctaTitle, ctaDescription, ctaButtonText, readingTime, published, publishedAt, isFeatured, isPillar, relatedPosts, status;

    if (isMultipart) {
      // FormData - campos vêm como strings
      title = req.body.title || '';
      subtitle = req.body.subtitle || '';
      slug = req.body.slug || '';
      metaTitle = req.body.metaTitle || '';
      metaDescription = req.body.metaDescription || '';
      
      // Processar keywords - pode vir como string JSON ou array
      try {
        if (req.body.keywords) {
          if (typeof req.body.keywords === 'string') {
            keywords = req.body.keywords.trim() ? JSON.parse(req.body.keywords) : [];
          } else if (Array.isArray(req.body.keywords)) {
            keywords = req.body.keywords;
          } else {
            keywords = [];
          }
        } else {
          keywords = [];
        }
      } catch (error) {
        console.error('Erro ao processar keywords:', error);
        keywords = [];
      }
      
      // Processar relatedPosts
      try {
        if (req.body.relatedPosts) {
          if (typeof req.body.relatedPosts === 'string') {
            relatedPosts = req.body.relatedPosts.trim() ? JSON.parse(req.body.relatedPosts) : [];
          } else if (Array.isArray(req.body.relatedPosts)) {
            relatedPosts = req.body.relatedPosts;
          } else {
            relatedPosts = [];
          }
        } else {
          relatedPosts = [];
        }
      } catch (error) {
        console.error('Erro ao processar relatedPosts:', error);
        relatedPosts = [];
      }
      
      author = req.body.author || '';
      category = req.body.category || '';
      categoryId = req.body.categoryId || null;
      authorId = req.body.authorId || null;
      ctaType = req.body.ctaType || null;
      ctaConfigId = req.body.ctaConfigId || null;
      featuredImageAlt = req.body.featuredImageAlt || '';
      excerpt = req.body.excerpt || '';
      content = req.body.content || '';
      ctaTitle = req.body.ctaTitle || '';
      ctaDescription = req.body.ctaDescription || '';
      ctaButtonText = req.body.ctaButtonText || '';
      readingTime = req.body.readingTime ? parseInt(String(req.body.readingTime)) : 0;
      published = req.body.published === 'true' || req.body.published === true;
      status = req.body.status || (published ? 'published' : 'draft');
      isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
      isPillar = req.body.isPillar === 'true' || req.body.isPillar === true;
      publishedAt = req.body.publishedAt && req.body.publishedAt.trim() ? req.body.publishedAt : null;

      // Se houver arquivo de imagem, usar URL do arquivo salvo
      if (req.file) {
        featuredImage = `/api/uploads/blog/${req.file.filename}`;
      } else {
        featuredImage = null;
      }
    } else {
      // JSON normal
      ({
        title,
        subtitle,
        slug,
        metaTitle,
        metaDescription,
        keywords,
        author,
        category,
        categoryId,
        authorId,
        ctaType,
        ctaConfigId,
        featuredImage,
        featuredImageAlt,
        excerpt,
        content,
        ctaTitle,
        ctaDescription,
        ctaButtonText,
        readingTime,
        published,
        publishedAt,
        isFeatured,
        isPillar,
        relatedPosts,
        status
      } = req.body);
    }

    // Validações básicas
    if (!title || !title.trim()) {
      console.error('[Blog] Erro de validação - Título vazio:', {
        title,
        isMultipart,
        bodyKeys: Object.keys(req.body),
        body: req.body
      });
      return res.status(400).json({
        error: 'Título é obrigatório',
        received: { title, isMultipart, bodyKeys: Object.keys(req.body) }
      });
    }

    // Gerar slug se não fornecido
    if (!slug || !slug.trim()) {
      slug = generateSlug(title);
    } else {
      slug = slug.trim();
    }

    // Verificar se slug já existe
    const existingArticle = await prisma.blogArticle.findUnique({
      where: { slug }
    });

    if (existingArticle) {
      return res.status(400).json({
        error: 'Já existe um artigo com este slug'
      });
    }

    // Garantir sincronização entre published e status
    // Lógica: se qualquer um indicar "publicado", ambos devem estar como "publicado"
    const isPublished = published === true || published === 'true';
    const isStatusPublished = status === 'published';
    
    // Se status='published' OU published=true, então ambos devem ser true/published
    const syncedPublished = isStatusPublished || isPublished;
    const syncedStatus = syncedPublished ? 'published' : (status || 'draft');
    
    // Definir publishedAt se estiver publicando
    let finalPublishedAt = null;
    if (publishedAt && publishedAt.trim()) {
      finalPublishedAt = new Date(publishedAt);
    } else if (syncedPublished) {
      finalPublishedAt = new Date();
    }

    console.log('[Blog] Criando artigo:', {
      title: title.trim(),
      slug,
      published: syncedPublished,
      status: syncedStatus,
      publishedAt: finalPublishedAt
    });

    const artigo = await prisma.blogArticle.create({
      data: {
        slug,
        title: title.trim(),
        subtitle: subtitle?.trim() || null,
        metaTitle: metaTitle?.trim() || title.trim(),
        metaDescription: metaDescription?.trim() || excerpt?.trim() || '',
        keywords: Array.isArray(keywords) ? keywords : [],
        author: author?.trim() || 'Equipe AthletIA',
        category: category?.trim() || 'Geral',
        categoryId: categoryId || null,
        authorId: authorId || null,
        ctaType: ctaType || null,
        ctaConfigId: ctaConfigId || null,
        featuredImage: featuredImage || null,
        featuredImageAlt: featuredImageAlt?.trim() || null,
        excerpt: excerpt?.trim() || '',
        content: content || '',
        ctaTitle: ctaTitle?.trim() || null,
        ctaDescription: ctaDescription?.trim() || null,
        ctaButtonText: ctaButtonText?.trim() || null,
        readingTime: readingTime ? parseInt(String(readingTime)) : 0,
        published: syncedPublished,
        status: syncedStatus,
        isFeatured: isFeatured || false,
        isPillar: isPillar || false,
        relatedPosts: Array.isArray(relatedPosts) ? relatedPosts : [],
        publishedAt: finalPublishedAt
      }
    });

    console.log('[Blog] Artigo criado com sucesso:', {
      id: artigo.id,
      slug: artigo.slug,
      published: artigo.published,
      status: artigo.status,
      publishedAt: artigo.publishedAt
    });

    // Invalidar cache do blog
    clearBlogCache();

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
    
    // Verificar se artigo existe
    const existingArticle = await prisma.blogArticle.findUnique({
      where: { id }
    });

    if (!existingArticle) {
      return res.status(404).json({
        error: 'Artigo não encontrado'
      });
    }

    // Processar dados do FormData ou JSON
    const isMultipart = req.file !== undefined;
    let title, subtitle, slug, metaTitle, metaDescription, keywords, author, category, categoryId, authorId, ctaType, ctaConfigId, featuredImage, featuredImageAlt, excerpt, content, ctaTitle, ctaDescription, ctaButtonText, readingTime, published, publishedAt, isFeatured, isPillar, relatedPosts, status;

    if (isMultipart) {
      // FormData - campos vêm como strings
      title = req.body.title || '';
      subtitle = req.body.subtitle || '';
      slug = req.body.slug || '';
      metaTitle = req.body.metaTitle || '';
      metaDescription = req.body.metaDescription || '';
      
      // Processar keywords - pode vir como string JSON ou array
      try {
        if (req.body.keywords) {
          if (typeof req.body.keywords === 'string') {
            keywords = req.body.keywords.trim() ? JSON.parse(req.body.keywords) : undefined;
          } else if (Array.isArray(req.body.keywords)) {
            keywords = req.body.keywords;
          } else {
            keywords = undefined;
          }
        } else {
          keywords = undefined;
        }
      } catch (error) {
        console.error('Erro ao processar keywords:', error);
        keywords = undefined;
      }
      
      // Processar relatedPosts
      try {
        if (req.body.relatedPosts) {
          if (typeof req.body.relatedPosts === 'string') {
            relatedPosts = req.body.relatedPosts.trim() ? JSON.parse(req.body.relatedPosts) : undefined;
          } else if (Array.isArray(req.body.relatedPosts)) {
            relatedPosts = req.body.relatedPosts;
          } else {
            relatedPosts = undefined;
          }
        } else {
          relatedPosts = undefined;
        }
      } catch (error) {
        console.error('Erro ao processar relatedPosts:', error);
        relatedPosts = undefined;
      }
      
      author = req.body.author || '';
      category = req.body.category || '';
      categoryId = req.body.categoryId || undefined;
      authorId = req.body.authorId || undefined;
      ctaType = req.body.ctaType || undefined;
      ctaConfigId = req.body.ctaConfigId || undefined;
      featuredImageAlt = req.body.featuredImageAlt || '';
      excerpt = req.body.excerpt || '';
      content = req.body.content || '';
      ctaTitle = req.body.ctaTitle || '';
      ctaDescription = req.body.ctaDescription || '';
      ctaButtonText = req.body.ctaButtonText || '';
      readingTime = req.body.readingTime ? parseInt(String(req.body.readingTime)) : undefined;
      published = req.body.published === 'true' || req.body.published === true;
      status = req.body.status || undefined;
      isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
      isPillar = req.body.isPillar === 'true' || req.body.isPillar === true;
      publishedAt = req.body.publishedAt && req.body.publishedAt.trim() ? req.body.publishedAt : undefined;

      // Se houver arquivo de imagem, usar URL do arquivo salvo
      if (req.file) {
        // Deletar imagem antiga se existir
        if (existingArticle.featuredImage) {
          const oldImagePath = path.join(process.cwd(), 'uploads', 'blog', path.basename(existingArticle.featuredImage));
          if (fs.existsSync(oldImagePath)) {
            try {
              fs.unlinkSync(oldImagePath);
            } catch (error) {
              console.error('Erro ao deletar imagem antiga:', error);
            }
          }
        }
        featuredImage = `/api/uploads/blog/${req.file.filename}`;
      } else {
        featuredImage = undefined; // Não atualizar se não houver nova imagem
      }
    } else {
      // JSON normal
      ({
        title,
        subtitle,
        slug,
        metaTitle,
        metaDescription,
        keywords,
        author,
        category,
        categoryId,
        authorId,
        ctaType,
        ctaConfigId,
        featuredImage,
        featuredImageAlt,
        excerpt,
        content,
        ctaTitle,
        ctaDescription,
        ctaButtonText,
        readingTime,
        published,
        publishedAt,
        isFeatured,
        isPillar,
        relatedPosts,
        status
      } = req.body);
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
    if (subtitle !== undefined) updateData.subtitle = subtitle?.trim() || null;
    if (slug !== undefined) updateData.slug = slug.trim();
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle.trim();
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription.trim();
    if (keywords !== undefined) updateData.keywords = Array.isArray(keywords) ? keywords : [];
    if (author !== undefined) updateData.author = author.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;
    if (authorId !== undefined) updateData.authorId = authorId || null;
    if (ctaType !== undefined) updateData.ctaType = ctaType || null;
    if (ctaConfigId !== undefined) updateData.ctaConfigId = ctaConfigId || null;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage || null;
    if (featuredImageAlt !== undefined) updateData.featuredImageAlt = featuredImageAlt?.trim() || null;
    if (excerpt !== undefined) updateData.excerpt = excerpt.trim();
    if (content !== undefined) updateData.content = content;
    if (ctaTitle !== undefined) updateData.ctaTitle = ctaTitle?.trim() || null;
    if (ctaDescription !== undefined) updateData.ctaDescription = ctaDescription?.trim() || null;
    if (ctaButtonText !== undefined) updateData.ctaButtonText = ctaButtonText?.trim() || null;
    if (readingTime !== undefined) updateData.readingTime = parseInt(String(readingTime));
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isPillar !== undefined) updateData.isPillar = isPillar;
    if (relatedPosts !== undefined) updateData.relatedPosts = Array.isArray(relatedPosts) ? relatedPosts : [];

    // Sincronizar published e status
    if (published !== undefined || status !== undefined) {
      const currentPublished = published !== undefined 
        ? (published === true || published === 'true')
        : existingArticle.published;
      const currentStatus = status !== undefined 
        ? status 
        : existingArticle.status;
      
      // Lógica: se qualquer um indicar "publicado", ambos devem estar como "publicado"
      const isStatusPublished = currentStatus === 'published';
      const syncedPublished = isStatusPublished || currentPublished;
      const syncedStatus = syncedPublished ? 'published' : (currentStatus || 'draft');
      
      updateData.published = syncedPublished;
      updateData.status = syncedStatus;
      
      // Definir publishedAt se estiver publicando pela primeira vez
      if (syncedPublished && !existingArticle.publishedAt) {
        if (publishedAt !== undefined && publishedAt && publishedAt.trim()) {
          updateData.publishedAt = new Date(publishedAt);
        } else {
          updateData.publishedAt = new Date();
        }
      } else if (publishedAt !== undefined) {
        updateData.publishedAt = publishedAt && publishedAt.trim() ? new Date(publishedAt) : null;
      }
    } else if (publishedAt !== undefined) {
      updateData.publishedAt = publishedAt && publishedAt.trim() ? new Date(publishedAt) : null;
    }

    console.log('[Blog] Atualizando artigo:', {
      id,
      slug: existingArticle.slug,
      updateData: {
        published: updateData.published,
        status: updateData.status,
        publishedAt: updateData.publishedAt
      }
    });

    const artigo = await prisma.blogArticle.update({
      where: { id },
      data: updateData
    });

    console.log('[Blog] Artigo atualizado com sucesso:', {
      id: artigo.id,
      slug: artigo.slug,
      published: artigo.published,
      status: artigo.status,
      publishedAt: artigo.publishedAt
    });

    // Invalidar cache do post específico e geral
    invalidatePostCache(artigo.slug);
    clearBlogCache();

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

    const slug = artigo.slug;
    
    await prisma.blogArticle.delete({
      where: { id }
    });

    // Invalidar cache
    invalidatePostCache(slug);

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

// Marcar post como hero principal
export const marcarComoHero = async (req: AuthRequest, res: Response) => {
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

    // Atualizar configurações do blog
    await prisma.blogSettings.upsert({
      where: { id: 'global' },
      update: {
        heroPostId: id
      },
      create: {
        id: 'global',
        heroPostId: id
      }
    });

    res.json({
      message: 'Post marcado como hero principal',
      artigo
    });
  } catch (error: any) {
    console.error('Erro ao marcar como hero:', error);
    res.status(500).json({
      error: 'Erro ao marcar como hero',
      message: error.message
    });
  }
};

// Marcar post como destaque
export const marcarComoDestaque = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    const artigo = await prisma.blogArticle.findUnique({
      where: { id }
    });

    if (!artigo) {
      return res.status(404).json({
        error: 'Artigo não encontrado'
      });
    }

    const updated = await prisma.blogArticle.update({
      where: { id },
      data: {
        isFeatured: isFeatured === true || isFeatured === 'true'
      }
    });

    res.json({
      message: `Post ${isFeatured ? 'marcado' : 'desmarcado'} como destaque`,
      artigo: updated
    });
  } catch (error: any) {
    console.error('Erro ao marcar como destaque:', error);
    res.status(500).json({
      error: 'Erro ao marcar como destaque',
      message: error.message
    });
  }
};

// Marcar post como pilar
export const marcarComoPilar = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isPillar } = req.body;

    const artigo = await prisma.blogArticle.findUnique({
      where: { id }
    });

    if (!artigo) {
      return res.status(404).json({
        error: 'Artigo não encontrado'
      });
    }

    const updated = await prisma.blogArticle.update({
      where: { id },
      data: {
        isPillar: isPillar === true || isPillar === 'true'
      }
    });

    res.json({
      message: `Post ${isPillar ? 'marcado' : 'desmarcado'} como pilar`,
      artigo: updated
    });
  } catch (error: any) {
    console.error('Erro ao marcar como pilar:', error);
    res.status(500).json({
      error: 'Erro ao marcar como pilar',
      message: error.message
    });
  }
};

// Relacionar posts
export const relacionarPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { relatedPosts } = req.body;

    const artigo = await prisma.blogArticle.findUnique({
      where: { id }
    });

    if (!artigo) {
      return res.status(404).json({
        error: 'Artigo não encontrado'
      });
    }

    // Validar que os posts relacionados existem
    if (relatedPosts && Array.isArray(relatedPosts) && relatedPosts.length > 0) {
      const existingPosts = await prisma.blogArticle.findMany({
        where: {
          id: { in: relatedPosts }
        },
        select: { id: true }
      });

      if (existingPosts.length !== relatedPosts.length) {
        return res.status(400).json({
          error: 'Um ou mais posts relacionados não foram encontrados'
        });
      }
    }

    const updated = await prisma.blogArticle.update({
      where: { id },
      data: {
        relatedPosts: Array.isArray(relatedPosts) ? relatedPosts : []
      }
    });

    res.json({
      message: 'Posts relacionados atualizados',
      artigo: updated
    });
  } catch (error: any) {
    console.error('Erro ao relacionar posts:', error);
    res.status(500).json({
      error: 'Erro ao relacionar posts',
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

