-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mfa_secret" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mfa_enabled" BOOLEAN DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_mfa_enabled_idx" ON "User"("mfa_enabled");

