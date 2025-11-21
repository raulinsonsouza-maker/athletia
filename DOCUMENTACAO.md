# 📚 Documentação Completa - AthletIA

> **Documentação Centralizada** - Tudo que você precisa saber sobre o sistema em um único lugar

**Última Atualização:** 2024-12-20  
**Versão:** 2.0.0

---

## 📋 Índice Rápido

1. [Visão Geral](#visão-geral)
2. [Instalação e Configuração](#instalação)
3. [Arquitetura do Sistema](#arquitetura)
4. [Estrutura do Projeto](#estrutura)
5. [Funcionalidades](#funcionalidades)
6. [API e Endpoints](#api)
7. [Banco de Dados](#banco-de-dados)
8. [Desenvolvimento](#desenvolvimento)
9. [Deploy](#deploy)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

### O que é o AthletIA?

Sistema inteligente de treinos personalizados que utiliza IA para gerar rotinas de exercícios baseadas em:
- Dados pessoais do usuário (peso, altura, objetivos, lesões)
- Histórico de treinos e evolução
- Base de conhecimento especializada (literatura científica)
- Progressão automática baseada em RPE (Rate of Perceived Exertion)

### Funcionalidades Principais

✅ **Autenticação e Segurança**
- Login/Registro com JWT
- Refresh tokens automáticos
- Proteção de rotas por plano ativo

✅ **Onboarding Completo**
- Questionário em 10 passos
- Coleta de dados pessoais e objetivos
- Geração automática de treinos após ativação

✅ **Geração de Treinos**
- Treinos personalizados por IA
- 6 tipos de divisão (Full Body, A-B, A-B-C, etc.)
- Progressão automática de cargas
- Sistema de alternativas de exercícios

✅ **Interface do Usuário**
- Dashboard redesenhado com foco no treino do dia
- Visualização semanal inteligente
- Histórico e estatísticas
- Evolução de peso com gráficos

✅ **Sistema de IA**
- Feedback contextual após treinos
- Sugestões de reordenação automática
- Detecção de risco de abandono
- Relatórios humanos (não só números)

✅ **Gamificação**
- Sistema de conquistas
- Níveis de progresso
- Sequências e recordes

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **npm** ou **yarn**
- **Git**

### Instalação Passo a Passo

#### 1. Clonar Repositório

```bash
git clone <url-do-repositorio>
cd athletia
```

#### 2. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
# Windows:
copy env.example.txt .env
# Linux/Mac:
cp env.example.txt .env
```

#### 3. Configurar Variáveis de Ambiente

Edite o arquivo `backend/.env`:

```env
# Database (OBRIGATÓRIO)
DATABASE_URL="postgresql://usuario:senha@localhost:5432/athletia?schema=public"

# JWT (OBRIGATÓRIO - Gere chaves aleatórias seguras!)
JWT_SECRET="sua-chave-secreta-super-segura-aqui-minimo-32-caracteres"
JWT_REFRESH_SECRET="sua-chave-refresh-token-secreta-aqui-minimo-32-caracteres"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:5173"
```

**⚠️ IMPORTANTE:**
- Gere chaves JWT aleatórias e seguras (mínimo 32 caracteres)
- Nunca use valores padrão em produção
- O arquivo `.env` não deve ser commitado no Git

#### 4. Configurar Banco de Dados

```bash
# Criar banco de dados
createdb athletia

# Gerar Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate

# Popular banco com exercícios (ESSENCIAL!)
npm run prisma:seed
```

#### 5. Iniciar Backend

```bash
npm run dev
# Servidor rodando em http://localhost:3001
```

#### 6. Configurar Frontend

```bash
# Em outro terminal
cd ../frontend

# Instalar dependências
npm install

# (Opcional) Criar .env.local para configurar URL da API
echo "VITE_API_URL=http://localhost:3001/api" > .env.local
```

#### 7. Iniciar Frontend

```bash
npm run dev
# Frontend rodando em http://localhost:5173
```

### Verificação

1. **Backend:** Acesse `http://localhost:3001/health`
   - Deve retornar: `{"status":"ok","message":"AthletIA API está funcionando!"}`

2. **Frontend:** Acesse `http://localhost:5173`
   - Deve abrir a tela de login

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (estilização)
- React Router (roteamento)
- Chart.js (gráficos)
- Context API (estado global)

**Backend:**
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT + bcrypt (autenticação)
- Express Validator (validação)

### Estrutura de Diretórios

```
athletia/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Controladores das rotas
│   │   ├── services/        # Lógica de negócio
│   │   ├── routes/          # Definição de rotas
│   │   ├── middleware/      # Middlewares (auth, validation)
│   │   ├── lib/             # Configurações (Prisma, etc)
│   │   └── types/           # Tipos TypeScript
│   ├── prisma/
│   │   ├── schema.prisma    # Schema do banco
│   │   └── migrations/      # Migrations
│   ├── scripts/             # Scripts utilitários
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # Páginas do sistema
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── services/        # Serviços de API
│   │   ├── contexts/        # Context API
│   │   ├── hooks/           # Custom hooks
│   │   ├── types/           # Tipos TypeScript
│   │   └── utils/           # Utilitários
│   └── package.json
├── docs/                    # Documentação adicional
└── README.md                # Ponto de entrada
```

---

## 📱 Funcionalidades

### Páginas e Rotas

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | Landing | Página inicial |
| `/login` | Login | Autenticação |
| `/register` | Registro | Criação de conta |
| `/cadastro` | Onboarding | Questionário completo (10 passos) |
| `/checkout` | Checkout | Seleção de plano e pagamento |
| `/dashboard` | Dashboard | Home redesenhada com treino do dia |
| `/treino` | Treino do Dia | Execução do treino |
| `/minha-semana` | Minha Semana | Visualização semanal completa |
| `/historico` | Histórico | Lista de treinos concluídos |
| `/evolucao` | Evolução | Peso, medidas e força |
| `/estatisticas` | Estatísticas | Análise de progresso |
| `/conquistas` | Conquistas | Gamificação e níveis |
| `/meus-treinos` | Meus Treinos | Treinos personalizados |
| `/treinos-recorrentes` | Criar Treino | Gerenciar treinos A-G |
| `/perfil` | Perfil | Configurações do usuário |
| `/admin` | Admin | Painel administrativo |

### Fluxo Principal

1. **Registro/Login** → Autenticação
2. **Onboarding** → Coleta de dados (10 passos)
3. **Checkout** → Seleção de plano
4. **Dashboard** → Visualização do treino do dia
5. **Treino** → Execução dos exercícios
6. **Histórico** → Acompanhamento de progresso

---

## 🔌 API e Endpoints

### Base URL

```
Desenvolvimento: http://localhost:3001/api
Produção: http://191.252.109.144:3001/api
```

### Autenticação

Todas as rotas protegidas requerem header:
```
Authorization: Bearer <access_token>
```

### Endpoints Principais

#### Autenticação (`/api/auth`)

- `POST /register` - Criar conta
- `POST /login` - Fazer login
- `POST /refresh` - Renovar token
- `GET /me` - Obter usuário atual

#### Perfil (`/api/perfil`)

- `GET /` - Obter perfil
- `PUT /` - Atualizar perfil
- `POST /atualizacao-periodica` - Atualização periódica (30 dias)

#### Treinos (`/api/treino`)

- `GET /dia` - Buscar treino do dia
- `POST /gerar` - Gerar treino do dia
- `GET /semana` - Buscar treinos semanais
- `GET /historico` - Buscar histórico (limite: 30)
- `GET /estatisticas` - Estatísticas de progresso
- `POST /exercicio/:id/concluir` - Concluir exercício
- `GET /exercicio/:id/alternativas` - Buscar alternativas

#### Dashboard (`/api/dashboard`)

- `GET /resumo` - Resumo completo do dashboard
  - Retorna: treino do dia, progresso semanal, evolução, conquistas, etc.

#### Peso (`/api/peso`)

- `GET /historico` - Histórico de pesos
- `POST /` - Registrar novo peso

#### Admin (`/api/admin`)

- `GET /usuarios` - Listar usuários
- `GET /estatisticas` - Estatísticas gerais
- `GET /exercicios` - Listar exercícios
- `POST /exercicios` - Criar exercício
- `PUT /exercicios/:id` - Atualizar exercício

---

## 🗄️ Banco de Dados

### Schema Principal (Prisma)

**User** - Usuários do sistema
- id, email, senha, nome, role (USER/ADMIN)
- planoAtivo, dataExpiracaoPlano

**Perfil** - Dados do perfil do usuário
- userId, idade, sexo, altura, pesoAtual
- objetivo, experiencia, frequenciaSemanal
- lesoes, equipamentosDisponiveis

**Treino** - Treinos gerados
- id, userId, data, tipo, nome
- concluido, tempoEstimado, letraTreino
- criadoPor (IA/USUARIO)

**ExercicioTreino** - Exercícios de um treino
- id, treinoId, exercicioId
- ordem, series, repeticoes, carga
- rpe, descanso, concluido

**Exercicio** - Catálogo de exercícios
- id, nome, grupoMuscularPrincipal
- descricao, execucaoTecnica
- gifUrl, imagemUrl
- equipamentoNecessario

**HistoricoPeso** - Histórico de pesos
- id, userId, peso, data

### Relacionamentos

- User → Perfil (1:1)
- User → Treino (1:N)
- Treino → ExercicioTreino (1:N)
- ExercicioTreino → Exercicio (N:1)
- User → HistoricoPeso (1:N)

---

## 💻 Desenvolvimento

### Scripts Disponíveis

**Backend:**
```bash
npm run dev          # Desenvolvimento (hot reload)
npm run build        # Compilar TypeScript
npm start            # Produção
npm run prisma:generate    # Gerar Prisma Client
npm run prisma:migrate     # Executar migrations
npm run prisma:seed        # Popular banco
npm run prisma:studio      # Abrir Prisma Studio
```

**Frontend:**
```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
```

### Convenções de Código

**Nomenclatura:**
- Componentes: PascalCase (`TreinoCard.tsx`)
- Funções: camelCase (`buscarTreinoDoDia`)
- Constantes: UPPER_SNAKE_CASE (`JWT_SECRET`)
- Arquivos: kebab-case ou PascalCase

**Estrutura de Componentes:**
```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Componente principal
// 4. Export default
```

**Estrutura de Serviços:**
```typescript
// 1. Imports
// 2. Funções auxiliares
// 3. Funções principais (export)
```

### Design System

**Cores:**
- Primary: `#F9A620` (Amarelo ouro)
- Dark: `#070600` (Preto)
- Light: `#F7F7FF` (Branco)
- Success: `#10B981` (Verde)
- Error: `#EF4444` (Vermelho)
- Warning: `#F59E0B` (Laranja)

**Tipografia:**
- Display: Poppins (títulos)
- Sans: Inter (corpo)

**Componentes Base:**
- `btn-primary` - Botão principal
- `btn-secondary` - Botão secundário
- `card` - Card container
- `input-field` - Campo de input
- `label-field` - Label de campo

---

## 🚀 Deploy

### Variáveis de Ambiente (Produção)

**Backend (.env):**
```env
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
FRONTEND_URL="https://seu-dominio.com"
PORT=3001
```

**Frontend (.env.production):**
```env
VITE_API_URL=https://api.seu-dominio.com/api
```

### Build para Produção

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Arquivos em frontend/dist/
```

### PM2 (Gerenciador de Processos)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar backend
cd backend
pm2 start dist/index.js --name athletia-backend

# Iniciar frontend (se servido por Node)
cd frontend
pm2 start server.js --name athletia-frontend

# Salvar configuração
pm2 save
pm2 startup
```

---

## 🔧 Troubleshooting

### Erros Comuns

**Erro 502 Bad Gateway**
- Verifique se backend está rodando
- Confirme `VITE_API_URL` no frontend
- Teste endpoint `/health` do backend

**Erro de Conexão com Banco**
- Verifique se PostgreSQL está rodando
- Confirme `DATABASE_URL` no `.env`
- Teste conexão: `psql -U usuario -d athletia`

**Erro de Autenticação**
- Verifique `JWT_SECRET` e `JWT_REFRESH_SECRET`
- Confirme que tokens não expiraram
- Limpe localStorage e faça login novamente

**Erro de CORS**
- Verifique `FRONTEND_URL` no backend
- Confirme que URL do frontend corresponde

**Erro de Prisma**
- Execute `npm run prisma:generate`
- Verifique se banco existe
- Execute `npm run prisma:migrate`

**Treinos não aparecem**
- Execute `npm run prisma:seed` (popular exercícios)
- Verifique se usuário tem plano ativo
- Confirme que perfil está completo

---

## 📖 Recursos Adicionais

### Documentação por Tópico

- **Instalação Detalhada:** `INSTALACAO.md`
- **Configuração de Ambiente:** `CONFIGURAR_ENV.md`
- **Especificações Técnicas:** `docs/ESPECIFICACAO_TECNICA.md`
- **Decisões Técnicas:** `docs/DECISOES_TECNICAS.md`
- **Base de Conhecimento:** `BASE_DE_CONHECIMENTO.md`
- **Changelog:** `CHANGELOG.md`

### Ferramentas Úteis

**Prisma Studio:**
```bash
cd backend
npm run prisma:studio
# Acesse http://localhost:5555
```

**Health Check:**
```bash
curl http://localhost:3001/health
```

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte esta documentação
2. Verifique o `CHANGELOG.md` para mudanças recentes
3. Revise os logs do backend/frontend
4. Consulte `Troubleshooting` acima

---

**Última Atualização:** 2024-12-20  
**Mantido por:** Equipe AthletIA

