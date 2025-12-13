#!/bin/bash

# Diretórios
BACKEND_DIR="/opt/athletia/backend"
FRONTEND_DIR="/opt/athletia/frontend"

# Nomes dos processos PM2
BACKEND_PROCESS="athletia-backend"
FRONTEND_PROCESS="athletia-frontend"

# Função de deploy
deploy() {
    DIR=$1
    PROCESS_NAME=$2

    echo "=============================="
    echo "Atualizando $DIR..."
    cd $DIR || { echo "Diretório $DIR não encontrado"; exit 1; }

    # Atualiza código
    git pull

    # Instala dependências
    npm install

    # Build, se existir
    if npm run | grep -q "build"; then
        npm run build
    fi

    # Reinicia PM2 ou cria se não existir
    pm2 restart $PROCESS_NAME || pm2 start npm --name "$PROCESS_NAME" -- start

    echo "$DIR atualizado com sucesso!"
    echo "=============================="
}

# Deploy backend
deploy $BACKEND_DIR $BACKEND_PROCESS

# Deploy frontend
deploy $FRONTEND_DIR $FRONTEND_PROCESS

echo "Deploy completo!"
