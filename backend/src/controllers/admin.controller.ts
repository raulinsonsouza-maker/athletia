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
import { sendRemarketingEmail } from '../services/email.service';
import { calcularEstagioTrial } from '../services/trial.service';

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

// Listar todos os usuários com filtros avançados e cálculos de estágio
export const listarUsuarios = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      incluirDesabilitados,
      tipoAcesso,
      estagioTrial,
      vencimento,
      perfil,
      ultimoAcesso,
      dataCadastroInicio,
      dataCadastroFim
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    
    // Filtrar apenas usuários ativos por padrão
    if (incluirDesabilitados !== 'true') {
      where.ativo = true;
    }
    
    // Busca textual
    if (search) {
      const searchSanitized = sanitizeString(search as string, 100);
      if (searchSanitized) {
        where.OR = [
          { email: { contains: searchSanitized, mode: 'insensitive' } },
          { nome: { contains: searchSanitized, mode: 'insensitive' } }
        ];
      }
    }

    // Filtro de data de cadastro
    if (dataCadastroInicio || dataCadastroFim) {
      where.createdAt = {};
      if (dataCadastroInicio) {
        const inicio = new Date(dataCadastroInicio as string);
        inicio.setHours(0, 0, 0, 0);
        where.createdAt.gte = inicio;
      }
      if (dataCadastroFim) {
        const fim = new Date(dataCadastroFim as string);
        fim.setHours(23, 59, 59, 999);
        where.createdAt.lte = fim;
      }
    }

    // Limitar paginação
    const maxLimit = 10000;
    const finalLimit = Math.min(limitNum, maxLimit);
    const finalSkip = Math.max(0, skip);

    // Buscar usuários com dados completos
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
          dataInicioTrial: true,
          dataFimTrial: true,
          ativo: true,
          createdAt: true,
          updatedAt: true,
          perfil: {
            select: {
              id: true,
              objetivo: true,
              experiencia: true,
              pesoAtual: true,
              idade: true,
              sexo: true,
              altura: true
            }
          },
          treinos: {
            select: {
              updatedAt: true
            },
            orderBy: {
              updatedAt: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({ where })
    ]);

    const agora = new Date();

    // Calcular estágios e informações adicionais
    const usuariosComEstagio = usuarios.map(user => {
      let estagio: 'D1' | 'D2' | 'D3' | 'EXPIrado' | 'PLANO_ATIVO' | 'SEM_ACESSO' = 'SEM_ACESSO';
      let vencimentoTexto = '';
      let diasRestantes = 0;
      const perfilCompleto = !!user.perfil && 
        !!user.perfil.idade && 
        !!user.perfil.sexo && 
        !!user.perfil.altura && 
        !!user.perfil.pesoAtual && 
        !!user.perfil.objetivo && 
        !!user.perfil.experiencia;

      if (user.planoAtivo) {
        estagio = 'PLANO_ATIVO';
        if (user.dataExpiracao) {
          const dataExp = new Date(user.dataExpiracao);
          const diffMs = dataExp.getTime() - agora.getTime();
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          if (diffDays < 0) {
            vencimentoTexto = `Expirado há ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'dia' : 'dias'}`;
          } else if (diffDays === 0) {
            vencimentoTexto = 'Vence hoje';
          } else if (diffDays === 1) {
            vencimentoTexto = 'Vence em 1 dia';
          } else {
            vencimentoTexto = `Vence em ${diffDays} dias`;
          }
        }
      } else if (user.dataInicioTrial && user.dataFimTrial) {
        estagio = calcularEstagioTrial(user.dataInicioTrial, user.dataFimTrial, agora);
        const dataFimTrial = new Date(user.dataFimTrial);
        const diffMs = dataFimTrial.getTime() - agora.getTime();
        diasRestantes = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        
        if (estagio === 'EXPIrado') {
          const diasExpirado = Math.abs(diasRestantes);
          vencimentoTexto = `Expirado há ${diasExpirado} ${diasExpirado === 1 ? 'dia' : 'dias'}`;
        } else if (diasRestantes === 0) {
          vencimentoTexto = 'Vence hoje';
        } else if (diasRestantes === 1) {
          vencimentoTexto = 'Vence em 1 dia';
        } else {
          vencimentoTexto = `Vence em ${diasRestantes} dias`;
        }
      }

      // Último acesso (baseado no último treino atualizado)
      const ultimoAcesso = user.treinos && user.treinos.length > 0 
        ? new Date(user.treinos[0].updatedAt)
        : null;

      return {
        ...toUserAdminDTO(user),
        estagioTrial: estagio,
        vencimentoTexto,
        diasRestantes,
        perfilCompleto,
        ultimoAcesso: ultimoAcesso?.toISOString() || null
      };
    });

    // Aplicar filtros adicionais no resultado processado
    let usuariosFiltrados = usuariosComEstagio;

    // Filtro por tipo de acesso
    if (tipoAcesso) {
      const tipos = Array.isArray(tipoAcesso) ? tipoAcesso : [tipoAcesso];
      usuariosFiltrados = usuariosFiltrados.filter(u => {
        // Retornar true se o usuário corresponder a QUALQUER tipo selecionado
        return tipos.some(tipo => {
          if (tipo === 'TRIAL_ATIVO') {
            return ['D1', 'D2', 'D3'].includes(u.estagioTrial);
          }
          if (tipo === 'TRIAL_EXPIRADO') {
            return u.estagioTrial === 'EXPIrado';
          }
          if (tipo === 'PLANO_ATIVO') {
            return u.estagioTrial === 'PLANO_ATIVO';
          }
          if (tipo === 'SEM_ACESSO') {
            return u.estagioTrial === 'SEM_ACESSO';
          }
          return false;
        });
      });
    }

    // Filtro por estágio do trial
    if (estagioTrial) {
      const estagios = Array.isArray(estagioTrial) ? estagioTrial : [estagioTrial];
      usuariosFiltrados = usuariosFiltrados.filter(u => estagios.includes(u.estagioTrial));
    }

    // Filtro por vencimento
    if (vencimento) {
      usuariosFiltrados = usuariosFiltrados.filter(u => {
        if (vencimento === 'HOJE') {
          return u.vencimentoTexto === 'Vence hoje';
        }
        if (vencimento === 'AMANHA') {
          return u.vencimentoTexto === 'Vence em 1 dia';
        }
        if (vencimento === 'EXPIRADO') {
          return u.vencimentoTexto.startsWith('Expirado');
        }
        return true;
      });
    }

    // Filtro por perfil
    if (perfil) {
      if (perfil === 'COMPLETO') {
        usuariosFiltrados = usuariosFiltrados.filter(u => u.perfilCompleto);
      } else if (perfil === 'INCOMPLETO') {
        usuariosFiltrados = usuariosFiltrados.filter(u => !u.perfilCompleto);
      }
    }

    // Filtro por último acesso
    if (ultimoAcesso) {
      const agora = new Date();
      usuariosFiltrados = usuariosFiltrados.filter(u => {
        if (!u.ultimoAcesso) {
          return ultimoAcesso === 'NUNCA';
        }
        const ultimoAcessoDate = new Date(u.ultimoAcesso);
        const diffMs = agora.getTime() - ultimoAcessoDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        
        if (ultimoAcesso === 'NUNCA') {
          return false;
        }
        if (ultimoAcesso === 'MAIS_3_DIAS') {
          return diffDays > 3;
        }
        if (ultimoAcesso === 'MAIS_7_DIAS') {
          return diffDays > 7;
        }
        return true;
      });
    }

    // Ordenação por prioridade
    const ordemPrioridade: Record<string, number> = {
      'D3': 1,
      'D2': 2,
      'D1': 3,
      'EXPIrado': 4,
      'PLANO_ATIVO': 5,
      'SEM_ACESSO': 6
    };

    usuariosFiltrados.sort((a, b) => {
      const prioridadeA = ordemPrioridade[a.estagioTrial] || 99;
      const prioridadeB = ordemPrioridade[b.estagioTrial] || 99;
      
      if (prioridadeA !== prioridadeB) {
        return prioridadeA - prioridadeB;
      }
      
      // Dentro do mesmo grupo, ordenar por data de vencimento (mais próximo primeiro)
      return a.diasRestantes - b.diasRestantes;
    });

    res.json({
      usuarios: usuariosFiltrados,
      paginacao: {
        pagina: pageNum,
        limite: finalLimit,
        total: usuariosFiltrados.length,
        totalPaginas: Math.ceil(usuariosFiltrados.length / finalLimit)
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

// Obter resumo estratégico de usuários
export const obterResumoUsuarios = async (req: AuthRequest, res: Response) => {
  try {
    const agora = new Date();
    const inicioHoje = new Date(agora);
    inicioHoje.setHours(0, 0, 0, 0);
    const fimHoje = new Date(agora);
    fimHoje.setHours(23, 59, 59, 999);
    
    const inicio24hAtras = new Date(agora);
    inicio24hAtras.setHours(agora.getHours() - 24);

    // Buscar todos os usuários com dados de trial
    const usuarios = await prisma.user.findMany({
      where: {
        role: 'USER',
        ativo: true
      },
      select: {
        id: true,
        dataInicioTrial: true,
        dataFimTrial: true,
        planoAtivo: true,
        createdAt: true
      }
    });

    // Calcular métricas
    let total = usuarios.length;
    let trialsAtivosHoje = 0;
    let trialsD3 = 0;
    let trialsExpirados24h = 0;
    let assinantesAtivos = 0;

    usuarios.forEach(user => {
      // Assinantes ativos
      if (user.planoAtivo) {
        assinantesAtivos++;
        return;
      }

      // Se não tem trial, pular
      if (!user.dataInicioTrial || !user.dataFimTrial) {
        return;
      }

      const estagio = calcularEstagioTrial(user.dataInicioTrial, user.dataFimTrial, agora);
      const dataFimTrial = new Date(user.dataFimTrial);

      // Trials ativos hoje (qualquer estágio ativo hoje)
      if (estagio !== 'EXPIrado' && dataFimTrial >= inicioHoje && dataFimTrial <= fimHoje) {
        trialsAtivosHoje++;
      }

      // Trials D3 (último dia)
      if (estagio === 'D3') {
        trialsD3++;
      }

      // Trials expirados nas últimas 24h
      if (estagio === 'EXPIrado' && dataFimTrial >= inicio24hAtras && dataFimTrial <= agora) {
        trialsExpirados24h++;
      }
    });

    res.json({
      total,
      trialsAtivosHoje,
      trialsD3,
      trialsExpirados24h,
      assinantesAtivos
    });
  } catch (error: any) {
    console.error('Erro ao obter resumo de usuários:', error);
    res.status(500).json({
      error: 'Erro ao obter resumo de usuários',
      message: error.message
    });
  }
};

// Estender trial por 1 dia
export const estenderTrial = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        dataFimTrial: true,
        planoAtivo: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    if (user.planoAtivo) {
      return res.status(400).json({
        error: 'Usuário já possui plano ativo'
      });
    }

    if (!user.dataFimTrial) {
      return res.status(400).json({
        error: 'Usuário não possui trial ativo'
      });
    }

    // Adicionar 1 dia ao trial
    const novaDataFim = new Date(user.dataFimTrial);
    novaDataFim.setDate(novaDataFim.getDate() + 1);

    await prisma.user.update({
      where: { id },
      data: {
        dataFimTrial: novaDataFim
      }
    });

    res.json({
      message: 'Trial estendido com sucesso',
      novaDataFim: novaDataFim.toISOString()
    });
  } catch (error: any) {
    console.error('Erro ao estender trial:', error);
    res.status(500).json({
      error: 'Erro ao estender trial',
      message: error.message
    });
  }
};

// Converter trial em plano ativo manualmente
export const converterManual = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { plano = 'MENSAL' } = req.body;

    const planosValidos = ['MENSAL', 'TRIMESTRAL', 'SEMESTRAL'];
    if (!planosValidos.includes(plano.toUpperCase())) {
      return res.status(400).json({
        error: 'Plano inválido'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { perfil: true }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    if (user.planoAtivo) {
      return res.status(400).json({
        error: 'Usuário já possui plano ativo'
      });
    }

    // Calcular data de expiração
    const hoje = new Date();
    const dataExpiracao = new Date(hoje);
    switch (plano.toUpperCase()) {
      case 'MENSAL':
        dataExpiracao.setMonth(dataExpiracao.getMonth() + 1);
        break;
      case 'TRIMESTRAL':
        dataExpiracao.setMonth(dataExpiracao.getMonth() + 3);
        break;
      case 'SEMESTRAL':
        dataExpiracao.setMonth(dataExpiracao.getMonth() + 6);
        break;
    }

    await prisma.user.update({
      where: { id },
      data: {
        planoAtivo: true,
        plano: plano.toUpperCase(),
        dataPagamento: hoje,
        dataExpiracao: dataExpiracao
      }
    });

    // Gerar treinos se tiver perfil
    if (user.perfil) {
      try {
        const { gerarTreinos30Dias } = await import('../services/treino.service');
        await gerarTreinos30Dias(user.id);
      } catch (error: any) {
        console.error('Erro ao gerar treinos após conversão manual:', error);
        // Não falhar a conversão se houver erro ao gerar treinos
      }
    }

    res.json({
      message: 'Usuário convertido para plano ativo com sucesso',
      plano: plano.toUpperCase(),
      dataExpiracao: dataExpiracao.toISOString()
    });
  } catch (error: any) {
    console.error('Erro ao converter manualmente:', error);
    res.status(500).json({
      error: 'Erro ao converter manualmente',
      message: error.message
    });
  }
};

// Encerrar trial antecipadamente
export const encerrarTrial = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        dataFimTrial: true,
        planoAtivo: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    if (user.planoAtivo) {
      return res.status(400).json({
        error: 'Usuário já possui plano ativo'
      });
    }

    if (!user.dataFimTrial) {
      return res.status(400).json({
        error: 'Usuário não possui trial ativo'
      });
    }

    // Definir data de fim do trial para agora
    await prisma.user.update({
      where: { id },
      data: {
        dataFimTrial: new Date()
      }
    });

    res.json({
      message: 'Trial encerrado com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao encerrar trial:', error);
    res.status(500).json({
      error: 'Erro ao encerrar trial',
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
        senhaHash: usuario.senhaHash ? `${usuario.senhaHash.substring(0, 20)}...` : null, // Mostrar apenas início do hash para debug
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

// Redefinir senha do usuário (apenas admin)
export const redefinirSenhaUsuario = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { novaSenha } = req.body;

    if (!novaSenha) {
      return res.status(400).json({
        error: 'Nova senha é obrigatória'
      });
    }

    // Validar força da senha
    if (novaSenha.length < 8) {
      return res.status(400).json({
        error: 'A senha deve ter no mínimo 8 caracteres'
      });
    }

    // Verificar se tem pelo menos 1 letra e 1 número
    const hasLetter = /[a-zA-Z]/.test(novaSenha);
    const hasNumber = /[0-9]/.test(novaSenha);

    if (!hasLetter || !hasNumber) {
      return res.status(400).json({
        error: 'A senha deve conter pelo menos uma letra e um número'
      });
    }

    // Verificar se usuário existe
    const usuario = await prisma.user.findUnique({
      where: { id }
    });

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Trim da senha para remover espaços em branco
    const senhaLimpa = novaSenha.trim();
    console.log(`[ADMIN] Redefinindo senha para usuário ${id} (${usuario.email.substring(0, 3)}***)`);
    console.log(`[ADMIN] Tamanho da senha: ${senhaLimpa.length} caracteres`);

    // Hash da nova senha
    const senhaHash = await bcrypt.hash(senhaLimpa, 10);
    console.log(`[ADMIN] Hash gerado: ${senhaHash.substring(0, 20)}...`);

    // Atualizar senha do usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { senhaHash },
      select: {
        id: true,
        email: true,
        senhaHash: true
      }
    });

    // Verificar se a senha foi atualizada corretamente (TESTE CRÍTICO)
    const senhaVerificada = await bcrypt.compare(senhaLimpa, updatedUser.senhaHash);
    if (!senhaVerificada) {
      console.error(`[ADMIN] ERRO CRÍTICO: Senha não corresponde após atualização para usuário ${id}`);
      return res.status(500).json({
        error: 'Erro ao atualizar senha. A senha não foi salva corretamente. Tente novamente.'
      });
    }

    console.log(`[ADMIN] ✅ Senha verificada com sucesso para usuário ${id} (${updatedUser.email})`);

    // Invalidar todos os refresh tokens do usuário (segurança)
    await prisma.refreshToken.deleteMany({
      where: { userId: id }
    });

    console.log(`[ADMIN] Senha redefinida pelo admin ${req.userId} para usuário ${id} (${usuario.email.substring(0, 3)}***)`);

    res.status(200).json({
      message: 'Senha redefinida com sucesso',
      usuarioId: id
    });

  } catch (error: any) {
    console.error('Erro ao redefinir senha do usuário:', error);
    res.status(500).json({
      error: 'Erro ao redefinir senha do usuário',
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
    hoje.setHours(0, 0, 0, 0);
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

    // Calcular cadastros por período - com tratamento de erro
    let cadastros = {
      hoje: 0,
      estaSemana: 0,
      esteMes: 0,
      crescimentoPercentual: 0,
      porDia: [] as Array<{ data: string, quantidade: number }>
    };

    try {
      // Usar UTC para evitar problemas de timezone
      const hojeUTC = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0, 0));
      
      const inicioSemana = new Date(hojeUTC);
      const diaSemana = hojeUTC.getUTCDay(); // 0 = domingo, 1 = segunda, etc.
      // Calcular segunda-feira da semana (se for domingo, voltar 6 dias; caso contrário, voltar diaSemana - 1)
      const diasParaSegunda = diaSemana === 0 ? 6 : diaSemana - 1;
      inicioSemana.setUTCDate(hojeUTC.getUTCDate() - diasParaSegunda);
      
      const inicioMesAnterior = new Date(Date.UTC(hojeUTC.getUTCFullYear(), hojeUTC.getUTCMonth() - 1, 1, 0, 0, 0, 0));
      const fimMesAnterior = new Date(Date.UTC(hojeUTC.getUTCFullYear(), hojeUTC.getUTCMonth(), 0, 23, 59, 59, 999));
      const inicio30Dias = new Date(hojeUTC);
      inicio30Dias.setUTCDate(hojeUTC.getUTCDate() - 30);
      
      const inicioMesUTC = new Date(Date.UTC(hojeUTC.getUTCFullYear(), hojeUTC.getUTCMonth(), 1, 0, 0, 0, 0));

      // Cadastros por período
      const [cadastrosHoje, cadastrosEstaSemana, cadastrosEsteMes, cadastrosMesAnterior] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: { gte: hojeUTC }
          }
        }),
        prisma.user.count({
          where: {
            createdAt: { gte: inicioSemana }
          }
        }),
        prisma.user.count({
          where: {
            createdAt: { gte: inicioMesUTC }
          }
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: inicioMesAnterior,
              lte: fimMesAnterior
            }
          }
        })
      ]);

      // Calcular crescimento percentual (comparar mês atual com mês anterior)
      const crescimentoPercentual = cadastrosMesAnterior > 0
        ? ((cadastrosEsteMes - cadastrosMesAnterior) / cadastrosMesAnterior) * 100
        : cadastrosEsteMes > 0 ? 100 : 0;

      // Buscar cadastros agrupados por dia (últimos 30 dias)
      const usuarios30Dias = await prisma.user.findMany({
        where: {
          createdAt: { gte: inicio30Dias }
        },
        select: {
          createdAt: true
        }
      });

      // Agrupar por dia
      const cadastrosPorDiaMap = new Map<string, number>();
      
      // Inicializar todos os dias dos últimos 30 dias com 0
      for (let i = 0; i < 30; i++) {
        const data = new Date(inicio30Dias);
        data.setUTCDate(inicio30Dias.getUTCDate() + i);
        data.setUTCHours(0, 0, 0, 0);
        const dataStr = data.toISOString().split('T')[0]; // YYYY-MM-DD
        cadastrosPorDiaMap.set(dataStr, 0);
      }

      // Contar cadastros por dia
      usuarios30Dias.forEach(user => {
        // Converter para UTC e pegar apenas a data (sem hora)
        const userDate = new Date(user.createdAt);
        const dataStr = new Date(Date.UTC(
          userDate.getUTCFullYear(),
          userDate.getUTCMonth(),
          userDate.getUTCDate()
        )).toISOString().split('T')[0];
        const atual = cadastrosPorDiaMap.get(dataStr) || 0;
        cadastrosPorDiaMap.set(dataStr, atual + 1);
      });

      // Converter para array e ordenar por data
      const cadastrosPorDia = Array.from(cadastrosPorDiaMap.entries())
        .map(([data, quantidade]) => ({
          data,
          quantidade
        }))
        .sort((a, b) => a.data.localeCompare(b.data));

      cadastros = {
        hoje: cadastrosHoje,
        estaSemana: cadastrosEstaSemana,
        esteMes: cadastrosEsteMes,
        crescimentoPercentual: Math.round(crescimentoPercentual * 100) / 100,
        porDia: cadastrosPorDia
      };
    } catch (error: any) {
      console.error('Erro ao calcular cadastros:', error);
      console.error('Stack trace:', error.stack);
      // Usar valores padrão (já inicializados acima)
    }

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
      },
      cadastros: cadastros
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
        semEquipamento: true,
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
          semEquipamento: true,
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
            semEquipamento: true,
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
                semEquipamento: true,
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
      semEquipamento,
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

    // Validar semEquipamento: se true, equipamentoNecessario deve estar vazio ou conter apenas "Peso Corporal"
    const equipamentosArray = Array.isArray(equipamentoNecessario) ? equipamentoNecessario : [];
    const semEquipamentoValue = semEquipamento === true || semEquipamento === 'true';
    
    if (semEquipamentoValue) {
      const equipamentosValidos = equipamentosArray.filter((eq: string) => {
        const eqLower = eq.toLowerCase().trim();
        return eqLower === '' || 
               eqLower.includes('peso corporal') || 
               eqLower.includes('corpo') ||
               eqLower === 'nenhum';
      });
      
      if (equipamentosArray.length > 0 && equipamentosValidos.length !== equipamentosArray.length) {
        return res.status(400).json({
          error: 'Se o exercício é sem equipamento, o campo equipamentoNecessario deve estar vazio ou conter apenas "Peso Corporal"'
        });
      }
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
      cargaInicialSugerida: cargaInicialSugerida === null || cargaInicialSugerida === undefined || cargaInicialSugerida === ''
        ? null
        : (isNaN(parseFloat(cargaInicialSugerida)) ? null : parseFloat(cargaInicialSugerida)),
      rpeSugerido: rpeSugerido === null || rpeSugerido === undefined || rpeSugerido === ''
        ? null
        : (isNaN(parseInt(rpeSugerido)) ? null : parseInt(rpeSugerido)),
      equipamentoNecessario: equipamentosArray,
      semEquipamento: semEquipamentoValue,
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
        semEquipamento: true,
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
      semEquipamento,
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

    // Validar semEquipamento: se true, equipamentoNecessario deve estar vazio ou conter apenas "Peso Corporal"
    const equipamentosArray = equipamentoNecessario !== undefined 
      ? (Array.isArray(equipamentoNecessario) ? equipamentoNecessario : [])
      : exercicioExistente.equipamentoNecessario;
    const semEquipamentoValue = semEquipamento !== undefined 
      ? (semEquipamento === true || semEquipamento === 'true')
      : exercicioExistente.semEquipamento;
    
    if (semEquipamentoValue) {
      const equipamentosValidos = equipamentosArray.filter((eq: string) => {
        const eqLower = eq.toLowerCase().trim();
        return eqLower === '' || 
               eqLower.includes('peso corporal') || 
               eqLower.includes('corpo') ||
               eqLower === 'nenhum';
      });
      
      if (equipamentosArray.length > 0 && equipamentosValidos.length !== equipamentosArray.length) {
        return res.status(400).json({
          error: 'Se o exercício é sem equipamento, o campo equipamentoNecessario deve estar vazio ou conter apenas "Peso Corporal"'
        });
      }
    }

    // Preparar dados para atualização
    const data: any = {};
    if (nome !== undefined) data.nome = nome;
    if (grupoMuscularPrincipal !== undefined) data.grupoMuscularPrincipal = grupoMuscularPrincipal;
    if (sinergistas !== undefined) data.sinergistas = Array.isArray(sinergistas) ? sinergistas : [];
    if (descricao !== undefined) data.descricao = descricao || null;
    if (execucaoTecnica !== undefined) data.execucaoTecnica = execucaoTecnica || null;
    if (errosComuns !== undefined) data.errosComuns = Array.isArray(errosComuns) ? errosComuns : [];
    if (cargaInicialSugerida !== undefined) {
      // Aceitar null, 0 ou valores numéricos válidos
      if (cargaInicialSugerida === null || cargaInicialSugerida === '') {
        data.cargaInicialSugerida = null;
      } else {
        const parsed = parseFloat(cargaInicialSugerida);
        data.cargaInicialSugerida = isNaN(parsed) ? null : parsed;
      }
    }
    if (rpeSugerido !== undefined) {
      // Aceitar null, 0 ou valores numéricos válidos (1-10)
      if (rpeSugerido === null || rpeSugerido === '') {
        data.rpeSugerido = null;
      } else {
        const parsed = parseInt(rpeSugerido);
        data.rpeSugerido = isNaN(parsed) ? null : parsed;
      }
    }
    if (equipamentoNecessario !== undefined) data.equipamentoNecessario = equipamentosArray;
    if (semEquipamento !== undefined) data.semEquipamento = semEquipamentoValue;
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
        semEquipamento: true,
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

// Testar envio de e-mail de remarketing para um usuário específico
export const testarEmailRemarketing = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tipo } = req.body;

    // Validar tipo
    if (!tipo || !['10min', '24h', '48h'].includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo de e-mail inválido',
        message: 'O tipo deve ser: 10min, 24h ou 48h'
      });
    }

    // Verificar se usuário existe
    const usuario = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nome: true
      }
    });

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    if (!usuario.email) {
      return res.status(400).json({
        error: 'Usuário não possui e-mail cadastrado'
      });
    }

    // Enviar e-mail de remarketing
    const resultado = await sendRemarketingEmail(tipo as '10min' | '24h' | '48h', {
      nome: usuario.nome || 'Treinador',
      email: usuario.email
    });

    if (!resultado.success) {
      console.error(`[Admin] Erro ao enviar e-mail de remarketing ${tipo} para usuário ${id}:`, resultado.error);
      return res.status(500).json({
        error: 'Erro ao enviar e-mail',
        message: resultado.error || 'Erro desconhecido ao enviar e-mail'
      });
    }

    console.log(`[Admin] E-mail de remarketing ${tipo} enviado com sucesso para usuário ${id} (${usuario.email.substring(0, 3)}***)`);

    res.json({
      message: `E-mail de remarketing (${tipo}) enviado com sucesso`,
      tipo,
      email: usuario.email.substring(0, 3) + '***',
      messageId: resultado.messageId
    });
  } catch (error: any) {
    console.error('Erro ao testar envio de e-mail de remarketing:', error);
    res.status(500).json({
      error: 'Erro ao testar envio de e-mail',
      message: error.message
    });
  }
};

