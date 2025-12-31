#!/bin/bash

# ============================================================================
# Script para aplicar configuração Nginx com location /media/
# ============================================================================
# 
# Este script:
# 1. Faz backup do arquivo atual
# 2. Copia a nova configuração
# 3. Valida a configuração
# 4. Recarrega o Nginx
# 5. Testa o acesso a /media/
#
# Uso: sudo bash APLICAR_NGINX_MEDIA.sh
# ============================================================================

set -e  # Parar em caso de erro

echo "============================================================================"
echo "APLICANDO CONFIGURAÇÃO NGINX COM LOCATION /media/"
echo "============================================================================"
echo ""

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Erro: Este script precisa ser executado como root (use sudo)"
    exit 1
fi

# Caminhos
NGINX_AVAILABLE="/etc/nginx/sites-available/athletia.site"
NGINX_ENABLED="/etc/nginx/sites-enabled/athletia.site"
BACKUP_FILE="/etc/nginx/sites-available/athletia.site.backup.$(date +%Y%m%d_%H%M%S)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/nginx-athletia-site.conf"

# Verificar se o arquivo de configuração existe
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Erro: Arquivo de configuração não encontrado: $CONFIG_FILE"
    exit 1
fi

echo "📋 Passo 1: Fazendo backup do arquivo atual..."
if [ -f "$NGINX_AVAILABLE" ]; then
    cp "$NGINX_AVAILABLE" "$BACKUP_FILE"
    echo "✅ Backup criado: $BACKUP_FILE"
else
    echo "⚠️  Arquivo atual não existe, criando novo..."
fi

echo ""
echo "📋 Passo 2: Copiando nova configuração..."
cp "$CONFIG_FILE" "$NGINX_AVAILABLE"
echo "✅ Configuração copiada para: $NGINX_AVAILABLE"

# Criar link simbólico se não existir
if [ ! -L "$NGINX_ENABLED" ]; then
    echo ""
    echo "📋 Criando link simbólico..."
    ln -sf "$NGINX_AVAILABLE" "$NGINX_ENABLED"
    echo "✅ Link simbólico criado: $NGINX_ENABLED"
fi

echo ""
echo "📋 Passo 3: Validando configuração do Nginx..."
if nginx -t; then
    echo "✅ Configuração válida!"
else
    echo "❌ Erro: Configuração inválida. Restaurando backup..."
    if [ -f "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" "$NGINX_AVAILABLE"
        echo "✅ Backup restaurado"
    fi
    exit 1
fi

echo ""
echo "📋 Passo 4: Recarregando Nginx..."
if systemctl reload nginx; then
    echo "✅ Nginx recarregado com sucesso!"
else
    echo "❌ Erro ao recarregar Nginx. Verifique os logs:"
    echo "   sudo tail -f /var/log/nginx/athletia-error.log"
    exit 1
fi

echo ""
echo "📋 Passo 5: Testando acesso a /media/..."
echo "   Teste manual: curl -I https://athletia.site/media/exercicios/stiff/media.gif"
echo "   (Substitua pelo caminho real de um arquivo de upload)"

echo ""
echo "============================================================================"
echo "✅ CONFIGURAÇÃO APLICADA COM SUCESSO!"
echo "============================================================================"
echo ""
echo "📝 Próximos passos:"
echo "   1. Teste o acesso a /media/ com um arquivo real"
echo "   2. Verifique os logs se houver problemas:"
echo "      sudo tail -f /var/log/nginx/athletia-error.log"
echo "   3. Se precisar restaurar o backup:"
echo "      sudo cp $BACKUP_FILE $NGINX_AVAILABLE"
echo "      sudo nginx -t && sudo systemctl reload nginx"
echo ""

