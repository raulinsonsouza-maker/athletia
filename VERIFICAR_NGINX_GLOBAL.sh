#!/bin/bash
# Verificar configurações globais do nginx que podem estar adicionando headers

echo "🔍 Verificando configurações globais do nginx..."
echo ""

# Verificar nginx.conf principal
echo "📋 Verificando /etc/nginx/nginx.conf:"
sudo grep -n "add_header\|expires\|cache" /etc/nginx/nginx.conf | grep -v "#" | head -20
echo ""

# Verificar se há includes que podem ter configurações
echo "📋 Verificando includes:"
sudo grep -n "include" /etc/nginx/nginx.conf | head -10
echo ""

# Verificar configuração completa que está sendo aplicada
echo "📋 Configuração completa do server block (linhas relevantes):"
sudo nginx -T 2>/dev/null | grep -A 50 "server_name.*athletia.site" | grep -A 30 "location.*assets" | head -40

