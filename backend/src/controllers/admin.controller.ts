import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import { sincronizarGruposDoExercicio } from '../services/grupo-muscular.service';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { slugify } from '../utils/slugify';
import { ACCEPTED_EXTENSIONS } from '../utils/file-validation';
import { toUserAdminDTO, sanitizeString, isValidUUID, isValidEmail } from '../utils/dto';

// Listar todos os usuários
export const listarUsuarios = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { nome: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // CORREÇÃO: Validar e limitar paginação
    const maxLimit = 100;
    const finalLimit = Math.min(limitNum, maxLimit);
    const finalSkip = Math.max(0, skip);

    // CORREÇÃO: Sanitizar search para prevenir injection
    if (search) {
      const searchSanitized = sanitizeString(search as string, 100);
      if (searchSanitized) {
        where.OR = [
          { email: { contains: searchSanitized, mode: 'insensitive' } },
          { nome: { contains: searchSanitized, mode: 'insensitive' } }
        ];
      }
    }

    const [usuarios, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: finalSkip,
        take: finalLimit,
        select: {
          id: true,
          email: true,
          nome: true,
          telefone: true,
          role: true,
          plano: true,
          planoAtivo: true,
          dataPagamento: true,
          createdAt: true,
          updatedAt: true,
          perfil: {
            select: {
              objetivo: true,
              experiencia: true,
              pesoAtual: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({ where })
    ]);

    // CORREÇÃO: Usar DTOs para não vazar dados sensíveis
    const usuariosDTO = usuarios.map(toUserAdminDTO);

    res.json({
      usuarios: usuariosDTO,
      paginacao: {
        pagina: pageNum,
        limite: finalLimit,
        total,
        totalPaginas: Math.ceil(total / finalLimit)
      }
    });
  } catch (error: any) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      error: 'Erro ao listar usuários',
      message: error.message
    });
  }
};

// Criar novo usuário
// CORREÇÃO PROBLEMA 4: Role sempre 'USER', ignorar role do client
export const criarUsuario = async (req: AuthRequest, res: Response) => {
  try {
    const { email, senha, nome } = req.body;

    // CORREÇÃO: Validações rigorosas
    if (!email || !senha) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios'
      });
    }

    // Sanitizar e validar email
    const emailSanitized = sanitizeString(email, 255);
    if (!emailSanitized || !isValidEmail(emailSanitized)) {
      return res.status(400).json({
        error: 'Email inválido'
      });
    }

    // Validar senha
    if (senha.length < 6 || senha.length > 128) {
      return res.status(400).json({
        error: 'Senha deve ter entre 6 e 128 caracteres'
      });
    }

    // Normalizar email
    const emailNormalizado = emailSanitized.trim().toLowerCase();

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: emailNormalizado }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Email já cadastrado'
      });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // CORREÇÃO CRÍTICA: Role sempre 'USER', NUNCA aceitar do client
    // Apenas admins podem criar outros admins (via endpoint separado se necessário)
    const role = 'USER';

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: emailNormalizado,
        senhaHash,
        nome: nome?.trim() || null,
        role // Sempre USER, ignorar qualquer role enviado pelo client
      },
      select: {
        id: true,
        email: true,
        nome: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user
    });
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      error: 'Erro ao criar usuário',
      message: error.message
    });
  }
};

// Atualizar usuário
// CORREÇÃO: Validar role e prevenir role escalation
export const atualizarUsuario = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, role } = req.body;

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Preparar dados para atualização
    const data: any = {};
    if (nome !== undefined) {
      const nomeTrimmed = nome?.trim();
      data.nome = nomeTrimmed || null;
    }
    
    // CORREÇÃO: Validar role se fornecido
    if (role !== undefined) {
      // Apenas roles válidas
      if (role !== 'USER' && role !== 'ADMIN') {
        return res.status(400).json({
          error: 'Role inválida. Valores aceitos: USER, ADMIN'
        });
      }
      // Apenas admins podem alterar roles (já verificado pelo middleware, mas double-check)
      if (req.userRole !== 'ADMIN') {
        return res.status(403).json({
          error: 'Apenas administradores podem alterar roles'
        });
      }
      data.role = role;
    }

    // Atualizar usuário
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        nome: true,
        role: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Usuário atualizado com sucesso',
      user
    });
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      error: 'Erro ao atualizar usuário',
      message: error.message
    });
  }
};

// Desativar usuário (soft delete - podemos adicionar campo ativo depois)
export const desativarUsuario = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Por enquanto, apenas retornar sucesso
    // Podemos adicionar campo 'ativo' no schema depois
    res.json({
      message: 'Usuário desativado com sucesso',
      userId: id
    });
  } catch (error: any) {
    console.error('Erro ao desativar usuário:', error);
    res.status(500).json({
      error: 'Erro ao desativar usuário',
      message: error.message
    });
  }
};

