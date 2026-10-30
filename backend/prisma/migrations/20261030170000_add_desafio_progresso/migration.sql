CREATE TABLE IF NOT EXISTS "desafio_progresso" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "desafio_slug" TEXT NOT NULL,
  "dia" INTEGER NOT NULL,
  "concluido_em" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "desafio_progresso_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "desafio_progresso_user_id_desafio_slug_dia_key"
  ON "desafio_progresso"("user_id", "desafio_slug", "dia");

CREATE INDEX IF NOT EXISTS "desafio_progresso_user_id_desafio_slug_idx"
  ON "desafio_progresso"("user_id", "desafio_slug");

DO $$ BEGIN
  ALTER TABLE "desafio_progresso"
    ADD CONSTRAINT "desafio_progresso_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
