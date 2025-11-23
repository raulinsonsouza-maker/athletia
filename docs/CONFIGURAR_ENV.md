# 🔧 Configuração de Variáveis de Ambiente

## ⚠️ IMPORTANTE: Erro 502 Bad Gateway

O erro 502 indica que o frontend está tentando acessar um backend que não está disponível. Você precisa configurar as variáveis de ambiente corretamente.

## 📝 Passos para Configurar

### 1. Frontend - Criar arquivo `.env` ou `.env.local`

**Localização:** `frontend/.env` ou `frontend/.env.local`

**Conteúdo:**

```env
# Para desenvolvimento local (backend na mesma máquina):
VITE_API_URL=http://localhost:3001/api

# Para produção (backend em servidor remoto):
# VITE_API_URL=http://191.252.109.144:3001/api
# ou se usar HTTPS:
# VITE_API_URL=https://191.252.109.144/api
```

**⚠️ IMPORTANTE:**
- Se o backend está rodando na mesma máquina: use `http://localhost:3001/api`
- Se o backend está em servidor remoto: use `http://191.252.109.144:3001/api` (ajuste a porta se necessário)
- Após criar/alterar o `.env`, **reinicie o servidor de desenvolvimento** (`npm run dev`)

### 2. Backend - Verificar/Criar arquivo `.env`

**Localização:** `backend/.env`

**Conteúdo base (copie de `env.example.txt`):**

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/athletia?schema=public"

# JWT
JWT_SECRET="seu-jwt-secret-super-seguro-aqui"
JWT_REFRESH_SECRET="seu-refresh-token-secret-aqui"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:5173"
```

**Para produção, ajuste:**
```env
FRONTEND_URL="http://191.252.109.144:5173"
# ou
FRONTEND_URL="https://seu-dominio.com"
```

## 🚀 Como Criar os Arquivos

### Windows (PowerShell):
```powershell
# Frontend
cd frontend
Copy-Item .env.example .env
# Edite o arquivo .env com suas configurações

# Backend
cd ..\backend
Copy-Item env.example.txt .env
# Edite o arquivo .env com suas configurações
```

### Linux/Mac:
```bash
# Frontend
cd frontend
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Backend
cd ../backend
cp env.example.txt .env
# Edite o arquivo .env com suas configurações
```

## ✅ Verificação

1. **Verifique se o backend está rodando:**
   - Acesse: `http://localhost:3001/health` (ou a URL do seu servidor)
   - Deve retornar: `{"status":"ok","message":"AthletIA API está funcionando!"}`

2. **Verifique a URL no frontend:**
   - Abra `frontend/.env`
   - Confirme que `VITE_API_URL` aponta para o backend correto
   - **Reinicie o servidor frontend** após alterar

3. **Teste a conexão:**
   - Tente fazer login
   - Se ainda der erro 502, verifique:
     - Backend está rodando?
     - Porta está correta?
     - Firewall não está bloqueando?
     - URL no `.env` está correta?

## 🔍 Troubleshooting

### Erro 502 Bad Gateway

**Causas comuns:**
1. Backend não está rodando
2. URL incorreta no `.env` do frontend
3. Porta incorreta ou bloqueada por firewall
4. Backend crashou ao iniciar

**Soluções:**
1. Verifique se o backend está rodando: `cd backend && npm run dev`
2. Verifique os logs do backend para erros
3. Confirme a URL no `frontend/.env`
4. Teste acessar a URL do backend diretamente no navegador

### Erro de CORS

Se aparecer erro de CORS, verifique:
- `FRONTEND_URL` no `backend/.env` está correto?
- URL do frontend corresponde à URL configurada?

## 📚 Referências

- Arquivo de exemplo frontend: `frontend/.env.example`
- Arquivo de exemplo backend: `backend/env.example.txt`
- Documentação completa: `INSTALACAO.md`

