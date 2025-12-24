import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import { processChatbotMessage, getWelcomeMessage, CHATBOT_OPTIONS } from '../services/chatbot.service';
import { websocketManager } from '../lib/websocket';

/**
 * Listar sessões do usuário
 */
export const getSessions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { lastMessageAt: 'desc' },
      include: {
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
    });

    res.json(sessions);
  } catch (error: any) {
    console.error('Erro ao listar sessões:', error);
    res.status(500).json({ error: 'Erro ao listar sessões' });
  }
};

/**
 * Obter mensagens de uma sessão
 */
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Verificar se sessão pertence ao usuário
    const session = await prisma.chatSession.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    if (session.userId !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: id },
      orderBy: { createdAt: 'asc' }
    });

    // Marcar mensagens como lidas
    await prisma.chatMessage.updateMany({
      where: {
        sessionId: id,
        direction: { in: ['bot', 'admin'] },
        read: false
      },
      data: { read: true }
    });

    // Atualizar contador de não lidas
    await prisma.chatSession.update({
      where: { id },
      data: { unreadCount: 0 }
    });

    res.json(messages);
  } catch (error: any) {
    console.error('Erro ao obter mensagens:', error);
    res.status(500).json({ error: 'Erro ao obter mensagens' });
  }
};

/**
 * Criar nova sessão
 */
export const createSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Verificar se há sessão aberta
    const existingSession = await prisma.chatSession.findFirst({
      where: {
        userId,
        status: { in: ['bot', 'human'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (existingSession) {
      // Retornar sessão existente
      const messages = await prisma.chatMessage.findMany({
        where: { sessionId: existingSession.id },
        orderBy: { createdAt: 'asc' }
      });

      return res.json({
        session: existingSession,
        messages
      });
    }

    // Criar nova sessão
    const session = await prisma.chatSession.create({
      data: {
        userId,
        status: 'bot'
      }
    });

    // Enviar mensagem de boas-vindas
    const welcomeMessage = getWelcomeMessage();
    const botMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        direction: 'bot',
        content: welcomeMessage.message,
        metadata: welcomeMessage.options ? JSON.parse(JSON.stringify({ options: welcomeMessage.options })) : undefined
      }
    });

    // Atualizar última mensagem
    await prisma.chatSession.update({
      where: { id: session.id },
      data: { lastMessageAt: new Date() }
    });

    // Notificar via WebSocket
    websocketManager.sendToSession(session.id, 'chat:message', {
      message: { ...botMessage, sessionId: session.id },
      session: session
    });

    res.json({
      session,
      messages: [botMessage]
    });
  } catch (error: any) {
    console.error('Erro ao criar sessão:', error);
    res.status(500).json({ error: 'Erro ao criar sessão' });
  }
};

/**
 * Enviar mensagem
 */
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Conteúdo da mensagem é obrigatório' });
    }

    // Verificar se sessão pertence ao usuário
    const session = await prisma.chatSession.findUnique({
      where: { id },
      select: { userId: true, status: true }
    });

    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    if (session.userId !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Criar mensagem do usuário
    const userMessage = await prisma.chatMessage.create({
      data: {
        sessionId: id,
        direction: 'user',
        content: content.trim()
      }
    });

    // Atualizar última mensagem
    await prisma.chatSession.update({
      where: { id },
      data: { lastMessageAt: new Date() }
    });

    // Buscar sessão atualizada
    const updatedSession = await prisma.chatSession.findUnique({ where: { id } });
    
    // Notificar via WebSocket
    websocketManager.sendToSession(id, 'chat:message', {
      message: { ...userMessage, sessionId: id },
      session: updatedSession
    });

    // Se status é bot, processar com chatbot
    if (session.status === 'bot') {
      const chatbotResponse = await processChatbotMessage(userId, content, id);

      // Criar mensagem do bot
      const botMessage = await prisma.chatMessage.create({
        data: {
          sessionId: id,
          direction: 'bot',
          content: chatbotResponse.message,
          metadata: chatbotResponse.metadata 
            ? JSON.parse(JSON.stringify(chatbotResponse.metadata))
            : (chatbotResponse.options ? JSON.parse(JSON.stringify({ options: chatbotResponse.options })) : undefined)
        }
      });

      // Se precisa escalar para humano, atualizar status
      if (chatbotResponse.escalateToHuman) {
        await prisma.chatSession.update({
          where: { id },
          data: { status: 'human' }
        });

        // Notificar admins
        websocketManager.sendToAdmins('chat:new_session', {
          sessionId: id,
          userId,
          message: 'Nova sessão aguardando atendimento'
        });
      }

      // Atualizar última mensagem
      await prisma.chatSession.update({
        where: { id },
        data: { lastMessageAt: new Date() }
      });

      // Buscar sessão atualizada
      const updatedSessionForBot = await prisma.chatSession.findUnique({ where: { id } });
      
      // Notificar via WebSocket
      websocketManager.sendToSession(id, 'chat:message', {
        message: { ...botMessage, sessionId: id },
        session: updatedSessionForBot
      });

      return res.json({
        userMessage,
        botMessage
      });
    }

    // Se status é human, notificar admins e também enviar para a sessão
    if (session.status === 'human') {
      // Notificar admins sobre nova mensagem
      websocketManager.sendToAdmins('chat:new_message', {
        sessionId: id,
        userId,
        message: userMessage
      });
      
      // Buscar sessão atualizada
      const updatedSessionForHuman = await prisma.chatSession.findUnique({ where: { id } });
      
      // Também notificar via sessão para que admins conectados à sessão recebam
      websocketManager.sendToSession(id, 'chat:message', {
        message: { ...userMessage, sessionId: id },
        session: updatedSessionForHuman
      });
    }

    res.json({ message: userMessage });
  } catch (error: any) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
};

/**
 * Fechar sessão
 */
export const closeSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Verificar se sessão pertence ao usuário
    const session = await prisma.chatSession.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    if (session.userId !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Fechar sessão
    await prisma.chatSession.update({
      where: { id },
      data: { status: 'closed' }
    });

    // Notificar via WebSocket
    websocketManager.sendToSession(id, 'chat:session_closed', { sessionId: id });

    res.json({ message: 'Sessão fechada com sucesso' });
  } catch (error: any) {
    console.error('Erro ao fechar sessão:', error);
    res.status(500).json({ error: 'Erro ao fechar sessão' });
  }
};

