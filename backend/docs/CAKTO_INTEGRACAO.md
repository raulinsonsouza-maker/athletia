# Integração Cakto - Guia de Configuração

## 📋 Sobre os 3 Planos

O AthletIA possui 3 planos diferentes:
- **MENSAL**: R$ 19,90 por mês
- **TRIMESTRAL**: R$ 49,90 a cada 3 meses
- **SEMESTRAL**: R$ 89,90 a cada 6 meses

### Como Funciona no Cakto

No Cakto, você precisa criar **3 produtos diferentes**, um para cada plano:

1. **Produto Mensal** - R$ 19,90
2. **Produto Trimestral** - R$ 49,90  
3. **Produto Semestral** - R$ 89,90

Cada produto terá um `product_id` único que você deve configurar nas variáveis de ambiente.

## 🔧 Configuração

### 1. Criar Produtos no Cakto

1. Acesse o painel do Cakto
2. Vá em **Produtos** e crie 3 produtos:
   - **AthletIA Mensal** - R$ 19,90
   - **AthletIA Trimestral** - R$ 49,90
   - **AthletIA Semestral** - R$ 89,90
3. Anote o `product_id` de cada um

### 2. Configurar Variáveis de Ambiente

No arquivo `backend/.env`, adicione:

```env
# Cakto - Webhook Secret (gerado no painel do Cakto)
CAKTO_WEBHOOK_SECRET="83d08ba9-14bd-459f-8fd9-0a816ba5a089"

# Product IDs (extraídos dos links de pagamento)
# MENSAL: https://pay.cakto.com.br/jzdhue5_669308
CAKTO_PRODUCT_ID_MENSAL="jzdhue5_669308"
# TRIMESTRAL: https://pay.cakto.com.br/372jgsf_669369
CAKTO_PRODUCT_ID_TRIMESTRAL="372jgsf_669369"
# SEMESTRAL: https://pay.cakto.com.br/329be6o_669375
CAKTO_PRODUCT_ID_SEMESTRAL="329be6o_669375"
```

**Nota:** Os product_ids acima são os IDs reais dos seus produtos no Cakto. Certifique-se de configurá-los corretamente.

### 3. Configurar Webhook no Cakto

1. No painel do Cakto, vá em **Apps > Webhooks**
2. Clique em **Adicionar**
3. Configure:
   - **URL**: `https://seu-dominio.com/api/webhooks/cakto`
   - **Eventos**: Selecione:
     - `purchase_approved` (Pagamento aprovado)
     - `refund` (Reembolso)
     - `subscription_cancelled` (Cancelamento)
   - **Secret**: Use `83d08ba9-14bd-459f-8fd9-0a816ba5a089` e adicione em `CAKTO_WEBHOOK_SECRET`

### 4. Executar Migration

```bash
cd backend
npx prisma migrate deploy
# ou em desenvolvimento:
npx prisma migrate dev
```

## 🔄 Fluxo de Pagamento

1. Usuário seleciona plano no checkout (`/checkout`)
2. Frontend chama `POST /api/payment/checkout` com `{ plano: 'MENSAL', email: 'user@email.com' }`
3. Backend retorna URL do Cakto: `https://pay.cakto.com.br/{product_id}?email=user@email.com`
4. Frontend redireciona usuário para URL do Cakto
5. Usuário completa pagamento no Cakto
6. Cakto envia webhook para `/api/webhooks/cakto`
7. Backend:
   - Valida assinatura do webhook
   - Identifica qual produto foi comprado (product_id)
   - Mapeia product_id para plano (MENSAL/TRIMESTRAL/SEMESTRAL)
   - Ativa plano do usuário
   - Calcula data de expiração (1 mês, 3 meses ou 6 meses)
   - Registra transação no histórico
   - Gera treinos automaticamente

## 📊 Mapeamento Product ID → Plano

O sistema mapeia automaticamente:

| Product ID | Plano | Duração | Preço | Link |
|------------|-------|---------|-------|------|
| `jzdhue5_669308` | MENSAL | 1 mês | R$ 19,90 | https://pay.cakto.com.br/jzdhue5_669308 |
| `372jgsf_669369` | TRIMESTRAL | 3 meses | R$ 49,90 | https://pay.cakto.com.br/372jgsf_669369 |
| `329be6o_669375` | SEMESTRAL | 6 meses | R$ 89,90 | https://pay.cakto.com.br/329be6o_669375 |

## 🧪 Testes

### Testar com ngrok (desenvolvimento)

```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta local
ngrok http 3001

# Copiar URL HTTPS gerada (ex: https://abc123.ngrok-free.app)
# Configurar no Cakto: https://abc123.ngrok-free.app/api/webhooks/cakto
```

### Enviar evento de teste

No painel do Cakto:
1. Vá em **Apps > Webhooks**
2. Clique nos três pontinhos do webhook
3. Selecione **Enviar evento de teste**
4. Escolha o evento: `purchase_approved`
5. Envie

## 📝 Logs Esperados

```
🔔 Webhook Cakto recebido: 2024-01-26T12:00:00.000Z
📋 Dados do webhook parseados: { "data": {...}, "event": "purchase_approved" }
✅ Assinatura validada com sucesso (método: json_secret)
💳 Processando pagamento aprovado...
🔍 Buscando usuário com email: user@email.com
👤 Usuário encontrado: { id: "...", email: "user@email.com" }
✅ Plano identificado: MENSAL (product_id: ...)
✅ Perfil atualizado para premium
✅ Histórico de pagamento salvo
🔄 Gerando treinos para os próximos 30 dias...
✅ Treinos gerados com sucesso
✅ Webhook processado com sucesso
```

## ⚠️ Importante

- **Cada plano precisa de um produto separado no Cakto**
- **Os product_ids devem ser configurados corretamente no .env**
- **O webhook secret deve ser o mesmo no Cakto e no .env**
- **A URL do webhook deve ser HTTPS em produção**
- **Após configurar, fazer novo build do frontend**

## 🔒 Segurança

- Validação de assinatura HMAC SHA256 obrigatória
- Webhook secret nunca deve ser commitado
- Logs detalhados para debugging
- Tratamento de erros robusto

