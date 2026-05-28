#!/bin/bash
# =============================================================================
# Deploy AthletIA — produção (VPS)  [v2.2]
# Uso:  cd /opt/athletia && bash deploy.sh
# =============================================================================
set -euo pipefail

DEPLOY_VERSION="2.2"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"
DUAL_REPO=false

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

# --- Detectar layout ---
if [ -d "$SCRIPT_DIR/backend" ] && [ -d "$SCRIPT_DIR/frontend" ]; then
  BACKEND_DIR="$SCRIPT_DIR/backend"
  FRONTEND_DIR="$SCRIPT_DIR/frontend"
  if [ -d "$BACKEND_DIR/.git" ] && [ -d "$FRONTEND_DIR/.git" ]; then
    DUAL_REPO=true
  fi
else
  fail "Pastas backend/ e frontend/ não encontradas em $SCRIPT_DIR"
fi

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Comando obrigatório não encontrado: $1"
}

require_cmd git
require_cmd npm
require_cmd pm2
[ -d "$BACKEND_DIR" ] || fail "Backend não encontrado: $BACKEND_DIR"
[ -d "$FRONTEND_DIR" ] || fail "Frontend não encontrado: $FRONTEND_DIR"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Deploy AthletIA v${DEPLOY_VERSION} — branch: $BRANCH"
echo "  Backend:  $BACKEND_DIR"
echo "  Frontend: $FRONTEND_DIR"
if [ "$DUAL_REPO" = true ]; then
  echo "  Git: repositórios separados (backend + frontend)"
else
  echo "  Git: monorepo em $ROOT_DIR"
fi
echo "═══════════════════════════════════════════════════════════════"

# Se ainda aparecer só "==== Atualizando /opt/athletia/backend" sem este cabeçalho,
# o deploy.sh no servidor está desatualizado — rode: git pull origin main

git_pull_dir() {
  local dir="$1"
  local label="$2"
  [ -d "$dir/.git" ] || fail "[$label] Não é repositório git: $dir"

  cd "$dir"
  if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    warn "[$label] Alterações locais detectadas — stash automático (não commite no servidor)"
    git stash push -u -m "deploy-v${DEPLOY_VERSION}-$(date +%Y-%m-%d_%H-%M-%S)" || true
  fi
  git fetch origin "$BRANCH"
  # Evita erro "cannot pull with rebase: You have unstaged changes"
  git -c pull.rebase=false pull origin "$BRANCH"
  ok "[$label] $(git rev-parse --short HEAD) — $(git log -1 --pretty=%s)"
}

# --- 1. Git ---
step "1/8 Atualizando código"

if [ "$DUAL_REPO" = true ]; then
  git_pull_dir "$BACKEND_DIR" "backend"
  git_pull_dir "$FRONTEND_DIR" "frontend"
elif [ -d "$ROOT_DIR/.git" ]; then
  git_pull_dir "$ROOT_DIR" "monorepo"
else
  fail "Nenhum .git encontrado. Clone o repositório em $ROOT_DIR ou em backend/ e frontend/"
fi

# --- 2. Backend ---
step "2/8 Backend — npm ci"
cd "$BACKEND_DIR"
[ -f package-lock.json ] || fail "Commit package-lock.json do backend no Git"
npm ci
ok "Dependências do backend"

step "3/8 Backend — Prisma"
npm run prisma:generate
npx prisma migrate deploy
ok "Prisma OK"

step "4/8 Backend — build"
npm run build
ok "Build do backend OK"

step "5/8 Backend — PM2"
[ -f "$BACKEND_DIR/dist/index.js" ] || fail "dist/index.js não existe — build falhou?"

# Corrige PM2 antigo que apontava para dist/src/index.js (gera 502 no Nginx)
if pm2 describe "$BACKEND_PROCESS" >/dev/null 2>&1; then
  CURRENT_SCRIPT=$(pm2 describe "$BACKEND_PROCESS" 2>/dev/null | grep -E 'script path' | head -1 || true)
  if echo "$CURRENT_SCRIPT" | grep -q 'dist/src/index'; then
    warn "PM2 com entrypoint errado — recriando com ecosystem.config.cjs"
    pm2 delete "$BACKEND_PROCESS" || true
  fi
fi

pm2 startOrReload "$BACKEND_DIR/ecosystem.config.cjs" --update-env
pm2 save

sleep 2
if curl -sf "http://127.0.0.1:3001/health" >/dev/null; then
  ok "API respondendo em :3001/health"
else
  warn "API não respondeu em :3001/health — veja: pm2 logs $BACKEND_PROCESS --lines 40"
fi
ok "PM2: $BACKEND_PROCESS (dist/index.js)"

# --- 3. Frontend ---
step "6/8 Frontend — npm ci"
cd "$FRONTEND_DIR"
[ -f package-lock.json ] || fail "Commit package-lock.json do frontend no Git"
npm ci
ok "Dependências do frontend"

step "7/8 Frontend — build"
npm run build
[ -d dist ] || fail "dist/ não gerado"
ok "Build do frontend OK"

# Frontend: Nginx serve /opt/athletia/frontend/dist — NÃO usar "npm start" (não existe)
step "7b/8 Frontend — PM2 (opcional)"
if pm2 describe "$FRONTEND_PROCESS" >/dev/null 2>&1; then
  if npm pkg get scripts.start 2>/dev/null | grep -q null; then
    warn "Removendo PM2 '$FRONTEND_PROCESS' (sem script 'start'; use Nginx para o dist/)"
    pm2 delete "$FRONTEND_PROCESS" || true
    pm2 save || true
  else
    pm2 restart "$FRONTEND_PROCESS" --update-env
    ok "PM2 frontend reiniciado"
  fi
else
  ok "Sem PM2 no frontend — correto se o Nginx aponta para frontend/dist"
fi

# --- 4. Nginx ---
step "8/8 Nginx reload"
if command -v systemctl >/dev/null 2>&1; then
  sudo systemctl reload nginx && ok "Nginx recarregado" || warn "Execute: sudo systemctl reload nginx"
else
  warn "Recarregue o Nginx manualmente"
fi

echo ""
step "Auditoria (somente leitura — corrija no PC e commit o lock)"
(cd "$BACKEND_DIR" && npm audit --audit-level=high 2>&1 | tail -2) || true
(cd "$FRONTEND_DIR" && npm audit --audit-level=high 2>&1 | tail -2) || true

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}Deploy v${DEPLOY_VERSION} concluído${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo "  pm2 status"
echo "  pm2 logs $BACKEND_PROCESS --lines 30"
echo ""
