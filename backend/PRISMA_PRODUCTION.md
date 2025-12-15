# Guia: Regenerar Prisma Client em Produção

## 📋 Quando Regenerar o Prisma Client

Você precisa regenerar o Prisma Client quando:
- ✅ Mudanças foram feitas no `schema.prisma`
- ✅ Migrações foram aplicadas no banco de dados
- ✅ Você fez deploy de uma nova versão com alterações no schema
- ✅ O Prisma Client está desatualizado (erros de tipo TypeScript)

## 🚀 Métodos para Regenerar em Produção

### Método 1: Comando Direto (Recomendado)

```bash
# No servidor de produção
cd /caminho/para/backend
npx prisma generate
```

Ou usando o script npm:
```bash
npm run prisma:generate
```

### Método 2: Durante o Build (Automático)

O script `build` agora inclui a geração automática:

```bash
npm run build
```

Isso executa:
1. `prisma generate` - Gera o Prisma Client
2. `tsc` - Compila o TypeScript

### Método 3: Script de Deploy Completo

Crie um script de deploy que inclua:

```bash
#!/bin/bash
# deploy.sh

cd backend

# 1. Instalar dependências (se necessário)
npm ci --production=false

# 2. Regenerar Prisma Client
npx prisma generate

# 3. Compilar TypeScript
npm run build

# 4. Aplicar migrações (se necessário)
npx prisma migrate deploy

# 5. Reiniciar aplicação
pm2 restart athletia-backend
# ou
systemctl restart athletia-backend
```

## ⚠️ Importante em Produção

### 1. Variáveis de Ambiente

Certifique-se de que a variável `DATABASE_URL` está configurada:

```bash
# Verificar se está configurada
echo $DATABASE_URL

# Ou no arquivo .env
cat .env | grep DATABASE_URL
```

### 2. Permissões

O Prisma precisa de permissão para escrever em `node_modules/@prisma/client`:

```bash
# Verificar permissões
ls -la node_modules/@prisma/client

# Se necessário, ajustar permissões
chmod -R 755 node_modules/@prisma
```

### 3. Dependências Instaladas

Certifique-se de que todas as dependências estão instaladas:

```bash
npm install
# ou em produção
npm ci
```

### 4. Versão do Prisma

Verifique se a versão do Prisma CLI está compatível:

```bash
npx prisma --version
# Deve ser compatível com @prisma/client no package.json
```

## 🔧 Troubleshooting

### Erro: "Prisma Client has not been generated yet"

**Solução:**
```bash
npx prisma generate
```

### Erro: "Environment variable not found: DATABASE_URL"

**Solução:**
```bash
# Configurar a variável de ambiente
export DATABASE_URL="postgresql://user:password@host:port/database"

# Ou adicionar ao .env
echo 'DATABASE_URL="postgresql://..."' >> .env
```

### Erro: "Permission denied"

**Solução:**
```bash
# Executar com permissões adequadas
sudo npm run prisma:generate

# Ou ajustar permissões do diretório
sudo chown -R $USER:$USER node_modules
```

### Erro: "Cannot find module '@prisma/client'"

**Solução:**
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```

## 📝 Checklist de Deploy

Antes de fazer deploy em produção:

- [ ] Schema Prisma atualizado e testado localmente
- [ ] Migrações criadas e testadas (`prisma migrate dev`)
- [ ] Prisma Client regenerado localmente (`prisma generate`)
- [ ] Build funciona localmente (`npm run build`)
- [ ] Testes passam (se houver)
- [ ] Variável `DATABASE_URL` configurada em produção
- [ ] Backup do banco de dados feito (antes de aplicar migrações)
- [ ] Prisma Client regenerado em produção (`npx prisma generate`)
- [ ] Build executado em produção (`npm run build`)
- [ ] Migrações aplicadas (`prisma migrate deploy`)
- [ ] Aplicação reiniciada

## 🎯 Comandos Rápidos

```bash
# Regenerar Prisma Client
npm run prisma:generate

# Build completo (inclui Prisma)
npm run build

# Aplicar migrações em produção
npx prisma migrate deploy

# Ver status do banco
npx prisma migrate status

# Abrir Prisma Studio (para debug)
npm run prisma:studio
```

## 📚 Documentação Oficial

- [Prisma Generate](https://www.prisma.io/docs/reference/api-reference/command-reference#generate)
- [Prisma Deploy](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-production)
