import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Gerar tokens
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
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

    console.log(`[LOGIN] Tentativa de login para: ${emailNormalizado}`);

    // Buscar usuário por email (pode ser email ou username)
    // O campo email no banco pode conter tanto email quanto username
    const user = await prisma.user.findUnique({
      where: { email: emailNormalizado }
    });

    if (!user) {
      console.log(`[LOGIN] Usuário não encontrado: ${emailNormalizado}`);
      return res.status(401).json({
        error: 'Usuário ou senha inválidos'
      });
    }

    console.log(`[LOGIN] Usuário encontrado: ${user.email} (Role: ${user.role})`);

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senhaHash);

    if (!senhaValida) {
      console.log(`[LOGIN] Senha inválida para usuário: ${emailNormalizado}`);
      return res.status(401).json({
        error: 'Usuário ou senha inválidos'
      });
    }

    console.log(`[LOGIN] ✅ Login bem-sucedido para: ${emailNormalizado} (Role: ${user.role})`);

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
        planoAtivo: user.planoAtivo
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
    const perfil = await prisma.perfil.create({
      data: {
        userId: user.id,
        idade: onboarding.idade || null,
        sexo: onboarding.sexo || null,
        tipoCorpo: onboarding.tipoCorpo || null,
        altura: onboarding.altura || null,
        pesoAtual: onboarding.pesoAtual || null,
        percentualGordura: onboarding.percentualGordura || null,
        aguaDiaria: onboarding.aguaDiaria || null,
        experiencia: onboarding.experiencia || null,
        objetivo: onboarding.objetivo || null,
        frequenciaSemanal: onboarding.frequenciaSemanal || null,
        tempoDisponivel: onboarding.tempoDisponivel || null,
        localTreino: onboarding.localTreino || null,
        problemasAnteriores: onboarding.problemasAnteriores || [],
        objetivosAdicionais: onboarding.objetivosAdicionais || [],
        lesoes: onboarding.lesoes || [],
        preferencias: onboarding.preferencias || [],
        rpePreferido: onboarding.rpePreferido || null,
      }
    });

    // Se peso foi informado, criar registro no histórico
    if (onboarding.pesoAtual !== undefined && onboarding.pesoAtual !== null && onboarding.pesoAtual !== '') {
      const pesoNum = typeof onboarding.pesoAtual === 'string' ? parseFloat(onboarding.pesoAtual) : onboarding.pesoAtual;
      if (!isNaN(pesoNum)) {
        await prisma.historicoPeso.create({
          data: {
            userId: user.id,
            peso: pesoNum
          }
        });
      }
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
    const perfil = await prisma.perfil.create({
      data: {
        userId: user.id,
        idade: onboarding.idade || null,
        sexo: onboarding.sexo || null,
        tipoCorpo: onboarding.tipoCorpo || null,
        altura: onboarding.altura || null,
        pesoAtual: onboarding.pesoAtual || null,
        percentualGordura: onboarding.percentualGordura || null,
        aguaDiaria: onboarding.aguaDiaria || null,
        experiencia: onboarding.experiencia || null,
        objetivo: onboarding.objetivo || null,
        frequenciaSemanal: onboarding.frequenciaSemanal || null,
        tempoDisponivel: onboarding.tempoDisponivel || null,
        localTreino: onboarding.localTreino || null,
        problemasAnteriores: onboarding.problemasAnteriores || [],
        objetivosAdicionais: onboarding.objetivosAdicionais || [],
        lesoes: onboarding.lesoes || [],
        preferencias: onboarding.preferencias || [],
        rpePreferido: onboarding.rpePreferido || null,
      }
    });

    // Gerar treinos para 30 dias
    try {
      const { gerarTreinos30Dias } = await import('../services/treino.service');
      await gerarTreinos30Dias(user.id);
      console.log(`✅ Treinos gerados para usuário ${user.id}`);
    } catch (error: any) {
      console.error(`⚠️ Erro ao gerar treinos:`, error);
      // Não falhar o cadastro se não conseguir gerar treinos
    }

    // TODO: Enviar e-mail com credenciais
    // Por enquanto, apenas logamos
    console.log(`📧 E-mail para ${email}:`);
    console.log(`   Usuário: ${email}`);
    console.log(`   Senha: ${senhaGerada}`);
    console.log(`   Link de login: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`);

    // Em produção, aqui você enviaria um e-mail real
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
      // Em produção, não retornar a senha
      // Apenas para desenvolvimento/teste
      senhaGerada: process.env.NODE_ENV === 'development' ? senhaGerada : undefined
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
export const ativarPlanoAposPagamento = async (req: Request, res: Response) => {
  try {
    const { userId, plano } = req.body;

    // Validações
    if (!userId || !plano) {
      return res.status(400).json({
        error: 'UserId e plano são obrigatórios'
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
      console.log(`🔄 Gerando treinos para os próximos 30 dias para o usuário ${userId}...`);
      const treinosGerados = await gerarTreinos30Dias(userId);
      console.log(`✅ ${treinosGerados.length} treinos gerados com sucesso!`);
      
      if (treinosGerados.length === 0) {
        console.warn('⚠️ Nenhum treino foi gerado. Verifique se há exercícios cadastrados e se a frequência semanal está configurada.');
      }
    } catch (error: any) {
      console.error('⚠️ Erro ao gerar treinos após pagamento:', error);
      // Não falhar a ativação se não conseguir gerar treinos
      // O usuário pode gerar manualmente depois
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

