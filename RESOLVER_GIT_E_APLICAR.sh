#!/bin/bash
# Script para resolver conflito git e aplicar correção do nginx

echo "🔧 Resolvendo conflito git e aplicando correção..."

# 1. Verificar status do git
echo "📋 Verificando status do git..."
git status

# 2. Verificar quais arquivos foram modificados
echo ""
echo "📝 Arquivos modificados:"
git diff --name-only

# 3. Fazer stash das mudanças locais (salvar temporariamente)
echo ""
echo "💾 Fazendo stash das mudanças locais..."
git stash push -m "Mudanças locais antes do pull - $(date +%Y%m%d_%H%M%S)"

# 4. Fazer pull
echo ""
echo "⬇️  Fazendo pull do repositório..."
git pull

# 5. Aplicar correção do nginx
echo ""
echo "🔧 Aplicando correção do nginx..."
sudo cp /opt/athletia/nginx-athletia-site.conf /etc/nginx/sites-available/athletia.site

# 6. Testar configuração
echo ""
echo "✅ Testando configuração do nginx..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuração OK! Recarregando nginx..."
    sudo systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx recarregado com sucesso!"
        
        # 7. Verificar headers
        echo ""
        echo "🔍 Verificando headers..."
        echo "---"
        echo "Content-Type e Cache:"
        curl -I https://athletia.site/assets/index.js 2>/dev/null | grep -i "content-type\|cache-control\|expires" || echo "Erro"
        
        echo ""
        echo "Gzip:"
        curl -H "Accept-Encoding: gzip" -I https://athletia.site/assets/index.js 2>/dev/null | grep -i "content-encoding\|vary" || echo "Erro"
        
        echo ""
        echo "✅ Correção aplicada com sucesso!"
        echo ""
        echo "💡 Se precisar das mudanças locais que foram salvas:"
        echo "   git stash list  # Ver stashes salvos"
        echo "   git stash pop   # Restaurar último stash"
    else
        echo "❌ Erro ao recarregar nginx!"
        exit 1
    fi
else
    echo "❌ Erro na configuração do nginx!"
    exit 1
fi

