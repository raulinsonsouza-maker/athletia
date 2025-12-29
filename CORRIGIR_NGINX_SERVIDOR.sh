#!/bin/bash
# Script para corrigir configuração do nginx no servidor

echo "🔧 Corrigindo configuração do Nginx..."

# 1. Verificar qual arquivo está sendo usado
echo "📋 Verificando arquivos ativos..."
ls -la /etc/nginx/sites-enabled/ | grep athletia

# 2. Fazer backup do arquivo antigo
echo "💾 Fazendo backup do arquivo antigo..."
sudo cp /etc/nginx/sites-enabled/athletia /etc/nginx/sites-enabled/athletia.old.backup

# 3. Remover arquivos antigos do sites-enabled
echo "🗑️  Removendo arquivos antigos..."
sudo rm -f /etc/nginx/sites-enabled/athletia
sudo rm -f /etc/nginx/sites-enabled/athletia.backup.*

# 4. Atualizar arquivo de configuração (já corrigido - sem map directive)
echo "📝 Atualizando arquivo de configuração..."
sudo cp /opt/athletia/nginx-athletia-site.conf /etc/nginx/sites-available/athletia.site

# 5. Criar link simbólico correto
echo "🔗 Criando link simbólico correto..."
sudo ln -sf /etc/nginx/sites-available/athletia.site /etc/nginx/sites-enabled/athletia.site

# 6. Verificar se há outros arquivos conflitantes
echo "🔍 Verificando conflitos..."
sudo grep -r "server_name.*athletia.site" /etc/nginx/sites-enabled/ 2>/dev/null

# 7. Testar configuração
echo "✅ Testando configuração..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuração OK! Recarregando nginx..."
    sudo systemctl reload nginx
    echo "✅ Nginx recarregado!"
    
    # 8. Verificar headers
    echo ""
    echo "🔍 Verificando headers de cache..."
    curl -I https://athletia.site/assets/index.js 2>/dev/null | grep -i "cache\|expires\|content-type"
    
    echo ""
    echo "🔍 Verificando gzip..."
    curl -H "Accept-Encoding: gzip" -I https://athletia.site/assets/index.js 2>/dev/null | grep -i "content-encoding\|vary"
    
    echo ""
    echo "✅ Correção concluída!"
else
    echo "❌ Erro na configuração! Verifique os erros acima."
    exit 1
fi

