import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import * as treinoService from '../services/treino.service';
import * as progressaoService from '../services/progressao.service';

// Gerar treino do dia
export const gerarTreinoDoDia = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { data, gerarSemana } = req.body;

    // Se gerarSemana for true, gerar treinos para toda a semana
    if (gerarSemana) {
      // Usar gerarTreinos30Dias que gera treinos para 30 dias (inclui a semana)
      const treinos = await treinoService.gerarTreinos30Dias(userId);
      // Filtrar apenas os treinos da semana atual
      const hoje = new Date();
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay()); // Domingo
      inicioSemana.setHours(0, 0, 0, 0);
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(inicioSemana.getDate() + 6); // Sábado
      fimSemana.setHours(23, 59, 59, 999);
      
      const treinosSemana = treinos.filter((t: any) => {
        const dataTreino = new Date(t.data);
        return dataTreino >= inicioSemana && dataTreino <= fimSemana;
      });
      
      return res.status(201).json({
        message: 'Treinos da semana gerados com sucesso',
        treinos: treinosSemana
      });
    }

    const dataTreino = data ? new Date(data) : new Date();
    const treino = await treinoService.gerarTreinoDoDia(userId, dataTreino);

    res.status(201).json({
      message: 'Treino gerado com sucesso',
      treino
    });
  } catch (error: any) {
    console.error('❌ Erro ao gerar treino:', error);
    console.error('📋 Detalhes do erro:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      userId: req.userId
    });
    
    // Verificar tipo de erro para mensagem mais específica
    let errorMessage = error.message || 'Erro ao gerar treino';
    
    if (error.message?.includes('Perfil não encontrado')) {
      return res.status(404).json({
        error: 'Perfil não encontrado',
        message: 'Complete o onboarding primeiro antes de gerar treinos.'
      });
    }
    
    if (error.message?.includes('frequência semanal') || error.message?.includes('experiência')) {
      return res.status(400).json({
        error: 'Dados do perfil incompletos',
        message: 'Seu perfil precisa estar completo para gerar treinos. Verifique frequência semanal, experiência e objetivo.'
      });
    }
    
    res.status(500).json({
      error: 'Erro ao gerar treino',
      message: errorMessage
    });
  }
};

// Buscar treino do dia
export const buscarTreinoDoDia = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { data } = req.query;

    let dataTreino: Date | undefined;
    if (data) {
      dataTreino = new Date(data as string);
    }
    
    const resultado = await treinoService.buscarTreinoDoDia(userId, dataTreino);

    if (!resultado) {
      return res.status(404).json({
        error: 'Treino não encontrado',
        message: 'Gere um treino para esta data primeiro'
      });
    }

    // Se for array, significa que há múltiplos treinos
    if (Array.isArray(resultado)) {
      return res.json({
        treinos: resultado,
        total: resultado.length,
        multiplos: true
      });
    }

    // Se for um único treino, retornar diretamente (compatibilidade)
    res.json(resultado);
  } catch (error: any) {
    console.error('Erro ao buscar treino:', error);
    res.status(500).json({
      error: 'Erro ao buscar treino',
      message: error.message
    });
  }
};

// Concluir ou desmarcar exercício
export const concluirExercicio = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { rpeRealizado, feedbackSimples, aceitouAjuste, concluido } = req.body || {};

    console.log('[concluirExercicio Controller] Iniciando requisição:', {
      userId,
      exercicioId: id,
      body: { rpeRealizado, feedbackSimples, aceitouAjuste, concluido }
    });

    // Validar ID do exercício
    if (!id || typeof id !== 'string') {
      console.error('[concluirExercicio Controller] ID inválido:', id);
      return res.status(400).json({
        error: 'ID do exercício é obrigatório',
        message: 'O ID do exercício deve ser fornecido'
      });
    }

    // Validar userId
    if (!userId) {
      console.error('[concluirExercicio Controller] userId não encontrado');
      return res.status(401).json({
        error: 'Usuário não autenticado',
        message: 'Token de autenticação inválido ou ausente'
      });
    }

    // Se concluido não for especificado, assume true (comportamento padrão)
    const estaConcluido = concluido !== undefined ? concluido : true;

    console.log('[concluirExercicio Controller] Chamando service com:', {
      exercicioId: id,
      userId,
      estaConcluido
    });

    const exercicioTreino = await treinoService.concluirExercicio(
      id,
      userId,
      rpeRealizado || undefined,
      feedbackSimples || undefined,
      aceitouAjuste !== undefined ? aceitouAjuste : null,
      estaConcluido
    );

    console.log('[concluirExercicio Controller] Sucesso - exercício atualizado');

    res.json({
      message: estaConcluido ? 'Exercício concluído com sucesso' : 'Exercício desmarcado com sucesso',
      exercicioTreino
    });
  } catch (error: any) {
    console.error('[concluirExercicio Controller] Erro completo:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    // Retornar erro apropriado baseado no tipo
    if (error.message === 'Exercício não encontrado' || error.message.includes('não encontrado')) {
      return res.status(404).json({
        error: 'Exercício não encontrado',
        message: error.message
      });
    }
    
    if (error.message.includes('permissão') || error.message.includes('permission') || error.message.includes('Permissão')) {
      return res.status(403).json({
        error: 'Sem permissão',
        message: error.message
      });
    }

    // Erro genérico do servidor
    res.status(500).json({
      error: 'Erro ao atualizar status do exercício',
      message: error.message || 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

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

    // Se não houver treinos com exercícios, gerar automaticamente
    if (treinos.length === 0) {
      console.log('📋 Nenhum treino com exercícios encontrado. Gerando treinos semanais automaticamente...');
      try {
        // Deletar treinos sem exercícios primeiro
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const fimSemana = new Date(hoje);
        fimSemana.setDate(hoje.getDate() + 7);
        fimSemana.setHours(23, 59, 59, 999);

        await prisma.treino.deleteMany({
          where: {
            userId,
            data: { gte: hoje, lte: fimSemana }
          }
        });

        // Gerar novos treinos
        await treinoService.gerarTreinos30Dias(userId);
        treinos = await treinoService.buscarTreinosSemanais(userId);
        
        // Filtrar novamente apenas treinos com exercícios
        treinos = treinos.filter(t => t.exercicios && t.exercicios.length > 0);
        
        console.log(`✅ ${treinos.length} treinos gerados e carregados`);
      } catch (error: any) {
        console.error('⚠️ Erro ao gerar treinos automaticamente:', error);
        console.error('Stack:', error.stack);
      }
    }

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

