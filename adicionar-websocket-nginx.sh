#!/bin/bash
# Script para adicionar configuração de WebSocket no nginx

NGINX_CONFIG="/etc/nginx/sites-enabled/athletia"
BACKUP_FILE="/etc/nginx/sites-enabled/athletia.backup.$(date +%Y%m%d_%H%M%S)"

echo "=== Adicionando configuração de WebSocket ==="

# Fazer backup
cp "$NGINX_CONFIG" "$BACKUP_FILE"
echo "✅ Backup criado: $BACKUP_FILE"

# Verificar se já existe
if grep -q "location /socket.io/" "$NGINX_CONFIG"; then
    echo "⚠️  Configuração de WebSocket já existe!"
    exit 0
fi

# Adicionar map para connection_upgrade (se não existir)
if ! grep -q "map \$http_upgrade \$connection_upgrade" "$NGINX_CONFIG"; then
    echo "Adicionando map para connection_upgrade..."
    # Adicionar antes do primeiro server block
    sed -i '/^server {/i\# Mapeamento de conexão para WebSocket upgrade\nmap $http_upgrade $connection_upgrade {\n    default upgrade;\n    '\'''\'' close;\n}\n' "$NGINX_CONFIG"
fi

# Encontrar a linha de location /api/ na seção HTTPS
API_LINE=$(grep -n "location /api/" "$NGINX_CONFIG" | head -1 | cut -d: -f1)

if [ -z "$API_LINE" ]; then
    echo "❌ Não foi possível encontrar location /api/"
    exit 1
fi

echo "Encontrado location /api/ na linha $API_LINE"

# Criar configuração de WebSocket
WEBSOCKET_CONFIG="    # ========================================================================
    # PROXY PARA WEBSOCKET (Socket.IO) - DEVE VIR ANTES DE /api/
    # ========================================================================
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        
        # WebSocket upgrade (condicional)
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        
        # Headers essenciais
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        
        # Timeouts para WebSocket
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
        
        # Desabilitar buffering para WebSocket
        proxy_buffering off;
        proxy_cache_bypass \$http_upgrade;
    }
"

# Adicionar antes de location /api/
sed -i "${API_LINE}i\\${WEBSOCKET_CONFIG}" "$NGINX_CONFIG"

echo "✅ Configuração de WebSocket adicionada!"

# Testar configuração
echo ""
echo "Testando configuração do nginx..."
if nginx -t 2>&1 | grep -q "syntax is ok"; then
    echo "✅ Configuração válida!"
    echo ""
    echo "Recarregando nginx..."
    systemctl reload nginx
    echo "✅ Nginx recarregado!"
    echo ""
    echo "=== Concluído ==="
    echo "A configuração de WebSocket foi adicionada com sucesso."
else
    echo "❌ Erro na configuração!"
    echo "Restaurando backup..."
    cp "$BACKUP_FILE" "$NGINX_CONFIG"
    echo "Backup restaurado. Verifique o arquivo manualmente."
    exit 1
fi