// Obter detalhes completos de um usuário
export const obterDetalhesUsuario = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar usuário com todos os dados relacionados
    const usuario = await prisma.user.findUnique({
      where: { id },
      include: {
        perfil: true,
        historicoPesos: {
          orderBy: {
            data: 'desc'
          },
          take: 30 // Últimos 30 registros
        },
        treinos: {
          include: {
            exercicios: {
              include: {
                exercicio: true
              }
            }
          },
          orderBy: {
            data: 'asc'
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Separar treinos em próximos e passados
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const treinosProximos = usuario.treinos.filter(t => {
      const dataTreino = new Date(t.data);
      dataTreino.setHours(0, 0, 0, 0);
      return dataTreino >= hoje;
    }).slice(0, 5); // Próximos 5

    const treinosPassados = usuario.treinos.filter(t => {
      const dataTreino = new Date(t.data);
      dataTreino.setHours(0, 0, 0, 0);
      return dataTreino < hoje;
    }).slice(0, 10); // Últimos 10

    // Calcular estatísticas
    const totalTreinos = usuario.treinos.length;
    const treinosConcluidos = usuario.treinos.filter(t => t.concluido).length;
    const treinosPendentes = totalTreinos - treinosConcluidos;
    const taxaConclusao = totalTreinos > 0 ? (treinosConcluidos / totalTreinos) * 100 : 0;

    // Histórico de peso
    const historicoPeso = usuario.historicoPesos.map(h => ({
      id: h.id,
      peso: h.peso,
      data: h.data
    }));

    const pesoInicial = historicoPeso.length > 0 ? historicoPeso[historicoPeso.length - 1].peso : null;
    const pesoAtual = historicoPeso.length > 0 ? historicoPeso[0].peso : null;
    const variacaoPeso = pesoInicial && pesoAtual ? pesoAtual - pesoInicial : null;

    // Estruturar resposta
    const response = {
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        telefone: usuario.telefone,
        dataNascimento: usuario.dataNascimento,
        role: usuario.role,
        plano: usuario.plano,
        planoAtivo: usuario.planoAtivo,
        dataPagamento: usuario.dataPagamento,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt
      },
      perfil: usuario.perfil ? {
        idade: usuario.perfil.idade,
        sexo: usuario.perfil.sexo,
        altura: usuario.perfil.altura,
        pesoAtual: usuario.perfil.pesoAtual,
        percentualGordura: usuario.perfil.percentualGordura,
        tipoCorpo: usuario.perfil.tipoCorpo,
        experiencia: usuario.perfil.experiencia,
        objetivo: usuario.perfil.objetivo,
        frequenciaSemanal: usuario.perfil.frequenciaSemanal,
        tempoDisponivel: usuario.perfil.tempoDisponivel,
        localTreino: usuario.perfil.localTreino,
        lesoes: usuario.perfil.lesoes,
        preferencias: usuario.perfil.preferencias,
        problemasAnteriores: usuario.perfil.problemasAnteriores,
        objetivosAdicionais: usuario.perfil.objetivosAdicionais
      } : null,
      historicoPeso: historicoPeso,
      treinos: {
        proximos: treinosProximos.map(t => ({
          id: t.id,
          tipo: t.tipo,
          data: t.data,
          concluido: t.concluido,
          numeroExercicios: t.exercicios.length,
          tempoEstimado: t.tempoEstimado || 0
        })),
        passados: treinosPassados.map(t => ({
          id: t.id,
          tipo: t.tipo,
          data: t.data,
          concluido: t.concluido,
          numeroExercicios: t.exercicios.length,
          tempoEstimado: t.tempoEstimado || 0
        }))
      },
      estatisticas: {
        totalTreinos,
        treinosConcluidos,
        treinosPendentes,
        taxaConclusao: Math.round(taxaConclusao * 100) / 100,
        pesoInicial,
        pesoAtual,
        variacaoPeso: variacaoPeso !== null ? Math.round(variacaoPeso * 100) / 100 : null
      }
    };

    res.json(response);
  } catch (error: any) {
    console.error('Erro ao obter detalhes do usuário:', error);
    res.status(500).json({
      error: 'Erro ao obter detalhes do usuário',
      message: error.message
    });
  }
};

// Obter estatísticas gerais
export const obterEstatisticas = async (req: AuthRequest, res: Response) => {
  try {
    // Preços dos planos
    const PRECOS = {
      MENSAL: 19.90,
      TRIMESTRAL: 39.90,
      SEMESTRAL: 79.90
    };

    // Buscar dados básicos
    const [
      totalUsuarios,
      totalAdmins,
      totalTreinos,
      totalExercicios,
      usuariosComPerfil,
      usuariosComPlanoAtivo,
      usuariosSemPerfil,
      usuariosComPlanoSemPerfil,
      usuariosComPerfilSemPlano
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.treino.count(),
      prisma.exercicio.count({ where: { ativo: true } }),
      prisma.perfil.count(),
      prisma.user.count({ where: { planoAtivo: true } }),
      prisma.user.count({ 
        where: { 
          perfil: null,
          role: 'USER'
        } 
      }),
      prisma.user.count({
        where: {
          planoAtivo: true,
          perfil: null,
          role: 'USER'
        }
      }),
      prisma.user.count({
        where: {
          perfil: { isNot: null },
          planoAtivo: false,
          role: 'USER'
        }
      })
    ]);

    // Buscar distribuição de planos
    const [planosMensal, planosTrimestral, planosSemestral] = await Promise.all([
      prisma.user.count({ where: { plano: 'MENSAL', planoAtivo: true } }),
      prisma.user.count({ where: { plano: 'TRIMESTRAL', planoAtivo: true } }),
      prisma.user.count({ where: { plano: 'SEMESTRAL', planoAtivo: true } })
    ]);

    // Calcular receitas
    const receitaMensal = planosMensal * PRECOS.MENSAL;
    const receitaTrimestral = planosTrimestral * PRECOS.TRIMESTRAL;
    const receitaSemestral = planosSemestral * PRECOS.SEMESTRAL;
    const receitaTotal = receitaMensal + receitaTrimestral + receitaSemestral;

    // Receita mensal (mês atual) - considerar apenas planos ativos no mês atual
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const usuariosComPagamentoMes = await prisma.user.count({
      where: {
        planoAtivo: true,
        dataPagamento: {
          gte: inicioMes
        }
      }
    });

    // Calcular receita do mês atual baseado em pagamentos do mês
    const usuariosPagamentoMensal = await prisma.user.count({
      where: {
        plano: 'MENSAL',
        planoAtivo: true,
        dataPagamento: { gte: inicioMes }
      }
    });
    const usuariosPagamentoTrimestral = await prisma.user.count({
      where: {
        plano: 'TRIMESTRAL',
        planoAtivo: true,
        dataPagamento: { gte: inicioMes }
      }
    });
    const usuariosPagamentoSemestral = await prisma.user.count({
      where: {
        plano: 'SEMESTRAL',
        planoAtivo: true,
        dataPagamento: { gte: inicioMes }
      }
    });

    const receitaMesAtual = 
      (usuariosPagamentoMensal * PRECOS.MENSAL) +
      (usuariosPagamentoTrimestral * PRECOS.TRIMESTRAL) +
      (usuariosPagamentoSemestral * PRECOS.SEMESTRAL);

    // Taxa de conclusão de treinos
    const treinosConcluidos = await prisma.treino.count({
      where: { concluido: true }
    });
    const taxaConclusaoTreinos = totalTreinos > 0 
      ? (treinosConcluidos / totalTreinos) * 100 
      : 0;

    // Taxa de conversão (usuários com plano ativo / total de usuários)
    const usuariosNormais = totalUsuarios - totalAdmins;
    const taxaConversao = usuariosNormais > 0 
      ? (usuariosComPlanoAtivo / usuariosNormais) * 100 
      : 0;

    res.json({
      usuarios: {
        total: totalUsuarios,
        admins: totalAdmins,
        usuarios: usuariosNormais,
        comPerfil: usuariosComPerfil,
        semPerfil: usuariosSemPerfil,
        comPlanoSemPerfil: usuariosComPlanoSemPerfil,
        comPerfilSemPlano: usuariosComPerfilSemPlano,
        comPlanoAtivo: usuariosComPlanoAtivo
      },
      treinos: {
        total: totalTreinos,
        concluidos: treinosConcluidos,
        taxaConclusao: Math.round(taxaConclusaoTreinos * 100) / 100
      },
      exercicios: {
        total: totalExercicios
      },
      financeiro: {
        receitaTotal: Math.round(receitaTotal * 100) / 100,
        receitaMensal: Math.round(receitaMesAtual * 100) / 100,
        receitaPorPlano: {
          mensal: Math.round(receitaMensal * 100) / 100,
          trimestral: Math.round(receitaTrimestral * 100) / 100,
          semestral: Math.round(receitaSemestral * 100) / 100
        },
        planosAtivos: {
          mensal: planosMensal,
          trimestral: planosTrimestral,
          semestral: planosSemestral,
          total: planosMensal + planosTrimestral + planosSemestral
        },
        precos: PRECOS
      },
      metricas: {
        taxaConversao: Math.round(taxaConversao * 100) / 100,
        taxaConclusaoTreinos: Math.round(taxaConclusaoTreinos * 100) / 100,
        perfilCompleto: usuariosComPerfil,
        perfilIncompleto: usuariosNormais - usuariosComPerfil
      }
    });
  } catch (error: any) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      error: 'Erro ao obter estatísticas',
      message: error.message
    });
  }
};

