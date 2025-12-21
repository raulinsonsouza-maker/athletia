#!/bin/bash
# Script de teste para verificar rotas do blog
# Uso: bash test-routes.sh

set -e

echo "🔍 Verificando rotas do blog..."
echo ""

# Teste 1: Código fonte
echo "1️⃣ Verificando código fonte..."
if grep -q "configuracoes" src/routes/blog.routes.ts 2>/dev/null; then
  echo "✅ Rotas encontradas no código fonte"
else
  echo "❌ Rotas NÃO encontradas no código fonte!"
  echo "   Arquivo: src/routes/blog.routes.ts"
  exit 1
fi

# Teste 2: Código compilado
echo ""
echo "2️⃣ Verificando código compilado..."
if [ -f "dist/routes/blog.routes.js" ]; then
  if grep -q "configuracoes" dist/routes/blog.routes.js 2>/dev/null; then
    echo "✅ Rotas encontradas no código compilado"
  else
    echo "⚠️  Arquivo existe mas rotas não encontradas - recompilando..."
    npm run build
    if grep -q "configuracoes" dist/routes/blog.routes.js 2>/dev/null; then
      echo "✅ Rotas encontradas após recompilação"
    else
      echo "❌ Rotas ainda não encontradas após recompilação!"
      exit 1
    fi
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
  echo "   Execute: npx prisma generate"
  exit 1
fi

# Teste 4: Servidor rodando
echo ""
echo "4️⃣ Testando rotas no servidor..."
echo "   Aguardando servidor responder..."

# Testar configuracoes
CONFIG_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/api/blog/configuracoes 2>/dev/null || echo -e "\n000")
CONFIG_BODY=$(echo "$CONFIG_RESPONSE" | head -n -1)
CONFIG_CODE=$(echo "$CONFIG_RESPONSE" | tail -n 1)

if [ "$CONFIG_CODE" = "200" ]; then
  if echo "$CONFIG_BODY" | grep -q "heroPostId\|featuredCount\|id.*global"; then
    echo "✅ Rota /api/blog/configuracoes funcionando! (HTTP $CONFIG_CODE)"
  else
    echo "⚠️  Rota /api/blog/configuracoes retornou HTTP $CONFIG_CODE mas resposta inesperada"
    echo "   Resposta: $(echo "$CONFIG_BODY" | head -c 100)..."
  fi
else
  echo "❌ Rota /api/blog/configuracoes retornou HTTP $CONFIG_CODE"
  echo "   Resposta: $(echo "$CONFIG_BODY" | head -c 200)"
  echo "   Verifique os logs: pm2 logs athletia-backend"
fi

# Testar featured
FEATURED_RESPONSE=$(curl -s -w "\n%{http_code}" "http://localhost:3001/api/blog/featured?limit=3" 2>/dev/null || echo -e "\n000")
FEATURED_BODY=$(echo "$FEATURED_RESPONSE" | head -n -1)
FEATURED_CODE=$(echo "$FEATURED_RESPONSE" | tail -n 1)

if [ "$FEATURED_CODE" = "200" ]; then
  if echo "$FEATURED_BODY" | grep -q "id\|title\|\[\]"; then
    echo "✅ Rota /api/blog/featured funcionando! (HTTP $FEATURED_CODE)"
  else
    echo "⚠️  Rota /api/blog/featured retornou HTTP $FEATURED_CODE mas resposta inesperada"
    echo "   Resposta: $(echo "$FEATURED_BODY" | head -c 100)..."
  fi
else
  echo "❌ Rota /api/blog/featured retornou HTTP $FEATURED_CODE"
  echo "   Resposta: $(echo "$FEATURED_BODY" | head -c 200)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Diagnóstico completo!"
echo ""
echo "📋 Resumo:"
echo "   - Código fonte: ✅"
echo "   - Código compilado: ✅"
echo "   - Prisma Client: ✅"
echo "   - Rotas HTTP: $(if [ "$CONFIG_CODE" = "200" ] && [ "$FEATURED_CODE" = "200" ]; then echo "✅"; else echo "❌"; fi)"
echo ""
if [ "$CONFIG_CODE" != "200" ] || [ "$FEATURED_CODE" != "200" ]; then
  echo "⚠️  Se as rotas não estão funcionando:"
  echo "   1. Verifique: pm2 logs athletia-backend"
  echo "   2. Reinicie: pm2 restart athletia-backend"
  echo "   3. Verifique se o servidor está rodando: pm2 status"
fi



