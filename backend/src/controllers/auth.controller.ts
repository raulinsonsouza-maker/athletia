import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { logAuthFailed, logSecurityEvent, SecurityEventType, SecurityEventSeverity } from '../utils/security-logger';
import { sendTemplateMessage, normalizePhoneNumber } from '../services/whatsapp.service';
import { isTemplateApproved } from '../services/whatsapp-template.service';
import { safeFindUserByEmail, safeFindUserById } from '../utils/safe-prisma-user';

// Validar variáveis de ambiente críticas para segurança
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não está definido nas variáveis de ambiente. Configure no arquivo .env antes de iniciar o servidor.');
}

if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error('JWT_REFRESH_SECRET não está definido nas variáveis de ambiente. Configure no arquivo .env antes de iniciar o servidor.');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Envia mensagem WhatsApp de boas-vindas após cadastro
 */
async function enviarMensagemBoasVindasWhatsApp(
  userId: string,
  phoneNumber: string,
  nome: string
): Promise<void> {
  try {
    // Verificar se integração está ativa
    const config = await prisma.whatsAppConfig.findFirst({
      where: { isActive: true }
    });

    if (!config) {
      console.log('[WHATSAPP] Integração não configurada, pulando envio de boas-vindas');
      return;
    }

    // Verificar se template está aprovado
    const templateName = 'trial_welcome';
    const isApproved = await isTemplateApproved(templateName);

    if (!isApproved) {
      console.warn(`[WHATSAPP] Template ${templateName} não aprovado, pulando envio`);
      return;
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const frontendUrl = process.env.FRONTEND_URL || 'https://athletia.site';
    const loginUrl = `${frontendUrl}/login`;

    // Enviar template
    const result = await sendTemplateMessage(
      normalizedPhone,
      templateName,
      'pt_BR',
      [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: nome },
            { type: 'text', text: loginUrl }
          ]
        }
      ],
      userId
    );

    if (result.success) {
      console.log(`[WHATSAPP] Mensagem de boas-vindas enviada para ${normalizedPhone}`);
    } else {
      console.error(`[WHATSAPP] Erro ao enviar boas-vindas:`, result.error);
    }
  } catch (error: any) {
    console.error('[WHATSAPP] Erro ao enviar mensagem de boas-vindas:', error);
    // Não lançar erro - não deve quebrar o cadastro
  }
}

// Gerar tokens
const generateTokens = (userId: string, rememberMe: boolean = true) => {
  if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error('JWT secrets não configurados');
  }
  
  // Se rememberMe = true: access token expira em 7 dias (mesmo que refresh token)
  // Se rememberMe = false: access token expira em 1 hora (sessionStorage)
  const accessTokenExpiresIn = rememberMe ? '7d' : '1h';
  
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: accessTokenExpiresIn } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
};

// Salvar refresh token no banco
const saveRefreshToken = async (userId: string, token: string) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt
    }
  });
};

type OnboardingPayload = {
  idade?: number | string | null;
  sexo?: string | null;
  tipoCorpo?: string | null;
  altura?: number | string | null;
  pesoAtual?: number | string | null;
  percentualGordura?: number | string | null;
  aguaDiaria?: number | string | null;
  experiencia?: string | null;
  objetivo?: string | null;
  frequenciaSemanal?: number | string | null;
  tempoDisponivel?: number | string | null;
  localTreino?: string | null;
  problemasAnteriores?: string[] | null;
  objetivosAdicionais?: string[] | null;
  lesoes?: string[] | null;
  preferencias?: string[] | null;
  rpePreferido?: number | string | null;
};

const parseNumber = (value: any): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const numero = Number(value);
  return Number.isFinite(numero) ? numero : null;
};

const normalizeArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => (item !== null && item !== undefined ? String(item).trim() : ''))
      .filter(Boolean);
  }
  const unico = String(value).trim();
  return unico ? [unico] : [];
};

