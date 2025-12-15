#!/bin/bash
# Versão simplificada do teste de rotas
# Uso: bash test-routes-simples.sh

echo "🧪 Teste Rápido de Rotas do Blog"
echo ""

# Teste 1: Configurações
echo "1️⃣ Testando /api/blog/configuracoes..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/blog/configuracoes)
if [ "$RESPONSE" = "200" ]; then
  echo "   ✅ HTTP 200 - Funcionando!"
else
  echo "   ❌ HTTP $RESPONSE - Erro!"
fi

# Teste 2: Featured
echo ""
echo "2️⃣ Testando /api/blog/featured..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001/api/blog/featured?limit=3")
if [ "$RESPONSE" = "200" ]; then
  echo "   ✅ HTTP 200 - Funcionando!"
else
  echo "   ❌ HTTP $RESPONSE - Erro!"
fi

echo ""
echo "✅ Teste concluído!"
