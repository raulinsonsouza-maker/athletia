# 🧪 Guia de Testes - Integração Cakto

## 📋 Checklist Pré-Teste

Antes de começar, verifique:

- [ ] Variáveis de ambiente configuradas no `.env`
- [ ] Migration aplicada: `npx prisma migrate deploy`
- [ ] Prisma Client regenerado: `npx prisma generate`
- [ ] Backend compilado sem erros: `npm run build`
- [ ] Backend rodando: `pm2 status`
- [ ] Webhook configurado no painel do Cakto

## 🧪 1. Teste de Geração de URL de Checkout

### Via API (cURL)

```bash
# Teste 1: Gerar URL para plano MENSAL
curl -X POST http://localhost:3001/api/payment/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "plano": "MENSAL",
    "email": "teste@example.com"
  }'

# Teste 2: Gerar URL para plano TRIMESTRAL
curl -X POST http://localhost:3001/api/payment/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "plano": "TRIMESTRAL",
    "email": "teste@example.com"
  }'

# Teste 3: Gerar URL para plano SEMESTRAL
curl -X POST http://localhost:3001/api/payment/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "plano": "SEMESTRAL",
    "email": "teste@example.com"
  }'
```

### Resposta Esperada

```json
{
  "success": true,
  "checkoutUrl": "https://pay.cakto.com.br/jzdhue5_669308?email=teste@example.com",
  "plano": "MENSAL"
}
```

### ✅ Validações

- [ ] URL retornada é válida
- [ ] URL contém o product_id correto para o plano
- [ ] Email está presente na URL como query param
- [ ] Status code é 200

## 🧪 2. Teste do Fluxo Completo (Frontend)

### Passos

1. **Acesse a página de checkout:**
   ```
   https://athletia.site/checkout
   ```

2. **Selecione um plano** (MENSAL, TRIMESTRAL ou SEMESTRAL)

3. **Clique em "Continuar para Pagamento"**

4. **Verifique o redirecionamento:**
   - [ ] Você é redirecionado para `https://pay.cakto.com.br/...`
   - [ ] A URL contém o product_id correto
   - [ ] O email do usuário está na URL

5. **Complete o pagamento no Cakto** (use modo sandbox/teste se disponível)

6. **Após pagamento:**
   - [ ] Você é redirecionado de volta
   - [ ] O plano do usuário é ativado
   - [ ] Treinos são gerados automaticamente

## 🧪 3. Teste de Webhook

### 3.1. Teste com ngrok (Desenvolvimento)

```bash
# 1. Instalar ngrok (se não tiver)
# https://ngrok.com/download

# 2. Expor porta local
ngrok http 3001

# 3. Copiar URL HTTPS gerada (ex: https://abc123.ngrok-free.app)

# 4. Configurar no Cakto:
# URL: https://abc123.ngrok-free.app/api/webhooks/cakto
# Secret: 83d08ba9-14bd-459f-8fd9-0a816ba5a089
```

### 3.2. Enviar Evento de Teste do Cakto

1. Acesse o painel do Cakto
2. Vá em **Apps > Webhooks**
3. Clique nos três pontinhos do webhook
4. Selecione **Enviar evento de teste**
5. Escolha o evento: `purchase_approved`
6. Envie

### 3.3. Verificar Logs do Backend

```bash
# Ver logs em tempo real
pm2 logs athletia-backend --lines 50

# Ou se usar systemd
journalctl -u athletia-backend -f
```

### Logs Esperados

```
🔔 Webhook Cakto recebido: 2024-01-26T12:00:00.000Z
📋 Dados do webhook parseados: { ... }
✅ Assinatura validada com sucesso (método: header_hmac ou json_secret)
💳 Processando pagamento aprovado...
🔍 Buscando usuário com email: user@example.com
👤 Usuário encontrado: { id: "...", email: "user@example.com" }
✅ Plano identificado: MENSAL (product_id: jzdhue5_669308)
✅ Perfil atualizado para premium
✅ Histórico de pagamento salvo
🔄 Gerando treinos para os próximos 30 dias...
✅ Treinos gerados com sucesso
✅ Webhook processado com sucesso
```

### 3.4. Teste Manual do Webhook (cURL)

```bash
# Simular webhook de pagamento aprovado
curl -X POST http://localhost:3001/api/webhooks/cakto \
  -H "Content-Type: application/json" \
  -H "X-Cakto-Signature: <signature>" \
  -d '{
    "event": "purchase_approved",
    "data": {
      "id": "test_transaction_123",
      "amount": 19.90,
      "status": "approved",
      "product": {
        "id": "jzdhue5_669308"
      },
      "customer": {
        "email": "teste@example.com",
        "id": "customer_123"
      },
      "paymentMethod": "credit_card"
    },
    "secret": "83d08ba9-14bd-459f-8fd9-0a816ba5a089"
  }'
```

**Nota:** A assinatura HMAC precisa ser calculada corretamente. Use o script de teste abaixo.

## 🧪 4. Verificar Status da Assinatura

### Via API

```bash
# Verificar status (requer autenticação)
curl -X GET "http://localhost:3001/api/payment/status?email=teste@example.com" \
  -H "Authorization: Bearer <token>"
```

