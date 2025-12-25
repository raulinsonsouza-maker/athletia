/**
 * Utilitário para sanitizar logs e não expor PII (Personally Identifiable Information)
 */

import crypto from 'crypto';

/**
 * Hash de email para logs (não reversível, mas permite rastreamento)
 */
export function hashEmail(email: string): string {
  if (!email) return 'unknown';
  const hash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
  return `email_${hash.substring(0, 8)}`;
}

/**
 * Sanitizar telefone (mostra apenas últimos 4 dígitos)
 */
export function sanitizePhone(phone: string | null | undefined): string {
  if (!phone) return 'N/A';
  if (phone.length <= 4) return '****';
  return `****${phone.slice(-4)}`;
}

/**
 * Sanitizar nome (mostra apenas primeira letra)
 */
export function sanitizeName(name: string | null | undefined): string {
  if (!name) return 'N/A';
  if (name.length === 0) return 'N/A';
  return `${name[0]}***`;
}

/**
 * Sanitizar objeto completo removendo campos sensíveis
 */
export function sanitizeObject(obj: any, fieldsToSanitize: string[] = ['email', 'telefone', 'nome', 'senha', 'senhaHash', 'password']): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = { ...obj };
  
  for (const field of fieldsToSanitize) {
    if (field in sanitized) {
      if (field === 'email') {
        sanitized[field] = hashEmail(sanitized[field]);
      } else if (field === 'telefone') {
        sanitized[field] = sanitizePhone(sanitized[field]);
      } else if (field === 'nome') {
        sanitized[field] = sanitizeName(sanitized[field]);
      } else {
        sanitized[field] = '***';
      }
    }
  }
  
  return sanitized;
}

/**
 * Sanitizar string que pode conter PII
 */
export function sanitizeString(str: string | null | undefined): string {
  if (!str) return '';
  
  // Remover emails
  str = str.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
  
  // Remover telefones (formato brasileiro)
  str = str.replace(/\b(\+55\s?)?(\(?\d{2}\)?\s?)?(\d{4,5}[-.\s]?\d{4})\b/g, '[TELEFONE]');
  
  // Remover CPF
  str = str.replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[CPF]');
  
  return str;
}

