import { Router, Request, Response } from 'express';
import express from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import * as caktoService from '../services/cakto.service';

const router = Router();

// Rate limiting específico para webhooks (mais restritivo)
const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 webhooks por IP a cada 15 minutos
  message: { error: 'Muitas requisições de webhook. Por favor, tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: any) => req.method === 'OPTIONS'
});

/**
 * Webhook do Cakto para processar eventos de pagamento
 * POST /api/webhooks/cakto
 * 
 * IMPORTANTE: Usa express.raw() para receber o body como Buffer,
 * necessário para validar a assinatura HMAC SHA256 do webhook
 */
router.post('/cakto', webhookLimiter, express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  console.log('\n🔔 Webhook Cakto recebido:', new Date().toISOString());
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body type:', typeof req.body);

  try {
    let webhookData: any;

    // Verificar se o body é um Buffer e converter
    if (Buffer.isBuffer(req.body)) {
      console.log('📦 Convertendo Buffer para string...');
      const bodyString = req.body.toString('utf8');
      console.log('String convertida:', bodyString);
      webhookData = JSON.parse(bodyString);
    } else if (typeof req.body === 'object') {
      webhookData = req.body;
    } else {
      console.log('📝 Parseando JSON do body string...');
      webhookData = JSON.parse(req.body);
    }

    console.log('📋 Dados do webhook parseados:', JSON.stringify(webhookData, null, 2));

    // Validação de assinatura
    let signatureValid = false;
    let validationMethod = '';

    // Método 1: Verificar headers (HMAC SHA256)
    const signatureHeader = req.headers['x-cakto-signature'] || req.headers['x-signature'];
    // Tratar caso seja array (Express pode retornar string[])
    const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : (signatureHeader as string);
    
    if (signature) {
      console.log('🔐 Tentando validação por header HMAC...');
      // Se o body é um Buffer (vindo do express.raw), usar diretamente
      // Caso contrário, converter para string
      const bodyForValidation = Buffer.isBuffer(req.body) 
        ? req.body 
        : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
      
      signatureValid = caktoService.validateWebhookSignature(bodyForValidation, signature);
      validationMethod = 'header_hmac';
    }

    // Método 2: Verificar secret no JSON (fallback) - MANTIDO PARA COMPATIBILIDADE
    // SEGURANÇA: Logar uso do fallback para monitoramento
    if (!signatureValid && webhookData.secret) {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      const timestamp = new Date().toISOString();
      
      console.log('⚠️ [SEGURANÇA] [MONITORAMENTO] Header HMAC não encontrado, usando fallback de validação por secret no JSON');
      console.log('⚠️ [SEGURANÇA] [MONITORAMENTO] Detalhes da requisição:', {
        timestamp,
        ip: clientIp,
        userAgent,
        hasSecret: !!webhookData.secret,
        event: webhookData.event || webhookData.type,
        hasSignatureHeader: !!signature
      });
      
      if (webhookData.secret === process.env.CAKTO_WEBHOOK_SECRET) {
        signatureValid = true;
        validationMethod = 'json_secret';
        console.log('⚠️ [SEGURANÇA] [MONITORAMENTO] Validação por fallback aceita - MIGRAR PARA HMAC APENAS');
        console.log('⚠️ [SEGURANÇA] [MONITORAMENTO] Este webhook deve ser atualizado para usar header x-cakto-signature');
      } else {
        console.log('❌ [SEGURANÇA] Secret no JSON não corresponde ao esperado');
        console.log('❌ [SEGURANÇA] Possível tentativa de ataque ou webhook mal configurado');
      }
    }

    if (!signatureValid) {
      console.log('❌ Assinatura do webhook inválida');
      console.log('Secret esperado:', process.env.CAKTO_WEBHOOK_SECRET ? '***configurado***' : 'NÃO CONFIGURADO');
      console.log('Secret recebido:', webhookData.secret ? '***recebido***' : 'não recebido');
      return res.status(400).json({ error: 'Assinatura inválida' });
    }

    console.log(`✅ Assinatura validada com sucesso (método: ${validationMethod})`);

    // Processar evento
    const event = webhookData.event || webhookData.type;
    let result;

    switch (event) {
      case 'purchase_approved':
        console.log('💳 Processando pagamento aprovado...');
        result = await caktoService.processPaymentApproved(webhookData);
        break;

      case 'refund':
        console.log('💸 Processando reembolso...');
        result = await caktoService.processRefund(webhookData);
        break;

      case 'subscription_cancelled':
        console.log('🚫 Processando cancelamento de assinatura...');
        result = await caktoService.processSubscriptionCancelled(webhookData);
        break;

      default:
        console.log(`⚠️ Evento não suportado: ${event}`);
        return res.status(400).json({ error: `Evento não suportado: ${event}` });
    }

    console.log('✅ Webhook processado com sucesso:', result);

    res.status(200).json({
      success: true,
      event: event,
      result: result
    });

  } catch (error: any) {
    console.error('❌ Erro ao processar webhook:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

/**
 * Webhook do Resend para receber eventos de e-mail
 * POST /api/webhooks/resend
 * 
 * Eventos possíveis: email.sent, email.delivered, email.bounced, email.complained
 */
router.post('/resend', webhookLimiter, express.json(), async (req: Request, res: Response) => {
  console.log('\n📧 Webhook Resend recebido:', new Date().toISOString());

  try {
    // Validar assinatura do webhook
    const signature = req.headers['resend-signature'] as string;
    
    if (!signature) {
      console.log('❌ Assinatura do webhook Resend não encontrada');
      return res.status(401).json({ error: 'Assinatura não encontrada' });
    }

    if (!process.env.RESEND_WEBHOOK_SECRET) {
      console.warn('⚠️ RESEND_WEBHOOK_SECRET não configurado. Webhook não será validado.');
      // Em produção, isso deve retornar erro
      // return res.status(500).json({ error: 'Webhook secret não configurado' });
    } else {
      // Validar assinatura usando HMAC SHA256
      const bodyString = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RESEND_WEBHOOK_SECRET)
        .update(bodyString)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.log('❌ Assinatura do webhook Resend inválida');
        return res.status(401).json({ error: 'Assinatura inválida' });
      }

      console.log('✅ Assinatura do webhook Resend validada');
    }

    // Processar evento
    const event = req.body.type || req.body.event;
    const data = req.body.data || req.body;

    console.log('📋 Evento Resend:', event);
    console.log('📋 Dados:', JSON.stringify(data, null, 2));

    // Logar diferentes tipos de eventos
    switch (event) {
      case 'email.sent':
        console.log('✅ E-mail enviado com sucesso:', {
          emailId: data.email_id,
          to: data.to
        });
        break;

      case 'email.delivered':
        console.log('📬 E-mail entregue:', {
          emailId: data.email_id,
          to: data.to
        });
        break;

      case 'email.bounced':
        console.warn('⚠️ E-mail retornou (bounce):', {
          emailId: data.email_id,
          to: data.to,
          reason: data.bounce_type
        });
        break;

      case 'email.complained':
        console.warn('⚠️ E-mail marcado como spam:', {
          emailId: data.email_id,
          to: data.to
        });
        break;

      default:
        console.log(`ℹ️ Evento Resend não tratado: ${event}`);
    }

    res.status(200).json({ 
      success: true,
      message: 'Webhook processado com sucesso'
    });

  } catch (error: any) {
    console.error('❌ Erro ao processar webhook Resend:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

export default router;

