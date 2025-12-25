/**
 * Utilitário de criptografia para dados sensíveis
 * Usa crypto nativo do Node.js (gratuito)
 */

import crypto from 'crypto';

// Chave de criptografia (deve estar em variável de ambiente)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // Para GCM, IV é de 12 bytes, mas usamos 16 para compatibilidade
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Criptografa um valor usando AES-256-GCM
 */
export function encrypt(text: string): string {
  if (!text) return text;
  
  try {
    // Gerar IV aleatório
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Derivar chave da ENCRYPTION_KEY
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    
    // Criar cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Criptografar
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Obter auth tag
    const tag = cipher.getAuthTag();
    
    // Retornar: iv:tag:encrypted (tudo em hex)
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  } catch (error: any) {
    console.error('[ENCRYPTION] Erro ao criptografar:', error);
    throw new Error('Erro ao criptografar dados');
  }
}

/**
 * Descriptografa um valor usando AES-256-GCM
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText;
  
  try {
    // Separar iv, tag e encrypted
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Formato de texto criptografado inválido');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    // Derivar chave
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    
    // Criar decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    // Descriptografar
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error: any) {
    console.error('[ENCRYPTION] Erro ao descriptografar:', error);
    throw new Error('Erro ao descriptografar dados');
  }
}

/**
 * Verifica se uma string está criptografada (formato: iv:tag:encrypted)
 */
export function isEncrypted(text: string): boolean {
  if (!text) return false;
  const parts = text.split(':');
  return parts.length === 3 && parts.every(part => /^[0-9a-f]+$/i.test(part));
}

