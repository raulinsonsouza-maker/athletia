import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as treinoPersonalizadoService from '../services/treino-personalizado.service';

// Criar treino personalizado
export const criarTreinoPersonalizado = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { data, nome, exercicios } = req.body;

    if (!data) {
      return res.status(400).json({
        error: 'Data é obrigatória'
      });
    }

    if (!exercicios || !Array.isArray(exercicios) || exercicios.length === 0) {
      return res.status(400).json({
        error: 'Treino deve ter pelo menos um exercício'
      });
    }

    const { diaSemana, recorrente, letraTreino } = req.body;

    const treino = await treinoPersonalizadoService.criarTreinoPersonalizado(userId, {
      data: new Date(data),
      nome,
      exercicios,
      diaSemana: diaSemana !== undefined ? parseInt(diaSemana) : undefined,
      recorrente: recorrente || false,
      letraTreino: letraTreino || undefined
    });

    res.status(201).json({
      message: 'Treino personalizado criado com sucesso',
      treino
    });
  } catch (error: any) {
    console.error('Erro ao criar treino personalizado:', error);
    res.status(500).json({
      error: 'Erro ao criar treino personalizado',
      message: error.message
    });
  }
};

// Listar treinos personalizados
export const listarTreinosPersonalizados = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { dataInicio, dataFim, concluido } = req.query;

    const filtros: any = {};
    if (dataInicio) filtros.dataInicio = new Date(dataInicio as string);
    if (dataFim) filtros.dataFim = new Date(dataFim as string);
    if (concluido !== undefined) filtros.concluido = concluido === 'true';

    const treinos = await treinoPersonalizadoService.listarTreinosPersonalizados(userId, filtros);

    res.json({
      treinos,
      total: treinos.length
    });
  } catch (error: any) {
    console.error('Erro ao listar treinos personalizados:', error);
    res.status(500).json({
      error: 'Erro ao listar treinos personalizados',
      message: error.message
    });
  }
};

// Buscar treino personalizado específico
export const buscarTreinoPersonalizado = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const treino = await treinoPersonalizadoService.buscarTreinoPersonalizado(userId, id);

    res.json(treino);
  } catch (error: any) {
    console.error('Erro ao buscar treino personalizado:', error);
    if (error.message === 'Treino não encontrado') {
      return res.status(404).json({
        error: error.message
      });
    }
    res.status(500).json({
      error: 'Erro ao buscar treino personalizado',
      message: error.message
    });
  }
};

// Editar treino personalizado
export const editarTreinoPersonalizado = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { nome, data, exercicios } = req.body;

    const treino = await treinoPersonalizadoService.editarTreinoPersonalizado(userId, id, {
      nome,
      data: data ? new Date(data) : undefined,
      exercicios
    });

    res.json({
      message: 'Treino personalizado atualizado com sucesso',
      treino
    });
  } catch (error: any) {
    console.error('Erro ao editar treino personalizado:', error);
    if (error.message === 'Treino não encontrado') {
      return res.status(404).json({
        error: error.message
      });
    }
    res.status(500).json({
      error: 'Erro ao editar treino personalizado',
      message: error.message
    });
  }
};

// Deletar treino personalizado
export const deletarTreinoPersonalizado = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    await treinoPersonalizadoService.deletarTreinoPersonalizado(userId, id);

    res.json({
      message: 'Treino personalizado deletado com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao deletar treino personalizado:', error);
    if (error.message === 'Treino não encontrado') {
      return res.status(404).json({
        error: error.message
      });
    }
    res.status(500).json({
      error: 'Erro ao deletar treino personalizado',
      message: error.message
    });
  }
};

// Duplicar treino personalizado
export const duplicarTreinoPersonalizado = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        error: 'Data é obrigatória para duplicar treino'
      });
    }

    const treino = await treinoPersonalizadoService.duplicarTreinoPersonalizado(
      userId,
      id,
      new Date(data)
    );

    res.status(201).json({
      message: 'Treino duplicado com sucesso',
      treino
    });
  } catch (error: any) {
    console.error('Erro ao duplicar treino personalizado:', error);
    if (error.message === 'Treino não encontrado') {
      return res.status(404).json({
        error: error.message
      });
    }
    res.status(500).json({
      error: 'Erro ao duplicar treino personalizado',
      message: error.message
    });
  }
};

