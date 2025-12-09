import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import { parseAndValidateDate } from '../utils/dto';
import * as treinoService from '../services/treino.service';
import * as progressaoService from '../services/progressao.service';
import { obterResumoTreinos, buscarPlanoAtual } from '../services/treino-dashboard.service';
import { 
  garantirPlanoSemanal as garantirPlanoSemanalInteligente,
  gerarTreinoDoDiaUnico
} from '../services/treino-engine.service';

// Gerar treino do dia ou semana completa - USA APENAS MOTOR CENTRALIZADO
export const gerarTreinoDoDia = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { data, gerarSemana } = req.body;

    console.log('[CONTROLLER] Gerando treino usando motor centralizado...', { userId, data, gerarSemana });

    // SEGURANÇA: Validar formato de data antes de usar
    let dataReferencia: Date = new Date();
    if (data) {
      const parsedDate = parseAndValidateDate(data);
      if (!parsedDate) {
        return res.status(400).json({
          error: 'Data inválida. Use o formato ISO (ex: 2024-12-20)'
        });
      }
      dataReferencia = parsedDate;
    }

    if (gerarSemana === true) {
      // Gerar semana completa usando motor centralizado
      const treinos = await garantirPlanoSemanalInteligente({ 
        userId, 
        dataReferencia
      });
      return res.status(201).json({
        message: `${treinos.length} treino(s) gerado(s) com sucesso`,
        treinos,
        quantidadeGerados: treinos.length
      });
    } else {
      // Gerar treino do dia usando motor centralizado
      const treinoGerado = await gerarTreinoDoDiaUnico(
        userId,
        dataReferencia
      );

      if (!treinoGerado) {
        return res.status(400).json({
          error: 'Não foi possível gerar treino',
          message: 'A data selecionada não corresponde a um dia de treino baseado na sua frequência semanal'
        });
      }

      // Buscar treino completo do banco
      const treinoCompleto = await prisma.treino.findUnique({
        where: { id: treinoGerado.id },
        include: {
          exercicios: {
            include: { exercicio: true },
            orderBy: { ordem: 'asc' }
          }
        }
      });

      return res.status(201).json({
        message: 'Treino gerado com sucesso',
        treino: treinoCompleto
      });
    }
  } catch (error: any) {
    console.error('[CONTROLLER] Erro:', error);
    
    let statusCode = 500;
    if (error.message?.includes('Perfil não encontrado')) statusCode = 404;
    else if (error.message?.includes('incompleto')) statusCode = 400;

    return res.status(statusCode).json({
      error: 'Erro ao gerar treino',
      message: error.message || 'Erro ao gerar treino'
    });
  }
};

