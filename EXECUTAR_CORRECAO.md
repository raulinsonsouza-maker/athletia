# 🚀 Executar Correção de URLs - Comando Rápido

## ⚡ Comando Único (Copie e Cole)

**Substitua `SEU_EMAIL_ADMIN` e `SUA_SENHA` pelas suas credenciais reais:**

```bash
TOKEN=$(curl -s -X POST https://athletia.site/api/auth/login -H "Content-Type: application/json" -d '{"email":"SEU_EMAIL_ADMIN","senha":"SUA_SENHA"}' | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4) && curl -X POST https://athletia.site/api/admin/gifs/corrigir-urls -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" | python3 -m json.tool
```

## 📝 Passo a Passo (Se Preferir)

### 1. Fazer Login

```bash
curl -X POST https://athletia.site/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"SEU_EMAIL_ADMIN","senha":"SUA_SENHA"}'
```

**Copie o `accessToken` da resposta.**

### 2. Executar Correção

```bash
curl -X POST https://athletia.site/api/admin/gifs/corrigir-urls \
  -H "Authorization: Bearer COLE_O_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

## ✅ Resultado Esperado

Você verá algo como:

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

## 🔍 Verificar Após Correção

```bash
# Verificar status dos GIFs
TOKEN=$(curl -s -X POST https://athletia.site/api/auth/login -H "Content-Type: application/json" -d '{"email":"SEU_EMAIL","senha":"SUA_SENHA"}' | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4) && curl https://athletia.site/api/admin/gifs/status -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

## ⚠️ Nota Importante

- O token expira em 15 minutos
- Se der erro "Token inválido", faça login novamente
- Certifique-se de que o usuário tem role 'ADMIN' no banco

