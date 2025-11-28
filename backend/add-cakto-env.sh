#!/bin/bash
# Script para adicionar variáveis do Cakto ao .env
# Linux
# Uso: bash add-cakto-env.sh

ENV_FILE=".env"
ENV_EXAMPLE="env.example.txt"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Verificar se .env existe
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
    echo -e "${YELLOW}📋 Criando .env a partir de env.example.txt...${NC}"
    
    if [ -f "$ENV_EXAMPLE" ]; then
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        echo -e "${GREEN}✅ Arquivo .env criado!${NC}"
    else
        echo -e "${RED}❌ env.example.txt também não encontrado!${NC}"
        exit 1
    fi
fi

echo -e "\n${CYAN}🔧 Adicionando/Atualizando variáveis do Cakto no .env...${NC}"

# Variáveis do Cakto
CAKTO_WEBHOOK_SECRET="83d08ba9-14bd-459f-8fd9-0a816ba5a089"
CAKTO_PRODUCT_ID_MENSAL="jzdhue5_669308"
CAKTO_PRODUCT_ID_TRIMESTRAL="372jgsf_669369"
CAKTO_PRODUCT_ID_SEMESTRAL="329be6o_669375"

# Função para adicionar/atualizar variável
update_env_var() {
    local var_name=$1
    local var_value=$2
    
    # Verificar se a variável já existe
    if grep -q "^${var_name}=" "$ENV_FILE"; then
        # Atualizar variável existente
        echo -e "  ${YELLOW}✏️  Atualizando: ${var_name}${NC}"
        sed -i "s|^${var_name}=.*|${var_name}=\"${var_value}\"|" "$ENV_FILE"
    else
        # Adicionar nova variável
        echo -e "  ${GREEN}➕ Adicionando: ${var_name}${NC}"
        
        # Verificar se já existe seção Cakto
        if ! grep -q "^# Cakto" "$ENV_FILE"; then
            # Adicionar seção Cakto no final do arquivo
            echo "" >> "$ENV_FILE"
            echo "# Cakto - Pagamentos" >> "$ENV_FILE"
        fi
        
        # Adicionar variável
        echo "${var_name}=\"${var_value}\"" >> "$ENV_FILE"
    fi
}

# Atualizar cada variável
update_env_var "CAKTO_WEBHOOK_SECRET" "$CAKTO_WEBHOOK_SECRET"
update_env_var "CAKTO_PRODUCT_ID_MENSAL" "$CAKTO_PRODUCT_ID_MENSAL"
update_env_var "CAKTO_PRODUCT_ID_TRIMESTRAL" "$CAKTO_PRODUCT_ID_TRIMESTRAL"
update_env_var "CAKTO_PRODUCT_ID_SEMESTRAL" "$CAKTO_PRODUCT_ID_SEMESTRAL"

echo -e "\n${GREEN}✅ Variáveis do Cakto adicionadas/atualizadas com sucesso!${NC}"
echo -e "\n${CYAN}📋 Variáveis configuradas:${NC}"
echo -e "   CAKTO_WEBHOOK_SECRET = ${CAKTO_WEBHOOK_SECRET}"
echo -e "   CAKTO_PRODUCT_ID_MENSAL = ${CAKTO_PRODUCT_ID_MENSAL}"
echo -e "   CAKTO_PRODUCT_ID_TRIMESTRAL = ${CAKTO_PRODUCT_ID_TRIMESTRAL}"
echo -e "   CAKTO_PRODUCT_ID_SEMESTRAL = ${CAKTO_PRODUCT_ID_SEMESTRAL}"

echo -e "\n${YELLOW}⚠️  Lembre-se de reiniciar o servidor backend para carregar as novas variáveis!${NC}"

