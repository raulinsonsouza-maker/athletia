# Guia para Resolver Problema de Migration

## Problema
A migration está falhando porque há um problema com a shadow database e uma migration anterior (`20250126120000_add_cakto_payment_fields`).

## Soluções

### Opção 1: Aplicar Migration Manualmente (Recomendado)

Se você tem acesso direto ao banco de dados, pode aplicar a migration manualmente:

```sql
-- Conectar ao banco de dados
psql -U postgres -d athletia

-- Adicionar a coluna manualmente
ALTER TABLE exercicios ADD COLUMN sem_equipamento BOOLEAN DEFAULT false;

-- Criar o índice
CREATE INDEX IF NOT EXISTS exercicios_sem_equipamento_ativo_idx ON exercicios(sem_equipamento, ativo);

-- Verificar se foi criado
\d exercicios
```

Depois, marque a migration como aplicada:

```bash
# Criar o arquivo de migration manualmente
mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_add_sem_equipamento
echo "-- AlterTable
ALTER TABLE \"exercicios\" ADD COLUMN \"sem_equipamento\" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX \"exercicios_sem_equipamento_ativo_idx\" ON \"exercicios\"(\"sem_equipamento\", \"ativo\");" > prisma/migrations/$(date +%Y%m%d%H%M%S)_add_sem_equipamento/migration.sql

# Marcar como aplicada
npx prisma migrate resolve --applied $(date +%Y%m%d%H%M%S)_add_sem_equipamento
```

### Opção 2: Resetar Shadow Database

```bash
# Limpar shadow database
npx prisma migrate reset --skip-seed

# Tentar novamente
npx prisma migrate dev --name add_sem_equipamento
```

### Opção 3: Usar migrate deploy (Produção)

Se estiver em produção:

```bash
# Aplicar migration sem usar shadow database
npx prisma migrate deploy
```

### Opção 4: Desabilitar Shadow Database Temporariamente

Edite `prisma/schema.prisma` e adicione:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL") // Comentar esta linha temporariamente
}
```

Ou crie um `.env` com:
```
SHADOW_DATABASE_URL="postgresql://user:password@localhost:5432/athletia_shadow"
```

## Após Resolver a Migration

1. Execute o script de migração de dados:
```bash
npm run marcar-sem-equipamento
```

2. Verifique se funcionou:
```bash
# Ver alguns exercícios marcados
psql -U postgres -d athletia -c "SELECT nome, sem_equipamento, equipamento_necessario FROM exercicios WHERE sem_equipamento = true LIMIT 10;"
```

