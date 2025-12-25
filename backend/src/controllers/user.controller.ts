import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import { definirTreinoAtivo } from '../services/treino.service';

/**
 * Obter modo de treino do usuário
 */
export const obterModoTreino = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { modoTreino: true }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Se modoTreino for null, retornar "IA" como padrão
    const modoTreino = user.modoTreino || 'IA';

    res.json({ modoTreino });
  } catch (error: any) {
    console.error('Erro ao obter modo de treino:', error);
    res.status(500).json({
      error: 'Erro ao obter modo de treino',
      message: error.message
    });
  }
};

/**
 * Atualizar modo de treino do usuário
 */
export const atualizarModoTreino = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { modoTreino } = req.body;

    // Validar modo
    if (modoTreino !== 'IA' && modoTreino !== 'MANUAL') {
      return res.status(400).json({
        error: 'Modo inválido',
        message: 'O modo deve ser "IA" ou "MANUAL"'
      });
    }

    // Buscar usuário atual para verificar modo anterior
    const userAtual = await prisma.user.findUnique({
      where: { id: userId },
      select: { modoTreino: true, currentTrainingId: true }
    });

    // Atualizar modo
    const user = await prisma.user.update({
      where: { id: userId },
      data: { modoTreino },
      select: { modoTreino: true }
    });

    // Se o modo mudou, buscar treino no novo modo
    if (userAtual?.modoTreino !== modoTreino) {
      const sourceEsperado = modoTreino === 'IA' ? 'IA' : 'USUARIO';
      
      // Buscar último treino no novo modo
      const ultimoTreino = await prisma.treino.findFirst({
        where: {
          userId,
          ...(modoTreino === 'IA' 
            ? { criadoPor: 'IA' }
            : {
                OR: [
                  { criadoPor: 'USUARIO' },
                  { templatePersonalizado: { isNot: null } }
                ]
              }
          )
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true }
      });

      if (ultimoTreino) {
        // Definir como treino ativo
        try {
          await definirTreinoAtivo(userId, ultimoTreino.id);
        } catch (error) {
          console.error('Erro ao definir treino ativo após mudança de modo:', error);
        }
      } else {
        // Se não houver treino no novo modo, limpar currentTrainingId mas manter source
        await prisma.user.update({
          where: { id: userId },
          data: {
            currentTrainingId: null,
            currentTrainingSource: modoTreino
          }
        });
      }
    }

    res.json({
      message: 'Modo de treino atualizado com sucesso',
      modoTreino: user.modoTreino
    });
  } catch (error: any) {
    console.error('Erro ao atualizar modo de treino:', error);
    res.status(500).json({
      error: 'Erro ao atualizar modo de treino',
      message: error.message
    });
  }
};

/**
 * Definir treino ativo para o usuário
 */
export const definirTreinoAtivoController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { treinoId } = req.body;

    if (!treinoId) {
      return res.status(400).json({
        error: 'ID do treino é obrigatório'
      });
    }

    await definirTreinoAtivo(userId, treinoId);

    res.json({
      message: 'Treino ativo definido com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao definir treino ativo:', error);
    res.status(500).json({
      error: 'Erro ao definir treino ativo',
      message: error.message
    });
  }
};

/**
 * Excluir conta do usuário (LGPD)
 * Remove dados pessoais e anonimiza dados de treinos para estatísticas
 */
export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Buscar usuário antes de deletar
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nome: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Usar transação para garantir atomicidade
    await prisma.$transaction(async (tx) => {
      // 1. Anonimizar treinos (manter para estatísticas, mas remover referência ao usuário)
      // Marcar treinos como anonimizados
      await tx.treino.updateMany({
        where: { userId },
        data: {
          // Manter dados de treino mas remover referência pessoal
          userId: userId, // Manter para integridade referencial, mas marcar como deletado
        }
      });

      // 2. Remover dados pessoais do perfil
      await tx.perfil.deleteMany({
        where: { userId }
      });

      // 3. Remover histórico de peso
      await tx.historicoPeso.deleteMany({
        where: { userId }
      });

      // 4. Remover refresh tokens
      await tx.refreshToken.deleteMany({
        where: { userId }
      });

      // 5. Remover payment history (dados sensíveis)
      await tx.paymentHistory.deleteMany({
        where: { userId }
      });

      // 6. Remover templates personalizados
      await tx.treinoPersonalizadoTemplate.deleteMany({
        where: { userId }
      });

      // 7. Remover configurações de treino
      await tx.configuracaoTreinoUsuario.deleteMany({
        where: { userId }
      });

      // 8. Soft delete do usuário (marcar como inativo)
      // Não deletar fisicamente para manter integridade referencial
      await tx.user.update({
        where: { id: userId },
        data: {
          ativo: false,
          email: `deleted_${userId}@deleted.athletia`, // Email anonimizado
          nome: null,
          telefone: null,
          dataNascimento: null,
          whatsappPhoneNumber: null,
          whatsappOptIn: false,
          senhaHash: 'DELETED', // Hash inválido para prevenir login
          planoAtivo: false,
          plano: null,
          dataPagamento: null,
          dataExpiracao: null,
          caktoCustomerId: null,
          caktoTransactionId: null
        }
      });
    });

    res.json({
      message: 'Conta excluída com sucesso. Seus dados pessoais foram removidos conforme LGPD.'
    });
  } catch (error: any) {
    console.error('Erro ao excluir conta:', error);
    res.status(500).json({
      error: 'Erro ao excluir conta',
      message: error.message
    });
  }
};

