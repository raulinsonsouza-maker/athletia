-- AlterTable: Adicionar campo ativo na tabela users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "ativo" BOOLEAN NOT NULL DEFAULT true;

-- Criar índice para melhorar performance de queries que filtram por ativo
CREATE INDEX IF NOT EXISTS "users_ativo_idx" ON "users"("ativo");

