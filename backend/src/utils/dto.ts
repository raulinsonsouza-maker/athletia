/**
 * DTOs (Data Transfer Objects) para não vazar dados sensíveis
 * Retorna apenas o que o frontend realmente precisa
 */

export interface UserPublicDTO {
  id: string;
  email: string;
  nome: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
}

export interface UserAdminDTO {
  id: string;
  email: string;
  nome: string | null;
  telefone: string | null;
  role: 'USER' | 'ADMIN';
  plano: string | null;
  planoAtivo: boolean;
  dataPagamento: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileDTO {
  objetivo: string | null;
  experiencia: string | null;
  pesoAtual: number | null;
}

/**
 * Converte User do Prisma para DTO público (sem dados sensíveis)
 */
export function toUserPublicDTO(user: any): UserPublicDTO {
  return {
    id: user.id,
    email: user.email,
    nome: user.nome,
    role: user.role,
    createdAt: user.createdAt
  };
}

/**
 * Converte User do Prisma para DTO admin (com dados administrativos)
 */
export function toUserAdminDTO(user: any): UserAdminDTO {
  return {
    id: user.id,
    email: user.email,
    nome: user.nome,
    telefone: user.telefone || null,
    role: user.role,
    plano: user.plano || null,
    planoAtivo: user.planoAtivo || false,
    dataPagamento: user.dataPagamento || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

/**
 * Sanitiza string para prevenir XSS e injeção
 */
export function sanitizeString(input: string | null | undefined, maxLength: number = 1000): string | null {
  if (!input) return null;
  
  // Remover caracteres de controle e limitar tamanho
  let sanitized = input
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .trim();
  
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Valida ID (UUID)
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

