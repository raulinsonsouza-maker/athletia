#!/bin/bash

# Script para corrigir URLs de GIFs no banco de dados
# Este script faz login como admin e executa a correção

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔧 Script de Correção de URLs de GIFs${NC}"
echo ""

# Verificar se as variáveis de ambiente estão definidas
if [ -z "$ADMIN_EMAIL" ] || [ -z "$ADMIN_PASSWORD" ]; then
    echo -e "${YELLOW}⚠️  Variáveis ADMIN_EMAIL e ADMIN_PASSWORD não definidas${NC}"
    echo ""
    echo "Por favor, forneça as credenciais:"
    read -p "Email do admin: " ADMIN_EMAIL
    read -s -p "Senha do admin: " ADMIN_PASSWORD
    echo ""
fi

API_URL="${API_URL:-https://athletia.site/api}"

echo -e "${YELLOW}📡 Fazendo login como admin...${NC}"

# Fazer login
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"senha\":\"${ADMIN_PASSWORD}\"}")

# Extrair token da resposta
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Erro ao fazer login${NC}"
    echo "Resposta: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Login realizado com sucesso${NC}"
echo ""

echo -e "${YELLOW}🔧 Executando correção de URLs...${NC}"

# Executar correção
CORRECAO_RESPONSE=$(curl -s -X POST "${API_URL}/admin/gifs/corrigir-urls" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json")

# Verificar se houve erro
if echo "$CORRECAO_RESPONSE" | grep -q '"error"'; then
    echo -e "${RED}❌ Erro ao executar correção${NC}"
    echo "Resposta: $CORRECAO_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Correção executada com sucesso${NC}"
echo ""
echo "Resultado:"
echo "$CORRECAO_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CORRECAO_RESPONSE"
echo ""

echo -e "${GREEN}✨ Processo concluído!${NC}"

