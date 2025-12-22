-- CreateEnum
CREATE TYPE "WhatsAppConversationStatus" AS ENUM ('open', 'closed', 'pending');

-- CreateEnum
CREATE TYPE "WhatsAppMessageDirection" AS ENUM ('inbound', 'outbound');

-- CreateEnum
CREATE TYPE "WhatsAppMessageType" AS ENUM ('text', 'template', 'image', 'document', 'interactive');

-- CreateEnum
CREATE TYPE "WhatsAppMessageStatus" AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed');

-- CreateEnum
CREATE TYPE "WhatsAppTrialStage" AS ENUM ('D1', 'D2', 'D3', 'EXPIRED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "whatsapp_opt_in" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "whatsapp_opt_in_date" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "whatsapp_phone_number" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_whatsapp_phone_number_key" ON "users"("whatsapp_phone_number");

-- CreateTable
CREATE TABLE "whatsapp_config" (
    "id" TEXT NOT NULL,
    "phone_number_id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "webhook_verify_token" TEXT NOT NULL,
    "business_account_id" TEXT NOT NULL,
    "app_id" TEXT,
    "app_secret" TEXT,
    "api_version" TEXT NOT NULL DEFAULT 'v21.0',
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "quality_rating" TEXT,
    "quality_score" INTEGER,
    "last_health_check" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_conversations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "phone_number" TEXT NOT NULL,
    "status" "WhatsAppConversationStatus" NOT NULL DEFAULT 'open',
    "last_message_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_message_sent_at" TIMESTAMP(3),
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "context" JSONB,
    "opt_in" BOOLEAN NOT NULL DEFAULT false,
    "opt_in_date" TIMESTAMP(3),
    "opt_out_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_message_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "conversation_id" TEXT,
    "direction" "WhatsAppMessageDirection" NOT NULL,
    "message_id" TEXT NOT NULL,
    "template_name" TEXT,
    "message_type" "WhatsAppMessageType" NOT NULL,
    "message_body" TEXT NOT NULL,
    "to_phone" TEXT NOT NULL,
    "from_phone" TEXT NOT NULL,
    "status" "WhatsAppMessageStatus" NOT NULL DEFAULT 'pending',
    "status_details" JSONB,
    "error_code" INTEGER,
    "error_message" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_message_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_cadence" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "trial_stage" "WhatsAppTrialStage" NOT NULL,
    "d1_sent" BOOLEAN NOT NULL DEFAULT false,
    "d1_sent_at" TIMESTAMP(3),
    "d2_sent" BOOLEAN NOT NULL DEFAULT false,
    "d2_sent_at" TIMESTAMP(3),
    "d3_sent" BOOLEAN NOT NULL DEFAULT false,
    "d3_sent_at" TIMESTAMP(3),
    "expired_sent" BOOLEAN NOT NULL DEFAULT false,
    "expired_sent_at" TIMESTAMP(3),
    "plan_expiring_3d_sent" BOOLEAN NOT NULL DEFAULT false,
    "plan_expiring_3d_sent_at" TIMESTAMP(3),
    "plan_expiring_1d_sent" BOOLEAN NOT NULL DEFAULT false,
    "plan_expiring_1d_sent_at" TIMESTAMP(3),
    "plan_expired_sent" BOOLEAN NOT NULL DEFAULT false,
    "plan_expired_sent_at" TIMESTAMP(3),
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_cadence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "admin_user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_config_phone_number_id_key" ON "whatsapp_config"("phone_number_id");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_conversations_phone_number_key" ON "whatsapp_conversations"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_message_logs_message_id_key" ON "whatsapp_message_logs"("message_id");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_cadence_user_id_key" ON "whatsapp_cadence"("user_id");

-- CreateIndex
CREATE INDEX "whatsapp_conversations_user_id_idx" ON "whatsapp_conversations"("user_id");

-- CreateIndex
CREATE INDEX "whatsapp_conversations_status_idx" ON "whatsapp_conversations"("status");

-- CreateIndex
CREATE INDEX "whatsapp_message_logs_user_id_idx" ON "whatsapp_message_logs"("user_id");

-- CreateIndex
CREATE INDEX "whatsapp_message_logs_conversation_id_idx" ON "whatsapp_message_logs"("conversation_id");

-- CreateIndex
CREATE INDEX "whatsapp_message_logs_message_id_idx" ON "whatsapp_message_logs"("message_id");

-- CreateIndex
CREATE INDEX "whatsapp_message_logs_status_idx" ON "whatsapp_message_logs"("status");

-- CreateIndex
CREATE INDEX "whatsapp_message_logs_created_at_idx" ON "whatsapp_message_logs"("created_at");

-- CreateIndex
CREATE INDEX "whatsapp_cadence_user_id_idx" ON "whatsapp_cadence"("user_id");

-- CreateIndex
CREATE INDEX "whatsapp_cadence_trial_stage_idx" ON "whatsapp_cadence"("trial_stage");

-- CreateIndex
CREATE INDEX "admin_audit_logs_admin_user_id_idx" ON "admin_audit_logs"("admin_user_id");

-- CreateIndex
CREATE INDEX "admin_audit_logs_action_idx" ON "admin_audit_logs"("action");

-- CreateIndex
CREATE INDEX "admin_audit_logs_resource_type_idx" ON "admin_audit_logs"("resource_type");

-- CreateIndex
CREATE INDEX "admin_audit_logs_created_at_idx" ON "admin_audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "whatsapp_conversations" ADD CONSTRAINT "whatsapp_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_message_logs" ADD CONSTRAINT "whatsapp_message_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_message_logs" ADD CONSTRAINT "whatsapp_message_logs_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "whatsapp_conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_cadence" ADD CONSTRAINT "whatsapp_cadence_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

