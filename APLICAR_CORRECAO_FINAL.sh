#!/bin/bash
# Script para aplicar correção final do nginx

echo "🔧 Aplicando correção final do Nginx..."
echo ""

# 1. Atualizar arquivo de configuração
echo "📝 Atualizando arquivo de configuração..."
sudo cp /opt/athletia/nginx-athletia-site.conf /etc/nginx/sites-available/athletia.site

# 2. Verificar sintaxe
echo "✅ Testando configuração..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Erro na configuração!"
    exit 1
fi

# 3. Recarregar nginx
echo "🔄 Recarregando nginx..."
sudo systemctl reload nginx

if [ $? -ne 0 ]; then
    echo "❌ Erro ao recarregar nginx!"
    exit 1
fi

# 4. Verificar headers
echo ""
echo "🔍 Verificando headers..."
echo "---"
echo "Content-Type e Cache:"
curl -I https://athletia.site/assets/index.js 2>/dev/null | grep -i "content-type\|cache-control\|expires" || echo "Erro"

echo ""
echo "Gzip:"
curl -H "Accept-Encoding: gzip" -I https://athletia.site/assets/index.js 2>/dev/null | grep -i "content-encoding\|vary" || echo "Erro"

echo ""
echo "✅ Correção aplicada!"

