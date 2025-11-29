#!/bin/bash

# Script para criar estrutura de diretórios de upload
# Execute este script na VPS após fazer deploy

echo "🔧 Criando estrutura de diretórios de upload..."

# Obter diretório do script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

# Criar diretórios
mkdir -p "$BACKEND_DIR/upload/exercicios"
mkdir -p "$BACKEND_DIR/upload/grupos-musculares"
mkdir -p "$BACKEND_DIR/upload/imagens-banco"

echo "✅ Diretórios criados:"
echo "   - $BACKEND_DIR/upload/exercicios/"
echo "   - $BACKEND_DIR/upload/grupos-musculares/"
echo "   - $BACKEND_DIR/upload/imagens-banco/"

# Verificar permissões
echo ""
echo "🔐 Verificando permissões..."
chmod -R 755 "$BACKEND_DIR/upload"

# Criar .gitkeep se não existir
touch "$BACKEND_DIR/upload/exercicios/.gitkeep"
touch "$BACKEND_DIR/upload/grupos-musculares/.gitkeep"
touch "$BACKEND_DIR/upload/imagens-banco/.gitkeep"

echo "✅ Permissões configuradas (755)"
echo ""
echo "🎉 Estrutura criada com sucesso!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Reinicie o servidor backend (pm2 restart backend ou similar)"
echo "   2. Verifique os logs do backend para confirmar que iniciou corretamente"
echo "   3. Teste o upload de uma imagem na interface admin"

