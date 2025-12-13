# Como Aplicar a Migração do Blog

## ⚠️ IMPORTANTE: Para Produção

Em produção, use uma das opções abaixo. **NÃO use `prisma migrate dev`** pois ele requer shadow database.

## Opção 1: Usar `prisma migrate deploy` (Recomendado)

Este comando aplica apenas as migrações pendentes sem usar shadow database:

```bash
cd backend
npx prisma migrate deploy
```

## Opção 2: Aplicar SQL Manualmente (Mais Seguro para Produção)

Se o `migrate deploy` não funcionar ou você preferir controle total:

1. Conecte-se ao banco PostgreSQL de produção
2. Execute o arquivo SQL:
   ```bash
   psql -h seu-host -U seu-usuario -d athletia -f prisma/migrations/20250128000000_add_blog_articles/APPLY_MANUAL.sql
   ```
   
   Ou copie e cole o conteúdo do arquivo `APPLY_MANUAL.sql` no seu cliente PostgreSQL (pgAdmin, DBeaver, etc.)

3. Após executar, marque a migração como aplicada:
   ```bash
   cd backend
   npx prisma migrate resolve --applied 20250128000000_add_blog_articles
   ```

## Opção 3: Usar `prisma db push` (Apenas Desenvolvimento)

Para desenvolvimento local, você pode usar:

```bash
cd backend
npx prisma db push
```

**ATENÇÃO**: `db push` não cria migrações e não deve ser usado em produção.

## Após Aplicar a Migração

Depois de aplicar a migração, gere o Prisma Client:

```bash
cd backend
npx prisma generate
```

## Verificar Status

Para verificar quais migrações foram aplicadas:

```bash
cd backend
npx prisma migrate status
```