const normalizeOnboardingData = (data: OnboardingPayload | undefined) => {
  if (!data) return null;
  return {
    idade: parseNumber(data.idade),
    sexo: data.sexo ? String(data.sexo).trim() : null,
    tipoCorpo: data.tipoCorpo ? String(data.tipoCorpo).trim() : null,
    altura: parseNumber(data.altura),
    pesoAtual: parseNumber(data.pesoAtual),
    percentualGordura: parseNumber(data.percentualGordura),
    aguaDiaria:
      data.aguaDiaria !== undefined && data.aguaDiaria !== null && data.aguaDiaria !== ''
        ? String(data.aguaDiaria).trim()
        : null,
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

// Registrar novo usuário
export const register = async (req: Request, res: Response) => {
  try {
    const { email, senha, nome } = req.body;

    const emailNormalizado = (email || '').trim().toLowerCase();

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: emailNormalizado }
    });

    if (existingUser) {
      // Se usuário existe e já usou trial, retornar erro específico
      if (existingUser.trialUtilizado) {
        return res.status(400).json({
          error: 'Este e-mail já utilizou o período de trial gratuito. Faça login ou escolha um plano.'
        });
      }
      return res.status(400).json({
        error: 'Email já cadastrado'
      });
    }

    // Importar função de trial
    const { calcularDataFimTrial } = await import('../services/trial.service');

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Calcular datas do trial
    const dataInicioTrial = new Date();
    const dataFimTrial = calcularDataFimTrial(dataInicioTrial);

    // Criar usuário com trial iniciado
    const user = await prisma.user.create({
      data: {
        email: emailNormalizado,
        senhaHash,
        nome: nome || null,
        dataInicioTrial,
        dataFimTrial,
        trialUtilizado: true
      },
      select: {
        id: true,
        email: true,
        nome: true,
        role: true,
        createdAt: true,
        dataInicioTrial: true,
        dataFimTrial: true,
        trialUtilizado: true
      }
    });

    // Gerar tokens (register sempre usa rememberMe = true por padrão)
    const { accessToken, refreshToken } = generateTokens(user.id, true);
    await saveRefreshToken(user.id, refreshToken);

    res.status(201).json({
      message: 'Usuário criado com sucesso. Você tem 24 horas de acesso gratuito!',
      user,
      accessToken,
      refreshToken
    });
  } catch (error: any) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      error: 'Erro ao criar usuário',
      message: error.message
    });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, senha, rememberMe } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        error: 'Usuário e senha são obrigatórios'
      });
    }

    // Normalizar email/username (trim e lowercase)
    // O express-validator já normalizou, mas garantimos aqui também
    const emailNormalizado = (email || '').trim().toLowerCase();

    if (!emailNormalizado) {
      return res.status(400).json({
        error: 'Usuário ou email é obrigatório'
      });
    }

    // SEGURANÇA: Não logar email completo, apenas hash parcial para privacidade
    const emailHash = emailNormalizado.substring(0, 3) + '***';
    console.log(`[LOGIN] Tentativa de login para: ${emailHash}`);

    // Buscar usuário por email (pode ser email ou username)
    // O campo email no banco pode conter tanto email quanto username
    // Usar função segura que funciona mesmo se campos WhatsApp não existirem
    const user = await safeFindUserByEmail(emailNormalizado);

    if (!user) {
      // SEGURANÇA: Logar tentativa de login falhada
      logAuthFailed(emailHash, 'Usuário não encontrado', req);
      console.log(`[LOGIN] Usuário não encontrado: ${emailHash}`);
      return res.status(401).json({
        error: 'Usuário ou senha inválidos'
      });
    }

    console.log(`[LOGIN] Usuário encontrado: ${emailHash} (Role: ${user.role}, Email: ${user.email})`);

    // Verificar se senhaHash existe
    if (!user.senhaHash) {
      console.error(`[LOGIN] ERRO: Usuário ${emailHash} não tem senhaHash no banco`);
      return res.status(401).json({
        error: 'Usuário ou senha inválidos'
      });
    }

    // Trim da senha para garantir consistência (mesmo tratamento que no reset)
    const senhaLimpa = (senha || '').trim();
    
    // Verificar senha
    const senhaValida = await bcrypt.compare(senhaLimpa, user.senhaHash);

    if (!senhaValida) {
      console.log(`[LOGIN] Senha inválida para usuário: ${emailHash} (Email: ${user.email})`);
      console.log(`[LOGIN DEBUG] Tamanho da senha recebida: ${senhaLimpa.length} caracteres`);
      console.log(`[LOGIN DEBUG] Hash no banco: ${user.senhaHash.substring(0, 20)}...`);
      
      // Teste adicional: verificar se a senha tem espaços ou caracteres especiais
      if (senha !== senhaLimpa) {
        console.log(`[LOGIN DEBUG] ATENÇÃO: Senha tinha espaços em branco que foram removidos`);
      }
      
      return res.status(401).json({
        error: 'Usuário ou senha inválidos'
      });
    }

    console.log(`[LOGIN] Login bem-sucedido para: ${emailHash} (Role: ${user.role})`);

    // Gerar tokens com rememberMe (padrão true se não especificado)
    const rememberMeValue = rememberMe !== undefined ? Boolean(rememberMe) : true;
    const { accessToken, refreshToken } = generateTokens(user.id, rememberMeValue);
    await saveRefreshToken(user.id, refreshToken);

    // Verificar status do trial
    const { verificarTrialAtivo, obterDiasRestantesTrial } = await import('../services/trial.service');
    const trialAtivo = await verificarTrialAtivo(user.id);
    const diasRestantesTrial = await obterDiasRestantesTrial(user.id);

    res.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: user.role,
        planoAtivo: user.planoAtivo,
        plano: user.plano,
        dataExpiracao: user.dataExpiracao,
        dataInicioTrial: user.dataInicioTrial,
        dataFimTrial: user.dataFimTrial,
        trialUtilizado: user.trialUtilizado
      },
      trialStatus: {
        ativo: trialAtivo,
        diasRestantes: diasRestantesTrial
      },
      accessToken,
      refreshToken
    });
  } catch (error: any) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro ao fazer login',
      message: error.message
    });
  }
};

