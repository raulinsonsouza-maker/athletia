#!/bin/bash
# Script para verificar e diagnosticar problema do nginx

echo "🔍 Diagnosticando problema do Nginx..."
echo ""

# 1. Verificar conteúdo do arquivo de configuração
echo "📄 Conteúdo do arquivo de configuração (linhas 104-112):"
echo "---"
sudo sed -n '104,112p' /etc/nginx/sites-available/athletia.site
echo ""

# 2. Verificar se a location de assets está correta
echo "📋 Verificando location blocks:"
echo "---"
sudo grep -n "location.*assets\|location.*\.(js\|css)" /etc/nginx/sites-available/athletia.site | head -20
echo ""

# 3. Verificar ordem das locations
echo "📊 Ordem das locations no arquivo:"
echo "---"
sudo grep -n "^    location" /etc/nginx/sites-available/athletia.site
echo ""

# 4. Verificar se há configurações globais que podem estar sobrescrevendo
echo "🔍 Verificando nginx.conf principal por configurações que podem sobrescrever:"
echo "---"
sudo grep -n "add_header\|expires" /etc/nginx/nginx.conf | head -10
echo ""

# 5. Testar qual location está sendo usada
echo "🧪 Testando qual location está sendo aplicada:"
echo "---"
curl -v https://athletia.site/assets/index.js 2>&1 | grep -i "location\|content-type\|cache" | head -10
echo ""

# 6. Verificar se o arquivo existe no servidor
echo "📁 Verificando se o arquivo existe:"
echo "---"
ls -lh /opt/athletia/frontend/dist/assets/index*.js 2>/dev/null | head -5
echo ""

# 7. Verificar root do nginx
echo "📂 Verificando root configurado:"
echo "---"
sudo grep -n "root.*frontend\|root.*dist" /etc/nginx/sites-available/athletia.site
echo ""

# 8. Verificar logs de acesso recentes
echo "📝 Últimas requisições (se houver):"
echo "---"
sudo tail -5 /var/log/nginx/athletia-access.log 2>/dev/null || echo "Log vazio ou não encontrado"
echo ""

echo "✅ Diagnóstico completo!"

