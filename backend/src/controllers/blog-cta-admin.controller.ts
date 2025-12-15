import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listar todos os CTAs
export const listarCTAs = async (req: AuthRequest, res: Response) => {
  try {
    const ctas = await prisma.blogCTA.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    res.json(ctas);
  } catch (error: any) {
    console.error('Erro ao listar CTAs:', error);
    res.status(500).json({
      error: 'Erro ao listar CTAs',
      message: error.message
    });
  }
};

// Obter um CTA específico
export const obterCTA = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const cta = await prisma.blogCTA.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    if (!cta) {
      return res.status(404).json({
        error: 'CTA não encontrado'
      });
    }

    res.json(cta);
  } catch (error: any) {
    console.error('Erro ao obter CTA:', error);
    res.status(500).json({
      error: 'Erro ao obter CTA',
      message: error.message
    });
  }
};

// Criar novo CTA
export const criarCTA = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      type,
      title,
      description,
      buttonText,
      link,
      style
    } = req.body;

    // Validações
    if (!name || !name.trim()) {
      return res.status(400).json({
        error: 'Nome é obrigatório'
      });
    }

    if (!type || !['cadastro', 'criar_treino', 'conhecer_plataforma'].includes(type)) {
      return res.status(400).json({
        error: 'Tipo inválido. Deve ser: cadastro, criar_treino ou conhecer_plataforma'
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: 'Título é obrigatório'
      });
    }

    if (!buttonText || !buttonText.trim()) {
      return res.status(400).json({
        error: 'Texto do botão é obrigatório'
      });
    }

    if (!link || !link.trim()) {
      return res.status(400).json({
        error: 'Link é obrigatório'
      });
    }

    const cta = await prisma.blogCTA.create({
      data: {
        name: name.trim(),
        type,
        title: title.trim(),
        description: description?.trim() || '',
        buttonText: buttonText.trim(),
        link: link.trim(),
        style: style?.trim() || null
      }
    });

    res.status(201).json({
      message: 'CTA criado com sucesso',
      cta
    });
  } catch (error: any) {
    console.error('Erro ao criar CTA:', error);
    res.status(500).json({
      error: 'Erro ao criar CTA',
      message: error.message
    });
  }
};

// Atualizar CTA
export const atualizarCTA = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      title,
      description,
      buttonText,
      link,
      style
    } = req.body;

    // Verificar se CTA existe
    const existingCTA = await prisma.blogCTA.findUnique({
      where: { id }
    });

    if (!existingCTA) {
      return res.status(404).json({
        error: 'CTA não encontrado'
      });
    }

    // Validação de tipo se fornecido
    if (type && !['cadastro', 'criar_treino', 'conhecer_plataforma'].includes(type)) {
      return res.status(400).json({
        error: 'Tipo inválido. Deve ser: cadastro, criar_treino ou conhecer_plataforma'
      });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (type !== undefined) updateData.type = type;
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || '';
    if (buttonText !== undefined) updateData.buttonText = buttonText.trim();
    if (link !== undefined) updateData.link = link.trim();
    if (style !== undefined) updateData.style = style?.trim() || null;

    const cta = await prisma.blogCTA.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'CTA atualizado com sucesso',
      cta
    });
  } catch (error: any) {
    console.error('Erro ao atualizar CTA:', error);
    res.status(500).json({
      error: 'Erro ao atualizar CTA',
      message: error.message
    });
  }
};

// Deletar CTA
export const deletarCTA = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const cta = await prisma.blogCTA.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    if (!cta) {
      return res.status(404).json({
        error: 'CTA não encontrado'
      });
    }

    // Verificar se há artigos associados
    if (cta._count.articles > 0) {
      return res.status(400).json({
        error: `Não é possível deletar CTA com ${cta._count.articles} artigo(s) associado(s). Primeiro remova o CTA dos artigos.`
      });
    }

    await prisma.blogCTA.delete({
      where: { id }
    });

    res.json({
      message: 'CTA deletado com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao deletar CTA:', error);
    res.status(500).json({
      error: 'Erro ao deletar CTA',
      message: error.message
    });
  }
};
