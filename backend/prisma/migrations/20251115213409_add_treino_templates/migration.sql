-- CreateTable
CREATE TABLE "treino_templates" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "objetivo" TEXT NOT NULL,
    "nivel_experiencia" TEXT NOT NULL,
    "frequencia_semanal" INTEGER NOT NULL,
    "divisao_treino" TEXT NOT NULL,
    "dia_semana" INTEGER,
    "grupos_musculares" TEXT[],
    "tempo_estimado" INTEGER NOT NULL,
    "volume_total" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treino_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treino_template_exercicios" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "exercicio_id" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "series" INTEGER NOT NULL,
    "repeticoes" TEXT NOT NULL,
    "rpe_sugerido" INTEGER,
    "descanso" INTEGER,
    "observacoes" TEXT,
    "obrigatorio" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "treino_template_exercicios_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "treino_template_exercicios" ADD CONSTRAINT "treino_template_exercicios_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "treino_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treino_template_exercicios" ADD CONSTRAINT "treino_template_exercicios_exercicio_id_fkey" FOREIGN KEY ("exercicio_id") REFERENCES "exercicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
