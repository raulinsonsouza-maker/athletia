import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import { getPhoneNumberInfo } from '../services/whatsapp.service';
import { listTemplates, createTemplate, deleteTemplate, getTemplateStatus } from '../services/whatsapp-template.service';
import { sendTextMessage, sendTemplateMessage } from '../services/whatsapp.service';
import { processIncomingMessage } from '../services/whatsapp-chatbot.service';

/**
 * Obtém status completo da integração
 */
export const getStatus = async (req: AuthRequest, res: Response) => {
  try {
    const config = await prisma.whatsAppConfig.findFirst({
      where: { isActive: true }
    });

    if (!config) {
      return res.json({
        isActive: false,
        message: 'WhatsApp não configurado'
      });
    }

    // Estatísticas de mensagens
    const agora = new Date();
    const inicioHoje = new Date(agora.setHours(0, 0, 0, 0));
    const inicioSemana = new Date(agora);
    inicioSemana.setDate(inicioSemana.getDate() - 7);
    const inicioMes = new Date(agora);
    inicioMes.setMonth(inicioMes.getMonth() - 1);

    const [mensagensHoje, mensagensSemana, mensagensMes, conversasAtivas, optInCount, optOutCount] = await Promise.all([
      prisma.whatsAppMessageLog.count({
        where: {
          createdAt: { gte: inicioHoje },
          direction: 'outbound'
        }
      }),
      prisma.whatsAppMessageLog.count({
        where: {
          createdAt: { gte: inicioSemana },
          direction: 'outbound'
        }
      }),
      prisma.whatsAppMessageLog.count({
        where: {
          createdAt: { gte: inicioMes },
          direction: 'outbound'
        }
      }),
      prisma.whatsAppConversation.count({
        where: { status: 'open' }
      }),
      prisma.user.count({
        where: { whatsappOptIn: true }
      }),
      prisma.user.count({
        where: { whatsappOptIn: false, whatsappPhoneNumber: { not: null } }
      })
    ]);

    // Taxa de entrega e leitura
    const [delivered, read, failed] = await Promise.all([
      prisma.whatsAppMessageLog.count({
        where: { status: 'delivered', direction: 'outbound' }
      }),
      prisma.whatsAppMessageLog.count({
        where: { status: 'read', direction: 'outbound' }
      }),
      prisma.whatsAppMessageLog.count({
        where: { status: 'failed', direction: 'outbound' }
      })
    ]);

    const total = delivered + read + failed;
    const deliveryRate = total > 0 ? (delivered / total) * 100 : 0;
    const readRate = total > 0 ? (read / total) * 100 : 0;
    const failureRate = total > 0 ? (failed / total) * 100 : 0;

    res.json({
      isActive: true,
      phoneNumber: mascararNumero(config.phoneNumber),
      phoneNumberId: config.phoneNumberId,
      businessAccountId: config.businessAccountId,
      qualityRating: config.qualityRating,
      qualityScore: config.qualityScore,
      lastHealthCheck: config.lastHealthCheck,
      stats: {
        mensagensHoje,
        mensagensSemana,
        mensagensMes,
        conversasAtivas,
        usuariosOptIn: optInCount,
        usuariosOptOut: optOutCount,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        readRate: Math.round(readRate * 100) / 100,
        failureRate: Math.round(failureRate * 100) / 100
      }
    });
  } catch (error: any) {
    console.error('Erro ao obter status WhatsApp:', error);
    res.status(500).json({
      error: 'Erro ao obter status',
      message: error.message
    });
  }
};

/**
 * Obtém configuração atual
 */
export const getConfig = async (req: AuthRequest, res: Response) => {
  try {
    const config = await prisma.whatsAppConfig.findFirst({
      where: { isActive: true }
    });

    if (!config) {
      return res.json({
        configured: false
      });
    }

    res.json({
      configured: true,
      phoneNumber: mascararNumero(config.phoneNumber),
      phoneNumberId: config.phoneNumberId,
      businessAccountId: config.businessAccountId,
      apiVersion: config.apiVersion,
      isActive: config.isActive,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    });
  } catch (error: any) {
    console.error('Erro ao obter configuração:', error);
    res.status(500).json({
      error: 'Erro ao obter configuração',
      message: error.message
    });
  }
};

/**
 * Testa conexão com API
 */
export const testConnection = async (req: AuthRequest, res: Response) => {
  try {
    const info = await getPhoneNumberInfo();
    
    if (info) {
      res.json({
        success: true,
        message: 'Conexão ativa',
        qualityRating: info.qualityRating,
        qualityScore: info.qualityScore
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Não foi possível conectar à API'
      });
    }
  } catch (error: any) {
    console.error('Erro ao testar conexão:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao testar conexão'
    });
  }
};

