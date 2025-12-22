import axios, { AxiosError } from 'axios';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';

// Configurações da API WhatsApp
const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const WHATSAPP_BASE_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  businessAccountId: string;
}

/**
 * Obtém configuração ativa do WhatsApp
 */
async function getActiveConfig(): Promise<WhatsAppConfig | null> {
  const config = await prisma.whatsAppConfig.findFirst({
    where: { isActive: true }
  });

  if (!config) {
    return null;
  }

  return {
    phoneNumberId: config.phoneNumberId,
    accessToken: config.accessToken,
    businessAccountId: config.businessAccountId
  };
}

/**
 * Envia mensagem de texto livre (dentro da janela de 24h)
 */
export async function sendTextMessage(
  to: string,
  message: string,
  userId?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const config = await getActiveConfig();
    if (!config) {
      return {
        success: false,
        error: 'WhatsApp não configurado ou inativo'
      };
    }

    // Normalizar número para E.164
    const normalizedPhone = normalizePhoneNumber(to);

    const response = await axios.post(
      `${WHATSAPP_BASE_URL}/${config.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalizedPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const messageId = response.data.messages[0].id;

    // Registrar no log
    await prisma.whatsAppMessageLog.create({
      data: {
        direction: 'outbound',
        messageId,
        messageType: 'text',
        messageBody: message,
        toPhone: normalizedPhone,
        fromPhone: config.phoneNumberId,
        status: 'sent',
        userId: userId || null
      }
    });

    return {
      success: true,
      messageId
    };
  } catch (error: any) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);
    
    const errorMessage = error.response?.data?.error?.message || error.message;
    const errorCode = error.response?.data?.error?.code;

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Envia mensagem usando template aprovado
 */
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string,
  components: any[],
  userId?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const config = await getActiveConfig();
    if (!config) {
      return {
        success: false,
        error: 'WhatsApp não configurado ou inativo'
      };
    }

    // Normalizar número para E.164
    const normalizedPhone = normalizePhoneNumber(to);

    const response = await axios.post(
      `${WHATSAPP_BASE_URL}/${config.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalizedPhone,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          },
          components: components || []
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const messageId = response.data.messages[0].id;

    // Registrar no log
    await prisma.whatsAppMessageLog.create({
      data: {
        direction: 'outbound',
        messageId,
        messageType: 'template',
        templateName,
        messageBody: JSON.stringify({ templateName, components }),
        toPhone: normalizedPhone,
        fromPhone: config.phoneNumberId,
        status: 'sent',
        userId: userId || null
      }
    });

    return {
      success: true,
      messageId
    };
  } catch (error: any) {
    console.error('Erro ao enviar template WhatsApp:', error);
    
    const errorMessage = error.response?.data?.error?.message || error.message;
    const errorCode = error.response?.data?.error?.code;

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Normaliza número de telefone para formato E.164
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove todos os caracteres não numéricos
  let cleaned = phone.replace(/\D/g, '');

  // Se não começa com código do país, adiciona +55 (Brasil)
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned;
  }

  // Adiciona o + no início
  return '+' + cleaned;
}

/**
 * Valida assinatura HMAC SHA256 do webhook
 */
export function validateWebhookSignature(
  payload: string | Buffer,
  signature: string,
  appSecret: string
): boolean {
  try {
    // Remove o prefixo "sha256=" se existir
    const receivedHash = signature.replace('sha256=', '');
    
    // Calcula o hash esperado
    const expectedHash = crypto
      .createHmac('sha256', appSecret)
      .update(payload)
      .digest('hex');

    // Compara os hashes de forma segura (timing-safe)
    return crypto.timingSafeEqual(
      Buffer.from(receivedHash, 'hex'),
      Buffer.from(expectedHash, 'hex')
    );
  } catch (error) {
    console.error('Erro ao validar assinatura do webhook:', error);
    return false;
  }
}

/**
 * Verifica se a mensagem está dentro da janela de 24 horas
 */
export async function isWithin24HourWindow(phoneNumber: string): Promise<boolean> {
  const conversation = await prisma.whatsAppConversation.findFirst({
    where: { phoneNumber },
    orderBy: { lastMessageAt: 'desc' }
  });

  if (!conversation) {
    return false;
  }

  const now = new Date();
  const lastMessage = new Date(conversation.lastMessageAt);
  const diffMs = now.getTime() - lastMessage.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours < 24;
}

/**
 * Atualiza status de mensagem
 */
export async function updateMessageStatus(
  messageId: string,
  status: 'sent' | 'delivered' | 'read' | 'failed',
  errorCode?: number,
  errorMessage?: string
): Promise<void> {
  await prisma.whatsAppMessageLog.updateMany({
    where: { messageId },
    data: {
      status,
      errorCode: errorCode || null,
      errorMessage: errorMessage || null,
      updatedAt: new Date()
    }
  });
}

/**
 * Obtém informações do número (quality rating, etc)
 */
export async function getPhoneNumberInfo(): Promise<{
  qualityRating?: string;
  qualityScore?: number;
} | null> {
  try {
    const config = await getActiveConfig();
    if (!config) {
      return null;
    }

    const response = await axios.get(
      `${WHATSAPP_BASE_URL}/${config.phoneNumberId}`,
      {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`
        },
        params: {
          fields: 'quality_rating,account_type'
        }
      }
    );

    const qualityRating = response.data.quality_rating?.rating;
    const qualityScore = response.data.quality_rating?.score;

    // Atualizar no banco
    if (qualityRating) {
      await prisma.whatsAppConfig.updateMany({
        where: { phoneNumberId: config.phoneNumberId },
        data: {
          qualityRating,
          qualityScore: qualityScore || null,
          lastHealthCheck: new Date()
        }
      });
    }

    return {
      qualityRating,
      qualityScore
    };
  } catch (error: any) {
    console.error('Erro ao obter informações do número:', error);
    return null;
  }
}