// Obter dados do usuário autenticado
export const obterUsuario = async (req: any, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nome: true,
        role: true,
        planoAtivo: true,
        plano: true,
        dataPagamento: true,
        dataExpiracao: true,
        dataInicioTrial: true,
        dataFimTrial: true,
        trialUtilizado: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar status do trial
    const { verificarTrialAtivo, obterDiasRestantesTrial } = await import('../services/trial.service');
    const trialAtivo = await verificarTrialAtivo(userId);
    const diasRestantesTrial = await obterDiasRestantesTrial(userId);

    res.json({
      user: {
        ...user,
        dataPagamento: user.dataPagamento?.toISOString() || null,
        dataExpiracao: user.dataExpiracao?.toISOString() || null,
        dataInicioTrial: user.dataInicioTrial?.toISOString() || null,
        dataFimTrial: user.dataFimTrial?.toISOString() || null,
        createdAt: user.createdAt.toISOString()
      },
      trialStatus: {
        ativo: trialAtivo,
        diasRestantes: diasRestantesTrial
      }
    });
  } catch (error: any) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({
      error: 'Erro ao obter dados do usuário',
      message: error.message
    });
  }
};

// Refresh token
// Obter status do trial
export const obterStatusTrial = async (req: any, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { obterStatusTrial: obterStatusTrialService } = await import('../services/trial.service');
    const status = await obterStatusTrialService(userId);

    res.json(status);
  } catch (error: any) {
    console.error('Erro ao obter status do trial:', error);
    res.status(500).json({
      error: 'Erro ao obter status do trial',
      message: error.message
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    // Verificar token no banco
    // Usar select explícito para evitar erro se campos WhatsApp não existirem ainda
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nome: true,
            role: true,
            planoAtivo: true,
            dataExpiracao: true,
            dataInicioTrial: true,
            dataFimTrial: true,
            trialUtilizado: true,
            ativo: true
            // Campos WhatsApp omitidos intencionalmente para compatibilidade
          }
        }
      }
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({
        error: 'Refresh token inválido ou expirado'
      });
    }

    // Verificar assinatura
    try {
      jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
      // Remover token inválido
      await prisma.refreshToken.delete({
        where: { id: storedToken.id }
      });
      return res.status(401).json({
        error: 'Refresh token inválido'
      });
    }

    // Gerar novo access token (refresh mantém rememberMe = true por padrão)
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(storedToken.userId, true);

    // Atualizar refresh token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id }
    });
    await saveRefreshToken(storedToken.userId, newRefreshToken);

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error: any) {
    console.error('Erro ao renovar token:', error);
    res.status(500).json({
      error: 'Erro ao renovar token',
      message: error.message
    });
  }
};

