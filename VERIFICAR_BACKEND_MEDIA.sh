#!/bin/bash

# ============================================================================
# Script de Diagnóstico - Verificar Backend e Mídias de Exercícios
# ============================================================================
# 
# Este script verifica:
# 1. Se o backend está rodando
# 2. Se a rota está configurada
# 3. Se o exercício existe no banco
# 4. Se o arquivo existe no sistema de arquivos
#
# Uso: sudo bash VERIFICAR_BACKEND_MEDIA.sh
# ============================================================================

set -e

echo "============================================================================"
echo "DIAGNÓSTICO BACKEND - VERIFICAÇÃO MÍDIAS DE EXERCÍCIOS"
echo "============================================================================"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Erro: Este script precisa ser executado como root (use sudo)${NC}"
    exit 1
fi

UPLOAD_DIR="/opt/athletia/backend/upload"
EXERCICIOS_DIR="$UPLOAD_DIR/exercicios"
BACKEND_DIR="/opt/athletia/backend"

echo "📋 Passo 1: Verificando se o backend está rodando..."
if systemctl is-active --quiet athletia-backend || pgrep -f "node.*backend" > /dev/null; then
    echo -e "${GREEN}✅ Backend está rodando${NC}"
    
    # Verificar porta
    if netstat -tuln | grep -q ":3001"; then
        echo -e "${GREEN}✅ Backend está escutando na porta 3001${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend não está escutando na porta 3001${NC}"
    fi
else
    echo -e "${RED}❌ Backend NÃO está rodando${NC}"
    echo "   Execute: cd $BACKEND_DIR && npm start"
fi

echo ""
echo "📋 Passo 2: Verificando estrutura de diretórios..."
if [ -d "$EXERCICIOS_DIR" ]; then
    echo -e "${GREEN}✅ Diretório de exercícios existe: $EXERCICIOS_DIR${NC}"
    
    # Contar exercícios com mídia
    EXERC_COUNT=$(find "$EXERCICIOS_DIR" -mindepth 1 -maxdepth 1 -type d | wc -l)
    MEDIA_COUNT=$(find "$EXERCICIOS_DIR" -name "media.*" -type f | wc -l)
    
    echo "   Diretórios de exercícios: $EXERC_COUNT"
    echo "   Arquivos de mídia: $MEDIA_COUNT"
    
    # Verificar permissões
    PERMS=$(stat -c "%a" "$EXERCICIOS_DIR")
    OWNER=$(stat -c "%U:%G" "$EXERCICIOS_DIR")
    echo "   Permissões: $PERMS"
    echo "   Proprietário: $OWNER"
    
    # Verificar alguns exemplos
    echo ""
    echo "   Exemplos de exercícios com mídia:"
    find "$EXERCICIOS_DIR" -name "media.*" -type f | head -5 | while read file; do
        EXERC_ID=$(basename $(dirname "$file"))
        echo "     - $EXERC_ID: $(basename "$file")"
    done
else
    echo -e "${RED}❌ Diretório de exercícios não existe: $EXERCICIOS_DIR${NC}"
fi

echo ""
echo "📋 Passo 3: Testando resolução de exercício específico..."
EXERC_SLUG="crucifixo-declinado-halteres"
echo "   Testando: $EXERC_SLUG"

# Verificar se existe diretório com esse nome
if [ -d "$EXERCICIOS_DIR/$EXERC_SLUG" ]; then
    echo -e "${GREEN}✅ Diretório encontrado: $EXERCICIOS_DIR/$EXERC_SLUG${NC}"
    
    # Verificar se tem arquivo de mídia
    MEDIA_FILE=$(find "$EXERCICIOS_DIR/$EXERC_SLUG" -name "media.*" -type f | head -1)
    if [ -n "$MEDIA_FILE" ]; then
        echo -e "${GREEN}✅ Arquivo de mídia encontrado: $MEDIA_FILE${NC}"
        ls -lh "$MEDIA_FILE"
    else
        echo -e "${YELLOW}⚠️  Nenhum arquivo media.* encontrado neste diretório${NC}"
        echo "   Arquivos no diretório:"
        ls -la "$EXERCICIOS_DIR/$EXERC_SLUG" || echo "   (diretório vazio ou sem permissão)"
    fi
else
    echo -e "${YELLOW}⚠️  Diretório não encontrado pelo slug: $EXERC_SLUG${NC}"
    echo "   Procurando por UUIDs que possam corresponder..."
    
    # Listar alguns diretórios para ver o padrão
    echo "   Primeiros 5 diretórios encontrados:"
    find "$EXERCICIOS_DIR" -mindepth 1 -maxdepth 1 -type d | head -5 | while read dir; do
        EXERC_ID=$(basename "$dir")
        MEDIA_COUNT=$(find "$dir" -name "media.*" -type f | wc -l)
        echo "     - $EXERC_ID (mídias: $MEDIA_COUNT)"
    done
fi

echo ""
echo "📋 Passo 4: Verificando logs do backend..."
LOG_FILE="/var/log/athletia/backend.log"
if [ -f "$LOG_FILE" ]; then
    echo "   Últimas linhas relacionadas a exercicio-media:"
    tail -20 "$LOG_FILE" | grep -i "exercicio-media\|media\|exercicio" | tail -5 || echo "   (nenhuma entrada recente)"
else
    echo -e "${YELLOW}⚠️  Arquivo de log não encontrado: $LOG_FILE${NC}"
    echo "   Verificando outros locais de log..."
    journalctl -u athletia-backend -n 20 --no-pager | grep -i "media\|exercicio" | tail -5 || echo "   (nenhuma entrada encontrada)"
fi

echo ""
echo "📋 Passo 5: Testando requisição local ao backend..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/exercicios/crucifixo-declinado-halteres/media.gif | grep -q "200\|404"; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/exercicios/crucifixo-declinado-halteres/media.gif)
    echo "   Status HTTP: $STATUS"
    
    if [ "$STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Backend respondeu com sucesso localmente${NC}"
    elif [ "$STATUS" = "404" ]; then
        echo -e "${RED}❌ Backend retornou 404 (exercício ou arquivo não encontrado)${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend retornou status: $STATUS${NC}"
    fi
else
    echo -e "${RED}❌ Não foi possível conectar ao backend na porta 3001${NC}"
fi

echo ""
echo "============================================================================"
echo "RESUMO E PRÓXIMOS PASSOS"
echo "============================================================================"
echo ""
echo "Se o problema persistir:"
echo ""
echo "1. Verificar se o exercício existe no banco de dados:"
echo "   cd $BACKEND_DIR"
echo "   npx prisma studio"
echo "   # Ou via SQL: SELECT id, nome FROM exercicios WHERE nome ILIKE '%crucifixo%';"
echo ""
echo "2. Verificar logs do backend em tempo real:"
echo "   tail -f /var/log/athletia/backend.log | grep exercicio-media"
echo ""
echo "3. Testar resolução de exercício diretamente:"
echo "   # O backend precisa resolver 'crucifixo-declinado-halteres' para UUID"
echo "   # Verifique se o nome no banco corresponde ao slug"
echo ""
echo "4. Verificar se o arquivo existe pelo UUID:"
echo "   # Primeiro, encontre o UUID do exercício no banco"
echo "   # Depois verifique: ls -la $EXERCICIOS_DIR/<UUID>/media.*"
echo ""

