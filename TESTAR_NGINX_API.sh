#!/bin/bash

# ============================================================================
# Script para Testar Nginx -> Backend API
# ============================================================================

echo "============================================================================"
echo "TESTE NGINX -> BACKEND API"
echo "============================================================================"
echo ""

echo "📋 Teste 1: Backend direto (localhost:3001)..."
echo "   curl -I http://localhost:3001/api/exercicios/crucifixo-declinado-halteres/media.gif"
curl -I http://localhost:3001/api/exercicios/crucifixo-declinado-halteres/media.gif 2>&1 | head -5
echo ""

echo "📋 Teste 2: Via Nginx local (localhost)..."
echo "   curl -I http://localhost/api/exercicios/crucifixo-declinado-halteres/media.gif"
curl -I http://localhost/api/exercicios/crucifixo-declinado-halteres/media.gif 2>&1 | head -5
echo ""

echo "📋 Teste 3: Via Nginx HTTPS (athletia.site)..."
echo "   curl -I https://athletia.site/api/exercicios/crucifixo-declinado-halteres/media.gif"
curl -I https://athletia.site/api/exercicios/crucifixo-declinado-halteres/media.gif 2>&1 | head -5
echo ""

echo "📋 Teste 4: Verificando configuração ativa do Nginx..."
echo "   Location /api/ (primeiras 20 linhas):"
nginx -T 2>/dev/null | grep -A 20 "^[[:space:]]*location.*/api/" | head -25
echo ""

echo "📋 Teste 5: Verificando se há location / interceptando..."
echo "   Location / (primeiras 10 linhas):"
nginx -T 2>/dev/null | grep -A 10 "^[[:space:]]*location[[:space:]]*/[[:space:]]*{" | head -12
echo ""

echo "📋 Teste 6: Verificando ordem das locations..."
echo "   Todas as locations em ordem:"
nginx -T 2>/dev/null | grep -E "^[[:space:]]*location" | head -10
echo ""

echo "============================================================================"
echo "ANÁLISE"
echo "============================================================================"
echo ""
echo "Se o backend funciona (200) mas Nginx retorna 404:"
echo "  1. A location /api/ pode não estar sendo capturada"
echo "  2. A location / pode estar interceptando antes"
echo "  3. O proxy_pass pode não estar funcionando"
echo ""
echo "Solução: Adicionar ^~ na location /api/ para garantir prioridade"
echo ""

