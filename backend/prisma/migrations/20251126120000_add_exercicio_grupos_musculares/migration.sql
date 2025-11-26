-- CreateEnum
CREATE TYPE "PapelGrupoMuscular" AS ENUM ('PRINCIPAL', 'SINERGISTA');

-- CreateTable
CREATE TABLE "exercicios_grupos_musculares" (
    "id" TEXT NOT NULL,
    "exercicio_id" TEXT NOT NULL,
    "grupo_visual_id" TEXT NOT NULL,
    "papel" "PapelGrupoMuscular" NOT NULL DEFAULT 'PRINCIPAL',
    "ordem" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercicios_grupos_musculares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exercicios_grupos_musculares_exercicio_id_grupo_visual_id_papel_key" ON "exercicios_grupos_musculares"("exercicio_id", "grupo_visual_id", "papel");

-- CreateIndex
CREATE INDEX "exercicios_grupos_musculares_grupo_visual_id_idx" ON "exercicios_grupos_musculares"("grupo_visual_id");

-- CreateIndex
CREATE INDEX "exercicios_grupos_musculares_exercicio_id_idx" ON "exercicios_grupos_musculares"("exercicio_id");

-- AddForeignKey
ALTER TABLE "exercicios_grupos_musculares" ADD CONSTRAINT "exercicios_grupos_musculares_exercicio_id_fkey" FOREIGN KEY ("exercicio_id") REFERENCES "exercicios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercicios_grupos_musculares" ADD CONSTRAINT "exercicios_grupos_musculares_grupo_visual_id_fkey" FOREIGN KEY ("grupo_visual_id") REFERENCES "grupos_musculares_visuais"("id") ON DELETE CASCADE ON UPDATE CASCADE;