// Gerar senha aleatória
const generateRandomPassword = (length: number = 12): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Cadastro pré-pagamento (cria usuário sem plano ativo, sem gerar treinos)
export const cadastroPrePagamento = async (req: Request, res: Response) => {
  try {
    const { nome, telefone, email, senha, onboarding } = req.body;

    // Validações
    if (!nome || !email || !telefone || !senha) {
      return res.status(400).json({
        error: 'Nome, e-mail, telefone e senha são obrigatórios'
      });
    }

    if (!onboarding) {
      return res.status(400).json({
        error: 'Dados do onboarding são obrigatórios'
      });
    }

    const emailNormalizado = email.toLowerCase().trim();

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: emailNormalizado }
    });

    if (existingUser) {
      // Se usuário existe e já usou trial, retornar erro específico
      if (existingUser.trialUtilizado) {
        return res.status(400).json({
          error: 'Este e-mail já utilizou o período de trial gratuito. Faça login ou escolha um plano.'
        });
      }
      return res.status(400).json({
        error: 'E-mail já cadastrado'
      });
    }

    // Importar funções de trial
    const { calcularDataFimTrial } = await import('../services/trial.service');

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Calcular datas do trial
    const dataInicioTrial = new Date();
    const dataFimTrial = calcularDataFimTrial(dataInicioTrial);

    // Normalizar telefone para formato E.164 (se fornecido)
    let whatsappPhoneNumber: string | null = null;
    if (telefone) {
      // Remove caracteres não numéricos
      const cleaned = telefone.replace(/\D/g, '');
      // Adiciona código do país se não tiver
      if (cleaned.length > 0) {
        if (!cleaned.startsWith('55')) {
          whatsappPhoneNumber = '+55' + cleaned;
        } else {
          whatsappPhoneNumber = '+' + cleaned;
        }
      }
    }

    // Criar usuário com planoAtivo = false e trial iniciado
    const user = await prisma.user.create({
      data: {
        email: emailNormalizado,
        senhaHash,
        nome: nome.trim(),
        telefone: telefone.trim(),
        whatsappPhoneNumber,
        planoAtivo: false, // Ainda não pagou
        role: 'USER',
        dataInicioTrial,
        dataFimTrial,
        trialUtilizado: true
      }
    });

    // Criar perfil com dados do onboarding
    const onboardingData = normalizeOnboardingData(onboarding);
    if (!onboardingData) {
      return res.status(400).json({
        error: 'Dados do onboarding são inválidos'
      });
    }

    await prisma.perfil.create({
      data: {
        userId: user.id,
        idade: onboardingData?.idade ?? null,
        sexo: onboardingData?.sexo ?? null,
        tipoCorpo: onboardingData?.tipoCorpo ?? null,
        altura: onboardingData?.altura ?? null,
        pesoAtual: onboardingData?.pesoAtual ?? null,
        percentualGordura: onboardingData?.percentualGordura ?? null,
        aguaDiaria: onboardingData?.aguaDiaria ?? null,
        experiencia: onboardingData?.experiencia ?? null,
        objetivo: onboardingData?.objetivo ?? null,
        frequenciaSemanal: onboardingData?.frequenciaSemanal ?? null,
        tempoDisponivel: onboardingData?.tempoDisponivel ?? null,
        localTreino: onboardingData?.localTreino ?? null,
        problemasAnteriores: onboardingData?.problemasAnteriores ?? [],
        objetivosAdicionais: onboardingData?.objetivosAdicionais ?? [],
        lesoes: onboardingData?.lesoes ?? [],
        preferencias: onboardingData?.preferencias ?? [],
        rpePreferido: onboardingData?.rpePreferido ?? null
      }
    });

    // Se peso foi informado, criar registro no histórico
    if (onboardingData.pesoAtual !== null) {
      await prisma.historicoPeso.create({
        data: {
          userId: user.id,
          peso: onboardingData.pesoAtual
        }
      });
    }

    // Enviar mensagem WhatsApp de boas-vindas (assíncrono, não bloqueia resposta)
    if (whatsappPhoneNumber) {
      enviarMensagemBoasVindasWhatsApp(user.id, whatsappPhoneNumber, user.nome || nome.trim()).catch((error: any) => {
        console.error('Erro ao enviar mensagem WhatsApp de boas-vindas:', error);
        // Não falhar o cadastro se WhatsApp falhar
      });
    }

    // Gerar treinos para trial (permite acesso imediato ao sistema por 24 horas)
    try {
      const { gerarTreinos30Dias } = await import('../services/treino.service');
      console.log(`🔄 Gerando treinos para trial de 24 horas para o usuário ${user.id}...`);
      
      await gerarTreinos30Dias(user.id);
      console.log('✅ Treinos gerados com sucesso para trial');
    } catch (error: any) {
      console.error('⚠️ Erro ao gerar treinos para trial (não crítico):', error.message);
      // Não falhar o cadastro se houver erro ao gerar treinos
    }

    // Gerar tokens para login automático (cadastro sempre usa rememberMe = true)
    const { accessToken, refreshToken } = generateTokens(user.id, true);
    await saveRefreshToken(user.id, refreshToken);

    // Enviar e-mail de boas-vindas para trial (não crítico - não deve bloquear cadastro)
    try {
      const { sendTrialWelcomeEmail } = await import('../services/email.service');
      sendTrialWelcomeEmail({
        nome: user.nome || 'Usuário',
        email: user.email,
        dataFimTrial: dataFimTrial
      }).then((result) => {
        if (result.success) {
          console.log('✅ E-mail de boas-vindas trial enviado com sucesso para:', user.email.substring(0, 3) + '***');
        } else {
          console.warn('⚠️ Falha ao enviar e-mail de boas-vindas trial (não crítico):', result.error);
        }
      }).catch((error) => {
        console.error('⚠️ Erro ao enviar e-mail de boas-vindas trial (não crítico):', error.message);
      });
    } catch (error: any) {
      console.error('⚠️ Erro ao importar/enviar e-mail de boas-vindas trial (não crítico):', error.message);
      // Não falhar o cadastro se houver erro no envio de email
    }

    res.status(201).json({
      message: 'Cadastro realizado com sucesso. Você tem 24 horas de acesso gratuito!',
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        planoAtivo: user.planoAtivo,
        dataInicioTrial: user.dataInicioTrial,
        dataFimTrial: user.dataFimTrial,
        trialUtilizado: user.trialUtilizado
      },
      accessToken,
      refreshToken
    });
  } catch (error: any) {
    console.error('Erro no cadastro pré-pagamento:', error);
    res.status(500).json({
      error: 'Erro ao realizar cadastro',
      message: error.message
    });
  }
};

