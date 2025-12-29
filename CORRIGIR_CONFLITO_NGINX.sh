#!/bin/bash
# Script para corrigir conflito de configuração do nginx

echo "🔧 Corrigindo conflito de configuração do Nginx..."

# 1. Verificar todos os arquivos ativos
echo "📋 Verificando arquivos ativos em sites-enabled..."
ls -la /etc/nginx/sites-enabled/ | grep athletia

# 2. Verificar quais arquivos configuram athletia.site
echo ""
echo "🔍 Verificando quais arquivos configuram athletia.site..."
sudo grep -l "server_name.*athletia.site" /etc/nginx/sites-enabled/* 2>/dev/null

# 3. Fazer backup de todos os arquivos conflitantes
echo ""
echo "💾 Fazendo backup de arquivos conflitantes..."
for file in /etc/nginx/sites-enabled/athletia*; do
    if [ -f "$file" ]; then
        echo "  Backup: $file -> ${file}.backup.$(date +%Y%m%d_%H%M%S)"
        sudo cp "$file" "${file}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
done

# 4. Remover TODOS os arquivos athletia de sites-enabled
echo ""
echo "🗑️  Removendo todos os arquivos athletia de sites-enabled..."
sudo rm -f /etc/nginx/sites-enabled/athletia*
sudo rm -f /etc/nginx/sites-enabled/*athletia*

# 5. Garantir que o arquivo correto existe em sites-available
echo ""
echo "📝 Verificando arquivo em sites-available..."
if [ ! -f "/etc/nginx/sites-available/athletia.site" ]; then
    echo "  Copiando arquivo do repositório..."
    sudo cp /opt/athletia/nginx-athletia-site.conf /etc/nginx/sites-available/athletia.site
else
    echo "  Atualizando arquivo existente..."
    sudo cp /opt/athletia/nginx-athletia-site.conf /etc/nginx/sites-available/athletia.site
fi

# 6. Criar link simbólico correto
echo ""
echo "🔗 Criando link simbólico correto..."
sudo ln -sf /etc/nginx/sites-available/athletia.site /etc/nginx/sites-enabled/athletia.site

# 7. Verificar se há outros arquivos que podem estar causando conflito
echo ""
echo "🔍 Verificando outros arquivos que podem causar conflito..."
sudo grep -r "server_name.*athletia" /etc/nginx/sites-enabled/ 2>/dev/null | grep -v ".backup"

# 8. Testar configuração
echo ""
echo "✅ Testando configuração..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Configuração OK! Recarregando nginx..."
    sudo systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx recarregado com sucesso!"
        
        # 9. Verificar headers
        echo ""
        echo "🔍 Verificando headers de cache..."
        echo "---"
        curl -I https://athletia.site/assets/index.js 2>/dev/null | grep -i "cache\|expires\|content-type" || echo "Erro ao verificar headers"
        
        echo ""
        echo "🔍 Verificando gzip..."
        echo "---"
        curl -H "Accept-Encoding: gzip" -I https://athletia.site/assets/index.js 2>/dev/null | grep -i "content-encoding\|vary" || echo "Erro ao verificar gzip"
        
        echo ""
        echo "✅ Correção concluída!"
        echo ""
        echo "📊 Verificação final:"
        echo "  Arquivos ativos:"
        ls -la /etc/nginx/sites-enabled/ | grep athletia
    else
        echo "❌ Erro ao recarregar nginx!"
        echo "Verifique os logs: sudo journalctl -xeu nginx.service"
        exit 1
    fi
else
    echo "❌ Erro na configuração! Verifique os erros acima."
    exit 1
fi

