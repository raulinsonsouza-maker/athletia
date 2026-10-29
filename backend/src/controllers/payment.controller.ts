import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import * as caktoService from '../services/cakto.service';
import * as mercadoPagoService from '../services/mercadopago.service';

function responderErro(res: Response, error: any, fallback: string) {
  const status = error?.statusCode || 500;
  if (status >= 500) {
    console.error('[payment]', error?.message || fallback);
  }
  return res.status(status).json({
    error: status >= 500 ? fallback : error.message
  });
}

/**
 * Checkout externo do Cakto não abre mais novas assinaturas.
 */
export const gerarCheckoutUrl = async (_req: Request, res: Response) => {
  return res.status(410).json({
    error: 'Assine na página de checkout com cartão ou Pix.'
  });
};

export const obterConfigPagamento = async (_req: Request, res: Response) => {
  const publicKey = mercadoPagoService.publicKey();
  if (!publicKey) {
    return res.status(503).json({ error: 'Pagamento indisponível no momento.' });
  }
  return res.json({ publicKey });
};

export const assinarComCartao = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Autenticação obrigatória' });

    const plano = String(req.body?.plano || '').toUpperCase();
    const cardTokenId = String(req.body?.cardTokenId || '');
    const idempotencyKey = String(req.body?.idempotencyKey || '');

    if (!mercadoPagoService.isPlanoId(plano)) {
      return res.status(400).json({ error: 'Plano inválido. Deve ser MENSAL, TRIMESTRAL ou SEMESTRAL' });
    }
    if (!cardTokenId) {
      return res.status(400).json({ error: 'Token do cartão é obrigatório' });
    }
    if (!idempotencyKey) {
      return res.status(400).json({ error: 'Chave de idempotência é obrigatória' });
    }

    const result = await mercadoPagoService.assinarComCartao({
      userId: req.userId,
      plano,
      cardTokenId,
      idempotencyKey
    });

    return res.status(result.success ? 200 : 402).json(result);
  } catch (error: any) {
    return responderErro(res, error, 'Erro ao criar a assinatura');
  }
};

export const criarPix = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Autenticação obrigatória' });

    const plano = String(req.body?.plano || '').toUpperCase();
    const cpf = String(req.body?.cpf || '');
    const idempotencyKey = String(req.body?.idempotencyKey || '');

    if (!mercadoPagoService.isPlanoId(plano)) {
      return res.status(400).json({ error: 'Plano inválido. Deve ser MENSAL, TRIMESTRAL ou SEMESTRAL' });
    }
    if (!mercadoPagoService.cpfValido(cpf)) {
      return res.status(400).json({ error: 'CPF inválido' });
    }
    if (!idempotencyKey) {
      return res.status(400).json({ error: 'Chave de idempotência é obrigatória' });
    }

    const result = await mercadoPagoService.criarPagamentoPix({
      userId: req.userId,
      plano,
      cpf,
      idempotencyKey
    });

    return res.json(result);
  } catch (error: any) {
    return responderErro(res, error, 'Erro ao gerar o Pix');
  }
};

export const consultarPix = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Autenticação obrigatória' });
    const paymentId = String(req.params.paymentId || '');
    if (!paymentId) return res.status(400).json({ error: 'Pagamento não informado' });

    const result = await mercadoPagoService.consultarPagamentoPix(req.userId, paymentId);
    return res.json(result);
  } catch (error: any) {
    return responderErro(res, error, 'Erro ao consultar o Pix');
  }
};

export const cancelarAssinatura = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Autenticação obrigatória' });
    const result = await mercadoPagoService.cancelarAssinatura(req.userId);
    return res.json(result);
  } catch (error: any) {
    return responderErro(res, error, 'Erro ao cancelar a assinatura');
  }
};

/**
 * Verifica status da assinatura do usuário
 */
export const verificarStatusAssinatura = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Autenticação obrigatória' });
    }

    const result = await mercadoPagoService.obterStatus(req.userId);
    if (!result.success) return res.status(404).json(result);
    return res.json(result);
  } catch (error: any) {
    console.error('Erro ao verificar assinatura:', error);
    return res.status(500).json({
      error: 'Erro ao verificar assinatura'
    });
  }
};

/**
 * Lista histórico de pagamentos do usuário
 */
export const obterHistoricoPagamentos = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Autenticação obrigatória' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { email: true }
    });

    if (!user?.email) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const result = await caktoService.getUserPaymentHistory(user.email);
    if (!result.success) return res.status(404).json(result);
    return res.json(result);
  } catch (error: any) {
    console.error('Erro ao buscar histórico:', error);
    return res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
};