// Cadastro completo com onboarding e perfil
export const cadastroCompleto = async (req: Request, res: Response) => {
  try {
    const { nome, dataNascimento, email, telefone, plano, onboarding } = req.body;

    // Validações
    if (!nome || !email || !telefone || !plano) {
      return res.status(400).json({
        error: 'Nome, e-mail, telefone e plano são obrigatórios'
      });
    }

    if (!onboarding) {
      return res.status(400).json({
        error: 'Dados do onboarding são obrigatórios'
      });
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'E-mail já cadastrado'
      });
    }

    // Gerar senha aleatória
    const senhaGerada = generateRandomPassword(12);
    const senhaHash = await bcrypt.hash(senhaGerada, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        senhaHash,
        nome: nome.trim(),
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        telefone: telefone.trim(),
        plano: plano.toUpperCase(),
        role: 'USER'
      }
    });

    // Criar perfil com dados do onboarding
    const onboardingData = normalizeOnboardingData(onboarding);
    if (!onboardingData) {
      return res.status(400).json({
        error: 'Dados do onboarding são inválidos'
      });
    }

    await prisma.perfil.create({
      data: {
        userId: user.id,
        idade: onboardingData?.idade ?? null,
        sexo: onboardingData?.sexo ?? null,
        tipoCorpo: onboardingData?.tipoCorpo ?? null,
        altura: onboardingData?.altura ?? null,
        pesoAtual: onboardingData?.pesoAtual ?? null,
        percentualGordura: onboardingData?.percentualGordura ?? null,
        aguaDiaria: onboardingData?.aguaDiaria ?? null,
        experiencia: onboardingData?.experiencia ?? null,
        objetivo: onboardingData?.objetivo ?? null,
        frequenciaSemanal: onboardingData?.frequenciaSemanal ?? null,
        tempoDisponivel: onboardingData?.tempoDisponivel ?? null,
        localTreino: onboardingData?.localTreino ?? null,
        problemasAnteriores: onboardingData?.problemasAnteriores ?? [],
        objetivosAdicionais: onboardingData?.objetivosAdicionais ?? [],
        lesoes: onboardingData?.lesoes ?? [],
        preferencias: onboardingData?.preferencias ?? [],
        rpePreferido: onboardingData?.rpePreferido ?? null
      }
    });

    if (onboardingData.pesoAtual !== null) {
      await prisma.historicoPeso.create({
        data: {
          userId: user.id,
          peso: onboardingData.pesoAtual
        }
      });
    }

    // Gerar treinos para 30 dias
    try {
      const { gerarTreinos30Dias } = await import('../services/treino.service');
      await gerarTreinos30Dias(user.id);
      console.log(`[Ativação Plano] Treinos gerados para usuário ${user.id}`);
    } catch (error: any) {
      console.error(`⚠️ Erro ao gerar treinos:`, error);
      // Não falhar o cadastro se não conseguir gerar treinos
    }

    // Nota: Envio de e-mail com credenciais deve ser implementado no futuro
    // Para produção, é recomendado integrar com serviço de e-mail (SendGrid, AWS SES, etc.)
    // e enviar as credenciais de forma segura via e-mail ao invés de retornar no JSON
    if (process.env.NODE_ENV === 'development') {
      // SEGURANÇA: Não logar senha, apenas confirmar que foi gerada
      const emailHash = email.substring(0, 3) + '***';
      console.log(`[Ativação Plano] E-mail para ${emailHash}:`);
      console.log(`   Usuário: ${emailHash}`);
      console.log(`   Senha: [REDACTED]`);
      console.log(`   Link de login: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`);
    }
    
    // Exemplo de implementação futura:
    // await sendEmail({
    //   to: email,
    //   subject: 'Bem-vindo ao AthletIA - Suas credenciais de acesso',
    //   template: 'welcome',
    //   data: {
    //     nome,
    //     email,
    //     senha: senhaGerada,
    //     loginUrl: `${process.env.FRONTEND_URL}/login`
    //   }
    // });

    res.status(201).json({
      message: 'Cadastro realizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        plano: user.plano
      },
      // SEGURANÇA: Nunca retornar senha em resposta JSON, mesmo em development
      // Senha deve ser enviada apenas via email seguro
    });
  } catch (error: any) {
    console.error('Erro no cadastro completo:', error);
    res.status(500).json({
      error: 'Erro ao realizar cadastro',
      message: error.message
    });
  }
};

