#!/bin/bash
# Script para testar geração de URL de checkout
# Uso: bash test-checkout.sh <plano> <email>

PLANO=${1:-"MENSAL"}
EMAIL=${2:-"teste@example.com"}

# Cores
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}🧪 Testando Geração de URL de Checkout${NC}"
echo -e "Plano: ${PLANO}"
echo -e "Email: ${EMAIL}"
echo ""

# Validar plano
if [[ ! "$PLANO" =~ ^(MENSAL|TRIMESTRAL|SEMESTRAL)$ ]]; then
    echo -e "${RED}❌ Plano inválido: ${PLANO}${NC}"
    echo "Planos válidos: MENSAL, TRIMESTRAL, SEMESTRAL"
    exit 1
fi

# Montar payload
PAYLOAD=$(cat <<EOF
{
  "plano": "${PLANO}",
  "email": "${EMAIL}"
}
EOF
)

echo -e "${CYAN}📤 Enviando requisição...${NC}"
echo ""

# Enviar requisição
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3001/api/payment/checkout \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

# Separar body e status code
HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

echo -e "${CYAN}📥 Resposta (Status: ${HTTP_CODE}):${NC}"
echo "$HTTP_BODY" | jq '.' 2>/dev/null || echo "$HTTP_BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    CHECKOUT_URL=$(echo "$HTTP_BODY" | jq -r '.checkoutUrl' 2>/dev/null)
    
    if [ -n "$CHECKOUT_URL" ] && [ "$CHECKOUT_URL" != "null" ]; then
        echo -e "${GREEN}✅ URL de checkout gerada com sucesso!${NC}"
        echo ""
        echo -e "${CYAN}🔗 URL:${NC}"
        echo "$CHECKOUT_URL"
        echo ""
        
        # Verificar product_id esperado
        case $PLANO in
            "MENSAL")
                EXPECTED_ID="jzdhue5_669308"
                ;;
            "TRIMESTRAL")
                EXPECTED_ID="372jgsf_669369"
                ;;
            "SEMESTRAL")
                EXPECTED_ID="329be6o_669375"
                ;;
        esac
        
        if echo "$CHECKOUT_URL" | grep -q "$EXPECTED_ID"; then
            echo -e "${GREEN}✅ Product ID correto: ${EXPECTED_ID}${NC}"
        else
            echo -e "${YELLOW}⚠️  Product ID pode estar incorreto. Esperado: ${EXPECTED_ID}${NC}"
        fi
        
        # Verificar se email está na URL
        if echo "$CHECKOUT_URL" | grep -q "email="; then
            echo -e "${GREEN}✅ Email presente na URL${NC}"
        else
            echo -e "${YELLOW}⚠️  Email não encontrado na URL${NC}"
        fi
    else
        echo -e "${RED}❌ URL de checkout não encontrada na resposta${NC}"
    fi
else
    echo -e "${RED}❌ Erro ao gerar URL de checkout${NC}"
    echo "Verifique os logs do backend para mais detalhes"
fi

