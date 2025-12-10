# 🔧 Solução para Erro de Migration em Produção

## ❌ Erro Encontrado

```
Error: P3006
Migration `20250126120000_add_cakto_payment_fields` failed to apply cleanly to the shadow database.
Error code: P1014
The underlying table for model `users` does not exist.
```

## ✅ Solução

O problema é que você está usando `prisma migrate dev` em **produção**. Este comando é apenas para **desenvolvimento** e tenta criar um banco de dados shadow temporário.

### Comando Correto para Produção:

```bash
cd /opt/athletia/backend
npx prisma migrate deploy
```

---

## 📋 Passo a Passo

### 1. Acessar o diretório do backend
```bash
cd /opt/athletia/backend
```

### 2. Aplicar migrations pendentes
```bash
npx prisma migrate deploy
```

Este comando:
- ✅ Aplica migrations diretamente no banco de produção
- ✅ Não usa banco shadow
- ✅ É seguro para produção
- ✅ Registra quais migrations foram aplicadas

### 3. Verificar status
```bash
npx prisma migrate status
```

Deve mostrar: "Database schema is up to date!"

### 4. Gerar Prisma Client (se necessário)
```bash
npx prisma generate
```

### 5. Reiniciar o backend
```bash
pm2 restart athletia-backend
# ou
systemctl restart athletia-backend
```

---

## 🔍 Verificar se Funcionou

### Verificar se a tabela foi criada:
```bash
psql -U postgres -d athletia -c "\d password_reset_tokens"
```

### Ou conectar ao PostgreSQL:
```bash
psql -U postgres -d athletia
```

Depois execute:
```sql
\dt password_reset_tokens
\d password_reset_tokens
\q
```

---

## 📝 Diferença entre Comandos

| Comando | Quando Usar | Banco Shadow |
|---------|-------------|--------------|
| `prisma migrate dev` | **Apenas desenvolvimento** | ✅ Sim |
| `prisma migrate deploy` | **Produção** | ❌ Não |

---

## ⚠️ Importante

- **NUNCA** use `prisma migrate dev` em produção
- **SEMPRE** use `prisma migrate deploy` em produção
- A migration já foi criada manualmente e está pronta para ser aplicada

---

## 🚨 Se Ainda Der Erro

Se mesmo com `migrate deploy` der erro, você pode aplicar manualmente:

```bash
psql -U postgres -d athletia -f prisma/migrations/20250126130000_add_password_reset_tokens/migration.sql
```

Ou copie o conteúdo do arquivo `migration.sql` e execute diretamente no psql.

