#!/bin/bash

# Script para sincronizar GIFs do ambiente local para produção
# Uso: ./sync-gifs.sh [servidor] [usuario]
# Exemplo: ./sync-gifs.sh 191.252.109.144 root

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
SERVER="${1:-191.252.109.144}"
USER="${2:-root}"
LOCAL_UPLOAD_DIR="./backend/upload/exercicios"
REMOTE_UPLOAD_DIR="/opt/athletia/backend/upload/exercicios"

echo -e "${BLUE}===== SINCRONIZAÇÃO DE GIFs PARA PRODUÇÃO =====${NC}"
echo ""
echo "Servidor: $SERVER"
echo "Usuário: $USER"
echo "Diretório local: $LOCAL_UPLOAD_DIR"
echo "Diretório remoto: $REMOTE_UPLOAD_DIR"
echo ""

# Verificar se diretório local existe
if [ ! -d "$LOCAL_UPLOAD_DIR" ]; then
    echo -e "${RED}✗${NC} Diretório local não encontrado: $LOCAL_UPLOAD_DIR"
    exit 1
fi

# Contar GIFs locais
TOTAL_GIFS=$(find "$LOCAL_UPLOAD_DIR" -name "exercicio.gif" -type f | wc -l)
echo -e "${BLUE}📊${NC} Total de GIFs encontrados localmente: $TOTAL_GIFS"

if [ $TOTAL_GIFS -eq 0 ]; then
    echo -e "${YELLOW}⚠${NC} Nenhum GIF encontrado localmente!"
    exit 1
fi

# Listar GIFs que serão sincronizados
echo ""
echo -e "${BLUE}📋${NC} GIFs que serão sincronizados:"
find "$LOCAL_UPLOAD_DIR" -name "exercicio.gif" -type f | while read gif; do
    exercicio_id=$(basename $(dirname "$gif"))
    size=$(du -h "$gif" | cut -f1)
    echo "   - $exercicio_id ($size)"
done

echo ""
read -p "Deseja continuar com a sincronização? (s/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Sincronização cancelada."
    exit 0
fi

# Verificar conexão com servidor
echo ""
echo -e "${BLUE}🔌${NC} Verificando conexão com servidor..."
if ssh -o ConnectTimeout=5 -o BatchMode=yes "$USER@$SERVER" exit 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Conexão OK"
else
    echo -e "${RED}✗${NC} Não foi possível conectar ao servidor"
    echo "   Verifique:"
    echo "   - Servidor está acessível?"
    echo "   - SSH key está configurada?"
    echo "   - Usuário tem permissão de acesso?"
    exit 1
fi

# Criar diretório remoto se não existir
echo ""
echo -e "${BLUE}📁${NC} Verificando/criando diretório remoto..."
ssh "$USER@$SERVER" "mkdir -p $REMOTE_UPLOAD_DIR && chmod -R 755 $REMOTE_UPLOAD_DIR"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Diretório remoto OK"
else
    echo -e "${RED}✗${NC} Erro ao criar diretório remoto"
    exit 1
fi

# Sincronizar GIFs usando rsync
echo ""
echo -e "${BLUE}🔄${NC} Sincronizando GIFs..."
rsync -avz --progress \
    --include="*/" \
    --include="exercicio.gif" \
    --exclude="*" \
    "$LOCAL_UPLOAD_DIR/" "$USER@$SERVER:$REMOTE_UPLOAD_DIR/"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓${NC} Sincronização concluída com sucesso!"
    
    # Verificar quantos GIFs foram copiados
    REMOTE_COUNT=$(ssh "$USER@$SERVER" "find $REMOTE_UPLOAD_DIR -name 'exercicio.gif' -type f | wc -l")
    echo -e "${BLUE}📊${NC} GIFs no servidor após sincronização: $REMOTE_COUNT"
    
    if [ $REMOTE_COUNT -eq $TOTAL_GIFS ]; then
        echo -e "${GREEN}✓${NC} Todos os GIFs foram sincronizados!"
    else
        echo -e "${YELLOW}⚠${NC} Alguns GIFs podem não ter sido sincronizados"
        echo "   Local: $TOTAL_GIFS | Remoto: $REMOTE_COUNT"
    fi
    
    # Verificar permissões
    echo ""
    echo -e "${BLUE}🔐${NC} Ajustando permissões..."
    ssh "$USER@$SERVER" "chmod -R 755 $REMOTE_UPLOAD_DIR"
    echo -e "${GREEN}✓${NC} Permissões ajustadas"
    
    # Reiniciar backend para garantir que está servindo os arquivos
    echo ""
    echo -e "${BLUE}🔄${NC} Reiniciando backend..."
    ssh "$USER@$SERVER" "cd /opt/athletia/backend && pm2 restart athletia-backend || echo 'PM2 não encontrado, reinicie manualmente'"
    
    echo ""
    echo -e "${GREEN}✅${NC} Sincronização completa!"
    echo ""
    echo "💡 Próximos passos:"
    echo "   1. Verifique o endpoint: GET /api/admin/gifs/status"
    echo "   2. Teste alguns GIFs no frontend"
    echo "   3. Verifique logs do backend se houver problemas"
    
else
    echo ""
    echo -e "${RED}✗${NC} Erro durante a sincronização"
    exit 1
fi

echo ""
echo -e "${BLUE}===== FIM DA SINCRONIZAÇÃO =====${NC}"

