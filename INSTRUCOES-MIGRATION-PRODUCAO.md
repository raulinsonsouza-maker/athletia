# 🔧 Instruções para Aplicar Migration em Produção

## ⚠️ Problema Encontrado

O erro ocorreu porque `prisma migrate dev` tenta usar um **banco de dados shadow** para validar migrations, mas em produção isso não funciona corretamente.

## ✅ Solução: Usar `prisma migrate deploy`

Em **produção**, sempre use `prisma migrate deploy` ao invés de `prisma migrate dev`.

### Comando Correto para Produção:

```bash
cd /opt/athletia/backend
npx prisma migrate deploy
```

Este comando:
- ✅ Aplica migrations diretamente no banco de produção
- ✅ Não usa banco shadow
- ✅ É seguro para produção
- ✅ Registra quais migrations foram aplicadas

---

## 📋 Passo a Passo Completo

### 1. Acessar o servidor
```bash
ssh root@seu-servidor
cd /opt/athletia/backend
```

### 2. Verificar estado atual das migrations
```bash
npx prisma migrate status
```

### 3. Aplicar a nova migration
```bash
npx prisma migrate deploy
```

### 4. Verificar se foi aplicada
```bash
npx prisma migrate status
```

### 5. Gerar Prisma Client (se necessário)
```bash
npx prisma generate
```

---

## 🔍 Verificar se a Tabela Foi Criada

Após aplicar a migration, você pode verificar se a tabela foi criada:

```bash
# Conectar ao PostgreSQL
psql -U postgres -d athletia

# Verificar tabela
\dt password_reset_tokens

# Ver estrutura
\d password_reset_tokens

# Sair
\q
```

---

## 📝 Diferença entre `migrate dev` e `migrate deploy`

| Comando | Uso | Banco Shadow | Produção |
|---------|-----|--------------|----------|
| `migrate dev` | Desenvolvimento | ✅ Sim | ❌ Não use |
| `migrate deploy` | Produção | ❌ Não | ✅ Use |

---

## 🚨 Se Ainda Der Erro

Se mesmo com `migrate deploy` der erro, você pode aplicar a migration manualmente:

```bash
# Conectar ao PostgreSQL
psql -U postgres -d athletia

# Executar SQL manualmente
\i prisma/migrations/20250126130000_add_password_reset_tokens/migration.sql

# Ou copiar e colar o conteúdo do arquivo migration.sql diretamente
```

---

## ✅ Após Aplicar a Migration

1. Reiniciar o backend (se estiver rodando):
```bash
pm2 restart athletia-backend
# ou
systemctl restart athletia-backend
```

2. Verificar logs para confirmar que está funcionando:
```bash
pm2 logs athletia-backend
```

---

## 📌 Nota Importante

A migration já foi criada manualmente em:
`backend/prisma/migrations/20250126130000_add_password_reset_tokens/migration.sql`

Basta executar `npx prisma migrate deploy` que ela será aplicada automaticamente.

