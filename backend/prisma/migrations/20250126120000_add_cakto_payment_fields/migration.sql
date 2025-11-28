-- AlterTable: Adicionar campos Cakto na tabela users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "data_expiracao" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cakto_customer_id" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cakto_transaction_id" TEXT;

-- CreateTable: Criar tabela payment_history
CREATE TABLE IF NOT EXISTS "payment_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "status" TEXT NOT NULL,
    "payment_method" TEXT,
    "cakto_data" JSONB,
    "plano" TEXT,
    "event_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "payment_history_transaction_id_key" ON "payment_history"("transaction_id");
CREATE INDEX IF NOT EXISTS "payment_history_user_id_idx" ON "payment_history"("user_id");
CREATE INDEX IF NOT EXISTS "payment_history_transaction_id_idx" ON "payment_history"("transaction_id");
CREATE INDEX IF NOT EXISTS "payment_history_user_id_created_at_idx" ON "payment_history"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "payment_history_status_idx" ON "payment_history"("status");

-- AddForeignKey
ALTER TABLE "payment_history" ADD CONSTRAINT "payment_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

