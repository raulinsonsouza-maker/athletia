#!/bin/bash

# ============================================================================
# Script para Corrigir Nginx Após Reinstalação
# ============================================================================
# 
# Este script:
# 1. Verifica se o arquivo de configuração existe no repositório
# 2. Copia para /etc/nginx/sites-available/
# 3. Cria o link simbólico em sites-enabled
# 4. Corrige permissões
# 5. Valida e recarrega o Nginx
#
# Uso: sudo bash CORRIGIR_NGINX_POS_REINSTALACAO.sh
# ============================================================================

set -e

echo "============================================================================"
echo "CORRIGINDO NGINX APÓS REINSTALAÇÃO"
echo "============================================================================"
echo ""

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Erro: Este script precisa ser executado como root (use sudo)"
    exit 1
fi

# Caminhos
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/nginx-athletia-site.conf"
NGINX_AVAILABLE="/etc/nginx/sites-available/athletia.site"
NGINX_ENABLED="/etc/nginx/sites-enabled/athletia.site"
UPLOAD_DIR="/opt/athletia/backend/upload"

# Verificar se o arquivo de configuração existe
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Erro: Arquivo de configuração não encontrado: $CONFIG_FILE"
    echo "   Certifique-se de estar no diretório do projeto"
    exit 1
fi

echo "📋 Passo 1: Fazendo backup da configuração atual (se existir)..."
if [ -f "$NGINX_AVAILABLE" ]; then
    BACKUP_FILE="$NGINX_AVAILABLE.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$NGINX_AVAILABLE" "$BACKUP_FILE"
    echo "✅ Backup criado: $BACKUP_FILE"
else
    echo "⚠️  Arquivo atual não existe, criando novo..."
fi

echo ""
echo "📋 Passo 2: Copiando configuração do repositório..."
cp "$CONFIG_FILE" "$NGINX_AVAILABLE"
echo "✅ Configuração copiada para: $NGINX_AVAILABLE"

echo ""
echo "📋 Passo 3: Criando link simbólico..."
# Remover link antigo se existir (mesmo que quebrado)
if [ -L "$NGINX_ENABLED" ] || [ -f "$NGINX_ENABLED" ]; then
    rm -f "$NGINX_ENABLED"
    echo "✅ Link antigo removido"
fi

# Criar novo link
ln -sf "$NGINX_AVAILABLE" "$NGINX_ENABLED"
echo "✅ Link simbólico criado: $NGINX_ENABLED -> $NGINX_AVAILABLE"

echo ""
echo "📋 Passo 4: Corrigindo permissões do diretório de uploads..."
if [ -d "$UPLOAD_DIR" ]; then
    chown -R www-data:www-data "$UPLOAD_DIR" 2>/dev/null || echo "⚠️  Não foi possível alterar proprietário (pode ser normal)"
    chmod -R 755 "$UPLOAD_DIR"
    echo "✅ Permissões corrigidas para: $UPLOAD_DIR"
else
    echo "⚠️  Diretório de uploads não existe: $UPLOAD_DIR"
    echo "   Criando diretório..."
    mkdir -p "$UPLOAD_DIR"
    chown -R www-data:www-data "$UPLOAD_DIR"
    chmod -R 755 "$UPLOAD_DIR"
    echo "✅ Diretório criado com permissões corretas"
fi

echo ""
echo "📋 Passo 5: Validando configuração do Nginx..."
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
echo "📋 Passo 6: Recarregando Nginx..."
if systemctl reload nginx; then
    echo "✅ Nginx recarregado com sucesso!"
else
    echo "❌ Erro ao recarregar Nginx. Verifique os logs:"
    echo "   sudo tail -f /var/log/nginx/athletia-error.log"
    exit 1
fi

echo ""
echo "============================================================================"
echo "✅ NGINX CORRIGIDO COM SUCESSO!"
echo "============================================================================"
echo ""
echo "📝 Próximos passos:"
echo "   1. Teste o acesso a /media/:"
echo "      curl -I https://athletia.site/media/exercicios/stiff/media.gif"
echo ""
echo "   2. Teste o acesso a /api/exercicios/:"
echo "      curl -I https://athletia.site/api/exercicios/crucifixo-declinado-halteres/media.gif"
echo ""
echo "   3. Verifique os logs se houver problemas:"
echo "      sudo tail -f /var/log/nginx/athletia-error.log"
echo ""

