-- CreateTable
CREATE TABLE "configuracao_treino_usuario" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "tipo_treino" TEXT NOT NULL,
    "letra_treino" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_treino_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "configuracao_treino_usuario_user_id_dia_semana_key" ON "configuracao_treino_usuario"("user_id", "dia_semana");

-- AddForeignKey
ALTER TABLE "configuracao_treino_usuario" ADD CONSTRAINT "configuracao_treino_usuario_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
