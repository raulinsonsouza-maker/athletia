/*
  Warnings:

  - Made the column `nome` on table `treinos` required. This step will fail if there are existing NULL values in that column.

*/
-- Primeiro, atualizar valores NULL de nome para usar o tipo do treino
UPDATE "treinos" SET "nome" = "tipo" WHERE "nome" IS NULL;

-- AlterTable
ALTER TABLE "treinos" ADD COLUMN     "dia_semana" INTEGER,
ADD COLUMN     "letra_treino" TEXT,
ADD COLUMN     "recorrente" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "nome" SET NOT NULL;