// Listar exercícios com busca e filtro
export const listarExercicios = async (req: AuthRequest, res: Response) => {
  try {
    // Sempre retornar todos os exercícios ativos (filtros aplicados no frontend)
    const exercicios = await prisma.exercicio.findMany({
      where: {
        ativo: true
      },
      select: {
        id: true,
        nome: true,
        grupoMuscularPrincipal: true,
        nivelDificuldade: true,
        gifUrl: true,
        imagemUrl: true,
        ativo: true,
        descricao: true,
        execucaoTecnica: true,
        createdAt: true,
        updatedAt: true,
        gruposMusculares: {
          include: {
            grupo: true
          }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    });

    // Buscar grupos musculares únicos para o filtro
    const gruposMusculares = await prisma.grupoMuscularVisual.findMany({
      where: { ativo: true },
      select: { nome: true, slug: true },
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }]
    });

    res.json({
      exercicios,
      gruposMusculares: gruposMusculares.map((g) => g.nome),
      total: exercicios.length
    });
  } catch (error: any) {
    console.error('Erro ao listar exercícios:', error);
    res.status(500).json({
      error: 'Erro ao listar exercícios',
      message: error.message
    });
  }
};

// Upload de GIF para exercício
export const uploadGifExercicio = async (req: AuthRequest & { file?: Express.Multer.File }, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        error: 'Arquivo GIF é obrigatório'
      });
    }

    // Verificar se exercício existe e obter ID real (UUID)
    // IMPORTANTE: Sempre usar UUID do banco, nunca slug ou nome
    const exercicio = await prisma.exercicio.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!exercicio) {
      // Deletar arquivo se exercício não existir
      if (req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {
          // Ignorar erro
        }
      }
      return res.status(404).json({
        error: 'Exercício não encontrado'
      });
    }

    // GARANTIR: Usar sempre o UUID real do exercício (não o parâmetro da URL)
    const exercicioId = exercicio.id;

    // Verificar se o arquivo foi salvo corretamente
    const tempFilePath = req.file.path;
    if (!fs.existsSync(tempFilePath)) {
      return res.status(500).json({
        error: 'Arquivo não foi salvo corretamente'
      });
    }

    // Processar arquivo usando serviço centralizado
    // IMPORTANTE: processMediaFile sempre renomeia para exercicio.<ext> na pasta do UUID
    const { processMediaFile } = await import('../services/exercicio-media.service');
    
    let processedFile;
    try {
      processedFile = await processMediaFile(tempFilePath, exercicioId);
    } catch (error: any) {
      // Deletar arquivo inválido
      if (fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (unlinkError) {
          // Ignorar erro ao deletar
        }
      }
      
      const errorMessage = error.message || 'Arquivo não é um formato de mídia válido. Formatos aceitos: GIF, JPEG, PNG, WebP, MP4, WebM.';
      
      if (process.env.NODE_ENV !== 'production') {
        console.error('[UploadGif] Erro ao processar arquivo:', error);
      }
      
      return res.status(400).json({
        error: errorMessage
      });
    }

    const gifUrl = processedFile.url;

    // Atualizar exercício com a URL da mídia (apenas após arquivo ser salvo com sucesso)
    // IMPORTANTE: URL sempre usa UUID do exercício
    const exercicioAtualizado = await prisma.exercicio.update({
      where: { id: exercicioId },
      data: {
        gifUrl: gifUrl
      },
      select: {
        id: true,
        nome: true,
        gifUrl: true
      }
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('[UploadMedia] Exercício atualizado:', exercicioAtualizado);
    }

    res.json({
      message: 'Demonstração enviada com sucesso',
      exercicio: exercicioAtualizado
    });
  } catch (error: any) {
    console.error('Erro ao fazer upload do GIF:', error);
    
    // Deletar arquivo em caso de erro
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: 'Erro ao fazer upload do GIF',
      message: error.message
    });
  }
};

