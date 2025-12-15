# 🔍 Verificação de Rotas do Blog

## ✅ As Rotas EXISTEM no Código

Verificado em `backend/src/routes/blog.routes.ts`:

```typescript
router.get('/configuracoes', blogCache(...), obterConfiguracoesPublicas);
router.get('/featured', blogCache(...), listarArtigosDestaque);
```

E registradas em `backend/src/index.ts`:

```typescript
app.use('/api/blog', blogRoutes);
```

## 🧪 Como Verificar se Estão Funcionando

### 1. Teste Local (Desenvolvimento)

```bash
cd backend
npm run dev
```

Em outro terminal:

```bash
# Testar rota de configurações
curl http://localhost:3001/api/blog/configuracoes

# Testar rota de featured
curl http://localhost:3001/api/blog/featured?limit=3

# Testar rota de debug (nova)
curl http://localhost:3001/api/test/debug/routes
```

### 2. Verificar Código Compilado

```bash
cd backend
npm run build

# Verificar se as rotas estão no código compilado
grep -r "configuracoes" dist/
grep -r "featured" dist/
```

### 3. Teste em Produção

```bash
# SSH no servidor
ssh usuario@servidor

# Navegar para o backend
cd /caminho/para/backend

# Verificar código compilado
ls -la dist/routes/

# Verificar se blog.routes.js existe
cat dist/routes/blog.routes.js | grep configuracoes

# Testar diretamente no servidor
curl http://localhost:3001/api/blog/configuracoes
curl http://localhost:3001/api/blog/featured?limit=3
```

## 🔴 Possíveis Problemas

### Problema 1: Código não foi compilado
**Sintoma:** `dist/routes/blog.routes.js` não existe ou está desatualizado

**Solução:**
```bash
npm run build
pm2 restart athletia-backend
```

### Problema 2: Prisma Client não regenerado
**Sintoma:** Erro "Cannot read property 'blogSettings' of undefined"

**Solução:**
```bash
npx prisma generate
npm run build
pm2 restart athletia-backend
```

### Problema 3: Servidor não reiniciado
**Sintoma:** Mudanças não aparecem

**Solução:**
```bash
pm2 restart athletia-backend
# ou
pm2 reload athletia-backend
```

### Problema 4: Rotas não sendo carregadas
**Sintoma:** 404 mesmo com código correto

**Solução:** Verificar logs:
```bash
pm2 logs athletia-backend --lines 100
```

Procurar por:
- "Rotas funcionando!" (se aparecer, rotas estão OK)
- Erros de importação
- Erros de Prisma

## 📋 Checklist de Diagnóstico

Execute este checklist em ordem:

- [ ] Código fonte tem as rotas (`src/routes/blog.routes.ts`)
- [ ] Código compilado tem as rotas (`dist/routes/blog.routes.js`)
- [ ] Prisma Client foi regenerado (`npx prisma generate`)
- [ ] Build foi executado (`npm run build`)
- [ ] Servidor foi reiniciado (`pm2 restart`)
- [ ] Teste local funciona (`curl localhost:3001/api/blog/configuracoes`)
- [ ] Teste via NGINX funciona (`curl https://athletia.site/api/blog/configuracoes`)

## 🎯 Comandos de Deploy Completo

```bash
#!/bin/bash
# deploy-blog-completo.sh

cd /caminho/para/backend

echo "1️⃣ Regenerando Prisma Client..."
npx prisma generate

echo "2️⃣ Compilando TypeScript..."
npm run build

echo "3️⃣ Verificando rotas compiladas..."
if grep -q "configuracoes" dist/routes/blog.routes.js; then
  echo "✅ Rotas encontradas no código compilado"
else
  echo "❌ Rotas NÃO encontradas no código compilado!"
  exit 1
fi

echo "4️⃣ Reiniciando servidor..."
pm2 restart athletia-backend

echo "5️⃣ Aguardando servidor iniciar..."
sleep 3

echo "6️⃣ Testando rotas..."
curl -s http://localhost:3001/api/blog/configuracoes | head -20
curl -s http://localhost:3001/api/blog/featured?limit=3 | head -20

echo "✅ Deploy concluído!"
```

## 🐛 Debug Avançado

Se ainda não funcionar, adicione logs temporários:

```typescript
// Em src/index.ts, antes de app.use('/api/blog', blogRoutes)
console.log('🔍 Registrando rotas do blog...');
console.log('📁 blogRoutes:', blogRoutes);
app.use('/api/blog', blogRoutes);
console.log('✅ Rotas do blog registradas!');
```

Depois:
```bash
npm run build
pm2 restart athletia-backend
pm2 logs athletia-backend --lines 50
```
