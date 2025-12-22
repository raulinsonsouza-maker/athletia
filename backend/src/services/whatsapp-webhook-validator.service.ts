import crypto from 'crypto';
import { prisma } from '../lib/prisma';

/**
 * Valida assinatura HMAC SHA256 do webhook do WhatsApp
 */
export async function validateWhatsAppWebhook(
  payload: string | Buffer,
  signature: string
): Promise<boolean> {
  try {
    // Obter app_secret da configuração
    const config = await prisma.whatsAppConfig.findFirst({
      where: { isActive: true },
      select: { appSecret: true }
    });

    if (!config || !config.appSecret) {
      console.error('App secret não configurado');
      return false;
    }

    // Remove o prefixo "sha256=" se existir
    const receivedHash = signature.replace(/^sha256=/, '');
    
    // Calcula o hash esperado
    const payloadBuffer = typeof payload === 'string' 
      ? Buffer.from(payload, 'utf8') 
      : payload;
    
    const expectedHash = crypto
      .createHmac('sha256', config.appSecret)
      .update(payloadBuffer)
      .digest('hex');

    // Compara os hashes de forma segura (timing-safe)
    if (receivedHash.length !== expectedHash.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(receivedHash, 'hex'),
      Buffer.from(expectedHash, 'hex')
    );
  } catch (error) {
    console.error('Erro ao validar assinatura do webhook WhatsApp:', error);
    return false;
  }
}

/**
 * Valida token de verificação do webhook (GET request)
 */
export async function validateWebhookVerifyToken(token: string): Promise<boolean> {
  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  
  if (!expectedToken) {
    console.error('WHATSAPP_WEBHOOK_VERIFY_TOKEN não configurado');
    return false;
  }

  return token === expectedToken;
}

