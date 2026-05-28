#!/bin/bash
# Uso único no VPS quando deploy falhou ou há alterações locais / PM2 quebrado
#   cd /opt/athletia && bash scripts/recuperar-producao.sh
set -euo pipefail

ATHLETIA_ROOT="${ATHLETIA_ROOT:-/opt/athletia}"
BACKEND="$ATHLETIA_ROOT/backend"
FRONTEND="$ATHLETIA_ROOT/frontend"
BRANCH="${1:-main}"

echo "=== Recuperação AthletIA ==="

for dir in "$ATHLETIA_ROOT" "$BACKEND" "$FRONTEND"; do
  if [ -d "$dir/.git" ]; then
    echo ">> Stash + reset em $dir"
    cd "$dir"
    git stash push -u -m "recuperar-producao-$(date +%s)" 2>/dev/null || true
    git fetch origin "$BRANCH"
    git -c pull.rebase=false pull origin "$BRANCH"
    git status -sb
  fi
done

echo ">> Removendo PM2 frontend quebrado (sem npm start)"
pm2 delete athletia-frontend 2>/dev/null || true
pm2 save 2>/dev/null || true

echo ">> Deploy oficial"
cd "$ATHLETIA_ROOT"
bash deploy.sh "$BRANCH"

echo "=== Fim. Teste: pm2 status && curl -sI https://athletia.site | head -5 ==="
