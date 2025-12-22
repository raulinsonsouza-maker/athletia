import axios from 'axios';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';

const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const WHATSAPP_BASE_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

/**
 * Gera URL de autorização OAuth para Embedded Signup
 */
export function generateOAuthUrl(state?: string): string {
  const appId = process.env.WHATSAPP_APP_ID;
  const redirectUri = process.env.WHATSAPP_REDIRECT_URI;

  if (!appId || !redirectUri) {
    throw new Error('WHATSAPP_APP_ID e WHATSAPP_REDIRECT_URI devem estar configurados');
  }

  // Gerar state CSRF se não fornecido
  const csrfState = state || crypto.randomBytes(32).toString('hex');

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: 'whatsapp_business_management,whatsapp_business_messaging',
    response_type: 'code',
    state: csrfState
  });

  return `https://www.facebook.com/v${WHATSAPP_API_VERSION}/dialog/oauth?${params.toString()}`;
}

/**
 * Troca código de autorização por access token
 */
export async function exchangeCodeForToken(
  code: string
): Promise<{
  accessToken: string;
  tokenType: string;
  expiresIn: number;
} | null> {
  try {
    const appId = process.env.WHATSAPP_APP_ID;
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    const redirectUri = process.env.WHATSAPP_REDIRECT_URI;

    if (!appId || !appSecret || !redirectUri) {
      throw new Error('Credenciais OAuth não configuradas');
    }

    const response = await axios.get(
      `${WHATSAPP_BASE_URL}/oauth/access_token`,
      {
        params: {
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: redirectUri,
          code
        }
      }
    );

    return {
      accessToken: response.data.access_token,
      tokenType: response.data.token_type || 'bearer',
      expiresIn: response.data.expires_in || 0
    };
  } catch (error: any) {
    console.error('Erro ao trocar código por token:', error);
    return null;
  }
}

/**
 * Obtém informações da conta business e número de telefone
 */
export async function getBusinessAccountInfo(
  accessToken: string
): Promise<{
  businessAccountId: string;
  phoneNumberId: string;
  phoneNumber: string;
} | null> {
  try {
    // Obter business accounts
    const accountsResponse = await axios.get(
      `${WHATSAPP_BASE_URL}/me/businesses`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!accountsResponse.data.data || accountsResponse.data.data.length === 0) {
      throw new Error('Nenhuma conta business encontrada');
    }

    const businessAccountId = accountsResponse.data.data[0].id;

    // Obter phone numbers
    const phonesResponse = await axios.get(
      `${WHATSAPP_BASE_URL}/${businessAccountId}/phone_numbers`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!phonesResponse.data.data || phonesResponse.data.data.length === 0) {
      throw new Error('Nenhum número de telefone encontrado');
    }

    const phoneData = phonesResponse.data.data[0];

    return {
      businessAccountId,
      phoneNumberId: phoneData.id,
      phoneNumber: phoneData.display_phone_number || phoneData.verified_name || ''
    };
  } catch (error: any) {
    console.error('Erro ao obter informações da conta business:', error);
    return null;
  }
}

/**
 * Salva configuração do WhatsApp após onboarding
 */
export async function saveWhatsAppConfig(
  phoneNumberId: string,
  phoneNumber: string,
  accessToken: string,
  businessAccountId: string,
  appId?: string,
  appSecret?: string
): Promise<boolean> {
  try {
    // Desativar configurações anteriores
    await prisma.whatsAppConfig.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Criar nova configuração
    await prisma.whatsAppConfig.create({
      data: {
        phoneNumberId,
        phoneNumber,
        accessToken,
        businessAccountId,
        appId: appId || process.env.WHATSAPP_APP_ID || null,
        appSecret: appSecret || process.env.WHATSAPP_APP_SECRET || null,
        webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
        apiVersion: process.env.WHATSAPP_API_VERSION || 'v21.0',
        isActive: true
      }
    });

    return true;
  } catch (error: any) {
    console.error('Erro ao salvar configuração WhatsApp:', error);
    return false;
  }
}

/**
 * Configura webhook automaticamente
 */
export async function setupWebhook(
  accessToken: string,
  phoneNumberId: string
): Promise<boolean> {
  try {
    const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (!webhookUrl || !verifyToken) {
      console.warn('Webhook URL ou verify token não configurados');
      return false;
    }

    // Configurar webhook
    await axios.post(
      `${WHATSAPP_BASE_URL}/${phoneNumberId}/subscribed_apps`,
      {
        subscribed_fields: ['messages', 'message_status', 'message_template_status_update']
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return true;
  } catch (error: any) {
    console.error('Erro ao configurar webhook:', error);
    return false;
  }
}

