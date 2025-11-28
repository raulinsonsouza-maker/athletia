#!/bin/bash
# Script para regenerar o Prisma Client após migrations
# Uso: bash regenerate-prisma.sh

echo "🔄 Regenerando Prisma Client..."

cd "$(dirname "$0")"

# Gerar Prisma Client
npx prisma generate

echo "✅ Prisma Client regenerado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Execute a migration: npx prisma migrate deploy"
echo "   2. Reinicie o servidor backend"

