# 🏋️ AthletIA - Backend API

Backend API para o sistema AthletIA - Sistema Inteligente de Treinos Personalizados.

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **Express** - Framework web
- **Prisma** - ORM
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

## 🔧 Instalação

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente:
```bash
# Copiar arquivo de exemplo
cp env.example.txt .env

# Editar .env com suas configurações
```

**Arquivo `.env` - Configurações necessárias:**

Todas as variáveis de ambiente necessárias estão no arquivo `env.example.txt`. Copie esse arquivo para `.env` e configure:

```env
# Database - URL de conexão com PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/athletia?schema=public"

# JWT - Chaves secretas para autenticação (GERE CHAVES ALEATÓRIAS E SEGURAS!)
JWT_SECRET="seu-jwt-secret-super-seguro-aqui"
JWT_REFRESH_SECRET="seu-refresh-token-secret-aqui"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server - Configurações do servidor
PORT=3001
NODE_ENV=development

# CORS - URL do frontend (para permitir requisições)
FRONTEND_URL="http://localhost:5173"
```

**⚠️ IMPORTANTE:**
- **Nunca commite o arquivo `.env` no Git** - ele contém informações sensíveis
- **Gere chaves secretas únicas e seguras** para `JWT_SECRET` e `JWT_REFRESH_SECRET`
- Em produção, use variáveis de ambiente seguras e não armazene credenciais no código

3. Configurar banco de dados:
```bash
# Gerar Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate
```

4. Iniciar servidor:
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 📡 Endpoints

### Autenticação

- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/refresh` - Renovar access token

### Health Check

- `GET /health` - Verificar status da API

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação:

1. **Access Token**: Válido por 15 minutos (padrão)
2. **Refresh Token**: Válido por 7 dias (padrão)

### Uso

Incluir o token no header:
```
Authorization: Bearer <access_token>
```

## 📚 Estrutura

```
backend/
├── src/
│   ├── controllers/    # Lógica de negócio
│   ├── routes/         # Rotas da API
│   ├── middleware/     # Middlewares
│   └── index.ts        # Entry point
├── prisma/
│   └── schema.prisma   # Schema do banco
└── dist/               # Build (gerado)
```

## 🗄️ Banco de Dados

O Prisma Studio pode ser aberto com:
```bash
npm run prisma:studio
```

## 🔒 Segurança

- Senhas são hasheadas com bcrypt
- JWT com expiração
- CORS configurado
- Helmet para headers de segurança
- Validação de inputs com express-validator

