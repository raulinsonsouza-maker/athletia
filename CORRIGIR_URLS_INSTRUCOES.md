# Como Corrigir URLs de GIFs - Instruções

## Opção 1: Usar o Script Automatizado (Recomendado)

1. **Tornar o script executável:**
```bash
chmod +x /opt/athletia/backend/scripts/corrigir-urls-gifs.sh
```

2. **Executar o script:**
```bash
cd /opt/athletia/backend
./scripts/corrigir-urls-gifs.sh
```

O script vai pedir email e senha do admin.

**Ou definir variáveis de ambiente:**
```bash
export ADMIN_EMAIL="seu-email@admin.com"
export ADMIN_PASSWORD="sua-senha"
./scripts/corrigir-urls-gifs.sh
```

## Opção 2: Fazer Login Manualmente e Obter Token

### Passo 1: Fazer Login

```bash
curl -X POST https://athletia.site/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"SEU_EMAIL_ADMIN","senha":"SUA_SENHA"}' \
  | python3 -m json.tool
```

**Resposta esperada:**
```json
{
  "message": "Login realizado com sucesso",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "..."
}
```

### Passo 2: Copiar o accessToken

Copie o valor de `accessToken` da resposta.

### Passo 3: Executar Correção

```bash
curl -X POST https://athletia.site/api/admin/gifs/corrigir-urls \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  | python3 -m json.tool
```

**Substitua `SEU_ACCESS_TOKEN_AQUI` pelo token obtido no passo 1.**

## Opção 3: Via Painel Admin (Se disponível)

1. Acesse o painel admin: `https://athletia.site/admin`
2. Faça login
3. Procure por uma opção de "Corrigir URLs de GIFs" ou similar
4. Execute a correção

## Verificar Resultado

Após executar a correção, você verá uma resposta como:

```json
{
  "message": "Correção de URLs concluída",
  "total": 150,
  "corrigidos": 25,
  "removidos": 10,
  "semMudanca": 115,
  "detalhes": [...]
}
```

## Troubleshooting

### Erro: "Token inválido"
- O token expirou (tokens expiram em 15 minutos)
- Faça login novamente e obtenha um novo token
- Use o script automatizado que faz login automaticamente

### Erro: "Acesso negado"
- O usuário não é admin
- Verifique se o email usado tem role 'ADMIN' no banco de dados

### Erro: "Não autenticado"
- O token não foi fornecido corretamente
- Certifique-se de incluir "Bearer " antes do token
- Exemplo: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Exemplo Completo (Uma Linha)

```bash
# Fazer login e executar correção em um comando:
TOKEN=$(curl -s -X POST https://athletia.site/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","senha":"senha123"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4) && \
curl -X POST https://athletia.site/api/admin/gifs/corrigir-urls \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool
```

**Substitua `admin@example.com` e `senha123` pelas suas credenciais reais.**

## Comando Rápido para Copiar e Colar

**Substitua EMAIL_ADMIN e SENHA_ADMIN pelas suas credenciais:**

```bash
TOKEN=$(curl -s -X POST https://athletia.site/api/auth/login -H "Content-Type: application/json" -d '{"email":"EMAIL_ADMIN","senha":"SENHA_ADMIN"}' | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4) && curl -X POST https://athletia.site/api/admin/gifs/corrigir-urls -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" | python3 -m json.tool
```

