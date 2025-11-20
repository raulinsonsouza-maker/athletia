-- AlterTable
ALTER TABLE "treinos" ADD COLUMN     "criado_por" TEXT NOT NULL DEFAULT 'IA',
ADD COLUMN     "nome" TEXT,
ADD COLUMN     "template_id" TEXT;

-- CreateTable
CREATE TABLE "treino_personalizado_templates" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treino_personalizado_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treino_personalizado_template_exercicios" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "exercicio_id" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "series" INTEGER NOT NULL,
    "repeticoes" TEXT NOT NULL,
    "carga" DOUBLE PRECISION,
    "descanso" INTEGER,
    "observacoes" TEXT,

    CONSTRAINT "treino_personalizado_template_exercicios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "treino_personalizado_template_exercicios_template_id_exerci_key" ON "treino_personalizado_template_exercicios"("template_id", "exercicio_id", "ordem");

-- AddForeignKey
ALTER TABLE "treinos" ADD CONSTRAINT "treinos_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "treino_personalizado_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treino_personalizado_templates" ADD CONSTRAINT "treino_personalizado_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treino_personalizado_template_exercicios" ADD CONSTRAINT "treino_personalizado_template_exercicios_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "treino_personalizado_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treino_personalizado_template_exercicios" ADD CONSTRAINT "treino_personalizado_template_exercicios_exercicio_id_fkey" FOREIGN KEY ("exercicio_id") REFERENCES "exercicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