// Deletar GIF de exercício
export const deletarGifExercicio = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se exercício existe
    const exercicio = await prisma.exercicio.findUnique({
      where: { id }
    });

    if (!exercicio) {
      return res.status(404).json({
        error: 'Exercício não encontrado'
      });
    }

    // Resolver arquivo usando serviço centralizado
    const { resolveExercicioMedia } = await import('../services/exercicio-media.service');
    const resolved = await resolveExercicioMedia(exercicio.id);
    const filePath = resolved?.filePath;

    // Deletar arquivo físico se existir
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Limpar gifUrl no banco
    const exercicioAtualizado = await prisma.exercicio.update({
      where: { id },
      data: {
        gifUrl: null
      },
      select: {
        id: true,
        nome: true,
        gifUrl: true
      }
    });

    res.json({
      message: 'GIF deletado com sucesso',
      exercicio: exercicioAtualizado
    });
  } catch (error: any) {
    console.error('Erro ao deletar GIF:', error);
    res.status(500).json({
      error: 'Erro ao deletar GIF',
      message: error.message
    });
  }
};

// Upload em lote de GIFs
// Formato esperado: FormData com campo 'mapping' (JSON) e arquivos 'gifs'
// mapping: { "exercicioId1": "nome-arquivo1.gif", "exercicioId2": "nome-arquivo2.gif" }
export const bulkUploadGifs = async (req: AuthRequest & { files?: Express.Multer.File[] }, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[] || [];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'Nenhum arquivo enviado'
      });
    }

    // Validar tamanho total dos arquivos
    const { MAX_BULK_TOTAL_SIZE } = await import('../utils/file-validation');
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    if (totalSize > MAX_BULK_TOTAL_SIZE) {
      // Deletar todos os arquivos temporários
      files.forEach(file => {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      return res.status(400).json({
        error: `Tamanho total dos arquivos excede o limite de ${MAX_BULK_TOTAL_SIZE / (1024 * 1024)}MB`
      });
    }

    // Parse do mapping (JSON string no body)
    let mapping: Record<string, string> = {};
    try {
      if (req.body.mapping) {
        mapping = typeof req.body.mapping === 'string' 
          ? JSON.parse(req.body.mapping) 
          : req.body.mapping;
      }
    } catch (err) {
      console.error('Erro ao parsear mapping:', err);
    }

    const resultados = {
      total: files.length,
      sucesso: 0,
      erros: 0,
      detalhes: [] as Array<{
        exercicioId: string;
        nome?: string;
        status: 'sucesso' | 'erro';
        mensagem: string;
      }>
    };

    for (const file of files) {
      // Tentar encontrar exercicioId pelo mapping ou pelo nome do arquivo
      let exercicioId: string | null = null;
      
      // Procurar no mapping
      for (const [id, filename] of Object.entries(mapping)) {
        if (filename === file.originalname || filename === file.filename) {
          exercicioId = id;
          break;
        }
      }
      
      // Se não encontrou no mapping, tentar pelo nome do arquivo (assumindo que é o ID)
      if (!exercicioId) {
        exercicioId = file.originalname.replace('.gif', '').replace('exercicio', '');
      }
      
      if (!exercicioId) {
        resultados.erros++;
        resultados.detalhes.push({
          exercicioId: 'desconhecido',
          status: 'erro',
          mensagem: `Não foi possível identificar o exercício para o arquivo: ${file.originalname}`
        });
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        continue;
      }
      
      try {
        // Verificar se exercício existe
        const exercicio = await prisma.exercicio.findUnique({
          where: { id: exercicioId },
          select: { id: true, nome: true }
        });

        if (!exercicio) {
          resultados.erros++;
          resultados.detalhes.push({
            exercicioId,
            status: 'erro',
            mensagem: 'Exercício não encontrado'
          });
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          continue;
        }

        // Validar que é arquivo de mídia válido
        const fileBuffer = fs.readFileSync(file.path);
        const { validateMediaFile } = await import('../utils/file-validation');
        const detectedMimeType = validateMediaFile(fileBuffer);

        if (!detectedMimeType) {
          fs.unlinkSync(file.path);
          resultados.erros++;
          resultados.detalhes.push({
            exercicioId,
            nome: exercicio.nome,
            status: 'erro',
            mensagem: 'Arquivo não é um formato de mídia válido'
          });
          continue;
        }

        // Mover arquivo para o diretório correto do exercício
        const { getUploadExerciciosPath } = await import('../utils/upload-paths');
        const destinoDir = path.join(getUploadExerciciosPath(), exercicioId);
        if (!fs.existsSync(destinoDir)) {
          fs.mkdirSync(destinoDir, { recursive: true });
        }
        
        // Obter extensão do arquivo original
        const fileExt = path.extname(file.originalname).toLowerCase();
        const { isAcceptedExtension } = await import('../utils/file-validation');
        const validExt = isAcceptedExtension(fileExt) ? fileExt : '.gif';
        
        const destinoPath = path.join(destinoDir, `exercicio${validExt}`);
        fs.copyFileSync(file.path, destinoPath);
        fs.unlinkSync(file.path); // Remover arquivo temporário

        // Construir URL da mídia com extensão correta
        const gifUrl = `/api/uploads/exercicios/${exercicioId}/exercicio${validExt}`;

        // Atualizar exercício com a URL do GIF
        await prisma.exercicio.update({
          where: { id: exercicioId },
          data: { gifUrl }
        });

        resultados.sucesso++;
        resultados.detalhes.push({
          exercicioId,
          nome: exercicio.nome,
          status: 'sucesso',
          mensagem: 'GIF enviado e atualizado com sucesso'
        });

      } catch (error: any) {
        resultados.erros++;
        resultados.detalhes.push({
          exercicioId,
          status: 'erro',
          mensagem: error.message || 'Erro desconhecido'
        });
        
        // Deletar arquivo em caso de erro
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    res.json({
      message: `Processamento concluído: ${resultados.sucesso} sucesso, ${resultados.erros} erros`,
      resultados
    });
  } catch (error: any) {
    console.error('Erro no upload em lote:', error);
    res.status(500).json({
      error: 'Erro no upload em lote',
      message: error.message
    });
  }
};

// Verificar status dos GIFs - quais exercícios têm URL mas arquivo não existe
export const verificarStatusGifs = async (req: AuthRequest, res: Response) => {
  try {
    const { getUploadExerciciosPath } = await import('../utils/upload-paths');
    const uploadBasePath = getUploadExerciciosPath();
    
    // Buscar todos os exercícios com gifUrl
    const exerciciosComGif = await prisma.exercicio.findMany({
      where: {
        gifUrl: { not: null }
      },
      select: {
        id: true,
        nome: true,
        gifUrl: true
      }
    });

    const resultados = {
      total: exerciciosComGif.length,
      comArquivo: 0,
      semArquivo: 0,
      problemas: [] as Array<{
        id: string;
        nome: string;
        gifUrl: string | null;
        caminhoEsperado: string;
        erro?: string;
      }>,
      estrutura: {
        pastaUploadExiste: fs.existsSync(uploadBasePath),
        caminhoUpload: uploadBasePath,
        permissaoEscrita: false
      }
    };

    // Verificar permissões
    try {
      if (fs.existsSync(uploadBasePath)) {
        const testFile = path.join(uploadBasePath, '.test-write');
        try {
          fs.writeFileSync(testFile, 'test');
          fs.unlinkSync(testFile);
          resultados.estrutura.permissaoEscrita = true;
        } catch (err) {
          resultados.estrutura.permissaoEscrita = false;
        }
      }
    } catch (err) {
      // Ignorar erro de permissão
    }

    // Verificar cada exercício
    for (const exercicio of exerciciosComGif) {
      if (!exercicio.gifUrl) continue;
      
      // Extrair ID da URL (formato: /api/uploads/exercicios/{id}/exercicio.gif)
      const match = exercicio.gifUrl.match(/\/exercicios\/([^\/]+)\/exercicio\.gif/);
      const exercicioId = match ? match[1] : exercicio.id;
      
      const filePath = path.join(uploadBasePath, exercicioId, 'exercicio.gif');
      const existe = fs.existsSync(filePath);
      
      if (existe) {
        resultados.comArquivo++;
        try {
          const stats = fs.statSync(filePath);
          if (!stats.isFile() || stats.size === 0) {
            resultados.semArquivo++;
            resultados.problemas.push({
              id: exercicio.id,
              nome: exercicio.nome,
              gifUrl: exercicio.gifUrl,
              caminhoEsperado: filePath,
              erro: 'Arquivo existe mas não é válido (não é arquivo ou está vazio)'
            });
          }
        } catch (err: any) {
          resultados.semArquivo++;
          resultados.problemas.push({
            id: exercicio.id,
            nome: exercicio.nome,
            gifUrl: exercicio.gifUrl,
            caminhoEsperado: filePath,
            erro: `Erro ao verificar arquivo: ${err.message}`
          });
        }
      } else {
        resultados.semArquivo++;
        resultados.problemas.push({
          id: exercicio.id,
          nome: exercicio.nome,
          gifUrl: exercicio.gifUrl,
          caminhoEsperado: filePath,
          erro: 'Arquivo não encontrado no sistema de arquivos'
        });
      }
    }

    res.json(resultados);
  } catch (error: any) {
    console.error('Erro ao verificar status dos GIFs:', error);
    res.status(500).json({
      error: 'Erro ao verificar status dos GIFs',
      message: error.message
    });
  }
};

// Corrigir URLs de GIFs no banco de dados
// Converte URLs com nomes de exercícios para UUIDs corretos
// Remove URLs que apontam para CDN inexistente ou arquivos não encontrados
export const corrigirUrlsGifs = async (req: AuthRequest, res: Response) => {
  try {
    const { getUploadExerciciosPath } = await import('../utils/upload-paths');
    const uploadBasePath = getUploadExerciciosPath();
    const manualAliases: Record<string, string> = {
      'puxada-frontal': 'puxada-frente',
      'puxada frente': 'puxada-frente',
      'puxada-frente': 'puxada-frente'
    };

    const addCandidate = (set: Set<string>, candidate?: string | null) => {
      if (!candidate) return;
      const trimmed = candidate.trim();
      if (!trimmed) return;
      set.add(trimmed);
      const alias = manualAliases[trimmed.toLowerCase()];
      if (alias) {
        set.add(alias);
      }
    };

    const localizarGifExistente = (candidatos: Set<string>) => {
      for (const folder of candidatos) {
        const candidatePath = path.join(uploadBasePath, folder, 'exercicio.gif');
        if (fs.existsSync(candidatePath)) {
          return { folder, filePath: candidatePath };
        }
      }
      return null;
    };

    const garantirGifNoUuid = (exercicioId: string, origem: string) => {
      const destinoDir = path.join(uploadBasePath, exercicioId);
      if (!fs.existsSync(destinoDir)) {
        fs.mkdirSync(destinoDir, { recursive: true });
      }
      const destino = path.join(destinoDir, 'exercicio.gif');
      if (!fs.existsSync(destino)) {
        fs.copyFileSync(origem, destino);
      }
      return destino;
    };
    
    // Buscar todos os exercícios com gifUrl
    const exerciciosComGif = await prisma.exercicio.findMany({
      where: {
        gifUrl: { not: null }
      },
      select: {
        id: true,
        nome: true,
        gifUrl: true
      }
    });

    const resultados = {
      total: exerciciosComGif.length,
      corrigidos: 0,
      removidos: 0,
      semMudanca: 0,
      detalhes: [] as Array<{
        id: string;
        nome: string;
        gifUrlAntigo: string | null;
        gifUrlNovo: string | null;
        acao: string;
      }>
    };

    for (const exercicio of exerciciosComGif) {
      if (!exercicio.gifUrl) continue;

      let precisaCorrigir = false;
      let novaUrl: string | null = null;
      let acao = 'sem_mudanca';

      // Verificar se a URL aponta para CDN inexistente
      if (exercicio.gifUrl.includes('minha-cdn.com')) {
        precisaCorrigir = true;
        novaUrl = null; // Remover URL inválida
        acao = 'removido_cdn_invalida';
      }
      // Verificar se a URL usa nome em vez de UUID
      else if (exercicio.gifUrl.includes('/api/uploads/exercicios/')) {
        const match = exercicio.gifUrl.match(/\/exercicios\/([^\/]+)\/exercicio\.gif/);
        const idNaUrl = match ? match[1] : null;
        
        // Se o ID na URL não é o UUID do exercício, pode ser um nome
        if (idNaUrl && idNaUrl !== exercicio.id) {
          // Verificar se é um UUID válido (formato UUID)
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          
          if (!uuidPattern.test(idNaUrl)) {
            const candidatos = new Set<string>();
            addCandidate(candidatos, idNaUrl);
            addCandidate(candidatos, idNaUrl.toLowerCase());
            addCandidate(candidatos, idNaUrl.replace(/_/g, '-'));
            addCandidate(candidatos, slugify(idNaUrl));
            addCandidate(candidatos, slugify(exercicio.nome));

            const existente = localizarGifExistente(candidatos);

            if (existente) {
              const novoArquivo = garantirGifNoUuid(exercicio.id, existente.filePath);
              if (fs.existsSync(novoArquivo)) {
                precisaCorrigir = true;
                novaUrl = `/api/uploads/exercicios/${exercicio.id}/exercicio.gif`;
                acao = 'copiado_nome_para_uuid';
              }
            } else {
              precisaCorrigir = true;
              novaUrl = null;
              acao = 'removido_arquivo_nao_encontrado';
            }
          } else {
            // É um UUID válido, mas diferente do ID do exercício
            // Verificar se o arquivo existe no caminho do UUID na URL
            const filePathComIdUrl = path.join(uploadBasePath, idNaUrl, 'exercicio.gif');
            const filePathComIdExercicio = path.join(uploadBasePath, exercicio.id, 'exercicio.gif');
            
            if (fs.existsSync(filePathComIdExercicio)) {
              precisaCorrigir = true;
              novaUrl = `/api/uploads/exercicios/${exercicio.id}/exercicio.gif`;
              acao = 'corrigido_uuid_incorreto';
            } else if (fs.existsSync(filePathComIdUrl)) {
              garantirGifNoUuid(exercicio.id, filePathComIdUrl);
              precisaCorrigir = true;
              novaUrl = `/api/uploads/exercicios/${exercicio.id}/exercicio.gif`;
              acao = 'copiado_uuid_incorreto';
            } else {
              precisaCorrigir = true;
              novaUrl = null;
              acao = 'removido_arquivo_nao_encontrado';
            }
          }
        } else if (idNaUrl === exercicio.id) {
          // URL está correta, verificar se arquivo existe
          const filePath = path.join(uploadBasePath, exercicio.id, 'exercicio.gif');
          if (!fs.existsSync(filePath)) {
            precisaCorrigir = true;
            novaUrl = null;
            acao = 'removido_arquivo_nao_encontrado';
          }
        }
      }

      if (precisaCorrigir) {
        await prisma.exercicio.update({
          where: { id: exercicio.id },
          data: { gifUrl: novaUrl }
        });

        if (novaUrl === null) {
          resultados.removidos++;
        } else {
          resultados.corrigidos++;
        }

        resultados.detalhes.push({
          id: exercicio.id,
          nome: exercicio.nome,
          gifUrlAntigo: exercicio.gifUrl,
          gifUrlNovo: novaUrl,
          acao
        });
      } else {
        resultados.semMudanca++;
      }
    }

    res.json({
      message: 'Correção de URLs concluída',
      ...resultados
    });
  } catch (error: any) {
    console.error('Erro ao corrigir URLs dos GIFs:', error);
    res.status(500).json({
      error: 'Erro ao corrigir URLs dos GIFs',
      message: error.message
    });
  }
};

export const listarArquivosGifs = async (req: AuthRequest, res: Response) => {
  try {
    const { getUploadExerciciosPath } = await import('../utils/upload-paths');
    const uploadBasePath = getUploadExerciciosPath();
    const limit = Math.min(parseInt((req.query.limit as string) || '100', 10) || 100, 500);
    const page = Math.max(parseInt((req.query.page as string) || '1', 10) || 1, 1);
    const search = ((req.query.search as string) || '').toLowerCase().trim();
    const offset = (page - 1) * limit;

    let dirEntries: fs.Dirent[];
    try {
      dirEntries = fs.readdirSync(uploadBasePath, { withFileTypes: true });
    } catch (err: any) {
      return res.status(500).json({
        error: 'Não foi possível ler o diretório de GIFs',
        message: err.message
      });
    }

    const pastas = dirEntries.filter((entry) => entry.isDirectory());
    const mapped = pastas
      .map((dir) => {
        const folderName = dir.name;
        const gifPath = path.join(uploadBasePath, folderName, 'exercicio.gif');
        const exists = fs.existsSync(gifPath);
        let size: number | null = null;
        let updatedAt: Date | null = null;
        if (exists) {
          const stats = fs.statSync(gifPath);
          size = stats.size;
          updatedAt = stats.mtime;
        }
        return {
          pasta: folderName,
          possuiGif: exists,
          gifPath: exists ? gifPath : null,
          url: exists ? `/api/uploads/exercicios/${folderName}/exercicio.gif` : null,
          size,
          updatedAt
        };
      })
      .filter((item) => !search || item.pasta.toLowerCase().includes(search));

    const totalFiltrado = mapped.length;
    const paged = mapped.slice(offset, offset + limit);

    res.json({
      basePath: uploadBasePath,
      totalPastas: pastas.length,
      totalFiltradas: totalFiltrado,
      totalComGif: mapped.filter((item) => item.possuiGif).length,
      page,
      limit,
      resultados: paged
    });
  } catch (error: any) {
    console.error('Erro ao listar arquivos de GIFs:', error);
    res.status(500).json({
      error: 'Erro ao listar arquivos de GIFs',
      message: error.message
    });
  }
};

export const listarImagensBanco = async (req: AuthRequest, res: Response) => {
  try {
    const { getImagensBancoPathCandidates } = await import('../utils/upload-paths');
    const candidatos = getImagensBancoPathCandidates();
    const limit = Math.min(parseInt((req.query.limit as string) || '100', 10) || 100, 500);
    const page = Math.max(parseInt((req.query.page as string) || '1', 10) || 1, 1);
    const search = ((req.query.search as string) || '').toLowerCase().trim();
    const offset = (page - 1) * limit;
    const extensoesPermitidas = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif']);

    const arquivos: Array<{
      nome: string;
      basePath: string;
      path: string;
      size: number;
      updatedAt: Date;
      url: string;
    }> = [];
    const errosLeitura: Array<{ basePath: string; error: string }> = [];

    for (const basePath of candidatos) {
      if (!fs.existsSync(basePath)) {
        errosLeitura.push({ basePath, error: 'Diretório inexistente' });
        continue;
      }

      try {
        const dirEntries = fs.readdirSync(basePath, { withFileTypes: true });
        for (const entry of dirEntries) {
          if (!entry.isFile()) continue;
          const ext = path.extname(entry.name).toLowerCase();
          if (!extensoesPermitidas.has(ext)) continue;
          const filePath = path.join(basePath, entry.name);
          const stats = fs.statSync(filePath);
          arquivos.push({
            nome: entry.name,
            basePath,
            path: filePath,
            size: stats.size,
            updatedAt: stats.mtime,
            url: `/api/imagens-banco/${entry.name}`
          });
        }
      } catch (err: any) {
        errosLeitura.push({ basePath, error: err.message });
      }
    }

    const filtrados = search
      ? arquivos.filter((arquivo) => arquivo.nome.toLowerCase().includes(search))
      : arquivos;
    const totalFiltrado = filtrados.length;
    const paged = filtrados.slice(offset, offset + limit);

    res.json({
      candidatos,
      totalArquivos: arquivos.length,
      totalFiltrados: totalFiltrado,
      page,
      limit,
      resultados: paged,
      errosLeitura
    });
  } catch (error: any) {
    console.error('Erro ao listar imagens do banco:', error);
    res.status(500).json({
      error: 'Erro ao listar imagens do banco',
      message: error.message
    });
  }
};

// Obter detalhes de um exercício
export const obterExercicio = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const exercicio = await prisma.exercicio.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        grupoMuscularPrincipal: true,
        sinergistas: true,
        descricao: true,
        execucaoTecnica: true,
        errosComuns: true,
        imagemUrl: true,
        gifUrl: true,
        cargaInicialSugerida: true,
        rpeSugerido: true,
        equipamentoNecessario: true,
        nivelDificuldade: true,
        alternativas: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
        gruposMusculares: {
          include: {
            grupo: true
          }
        }
      }
    });

    if (!exercicio) {
      return res.status(404).json({
        error: 'Exercício não encontrado'
      });
    }

    res.json(exercicio);
  } catch (error: any) {
    console.error('Erro ao obter exercício:', error);
    res.status(500).json({
      error: 'Erro ao obter exercício',
      message: error.message
    });
  }
};

