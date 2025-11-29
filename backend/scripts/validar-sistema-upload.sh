#!/bin/bash

# Script para validar o sistema de upload de imagens
# Execute na VPS para diagnosticar problemas

echo "🔍 Validando Sistema de Upload de Imagens"
echo "=========================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Obter diretório do script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

echo "📁 Diretório do backend: $BACKEND_DIR"
echo ""

# 1. Verificar diretórios
echo "1️⃣  Verificando diretórios de upload..."
DIRS=(
  "$BACKEND_DIR/upload"
  "$BACKEND_DIR/upload/exercicios"
  "$BACKEND_DIR/upload/grupos-musculares"
  "$BACKEND_DIR/upload/imagens-banco"
)

ALL_DIRS_OK=true
for DIR in "${DIRS[@]}"; do
  if [ -d "$DIR" ]; then
    echo -e "   ${GREEN}✓${NC} $DIR"
  else
    echo -e "   ${RED}✗${NC} $DIR (não existe)"
    ALL_DIRS_OK=false
  fi
done
echo ""

# 2. Verificar permissões
echo "2️⃣  Verificando permissões..."
if [ -d "$BACKEND_DIR/upload" ]; then
  PERMS=$(stat -c "%a" "$BACKEND_DIR/upload" 2>/dev/null || stat -f "%Lp" "$BACKEND_DIR/upload" 2>/dev/null)
  OWNER=$(stat -c "%U" "$BACKEND_DIR/upload" 2>/dev/null || stat -f "%Su" "$BACKEND_DIR/upload" 2>/dev/null)
  echo "   Permissões: $PERMS"
  echo "   Proprietário: $OWNER"
  
  if [ "$PERMS" -ge "755" ]; then
    echo -e "   ${GREEN}✓${NC} Permissões OK"
  else
    echo -e "   ${YELLOW}⚠${NC}  Permissões podem estar incorretas (recomendado: 755)"
  fi
else
  echo -e "   ${RED}✗${NC} Diretório upload/ não existe"
fi
echo ""

# 3. Contar arquivos de exercícios
echo "3️⃣  Contando arquivos de exercícios..."
if [ -d "$BACKEND_DIR/upload/exercicios" ]; then
  NUM_DIRS=$(find "$BACKEND_DIR/upload/exercicios" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l)
  NUM_FILES=$(find "$BACKEND_DIR/upload/exercicios" -type f -name "exercicio.*" 2>/dev/null | wc -l)
  echo "   Pastas de exercícios: $NUM_DIRS"
  echo "   Arquivos de mídia: $NUM_FILES"
  
  if [ "$NUM_FILES" -gt 0 ]; then
    echo -e "   ${GREEN}✓${NC} Existem arquivos de exercícios"
    # Listar alguns exemplos
    echo "   Exemplos:"
    find "$BACKEND_DIR/upload/exercicios" -type f -name "exercicio.*" 2>/dev/null | head -3 | while read -r file; do
      SIZE=$(du -h "$file" | cut -f1)
      echo "   - $(basename $(dirname "$file")): $SIZE"
    done
  else
    echo -e "   ${YELLOW}⚠${NC}  Nenhum arquivo de exercício encontrado"
  fi
else
  echo -e "   ${RED}✗${NC} Diretório exercicios/ não existe"
fi
echo ""

# 4. Verificar se backend está rodando
echo "4️⃣  Verificando se backend está rodando..."
if command -v pm2 &> /dev/null; then
  PM2_STATUS=$(pm2 status 2>/dev/null | grep -i backend | grep -i online)
  if [ -n "$PM2_STATUS" ]; then
    echo -e "   ${GREEN}✓${NC} Backend rodando via PM2"
    pm2 status | grep -i backend
  else
    echo -e "   ${RED}✗${NC} Backend não encontrado no PM2"
  fi
else
  # Verificar processo node
  NODE_PROCESS=$(ps aux | grep -i "node.*backend\|tsx.*index.ts" | grep -v grep)
  if [ -n "$NODE_PROCESS" ]; then
    echo -e "   ${GREEN}✓${NC} Processo Node encontrado"
  else
    echo -e "   ${RED}✗${NC} Backend não está rodando"
  fi
fi
echo ""

# 5. Verificar porta 3001
echo "5️⃣  Verificando porta 3001..."
if command -v netstat &> /dev/null; then
  PORT_CHECK=$(netstat -tuln | grep ":3001")
elif command -v ss &> /dev/null; then
  PORT_CHECK=$(ss -tuln | grep ":3001")
else
  PORT_CHECK=""
fi

if [ -n "$PORT_CHECK" ]; then
  echo -e "   ${GREEN}✓${NC} Porta 3001 está em uso (backend escutando)"
else
  echo -e "   ${RED}✗${NC} Porta 3001 não está em uso"
fi
echo ""

# 6. Verificar arquivo .env
echo "6️⃣  Verificando configuração..."
if [ -f "$BACKEND_DIR/.env" ]; then
  echo -e "   ${GREEN}✓${NC} Arquivo .env existe"
  
  # Verificar variáveis importantes (sem mostrar valores sensíveis)
  if grep -q "DATABASE_URL" "$BACKEND_DIR/.env"; then
    echo -e "   ${GREEN}✓${NC} DATABASE_URL configurada"
  else
    echo -e "   ${YELLOW}⚠${NC}  DATABASE_URL não encontrada"
  fi
  
  if grep -q "JWT_SECRET" "$BACKEND_DIR/.env"; then
    echo -e "   ${GREEN}✓${NC} JWT_SECRET configurada"
  else
    echo -e "   ${YELLOW}⚠${NC}  JWT_SECRET não encontrada"
  fi
else
  echo -e "   ${RED}✗${NC} Arquivo .env não encontrado"
fi
echo ""

# Resumo
echo "=========================================="
echo "📊 RESUMO"
echo "=========================================="

if [ "$ALL_DIRS_OK" = true ] && [ "$NUM_FILES" -gt 0 ]; then
  echo -e "${GREEN}✅ Sistema de upload parece estar configurado corretamente${NC}"
  echo ""
  echo "Se ainda há problemas:"
  echo "  1. Verifique logs: pm2 logs backend"
  echo "  2. Reinicie backend: pm2 restart backend"
  echo "  3. Teste upload na interface admin"
else
  echo -e "${YELLOW}⚠️  Sistema de upload precisa de atenção${NC}"
  echo ""
  if [ "$ALL_DIRS_OK" = false ]; then
    echo "🔧 Para criar diretórios:"
    echo "   bash $SCRIPT_DIR/criar-estrutura-upload.sh"
  fi
  echo ""
  echo "🔧 Para reiniciar backend:"
  echo "   pm2 restart backend"
fi

echo ""

