/**
 * Serviço de MFA (Multi-Factor Authentication) usando TOTP
 * Implementação gratuita usando speakeasy e qrcode
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { prisma } from '../lib/prisma';

/**
 * Gera um secret TOTP para um usuário
 */
export async function generateMFASecret(userId: string, userEmail: string): Promise<{
  secret: string;
  qrCodeUrl: string;
  manualEntryKey: string;
}> {
  // Gerar secret
  const secret = speakeasy.generateSecret({
    name: `Athletia (${userEmail})`,
    issuer: 'Athletia'
  });

  if (!secret.base32) {
    throw new Error('Erro ao gerar secret MFA');
  }

  // Gerar QR Code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

  // Salvar secret temporariamente (ainda não ativado)
  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaSecret: secret.base32,
      mfaEnabled: false // Ainda não está ativado até verificar
    }
  });

  return {
    secret: secret.base32,
    qrCodeUrl,
    manualEntryKey: secret.base32
  };
}

/**
 * Verifica código TOTP e ativa MFA se válido
 */
export async function verifyAndEnableMFA(
  userId: string,
  token: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mfaSecret: true, mfaEnabled: true }
  });

  if (!user || !user.mfaSecret) {
    throw new Error('MFA não configurado. Configure primeiro.');
  }

  if (user.mfaEnabled) {
    throw new Error('MFA já está ativado');
  }

  // Verificar token
  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token,
    window: 2 // Aceitar tokens com 2 períodos de tolerância (60s)
  });

  if (verified) {
    // Ativar MFA
    await prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true }
    });
    return true;
  }

  return false;
}

/**
 * Verifica código TOTP para login
 */
export async function verifyMFAToken(
  userId: string,
  token: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mfaSecret: true, mfaEnabled: true }
  });

  if (!user || !user.mfaEnabled || !user.mfaSecret) {
    return false;
  }

  // Verificar token
  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token,
    window: 2 // Aceitar tokens com 2 períodos de tolerância (60s)
  });

  return verified;
}

/**
 * Desativa MFA para um usuário
 */
export async function disableMFA(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaEnabled: false,
      mfaSecret: null
    }
  });
}

/**
 * Verifica se usuário tem MFA ativado
 */
export async function isMFAEnabled(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mfaEnabled: true }
  });

  return user?.mfaEnabled || false;
}