/**
 * ATENÇÃO: Este endpoint é apenas para uso interno/testes.
 * 
 * IMPORTANTE: Em produção, planos devem ser ativados APENAS via webhook do Cakto
 * (endpoint: /api/webhooks/cakto com evento 'purchase_approved').
 * 
 * Este endpoint requer:
 * 1. Autenticação obrigatória (JWT)
 * 2. Pagamento válido no PaymentHistory com status 'completed'
 * 3. caktoTransactionId válido associado ao pagamento
 * 
 * Ativar plano após pagamento e gerar treinos
 */
export const ativarPlanoAposPagamento = async (req: any, res: Response) => {
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const timestamp = new Date().toISOString();
  
  try {
    // SEGURANÇA: Autenticação obrigatória
    if (!req.userId) {
      console.warn(`[Ativação Plano] [${requestId}] [SEGURANÇA] Tentativa sem autenticação:`, {
        timestamp,
        ip: clientIp,
        userAgent: req.headers['user-agent'] || 'unknown'
      });
      return res.status(401).json({
        error: 'Autenticação obrigatória. Use o webhook do Cakto para ativar planos em produção.'
      });
    }

    // SEGURANÇA: Log de monitoramento para todas as tentativas
    console.log(`[Ativação Plano] [${requestId}] Tentativa de ativação de plano:`, {
      timestamp,
      ip: clientIp,
      userId: req.userId,
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    const userId = req.userId; // Sempre usar do token JWT (mais seguro)
    const { plano, transactionId } = req.body;

    // Validações básicas
    if (!plano) {
      console.log(`[Ativação Plano] [${requestId}] Validação falhou: plano ausente`);
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

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { perfil: true }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // SEGURANÇA: Verificar se existe pagamento válido no PaymentHistory
    // Se transactionId foi fornecido, verificar especificamente esse pagamento
    // Caso contrário, verificar o último pagamento válido do usuário
    let pagamentoValido = null;
    
    if (transactionId) {
      // Verificar pagamento específico
      pagamentoValido = await prisma.paymentHistory.findFirst({
        where: {
          userId: userId,
          transactionId: transactionId,
          status: 'completed',
          eventType: 'purchase_approved'
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!pagamentoValido) {
        console.warn(`[Ativação Plano] [${requestId}] [SEGURANÇA] Pagamento não encontrado ou inválido:`, {
          userId,
          transactionId,
          ip: clientIp
        });
        return res.status(403).json({
          error: 'Pagamento não encontrado ou não aprovado. Não é possível ativar o plano sem um pagamento válido.',
          message: 'Em produção, use o webhook do Cakto para ativar planos automaticamente após pagamento.'
        });
      }
    } else {
      // Verificar último pagamento válido do usuário
      pagamentoValido = await prisma.paymentHistory.findFirst({
        where: {
          userId: userId,
          status: 'completed',
          eventType: 'purchase_approved'
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!pagamentoValido) {
        console.warn(`[Ativação Plano] [${requestId}] [SEGURANÇA] Nenhum pagamento válido encontrado para o usuário:`, {
          userId,
          ip: clientIp
        });
        return res.status(403).json({
          error: 'Nenhum pagamento válido encontrado. Não é possível ativar o plano sem um pagamento aprovado.',
          message: 'Em produção, use o webhook do Cakto para ativar planos automaticamente após pagamento.'
        });
      }
    }

    // SEGURANÇA: Verificar se o usuário já tem caktoTransactionId válido
    // Se o pagamento tem transactionId, verificar se corresponde
    if (pagamentoValido.transactionId && user.caktoTransactionId) {
      if (user.caktoTransactionId !== pagamentoValido.transactionId) {
        console.warn(`[Ativação Plano] [${requestId}] [SEGURANÇA] TransactionId não corresponde:`, {
          userId,
          userTransactionId: user.caktoTransactionId,
          paymentTransactionId: pagamentoValido.transactionId,
          ip: clientIp
        });
      }
    }

    // Calcular data de expiração baseada no plano
    const calcularDataExpiracao = (plano: string): Date => {
      const hoje = new Date();
      switch (plano.toUpperCase()) {
        case 'MENSAL':
          hoje.setMonth(hoje.getMonth() + 1);
          break;
        case 'TRIMESTRAL':
          hoje.setMonth(hoje.getMonth() + 3);
          break;
        case 'SEMESTRAL':
          hoje.setMonth(hoje.getMonth() + 6);
          break;
        default:
          hoje.setMonth(hoje.getMonth() + 1);
      }
      return hoje;
    };

    const dataExpiracao = calcularDataExpiracao(plano);

    // Atualizar usuário com plano ativo (usando dados do pagamento válido)
    const userAtualizado = await prisma.user.update({
      where: { id: userId },
      data: {
        planoAtivo: true,
        plano: plano.toUpperCase(),
        dataPagamento: pagamentoValido.createdAt, // Usar data do pagamento, não data atual
        dataExpiracao: dataExpiracao,
        caktoTransactionId: pagamentoValido.transactionId, // Atualizar com transactionId do pagamento
        // Preservar caktoCustomerId se já existir
        caktoCustomerId: user.caktoCustomerId || undefined
      }
    });

    // Gerar treinos para 30 dias automaticamente
    try {
      const { gerarTreinos30Dias } = await import('../services/treino.service');
      console.log(`🔄 [Ativação Plano] Gerando treinos para os próximos 30 dias para o usuário ${userId}...`);
      
      // Verificar se perfil existe e tem dados necessários
      if (!user.perfil) {
        console.warn(`⚠️ [Ativação Plano] Usuário ${userId} não possui perfil. Treinos não serão gerados.`);
      } else {
        const perfil = user.perfil;
        if (!perfil.frequenciaSemanal || !perfil.experiencia || !perfil.objetivo) {
          console.warn(`⚠️ [Ativação Plano] Perfil do usuário ${userId} incompleto. Dados faltando:`, {
            frequenciaSemanal: perfil.frequenciaSemanal,
            experiencia: perfil.experiencia,
            objetivo: perfil.objetivo
          });
        }
      }
      
      const treinosGerados = await gerarTreinos30Dias(userId);
      console.log(`[Ativação Plano] ${treinosGerados.length} treinos gerados com sucesso para o usuário ${userId}!`);
      
      if (treinosGerados.length === 0) {
        console.warn(`⚠️ [Ativação Plano] Nenhum treino foi gerado para o usuário ${userId}. Verifique se há exercícios cadastrados e se a frequência semanal está configurada.`);
      } else {
        console.log(`📊 [Ativação Plano] Detalhes dos treinos gerados:`, {
          total: treinosGerados.length,
          primeiroTreino: treinosGerados[0]?.data,
          ultimoTreino: treinosGerados[treinosGerados.length - 1]?.data
        });
      }
    } catch (error: any) {
      console.error(`[Ativação Plano] Erro ao gerar treinos após pagamento para o usuário ${userId}:`, error);
      console.error(`[Ativação Plano] Detalhes do erro:`, {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      // Não falhar a ativação se não conseguir gerar treinos
      // O treino será gerado automaticamente quando o usuário acessar a página de treino
    }

    console.log(`[Ativação Plano] [${requestId}] Plano ativado com sucesso:`, {
      userId: userAtualizado.id,
      email: userAtualizado.email?.substring(0, 3) + '***',
      plano: userAtualizado.plano,
      authenticated: !!req.userId
    });

    res.status(200).json({
      message: 'Plano ativado com sucesso. Treinos gerados automaticamente.',
      user: {
        id: userAtualizado.id,
        email: userAtualizado.email,
        nome: userAtualizado.nome,
        plano: userAtualizado.plano,
        planoAtivo: userAtualizado.planoAtivo
      }
    });
  } catch (error: any) {
    console.error(`[Ativação Plano] [${requestId}] Erro ao ativar plano:`, {
      error: error.message,
      stack: error.stack,
      ip: clientIp
    });
    res.status(500).json({
      error: 'Erro ao ativar plano',
      message: error.message
    });
  }
};

// Solicitar redefinição de senha
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'E-mail é obrigatório'
      });
    }

    // Normalizar e-mail
    const emailNormalizado = email.toLowerCase().trim();

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: emailNormalizado }
    });

    // SEGURANÇA: Sempre retornar sucesso para prevenir user enumeration
    // Não expor se o e-mail existe ou não
    if (!user) {
      // Simular delay para prevenir timing attacks
      await new Promise(resolve => setTimeout(resolve, 500));
      return res.status(200).json({
        message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.'
      });
    }

    // Verificar rate limiting: máximo 3 solicitações por hora por e-mail
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentRequests = await prisma.passwordResetToken.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: oneHourAgo
        }
      }
    });

    if (recentRequests >= 3) {
      return res.status(429).json({
        error: 'Muitas solicitações. Por favor, tente novamente em 1 hora.'
      });
    }

    // Gerar token único
    const { randomUUID } = await import('crypto');
    const token = randomUUID();

    // Expiração: 1 hora
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Salvar token no banco
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    // Enviar e-mail
    const { sendPasswordResetEmail } = await import('../services/email.service');
    const emailResult = await sendPasswordResetEmail({
      nome: user.nome || 'Usuário',
      email: user.email,
      token
    });

    if (!emailResult.success) {
      console.error('❌ Erro ao enviar e-mail de redefinição:', emailResult.error);
      // Não falhar a requisição se o e-mail não foi enviado
      // O token já foi criado, então o usuário pode tentar novamente
    }

    // Sempre retornar sucesso (segurança)
    res.status(200).json({
      message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.'
    });

  } catch (error: any) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    res.status(500).json({
      error: 'Erro ao processar solicitação',
      message: error.message
    });
  }
};

