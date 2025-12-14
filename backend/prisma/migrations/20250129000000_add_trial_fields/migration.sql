-- AlterTable
ALTER TABLE "users" ADD COLUMN     "data_inicio_trial" TIMESTAMP(3),
ADD COLUMN     "data_fim_trial" TIMESTAMP(3),
ADD COLUMN     "trial_utilizado" BOOLEAN NOT NULL DEFAULT false;
