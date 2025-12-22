# Aplicar Migration WhatsApp em Produção

## ⚠️ IMPORTANTE: Leia antes de executar

Esta migration adiciona:
- 3 novos campos na tabela `users` (whatsapp_opt_in, whatsapp_opt_in_date, whatsapp_phone_number)
- 5 novas tabelas (whatsapp_config, whatsapp_conversations, whatsapp_message_logs, whatsapp_cadence, admin_audit_logs)
- 5 novos ENUMs

**Esta migration é segura e não afeta dados existentes.**

## Passo 1: Verificar status atual

```bash
cd /caminho/do/backend
npx prisma migrate status
```

Isso mostrará se há migrations pendentes.

## Passo 2: Aplicar migration

### Opção A: Usando Prisma Migrate (Recomendado)

```bash
npx prisma migrate deploy
```

Isso aplicará todas as migrations pendentes, incluindo a de WhatsApp.

### Opção B: Aplicar SQL manualmente

Se preferir aplicar manualmente:

```bash
psql $DATABASE_URL -f prisma/migrations/20250201000000_add_whatsapp_tables/migration.sql
```

Ou copie e cole o conteúdo do arquivo `migration.sql` diretamente no psql.

## Passo 3: Verificar se foi aplicada

```bash
psql $DATABASE_URL
```

Depois execute:

```sql
-- Verificar se colunas foram adicionadas
\d users;

-- Verificar se tabelas foram criadas
\dt whatsapp_*;

-- Verificar se ENUMs foram criados
\dT+ "WhatsAppConversationStatus";
```

## Passo 4: Reiniciar aplicação

```bash
pm2 restart athletia-backend
# ou
systemctl restart athletia-backend
```

## Passo 5: Verificar logs

Após reiniciar, verifique os logs para confirmar que não há erros:

```bash
pm2 logs athletia-backend
# ou
journalctl -u athletia-backend -f
```

## Rollback (se necessário)

Se precisar reverter (NÃO recomendado em produção com dados):

```sql
-- Remover foreign keys primeiro
ALTER TABLE "whatsapp_conversations" DROP CONSTRAINT "whatsapp_conversations_user_id_fkey";
ALTER TABLE "whatsapp_message_logs" DROP CONSTRAINT "whatsapp_message_logs_user_id_fkey";
ALTER TABLE "whatsapp_message_logs" DROP CONSTRAINT "whatsapp_message_logs_conversation_id_fkey";
ALTER TABLE "whatsapp_cadence" DROP CONSTRAINT "whatsapp_cadence_user_id_fkey";
ALTER TABLE "admin_audit_logs" DROP CONSTRAINT "admin_audit_logs_admin_user_id_fkey";

-- Remover tabelas
DROP TABLE IF EXISTS "admin_audit_logs";
DROP TABLE IF EXISTS "whatsapp_cadence";
DROP TABLE IF EXISTS "whatsapp_message_logs";
DROP TABLE IF EXISTS "whatsapp_conversations";
DROP TABLE IF EXISTS "whatsapp_config";

-- Remover colunas da tabela users
ALTER TABLE "users" DROP COLUMN IF EXISTS "whatsapp_phone_number";
ALTER TABLE "users" DROP COLUMN IF EXISTS "whatsapp_opt_in_date";
ALTER TABLE "users" DROP COLUMN IF EXISTS "whatsapp_opt_in";

-- Remover ENUMs
DROP TYPE IF EXISTS "WhatsAppTrialStage";
DROP TYPE IF EXISTS "WhatsAppMessageStatus";
DROP TYPE IF EXISTS "WhatsAppMessageType";
DROP TYPE IF EXISTS "WhatsAppMessageDirection";
DROP TYPE IF EXISTS "WhatsAppConversationStatus";
```

## Troubleshooting

### Erro: "column already exists"
Se a coluna já existe, a migration pode falhar. Nesse caso, você pode:
1. Verificar se a migration já foi aplicada: `npx prisma migrate status`
2. Marcar como aplicada: `npx prisma migrate resolve --applied 20250201000000_add_whatsapp_tables`

### Erro: "type already exists"
Se o ENUM já existe, pode ser que parte da migration já foi aplicada. Verifique o status e continue.

### Erro de permissão
Certifique-se de que o usuário do banco tem permissões para:
- CREATE TABLE
- CREATE TYPE
- ALTER TABLE
- CREATE INDEX

## Após aplicar

Após aplicar a migration com sucesso:

1. ✅ O login deve funcionar normalmente
2. ✅ Os jobs de WhatsApp não devem mais gerar erros de tabela não encontrada
3. ✅ O sistema estará pronto para configurar a integração WhatsApp

