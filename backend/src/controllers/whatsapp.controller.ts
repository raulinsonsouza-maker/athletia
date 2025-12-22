import { Request, Response } from 'express';
import {
  generateOAuthUrl,
  exchangeCodeForToken,
  getBusinessAccountInfo,
  saveWhatsAppConfig,
  setupWebhook
} from '../services/whatsapp-embedded-signup.service';
import { sendTextMessage, sendTemplateMessage } from '../services/whatsapp.service';

/**
 * Inicia processo de onboarding
 */
export const startOnboarding = async (req: Request, res: Response) => {
  try {
    const state = req.query.state as string | undefined;
    const oauthUrl = generateOAuthUrl(state);

    res.json({
      success: true,
      oauthUrl,
      message: 'Redirecione o usuário para a URL de autorização'
    });
  } catch (error: any) {
    console.error('Erro ao iniciar onboarding:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao iniciar onboarding'
    });
  }
};

/**
 * Callback OAuth - recebe código de autorização
 */
export const handleOAuthCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Código de autorização não fornecido'
      });
    }

    // Validar state (CSRF protection)
    // TODO: Implementar validação de state se necessário

    // Trocar código por token
    const tokenData = await exchangeCodeForToken(code as string);
    if (!tokenData) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao obter token de acesso'
      });
    }

    // Obter informações da conta
    const accountInfo = await getBusinessAccountInfo(tokenData.accessToken);
    if (!accountInfo) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao obter informações da conta'
      });
    }

    // Salvar configuração
    const saved = await saveWhatsAppConfig(
      accountInfo.phoneNumberId,
      accountInfo.phoneNumber,
      tokenData.accessToken,
      accountInfo.businessAccountId
    );

    if (!saved) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao salvar configuração'
      });
    }

    // Configurar webhook
    await setupWebhook(tokenData.accessToken, accountInfo.phoneNumberId);

    res.json({
      success: true,
      message: 'WhatsApp configurado com sucesso!',
      phoneNumber: accountInfo.phoneNumber
    });
  } catch (error: any) {
    console.error('Erro no callback OAuth:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao processar callback'
    });
  }
};

/**
 * Envia mensagem de teste
 */
export const sendTestMessage = async (req: Request, res: Response) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Número e mensagem são obrigatórios'
      });
    }

    const result = await sendTextMessage(to, message);

    if (result.success) {
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
    console.error('Erro ao enviar mensagem de teste:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao enviar mensagem'
    });
  }
};

