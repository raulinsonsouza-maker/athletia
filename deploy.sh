#!/bin/bash
# =============================================================================
# Deploy AthletIA — produção (VPS)
# Execute na raiz do repositório:  cd /opt/athletia && bash deploy.sh
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"
LEGACY_LAYOUT=false

BACKEND_PROCESS="athletia-backend"
FRONTEND_PROCESS="athletia-frontend"
BRANCH="${1:-main}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

step() { echo -e "\n${CYAN}▶ $1${NC}"; }
ok()   { echo -e "${GREEN}✓ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
fail() { echo -e "${RED}✗ $1${NC}"; exit 1; }

# Layout padrão: /opt/athletia/{backend,frontend,deploy.sh}
if [ -d "$SCRIPT_DIR/backend" ] && [ -d "$SCRIPT_DIR/frontend" ]; then
  ROOT_DIR="$SCRIPT_DIR"
  BACKEND_DIR="$ROOT_DIR/backend"
  FRONTEND_DIR="$ROOT_DIR/frontend"
elif [ -d "$SCRIPT_DIR/../frontend" ] && [ -f "$SCRIPT_DIR/package.json" ]; then
  LEGACY_LAYOUT=true
  BACKEND_DIR="$SCRIPT_DIR"
  FRONTEND_DIR="$(cd "$SCRIPT_DIR/../frontend" && pwd)"
  ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
else
  BACKEND_DIR="$SCRIPT_DIR/backend"
  FRONTEND_DIR="$SCRIPT_DIR/frontend"
fi

require_dir() {
  [ -d "$1" ] || fail "Diretório não encontrado: $1"
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Comando obrigatório não encontrado: $1"
}

# --- Pré-checagens ---
require_cmd git
require_cmd npm
require_cmd pm2
require_dir "$BACKEND_DIR"
require_dir "$FRONTEND_DIR"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Deploy AthletIA — branch: $BRANCH"
echo "  Raiz: $ROOT_DIR"
echo "═══════════════════════════════════════════════════════════════"

git_pull_dir() {
  local dir="$1"
  local label="$2"
  cd "$dir"
  if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    warn "[$label] Alterações locais — stash automático..."
    git stash push -m "deploy-auto-stash $(date +%Y-%m-%d_%H-%M-%S)" || true
  fi
  git fetch origin "$BRANCH"
  git pull origin "$BRANCH"
  ok "[$label] $(git rev-parse --short HEAD) — $(git log -1 --pretty=%s)"
}

# --- 1. Git ---
step "1/8 Atualizando código (git pull origin $BRANCH)"

if [ "$LEGACY_LAYOUT" = true ]; then
  warn "Layout legado (dois repositórios). Ideal: um monorepo em $ROOT_DIR com deploy.sh na raiz."
  git_pull_dir "$BACKEND_DIR" "backend"
  git_pull_dir "$FRONTEND_DIR" "frontend"
else
  git_pull_dir "$ROOT_DIR" "monorepo"
fi

# --- 2. Backend: dependências (lock file = versões fixas) ---
step "2/8 Backend — instalando dependências (npm ci)"
cd "$BACKEND_DIR"
[ -f package-lock.json ] || fail "package-lock.json ausente no backend. Commit o lock no Git."

# npm ci = mesmas versões do lock (evita vulnerabilidades “voltarem” por npm install solto)
npm ci
ok "Dependências do backend instaladas"

# --- 3. Backend: Prisma ---
step "3/8 Backend — Prisma generate + migrations"
npm run prisma:generate
npx prisma migrate deploy
ok "Prisma OK"

# --- 4. Backend: build ---
step "4/8 Backend — build"
npm run build
ok "Build do backend OK"

# --- 5. Backend: PM2 ---
step "5/8 Backend — reiniciar PM2"
if pm2 describe "$BACKEND_PROCESS" >/dev/null 2>&1; then
  pm2 restart "$BACKEND_PROCESS"
else
  warn "Processo $BACKEND_PROCESS não existe; criando..."
  pm2 start npm --name "$BACKEND_PROCESS" --cwd "$BACKEND_DIR" -- start
fi
ok "Backend PM2: $BACKEND_PROCESS"

# --- 6. Frontend: dependências + build ---
step "6/8 Frontend — instalando dependências (npm ci)"
cd "$FRONTEND_DIR"
[ -f package-lock.json ] || fail "package-lock.json ausente no frontend. Commit o lock no Git."

npm ci
ok "Dependências do frontend instaladas"

step "7/8 Frontend — build"
npm run build
[ -d dist ] || fail "Pasta frontend/dist não foi gerada."
ok "Build do frontend OK ($(du -sh dist 2>/dev/null | cut -f1 || echo 'dist'))"

# Frontend em produção costuma ser servido pelo Nginx (arquivos estáticos em dist/).
# Só reinicia PM2 do frontend se o processo já existir (ex.: vite preview).
if pm2 describe "$FRONTEND_PROCESS" >/dev/null 2>&1; then
  pm2 restart "$FRONTEND_PROCESS"
  ok "Frontend PM2: $FRONTEND_PROCESS"
else
  warn "PM2 '$FRONTEND_PROCESS' não configurado — normal se o Nginx serve só o dist/"
fi

# --- 8. Nginx ---
step "8/8 Recarregar Nginx"
if command -v systemctl >/dev/null 2>&1; then
  sudo systemctl reload nginx && ok "Nginx recarregado" || warn "Falha ao recarregar Nginx (rode: sudo systemctl reload nginx)"
else
  warn "systemctl não disponível — recarregue o Nginx manualmente se necessário"
fi

# --- Auditoria (informativo; NÃO altera o servidor) ---
echo ""
step "Auditoria de dependências (somente leitura)"
cd "$BACKEND_DIR"
BE_AUDIT=$(npm audit --audit-level=high 2>&1 | tail -3 || true)
cd "$FRONTEND_DIR"
FE_AUDIT=$(npm audit --audit-level=high 2>&1 | tail -3 || true)
echo "Backend:  $BE_AUDIT"
echo "Frontend: $FE_AUDIT"
warn "Corrija CVEs no seu PC com 'npm audit fix', commit package-lock.json e faça deploy de novo."
warn "Não rode 'npm audit fix' no servidor — isso altera o lock fora do Git e o problema volta."

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}Deploy concluído com sucesso${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  pm2 status"
echo "  pm2 logs $BACKEND_PROCESS --lines 30"
echo ""
