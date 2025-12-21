#!/bin/bash

# ============================================================================
# SCRIPT DE DEPLOY PARA PRODUÇÃO - ATHLETIA (LINUX/VPS)
# ============================================================================
# Este script faz o deploy completo do frontend e backend no servidor
# Execute: bash deploy-producao.sh [branch]
# Exemplo: bash deploy-producao.sh main
# ============================================================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Funções de output
print_step() {
    echo -e "\n${CYAN}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Execute este script na raiz do projeto (onde estão as pastas backend e frontend)"
    exit 1
fi

# Diretórios
PROJECT_DIR=$(pwd)
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Nomes dos processos PM2
BACKEND_PROCESS="athletia-backend"
FRONTEND_PROCESS="athletia-frontend"

# Branch padrão
BRANCH="${1:-main}"

# ============================================================================
# INÍCIO DO DEPLOY
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  🚀 DEPLOY ATHLETIA - PRODUÇÃO"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ============================================================================
# 1. GIT PULL
# ============================================================================

print_step "1/9 Atualizando código do repositório (git pull)..."

# Verificar se há mudanças não commitadas (apenas avisar, não bloquear)
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Há mudanças não commitadas no repositório:"
    git status --short
    print_warning "Continuando com o deploy mesmo assim..."
fi

# Fazer pull
if git pull origin "$BRANCH"; then
    print_success "Código atualizado com sucesso"
else
    print_error "Falha ao atualizar código. Verifique sua conexão e permissões do Git."
    exit 1
fi

# ============================================================================
# 2. BACKEND - INSTALAR DEPENDÊNCIAS
# ============================================================================

print_step "2/9 Instalando dependências do backend..."

cd "$BACKEND_DIR"
if npm install; then
    print_success "Dependências do backend instaladas"
    cd "$PROJECT_DIR"
else
    print_error "Falha ao instalar dependências do backend"
    cd "$PROJECT_DIR"
    exit 1
fi

# ============================================================================
# 3. BACKEND - GERAR PRISMA CLIENT
# ============================================================================

print_step "3/9 Gerando Prisma Client..."

cd "$BACKEND_DIR"
if npm run prisma:generate; then
    print_success "Prisma Client gerado com sucesso"
    cd "$PROJECT_DIR"
else
    print_error "Falha ao gerar Prisma Client"
    cd "$PROJECT_DIR"
    exit 1
fi

# ============================================================================
# 4. BACKEND - EXECUTAR MIGRATIONS
# ============================================================================

print_step "4/9 Executando migrations do banco de dados..."

# Em produção, usar 'prisma migrate deploy' diretamente
# Isso aplica migrations sem criar shadow database (mais seguro para produção)
cd "$BACKEND_DIR"
if npx prisma migrate deploy; then
    print_success "Migrations executadas com sucesso"
    cd "$PROJECT_DIR"
else
    print_error "Falha ao executar migrations. Verifique a conexão com o banco de dados."
    print_warning "Dica: O comando 'prisma migrate deploy' é para produção e não cria shadow database."
    print_warning "Se o erro persistir, verifique se o banco de dados está acessível e se as migrations estão corretas."
    cd "$PROJECT_DIR"
    exit 1
fi

# ============================================================================
# 5. BACKEND - BUILD
# ============================================================================

print_step "5/9 Fazendo build do backend..."

# Garantir que estamos no diretório do backend
cd "$BACKEND_DIR"
if npm run build; then
    print_success "Build do backend concluído"
    cd "$PROJECT_DIR"
else
    print_error "Falha ao fazer build do backend. Verifique os erros de TypeScript acima."
    cd "$PROJECT_DIR"
    exit 1
fi

# ============================================================================
# 6. BACKEND - REINICIAR PM2
# ============================================================================

print_step "6/9 Reiniciando backend no PM2..."

if pm2 restart "$BACKEND_PROCESS" 2>/dev/null || pm2 start npm --name "$BACKEND_PROCESS" -- start; then
    print_success "Backend reiniciado no PM2"
else
    print_error "Falha ao reiniciar backend no PM2"
    exit 1
fi

# ============================================================================
# 7. FRONTEND - INSTALAR DEPENDÊNCIAS
# ============================================================================

print_step "7/8 Instalando dependências do frontend..."

cd "$FRONTEND_DIR"
if npm install; then
    print_success "Dependências do frontend instaladas"
else
    print_error "Falha ao instalar dependências do frontend"
    exit 1
fi

# ============================================================================
# 8. FRONTEND - BUILD
# ============================================================================

print_step "8/9 Fazendo build do frontend..."

if npm run build; then
    print_success "Build do frontend concluído"
else
    print_error "Falha ao fazer build do frontend. Verifique os erros acima."
    exit 1
fi

# ============================================================================
# 9. RECARREGAR NGINX
# ============================================================================

print_step "9/9 Recarregando Nginx..."

if sudo systemctl reload nginx 2>/dev/null; then
    print_success "Nginx recarregado com sucesso"
else
    print_warning "Não foi possível recarregar o Nginx automaticamente. Execute manualmente: sudo systemctl reload nginx"
fi

# ============================================================================
# CONCLUSÃO
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "═══════════════════════════════════════════════════════════════"
echo ""

print_success "Todos os passos foram executados com sucesso!"

echo ""
echo "📋 VERIFICAÇÕES PÓS-DEPLOY:"
echo ""
echo "  1. Status dos serviços PM2:"
echo "     ${CYAN}pm2 status${NC}"
echo ""
echo "  2. Logs do backend (últimas 50 linhas):"
echo "     ${CYAN}pm2 logs $BACKEND_PROCESS --lines 50${NC}"
echo ""
echo "  3. Teste da API do backend:"
echo "     ${CYAN}curl -s http://localhost:3001/api/health | head -20${NC}"
echo ""
echo "  4. Teste do frontend (via Nginx):"
echo "     ${CYAN}curl -s http://localhost | head -20${NC}"
echo ""
echo "  5. Verificar se o build do frontend foi criado:"
echo "     ${CYAN}ls -lh $FRONTEND_DIR/dist | head -10${NC}"
echo ""
echo "  6. Monitorar logs em tempo real (Ctrl+C para sair):"
echo "     ${CYAN}pm2 logs${NC}"
echo ""

print_success "Deploy finalizado!"
