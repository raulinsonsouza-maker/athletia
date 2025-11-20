-- AlterTable
ALTER TABLE "users" ADD COLUMN     "data_nascimento" TIMESTAMP(3),
ADD COLUMN     "data_pagamento" TIMESTAMP(3),
ADD COLUMN     "plano_ativo" BOOLEAN NOT NULL DEFAULT false;
