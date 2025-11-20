# 📐 FASE 4: LÓGICA DE GERAÇÃO DE TREINOS

**Status:** 🔄 Em Progresso  
**Data de Início:** 2024-12-19

---

## 🎯 Objetivos da Fase

Implementar a lógica completa de geração de treinos personalizados baseada no perfil do usuário, conhecimento especializado e princípios de periodização.

## ✅ Tarefas

### 1. Estrutura de Dados
- [x] Modelo de Exercício no Prisma
- [x] Seed de exercícios básicos (14 exercícios)
- [x] Relacionamento ExercicioTreino

### 2. Lógica de Periodização
- [x] Determinar divisão de treino (Full Body, A-B, A-B-C, etc.)
- [x] Determinar grupos musculares do dia
- [x] Calcular séries e repetições por objetivo
- [x] Calcular carga inicial
- [x] Calcular tempo estimado

### 3. Geração de Treinos
- [x] Endpoint POST /api/treino/gerar
- [x] Endpoint GET /api/treino/dia
- [x] Buscar exercícios por grupo muscular
- [x] Filtrar por nível de dificuldade
- [x] Limitar por tempo disponível

### 4. Interface de Treino
- [x] Tela de treino do dia
- [x] Visualização de exercícios
- [x] Sistema de conclusão
- [x] Barra de progresso
- [x] Navegação entre exercícios

### 5. Sistema de Progressão
- [x] Ajustar carga baseado em RPE
- [x] Histórico de treinos
- [x] Análise de progresso
- [x] Cálculo de progressão por grupo muscular
- [x] Estatísticas de volume e frequência

## 📊 Resultados Alcançados

- ✅ Modelo de dados completo de exercícios
- ✅ 14 exercícios básicos cadastrados
- ✅ Lógica de periodização implementada
- ✅ Geração automática de treinos
- ✅ Interface completa de treino
- ✅ Sistema de conclusão de exercícios

## 🔧 Implementações Realizadas

### [2024-12-19] - Estrutura de Exercícios e Geração de Treinos
**O que foi feito:**
- Modelo Exercicio criado no Prisma
- Seed com 14 exercícios básicos
- Lógica de periodização completa
- Serviços de geração de treinos
- Endpoints de treino
- Interface de treino do dia

**Arquivos criados/modificados:**
- `backend/prisma/schema.prisma` (modelo Exercicio adicionado)
- `backend/prisma/seed.ts` (14 exercícios)
- `backend/src/services/periodizacao.service.ts` (lógica de periodização)
- `backend/src/services/treino.service.ts` (geração de treinos)
- `backend/src/routes/treino.routes.ts`
- `backend/src/controllers/treino.controller.ts`
- `frontend/src/pages/TreinoDoDia.tsx`
- `frontend/src/pages/Dashboard.tsx` (integração)

**Funcionalidades:**
- Divisões: Full Body, A-B, A-B-C, A-B-C-D, A-B-C-D-E, Push Pull Legs
- Cálculo automático de carga baseado em peso e experiência
- Séries e repetições por objetivo
- Tempo estimado calculado
- Interface responsiva e intuitiva

### [2024-12-19] - Progressão Automática e Alternativas
**O que foi feito:**
- Sistema de progressão automática baseado em RPE
- Busca e substituição de exercícios alternativos
- Histórico de treinos
- Estatísticas de progresso
- Interface melhorada com RPE e alternativas

**Arquivos criados/modificados:**
- `backend/src/services/progressao.service.ts` (novo serviço)
- `backend/src/services/treino.service.ts` (integração de progressão)
- `backend/src/controllers/treino.controller.ts` (novos endpoints)
- `backend/src/routes/treino.routes.ts` (novas rotas)
- `frontend/src/pages/TreinoDoDia.tsx` (RPE e alternativas)

**Novos Endpoints:**
- `GET /api/treino/exercicio/:id/alternativas` - Buscar alternativas
- `POST /api/treino/exercicio/:id/substituir` - Substituir exercício
- `GET /api/treino/historico` - Histórico de treinos
- `GET /api/treino/estatisticas` - Estatísticas de progresso

**Funcionalidades:**
- Progressão automática: RPE < 7 = +7.5% carga, RPE 7-8 = manter, RPE 9-10 = -5% carga
- Busca de alternativas por grupo muscular e equipamento
- Histórico dos últimos 30 treinos
- Estatísticas: volume total, RPE médio, progressão por grupo muscular, frequência semanal
- Interface: input de RPE, botão de alternativas, modal de substituição

---

## 📝 Decisões Técnicas

### Divisão de Treino
- Baseada em experiência e frequência semanal
- Iniciantes: Full Body ou A-B
- Intermediários: A-B-C
- Avançados: A-B-C-D ou Push Pull Legs

### Cálculo de Carga
- Baseado em percentuais do peso corporal
- Ajustado por grupo muscular
- Diferentes para cada nível de experiência

### Seleção de Exercícios
- Filtrados por grupo muscular do dia
- Respeitam nível de dificuldade
- Limitados por tempo disponível

---

## 🔗 Próximos Passos

1. ✅ Implementar progressão automática baseada em RPE
2. ✅ Sistema de alternativas de exercícios
3. ✅ Histórico e estatísticas de evolução
4. ⏳ Gráficos de evolução (frontend)
5. ⏳ Integração com IA para refinamento

---

**Última Atualização:** 2024-12-19