/**
 * Lista templates
 */
export const listTemplatesAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const templates = await listTemplates();
    res.json({
      success: true,
      templates
    });
  } catch (error: any) {
    console.error('Erro ao listar templates:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao listar templates'
    });
  }
};

/**
 * Cria template
 */
export const createTemplateAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, language, components } = req.body;

    if (!name || !category || !language) {
      return res.status(400).json({
        success: false,
        error: 'Nome, categoria e idioma são obrigatórios'
      });
    }

    const result = await createTemplate({
      name,
      category,
      language,
      components: components || []
    });

    if (result.success) {
      // Log de auditoria
      await prisma.adminAuditLog.create({
        data: {
          adminUserId: req.userId!,
          action: 'whatsapp_template_created',
          resourceType: 'template',
          resourceId: result.templateId,
          details: { name, category, language },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] || null
        }
      });

      res.json({
        success: true,
        templateId: result.templateId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Erro ao criar template:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao criar template'
    });
  }
};

/**
 * Lista mensagens com filtros
 */
export const listMessages = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 50,
      direction,
      status,
      messageType,
      userId,
      templateName,
      startDate,
      endDate
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (direction) where.direction = direction;
    if (status) where.status = status;
    if (messageType) where.messageType = messageType;
    if (userId) where.userId = userId;
    if (templateName) where.templateName = templateName;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [messages, total] = await Promise.all([
      prisma.whatsAppMessageLog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          }
        }
      }),
      prisma.whatsAppMessageLog.count({ where })
    ]);

    res.json({
      success: true,
      messages: messages.map(msg => ({
        ...msg,
        toPhone: mascararNumero(msg.toPhone),
        fromPhone: mascararNumero(msg.fromPhone)
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Erro ao listar mensagens:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao listar mensagens'
    });
  }
};

/**
 * Lista conversas
 */
export const listConversations = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      optIn,
      hasUser
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) where.status = status;
    if (optIn !== undefined) where.optIn = optIn === 'true';
    if (hasUser === 'true') where.userId = { not: null };

    const [conversations, total] = await Promise.all([
      prisma.whatsAppConversation.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { lastMessageAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          }
        }
      }),
      prisma.whatsAppConversation.count({ where })
    ]);

    res.json({
      success: true,
      conversations: conversations.map(conv => ({
        ...conv,
        phoneNumber: mascararNumero(conv.phoneNumber)
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Erro ao listar conversas:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao listar conversas'
    });
  }
};

/**
 * Obtém detalhes de uma conversa
 */
export const getConversationDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.whatsAppConversation.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            whatsappOptIn: true
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 100
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversa não encontrada'
      });
    }

    res.json({
      success: true,
      conversation: {
        ...conversation,
        phoneNumber: mascararNumero(conversation.phoneNumber),
        messages: conversation.messages.map(msg => ({
          ...msg,
          toPhone: mascararNumero(msg.toPhone),
          fromPhone: mascararNumero(msg.fromPhone)
        }))
      }
    });
  } catch (error: any) {
    console.error('Erro ao obter detalhes da conversa:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao obter detalhes'
    });
  }
};

/**
 * Envia mensagem manual (admin)
 */
export const sendManualMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, message } = req.body;

    if (!conversationId || !message) {
      return res.status(400).json({
        success: false,
        error: 'ID da conversa e mensagem são obrigatórios'
      });
    }

    const conversation = await prisma.whatsAppConversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversa não encontrada'
      });
    }

    const result = await sendTextMessage(
      conversation.phoneNumber,
      message,
      conversation.userId || undefined
    );

    if (result.success) {
      // Log de auditoria
      await prisma.adminAuditLog.create({
        data: {
          adminUserId: req.userId!,
          action: 'whatsapp_message_sent_manual',
          resourceType: 'message',
          resourceId: result.messageId,
          details: { conversationId, messageLength: message.length },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] || null
        }
      });

      res.json({
        success: true,
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Erro ao enviar mensagem manual:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao enviar mensagem'
    });
  }
};

/**
 * Obtém estatísticas de cadência
 */