// Buscar treino do dia
export const buscarTreinoDoDia = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { data } = req.query;

    // SEGURANÇA: Validar formato de data
    let dataTreino: Date = new Date();
    if (data) {
      const parsedDate = parseAndValidateDate(data);
      if (!parsedDate) {
        return res.status(400).json({
          error: 'Data inválida. Use o formato ISO (ex: 2024-12-20)'
        });
      }
      dataTreino = parsedDate;
    }
    dataTreino.setHours(0, 0, 0, 0);
    const fimDia = new Date(dataTreino);
    fimDia.setHours(23, 59, 59, 999);

    const treino = await prisma.treino.findFirst({
      where: {
        userId,
        data: { gte: dataTreino, lte: fimDia }
      },
      include: {
        exercicios: {
          include: { exercicio: true },
          orderBy: { ordem: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!treino) {
      return res.status(200).json({
        treino: null,
        message: 'Nenhum treino encontrado para esta data'
      });
    }

    return res.json(treino);
  } catch (error: any) {
    console.error('[CONTROLLER] Erro ao buscar treino:', error);
    return res.status(500).json({
      error: 'Erro ao buscar treino',
      message: error.message
    });
  }
};

// Concluir ou desmarcar exercício
export const concluirExercicio = async (req: AuthRequest, res: Response) => {
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { rpeRealizado, feedbackSimples, aceitouAjuste, concluido } = req.body || {};

    console.log(`[concluirExercicio Controller] [${requestId}] Iniciando requisição:`, {
      userId,
      exercicioId: id,
      body: { rpeRealizado, feedbackSimples, aceitouAjuste, concluido },
      timestamp: new Date().toISOString()
    });

    // Validar ID do exercício
    if (!id || typeof id !== 'string') {
      console.error(`[concluirExercicio Controller] [${requestId}] ID inválido:`, id);
      return res.status(400).json({
        error: 'ID do exercício é obrigatório',
        message: 'O ID do exercício deve ser fornecido',
        requestId
      });
    }

    // Validar userId
    if (!userId) {
      console.error(`[concluirExercicio Controller] [${requestId}] userId não encontrado`);
      return res.status(401).json({
        error: 'Usuário não autenticado',
        message: 'Token de autenticação inválido ou ausente',
        requestId
      });
    }

    // Validar RPE se fornecido
    if (rpeRealizado !== undefined) {
      if (typeof rpeRealizado !== 'number' || rpeRealizado < 1 || rpeRealizado > 10) {
        console.error(`[concluirExercicio Controller] [${requestId}] RPE inválido:`, rpeRealizado);
        return res.status(400).json({
          error: 'RPE inválido',
          message: 'RPE deve ser um número entre 1 e 10',
          requestId
        });
      }
    }

    // Validar feedbackSimples se fornecido
    const feedbackValidos = ['MUITO_FACIL', 'NO_PONTO', 'PESADO_DEMAIS'];
    if (feedbackSimples !== undefined && feedbackSimples !== null) {
      if (typeof feedbackSimples !== 'string' || !feedbackValidos.includes(feedbackSimples)) {
        console.error(`[concluirExercicio Controller] [${requestId}] feedbackSimples inválido:`, feedbackSimples);
        return res.status(400).json({
          error: 'Feedback inválido',
          message: `feedbackSimples deve ser um dos valores: ${feedbackValidos.join(', ')}`,
          requestId
        });
      }
    }

    // Validar que não temos RPE e feedbackSimples ao mesmo tempo
    if (concluido !== false && rpeRealizado !== undefined && feedbackSimples) {
      console.error(`[concluirExercicio Controller] [${requestId}] RPE e feedbackSimples fornecidos simultaneamente`);
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'Não é possível fornecer RPE e feedbackSimples simultaneamente',
        requestId
      });
    }

    // Se concluido não for especificado, assume true (comportamento padrão)
    const estaConcluido = concluido !== undefined ? concluido : true;

    console.log(`[concluirExercicio Controller] [${requestId}] Chamando service com:`, {
      exercicioId: id,
      userId,
      estaConcluido,
      rpeRealizado,
      feedbackSimples,
      aceitouAjuste
    });

    const exercicioTreino = await treinoService.concluirExercicio(
      id,
      userId,
      rpeRealizado !== undefined ? rpeRealizado : undefined,
      feedbackSimples || undefined,
      aceitouAjuste !== undefined ? aceitouAjuste : null,
      estaConcluido
    );

    console.log(`[concluirExercicio Controller] [${requestId}] Sucesso - exercício atualizado`);

    res.json({
      message: estaConcluido ? 'Exercício concluído com sucesso' : 'Exercício desmarcado com sucesso',
      exercicioTreino,
      requestId
    });
  } catch (error: any) {
    const errorContext = {
      requestId,
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
      userId: req.userId,
      exercicioId: req.params.id,
      timestamp: new Date().toISOString()
    };

    console.error(`[concluirExercicio Controller] [${requestId}] Erro completo:`, errorContext);
    
    // Mapeamento de erros Prisma para códigos HTTP
    const prismaErrorMap: Record<string, { status: number; message: string }> = {
      'P2025': { status: 404, message: 'Exercício não encontrado' },
      'P2002': { status: 409, message: 'Violação de constraint única' },
      'P2003': { status: 400, message: 'Referência inválida no banco de dados' },
      'P2014': { status: 400, message: 'Violação de constraint de relacionamento' },
      'P2021': { status: 404, message: 'Tabela não encontrada' },
      'P2022': { status: 404, message: 'Coluna não encontrada' },
      'DATABASE_ERROR': { status: 500, message: 'Erro no banco de dados' }
    };

    // Verificar se é erro do Prisma
    if (error.code && prismaErrorMap[error.code]) {
      const mappedError = prismaErrorMap[error.code];
      console.error(`[concluirExercicio Controller] [${requestId}] Erro Prisma mapeado:`, {
        code: error.code,
        status: mappedError.status,
        originalMessage: error.message
      });
      
      return res.status(mappedError.status).json({
        error: mappedError.message,
        message: error.message || mappedError.message,
        code: error.code,
        requestId
      });
    }

    // Erros de validação (400)
    if (error.message && (
      error.message.includes('inválido') ||
      error.message.includes('obrigatório') ||
      error.message.includes('deve ser') ||
      error.message.includes('não pode') ||
      error.message.includes('simultaneamente')
    )) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: error.message,
        requestId
      });
    }

    // Erro de não encontrado (404)
    if (error.message && (
      error.message.includes('não encontrado') ||
      error.message.includes('not found') ||
      error.code === 'P2025'
    )) {
      return res.status(404).json({
        error: 'Exercício não encontrado',
        message: error.message || 'O exercício solicitado não foi encontrado',
        requestId
      });
    }
    
    // Erro de permissão (403)
    if (error.message && (
      error.message.includes('permissão') ||
      error.message.includes('permission') ||
      error.message.includes('Permissão') ||
      error.message.includes('não autorizado') ||
      error.message.includes('unauthorized')
    )) {
      return res.status(403).json({
        error: 'Sem permissão',
        message: error.message || 'Você não tem permissão para realizar esta ação',
        requestId
      });
    }

    // Erro de autenticação (401)
    if (error.message && (
      error.message.includes('autenticado') ||
      error.message.includes('autenticação') ||
      error.message.includes('token') ||
      error.message.includes('authentication')
    )) {
      return res.status(401).json({
        error: 'Não autenticado',
        message: error.message || 'Token de autenticação inválido ou ausente',
        requestId
      });
    }

    // Erro genérico do servidor (500)
    console.error(`[concluirExercicio Controller] [${requestId}] Erro não mapeado, retornando 500:`, errorContext);
    
    res.status(500).json({
      error: 'Erro ao atualizar status do exercício',
      message: error.message || 'Erro interno do servidor',
      requestId,
      ...(process.env.NODE_ENV === 'development' && {
        details: error.stack,
        code: error.code,
        name: error.name
      })
    });
  }
};