// Criar exercício
export const criarExercicio = async (req: AuthRequest, res: Response) => {
  try {
    const {
      nome,
      grupoMuscularPrincipal,
      sinergistas,
      descricao,
      execucaoTecnica,
      errosComuns,
      cargaInicialSugerida,
      rpeSugerido,
      equipamentoNecessario,
      nivelDificuldade,
      alternativas,
      ativo
    } = req.body;

    // Validar campos obrigatórios
    if (!nome || !grupoMuscularPrincipal || !nivelDificuldade) {
      return res.status(400).json({
        error: 'Campos obrigatórios: nome, grupoMuscularPrincipal, nivelDificuldade'
      });
    }

    // Preparar dados para criação
    const data: any = {
      nome,
      grupoMuscularPrincipal,
      nivelDificuldade,
      sinergistas: Array.isArray(sinergistas) ? sinergistas : [],
      descricao: descricao || null,
      execucaoTecnica: execucaoTecnica || null,
      errosComuns: Array.isArray(errosComuns) ? errosComuns : [],
      cargaInicialSugerida: cargaInicialSugerida ? parseFloat(cargaInicialSugerida) : null,
      rpeSugerido: rpeSugerido ? parseInt(rpeSugerido) : null,
      equipamentoNecessario: Array.isArray(equipamentoNecessario) ? equipamentoNecessario : [],
      alternativas: Array.isArray(alternativas) ? alternativas : [],
      ativo: ativo !== undefined ? (ativo === true || ativo === 'true') : true
    };

    // Criar exercício
    const exercicio = await prisma.exercicio.create({
      data,
      select: {
        id: true,
        nome: true,
        grupoMuscularPrincipal: true,
        sinergistas: true,
        descricao: true,
        execucaoTecnica: true,
        errosComuns: true,
        imagemUrl: true,
        gifUrl: true,
        cargaInicialSugerida: true,
        rpeSugerido: true,
        equipamentoNecessario: true,
        nivelDificuldade: true,
        alternativas: true,
        ativo: true,
        createdAt: true,
        updatedAt: true
      }
    });

    await sincronizarGruposDoExercicio(
      exercicio.id,
      exercicio.grupoMuscularPrincipal,
      exercicio.sinergistas
    );

    res.status(201).json({
      message: 'Exercício criado com sucesso',
      exercicio
    });
  } catch (error: any) {
    console.error('Erro ao criar exercício:', error);
    res.status(500).json({
      error: 'Erro ao criar exercício',
      message: error.message
    });
  }
};

