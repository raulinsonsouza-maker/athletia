import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

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

// Gerar tokens
const generateTokens = (userId: string) => {
  if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error('JWT secrets não configurados');
  }
  
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
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

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Email já cadastrado'
      });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        senhaHash,
        nome: nome || null
      },
      select: {
        id: true,
        email: true,
        nome: true,
        role: true,
        createdAt: true
      }
    });

    // Gerar tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    await saveRefreshToken(user.id, refreshToken);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
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
    const { email, senha } = req.body;

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
    const user = await prisma.user.findUnique({
      where: { email: emailNormalizado }
    });

    if (!user) {
      console.log(`[LOGIN] Usuário não encontrado: ${emailHash}`);
      return res.status(401).json({
        error: 'Usuário ou senha inválidos'
      });
    }

    console.log(`[LOGIN] Usuário encontrado: ${emailHash} (Role: ${user.role})`);

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senhaHash);

    if (!senhaValida) {
      console.log(`[LOGIN] Senha inválida para usuário: ${emailHash}`);
      return res.status(401).json({
        error: 'Usuário ou senha inválidos'
      });
    }

    console.log(`[LOGIN] Login bem-sucedido para: ${emailHash} (Role: ${user.role})`);

    // Gerar tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    await saveRefreshToken(user.id, refreshToken);

    res.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: user.role,
        planoAtivo: user.planoAtivo,
        plano: user.plano,
        dataExpiracao: user.dataExpiracao
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

// Refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    // Verificar token no banco
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true }
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

    // Gerar novo access token
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(storedToken.userId);

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

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'E-mail já cadastrado'
      });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário com planoAtivo = false
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        senhaHash,
        nome: nome.trim(),
        telefone: telefone.trim(),
        planoAtivo: false, // Ainda não pagou
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

    // Se peso foi informado, criar registro no histórico
    if (onboardingData.pesoAtual !== null) {
      await prisma.historicoPeso.create({
        data: {
          userId: user.id,
          peso: onboardingData.pesoAtual
        }
      });
    }

    // Gerar tokens para login automático
    const { accessToken, refreshToken } = generateTokens(user.id);
    await saveRefreshToken(user.id, refreshToken);

    res.status(201).json({
      message: 'Cadastro realizado com sucesso. Redirecione para a página de checkout.',
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        planoAtivo: user.planoAtivo
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

// Ativar plano após pagamento e gerar treinos
export const ativarPlanoAposPagamento = async (req: any, res: Response) => {
  try {
    // SEGURANÇA: Se autenticado via JWT, usar req.userId (mais seguro)
    // Se não autenticado, permitir userId do body apenas para chamadas internas (webhooks)
    const userId = req.userId || req.body.userId;
    const { plano } = req.body;

    // Validações
    if (!userId || !plano) {
      return res.status(400).json({
        error: 'UserId e plano são obrigatórios'
      });
    }

    // SEGURANÇA: Se autenticado via JWT, garantir que userId do body (se presente) corresponde ao token
    if (req.userId && req.body.userId && req.userId !== req.body.userId) {
      return res.status(403).json({
        error: 'Não autorizado a ativar plano de outro usuário'
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

    // Atualizar usuário com plano ativo
    const userAtualizado = await prisma.user.update({
      where: { id: userId },
      data: {
        planoAtivo: true,
        plano: plano.toUpperCase(),
        dataPagamento: new Date()
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
    console.error('Erro ao ativar plano:', error);
    res.status(500).json({
      error: 'Erro ao ativar plano',
      message: error.message
    });
  }
};

