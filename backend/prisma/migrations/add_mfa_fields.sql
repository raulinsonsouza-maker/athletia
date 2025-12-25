-- Migration: Adicionar campos MFA ao modelo User
-- Execute: npx prisma migrate dev --name add_mfa_fields

-- Adicionar campos MFA
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mfa_secret" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mfa_enabled" BOOLEAN DEFAULT false;

-- Criar índice para melhor performance em consultas de MFA
CREATE INDEX IF NOT EXISTS "User_mfa_enabled_idx" ON "User"("mfa_enabled");

