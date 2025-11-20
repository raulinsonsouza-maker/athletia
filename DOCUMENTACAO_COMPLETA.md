# 🧠 DOCUMENTAÇÃO COMPLETA - AthletIA

> **Documento Único e Centralizado** - Toda a informação sobre o sistema, funcionalidades, contexto e histórico de alterações

**Última Atualização:** 2024-12-20  
**Versão:** 3.0.0  
**Status:** Sistema Funcional

---

## 📋 ÍNDICE

1. [Visão Geral do Sistema](#visão-geral)
2. [Arquitetura e Stack Tecnológico](#arquitetura)
3. [Design System e Paleta de Cores](#design-system)
4. [Estrutura de Páginas e Rotas](#estrutura-paginas)
5. [Funcionalidades por Página](#funcionalidades)
6. [Regras de Negócio e Lógica](#regras-negocio)
7. [Base de Conhecimento](#base-conhecimento)
8. [Sistema de Planos e Pagamento](#sistema-planos-pagamento)
9. [Sistema de Geração de Treinos](#geracao-treinos)
10. [Sistema de Atualização Periódica](#atualizacao-periodica)
11. [Histórico de Alterações](#historico-alteracoes)

---

## 🎯 VISÃO GERAL DO SISTEMA

### Nome
**AthletIA** - Sistema Inteligente de Treinos Personalizados

### Objetivo
Gerar treinos personalizados, adaptativos e cientificamente fundamentados baseados em:
- Dados pessoais do usuário (peso, altura, objetivos, lesões)
- Histórico de treinos e evolução
- Base de conhecimento especializada (literatura científica)
- Progressão automática baseada em RPE

### Funcionalidades Principais
- ✅ Autenticação (Login/Registro)
- ✅ Onboarding completo (10 passos)
- ✅ Página de resultados e criação de conta
- ✅ Página de checkout com planos e timer de oferta
- ✅ Sistema de planos (Mensal, Trimestral, Semestral)
- ✅ Geração automática de treinos após pagamento (30 dias)
- ✅ Interface de treino do dia com exercícios
- ✅ Sistema de conclusão de exercícios com RPE
- ✅ Histórico de treinos
- ✅ Estatísticas e progresso
- ✅ Evolução de peso com gráficos
- ✅ Perfil e configurações
- ✅ Atualização periódica (a cada 30 dias)
- ✅ Painel administrativo completo (estatísticas, usuários, exercícios)
- ✅ Sistema de notificações (Toast)
- ✅ Proteção de rotas baseada em plano ativo

---

## 🏗️ ARQUITETURA E STACK TECNOLÓGICO

### Stack Completo
- **Frontend:**
  - React 18 + TypeScript
  - Vite (build tool)
  - Tailwind CSS (estilização)
  - React Router (roteamento)
  - Chart.js + react-chartjs-2 (gráficos)
  - Context API (gerenciamento de estado)

- **Backend:**
  - Node.js + Express
  - TypeScript
  - Prisma ORM
  - PostgreSQL (banco de dados)
  - JWT + bcrypt (autenticação)
  - Express Validator (validação)

- **Autenticação:**
  - JWT (access tokens)
  - Refresh tokens
  - Middleware de autenticação
  - Role-based access (USER/ADMIN)

### Estrutura de Diretórios
```
Academia_V1/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Controladores das rotas
│   │   ├── services/        # Lógica de negócio
│   │   ├── routes/          # Definição de rotas
│   │   ├── middleware/      # Middlewares (auth, validation)
│   │   └── utils/           # Utilitários
│   ├── prisma/
│   │   ├── schema.prisma   # Schema do banco
│   │   └── migrations/      # Migrations
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/          # Páginas do sistema
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── contexts/        # Context API
│   │   ├── services/        # Serviços (API, notificações)
│   │   └── App.tsx          # Roteamento principal
│   └── package.json
└── DOCUMENTACAO_COMPLETA.md  # Este arquivo
```

---

## 🎨 DESIGN SYSTEM E PALETA DE CORES

### Paleta de Cores (Dark Theme)
- **Primary (Orange):** `#F9A620` - Botões principais, destaques
- **Background (Pitch Black):** `#070600` - Fundo principal
- **Light (Ghost White):** `#F7F7FF` - Texto principal
- **Muted (Dim Grey):** `#63625F` - Texto secundário, bordas

### Classes CSS Principais
- `.card` - Card padrão com fundo escuro
- `.card-hover` - Card com efeito hover
- `.btn-primary` - Botão principal (laranja)
- `.btn-secondary` - Botão secundário (escuro)
- `.input-field` - Campo de input
- `.label-field` - Label de campo
- `.text-light` - Texto claro
- `.text-light-muted` - Texto secundário
- `.text-primary` - Texto laranja
- `.spinner` - Loading spinner

### Fontes
- **Display:** Poppins (títulos)
- **Body:** Inter (texto)

---

## 📄 ESTRUTURA DE PÁGINAS E ROTAS

### Rotas Públicas
- `/` - Landing page e onboarding completo
- `/login` - Login de usuário
- `/register` - Registro de novo usuário
- `/admin/login` - Login administrativo
- `/cadastro` - Página de resultados e criação de conta (após onboarding)
- `/checkout` - Página de vendas e checkout com planos e preços

### Rotas Protegidas (Requerem autenticação)
- `/dashboard` - Dashboard principal (requer plano ativo)
- `/treino` - Treino do dia (requer plano ativo)
- `/historico` - Histórico de treinos (requer plano ativo)
- `/estatisticas` - Estatísticas e progresso (requer plano ativo)
- `/evolucao-peso` - Evolução de peso com gráficos (requer plano ativo)
- `/perfil` - Perfil e configurações (acesso permitido sem plano)
- `/checkout` - Página de checkout (acesso permitido sem plano)
- `/admin` - Painel administrativo (requer role ADMIN)

### Componentes Reutilizáveis
- `Navbar` - Barra de navegação superior
- `ProtectedRoute` - Rota protegida
- `Loading` - Spinner de carregamento
- `Toast` - Notificações

---

## ⚙️ FUNCIONALIDADES POR PÁGINA

### 1. Login (`/login`)
**Arquivo:** `frontend/src/pages/Login.tsx`

**Funcionalidades:**
- Formulário de login (email + senha)
- Validação de campos
- Integração com AuthContext
- Redirecionamento para `/dashboard` após login
- Link para registro
- Tratamento de erros

**Botões:**
- "Entrar" - Submete formulário
- Link "Cadastre-se" - Navega para `/register`

---

### 2. Registro (`/register`)
**Arquivo:** `frontend/src/pages/Register.tsx`

**Funcionalidades:**
- Formulário de registro (nome opcional, email, senha, confirmar senha)
- Validação de senhas (mínimo 6 caracteres, devem coincidir)
- Integração com AuthContext
- Redirecionamento para `/onboarding` após registro
- Link para login

**Botões:**
- "Criar Conta" - Submete formulário
- Link "Faça login" - Navega para `/login`

---

### 3. Landing/Onboarding (`/`)
**Arquivo:** `frontend/src/pages/Landing.tsx`

**Funcionalidades:**
- **Página Inicial (Hero Section):**
  - Headline impactante: "CONSTRUA SEU CORPO PERFEITO"
  - Subtítulo: "Sistema Inteligente de Treinos Personalizados"
  - Seção "O que é o AthletIA?" com 4 benefícios principais e ícones SVG
  - Seção "O que acontece quando você clica em 'Começar Agora'?" explicando processo em 4 passos
  - Design profissional sem emojis, apenas ícones SVG
  - Footer com links clicáveis (Termos, Privacidade, Cookies)

- **Questionário de Onboarding (10 passos):**
  0. Tela inicial (Hero Section)
  1. Gênero (Masculino/Feminino)
  2. Idade
  3. Data de Nascimento
  4. Altura e Peso (com cálculo automático de IMC)
  5. Consumo de Água Diário (apenas em litros, sem onças)
  6. Objetivo Principal (com imagens específicas por gênero)
  7. Nível de Condicionamento Físico (com ícones SVG profissionais)
  8. Frequência Semanal (com ícones e descrições)
  9. Tempo de Treino (com descrições detalhadas)
  10. Local de Treino (Casa, Academia, Misto)

- Validação de cada passo
- Navegação automática para escolhas únicas (sem botão continuar)
- Navegação manual para múltiplas escolhas
- **Dados salvos em localStorage durante o processo**
- **Ao finalizar, redireciona para `/cadastro` (página de resultados)**
- **NÃO gera treinos automaticamente** - apenas após pagamento

**Design:**
- Todos os emojis foram removidos e substituídos por ícones SVG profissionais
- Layout consistente com design system dark
- Cards com bordas e efeitos hover
- Checkmarks SVG quando selecionado
- Ícones em containers destacados

**Botões:**
- "Anterior" - Volta para passo anterior
- "Continuar" - Avança para próximo passo (apenas em múltiplas escolhas)
- Seleção automática avança em escolhas únicas
- "Finalizar" - No último passo, redireciona para `/cadastro` (página de resultados)

---

### 4. Cadastro/Resultados (`/cadastro`)
**Arquivo:** `frontend/src/pages/Cadastro.tsx`

**Funcionalidades:**
- **Página de Resultados (após onboarding):**
  - Exibe transformação esperada em 6 meses (imagens antes/depois)
  - Comparação de métricas (gordura corporal, idade de condicionamento, músculos)
  - **Sem informações de preços ou planos** nesta etapa
  - Foco em mostrar benefícios e resultados esperados

- **Formulário de Criação de Conta:**
  - Nome completo (obrigatório)
  - Telefone (com máscara)
  - Email (obrigatório)
  - Senha (mínimo 6 caracteres)
  - Confirmar senha
  - Validação em tempo real

- **Fluxo:**
  1. Usuário completa onboarding (dados salvos em localStorage)
  2. Redirecionado para `/cadastro` (página de resultados)
  3. Visualiza resultados esperados
  4. Preenche formulário de criação de conta
  5. Ao criar conta, dados do onboarding são salvos no banco
  6. Usuário é autenticado automaticamente
  7. Redirecionado para `/checkout` (página de vendas)

**Cálculos de Transformação:**
- **Gordura Corporal:** Cálculo realista baseado em múltiplos fatores
- **Idade de Condicionamento:** Considera IMC, experiência e frequência
- **Músculos:** Progressão baseada em objetivo e nível atual
- Valores futuros calculados para 6 meses com limites realistas

**Botões:**
- "Criar Conta e Continuar" - Cria conta e redireciona para checkout
- "← Voltar" - Volta para etapa anterior

**Endpoints:**
- `POST /api/auth/cadastro-pre-pagamento` - Cria usuário e perfil (sem gerar treinos)
  - Cria usuário com `planoAtivo: false`
  - Cria perfil com dados do onboarding
  - Retorna tokens de autenticação
  - **NÃO gera treinos** (apenas após pagamento)

---

### 5. Checkout (`/checkout`)
**Arquivo:** `frontend/src/pages/Checkout.tsx`

**Funcionalidades:**
- **Página de Vendas e Checkout:**
  - Timer de oferta (15 minutos) com contagem regressiva
  - Elementos de conversão:
    - Garantia de 7 dias
    - Estatísticas de sucesso
    - Depoimentos de clientes
    - Benefícios destacados
    - Urgência e escassez
  - Seleção de planos:
    - **Mensal:** R$ 19,90/mês
    - **Trimestral:** R$ 39,90 a cada 3 meses (33% desconto)
    - **Semestral:** R$ 79,90 a cada 6 meses (33% desconto)
  - Formulário de pagamento (simulado):
    - Nome no cartão
    - Número do cartão (com máscara)
    - Validade (com máscara)
    - CVV (com máscara)
    - CPF (com máscara)

- **Fluxo:**
  1. Usuário visualiza planos e preços
  2. Seleciona plano desejado
  3. Preenche dados de pagamento
  4. Ao confirmar pagamento, plano é ativado
  5. Treinos são gerados automaticamente para 30 dias
  6. Redirecionado para `/dashboard`

**Botões:**
- "Finalizar Compra" - Ativa plano e gera treinos
- Timer visual com contagem regressiva

**Endpoints:**
- `POST /api/auth/ativar-plano-pagamento` - Ativa plano após pagamento
  - Ativa `planoAtivo: true`
  - Define `plano` e `dataPagamento`
  - **Gera treinos automaticamente para 30 dias**

**Proteção:**
- Usuários sem plano ativo são redirecionados para esta página ao tentar acessar funcionalidades protegidas

---

### 6. Dashboard (`/dashboard`)
**Arquivo:** `frontend/src/pages/Dashboard.tsx`

**Funcionalidades:**
- Verifica se usuário tem perfil completo
- Se não tem perfil, mostra botão para iniciar onboarding
- Se tem perfil:
  - Carrega treino do dia
  - Verifica atualização periódica (a cada 30 dias)
  - Mostra card de "Treino do Dia" com informações
  - Cards de acesso rápido:
    - Histórico
    - Estatísticas
    - Evolução de Peso
    - Perfil
    - Painel Admin (se for admin)
  - Card com informações do perfil
  - Alerta de atualização periódica (se necessário)
  - Modal de atualização periódica

**Botões:**
- "Ver Treino" - Navega para `/treino`
- "Gerar Treino do Dia" - Gera novo treino (se não houver)
- Cards clicáveis - Navegam para respectivas páginas
- "Atualizar Agora" - Abre modal de atualização periódica

**Modal de Atualização Periódica:**
- Formulário para atualizar:
  - Peso atual (opcional)
  - Percentual de gordura (opcional)
  - Lesões (checkboxes)
- Ao salvar, regenera treinos para próximos 30 dias
- Endpoint: `POST /api/perfil/atualizacao-periodica`

---

### 7. Treino do Dia (`/treino`)
**Arquivo:** `frontend/src/pages/TreinoDoDia.tsx`

**Funcionalidades:**
- Carrega treino do dia atual
- Se não houver treino, permite gerar
- Exibe exercícios em sequência
- Para cada exercício mostra:
  - Nome e grupo muscular
  - Séries, repetições, carga, RPE, descanso
  - Descrição e execução técnica
  - Erros comuns
  - GIF/imagem (se disponível)
- Barra de progresso
- Campo para RPE realizado
- Botão para concluir exercício
- Botão para buscar alternativas
- Navegação entre exercícios
- Ao concluir todos, mostra mensagem de parabéns

**Botões:**
- "Concluir Exercício" - Marca exercício como concluído e salva RPE
- "Ver Alternativas" - Busca exercícios alternativos
- "Anterior" / "Próximo" - Navega entre exercícios
- "Gerar Treino do Dia" - Gera novo treino (se não houver)
- "Voltar ao Dashboard" - Navega para `/dashboard`

**Endpoints:**
- `GET /api/treino/dia` - Busca treino do dia
- `POST /api/treino/gerar` - Gera novo treino
- `POST /api/treino/exercicio/:id/concluir` - Conclui exercício
- `GET /api/treino/exercicio/:id/alternativas` - Busca alternativas

---

### 8. Histórico (`/historico`)
**Arquivo:** `frontend/src/pages/Historico.tsx`

**Funcionalidades:**
- Lista últimos 30 treinos
- Para cada treino mostra:
  - Data formatada
  - Tipo de treino
  - Status (concluído/em andamento)
  - Número de exercícios
  - Exercícios concluídos
  - Tempo estimado
  - Volume total
  - Lista de exercícios com carga e RPE

**Botões:**
- "← Voltar" - Navega para `/dashboard`
- "Gerar Primeiro Treino" - Se não houver histórico

**Endpoint:**
- `GET /api/treino/historico?limite=30`

---

### 9. Estatísticas (`/estatisticas`)
**Arquivo:** `frontend/src/pages/Estatisticas.tsx`

**Funcionalidades:**
- Filtro de período (7, 15, 30, 60, 90 dias)
- Cards de resumo:
  - Total de treinos
  - Total de exercícios
  - Volume total (kg)
  - RPE médio
- Frequência semanal com barra de progresso
- Progressão por grupo muscular com indicadores visuais

**Botões:**
- "← Voltar" - Navega para `/dashboard`
- Select de período - Filtra estatísticas

**Endpoint:**
- `GET /api/treino/estatisticas?dias={periodo}`

---

### 10. Evolução de Peso (`/evolucao-peso`)
**Arquivo:** `frontend/src/pages/EvolucaoPeso.tsx`

**Funcionalidades:**
- Gráfico de linha com evolução do peso (Chart.js)
- Estatísticas:
  - Peso inicial
  - Peso atual
  - Variação (kg e %)
  - Média
  - Mínimo e máximo
- Lista completa de registros com comparação com anterior

**Botões:**
- "← Voltar" - Navega para `/dashboard`
- "Registrar Primeiro Peso" - Se não houver histórico

**Endpoint:**
- `GET /api/peso/historico?limite=30`

---

### 11. Perfil (`/perfil`)
**Arquivo:** `frontend/src/pages/Perfil.tsx`

**Funcionalidades:**
- Registro semanal de peso
- Visualização de informações pessoais
- Edição de perfil (modo edição)
- Visualização de configurações de treino
- Lista de lesões e equipamentos

**Botões:**
- "Registrar Peso" - Registra novo peso
- "✏️ Editar" - Ativa modo edição
- "Salvar Alterações" - Salva edições
- "Cancelar" - Cancela edição
- "← Voltar" - Navega para `/dashboard`

**Endpoints:**
- `GET /api/perfil` - Busca perfil
- `PUT /api/perfil` - Atualiza perfil
- `POST /api/peso` - Registra peso

---

### 12. Admin Login (`/admin/login`)
**Arquivo:** `frontend/src/pages/AdminLogin.tsx`

**Funcionalidades:**
- Login específico para administradores
- Validação de role ADMIN
- Armazena tokens em localStorage com prefixo `admin`
- Redirecionamento para `/admin`

**Botões:**
- "Acessar Painel Admin" - Faz login
- "Voltar para login de usuário" - Navega para `/login`

**Credenciais Padrão:**
- Usuário: `admin`
- Senha: `admin123`

---

### 13. Admin (`/admin`)
**Arquivo:** `frontend/src/pages/Admin.tsx`

**Funcionalidades:**
- Verificação de autenticação admin
- **Página inicial:** Tab Estatísticas (padrão)
- Tabs: Usuários, Exercícios, Estatísticas

- **Tab Estatísticas (Página Inicial):**
  - **Resumo Geral:**
    - Total de usuários (admins e usuários normais)
    - Usuários com plano ativo
    - Total de treinos (com taxa de conclusão)
    - Total de exercícios
  - **Dados Financeiros:**
    - Receita total (soma de todos os planos ativos)
    - Receita mensal (mês atual)
    - Planos ativos (total e por tipo)
    - Taxa de conversão (onboarding → pagamento)
    - Receita por tipo de plano (Mensal, Trimestral, Semestral)
  - **Métricas de Conversão e Engajamento:**
    - Taxa de conversão
    - Taxa de conclusão de treinos (média geral)
    - Perfis completos vs incompletos
  - **Distribuição de Usuários:**
    - Com perfil completo
    - Sem perfil
    - Com plano mas sem perfil
    - Com perfil mas sem plano

- **Tab Usuários:**
  - **Alternância de Visualização:**
    - Cards (padrão): Grid responsivo com informações completas
    - Lista: Visualização compacta horizontal
    - Tabela: Visualização tabular com todas as colunas
    - Preferência salva no localStorage
  - Lista de usuários com informações:
    - Nome, email, telefone
    - Badges: Admin/User, Plano Ativo/Sem Plano, Perfil Completo/Sem Perfil, Tipo de Plano
    - Data de cadastro
  - Busca por email/nome
  - Criar novo usuário (modal)
  - **Modal de Detalhes Completo:**
    - Aba "Informações Básicas": Dados pessoais, status da conta, informações do sistema
    - Aba "Dados do Onboarding": Dados pessoais/físicos, dados de treino, informações adicionais
    - Aba "Treinos": Estatísticas, próximos treinos, treinos passados
    - Aba "Histórico e Progresso": Estatísticas de peso, histórico completo com variações

- **Tab Exercícios:**
  - Lista de exercícios
  - Criar/editar exercícios (em desenvolvimento)

**Botões:**
- Tabs de navegação
- Botões de alternância de visualização (cards/lista/tabela)
- "Criar Usuário" - Abre modal
- "Buscar" - Filtra usuários
- "Ver Detalhes" - Abre modal com informações completas
- "Sair" - Logout admin

**Endpoints:**
- `GET /api/admin/usuarios` - Lista usuários (com busca opcional via query `?search=termo`)
  - Retorna: lista de usuários com telefone, plano, planoAtivo, dataPagamento
- `GET /api/admin/usuarios/:id` - Detalhes completos do usuário
  - Retorna: dados básicos, perfil completo, histórico de peso, treinos (próximos e passados), estatísticas calculadas
- `POST /api/admin/usuarios` - Criar novo usuário
  - Body: email, senha, nome (opcional), role (USER/ADMIN)
- `PUT /api/admin/usuarios/:id` - Atualizar usuário
- `DELETE /api/admin/usuarios/:id` - Desativar usuário
- `GET /api/admin/estatisticas` - Estatísticas expandidas com dados financeiros
  - Retorna: resumo geral, dados financeiros (receita total, mensal, por plano), métricas de conversão, distribuição de usuários

**Melhorias Visuais:**
- ✅ Design system dark aplicado completamente
- ✅ Ícones SVG profissionais (sem emojis)
- ✅ Cards internos no modal para melhor organização
- ✅ Hierarquia visual melhorada
- ✅ Espaçamento e contraste otimizados
- ✅ Loading states e tratamento de erros robusto

---

## 🔒 REGRAS DE NEGÓCIO E LÓGICA

### Fluxo de Aquisição e Pagamento

#### Novo Fluxo (v3.0.0)
1. **Onboarding:** Usuário completa questionário (dados salvos em localStorage)
2. **Página de Resultados (`/cadastro`):** Exibe transformação esperada, sem preços
3. **Criação de Conta:** Usuário cria conta (nome, telefone, email, senha)
   - Endpoint: `POST /api/auth/cadastro-pre-pagamento`
   - Cria usuário com `planoAtivo: false`
   - Cria perfil com dados do onboarding
   - **NÃO gera treinos** nesta etapa
4. **Checkout (`/checkout`):** Página de vendas com planos e preços
   - Timer de oferta (15 minutos)
   - Elementos de conversão
   - Seleção de plano e pagamento
5. **Ativação de Plano:** Após pagamento confirmado
   - Endpoint: `POST /api/auth/ativar-plano-pagamento`
   - Ativa `planoAtivo: true`
   - Define `plano` e `dataPagamento`
   - **Gera treinos automaticamente para 30 dias**
6. **Acesso ao Dashboard:** Usuário pode acessar funcionalidades

#### Proteção de Rotas
- Middleware `verificarPlanoAtivo` bloqueia acesso a rotas protegidas se `planoAtivo: false`
- Rotas permitidas sem plano: `/checkout`, `/perfil`
- Usuários sem plano são redirecionados para `/checkout`

### Geração de Treinos

#### Após Pagamento
1. Ao ativar plano após pagamento, sistema **automaticamente gera treinos para os próximos 30 dias**
2. Distribuição baseada em `frequenciaSemanal`:
   - 2x/semana: Segunda e Quinta
   - 3x/semana: Segunda, Quarta, Sexta
   - 4x/semana: Segunda, Terça, Quinta, Sexta
   - 5x/semana: Segunda a Sexta
   - 6x/semana: Segunda a Sábado

#### Determinação de Divisão de Treino
- **Iniciantes:**
  - 2-3x/semana: Full Body ou A-B (Upper/Lower)
- **Intermediários:**
  - 3x/semana: A-B-C
  - 4x/semana: A-B-C-D
- **Avançados:**
  - 4-6x/semana: A-B-C-D ou Push Pull Legs

#### Seleção de Exercícios
1. Filtra por grupos musculares do dia
2. Considera lesões do usuário (evita grupos afetados)
3. Filtra por equipamentos disponíveis
4. Se não encontrar com equipamentos, busca sem filtro
5. Filtra por nível de dificuldade (baseado em experiência)
6. Limita número de exercícios por tempo disponível:
   - ≤45min: 4 exercícios
   - ≤60min: 6 exercícios
   - >60min: 8 exercícios

#### Cálculo de Carga
- **Sem histórico:** Carga inicial baseada em peso e experiência
- **Com histórico:** Progressão baseada em RPE:
  - RPE < 7: +7.5% carga
  - RPE 7-8: Manter carga
  - RPE 9-10: -5% carga

#### Séries e Repetições
- **Hipertrofia:** 3-4 séries, 8-12 repetições
- **Força:** 4-5 séries, 4-6 repetições
- **Emagrecimento:** 2-3 séries, 12-15 repetições
- **Condicionamento:** 2-3 séries, 15-20 repetições

### Atualização Periódica (30 dias)

#### Quando Ocorre
- Após 30 dias da última atualização periódica
- Modal aparece automaticamente no Dashboard
- Alerta visual também é exibido

#### O que é Coletado
- Peso atual (opcional)
- Percentual de gordura (opcional)
- Lesões/limitações (opcional)

#### O que Acontece Após Atualização
1. Atualiza perfil com novos dados
2. Deleta treinos futuros não concluídos
3. Regenera treinos para próximos 30 dias
4. Atualiza `ultimaAtualizacaoPeriodica`

### Progressão Automática
- Baseada em histórico dos últimos 3 treinos com cada exercício
- Considera RPE realizado
- Ajusta carga automaticamente para próximo treino

---

## 📚 BASE DE CONHECIMENTO

### Arquivo
`BASE_DE_CONHECIMENTO.md` - Contém todo o conhecimento especializado

### Conteúdo
- Terminologias e conceitos fundamentais
- Princípios de treinamento (sobrecarga progressiva, especificidade, etc.)
- Modelos de periodização (Linear, Reversa, Ondulatória)
- Divisões de treino detalhadas
- Técnicas avançadas (Drop-Set, Rest-Pause, Bi-Set, etc.)
- Volume, intensidade e frequência
- Recomendações por nível de experiência

### Integração
- Lógica de geração de treinos usa regras da base de conhecimento
- Filtros de exercícios respeitam limitações
- Progressão segue princípios científicos

---

## 💳 SISTEMA DE PLANOS E PAGAMENTO

### Modelo de Dados

#### Campos no User
- `plano`: String? - Tipo de plano (MENSAL, TRIMESTRAL, SEMESTRAL)
- `planoAtivo`: Boolean - Status do plano (padrão: false)
- `dataPagamento`: DateTime? - Data do último pagamento

### Endpoints de Autenticação e Plano

#### `POST /api/auth/cadastro-pre-pagamento`
Cria usuário e perfil após onboarding, sem gerar treinos.

**Body:**
```json
{
  "nome": "Nome Completo",
  "telefone": "(11) 99999-9999",
  "email": "usuario@exemplo.com",
  "senha": "senha123",
  "onboardingData": {
    "genero": "Masculino",
    "idade": 30,
    "altura": 175,
    "peso": 80,
    // ... todos os dados do onboarding
  }
}
```

**Resposta:**
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "...",
    "email": "...",
    "nome": "...",
    "planoAtivo": false
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

#### `POST /api/auth/ativar-plano-pagamento`
Ativa plano após pagamento confirmado e gera treinos.

**Body:**
```json
{
  "userId": "user-id",
  "plano": "TRIMESTRAL"
}
```

**Resposta:**
```json
{
  "message": "Plano ativado com sucesso",
  "user": {
    "id": "...",
    "planoAtivo": true,
    "plano": "TRIMESTRAL",
    "dataPagamento": "2024-12-20T..."
  },
  "treinosGerados": 12
}
```

### Middleware de Verificação de Plano

#### `verificarPlanoAtivo`
- Verifica se usuário tem `planoAtivo: true`
- Bloqueia acesso a rotas protegidas se plano não estiver ativo
- Rotas permitidas sem plano: `/checkout`, `/perfil`
- Retorna 403 se plano não estiver ativo

### Preços dos Planos
- **Mensal:** R$ 19,90/mês
- **Trimestral:** R$ 39,90 a cada 3 meses (33% desconto)
- **Semestral:** R$ 79,90 a cada 6 meses (33% desconto)

---

## 🏋️ SISTEMA DE GERAÇÃO DE TREINOS

### Endpoints

#### `POST /api/treino/gerar`
Gera treino para o dia atual ou data especificada.

**Body (opcional):**
```json
{
  "data": "2024-11-15",
  "gerarSemana": false
}
```

**Resposta:**
```json
{
  "message": "Treino gerado com sucesso",
  "treino": {
    "id": "...",
    "data": "...",
    "tipo": "...",
    "exercicios": [...],
    "metadados": {...}
  }
}
```

#### `GET /api/treino/dia`
Busca treino do dia atual.

**Resposta:**
```json
{
  "id": "...",
  "data": "...",
  "tipo": "...",
  "exercicios": [...]
}
```

#### `POST /api/treino/exercicio/:id/concluir`
Conclui um exercício do treino.

**Body:**
```json
{
  "rpeRealizado": 8
}
```

#### `GET /api/treino/exercicio/:id/alternativas`
Busca exercícios alternativos.

### Funções Principais (Backend)

#### `gerarTreinoDoDia(userId, data)`
- Determina divisão de treino
- Seleciona grupos musculares do dia
- Busca exercícios aplicando filtros
- Calcula cargas baseadas em histórico
- Cria treino no banco

#### `gerarTreinos30Dias(userId)`
- Gera treinos para próximos 30 dias
- Distribui conforme frequência semanal
- Evita duplicatas
- **Chamado automaticamente após ativação de plano**

#### `aplicarProgressao(userId, tipoTreino, exercicioId)`
- Busca histórico do exercício
- Calcula nova carga baseada em RPE
- Retorna carga ou null (se sem histórico)

---

## 🔄 SISTEMA DE ATUALIZAÇÃO PERIÓDICA

### Endpoints

#### `GET /api/perfil/atualizacao-periodica`
Verifica se precisa atualizar.

**Resposta:**
```json
{
  "precisaAtualizar": true,
  "diasDesdeUltimaAtualizacao": 32,
  "diasRestantes": 0,
  "ultimaAtualizacao": "...",
  "proximaAtualizacao": "..."
}
```

#### `POST /api/perfil/atualizacao-periodica`
Realiza atualização periódica.

**Body:**
```json
{
  "pesoAtual": 75.5,
  "percentualGordura": 15.5,
  "lesoes": ["Joelho"]
}
```

**Resposta:**
```json
{
  "message": "Atualização realizada com sucesso...",
  "perfil": {...},
  "treinosGerados": 12,
  "proximaAtualizacao": "..."
}
```

### Lógica
1. Verifica se passaram 30 dias
2. Se sim, permite atualização
3. Atualiza perfil
4. Deleta treinos futuros não concluídos
5. Gera novos treinos para 30 dias
6. Atualiza `ultimaAtualizacaoPeriodica`

---

## 📝 HISTÓRICO DE ALTERAÇÕES

### 2024-12-20 - Reestruturação Completa do Fluxo de Aquisição e Melhorias no Painel Admin
**Alterações:**

#### Fluxo de Aquisição e Pagamento
- ✅ **Novo fluxo:** Onboarding → Resultados → Criação de Conta → Checkout → Ativação
- ✅ Removido conceito de "trial" de 3 dias
- ✅ Criada página `/cadastro` (resultados sem preços)
- ✅ Criada página `/checkout` (vendas com planos e timer de oferta)
- ✅ Endpoint `POST /api/auth/cadastro-pre-pagamento` - Cria usuário sem gerar treinos
- ✅ Endpoint `POST /api/auth/ativar-plano-pagamento` - Ativa plano e gera treinos
- ✅ Middleware `verificarPlanoAtivo` - Protege rotas que requerem plano ativo
- ✅ Schema atualizado: campos `planoAtivo` e `dataPagamento` no modelo User

#### Painel Administrativo
- ✅ **Página inicial:** Tab Estatísticas (padrão)
- ✅ **Estatísticas expandidas:**
  - Dados financeiros (receita total, mensal, por plano)
  - Métricas de conversão e engajamento
  - Distribuição detalhada de usuários
- ✅ **Alternância de visualização:** Cards, Lista, Tabela
- ✅ **Modal de detalhes completo:**
  - 4 abas organizadas (Informações Básicas, Onboarding, Treinos, Histórico)
  - Design melhorado com cards internos
  - Melhor hierarquia visual e espaçamento
- ✅ Tratamento robusto de erros (rede, autenticação, permissões)
- ✅ Loading states adequados
- ✅ Interceptor de token admin corrigido

#### Melhorias Visuais
- ✅ Design system dark aplicado em todas as páginas
- ✅ Ícones SVG profissionais (sem emojis)
- ✅ Toast notifications para feedback
- ✅ Validação em tempo real no frontend

**Arquivos Modificados:**
- `backend/prisma/schema.prisma` - Campos planoAtivo e dataPagamento
- `backend/src/controllers/auth.controller.ts` - Novos endpoints de cadastro e ativação
- `backend/src/controllers/admin.controller.ts` - Endpoint de detalhes e estatísticas expandidas
- `backend/src/middleware/plano.middleware.ts` - Novo middleware de verificação de plano
- `backend/src/routes/auth.routes.ts` - Novas rotas
- `backend/src/routes/admin.routes.ts` - Rota de detalhes
- `backend/src/routes/treino.routes.ts` - Middleware de plano aplicado
- `frontend/src/pages/Landing.tsx` - Redireciona para /cadastro
- `frontend/src/pages/Cadastro.tsx` - Transformado em página de resultados + criação de conta
- `frontend/src/pages/Checkout.tsx` - Nova página de vendas
- `frontend/src/pages/Admin.tsx` - Reestruturação completa
- `frontend/src/contexts/AuthContext.tsx` - Helper setUserFromResponse
- `frontend/src/components/ProtectedRoute.tsx` - Verificação de plano ativo
- `frontend/src/services/auth.service.ts` - Interceptor corrigido

### 2024-11-15 - Implementação de Atualização Periódica e Geração Automática
**Alterações:**
- ✅ Criada função `gerarTreinos30Dias()` no backend
- ✅ Modificado `createPerfil` para gerar treinos automaticamente após onboarding
- ⚠️ **NOTA:** Este comportamento foi alterado na v3.0.0 - treinos agora são gerados apenas após pagamento (via `ativar-plano-pagamento`)
- ✅ Adicionado campo `ultimaAtualizacaoPeriodica` no schema Prisma
- ✅ Criados endpoints de atualização periódica
- ✅ Implementado modal de atualização periódica no Dashboard
- ✅ Melhorada lógica de progressão baseada em histórico
- ✅ Sistema agora considera RPE dos últimos 3 treinos para calcular carga

**Arquivos Modificados:**
- `backend/src/services/treino.service.ts` - Nova função e melhorias
- `backend/src/controllers/perfil.controller.ts` - Geração automática e endpoints
- `backend/prisma/schema.prisma` - Novo campo
- `frontend/src/pages/Dashboard.tsx` - Modal e verificação
- `backend/src/routes/perfil.routes.ts` - Novas rotas

### 2024-11-15 - Revisão de Layout e Funcionalidades
**Alterações:**
- ✅ Atualizado `Historico.tsx` para design system dark
- ✅ Atualizado `Estatisticas.tsx` para design system dark
- ✅ Atualizado `EvolucaoPeso.tsx` para design system dark
- ✅ Melhorado tratamento de erros na geração de treinos
- ✅ Adicionados logs detalhados para debug de geração de treinos
- 🔄 Em progresso: `Perfil.tsx`, `Admin.tsx`
- ✅ Criado arquivo de documentação único (`DOCUMENTACAO_COMPLETA.md`)
- ✅ Removidos arquivos .md desnecessários (mantidos apenas: DOCUMENTACAO_COMPLETA.md, README.md, BASE_DE_CONHECIMENTO.md, CHANGELOG.md)

**Páginas com Layout Atualizado:**
- `Login.tsx` - ✅
- `Register.tsx` - ✅
- `Onboarding.tsx` - ✅
- `Dashboard.tsx` - ✅
- `TreinoDoDia.tsx` - ✅
- `AdminLogin.tsx` - ✅
- `Historico.tsx` - ✅
- `Estatisticas.tsx` - ✅
- `EvolucaoPeso.tsx` - ✅

**Páginas Pendentes:**
- `Perfil.tsx` - ✅ (Atualizado em 2024-12-20)
- `Admin.tsx` - ✅ (Atualizado em 2024-12-20)

**Melhorias na Geração de Treinos:**
- ✅ Logs detalhados adicionados em `gerarTreinos30Dias()`
- ✅ Verificação de exercícios cadastrados antes de gerar
- ✅ Logs de grupos musculares e divisão de treino
- ✅ Tratamento de erros melhorado com mensagens mais claras
- ✅ Logs de sucesso/erro para cada treino gerado

### 2024-11-16 - Melhorias de UX, Design e Conversão
**Alterações:**

#### Página Inicial (Landing.tsx)
- ✅ Removidos todos os emojis e substituídos por ícones SVG profissionais
- ✅ Adicionada seção "O que é o AthletIA?" com explicação detalhada do sistema
- ✅ Adicionada seção "O que acontece quando você clica em 'Começar Agora'?" explicando o processo em 4 passos
- ✅ Melhorado headline principal para ser mais impactante
- ✅ Adicionado subtítulo "Sistema Inteligente de Treinos Personalizados"
- ✅ Removido texto "Português" do header, mantendo apenas logo "AthletIA"
- ✅ Melhorado design do CTA button (tamanho e sombra aumentados)
- ✅ Footer links agora são clicáveis e sublinhados

#### Onboarding - Melhorias nas Etapas
- ✅ **Etapa de Nível de Condicionamento Físico:**
  - Removidos emojis de raio (⚡)
  - Adicionados ícones SVG profissionais (pessoas, gráfico, badge)
  - Melhorado layout com containers destacados
  - Adicionado checkmark SVG quando selecionado

- ✅ **Etapa de Frequência Semanal:**
  - Adicionados ícones SVG para cada opção (calendário, gráfico, tendência, estrela, badge)
  - Melhorado layout com descrições mais detalhadas
  - Cards com design mais profissional

- ✅ **Etapa de Tempo de Treino:**
  - Adicionadas descrições para cada opção
  - Melhorado layout com ícones em containers destacados
  - Design consistente com outras etapas

- ✅ **Etapa de Benefícios Desejados:**
  - Removidos todos os emojis (😴, 🗓️, ➕, 🧘, ⚡)
  - Substituídos por ícones SVG profissionais (lua, calendário, coração, lâmpada, raio)
  - Melhorado layout e espaçamento
  - Checkbox com ícone SVG de check

- ✅ **Correção de Imagens:**
  - Corrigidas imagens do onboarding masculino (usando pasta `Final_Homen`)
  - Corrigido caminho de `ganhar_massa.webp` para `ganahr_massa.webp`
  - Imagens copiadas da pasta correta para `public/images/onboarding`

- ✅ **Correção de Unidades:**
  - Removidas referências a onças na etapa de consumo de água
  - Mantido apenas sistema métrico (litros)

#### Página de Cadastro (Cadastro.tsx)
- ✅ **Substituição da Seção "Seu Perfil":**
  - Removidas informações do usuário da coluna esquerda
  - Adicionada seção de **Garantia de 7 dias** com destaque visual
  - Adicionada seção de **Estatísticas de Sucesso** (95% satisfação, 10k+ usuários, 4.9/5 avaliação)
  - Adicionada seção de **Benefícios Principais** com ícones SVG
  - Adicionada seção de **Diferencial Competitivo** destacando vantagens do AthletIA
  - Foco em elementos de conversão ao invés de dados do usuário

- ✅ **Melhorias nos Cálculos de Transformação:**
  - **Gordura Corporal Atual:** Agora considera IMC, experiência e frequência de treino
  - **Gordura Corporal Futura:** Cálculo mais realista baseado na gordura atual, objetivo, frequência e experiência. Redução de 3-6% em 6 meses (dependendo do comprometimento)
  - **Idade de Condicionamento Físico:** Considera IMC, experiência, frequência e objetivo. Melhoria realista de 2-5 anos em 6 meses
  - **Músculos do Corpo:** Cálculo baseado em IMC, experiência, frequência e objetivo. Ganho proporcional ao nível atual
  - Valores mínimos realistas implementados (8% gordura para homens, 16% para mulheres)
  - Limites máximos de melhoria para evitar valores irreais

**Arquivos Modificados:**
- `frontend/src/pages/Landing.tsx` - Melhorias na página inicial e todas as etapas do onboarding
- `frontend/src/pages/Cadastro.tsx` - Substituição de seção de perfil por elementos de conversão e melhorias nos cálculos

---

## 🔧 PRÓXIMAS AÇÕES

### Imediatas
1. ✅ Página inicial e onboarding completamente atualizados com design profissional
2. ✅ Elementos de conversão implementados na página de cadastro
3. ✅ Cálculos de transformação melhorados e mais realistas
4. ✅ Fluxo de aquisição reestruturado (onboarding → cadastro → checkout)
5. ✅ Painel administrativo completamente reestruturado
6. ✅ Sistema de planos e pagamento implementado
7. ✅ Estatísticas expandidas com dados financeiros
8. Testar integração completa do fluxo end-to-end
9. Verificar tratamento de erros em todos os cenários
10. Garantir consistência visual em todo o sistema

### Futuras
1. Integração com gateway de pagamento real (Stripe, Mercado Pago, etc.)
2. Sistema de renovação automática de planos
3. Notificações de vencimento de plano
4. Dashboard de analytics avançado para admin
5. Exportação de relatórios financeiros (PDF, Excel)
6. Adicionar mais exercícios ao banco
7. Implementar upload de imagens/GIFs
8. Melhorar sistema de notificações
9. Adicionar mais gráficos e análises
10. Implementar IA/LLM para refinamento de treinos

---

## 📌 NOTAS IMPORTANTES

1. **Sempre atualizar este arquivo** quando fizer alterações no sistema
2. **Todas as alterações** devem ser documentadas na seção "Histórico de Alterações"
3. **Design system** deve ser usado consistentemente em todas as páginas
4. **Endpoints** devem seguir padrão REST
5. **Validações** devem ser feitas tanto no frontend quanto no backend

---

**Fim da Documentação**