export const concluirTreino = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        error: 'ID do treino é obrigatório'
      })
    }

    const treinoAtualizado = await treinoService.concluirTreino(id, userId)

    res.json({
      message: 'Treino concluído com sucesso',
      treino: treinoAtualizado
    })
  } catch (error: any) {
    console.error('Erro ao concluir treino:', error)
    res.status(500).json({
      error: 'Erro ao concluir treino',
      message: error.message
    })
  }
}

// Gerar versão alternativa do treino (peso corporal)
export const gerarVersaoAlternativa = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { treinoId } = req.body;

    if (!treinoId) {
      return res.status(400).json({
        error: 'ID do treino é obrigatório'
      });
    }

    const treinoAtualizado = await treinoService.gerarVersaoAlternativa(treinoId, userId);

    res.json({
      message: 'Versão alternativa gerada com sucesso',
      treino: treinoAtualizado
    });
  } catch (error: any) {
    console.error('Erro ao gerar versão alternativa:', error);
    res.status(500).json({
      error: 'Erro ao gerar versão alternativa',
      message: error.message
    });
  }
};

// Buscar treinos com filtros (dataInicio, dataFim, etc)
export const buscarTreinos = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const { dataInicio, dataFim, concluido, tipo, modoTreino, limite } = req.query

    const { buscarTreinosComFiltros } = await import('../services/treino-query.service')

    const filtros: any = {}
    // SEGURANÇA: Validar formatos de data
    if (dataInicio) {
      const parsedDate = parseAndValidateDate(dataInicio);
      if (!parsedDate) {
        return res.status(400).json({
          error: 'Data de início inválida. Use o formato ISO (ex: 2024-12-20)'
        });
      }
      filtros.dataInicio = parsedDate;
    }
    if (dataFim) {
      const parsedDate = parseAndValidateDate(dataFim);
      if (!parsedDate) {
        return res.status(400).json({
          error: 'Data de fim inválida. Use o formato ISO (ex: 2024-12-20)'
        });
      }
      filtros.dataFim = parsedDate;
    }
    if (concluido !== undefined) filtros.concluido = concluido === 'true'
    if (tipo) filtros.tipo = tipo as string
    if (modoTreino) filtros.modoTreino = modoTreino as 'IA' | 'MANUAL'
    // SEGURANÇA: Validar e limitar máximo de treinos retornados
    if (limite) {
      const limiteNum = parseInt(limite as string, 10);
      if (!isNaN(limiteNum) && limiteNum > 0) {
        filtros.limite = Math.min(limiteNum, 100); // Limitar máximo a 100 para prevenir DoS
      }
    }

    const treinos = await buscarTreinosComFiltros(userId, filtros, {
      exercicios: true,
      exercicioDetalhes: true
    })

    res.json(treinos)
  } catch (error: any) {
    console.error('Erro ao buscar treinos:', error)
    res.status(500).json({
      error: 'Erro ao buscar treinos',
      message: error.message
    })
  }
}

