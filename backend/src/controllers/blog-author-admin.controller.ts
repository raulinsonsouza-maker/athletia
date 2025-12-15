import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Listar todos os autores
export const listarAutores = async (req: AuthRequest, res: Response) => {
  try {
    const autores = await prisma.blogAuthor.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    res.json(autores);
  } catch (error: any) {
    console.error('Erro ao listar autores:', error);
    res.status(500).json({
      error: 'Erro ao listar autores',
      message: error.message
    });
  }
};

// Obter um autor específico
export const obterAutor = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const autor = await prisma.blogAuthor.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    if (!autor) {
      return res.status(404).json({
        error: 'Autor não encontrado'
      });
    }

    res.json(autor);
  } catch (error: any) {
    console.error('Erro ao obter autor:', error);
    res.status(500).json({
      error: 'Erro ao obter autor',
      message: error.message
    });
  }
};

// Criar novo autor
export const criarAutor = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      role,
      bio,
      avatar,
      externalLink
    } = req.body;

    // Validações
    if (!name || !name.trim()) {
      return res.status(400).json({
        error: 'Nome é obrigatório'
      });
    }

    // Se houver arquivo de avatar, usar URL do arquivo salvo
    let avatarUrl = avatar;
    if (req.file) {
      avatarUrl = `/api/uploads/blog/authors/${req.file.filename}`;
    }

    const autor = await prisma.blogAuthor.create({
      data: {
        name: name.trim(),
        role: role?.trim() || null,
        bio: bio?.trim() || null,
        avatar: avatarUrl || null,
        externalLink: externalLink?.trim() || null
      }
    });

    res.status(201).json({
      message: 'Autor criado com sucesso',
      autor
    });
  } catch (error: any) {
    console.error('Erro ao criar autor:', error);
    res.status(500).json({
      error: 'Erro ao criar autor',
      message: error.message
    });
  }
};

// Atualizar autor
export const atualizarAutor = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      role,
      bio,
      avatar,
      externalLink
    } = req.body;

    // Verificar se autor existe
    const existingAuthor = await prisma.blogAuthor.findUnique({
      where: { id }
    });

    if (!existingAuthor) {
      return res.status(404).json({
        error: 'Autor não encontrado'
      });
    }

    // Se houver arquivo de avatar, usar URL do arquivo salvo
    let avatarUrl = avatar;
    if (req.file) {
      // Deletar avatar antigo se existir
      if (existingAuthor.avatar) {
        const oldAvatarPath = path.join(process.cwd(), 'uploads', 'blog', 'authors', path.basename(existingAuthor.avatar));
        if (fs.existsSync(oldAvatarPath)) {
          try {
            fs.unlinkSync(oldAvatarPath);
          } catch (error) {
            console.error('Erro ao deletar avatar antigo:', error);
          }
        }
      }
      avatarUrl = `/api/uploads/blog/authors/${req.file.filename}`;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (role !== undefined) updateData.role = role?.trim() || null;
    if (bio !== undefined) updateData.bio = bio?.trim() || null;
    if (avatarUrl !== undefined) updateData.avatar = avatarUrl;
    if (externalLink !== undefined) updateData.externalLink = externalLink?.trim() || null;

    const autor = await prisma.blogAuthor.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Autor atualizado com sucesso',
      autor
    });
  } catch (error: any) {
    console.error('Erro ao atualizar autor:', error);
    res.status(500).json({
      error: 'Erro ao atualizar autor',
      message: error.message
    });
  }
};

// Deletar autor
export const deletarAutor = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const autor = await prisma.blogAuthor.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    if (!autor) {
      return res.status(404).json({
        error: 'Autor não encontrado'
      });
    }

    // Verificar se há artigos associados
    if (autor._count.articles > 0) {
      return res.status(400).json({
        error: `Não é possível deletar autor com ${autor._count.articles} artigo(s) associado(s). Primeiro remova ou altere o autor dos artigos.`
      });
    }

    // Deletar avatar se existir
    if (autor.avatar) {
      const avatarPath = path.join(process.cwd(), 'uploads', 'blog', 'authors', path.basename(autor.avatar));
      if (fs.existsSync(avatarPath)) {
        try {
          fs.unlinkSync(avatarPath);
        } catch (error) {
          console.error('Erro ao deletar avatar:', error);
        }
      }
    }

    await prisma.blogAuthor.delete({
      where: { id }
    });

    res.json({
      message: 'Autor deletado com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao deletar autor:', error);
    res.status(500).json({
      error: 'Erro ao deletar autor',
      message: error.message
    });
  }
};
