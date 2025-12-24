import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import { websocketManager } from '../lib/websocket';

/**
 * Listar todas as sessões (admin)
 */
export const getSessions = async (req: AuthRequest, res: Response) => {
  try {
    const { status, userId, startDate, endDate, page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    const [sessions, total] = await Promise.all([
      prisma.chatSession.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { lastMessageAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              nome: true
            }
          },
          assignedAdmin: {
            select: {
              id: true,
              email: true,
              nome: true
            }
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              content: true,
              direction: true,
              createdAt: true
            }
          },
          _count: {
            select: { messages: true }
          }
        }
      }),
      prisma.chatSession.count({ where })
    ]);

    res.json({
      sessions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Erro ao listar sessões:', error);
    res.status(500).json({ error: 'Erro ao listar sessões' });
  }
};

/**
 * Obter detalhes de uma sessão (admin)
 */
export const getSession = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const session = await prisma.chatSession.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nome: true,
            telefone: true,
            plano: true,
            planoAtivo: true
          }
        },
        assignedAdmin: {
          select: {
            id: true,
            email: true,
            nome: true
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    res.json(session);
  } catch (error: any) {
    console.error('Erro ao obter sessão:', error);
    res.status(500).json({ error: 'Erro ao obter sessão' });
  }
};

/**
 * Admin responde mensagem
 */
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.userId!;
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Conteúdo da mensagem é obrigatório' });
    }

    // Verificar se sessão existe
    const session = await prisma.chatSession.findUnique({
      where: { id },
      select: { userId: true, status: true, assignedToAdminId: true }
    });

    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    // Se sessão não está atribuída, atribuir ao admin
    if (!session.assignedToAdminId) {
      await prisma.chatSession.update({
        where: { id },
        data: { assignedToAdminId: adminId }
      });
    }

    // Se status é bot, mudar para human
    if (session.status === 'bot') {
      await prisma.chatSession.update({
        where: { id },
        data: { status: 'human' }
      });
    }

    // Criar mensagem do admin
    const adminMessage = await prisma.chatMessage.create({
      data: {
        sessionId: id,
        direction: 'admin',
        content: content.trim()
      }
    });

    // Atualizar última mensagem e contador de não lidas
    await prisma.chatSession.update({
      where: { id },
      data: {
        lastMessageAt: new Date(),
        unreadCount: { increment: 1 }
      }
    });

    // Buscar sessão atualizada para enviar
    const updatedSession = await prisma.chatSession.findUnique({ where: { id } });

    // Notificar usuário via WebSocket (tanto por userId quanto por sessão)
    websocketManager.sendToUser(session.userId, 'chat:message', {
      message: { ...adminMessage, sessionId: id },
      session: updatedSession
    });
    
    // Também enviar para a sessão (caso o usuário esteja conectado à sessão)
    websocketManager.sendToSession(id, 'chat:message', {
      message: { ...adminMessage, sessionId: id },
      session: updatedSession
    });

    // Notificar outros admins
    websocketManager.sendToAdmins('chat:new_message', {
      sessionId: id,
      adminId,
      message: adminMessage
    });
    
    // Também notificar admins conectados à sessão
    websocketManager.sendToSession(id, 'chat:message', {
      message: { ...adminMessage, sessionId: id },
      session: updatedSession
    });

    res.json({ message: adminMessage });
  } catch (error: any) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
};

/**
 * Atribuir sessão a admin
 */
export const assignSession = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.userId!;
    const { id } = req.params;

    const session = await prisma.chatSession.findUnique({
      where: { id },
      select: { userId: true, status: true }
    });

    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    // Atribuir sessão
    const updatedSession = await prisma.chatSession.update({
      where: { id },
      data: {
        assignedToAdminId: adminId,
        status: session.status === 'bot' ? 'human' : session.status
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nome: true
          }
        },
        assignedAdmin: {
          select: {
            id: true,
            email: true,
            nome: true
          }
        }
      }
    });

    // Notificar usuário
    websocketManager.sendToUser(session.userId, 'chat:session_assigned', {
      sessionId: id,
      message: 'Um atendente está cuidando do seu atendimento agora.'
    });

    // Notificar outros admins
    websocketManager.sendToAdmins('chat:session_assigned', {
      sessionId: id,
      adminId
    });

    res.json(updatedSession);
  } catch (error: any) {
    console.error('Erro ao atribuir sessão:', error);
    res.status(500).json({ error: 'Erro ao atribuir sessão' });
  }
};

/**
 * Alterar status da sessão
 */
export const updateStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['bot', 'human', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const session = await prisma.chatSession.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    const updatedSession = await prisma.chatSession.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nome: true
          }
        }
      }
    });

    // Notificar usuário
    if (status === 'closed') {
      websocketManager.sendToUser(session.userId, 'chat:session_closed', {
        sessionId: id
      });
    }

    // Notificar admins
    websocketManager.sendToAdmins('chat:session_updated', {
      sessionId: id,
      status
    });

    res.json(updatedSession);
  } catch (error: any) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
};

/**
 * Obter estatísticas de chat (admin)
 */
export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const [total, bot, human, closed, unassigned, today] = await Promise.all([
      prisma.chatSession.count(),
      prisma.chatSession.count({ where: { status: 'bot' } }),
      prisma.chatSession.count({ where: { status: 'human' } }),
      prisma.chatSession.count({ where: { status: 'closed' } }),
      prisma.chatSession.count({
        where: {
          status: 'human',
          assignedToAdminId: null
        }
      }),
      prisma.chatSession.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    res.json({
      total,
      byStatus: {
        bot,
        human,
        closed
      },
      unassigned,
      today
    });
  } catch (error: any) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
};

