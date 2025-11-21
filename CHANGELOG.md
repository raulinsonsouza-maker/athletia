# 📝 CHANGELOG - AthletIA

Registro de todas as mudanças e implementações do projeto.

---

## [2.0.0] - 2024-12-20

### 🎨 Reorganização Completa UX/UI

#### Dashboard Redesenhado
- ✅ Novo Header Inteligente com botão principal destacado
- ✅ Componente Minha Semana com calendário visual de 7 dias
- ✅ Treinos Recentes (últimos 3 concluídos)
- ✅ Minha Evolução com cards resumidos (Peso, Força, Sequência)
- ✅ Chamado para Ação com mensagens motivacionais da IA
- ✅ Nova hierarquia visual: Header > Semana > Recentes > Evolução > Performance > Conquistas

#### Novas Páginas
- ✅ `/minha-semana` - Visualização completa da semana com planilha semanal
- ✅ `/conquistas` - Página dedicada com gamificação avançada (Desbloqueadas, Quase Lá, Próximos Desafios)
- ✅ `/evolucao` - Página unificada de evolução

#### Fluxo de Treino Aprimorado
- ✅ Tela Pré-treino antes de iniciar
- ✅ Tela Fim do Treino com feedback da IA
- ✅ Correção: Não redireciona para conclusão automaticamente ao entrar na página

#### Sistema de IA
- ✅ Serviço de feedback contextual após treinos
- ✅ Serviço de relatórios humanos (não só números)
- ✅ Serviço de reordenação automática quando usuário pula treino
- ✅ Detecção de risco de abandono

#### Navegação
- ✅ Menu expandido com mais opções (Minha Semana, Conquistas, Evolução)
- ✅ Organização em seções (Navegação / Mais Opções)

#### Correções
- ✅ Endpoint de histórico corrigido (`/treino/historico` em vez de `/treino?concluido=true`)
- ✅ Remoção de imports não utilizados
- ✅ Correção de tipos TypeScript

### 📚 Documentação
- ✅ Documentação centralizada em `DOCUMENTACAO.md`
- ✅ README.md simplificado como ponto de entrada
- ✅ Todas as informações em um único local

---

## [1.0.0] - 2024-12-19

### ✅ Funcionalidades Implementadas

#### Autenticação e Segurança
- Sistema de registro e login
- JWT com refresh tokens
- Proteção de rotas
- Hash de senhas com bcrypt

#### Perfil e Onboarding
- Questionário completo em 4 passos
- Coleta de dados pessoais e objetivos
- Edição de perfil
- Registro automático de peso inicial

#### Geração de Treinos
- 14 exercícios básicos cadastrados
- 6 tipos de divisão de treino (Full Body, A-B, A-B-C, A-B-C-D, A-B-C-D-E, Push Pull Legs)
- Cálculo automático de carga baseado em peso e experiência
- Séries e repetições por objetivo
- Progressão automática baseada em RPE
- Sistema de alternativas de exercícios
- Validação avançada de treinos

#### Interface do Usuário
- 9 telas principais:
  - Login
  - Registro
  - Onboarding
  - Dashboard
  - Treino do Dia
  - Histórico de Treinos
  - Estatísticas e Progresso
  - Perfil e Configurações
  - Evolução de Peso
- Design responsivo mobile-first
- Componentes reutilizáveis (Loading, Toast)
- Design system básico

#### Acompanhamento
- Histórico completo de treinos
- Estatísticas detalhadas (volume, RPE, frequência)
- Progressão por grupo muscular
- Registro semanal de peso
- Gráficos de evolução de peso
- Cálculo de estatísticas de peso

### 🔧 Melhorias Técnicas
- Validação de treinos gerados
- Validação de substituição de exercícios
- Tratamento de erros robusto
- Estados de loading
- Feedback visual

### 📚 Documentação
- Base de conhecimento completa
- Guias de instalação e teste
- Documentação técnica detalhada
- Especificações de cada fase

---

## 🚀 Próximas Versões

### [1.1.0] - Planejado
- Integração com IA/LLM
- Mais exercícios no banco
- Gráficos mais avançados
- Painel administrativo

### [1.2.0] - Planejado
- App mobile
- Notificações push
- Sincronização offline
- Compartilhamento de treinos

---

**Última Atualização:** 2024-12-19

