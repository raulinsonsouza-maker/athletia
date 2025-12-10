# 🔧 Correção do Rate Limiting - Login

## ❌ Problema Identificado

O rate limiting estava muito restritivo:
- **Limite anterior:** 5 tentativas a cada 15 minutos
- **Problema:** Bloqueava usuários legítimos que digitavam senha errada algumas vezes

## ✅ Solução Implementada

### 1. Aumento do Limite de Login
- **Novo limite:** 15 tentativas a cada 15 minutos (aumentado de 5)
- **Mantém segurança:** Ainda protege contra brute force
- **Melhora UX:** Usuários legítimos não são bloqueados facilmente

### 2. Rate Limiter Separado para Redefinição de Senha
- **Limite:** 10 solicitações a cada 15 minutos
- **Motivo:** Redefinição de senha já tem rate limiting interno (3 por hora por e-mail)
- **Não interfere:** Com o login

## 📊 Configuração Atual

### Login/Register/Refresh Token
```javascript
windowMs: 15 minutos
max: 15 tentativas
skipSuccessfulRequests: true (logins bem-sucedidos não contam)
```

### Redefinição de Senha
```javascript
windowMs: 15 minutos
max: 10 solicitações
```

## 🔄 Como Aplicar a Correção

### No Servidor:

```bash
cd /opt/athletia/backend
git pull
npm install
npm run build
pm2 restart athletia-backend
```

## ⚠️ Importante

- O rate limiter usa **IP** como identificador
- Se vários usuários compartilham o mesmo IP (ex: escritório), podem ser afetados
- Logins bem-sucedidos **NÃO contam** para o limite
- Apenas tentativas **falhadas** contam

## 🧪 Testar

1. Tente fazer login com senha errada várias vezes
2. Deve permitir mais tentativas agora (até 15)
3. Após 15 tentativas falhadas, será bloqueado por 15 minutos

## 📝 Nota

Se ainda houver problemas após esta correção, pode ser necessário:
- Verificar se o `trust proxy` está configurado corretamente no NGINX
- Verificar logs do PM2 para ver se há outros erros
- Considerar aumentar ainda mais o limite se necessário