// Redefinir senha com token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Token e nova senha são obrigatórios'
      });
    }

    // Trim da senha para remover espaços em branco
    const senhaLimpa = newPassword.trim();

    if (senhaLimpa.length < 8) {
      return res.status(400).json({
        error: 'A senha deve ter no mínimo 8 caracteres'
      });
    }

    // Verificar se tem pelo menos 1 letra e 1 número
    const hasLetter = /[a-zA-Z]/.test(senhaLimpa);
    const hasNumber = /[0-9]/.test(senhaLimpa);

    if (!hasLetter || !hasNumber) {
      return res.status(400).json({
        error: 'A senha deve conter pelo menos uma letra e um número'
      });
    }

    // Verificar confirmação de senha se fornecida
    if (confirmPassword && confirmPassword.trim() !== senhaLimpa) {
      return res.status(400).json({
        error: 'As senhas não coincidem'
      });
    }

    // Buscar token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken) {
      return res.status(400).json({
        error: 'Token inválido ou expirado'
      });
    }

    // Verificar se token foi usado
    if (resetToken.used) {
      return res.status(400).json({
        error: 'Este link já foi utilizado. Solicite uma nova redefinição de senha.'
      });
    }

    // Verificar se token expirou
    if (new Date() > resetToken.expiresAt) {
      // Marcar como usado para limpeza
      await prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      });

      return res.status(400).json({
        error: 'Token expirado. Solicite uma nova redefinição de senha.'
      });
    }

    // Hash da nova senha (usar senha limpa, sem espaços)
    const senhaHash = await bcrypt.hash(senhaLimpa, 10);
    console.log(`[RESET PASSWORD] Hash gerado para usuário ${resetToken.userId} (email: ${resetToken.user.email})`);

    // Atualizar senha do usuário
    const updatedUser = await prisma.user.update({
      where: { id: resetToken.userId },
      data: { senhaHash },
      select: {
        id: true,
        email: true,
        senhaHash: true
      }
    });

    // Verificar se a senha foi atualizada corretamente
    const senhaVerificada = await bcrypt.compare(senhaLimpa, updatedUser.senhaHash);
    if (!senhaVerificada) {
      console.error(`[RESET PASSWORD] ERRO: Senha não corresponde após atualização para usuário ${resetToken.userId}`);
      return res.status(500).json({
        error: 'Erro ao atualizar senha. Tente novamente.'
      });
    }

    console.log(`[RESET PASSWORD] Senha verificada com sucesso para usuário ${resetToken.userId} (email: ${updatedUser.email})`);

    // Marcar token como usado
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true }
    });

    // Invalidar todos os refresh tokens do usuário (segurança)
    await prisma.refreshToken.deleteMany({
      where: { userId: resetToken.userId }
    });

    console.log(`✅ Senha redefinida com sucesso para usuário ${resetToken.userId} (email: ${updatedUser.email})`);

    res.status(200).json({
      message: 'Senha redefinida com sucesso. Você pode fazer login com sua nova senha.'
    });

  } catch (error: any) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({
      error: 'Erro ao redefinir senha',
      message: error.message
    });
  }
};