// Criar template personalizado
export const criarTemplatePersonalizado = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { nome, descricao, exercicios } = req.body;

    if (!nome) {
      return res.status(400).json({
        error: 'Nome do template é obrigatório'
      });
    }

    if (!exercicios || !Array.isArray(exercicios) || exercicios.length === 0) {
      return res.status(400).json({
        error: 'Template deve ter pelo menos um exercício'
      });
    }

    const template = await treinoPersonalizadoService.criarTemplatePersonalizado(userId, {
      nome,
      descricao,
      exercicios
    });

    res.status(201).json({
      message: 'Template criado com sucesso',
      template
    });
  } catch (error: any) {
    console.error('Erro ao criar template personalizado:', error);
    res.status(500).json({
      error: 'Erro ao criar template personalizado',
      message: error.message
    });
  }
};

// Listar templates personalizados
export const listarTemplatesPersonalizados = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const templates = await treinoPersonalizadoService.listarTemplatesPersonalizados(userId);

    res.json({
      templates,
      total: templates.length
    });
  } catch (error: any) {
    console.error('Erro ao listar templates personalizados:', error);
    res.status(500).json({
      error: 'Erro ao listar templates personalizados',
      message: error.message
    });
  }
};

// Buscar template personalizado específico
export const buscarTemplatePersonalizado = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const template = await treinoPersonalizadoService.buscarTemplatePersonalizado(userId, id);

    res.json(template);
  } catch (error: any) {
    console.error('Erro ao buscar template personalizado:', error);
    if (error.message === 'Template não encontrado') {
      return res.status(404).json({
        error: error.message
      });
    }
    res.status(500).json({
      error: 'Erro ao buscar template personalizado',
      message: error.message
    });
  }
};

// Editar template personalizado
export const editarTemplatePersonalizado = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { nome, descricao, exercicios } = req.body;

    const template = await treinoPersonalizadoService.editarTemplatePersonalizado(userId, id, {
      nome,
      descricao,
      exercicios
    });

    res.json({
      message: 'Template atualizado com sucesso',
      template
    });
  } catch (error: any) {
    console.error('Erro ao editar template personalizado:', error);
    if (error.message === 'Template não encontrado') {
      return res.status(404).json({
        error: error.message
      });
    }
    res.status(500).json({
      error: 'Erro ao editar template personalizado',
      message: error.message
    });
  }
};

// Deletar template personalizado
export const deletarTemplatePersonalizado = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    await treinoPersonalizadoService.deletarTemplatePersonalizado(userId, id);

    res.json({
      message: 'Template deletado com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao deletar template personalizado:', error);
    if (error.message === 'Template não encontrado') {
      return res.status(404).json({
        error: error.message
      });
    }
    res.status(500).json({
      error: 'Erro ao deletar template personalizado',
      message: error.message
    });
  }
};

// Aplicar template personalizado
export const aplicarTemplatePersonalizado = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        error: 'Data é obrigatória para aplicar template'
      });
    }

    const treino = await treinoPersonalizadoService.aplicarTemplatePersonalizado(
      userId,
      id,
      new Date(data)
    );

    res.status(201).json({
      message: 'Template aplicado com sucesso',
      treino
    });
  } catch (error: any) {
    console.error('Erro ao aplicar template personalizado:', error);
    if (error.message === 'Template não encontrado') {
      return res.status(404).json({
        error: error.message
      });
    }
    res.status(500).json({
      error: 'Erro ao aplicar template personalizado',
      message: error.message
    });
  }
};

// Listar treinos recorrentes (A-G)
export const listarTreinosRecorrentes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const treinos = await treinoPersonalizadoService.listarTreinosRecorrentes(userId);

    res.json({
      treinos,
      total: treinos.filter(t => t !== null).length
    });
  } catch (error: any) {
    console.error('Erro ao listar treinos recorrentes:', error);
    res.status(500).json({
      error: 'Erro ao listar treinos recorrentes',
      message: error.message
    });
  }
};

// Buscar treino recorrente específico
export const buscarTreinoRecorrente = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { letra } = req.params;

    const treino = await treinoPersonalizadoService.buscarTreinoRecorrente(userId, letra);

    if (!treino) {
      return res.status(404).json({
        error: 'Treino recorrente não encontrado'
      });
    }

    res.json(treino);
  } catch (error: any) {
    console.error('Erro ao buscar treino recorrente:', error);
    res.status(500).json({
      error: 'Erro ao buscar treino recorrente',
      message: error.message
    });
  }
};

