import axios from 'axios';
import { prisma } from '../lib/prisma';

const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const WHATSAPP_BASE_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

/**
 * Obtém access token ativo
 */
async function getAccessToken(): Promise<string | null> {
  const config = await prisma.whatsAppConfig.findFirst({
    where: { isActive: true },
    select: { accessToken: true }
  });

  return config?.accessToken || null;
}

/**
 * Obtém business account ID
 */
async function getBusinessAccountId(): Promise<string | null> {
  const config = await prisma.whatsAppConfig.findFirst({
    where: { isActive: true },
    select: { businessAccountId: true }
  });

  return config?.businessAccountId || null;
}

/**
 * Cria template de mensagem
 */
export async function createTemplate(templateData: {
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  components: any[];
}): Promise<{ success: boolean; templateId?: string; error?: string }> {
  try {
    const accessToken = await getAccessToken();
    const businessAccountId = await getBusinessAccountId();

    if (!accessToken || !businessAccountId) {
      return {
        success: false,
        error: 'WhatsApp não configurado'
      };
    }

    const response = await axios.post(
      `${WHATSAPP_BASE_URL}/${businessAccountId}/message_templates`,
      templateData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      templateId: response.data.id
    };
  } catch (error: any) {
    console.error('Erro ao criar template:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

/**
 * Lista todos os templates
 */
export async function listTemplates(): Promise<any[]> {
  try {
    const accessToken = await getAccessToken();
    const businessAccountId = await getBusinessAccountId();

    if (!accessToken || !businessAccountId) {
      return [];
    }

    const response = await axios.get(
      `${WHATSAPP_BASE_URL}/${businessAccountId}/message_templates`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    return response.data.data || [];
  } catch (error: any) {
    console.error('Erro ao listar templates:', error);
    return [];
  }
}

/**
 * Obtém status de um template
 */
export async function getTemplateStatus(templateName: string): Promise<{
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason?: string;
} | null> {
  try {
    const templates = await listTemplates();
    const template = templates.find((t: any) => t.name === templateName);

    if (!template) {
      return null;
    }

    return {
      status: template.status,
      reason: template.rejection_reason
    };
  } catch (error: any) {
    console.error('Erro ao obter status do template:', error);
    return null;
  }
}

/**
 * Verifica se template está aprovado
 */
export async function isTemplateApproved(templateName: string): Promise<boolean> {
  const status = await getTemplateStatus(templateName);
  return status?.status === 'APPROVED';
}

/**
 * Deleta template (apenas se não aprovado)
 */
export async function deleteTemplate(templateId: string): Promise<boolean> {
  try {
    const accessToken = await getAccessToken();
    const businessAccountId = await getBusinessAccountId();

    if (!accessToken || !businessAccountId) {
      return false;
    }

    await axios.delete(
      `${WHATSAPP_BASE_URL}/${businessAccountId}/message_templates/${templateId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    return true;
  } catch (error: any) {
    console.error('Erro ao deletar template:', error);
    return false;
  }
}

