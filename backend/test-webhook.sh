#!/bin/bash
# Script para testar webhook do Cakto localmente
# Uso: bash test-webhook.sh <email> <evento> [product_id]

EMAIL=${1:-"teste@example.com"}
EVENT=${2:-"purchase_approved"}
PRODUCT_ID=${3:-"jzdhue5_669308"} # Default: MENSAL

# Cores
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}🧪 Testando Webhook Cakto${NC}"
echo -e "Email: ${EMAIL}"
echo -e "Evento: ${EVENT}"
echo -e "Product ID: ${PRODUCT_ID}"
echo ""

# Determinar plano baseado no product_id
PLANO="MENSAL"
if [ "$PRODUCT_ID" = "372jgsf_669369" ]; then
    PLANO="TRIMESTRAL"
elif [ "$PRODUCT_ID" = "329be6o_669375" ]; then
    PLANO="SEMESTRAL"
fi

# Montar payload baseado no evento
case $EVENT in
    "purchase_approved")
        PAYLOAD=$(cat <<EOF
{
  "event": "purchase_approved",
  "data": {
    "id": "test_$(date +%s)",
    "amount": 19.90,
    "status": "approved",
    "product": {
      "id": "${PRODUCT_ID}"
    },
    "customer": {
      "email": "${EMAIL}",
      "id": "customer_test_123"
    },
    "paymentMethod": "credit_card"
  },
  "secret": "83d08ba9-14bd-459f-8fd9-0a816ba5a089"
}
EOF
)
        ;;
    "refund")
        PAYLOAD=$(cat <<EOF
{
  "event": "refund",
  "data": {
    "id": "test_$(date +%s)",
    "amount": 19.90,
    "customer": {
      "email": "${EMAIL}"
    }
  },
  "secret": "83d08ba9-14bd-459f-8fd9-0a816ba5a089"
}
EOF
)
        ;;
    "subscription_cancelled")
        PAYLOAD=$(cat <<EOF
{
  "event": "subscription_cancelled",
  "data": {
    "id": "test_$(date +%s)",
    "customer": {
      "email": "${EMAIL}"
    }
  },
  "secret": "83d08ba9-14bd-459f-8fd9-0a816ba5a089"
}
EOF
)
        ;;
    *)
        echo -e "${YELLOW}⚠️  Evento não reconhecido: ${EVENT}${NC}"
        echo "Eventos válidos: purchase_approved, refund, subscription_cancelled"
        exit 1
        ;;
esac

echo -e "${CYAN}📤 Enviando webhook...${NC}"
echo ""

# Enviar webhook
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3001/api/webhooks/cakto \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

# Separar body e status code
HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

echo -e "${CYAN}📥 Resposta (Status: ${HTTP_CODE}):${NC}"
echo "$HTTP_BODY" | jq '.' 2>/dev/null || echo "$HTTP_BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Webhook processado com sucesso!${NC}"
    echo ""
    echo -e "${CYAN}📋 Próximos passos:${NC}"
    echo "1. Verifique os logs do backend: pm2 logs athletia-backend"
    echo "2. Verifique o banco de dados:"
    echo "   SELECT * FROM users WHERE email = '${EMAIL}';"
    echo "   SELECT * FROM payment_history WHERE \"userId\" = (SELECT id FROM users WHERE email = '${EMAIL}');"
else
    echo -e "${YELLOW}⚠️  Webhook retornou status ${HTTP_CODE}${NC}"
    echo "Verifique os logs do backend para mais detalhes"
fi