// Criar ou editar treino recorrente
export const criarOuEditarTreinoRecorrente = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { letraTreino, nome, diaSemana, exercicios } = req.body;

    if (!letraTreino) {
      return res.status(400).json({
        error: 'Letra do treino é obrigatória'
      });
    }

    if (!nome) {
      return res.status(400).json({
        error: 'Nome do treino é obrigatório'
      });
    }

    if (diaSemana === undefined || diaSemana === null) {
      return res.status(400).json({
        error: 'Dia da semana é obrigatório'
      });
    }

    if (!exercicios || !Array.isArray(exercicios) || exercicios.length === 0) {
      return res.status(400).json({
        error: 'Treino deve ter pelo menos um exercício'
      });
    }

    const treino = await treinoPersonalizadoService.criarOuEditarTreinoRecorrente(userId, {
      letraTreino,
      nome,
      diaSemana: parseInt(diaSemana),
      exercicios
    });

    res.status(201).json({
      message: 'Treino recorrente salvo com sucesso',
      treino
    });
  } catch (error: any) {
    console.error('Erro ao criar/editar treino recorrente:', error);
    res.status(500).json({
      error: 'Erro ao criar/editar treino recorrente',
      message: error.message
    });
  }
};

// Aplicar treino recorrente em data específica
export const aplicarTreinoRecorrente = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { letra } = req.params;
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        error: 'Data é obrigatória para aplicar treino recorrente'
      });
    }

    const treino = await treinoPersonalizadoService.aplicarTreinoRecorrente(
      userId,
      letra,
      new Date(data)
    );

    res.status(201).json({
      message: 'Treino recorrente aplicado com sucesso',
      treino
    });
  } catch (error: any) {
    console.error('Erro ao aplicar treino recorrente:', error);
    if (error.message.includes('não encontrado')) {
      return res.status(404).json({
        error: error.message
      });
    }
    res.status(500).json({
      error: 'Erro ao aplicar treino recorrente',
      message: error.message
    });
  }
};

// Buscar configuração de treino padrão
export const buscarConfiguracaoTreinoPadrao = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const configuracoes = await treinoPersonalizadoService.buscarConfiguracaoTreinoPadrao(userId);

    res.json({
      configuracoes,
      total: configuracoes.length
    });
  } catch (error: any) {
    console.error('Erro ao buscar configuração de treino padrão:', error);
    res.status(500).json({
      error: 'Erro ao buscar configuração de treino padrão',
      message: error.message
    });
  }
};

// Salvar configuração de treino padrão
export const configurarTreinoPadrao = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { diaSemana, tipoTreino, letraTreino } = req.body;

    if (diaSemana === undefined || diaSemana === null) {
      return res.status(400).json({
        error: 'Dia da semana é obrigatório'
      });
    }

    if (!tipoTreino || !['IA', 'RECORRENTE'].includes(tipoTreino)) {
      return res.status(400).json({
        error: 'Tipo de treino deve ser IA ou RECORRENTE'
      });
    }

    const configuracao = await treinoPersonalizadoService.configurarTreinoPadrao(userId, {
      diaSemana: parseInt(diaSemana),
      tipoTreino,
      letraTreino
    });

    res.json({
      message: 'Configuração salva com sucesso',
      configuracao
    });
  } catch (error: any) {
    console.error('Erro ao configurar treino padrão:', error);
    res.status(500).json({
      error: 'Erro ao configurar treino padrão',
      message: error.message
    });
  }
};

// Remover configuração de treino padrão
export const removerConfiguracaoTreinoPadrao = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { diaSemana } = req.params;

    if (!diaSemana) {
      return res.status(400).json({
        error: 'Dia da semana é obrigatório'
      });
    }

    await treinoPersonalizadoService.removerConfiguracaoTreinoPadrao(
      userId,
      parseInt(diaSemana)
    );

    res.json({
      message: 'Configuração removida com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao remover configuração de treino padrão:', error);
    res.status(500).json({
      error: 'Erro ao remover configuração de treino padrão',
      message: error.message
    });
  }
};

