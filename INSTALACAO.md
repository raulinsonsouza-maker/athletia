# 🚀 GUIA DE INSTALAÇÃO - AthletIA

Guia completo para configurar o ambiente de desenvolvimento do AthletIA.

## 📋 Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **npm** ou **yarn**
- **Git**

## 🔧 Instalação

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd Academia_V1
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
# Windows:
copy env.example.txt .env
# Linux/Mac:
cp env.example.txt .env

# Editar .env com suas configurações:
# - DATABASE_URL: URL do seu banco PostgreSQL
# - JWT_SECRET: Chave secreta para JWT (gere uma aleatória)
# - JWT_REFRESH_SECRET: Chave secreta para refresh token
```

**Exemplo de .env:**
```env
DATABASE_URL="postgresql://postgres:senha@localhost:5432/athletia?schema=public"
JWT_SECRET="sua-chave-secreta-super-segura-aqui"
JWT_REFRESH_SECRET="sua-chave-refresh-token-secreta-aqui"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### 3. Configurar Banco de Dados

```bash
# Criar banco de dados no PostgreSQL
createdb athletia

# Gerar Prisma Client
npm run prisma:generate

# Executar migrations (cria as tabelas)
npm run prisma:migrate

# IMPORTANTE: Popular banco com exercícios básicos
npm run prisma:seed
```

**⚠️ Atenção:** O seed é essencial! Sem ele, não haverá exercícios disponíveis para gerar treinos.

### 4. Iniciar Backend

```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# O servidor estará rodando em http://localhost:3001
```

### 5. Configurar Frontend

```bash
# Em outro terminal, voltar para raiz do projeto
cd ../frontend

# Instalar dependências
npm install

# (Opcional) Criar .env.local para configurar URL da API
# VITE_API_URL=http://localhost:3001/api
```

### 6. Iniciar Frontend

```bash
# Modo desenvolvimento
npm run dev

# O frontend estará rodando em http://localhost:5173
```

## ✅ Verificação

1. **Backend:** Acesse http://localhost:3001/health
   - Deve retornar: `{"status":"ok","message":"AthletIA API está funcionando!"}`

2. **Frontend:** Acesse http://localhost:5173
   - Deve abrir a tela de login

3. **Testar Autenticação:**
   - Criar uma conta em `/register`
   - Fazer login em `/login`
   - Acessar dashboard em `/dashboard`

## 🗄️ Prisma Studio

Para visualizar e gerenciar o banco de dados:

```bash
cd backend
npm run prisma:studio
```

Acesse http://localhost:5555

## 📝 Scripts Úteis

### Backend
- `npm run dev` - Inicia servidor em modo desenvolvimento
- `npm run build` - Compila TypeScript
- `npm start` - Inicia servidor em produção
- `npm run prisma:generate` - Gera Prisma Client
- `npm run prisma:migrate` - Executa migrations
- `npm run prisma:seed` - Popula banco com exercícios básicos (14 exercícios)
- `npm run prisma:studio` - Abre Prisma Studio
- `npm run prisma:reset` - Reseta banco e executa migrations + seed

### Frontend
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção

## 🐛 Troubleshooting

### Erro de conexão com banco de dados
- Verifique se PostgreSQL está rodando
- Confirme a URL no arquivo `.env`
- Verifique usuário e senha do PostgreSQL

### Erro de porta já em uso
- Backend: Altere `PORT` no `.env`
- Frontend: Altere `port` no `vite.config.ts`

### Erro de módulos não encontrados
- Delete `node_modules` e `package-lock.json`
- Execute `npm install` novamente

### Erro de Prisma
- Execute `npm run prisma:generate`
- Verifique se o banco de dados existe
- Execute `npm run prisma:migrate` novamente

## 📚 Próximos Passos

Após a instalação:
1. ✅ Sistema de autenticação funcionando
2. ✅ Questionário de onboarding implementado
3. ✅ Sistema de geração de treinos funcionando
4. ⏭️ Integrar IA para refinamento

## 🧪 Testar o Sistema

Para um guia completo de testes, consulte: **[GUIA_DE_TESTE.md](./GUIA_DE_TESTE.md)**

---

**Última Atualização:** 2024-12-19