export const getCadenceStats = async (req: AuthRequest, res: Response) => {
  try {
    const agora = new Date();
    const inicioHoje = new Date(agora.setHours(0, 0, 0, 0));

    const [totalTrial, d1Hoje, d2Hoje, d3Hoje, expiredHoje, d1Total, d2Total, d3Total, expiredTotal] = await Promise.all([
      prisma.user.count({
        where: {
          planoAtivo: false,
          dataFimTrial: { gte: agora },
          whatsappOptIn: true
        }
      }),
      prisma.whatsAppCadence.count({
        where: {
          d1SentAt: { gte: inicioHoje }
        }
      }),
      prisma.whatsAppCadence.count({
        where: {
          d2SentAt: { gte: inicioHoje }
        }
      }),
      prisma.whatsAppCadence.count({
        where: {
          d3SentAt: { gte: inicioHoje }
        }
      }),
      prisma.whatsAppCadence.count({
        where: {
          expiredSentAt: { gte: inicioHoje }
        }
      }),
      prisma.whatsAppCadence.count({
        where: { d1Sent: true }
      }),
      prisma.whatsAppCadence.count({
        where: { d2Sent: true }
      }),
      prisma.whatsAppCadence.count({
        where: { d3Sent: true }
      }),
      prisma.whatsAppCadence.count({
        where: { expiredSent: true }
      })
    ]);

    res.json({
      success: true,
      stats: {
        totalUsuariosTrial: totalTrial,
        hoje: {
          d1: d1Hoje,
          d2: d2Hoje,
          d3: d3Hoje,
          expired: expiredHoje
        },
        total: {
          d1: d1Total,
          d2: d2Total,
          d3: d3Total,
          expired: expiredTotal
        }
      }
    });
  } catch (error: any) {
    console.error('Erro ao obter estatísticas de cadência:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao obter estatísticas'
    });
  }
};

/**
 * Lista usuários em cadência
 */
export const listCadenceUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, stage } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (stage) where.trialStage = stage;

    const [cadences, total] = await Promise.all([
      prisma.whatsAppCadence.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { lastUpdated: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              nome: true,
              email: true,
              whatsappOptIn: true,
              whatsappPhoneNumber: true,
              dataInicioTrial: true,
              dataFimTrial: true
            }
          }
        }
      }),
      prisma.whatsAppCadence.count({ where })
    ]);

    res.json({
      success: true,
      cadences: cadences.map(c => ({
        ...c,
        user: c.user ? {
          ...c.user,
          whatsappPhoneNumber: c.user.whatsappPhoneNumber ? mascararNumero(c.user.whatsappPhoneNumber) : null
        } : null
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Erro ao listar usuários em cadência:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao listar usuários'
    });
  }
};

/**
 * Lista usuários com WhatsApp
 */
export const listUsers = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 50,
      optIn,
      search
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      whatsappPhoneNumber: { not: null }
    };

    if (optIn !== undefined) {
      where.whatsappOptIn = optIn === 'true';
    }

    if (search) {
      where.OR = [
        { nome: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nome: true,
          email: true,
          whatsappOptIn: true,
          whatsappOptInDate: true,
          whatsappPhoneNumber: true,
          createdAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      users: users.map(u => ({
        ...u,
        whatsappPhoneNumber: u.whatsappPhoneNumber ? mascararNumero(u.whatsappPhoneNumber) : null
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao listar usuários'
    });
  }
};

/**
 * Gerencia opt-in de usuário
 */
export const manageOptIn = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { action, justification } = req.body; // action: 'enable' | 'disable'

    if (!action || !justification) {
      return res.status(400).json({
        success: false,
        error: 'Ação e justificativa são obrigatórias'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const optIn = action === 'enable';

    await prisma.user.update({
      where: { id: userId },
      data: {
        whatsappOptIn: optIn,
        whatsappOptInDate: optIn ? new Date() : null
      }
    });

    // Atualizar conversa se existir
    if (user.whatsappPhoneNumber) {
      await prisma.whatsAppConversation.updateMany({
        where: { phoneNumber: user.whatsappPhoneNumber },
        data: {
          optIn,
          optInDate: optIn ? new Date() : null,
          optOutDate: optIn ? null : new Date()
        }
      });
    }

    // Log de auditoria
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: req.userId!,
        action: optIn ? 'whatsapp_opt_in_enabled' : 'whatsapp_opt_in_disabled',
        resourceType: 'user',
        resourceId: userId,
        details: { justification, previousState: user.whatsappOptIn },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null
      }
    });

    res.json({
      success: true,
      message: optIn ? 'Opt-in ativado' : 'Opt-in desativado'
    });
  } catch (error: any) {
    console.error('Erro ao gerenciar opt-in:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao gerenciar opt-in'
    });
  }
};

/**
 * Mascara número de telefone para segurança
 */
function mascararNumero(numero: string): string {
  if (!numero) return '';
  // Formato: +55 11 9****-****
  const cleaned = numero.replace(/\D/g, '');
  if (cleaned.length >= 11) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 5)}****-${cleaned.slice(-4)}`;
  }
  return numero;
}

