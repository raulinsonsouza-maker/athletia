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
    // Verificar se há userId no request (pode vir de middleware de autenticação opcional)
    const userId = (req as any).userId || '';
    const checkoutUrl = caktoService.generateCheckoutUrl(
      plano.toUpperCase() as 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL',
      email,
      {
        userId: userId,
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
    // SEGURANÇA: Sempre usar email do usuário autenticado, nunca query parameter
    if (!req.userId) {
      return res.status(401).json({
        error: 'Autenticação obrigatória'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { email: true }
    });

    if (!user || !user.email) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    const email = user.email;

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
    // SEGURANÇA: Sempre usar email do usuário autenticado, nunca query parameter
    if (!req.userId) {
      return res.status(401).json({
        error: 'Autenticação obrigatória'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { email: true }
    });

    if (!user || !user.email) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    const email = user.email;

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