// Atualizar exercício
export const atualizarExercicio = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      nome,
      grupoMuscularPrincipal,
      sinergistas,
      descricao,
      execucaoTecnica,
      errosComuns,
      cargaInicialSugerida,
      rpeSugerido,
      equipamentoNecessario,
      nivelDificuldade,
      alternativas,
      ativo
    } = req.body;

    // Verificar se exercício existe
    const exercicioExistente = await prisma.exercicio.findUnique({
      where: { id }
    });

    if (!exercicioExistente) {
      return res.status(404).json({
        error: 'Exercício não encontrado'
      });
    }

    // Preparar dados para atualização
    const data: any = {};
    if (nome !== undefined) data.nome = nome;
    if (grupoMuscularPrincipal !== undefined) data.grupoMuscularPrincipal = grupoMuscularPrincipal;
    if (sinergistas !== undefined) data.sinergistas = Array.isArray(sinergistas) ? sinergistas : [];
    if (descricao !== undefined) data.descricao = descricao || null;
    if (execucaoTecnica !== undefined) data.execucaoTecnica = execucaoTecnica || null;
    if (errosComuns !== undefined) data.errosComuns = Array.isArray(errosComuns) ? errosComuns : [];
    if (cargaInicialSugerida !== undefined) data.cargaInicialSugerida = cargaInicialSugerida ? parseFloat(cargaInicialSugerida) : null;
    if (rpeSugerido !== undefined) data.rpeSugerido = rpeSugerido ? parseInt(rpeSugerido) : null;
    if (equipamentoNecessario !== undefined) data.equipamentoNecessario = Array.isArray(equipamentoNecessario) ? equipamentoNecessario : [];
    if (nivelDificuldade !== undefined) data.nivelDificuldade = nivelDificuldade;
    if (alternativas !== undefined) data.alternativas = Array.isArray(alternativas) ? alternativas : [];
    if (ativo !== undefined) data.ativo = ativo === true || ativo === 'true';

    // Atualizar exercício
    const exercicio = await prisma.exercicio.update({
      where: { id },
      data,
      select: {
        id: true,
        nome: true,
        grupoMuscularPrincipal: true,
        sinergistas: true,
        descricao: true,
        execucaoTecnica: true,
        errosComuns: true,
        imagemUrl: true,
        gifUrl: true,
        cargaInicialSugerida: true,
        rpeSugerido: true,
        equipamentoNecessario: true,
        nivelDificuldade: true,
        alternativas: true,
        ativo: true,
        updatedAt: true
      }
    });

    await sincronizarGruposDoExercicio(
      exercicio.id,
      exercicio.grupoMuscularPrincipal,
      exercicio.sinergistas
    );

    res.json({
      message: 'Exercício atualizado com sucesso',
      exercicio
    });
  } catch (error: any) {
    console.error('Erro ao atualizar exercício:', error);
    res.status(500).json({
      error: 'Erro ao atualizar exercício',
      message: error.message
    });
  }
};

// Limpar todas as URLs de mídia de todos os exercícios
export const limparTodasUrlsMidias = async (req: AuthRequest, res: Response) => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[LimparMidias] Iniciando limpeza de todas as URLs de mídia...');
    }

    // Atualizar todos os exercícios, setando gifUrl e imagemUrl como null
    const resultado = await prisma.exercicio.updateMany({
      data: {
        gifUrl: null,
        imagemUrl: null
      }
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[LimparMidias] ${resultado.count} exercícios atualizados`);
    }

    res.json({
      message: 'Todas as URLs de mídia foram removidas com sucesso',
      exerciciosAtualizados: resultado.count,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Erro ao limpar URLs de mídia:', error);
    res.status(500).json({
      error: 'Erro ao limpar URLs de mídia',
      message: error.message
    });
  }
};

