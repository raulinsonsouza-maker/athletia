#!/bin/bash
# Script para testar qual location está sendo aplicada

echo "🧪 Testando locations do Nginx..."
echo ""

# 1. Verificar configuração completa que está sendo usada
echo "📋 Configuração completa do server block:"
echo "---"
sudo nginx -T 2>/dev/null | grep -A 200 "server_name.*athletia.site" | head -100
echo ""

# 2. Testar requisição com verbose
echo "🌐 Testando requisição para /assets/index.js:"
echo "---"
curl -v https://athletia.site/assets/index.js 2>&1 | grep -E "(< |HTTP|content-type|Cache-Control|Expires)" | head -20
echo ""

# 3. Verificar se o arquivo existe no caminho correto
echo "📁 Verificando arquivo no servidor:"
echo "---"
ROOT_PATH=$(sudo grep "root.*frontend\|root.*dist" /etc/nginx/sites-available/athletia.site | head -1 | awk '{print $2}' | tr -d ';')
echo "Root configurado: $ROOT_PATH"
if [ -n "$ROOT_PATH" ]; then
    echo "Arquivo existe? $(test -f ${ROOT_PATH}/assets/index*.js && echo 'SIM' || echo 'NÃO')"
    ls -lh ${ROOT_PATH}/assets/index*.js 2>/dev/null | head -3
fi
echo ""

# 4. Verificar logs de acesso em tempo real
echo "📝 Monitorando logs (pressione Ctrl+C para parar):"
echo "---"
echo "Faça uma requisição agora: curl -I https://athletia.site/assets/index.js"
echo ""
timeout 5 sudo tail -f /var/log/nginx/athletia-access.log 2>/dev/null || echo "Log não disponível"
echo ""

echo "✅ Teste completo!"

