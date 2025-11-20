/*
  Warnings:

  - A unique constraint covering the columns `[template_id,exercicio_id,ordem]` on the table `treino_template_exercicios` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "treino_template_exercicios_template_id_exercicio_id_ordem_key" ON "treino_template_exercicios"("template_id", "exercicio_id", "ordem");
