#!/bin/bash

# Script para corrigir o erro na linha 1008 do treino.service.ts no servidor
# Execute no servidor: bash corrigir-servidor.sh

set -e

cd /opt/athletia/backend

echo "🔧 Corrigindo erro na linha 1008..."

# Verificar o contexto antes de corrigir
echo "📋 Contexto atual (linhas 1005-1012):"
sed -n '1005,1012p' src/services/treino.service.ts

# Remover a chave solta na linha 1008
echo ""
echo "🗑️ Removendo chave solta na linha 1008..."
sed -i '1008d' src/services/treino.service.ts

# Verificar se ficou correto
echo ""
echo "✅ Verificando correção (linhas 1005-1012):"
sed -n '1005,1012p' src/services/treino.service.ts

echo ""
echo "🔨 Compilando..."
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅✅✅ BUILD SUCESSO! ✅✅✅"
  echo ""
  echo "🔄 Reiniciando PM2..."
  pm2 restart athletia-backend
  sleep 2
  echo ""
  echo "📋 Logs:"
  pm2 logs athletia-backend --lines 20 --nostream
else
  echo ""
  echo "❌ Ainda há erros. Verifique acima."
  exit 1
fi

