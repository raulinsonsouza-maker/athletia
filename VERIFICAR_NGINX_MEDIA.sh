#!/bin/bash

# ============================================================================
# Script de Diagnóstico - Verificar Configuração Nginx para /media/
# ============================================================================
# 
# Este script verifica:
# 1. Se o arquivo de configuração existe
# 2. Se o link simbólico está ativo
# 3. Se a location /media/ está configurada
# 4. Se o diretório de uploads existe
# 5. Se as permissões estão corretas
# 6. Se o Nginx está rodando
#
# Uso: sudo bash VERIFICAR_NGINX_MEDIA.sh
# ============================================================================

set -e

echo "============================================================================"
echo "DIAGNÓSTICO NGINX - VERIFICAÇÃO /media/"
echo "============================================================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Erro: Este script precisa ser executado como root (use sudo)${NC}"
    exit 1
fi

# Caminhos
NGINX_AVAILABLE="/etc/nginx/sites-available/athletia.site"
NGINX_ENABLED="/etc/nginx/sites-enabled/athletia.site"
UPLOAD_DIR="/opt/athletia/backend/upload"

echo "📋 Passo 1: Verificando se Nginx está instalado e rodando..."
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}❌ Nginx não está instalado${NC}"
    exit 1
fi

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx está rodando${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx não está rodando${NC}"
    echo "   Execute: sudo systemctl start nginx"
fi

echo ""
echo "📋 Passo 2: Verificando arquivo de configuração..."
if [ -f "$NGINX_AVAILABLE" ]; then
    echo -e "${GREEN}✅ Arquivo existe: $NGINX_AVAILABLE${NC}"
    
    # Verificar se tem location /media/
    if grep -q "location.*/media/" "$NGINX_AVAILABLE"; then
        echo -e "${GREEN}✅ Location /media/ encontrada no arquivo${NC}"
        echo ""
        echo "   Configuração encontrada:"
        grep -A 5 "location.*/media/" "$NGINX_AVAILABLE" | head -6
    else
        echo -e "${RED}❌ Location /media/ NÃO encontrada no arquivo${NC}"
        echo "   É necessário adicionar a location /media/ na configuração"
    fi
else
    echo -e "${RED}❌ Arquivo não existe: $NGINX_AVAILABLE${NC}"
    echo "   É necessário criar/copiar o arquivo de configuração"
fi

echo ""
echo "📋 Passo 3: Verificando link simbólico..."
if [ -L "$NGINX_ENABLED" ]; then
    echo -e "${GREEN}✅ Link simbólico existe: $NGINX_ENABLED${NC}"
    LINK_TARGET=$(readlink -f "$NGINX_ENABLED")
    echo "   Aponta para: $LINK_TARGET"
    
    if [ "$LINK_TARGET" = "$NGINX_AVAILABLE" ]; then
        echo -e "${GREEN}✅ Link aponta para o arquivo correto${NC}"
    else
        echo -e "${YELLOW}⚠️  Link aponta para: $LINK_TARGET${NC}"
        echo "   Esperado: $NGINX_AVAILABLE"
    fi
else
    echo -e "${RED}❌ Link simbólico NÃO existe: $NGINX_ENABLED${NC}"
    echo "   Execute: sudo ln -s $NGINX_AVAILABLE $NGINX_ENABLED"
fi

echo ""
echo "📋 Passo 4: Verificando diretório de uploads..."
if [ -d "$UPLOAD_DIR" ]; then
    echo -e "${GREEN}✅ Diretório existe: $UPLOAD_DIR${NC}"
    
    # Verificar permissões
    PERMS=$(stat -c "%a" "$UPLOAD_DIR")
    OWNER=$(stat -c "%U:%G" "$UPLOAD_DIR")
    echo "   Permissões: $PERMS"
    echo "   Proprietário: $OWNER"
    
    # Verificar se nginx pode ler
    if [ -r "$UPLOAD_DIR" ]; then
        echo -e "${GREEN}✅ Nginx pode ler o diretório${NC}"
    else
        echo -e "${RED}❌ Nginx NÃO pode ler o diretório${NC}"
        echo "   Execute: sudo chmod -R 755 $UPLOAD_DIR"
    fi
    
    # Contar arquivos
    FILE_COUNT=$(find "$UPLOAD_DIR" -type f | wc -l)
    echo "   Arquivos encontrados: $FILE_COUNT"
    
    # Verificar estrutura
    if [ -d "$UPLOAD_DIR/exercicios" ]; then
        EXERC_COUNT=$(find "$UPLOAD_DIR/exercicios" -type d -mindepth 1 | wc -l)
        echo -e "${GREEN}✅ Subdiretório exercicios/ existe com $EXERC_COUNT exercícios${NC}"
    else
        echo -e "${YELLOW}⚠️  Subdiretório exercicios/ não existe${NC}"
    fi
else
    echo -e "${RED}❌ Diretório não existe: $UPLOAD_DIR${NC}"
    echo "   É necessário criar o diretório e configurar permissões"
fi

echo ""
echo "📋 Passo 5: Verificando sintaxe do Nginx..."
if nginx -t 2>&1 | grep -q "syntax is ok"; then
    echo -e "${GREEN}✅ Sintaxe do Nginx está correta${NC}"
else
    echo -e "${RED}❌ Erro na sintaxe do Nginx${NC}"
    echo ""
    echo "   Erros encontrados:"
    nginx -t 2>&1 | grep -i error || true
fi

echo ""
echo "📋 Passo 6: Verificando configuração ativa do Nginx..."
NGINX_CONFIG=$(nginx -T 2>/dev/null | grep -A 10 "server_name.*athletia.site" | head -15 || echo "")
if [ -n "$NGINX_CONFIG" ]; then
    echo -e "${GREEN}✅ Configuração de athletia.site encontrada no Nginx${NC}"
    
    # Verificar se tem location /media/
    if echo "$NGINX_CONFIG" | grep -q "location.*/media/"; then
        echo -e "${GREEN}✅ Location /media/ está ativa no Nginx${NC}"
    else
        echo -e "${RED}❌ Location /media/ NÃO está ativa no Nginx${NC}"
        echo "   É necessário recarregar o Nginx após adicionar a location"
    fi
else
    echo -e "${RED}❌ Configuração de athletia.site NÃO encontrada no Nginx${NC}"
    echo "   O link simbólico pode não estar ativo"
fi

echo ""
echo "============================================================================"
echo "RESUMO"
echo "============================================================================"
echo ""
echo "Se houver problemas, execute os seguintes comandos:"
echo ""
echo "1. Criar link simbólico (se não existir):"
echo "   sudo ln -s $NGINX_AVAILABLE $NGINX_ENABLED"
echo ""
echo "2. Aplicar configuração do repositório:"
echo "   sudo cp nginx-athletia-site.conf $NGINX_AVAILABLE"
echo ""
echo "3. Corrigir permissões (se necessário):"
echo "   sudo chown -R www-data:www-data $UPLOAD_DIR"
echo "   sudo chmod -R 755 $UPLOAD_DIR"
echo ""
echo "4. Validar e recarregar:"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo ""
echo "5. Testar acesso:"
echo "   curl -I https://athletia.site/media/exercicios/stiff/media.gif"
echo ""

