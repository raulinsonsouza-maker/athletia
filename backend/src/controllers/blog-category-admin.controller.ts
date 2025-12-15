import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';
import { clearBlogCache } from '../middleware/blog-cache.middleware';

const prisma = new PrismaClient();

// Listar todas as categorias
export const listarCategorias = async (req: AuthRequest, res: Response) => {
  try {
    const categorias = await prisma.blogCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    res.json(categorias);
  } catch (error: any) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({
      error: 'Erro ao listar categorias',
      message: error.message
    });
  }
};

// Obter uma categoria específica
export const obterCategoria = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const categoria = await prisma.blogCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    if (!categoria) {
      return res.status(404).json({
        error: 'Categoria não encontrada'
      });
    }

    res.json(categoria);
  } catch (error: any) {
    console.error('Erro ao obter categoria:', error);
    res.status(500).json({
      error: 'Erro ao obter categoria',
      message: error.message
    });
  }
};

// Criar nova categoria
export const criarCategoria = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      slug,
      description,
      introText,
      icon,
      metaTitle,
      metaDescription
    } = req.body;

    // Validações
    if (!name || !name.trim()) {
      return res.status(400).json({
        error: 'Nome é obrigatório'
      });
    }

    // Gerar slug se não fornecido
    let finalSlug = slug;
    if (!finalSlug || !finalSlug.trim()) {
      finalSlug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    } else {
      finalSlug = finalSlug.trim();
    }

    // Verificar se slug já existe
    const existingCategory = await prisma.blogCategory.findUnique({
      where: { slug: finalSlug }
    });

    if (existingCategory) {
      return res.status(400).json({
        error: 'Já existe uma categoria com este slug'
      });
    }

    const categoria = await prisma.blogCategory.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        description: description?.trim() || null,
        introText: introText?.trim() || null,
        icon: icon?.trim() || null,
        metaTitle: metaTitle?.trim() || null,
        metaDescription: metaDescription?.trim() || null
      }
    });

    clearBlogCache();

    res.status(201).json({
      message: 'Categoria criada com sucesso',
      categoria
    });
  } catch (error: any) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({
      error: 'Erro ao criar categoria',
      message: error.message
    });
  }
};

// Atualizar categoria
export const atualizarCategoria = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      introText,
      icon,
      metaTitle,
      metaDescription
    } = req.body;

    // Verificar se categoria existe
    const existingCategory = await prisma.blogCategory.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({
        error: 'Categoria não encontrada'
      });
    }

    // Verificar se novo slug já existe (se foi alterado)
    let finalSlug = slug;
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await prisma.blogCategory.findUnique({
        where: { slug }
      });

      if (slugExists) {
        return res.status(400).json({
          error: 'Já existe uma categoria com este slug'
        });
      }
      finalSlug = slug.trim();
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (slug !== undefined && slug !== existingCategory.slug) updateData.slug = finalSlug;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (introText !== undefined) updateData.introText = introText?.trim() || null;
    if (icon !== undefined) updateData.icon = icon?.trim() || null;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle?.trim() || null;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription?.trim() || null;

    const categoria = await prisma.blogCategory.update({
      where: { id },
      data: updateData
    });

    clearBlogCache();

    res.json({
      message: 'Categoria atualizada com sucesso',
      categoria
    });
  } catch (error: any) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({
      error: 'Erro ao atualizar categoria',
      message: error.message
    });
  }
};

// Deletar categoria
export const deletarCategoria = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const categoria = await prisma.blogCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    if (!categoria) {
      return res.status(404).json({
        error: 'Categoria não encontrada'
      });
    }

    // Verificar se há artigos associados
    if (categoria._count.articles > 0) {
      return res.status(400).json({
        error: `Não é possível deletar categoria com ${categoria._count.articles} artigo(s) associado(s). Primeiro remova ou mova os artigos para outra categoria.`
      });
    }

    await prisma.blogCategory.delete({
      where: { id }
    });

    clearBlogCache();

    res.json({
      message: 'Categoria deletada com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({
      error: 'Erro ao deletar categoria',
      message: error.message
    });
  }
};