// Buscar alternativas de exercício
export const obterAlternativas = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { equipamentos } = req.query;

    const equipamentosArray = equipamentos
      ? (equipamentos as string).split(',')
      : undefined;

    const resultado = await treinoService.obterAlternativas(id, equipamentosArray);

    res.json(resultado);
  } catch (error: any) {
    console.error('Erro ao buscar alternativas:', error);
    res.status(500).json({
      error: 'Erro ao buscar alternativas',
      message: error.message
    });
  }
};

export const obterHomeTreinos = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const resumo = await obterResumoTreinos(userId);
    res.json(resumo);
  } catch (error: any) {
    console.error('Erro ao obter resumo de treinos:', error);
    res.status(500).json({
      error: 'Erro ao buscar dados da home de treinos',
      message: error.message
    });
  }
};

export const obterPlanoAtual = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const plano = await buscarPlanoAtual(userId);
    res.json(plano);
  } catch (error: any) {
    console.error('Erro ao obter plano atual:', error);
    res.status(500).json({
      error: 'Erro ao buscar plano atual',
      message: error.message
    });
  }
};

// Substituir exercício por alternativa
export const substituirExercicio = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { exercicioAlternativoId } = req.body;

    if (!exercicioAlternativoId) {
      return res.status(400).json({
        error: 'ID do exercício alternativo é obrigatório'
      });
    }

    const exercicioAtualizado = await treinoService.substituirExercicio(
      id,
      exercicioAlternativoId
    );

    res.json({
      message: 'Exercício substituído com sucesso',
      exercicioTreino: exercicioAtualizado
    });
  } catch (error: any) {
    console.error('Erro ao substituir exercício:', error);
    res.status(500).json({
      error: 'Erro ao substituir exercício',
      message: error.message
    });
  }
};

// Buscar histórico de treinos
export const buscarHistorico = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { limite } = req.query;

    const limiteNum = limite ? parseInt(limite as string) : 30;
    const { buscarHistoricoTreinosComFiltros } = await import('../services/treino-query.service');
    const historico = await buscarHistoricoTreinosComFiltros(userId, limiteNum);

    res.json(historico);
  } catch (error: any) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      error: 'Erro ao buscar histórico',
      message: error.message
    });
  }
};

// Buscar estatísticas de progresso
export const buscarEstatisticas = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { dias } = req.query;

    const diasNum = dias ? parseInt(dias as string) : 30;
    const estatisticas = await progressaoService.calcularEstatisticasProgresso(
      userId,
      diasNum
    );

    res.json(estatisticas);
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro ao buscar estatísticas',
      message: error.message
    });
  }
};

// Buscar treinos semanais
export const buscarTreinosSemanais = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { buscarTreinosSemanaisComFiltros } = await import('../services/treino-query.service');
    
    // Buscar modo de treino do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { modoTreino: true }
    });
    const modoTreino = (user?.modoTreino || 'IA') as 'IA' | 'MANUAL';
    
    let treinos = await buscarTreinosSemanaisComFiltros(userId, undefined, modoTreino);

    // Filtrar apenas treinos com exercícios
    treinos = treinos.filter(t => t.exercicios && t.exercicios.length > 0);

    res.json({
      treinos,
      total: treinos.length
    });
  } catch (error: any) {
    console.error('Erro ao buscar treinos semanais:', error);
    res.status(500).json({
      error: 'Erro ao buscar treinos semanais',
      message: error.message
    });
  }
};

