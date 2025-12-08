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

// Funções auxiliares para normalizar dados de onboarding
const parseNumber = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(num) ? null : num;
};

const normalizeArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(v => v && String(v).trim()).map(v => String(v).trim());
  const unico = String(value).trim();
  return unico ? [unico] : [];
};

const normalizeOnboardingData = (data: any) => {
  if (!data) return null;
  return {
    idade: parseNumber(data.idade),
    sexo: data.sexo ? String(data.sexo).trim() : null,
    tipoCorpo: data.tipoCorpo ? String(data.tipoCorpo).trim() : null,
    altura: parseNumber(data.altura),
    pesoAtual: parseNumber(data.pesoAtual),
    percentualGordura: parseNumber(data.percentualGordura),
    aguaDiaria: data.aguaDiaria !== undefined && data.aguaDiaria !== null && data.aguaDiaria !== '' ? String(data.aguaDiaria).trim() : null,
    experiencia: data.experiencia ? String(data.experiencia).trim() : null,
    objetivo: data.objetivo ? String(data.objetivo).trim() : null,
    frequenciaSemanal: parseNumber(data.frequenciaSemanal),
    tempoDisponivel: parseNumber(data.tempoDisponivel),
    localTreino: data.localTreino ? String(data.localTreino).trim() : null,
    problemasAnteriores: normalizeArray(data.problemasAnteriores),
    objetivosAdicionais: normalizeArray(data.objetivosAdicionais),
    lesoes: normalizeArray(data.lesoes),
    preferencias: normalizeArray(data.preferencias),
    rpePreferido: parseNumber(data.rpePreferido)
  };
};

// Listar todos os usuários
export const listarUsuarios = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search, incluirDesabilitados } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    
    // Filtrar apenas usuários ativos por padrão, a menos que incluirDesabilitados seja true
    if (incluirDesabilitados !== 'true') {
      where.ativo = true;
    }
    
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
          dataExpiracao: true,
          ativo: true,
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
    const { email, senha, nome, telefone, dataNascimento, onboarding } = req.body;

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
        telefone: telefone?.trim() || null,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
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

    // Se houver dados de onboarding, criar perfil
    if (onboarding) {
      const onboardingData = normalizeOnboardingData(onboarding);
      if (onboardingData) {
        await prisma.perfil.create({
          data: {
            userId: user.id,
            ...onboardingData
          }
        });

        // Se peso foi informado, criar registro no histórico
        if (onboardingData.pesoAtual !== null && onboardingData.pesoAtual !== undefined) {
          await prisma.historicoPeso.create({
            data: {
              userId: user.id,
              peso: onboardingData.pesoAtual
            }
          });
        }
      }
    }

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

// Desativar usuário (soft delete - ativo = false)
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

    // Desabilitar usuário (soft delete)
    await prisma.user.update({
      where: { id },
      data: {
        ativo: false
      }
    });

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

// Reativar usuário (ativo = true)
export const reativarUsuario = async (req: AuthRequest, res: Response) => {
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

    // Reativar usuário
    await prisma.user.update({
      where: { id },
      data: {
        ativo: true
      }
    });

    res.json({
      message: 'Usuário reativado com sucesso',
      userId: id
    });
  } catch (error: any) {
    console.error('Erro ao reativar usuário:', error);
    res.status(500).json({
      error: 'Erro ao reativar usuário',
      message: error.message
    });
  }
};

