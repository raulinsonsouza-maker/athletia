#!/bin/bash

# Script para verificar estrutura de diretórios e permissões no servidor de produção
# Uso: ./verificar-estrutura-servidor.sh

echo "===== VERIFICAÇÃO DE ESTRUTURA DO SERVIDOR ====="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretório base do projeto
PROJECT_DIR="/opt/athletia"
UPLOAD_DIR="$PROJECT_DIR/backend/upload/exercicios"

echo "📁 Verificando estrutura de diretórios..."
echo ""

# Verificar se diretório do projeto existe
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${GREEN}✓${NC} Diretório do projeto existe: $PROJECT_DIR"
    echo "   Permissões: $(stat -c '%a %U:%G' $PROJECT_DIR)"
else
    echo -e "${RED}✗${NC} Diretório do projeto NÃO existe: $PROJECT_DIR"
fi

# Verificar se diretório de upload existe
if [ -d "$UPLOAD_DIR" ]; then
    echo -e "${GREEN}✓${NC} Diretório de upload existe: $UPLOAD_DIR"
    echo "   Permissões: $(stat -c '%a %U:%G' $UPLOAD_DIR)"
    
    # Verificar permissão de escrita
    if [ -w "$UPLOAD_DIR" ]; then
        echo -e "${GREEN}✓${NC} Permissão de escrita: OK"
    else
        echo -e "${RED}✗${NC} Sem permissão de escrita em: $UPLOAD_DIR"
        echo "   Execute: chmod -R 755 $UPLOAD_DIR"
    fi
else
    echo -e "${YELLOW}⚠${NC} Diretório de upload NÃO existe: $UPLOAD_DIR"
    echo "   Criando diretório..."
    mkdir -p "$UPLOAD_DIR"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Diretório criado com sucesso"
        chmod -R 755 "$UPLOAD_DIR"
    else
        echo -e "${RED}✗${NC} Erro ao criar diretório"
    fi
fi

echo ""
echo "📊 Estatísticas do diretório de upload:"
if [ -d "$UPLOAD_DIR" ]; then
    TOTAL_DIRS=$(find "$UPLOAD_DIR" -mindepth 1 -maxdepth 1 -type d | wc -l)
    TOTAL_GIFS=$(find "$UPLOAD_DIR" -name "exercicio.gif" -type f | wc -l)
    TOTAL_SIZE=$(du -sh "$UPLOAD_DIR" 2>/dev/null | cut -f1)
    
    echo "   Total de diretórios de exercícios: $TOTAL_DIRS"
    echo "   Total de GIFs encontrados: $TOTAL_GIFS"
    echo "   Tamanho total: $TOTAL_SIZE"
    
    if [ $TOTAL_GIFS -eq 0 ]; then
        echo -e "${YELLOW}⚠${NC} Nenhum GIF encontrado no servidor!"
    fi
fi

echo ""
echo "👤 Verificando usuário do PM2..."
PM2_USER=$(ps aux | grep "PM2\|pm2" | grep -v grep | head -1 | awk '{print $1}')
if [ ! -z "$PM2_USER" ]; then
    echo "   Usuário do PM2: $PM2_USER"
    CURRENT_USER=$(whoami)
    echo "   Usuário atual: $CURRENT_USER"
    
    if [ "$PM2_USER" != "$CURRENT_USER" ]; then
        echo -e "${YELLOW}⚠${NC} PM2 está rodando com usuário diferente!"
        echo "   Pode ser necessário ajustar permissões"
    fi
else
    echo -e "${YELLOW}⚠${NC} PM2 não encontrado em execução"
fi

echo ""
echo "🔍 Verificando processos do backend..."
if pgrep -f "athletia-backend" > /dev/null; then
    echo -e "${GREEN}✓${NC} Backend está rodando"
    BACKEND_PID=$(pgrep -f "athletia-backend" | head -1)
    BACKEND_USER=$(ps -o user= -p $BACKEND_PID 2>/dev/null)
    echo "   PID: $BACKEND_PID"
    echo "   Usuário: $BACKEND_USER"
else
    echo -e "${RED}✗${NC} Backend NÃO está rodando"
fi

echo ""
echo "📝 Resumo:"
echo "   - Diretório de upload: $UPLOAD_DIR"
echo "   - Deve existir e ter permissão de escrita"
echo "   - Estrutura esperada: $UPLOAD_DIR/{exercicioId}/exercicio.gif"
echo ""
echo "💡 Para corrigir permissões, execute:"
echo "   sudo chown -R \$USER:\$USER $UPLOAD_DIR"
echo "   sudo chmod -R 755 $UPLOAD_DIR"
echo ""
echo "===== FIM DA VERIFICAÇÃO ====="

