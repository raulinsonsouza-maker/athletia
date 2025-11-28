import crypto from 'crypto';
import { prisma } from '../lib/prisma';

// Configurações do Cakto
const CAKTO_CONFIG = {
  webhookSecret: process.env.CAKTO_WEBHOOK_SECRET || '',
  // Mapeamento de planos para product_ids do Cakto
  // Você precisa criar 3 produtos no Cakto e configurar os IDs aqui
  productIds: {
    MENSAL: process.env.CAKTO_PRODUCT_ID_MENSAL || '',
    TRIMESTRAL: process.env.CAKTO_PRODUCT_ID_TRIMESTRAL || '',
    SEMESTRAL: process.env.CAKTO_PRODUCT_ID_SEMESTRAL || ''
  },
  // Mapeamento reverso: product_id -> plano
  getPlanoByProductId: (productId: string): string | null => {
    for (const [plano, id] of Object.entries(CAKTO_CONFIG.productIds)) {
      if (id === productId) {
        return plano;
      }
    }
    return null;
  }
};

/**
 * Valida a assinatura do webhook usando HMAC SHA256
 */
export function validateWebhookSignature(payload: string | Buffer, signature: string): boolean {
  try {
    if (!CAKTO_CONFIG.webhookSecret) {
      console.error('❌ CAKTO_WEBHOOK_SECRET não configurado');
      return false;
    }

    // Usar Buffer diretamente no HMAC (mais seguro)
    const hmac = crypto.createHmac('sha256', CAKTO_CONFIG.webhookSecret);
    const payloadBuffer = Buffer.isBuffer(payload) ? payload : Buffer.from(payload, 'utf8');
    hmac.update(payloadBuffer);
    const expectedSignature = hmac.digest('hex');
    
    // A assinatura pode vir em hex ou como string direta
    // Tentar ambos os formatos
    const signatureBuffer = signature.startsWith('0x') 
      ? Buffer.from(signature.slice(2), 'hex')
      : Buffer.from(signature, 'hex');
    
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    
    // Comparação segura contra timing attacks
    if (signatureBuffer.length !== expectedBuffer.length) {
      console.log('❌ Tamanho da assinatura não corresponde');
      return false;
    }
    
    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    console.error('❌ Erro ao validar assinatura:', error);
    // Fallback: comparar strings (menos seguro, mas funciona se a assinatura não for hex)
    try {
      const payloadString = Buffer.isBuffer(payload) ? payload.toString('utf8') : payload;
      const expectedSignature = crypto
        .createHmac('sha256', CAKTO_CONFIG.webhookSecret)
        .update(payloadString)
        .digest('hex');
      
      return signature === expectedSignature || signature.toLowerCase() === expectedSignature.toLowerCase();
    } catch (fallbackError) {
      console.error('❌ Erro no fallback de validação:', fallbackError);
      return false;
    }
  }
}

/**
 * Busca usuário por email
 */
