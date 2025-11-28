import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import * as caktoService from '../services/cakto.service';

/**
 * Gera URL de checkout do Cakto para um plano
 */
export const gerarCheckoutUrl = async (req: Request, res: Response) => {
  try {
    const { plano, email } = req.body;

    // Validações
    if (!plano || !email) {
      return res.status(400).json({
        error: 'Plano e email são obrigatórios'
      });
    }

    const planosValidos: ('MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL')[] = ['MENSAL', 'TRIMESTRAL', 'SEMESTRAL'];
    if (!planosValidos.includes(plano.toUpperCase() as any)) {
      return res.status(400).json({
        error: 'Plano inválido. Deve ser MENSAL, TRIMESTRAL ou SEMESTRAL'
      });
    }

    // Gerar URL de checkout
    const checkoutUrl = caktoService.generateCheckoutUrl(
      plano.toUpperCase() as 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL',
      email,
      {
        userId: req.userId || '', // Se autenticado, passar userId
        plano: plano.toUpperCase()
      }
    );

    res.json({
      success: true,
      checkoutUrl,
      plano: plano.toUpperCase()
    });

  } catch (error: any) {
    console.error('Erro ao gerar URL de checkout:', error);
    res.status(500).json({
      error: 'Erro ao gerar URL de checkout',
      message: error.message
    });
  }
};

/**
 * Verifica status da assinatura do usuário
 */
export const verificarStatusAssinatura = async (req: AuthRequest, res: Response) => {
  try {
    let email: string | undefined;

    // Se autenticado, buscar email do usuário
    if (req.userId) {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { email: true }
      });
      email = user?.email;
    }

    // Fallback: usar query param
    if (!email) {
      email = req.query.email as string;
    }

    if (!email) {
      return res.status(400).json({
        error: 'Email é obrigatório'
      });
    }

    const result = await caktoService.checkUserSubscription(email);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);

  } catch (error: any) {
    console.error('Erro ao verificar assinatura:', error);
    res.status(500).json({
      error: 'Erro ao verificar assinatura',
      message: error.message
    });
  }
};

/**
 * Lista histórico de pagamentos do usuário
 */
export const obterHistoricoPagamentos = async (req: AuthRequest, res: Response) => {
  try {
    let email: string | undefined;

    // Se autenticado, buscar email do usuário
    if (req.userId) {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { email: true }
      });
      email = user?.email;
    }

    // Fallback: usar query param
    if (!email) {
      email = req.query.email as string;
    }

    if (!email) {
      return res.status(400).json({
        error: 'Email é obrigatório'
      });
    }

    const result = await caktoService.getUserPaymentHistory(email);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);

  } catch (error: any) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      error: 'Erro ao buscar histórico',
      message: error.message
    });
  }
};

