# ✅ CONFIRMAÇÃO: As Rotas EXISTEM no Código

## 📍 Rotas Definidas

**Arquivo:** `backend/src/routes/blog.routes.ts`

```typescript
✅ router.get('/configuracoes', ...)  // Linha 44
✅ router.get('/featured', ...)      // Linha 38
```

## 📍 Rotas Registradas

**Arquivo:** `backend/src/index.ts`

```typescript
✅ app.use('/api/blog', blogRoutes);  // Linha 339
```

## 🔴 O Problema Real

As rotas **EXISTEM no código fonte**, mas podem não estar funcionando em produção por:

1. **Código não compilado** → `dist/` desatualizado
2. **Prisma Client não regenerado** → Modelos não existem
3. **Servidor não reiniciado** → Código antigo ainda rodando

## ✅ Solução Passo a Passo

### No Servidor de Produção:

```bash
# 1. Ir para o diretório do backend
cd /caminho/para/backend

# 2. Verificar se o código fonte tem as rotas
grep -n "configuracoes" src/routes/blog.routes.ts
# Deve mostrar: 44:router.get('/configuracoes', ...)

# 3. Regenerar Prisma Client (CRÍTICO!)
npx prisma generate

# 4. Compilar TypeScript
npm run build

# 5. Verificar se compilou corretamente
ls -la dist/routes/blog.routes.js
grep -n "configuracoes" dist/routes/blog.routes.js

# 6. Reiniciar servidor
pm2 restart athletia-backend

# 7. Verificar logs
pm2 logs athletia-backend --lines 50

# 8. Testar rotas
curl http://localhost:3001/api/blog/configuracoes
curl http://localhost:3001/api/blog/featured?limit=3
```

## 🧪 Script de Teste Automático

Execute este script no servidor:

```bash
#!/bin/bash
# test-routes.sh

echo "🔍 Verificando rotas do blog..."

# Teste 1: Código fonte
echo ""
echo "1️⃣ Verificando código fonte..."
if grep -q "configuracoes" src/routes/blog.routes.ts; then
  echo "✅ Rotas encontradas no código fonte"
else
  echo "❌ Rotas NÃO encontradas no código fonte!"
  exit 1
fi

# Teste 2: Código compilado
echo ""
echo "2️⃣ Verificando código compilado..."
if [ -f "dist/routes/blog.routes.js" ]; then
  if grep -q "configuracoes" dist/routes/blog.routes.js; then
    echo "✅ Rotas encontradas no código compilado"
  else
    echo "⚠️  Arquivo existe mas rotas não encontradas - recompilando..."
    npm run build
  fi
else
  echo "❌ Código não compilado! Execute: npm run build"
  exit 1
fi

# Teste 3: Prisma Client
echo ""
echo "3️⃣ Verificando Prisma Client..."
if node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); console.log(p.blogSettings ? 'OK' : 'FALTA')" 2>/dev/null | grep -q "OK"; then
  echo "✅ Prisma Client tem blogSettings"
else
  echo "❌ Prisma Client não tem blogSettings!"
  echo "Execute: npx prisma generate"
  exit 1
fi

# Teste 4: Servidor rodando
echo ""
echo "4️⃣ Testando rotas no servidor..."
if curl -s http://localhost:3001/api/blog/configuracoes | grep -q "heroPostId\|featuredCount"; then
  echo "✅ Rota /api/blog/configuracoes funcionando!"
else
  echo "❌ Rota /api/blog/configuracoes retornou erro"
  echo "Verifique os logs: pm2 logs athletia-backend"
fi

if curl -s http://localhost:3001/api/blog/featured?limit=3 | grep -q "id\|title"; then
  echo "✅ Rota /api/blog/featured funcionando!"
else
  echo "❌ Rota /api/blog/featured retornou erro"
fi

echo ""
echo "✅ Diagnóstico completo!"
```

## 🎯 Resumo Executivo

| Item | Status | Ação Necessária |
|------|--------|-----------------|
| Rotas no código fonte | ✅ EXISTEM | Nenhuma |
| Rotas compiladas | ❓ Verificar | `npm run build` |
| Prisma Client | ❓ Verificar | `npx prisma generate` |
| Servidor reiniciado | ❓ Verificar | `pm2 restart` |

## 🚀 Comando Único de Deploy

```bash
cd backend && npx prisma generate && npm run build && pm2 restart athletia-backend && sleep 3 && curl http://localhost:3001/api/blog/configuracoes
```

Se este comando retornar JSON (não 404), está funcionando! 🎉