async function findUserByEmail(email: string) {
  try {
    console.log(`🔍 Buscando usuário com email: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { perfil: true }
    });

    if (user) {
      console.log('👤 Usuário encontrado:', { id: user.id, email: user.email, nome: user.nome });
      return user;
    }

    console.log('❌ Usuário não encontrado');
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    return null;
  }
}

/**
 * Calcula data de expiração baseada no plano
 */
function calcularDataExpiracao(plano: string): Date {
  const hoje = new Date();
  switch (plano) {
    case 'MENSAL':
      hoje.setMonth(hoje.getMonth() + 1);
      break;
    case 'TRIMESTRAL':
      hoje.setMonth(hoje.getMonth() + 3);
      break;
    case 'SEMESTRAL':
      hoje.setMonth(hoje.getMonth() + 6);
      break;
    default:
      hoje.setMonth(hoje.getMonth() + 1); // Default: 1 mês
  }
  return hoje;
}

/**
 * Processa pagamento aprovado
 */
export async function processPaymentApproved(webhookData: any) {
  try {
    console.log('💳 Processando pagamento aprovado...');
    
    // Extrair dados do webhook (estrutura do Cakto)
    const customer = webhookData.data?.customer || webhookData.customer;
    const transaction = webhookData.data || webhookData;
    const product = transaction.product || webhookData.product;
    
    const transactionId = transaction.id || transaction.transaction_id;
    const amount = transaction.amount || 0;
    const paymentMethod = transaction.paymentMethod || transaction.payment_method || 'unknown';
    const status = transaction.status || 'approved';
    
    // Tentar extrair product_id de diferentes fontes
    // 1. Da URL do checkout (contém o product_id do link de pagamento)
    let productId: string | null = null;
    const checkoutUrl = transaction.checkoutUrl || webhookData.checkoutUrl;
    if (checkoutUrl) {
      // Extrair product_id da URL: https://pay.cakto.com.br/{product_id}?...
      const urlMatch = checkoutUrl.match(/https?:\/\/pay\.cakto\.com\.br\/([^\/\?]+)/);
      if (urlMatch && urlMatch[1]) {
        productId = urlMatch[1];
        console.log(`📋 Product ID extraído da checkoutUrl: ${productId}`);
      }
    }
    
    // 2. Fallback: tentar product.short_id
    if (!productId && product?.short_id) {
      productId = product.short_id;
      console.log(`📋 Product ID do short_id: ${productId}`);
    }
    
    // 3. Fallback: tentar product.id (UUID interno - menos confiável)
    if (!productId) {
      productId = product?.id || transaction.productId || transaction.product_id;
      console.log(`📋 Product ID do product.id (UUID): ${productId}`);
    }

    console.log('Dados extraídos:', {
      email: customer?.email,
      transactionId,
      amount,
      paymentMethod,
      status,
      productId,
      checkoutUrl: checkoutUrl || 'não encontrada',
      productShortId: product?.short_id || 'não encontrado'
    });

    // Mapear product_id para plano
    let plano = productId ? CAKTO_CONFIG.getPlanoByProductId(productId) : null;
    
    // Se não encontrou pelo product_id e é um webhook de teste (contém "EXAMPLE")
    // tentar identificar pelo valor do pagamento como fallback
    if (!plano && checkoutUrl && checkoutUrl.includes('EXAMPLE')) {
      console.log('⚠️  Webhook de teste detectado (EXAMPLE). Tentando identificar plano pelo valor...');
      
      // Valores aproximados dos planos (em reais)
      // MENSAL: ~19.90, TRIMESTRAL: ~49.90, SEMESTRAL: ~89.90
      const valor = amount || transaction.baseAmount || 0;
      
      if (valor >= 80 && valor <= 100) {
        plano = 'SEMESTRAL';
        console.log(`✅ Plano identificado pelo valor (R$ ${valor}): ${plano}`);
      } else if (valor >= 45 && valor <= 55) {
        plano = 'TRIMESTRAL';
        console.log(`✅ Plano identificado pelo valor (R$ ${valor}): ${plano}`);
      } else if (valor >= 15 && valor <= 25) {
        plano = 'MENSAL';
        console.log(`✅ Plano identificado pelo valor (R$ ${valor}): ${plano}`);
      }
    }
    
    if (!plano) {
      console.error(`❌ Product ID não mapeado: ${productId}`);
      console.error('📋 Product IDs configurados:', CAKTO_CONFIG.productIds);
      console.error('📋 Dados do produto recebido:', {
        productId: productId,
        productShortId: product?.short_id,
        productIdUUID: product?.id,
        checkoutUrl: checkoutUrl,
        amount: amount,
        baseAmount: transaction.baseAmount
      });
      
      // Se for webhook de teste, retornar erro mais amigável
      if (checkoutUrl && checkoutUrl.includes('EXAMPLE')) {
        return {
          success: false,
          message: `Webhook de teste detectado. O product_id "EXAMPLE" é um placeholder. Em webhooks reais, a URL do checkout contém o product_id correto. Valor recebido: R$ ${amount || transaction.baseAmount || 0}`,
          transaction_id: transactionId,
          debug: {
            productId: productId,
            productShortId: product?.short_id,
            checkoutUrl: checkoutUrl,
            configuredIds: CAKTO_CONFIG.productIds,
            amount: amount,
            baseAmount: transaction.baseAmount,
            isTestWebhook: true
          }
        };
      }
      
      return {
        success: false,
        message: `Product ID não reconhecido: ${productId}. Verifique se o product_id está correto no .env`,
        transaction_id: transactionId,
        debug: {
          productId: productId,
          productShortId: product?.short_id,
          checkoutUrl: checkoutUrl,
          configuredIds: CAKTO_CONFIG.productIds
        }
      };
    }

    console.log(`✅ Plano identificado: ${plano} (product_id: ${productId})`);

    // Buscar usuário
    const user = await findUserByEmail(customer?.email);
    
    if (!user) {
      console.log('❌ Usuário não encontrado para email:', customer?.email);
      return {
        success: false,
        message: 'Usuário não encontrado',
        transaction_id: transactionId,
        email: customer?.email
      };
    }

    // Calcular data de expiração
    const dataExpiracao = calcularDataExpiracao(plano);

    // Atualizar usuário com plano ativo
    const userAtualizado = await prisma.user.update({
      where: { id: user.id },
      data: {
        planoAtivo: true,
        plano: plano,
        dataPagamento: new Date(),
        dataExpiracao: dataExpiracao,
        caktoCustomerId: customer?.id || customer?.customer_id,
        caktoTransactionId: transactionId
      }
    });

    console.log('✅ Perfil atualizado para premium:', {
      plano,
      dataExpiracao: dataExpiracao.toISOString()
    });

    // Salvar histórico de pagamento
    await prisma.paymentHistory.create({
      data: {
        userId: user.id,
        transactionId: transactionId,
        amount: amount,
        currency: 'BRL',
        status: 'completed',
        paymentMethod: paymentMethod,
        plano: plano,
        eventType: 'purchase_approved',
        caktoData: webhookData as any
      }
    });

    console.log('✅ Histórico de pagamento salvo');

    // Gerar treinos automaticamente (usar função existente)
    try {
      const { gerarTreinos30Dias } = await import('./treino.service');
      console.log(`🔄 Gerando treinos para os próximos 30 dias para o usuário ${user.id}...`);
      
      if (user.perfil) {
        await gerarTreinos30Dias(user.id);
        console.log('✅ Treinos gerados com sucesso');
      } else {
        console.warn('⚠️ Usuário não possui perfil. Treinos não serão gerados.');
      }
    } catch (error: any) {
      console.error('⚠️ Erro ao gerar treinos (não crítico):', error.message);
      // Não falhar o webhook se não conseguir gerar treinos
    }

    const result = {
      success: true,
      message: 'Pagamento processado com sucesso',
      transaction_id: transactionId,
      amount: amount,
      plano: plano,
      user_id: user.id
    };

    console.log('✅ Pagamento aprovado processado:', result);
    return result;

  } catch (error: any) {
    console.error('❌ Erro ao processar pagamento aprovado:', error);
    throw error;
  }
}

/**
 * Processa reembolso
 */
export async function processRefund(webhookData: any) {
  try {
    console.log('💸 Processando reembolso...');
    
    const customer = webhookData.data?.customer || webhookData.customer;
    const transaction = webhookData.data || webhookData;
    const transactionId = transaction.id || transaction.transaction_id;
    const amount = transaction.amount || 0;

    console.log('Dados do reembolso:', {
      email: customer?.email,
      transactionId,
      amount
    });

    // Buscar usuário
    const user = await findUserByEmail(customer?.email);
    
    if (!user) {
      console.log('❌ Usuário não encontrado para reembolso:', customer?.email);
      return {
        success: false,
        message: 'Usuário não encontrado',
        transaction_id: transactionId
      };
    }

    // Cancelar assinatura (voltar para free)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        planoAtivo: false,
        plano: null,
        dataPagamento: null,
        dataExpiracao: null
      }
    });

    console.log('✅ Assinatura cancelada (voltou para free)');

    // Registrar reembolso no histórico
    await prisma.paymentHistory.create({
      data: {
        userId: user.id,
        transactionId: `refund_${transactionId}`,
        amount: -amount, // Valor negativo para reembolso
        currency: 'BRL',
        status: 'refunded',
        paymentMethod: 'refund',
        plano: user.plano,
        eventType: 'refund',
        caktoData: webhookData as any
      }
    });

    console.log('✅ Reembolso registrado no histórico');

    const result = {
      success: true,
      message: 'Reembolso processado com sucesso',
      transaction_id: transactionId,
      amount: amount
    };

    console.log('✅ Reembolso processado:', result);
    return result;

  } catch (error: any) {
    console.error('❌ Erro ao processar reembolso:', error);
    throw error;
  }
}

/**
 * Processa cancelamento de assinatura
 */
export async function processSubscriptionCancelled(webhookData: any) {
  try {
    console.log('🚫 Processando cancelamento de assinatura...');
    
    const customer = webhookData.data?.customer || webhookData.customer;
    const transaction = webhookData.data || webhookData;
    const transactionId = transaction.id || transaction.transaction_id;

    console.log('Dados do cancelamento:', {
      email: customer?.email,
      transactionId
    });

    // Buscar usuário
    const user = await findUserByEmail(customer?.email);
    
    if (!user) {
      console.log('❌ Usuário não encontrado para cancelamento:', customer?.email);
      return {
        success: false,
        message: 'Usuário não encontrado',
        transaction_id: transactionId
      };
    }

    // Cancelar assinatura (voltar para free)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        planoAtivo: false,
        plano: null,
        dataPagamento: null,
        dataExpiracao: null
      }
    });

    console.log('✅ Assinatura cancelada');

    // Registrar cancelamento no histórico
    await prisma.paymentHistory.create({
      data: {
        userId: user.id,
        transactionId: `cancel_${transactionId}`,
        amount: 0,
        currency: 'BRL',
        status: 'cancelled',
        paymentMethod: 'cancellation',
        plano: user.plano,
        eventType: 'subscription_cancelled',
        caktoData: webhookData as any
      }
    });

    console.log('✅ Cancelamento registrado no histórico');

    const result = {
      success: true,
      message: 'Cancelamento processado com sucesso',
      transaction_id: transactionId
    };

    console.log('✅ Cancelamento processado:', result);
    return result;

  } catch (error: any) {
    console.error('❌ Erro ao processar cancelamento:', error);
    throw error;
  }
}

/**
 * Gera URL de checkout do Cakto para um plano específico
 */
export function generateCheckoutUrl(plano: 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL', userEmail: string, customData: Record<string, any> = {}): string {
  const productId = CAKTO_CONFIG.productIds[plano];
  
  if (!productId) {
    throw new Error(`Product ID não configurado para o plano ${plano}`);
  }

  const params = new URLSearchParams({
    email: userEmail,
    ...customData
  });
  
  return `https://pay.cakto.com.br/${productId}?${params.toString()}`;
}

/**
 * Verifica status da assinatura do usuário
 */
export async function checkUserSubscription(userEmail: string) {
  try {
    const user = await findUserByEmail(userEmail);
    
    if (!user) {
      return { 
        success: false, 
        message: 'Usuário não encontrado' 
      };
    }

    return {
      success: true,
      user: {
        email: user.email,
        plano: user.plano,
        planoAtivo: user.planoAtivo,
        dataPagamento: user.dataPagamento,
        dataExpiracao: user.dataExpiracao,
        isPremium: user.planoAtivo
      }
    };

  } catch (error: any) {
    console.error('Erro ao verificar assinatura:', error);
    return { 
      success: false, 
      message: 'Erro ao verificar assinatura' 
    };
  }
}

/**
 * Lista histórico de pagamentos do usuário
 */
export async function getUserPaymentHistory(userEmail: string) {
  try {
    const user = await findUserByEmail(userEmail);
    
    if (!user) {
      return { 
        success: false, 
        message: 'Usuário não encontrado' 
      };
    }

    const payments = await prisma.paymentHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      payments: payments || []
    };

  } catch (error: any) {
    console.error('Erro ao buscar histórico:', error);
    return { 
      success: false, 
      message: 'Erro ao buscar histórico' 
    };
  }
}