### Resposta Esperada

```json
{
  "success": true,
  "user": {
    "email": "teste@example.com",
    "plano": "MENSAL",
    "planoAtivo": true,
    "dataPagamento": "2024-01-26T12:00:00.000Z",
    "dataExpiracao": "2024-02-26T12:00:00.000Z",
    "isPremium": true
  }
}
```

## 🧪 5. Verificar Histórico de Pagamentos

```bash
curl -X GET "http://localhost:3001/api/payment/historico?email=teste@example.com" \
  -H "Authorization: Bearer <token>"
```

### Resposta Esperada

```json
{
  "success": true,
  "payments": [
    {
      "id": "...",
      "transactionId": "test_transaction_123",
      "amount": 19.90,
      "currency": "BRL",
      "status": "completed",
      "paymentMethod": "credit_card",
      "plano": "MENSAL",
      "eventType": "purchase_approved",
      "createdAt": "2024-01-26T12:00:00.000Z"
    }
  ]
}
```

## 🧪 6. Teste de Reembolso

### Simular webhook de reembolso

```bash
curl -X POST http://localhost:3001/api/webhooks/cakto \
  -H "Content-Type: application/json" \
  -d '{
    "event": "refund",
    "data": {
      "id": "test_transaction_123",
      "amount": 19.90,
      "customer": {
        "email": "teste@example.com"
      }
    },
    "secret": "83d08ba9-14bd-459f-8fd9-0a816ba5a089"
  }'
```

### ✅ Validações

- [ ] Plano do usuário é desativado (`planoAtivo: false`)
- [ ] Reembolso registrado no histórico
- [ ] Status do pagamento atualizado para `refunded`

## 🧪 7. Teste de Cancelamento

### Simular webhook de cancelamento

```bash
curl -X POST http://localhost:3001/api/webhooks/cakto \
  -H "Content-Type: application/json" \
  -d '{
    "event": "subscription_cancelled",
    "data": {
      "id": "test_transaction_123",
      "customer": {
        "email": "teste@example.com"
      }
    },
    "secret": "83d08ba9-14bd-459f-8fd9-0a816ba5a089"
  }'
```

### ✅ Validações

- [ ] Plano do usuário é desativado
- [ ] Cancelamento registrado no histórico
- [ ] Status do pagamento atualizado para `cancelled`

## 🔍 8. Verificações no Banco de Dados

### Conectar ao PostgreSQL

```bash
psql -U usuario -d athletia
```

### Queries Úteis

```sql
-- Verificar usuário com plano ativo
SELECT id, email, plano, "planoAtivo", "dataPagamento", "dataExpiracao"
FROM users
WHERE email = 'teste@example.com';

-- Verificar histórico de pagamentos
SELECT 
  ph.id,
  ph."transactionId",
  ph.amount,
  ph.status,
  ph.plano,
  ph."eventType",
  ph."createdAt",
  u.email
FROM payment_history ph
JOIN users u ON ph."userId" = u.id
WHERE u.email = 'teste@example.com'
ORDER BY ph."createdAt" DESC;

-- Verificar campos Cakto no usuário
SELECT 
  email,
  "caktoCustomerId",
  "caktoTransactionId",
  plano,
  "planoAtivo"
FROM users
WHERE email = 'teste@example.com';
```

## ✅ Checklist Final

Após todos os testes:

- [ ] URL de checkout gerada corretamente
- [ ] Redirecionamento para Cakto funciona
- [ ] Webhook recebido e processado
- [ ] Assinatura do webhook validada
- [ ] Plano do usuário ativado após pagamento
- [ ] Data de expiração calculada corretamente
- [ ] Histórico de pagamento salvo
- [ ] Treinos gerados automaticamente
- [ ] Reembolso processa corretamente
- [ ] Cancelamento processa corretamente
- [ ] Status da assinatura retorna dados corretos
- [ ] Histórico de pagamentos retorna dados corretos

## 🐛 Troubleshooting

### Webhook não está sendo recebido

1. Verifique se a URL está correta no painel do Cakto
2. Verifique se o servidor está acessível (use ngrok para desenvolvimento)
3. Verifique os logs do backend: `pm2 logs athletia-backend`
4. Verifique se o webhook está configurado para os eventos corretos

### Assinatura inválida

1. Verifique se `CAKTO_WEBHOOK_SECRET` está configurado corretamente
2. Verifique se o secret no Cakto é o mesmo do `.env`
3. Verifique se o body está sendo enviado como raw (não JSON parseado)

### Plano não é ativado

1. Verifique se o product_id está correto
2. Verifique se o email do usuário existe no banco
3. Verifique os logs para erros
4. Verifique se a migration foi aplicada

### Treinos não são gerados

1. Verifique se o usuário tem perfil criado
2. Verifique os logs para erros na geração de treinos
3. Verifique se a função `gerarTreinos30Dias` está funcionando

## 📞 Suporte

Se encontrar problemas, verifique:
- Logs do backend: `pm2 logs athletia-backend`
- Logs do Cakto no painel
- Logs do banco de dados
- Documentação: `backend/docs/CAKTO_INTEGRACAO.md`