// Simular pagamento para testar envio de e-mail (apenas admin)
export const simularPagamentoUsuario = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { plano } = req.body;

    // Validações
    if (!plano) {
      return res.status(400).json({
        error: 'Plano é obrigatório'
      });
    }

    const planosValidos = ['MENSAL', 'TRIMESTRAL', 'SEMESTRAL'];
    if (!planosValidos.includes(plano.toUpperCase())) {
      return res.status(400).json({
        error: 'Plano inválido. Deve ser MENSAL, TRIMESTRAL ou SEMESTRAL'
      });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id },
      include: { perfil: true }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    console.log(`🧪 [ADMIN] Simulando pagamento para usuário ${id} (${user.email.substring(0, 3)}***)`);
    console.log(`🧪 [ADMIN] Plano selecionado: ${plano}`);

    // Criar webhook simulado com estrutura similar à do Cakto
    const webhookSimulado = {
      event: 'purchase_approved',
      data: {
        id: `test_${Date.now()}_${id}`,
        transaction_id: `test_${Date.now()}_${id}`,
        amount: plano === 'MENSAL' ? 19.90 : plano === 'TRIMESTRAL' ? 49.90 : 89.90,
        status: 'approved',
        paymentMethod: 'admin_simulation',
        customer: {
          email: user.email,
          id: `test_customer_${Date.now()}`,
          customer_id: `test_customer_${Date.now()}`
        },
        product: {
          short_id: plano === 'MENSAL' 
            ? process.env.CAKTO_PRODUCT_ID_MENSAL 
            : plano === 'TRIMESTRAL'
            ? process.env.CAKTO_PRODUCT_ID_TRIMESTRAL
            : process.env.CAKTO_PRODUCT_ID_SEMESTRAL
        },
        checkoutUrl: `https://pay.cakto.com.br/${plano === 'MENSAL' 
          ? process.env.CAKTO_PRODUCT_ID_MENSAL 
          : plano === 'TRIMESTRAL'
          ? process.env.CAKTO_PRODUCT_ID_TRIMESTRAL
          : process.env.CAKTO_PRODUCT_ID_SEMESTRAL}?email=${user.email}`
      },
      // Adicionar secret para validação (em teste admin, podemos usar secret real ou pular)
      secret: process.env.CAKTO_WEBHOOK_SECRET || 'admin_simulation'
    };

    // Verificar configuração do Resend antes de processar
    console.log('🔍 [ADMIN] Verificando configuração do Resend...');
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ [ADMIN] RESEND_API_KEY não configurado!');
      return res.status(500).json({
        success: false,
        error: 'RESEND_API_KEY não configurado. Verifique as variáveis de ambiente.',
        configError: true
      });
    }
    if (!process.env.RESEND_FROM_EMAIL) {
      console.warn('⚠️ [ADMIN] RESEND_FROM_EMAIL não configurado. Usando valor padrão.');
    }

    // Processar webhook (isso vai chamar o envio de e-mail automaticamente)
    const { processPaymentApproved } = await import('../services/cakto.service');
    const result = await processPaymentApproved(webhookSimulado);

    // Log detalhado do resultado
    console.log(`📊 [ADMIN] Resultado do processamento:`, JSON.stringify(result, null, 2));

    if (result.success && 'plano' in result && 'user_id' in result) {
      console.log(`✅ [ADMIN] Pagamento simulado processado com sucesso para usuário ${id}`);
      
      // Verificar se o e-mail foi enviado
      const emailResult = result as any;
      const emailSent = emailResult.emailSent === true;
      const emailError = emailResult.emailError || null;
      const emailMessageId = emailResult.emailMessageId || null;
      
      if (emailSent) {
        console.log(`✅ [ADMIN] E-mail enviado com sucesso. MessageId: ${emailMessageId}`);
      } else {
        console.error(`❌ [ADMIN] E-mail NÃO foi enviado. Erro: ${emailError}`);
      }
      
      res.json({
        success: true,
        message: emailSent 
          ? 'Pagamento simulado processado com sucesso. E-mail de boas-vindas enviado.'
          : 'Pagamento simulado processado, mas e-mail não foi enviado.',
        result: {
          transaction_id: result.transaction_id,
          plano: result.plano,
          user_id: result.user_id,
          emailSent: emailSent,
          emailError: emailError,
          emailMessageId: emailMessageId
        }
      });
    } else {
      console.error(`❌ [ADMIN] Erro ao simular pagamento: ${result.message || 'Erro desconhecido'}`);
      res.status(500).json({
        success: false,
        error: result.message || 'Erro ao simular pagamento',
        result: result
      });
    }

  } catch (error: any) {
    console.error('❌ [ADMIN] Erro ao simular pagamento:', error);
    res.status(500).json({
      error: 'Erro ao simular pagamento',
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
        dataExpiracao: usuario.dataExpiracao,
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


export const listarImagensBanco = async (req: AuthRequest, res: Response) => {
  try {
    const { getImagensBancoPathCandidates } = await import('../utils/upload-paths');
    const candidatos = getImagensBancoPathCandidates();
    const limit = Math.min(parseInt((req.query.limit as string) || '100', 10) || 100, 500);
    const page = Math.max(parseInt((req.query.page as string) || '1', 10) || 1, 1);
    const search = ((req.query.search as string) || '').toLowerCase().trim();
    const offset = (page - 1) * limit;
    const extensoesPermitidas = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.avif']);

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

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'ID do exercício é obrigatório'
      });
    }

    const trimmedId = id.trim();

    // Verificar se é UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmedId);
    
    let exercicio = null;
    
    try {
      // 1) Sempre tentar buscar diretamente pelo ID (pode ser UUID ou slug)
      exercicio = await prisma.exercicio.findUnique({
        where: { id: trimmedId },
        select: {
          id: true,
          nome: true,
          grupoMuscularPrincipal: true,
          sinergistas: true,
          descricao: true,
          execucaoTecnica: true,
          errosComuns: true,
          imagemUrl: true,
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

      // 2) Se não encontrou e NÃO é UUID, tentar buscar por nome (compatibilidade com dados legados onde o ID pode ser o nome/slug)
      if (!exercicio && !isUuid) {
        // Se não é UUID, tentar buscar por nome (pode ser slug)
        console.log(`[obterExercicio] Buscando por nome (não é UUID): "${trimmedId}"`);
        
        // Primeiro tentar busca exata pelo nome (sem filtro de ativo, pois é admin e pode editar inativos)
        exercicio = await prisma.exercicio.findFirst({
          where: {
            nome: { equals: trimmedId, mode: 'insensitive' as const }
          },
          select: {
            id: true,
            nome: true,
            grupoMuscularPrincipal: true,
            sinergistas: true,
            descricao: true,
            execucaoTecnica: true,
            errosComuns: true,
            imagemUrl: true,
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
        
        // Se ainda não encontrou e tem hífen, tentar converter slug para nome
        if (!exercicio && trimmedId.includes('-')) {
          try {
            const nomeAproximado = trimmedId
              .split('-')
              .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
              .join(' ');
            
            console.log(`[obterExercicio] Tentando buscar por nome aproximado: "${nomeAproximado}"`);
            
            exercicio = await prisma.exercicio.findFirst({
              where: {
                nome: { equals: nomeAproximado, mode: 'insensitive' as const }
              },
              select: {
                id: true,
                nome: true,
                grupoMuscularPrincipal: true,
                sinergistas: true,
                descricao: true,
                execucaoTecnica: true,
                errosComuns: true,
                imagemUrl: true,
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
          } catch (searchError: any) {
            // Log mas não falhar - continuar para retornar 404
            if (process.env.NODE_ENV !== 'production') {
              console.warn('[obterExercicio] Erro ao buscar por nome aproximado:', searchError.message);
            }
          }
        }
      }
    } catch (dbError: any) {
      console.error('[obterExercicio] Erro ao buscar no banco:', dbError);
      return res.status(500).json({
        error: 'Erro ao buscar exercício no banco de dados',
        message: dbError.message
      });
    }

    if (!exercicio) {
      // Log adicional para debug
      console.log(`[obterExercicio] Exercício não encontrado. ID buscado: "${id.trim()}", é UUID: ${isUuid}`);
      
      // Tentar buscar qualquer exercício com esse nome para ver se existe (mesmo inativo)
      try {
        const exercicioInativo = await prisma.exercicio.findFirst({
          where: {
            nome: { equals: id.trim(), mode: 'insensitive' as const }
          },
          select: { id: true, nome: true, ativo: true }
        });
        
        if (exercicioInativo && !exercicioInativo.ativo) {
          return res.status(404).json({
            error: 'Exercício encontrado mas está inativo',
            id: id.trim(),
            exercicioId: exercicioInativo.id,
            ativo: false
          });
        }
      } catch (checkError) {
        // Ignorar erro na verificação de inativo
      }
      
      return res.status(404).json({
        error: 'Exercício não encontrado',
        id: id.trim(),
        isUuid,
        suggestion: isUuid ? null : 'Tente usar o UUID do exercício ou verifique se o nome está correto'
      });
    }

    res.json(exercicio);
  } catch (error: any) {
    console.error('[obterExercicio] Erro geral:', error);
    res.status(500).json({
      error: 'Erro ao obter exercício',
      message: error.message || 'Erro desconhecido'
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

    // Atualizar todos os exercícios, setando imagemUrl como null
    const resultado = await prisma.exercicio.updateMany({
      data: {
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

