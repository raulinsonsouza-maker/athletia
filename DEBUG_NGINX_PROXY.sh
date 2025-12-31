#!/bin/bash

# ============================================================================
# Script para Debug do Proxy Nginx -> Backend
# ============================================================================

set -e

echo "============================================================================"
echo "DEBUG NGINX PROXY"
echo "============================================================================"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "📋 Teste 1: Verificando configuração ativa do Nginx..."
echo "   Location /api/ configurada:"
NGINX_CONFIG=$(nginx -T 2>/dev/null | grep -A 15 "location /api/" | head -20)
if [ -n "$NGINX_CONFIG" ]; then
    echo "$NGINX_CONFIG"
    echo ""
    
    # Verificar se proxy_pass está correto
    if echo "$NGINX_CONFIG" | grep -q "proxy_pass.*3001"; then
        echo -e "${GREEN}✅ proxy_pass configurado para porta 3001${NC}"
    else
        echo -e "${RED}❌ proxy_pass NÃO está configurado corretamente${NC}"
    fi
else
    echo -e "${RED}❌ Location /api/ NÃO encontrada na configuração ativa${NC}"
fi

echo ""
echo "📋 Teste 2: Verificando ordem das locations..."
echo "   Locations em ordem de prioridade:"
nginx -T 2>/dev/null | grep -E "^[[:space:]]*location" | head -10

echo ""
echo "📋 Teste 3: Testando requisição com headers detalhados..."
echo "   Requisição para: https://athletia.site/api/exercicios/crucifixo-declinado-halteres/media.gif"
curl -v https://athletia.site/api/exercicios/crucifixo-declinado-halteres/media.gif 2>&1 | grep -E "< HTTP|< Location|X-|proxy|upstream" | head -20

echo ""
echo "📋 Teste 4: Verificando logs do Nginx..."
echo "   Últimas linhas do error log:"
tail -20 /var/log/nginx/athletia-error.log | grep -i "api\|exercicio\|404\|proxy" | tail -10 || echo "   (nenhuma entrada relevante)"

echo ""
echo "📋 Teste 5: Verificando se há location mais específica interceptando..."
# Verificar se há location /api/exercicios ou similar
SPECIFIC_LOCATION=$(nginx -T 2>/dev/null | grep -E "location.*/api/exercicios" || echo "")
if [ -n "$SPECIFIC_LOCATION" ]; then
    echo -e "${YELLOW}⚠️  Encontrada location mais específica:${NC}"
    echo "$SPECIFIC_LOCATION"
else
    echo -e "${GREEN}✅ Nenhuma location mais específica encontrada${NC}"
fi

echo ""
echo "============================================================================"
echo "DIAGNÓSTICO"
echo "============================================================================"
echo ""
echo "Se o backend funciona localmente mas não via Nginx:"
echo ""
echo "1. Verifique se a location /api/ está ANTES de location /"
echo "2. Verifique se não há location mais específica interceptando"
echo "3. Verifique se proxy_pass está correto: proxy_pass http://localhost:3001;"
echo "4. Verifique se não há trailing slash no proxy_pass"
echo ""

