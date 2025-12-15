# 🔧 Solução: Erro 404 no Blog

## Problema
Os endpoints `/api/blog/configuracoes` e `/api/blog/featured` retornam 404 porque o **Prisma Client não foi regenerado em produção**.

## ✅ Solução Rápida

### Passo 1: Regenerar Prisma Client
```bash
cd backend
npx prisma generate
```

### Passo 2: Recompilar o TypeScript
```bash
npm run build
```

### Passo 3: Reiniciar o Servidor
```bash
# Se usar PM2
pm2 restart athletia-backend

# Se usar systemd
sudo systemctl restart athletia-backend

# Se usar node diretamente
# Pare o processo atual (Ctrl+C) e inicie novamente:
npm start
```

## 🔍 Verificação

Após regenerar, você pode verificar se está funcionando:

```bash
# Verificar se os modelos existem
tsx src/scripts/check-prisma-models.ts

# Ou testar manualmente
node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); console.log('blogSettings:', !!p.blogSettings);"
```

## 📋 Checklist Completo

- [ ] Conectado ao servidor de produção
- [ ] Navegou até o diretório `backend`
- [ ] Executou `npx prisma generate`
- [ ] Executou `npm run build`
- [ ] Reiniciou o servidor
- [ ] Testou acessar `/api/blog/configuracoes` no navegador
- [ ] Verificou os logs do servidor para erros

## ⚠️ Se ainda não funcionar

1. **Verificar variável DATABASE_URL:**
   ```bash
   echo $DATABASE_URL
   # ou
   cat .env | grep DATABASE_URL
   ```

2. **Verificar se as migrações foram aplicadas:**
   ```bash
   npx prisma migrate status
   ```

3. **Aplicar migrações pendentes:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Verificar logs do servidor:**
   ```bash
   # PM2
   pm2 logs athletia-backend

   # systemd
   sudo journalctl -u athletia-backend -f
   ```

## 🚀 Script de Deploy Automático

Crie um arquivo `deploy-blog.sh`:

```bash
#!/bin/bash
set -e

echo "🔄 Regenerando Prisma Client..."
cd backend
npx prisma generate

echo "🔨 Compilando TypeScript..."
npm run build

echo "🔄 Reiniciando servidor..."
pm2 restart athletia-backend

echo "✅ Deploy concluído!"
```

Torne executável e execute:
```bash
chmod +x deploy-blog.sh
./deploy-blog.sh
```
