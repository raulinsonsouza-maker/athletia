-- Campos da assinatura Mercado Pago
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mp_preapproval_id" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "meio_pagamento" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cancelamento_agendado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cpf" TEXT;

ALTER TABLE "payment_history" ADD COLUMN IF NOT EXISTS "gateway" TEXT NOT NULL DEFAULT 'cakto';
