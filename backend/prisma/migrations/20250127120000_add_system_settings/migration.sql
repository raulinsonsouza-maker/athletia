-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "imagem_perfil_padrao" TEXT,
    "imagem_login_padrao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

