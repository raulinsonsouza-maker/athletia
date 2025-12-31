#!/bin/bash

# ============================================================================
# Script para Testar Comunicação Nginx -> Backend
# ============================================================================

set -e

echo "============================================================================"
echo "TESTANDO COMUNICAÇÃO NGINX -> BACKEND"
echo "============================================================================"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "📋 Teste 1: Backend local (sem Nginx)..."
LOCAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/exercicios/crucifixo-declinado-halteres/media.gif)
if [ "$LOCAL_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Backend local responde: $LOCAL_STATUS${NC}"
else
    echo -e "${RED}❌ Backend local retornou: $LOCAL_STATUS${NC}"
fi

echo ""
echo "📋 Teste 2: Via Nginx (localhost)..."
NGINX_LOCAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/exercicios/crucifixo-declinado-halteres/media.gif)
if [ "$NGINX_LOCAL_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Nginx local responde: $NGINX_LOCAL_STATUS${NC}"
else
    echo -e "${RED}❌ Nginx local retornou: $NGINX_LOCAL_STATUS${NC}"
    echo "   Verificando resposta completa..."
    curl -v http://localhost/api/exercicios/crucifixo-declinado-halteres/media.gif 2>&1 | grep -E "< HTTP|Location|X-|proxy" | head -10
fi

echo ""
echo "📋 Teste 3: Via Nginx (HTTPS externo)..."
NGINX_HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://athletia.site/api/exercicios/crucifixo-declinado-halteres/media.gif)
if [ "$NGINX_HTTPS_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Nginx HTTPS responde: $NGINX_HTTPS_STATUS${NC}"
else
    echo -e "${RED}❌ Nginx HTTPS retornou: $NGINX_HTTPS_STATUS${NC}"
    echo "   Verificando resposta completa..."
    curl -I https://athletia.site/api/exercicios/crucifixo-declinado-halteres/media.gif 2>&1 | head -15
fi

echo ""
echo "📋 Teste 4: Verificando configuração do Nginx..."
echo "   Location /api/ configurada:"
nginx -T 2>/dev/null | grep -A 10 "location /api/" | head -12

echo ""
echo "📋 Testo 5: Verificando se o backend está acessível do Nginx..."
# O Nginx roda como www-data, então vamos testar como www-data
if sudo -u www-data curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health > /tmp/nginx_backend_test.txt 2>&1; then
    STATUS=$(cat /tmp/nginx_backend_test.txt)
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "404" ]; then
        echo -e "${GREEN}✅ Nginx pode acessar o backend (status: $STATUS)${NC}"
    else
        echo -e "${YELLOW}⚠️  Nginx retornou status: $STATUS${NC}"
    fi
else
    echo -e "${RED}❌ Nginx NÃO pode acessar o backend${NC}"
    cat /tmp/nginx_backend_test.txt
fi
rm -f /tmp/nginx_backend_test.txt

echo ""
echo "============================================================================"
echo "DIAGNÓSTICO"
echo "============================================================================"
echo ""
if [ "$LOCAL_STATUS" = "200" ] && [ "$NGINX_LOCAL_STATUS" != "200" ]; then
    echo -e "${YELLOW}⚠️  PROBLEMA: Backend funciona, mas Nginx não está encaminhando corretamente${NC}"
    echo ""
    echo "   Possíveis causas:"
    echo "   1. Location /api/ não está capturando a rota corretamente"
    echo "   2. proxy_pass está incorreto"
    echo "   3. A rota /api/exercicios/:id/media.* não está sendo capturada"
    echo ""
    echo "   Verifique:"
    echo "   - A ordem das locations no Nginx (deve vir antes de location /)"
    echo "   - Se há alguma location mais específica interceptando"
    echo "   - Os logs do Nginx: sudo tail -f /var/log/nginx/athletia-error.log"
fi

if [ "$NGINX_LOCAL_STATUS" = "200" ] && [ "$NGINX_HTTPS_STATUS" != "200" ]; then
    echo -e "${YELLOW}⚠️  PROBLEMA: Nginx local funciona, mas HTTPS não${NC}"
    echo "   Pode ser problema de certificado SSL ou configuração HTTPS"
fi

echo ""

