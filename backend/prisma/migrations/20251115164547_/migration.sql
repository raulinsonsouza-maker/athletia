-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "nome" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfis" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "idade" INTEGER,
    "sexo" TEXT,
    "altura" DOUBLE PRECISION,
    "peso_atual" DOUBLE PRECISION,
    "percentual_gordura" DOUBLE PRECISION,
    "experiencia" TEXT,
    "objetivo" TEXT,
    "frequencia_semanal" INTEGER,
    "tempo_disponivel" INTEGER,
    "lesoes" TEXT[],
    "equipamentos" TEXT[],
    "preferencias" TEXT[],
    "rpe_preferido" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_pesos" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_pesos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treinos" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "tempo_estimado" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treinos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercicios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "grupo_muscular_principal" TEXT NOT NULL,
    "sinergistas" TEXT[],
    "descricao" TEXT,
    "execucao_tecnica" TEXT,
    "erros_comuns" TEXT[],
    "imagem_url" TEXT,
    "gif_url" TEXT,
    "carga_inicial_sugerida" DOUBLE PRECISION,
    "rpe_sugerido" INTEGER,
    "equipamento_necessario" TEXT[],
    "nivel_dificuldade" TEXT NOT NULL,
    "alternativas" TEXT[],
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercicios_treino" (
    "id" TEXT NOT NULL,
    "treino_id" TEXT NOT NULL,
    "exercicio_id" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "series" INTEGER NOT NULL,
    "repeticoes" TEXT NOT NULL,
    "carga" DOUBLE PRECISION,
    "rpe" INTEGER,
    "descanso" INTEGER,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,

    CONSTRAINT "exercicios_treino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "perfis_user_id_key" ON "perfis"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "perfis" ADD CONSTRAINT "perfis_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_pesos" ADD CONSTRAINT "historico_pesos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treinos" ADD CONSTRAINT "treinos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercicios_treino" ADD CONSTRAINT "exercicios_treino_treino_id_fkey" FOREIGN KEY ("treino_id") REFERENCES "treinos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercicios_treino" ADD CONSTRAINT "exercicios_treino_exercicio_id_fkey" FOREIGN KEY ("exercicio_id") REFERENCES "exercicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
