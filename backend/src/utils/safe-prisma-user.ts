import { prisma } from '../lib/prisma';

/**
 * Helper para buscar usuário de forma segura, mesmo se campos WhatsApp não existirem
 * Usa query SQL raw como fallback se Prisma falhar
 */
// Cache para saber se já detectamos que campos WhatsApp não existem
let whatsappFieldsExist: boolean | null = null;

export async function safeFindUserByEmail(email: string) {
  // Se já sabemos que campos não existem, usar SQL raw diretamente
  if (whatsappFieldsExist === false) {
    return await findUserByEmailRaw(email);
  }

  try {
    // Tentar com Prisma primeiro (se migration já foi aplicada)
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        senhaHash: true,
        nome: true,
        role: true,
        plano: true,
        planoAtivo: true,
        dataExpiracao: true,
        dataInicioTrial: true,
        dataFimTrial: true,
        trialUtilizado: true,
        ativo: true
      }
    });
    
    // Se funcionou, marcar que campos existem
    if (whatsappFieldsExist === null) {
      whatsappFieldsExist = true;
    }
    
    return user;
  } catch (error: any) {
    // Se erro for relacionado a coluna não existir, usar SQL raw
    if (error.code === 'P2022' || error.message?.includes('does not exist')) {
      console.log('[SAFE PRISMA] Campos WhatsApp não existem, usando SQL raw');
      whatsappFieldsExist = false;
      
      const result = await prisma.$queryRawUnsafe<Array<{
        id: string;
        email: string;
        senha_hash: string;
        nome: string | null;
        role: string;
        plano: string | null;
        plano_ativo: boolean;
        data_expiracao: Date | null;
        data_inicio_trial: Date | null;
        data_fim_trial: Date | null;
        trial_utilizado: boolean;
        ativo: boolean;
      }>>(
        `SELECT 
          id, 
          email, 
          senha_hash, 
          nome, 
          role, 
          plano, 
          plano_ativo, 
          data_expiracao, 
          data_inicio_trial, 
          data_fim_trial, 
          trial_utilizado, 
          ativo
        FROM users 
        WHERE email = $1 
        LIMIT 1`,
        email
      );

      if (result.length === 0) {
        return null;
      }

      const user = result[0];
      return {
        id: user.id,
        email: user.email,
        senhaHash: user.senha_hash,
        nome: user.nome,
        role: user.role as any,
        plano: user.plano,
        planoAtivo: user.plano_ativo,
        dataExpiracao: user.data_expiracao,
        dataInicioTrial: user.data_inicio_trial,
        dataFimTrial: user.data_fim_trial,
        trialUtilizado: user.trial_utilizado,
        ativo: user.ativo
      };
    }
    
    // Se for outro erro, relançar
    throw error;
  }
}

/**
 * Função auxiliar para buscar usuário usando SQL raw
 */
async function findUserByEmailRaw(email: string) {
  const result = await prisma.$queryRawUnsafe<Array<{
    id: string;
    email: string;
    senha_hash: string;
    nome: string | null;
    role: string;
    plano: string | null;
    plano_ativo: boolean;
    data_expiracao: Date | null;
    data_inicio_trial: Date | null;
    data_fim_trial: Date | null;
    trial_utilizado: boolean;
    ativo: boolean;
  }>>(
    `SELECT 
      id, 
      email, 
      senha_hash, 
      nome, 
      role, 
      plano, 
      plano_ativo, 
      data_expiracao, 
      data_inicio_trial, 
      data_fim_trial, 
      trial_utilizado, 
      ativo
    FROM users 
    WHERE email = $1 
    LIMIT 1`,
    email
  );

  if (result.length === 0) {
    return null;
  }

  const user = result[0];
  return {
    id: user.id,
    email: user.email,
    senhaHash: user.senha_hash,
    nome: user.nome,
    role: user.role as any,
    plano: user.plano,
    planoAtivo: user.plano_ativo,
    dataExpiracao: user.data_expiracao,
    dataInicioTrial: user.data_inicio_trial,
    dataFimTrial: user.data_fim_trial,
    trialUtilizado: user.trial_utilizado,
    ativo: user.ativo
  };
}

/**
 * Helper para buscar usuário por ID de forma segura
 */
export async function safeFindUserById(userId: string) {
  // Se já sabemos que campos não existem, usar SQL raw diretamente
  if (whatsappFieldsExist === false) {
    return await findUserByIdRaw(userId);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nome: true,
        role: true,
        plano: true,
        planoAtivo: true,
        dataExpiracao: true,
        dataInicioTrial: true,
        dataFimTrial: true,
        trialUtilizado: true,
        ativo: true
      }
    });
    
    // Se funcionou, marcar que campos existem
    if (whatsappFieldsExist === null && user) {
      whatsappFieldsExist = true;
    }
    
    return user;
  } catch (error: any) {
    if (error.code === 'P2022' || error.message?.includes('does not exist')) {
      console.log('[SAFE PRISMA] Campos WhatsApp não existem, usando SQL raw para buscar por ID');
      whatsappFieldsExist = false;
      
      const result = await prisma.$queryRawUnsafe<Array<{
        id: string;
        email: string;
        nome: string | null;
        role: string;
        plano: string | null;
        plano_ativo: boolean;
        data_expiracao: Date | null;
        data_inicio_trial: Date | null;
        data_fim_trial: Date | null;
        trial_utilizado: boolean;
        ativo: boolean;
      }>>(
        `SELECT 
          id, 
          email, 
          nome, 
          role, 
          plano, 
          plano_ativo, 
          data_expiracao, 
          data_inicio_trial, 
          data_fim_trial, 
          trial_utilizado, 
          ativo
        FROM users 
        WHERE id = $1 
        LIMIT 1`,
        userId
      );

      if (result.length === 0) {
        return null;
      }

      const user = result[0];
      return {
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: user.role as any,
        plano: user.plano,
        planoAtivo: user.plano_ativo,
        dataExpiracao: user.data_expiracao,
        dataInicioTrial: user.data_inicio_trial,
        dataFimTrial: user.data_fim_trial,
        trialUtilizado: user.trial_utilizado,
        ativo: user.ativo
      };
    }
    
    throw error;
  }
}

/**
 * Função auxiliar para buscar usuário por ID usando SQL raw
 */
async function findUserByIdRaw(userId: string) {
  const result = await prisma.$queryRawUnsafe<Array<{
    id: string;
    email: string;
    nome: string | null;
    role: string;
    plano: string | null;
    plano_ativo: boolean;
    data_expiracao: Date | null;
    data_inicio_trial: Date | null;
    data_fim_trial: Date | null;
    trial_utilizado: boolean;
    ativo: boolean;
  }>>(
    `SELECT 
      id, 
      email, 
      nome, 
      role, 
      plano, 
      plano_ativo, 
      data_expiracao, 
      data_inicio_trial, 
      data_fim_trial, 
      trial_utilizado, 
      ativo
    FROM users 
    WHERE id = $1 
    LIMIT 1`,
    userId
  );

  if (result.length === 0) {
    return null;
  }

  const user = result[0];
  return {
    id: user.id,
    email: user.email,
    nome: user.nome,
    role: user.role as any,
    plano: user.plano,
    planoAtivo: user.plano_ativo,
    dataExpiracao: user.data_expiracao,
    dataInicioTrial: user.data_inicio_trial,
    dataFimTrial: user.data_fim_trial,
    trialUtilizado: user.trial_utilizado,
    ativo: user.ativo
  };
}

