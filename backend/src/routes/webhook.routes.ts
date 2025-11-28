import { Router, Request, Response } from 'express';
import express from 'express';
import * as caktoService from '../services/cakto.service';

const router = Router();

/**
 * Webhook do Cakto para processar eventos de pagamento
 * POST /api/webhooks/cakto
 * 
 * IMPORTANTE: Usa express.raw() para receber o body como Buffer,
 * necessário para validar a assinatura HMAC SHA256 do webhook
 */
router.post('/cakto', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
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

    // Método 2: Verificar secret no JSON (fallback)
    if (!signatureValid && webhookData.secret) {
      console.log('🔐 Header não encontrado, tentando validação por secret no JSON...');
      if (webhookData.secret === process.env.CAKTO_WEBHOOK_SECRET) {
        signatureValid = true;
        validationMethod = 'json_secret';
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

export default router;

