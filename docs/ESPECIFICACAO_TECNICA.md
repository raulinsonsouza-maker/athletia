# 📐 ESPECIFICAÇÃO TÉCNICA - AthletIA

> Documento técnico detalhado do sistema

**Versão:** 1.0.0  
**Data:** 2024-12-19

---

## 🎯 IDENTIDADE DO SISTEMA

### Nome
**AthletIA** - Sistema Inteligente de Treinos Personalizados

### Função Central
Gerar treinos personalizados, adaptativos e cientificamente fundamentados para qualquer usuário, com base em:
- Dados fornecidos
- Histórico semanal
- Evolução do usuário
- Base de conhecimento especializada

### Princípios da IA
1. Ser objetiva, clara e direta
2. Explicar o racional técnico das escolhas
3. Trabalhar com progressão de cargas
4. Evitar contradições e manter coerência
5. Operar como treinador profissional

---

## 📋 ETAPAS DETALHADAS

### ETAPA 1: PERFIL INICIAL DO USUÁRIO (ONBOARDING)

#### Dados a Coletar

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| Idade | number | Sim | 13-100 |
| Sexo | string | Sim | M/F/Outro |
| Altura (cm) | number | Sim | 100-250 |
| Peso atual (kg) | number | Sim | 30-300 |
| Percentual de gordura | number | Não | 5-50 |
| Experiência | string | Sim | Iniciante/Intermediário/Avançado |
| Objetivo primário | string | Sim | Emagrecimento/Hipertrofia/Força/Condicionamento |
| Frequência semanal | number | Sim | 1-7 |
| Tempo disponível (min) | number | Sim | 30-120 |
| Lesões/limitações | array | Não | - |
| Equipamentos | array | Não | - |
| Preferências | array | Não | - |
| Histórico anterior | string | Não | - |
| RPE preferido | number | Não | 1-10 |

#### Saída Esperada
Perfil técnico resumido que servirá como base de decisão para geração de treinos.

---

### ETAPA 2: CONSTRUÇÃO DA BASE DE CONHECIMENTO

#### Fontes de Conhecimento

1. **Literatura Esportiva**
   - Treino resistido
   - Periodização
   - Hipertrofia
   - Força
   - Emagrecimento
   - Biomecânica

2. **Livros do Administrador**
   - Upload de PDFs
   - Processamento de texto
   - Extração de conhecimento estruturado

3. **Base de Exercícios**
   - Catálogo completo
   - Metadados detalhados
   - Relacionamentos entre exercícios

#### Estrutura de Exercício

```typescript
interface Exercicio {
  id: string;
  nome: string;
  grupo_muscular_principal: string;
  sinergistas: string[];
  descricao: string;
  execucao_tecnica: string;
  erros_comuns: string[];
  imagem_url?: string;
  gif_url?: string;
  carga_inicial_sugerida: number;
  rpe_sugerido: number;
  alternativas: string[]; // IDs de exercícios alternativos
  equipamento_necessario: string[];
  nivel_dificuldade: 'Iniciante' | 'Intermediário' | 'Avançado';
}
```

---

### ETAPA 3: LÓGICA DE GERAÇÃO DE TREINO

#### Princípios de Periodização

**Hipertrofia:**
- ABC (3x/semana)
- ABCD (4x/semana)
- Push Pull Legs (3-6x/semana)

**Emagrecimento:**
- Full Body (3-4x/semana)
- Upper Lower (4x/semana)
- HIIT + Resistido (3-5x/semana)

**Força:**
- Baixa variação
- Progressão linear de carga
- Foco em movimentos compostos

#### Estrutura do Treino do Dia

```typescript
interface TreinoDia {
  id: string;
  usuario_id: string;
  data: Date;
  objetivo: string;
  aquecimento: string[];
  exercicios: ExercicioTreino[];
  tempo_estimado: number; // minutos
  observacoes: string;
}

interface ExercicioTreino {
  exercicio_id: string;
  ordem: number;
  series: number;
  repeticoes: number | string; // "8-12" ou número fixo
  carga: number; // kg
  rpe: number;
  descanso: number; // segundos
  concluido: boolean;
  observacoes_tecnica: string;
}
```

#### Progressão Automática

| Condição | Ação |
|----------|------|
| Concluiu fácil (RPE < 7) | +5 a 10% carga |
| Concluiu mediano (RPE 7-8) | Manter carga |
| Concluiu difícil (RPE 9-10) | Reduzir 5% ou manter |
| Lesão/dor reportada | Substituir exercício |

#### Sistema de Alternativas

Quando usuário marca máquina ocupada:
1. Buscar exercícios com mesmo grupo muscular principal
2. Filtrar por equipamento disponível
3. Priorizar movimentos biomecanicamente similares
4. Sugerir 2-3 alternativas

---

### ETAPA 4: ACOMPANHAMENTO E EVOLUÇÃO

#### Dados Semanais

```typescript
interface RegistroSemanal {
  usuario_id: string;
  semana: Date; // Início da semana
  peso: number;
  rpe_medio: number;
  treinos_concluidos: number;
  treinos_planejados: number;
  feedback: {
    exercicio_id: string;
    dificuldade: number;
    observacoes: string;
  }[];
  dores_desconfortos: string[];
}
```

#### Métricas de Evolução

- Peso corporal (gráfico temporal)
- Cargas por exercício (gráfico temporal)
- Volume semanal total (séries × repetições × carga)
- Frequência de treinos
- RPE médio
- Taxa de conclusão de treinos

#### Ajustes Automáticos

A IA deve:
- Adaptar programação baseada em feedback
- Registrar padrões de falha
- Sugerir correções técnicas
- Propor ajustes de carga
- Alertar sobre estagnação

---

### ETAPA 5: PAINEL ADMINISTRATIVO

#### Funcionalidades

1. **Gerenciamento de Usuários**
   - Criar/editar/excluir usuários
   - Visualizar perfis
   - Resetar senhas
   - Ativar/desativar contas

2. **Base de Conhecimento**
   - Upload de livros/PDFs
   - Gerenciar exercícios
   - Editar metadados
   - Validar conteúdo

3. **Relatórios**
   - Usuários ativos
   - Treinos gerados
   - Taxa de conclusão
   - Feedback geral

4. **Configurações**
   - Parâmetros de periodização
   - Limites do sistema
   - Configurações de IA

5. **Simulação**
   - Testar geração de treinos
   - Validar lógica antes de publicar

---

### ETAPA 6: SEGURANÇA E LOGIN

#### Requisitos de Segurança

1. **Autenticação**
   - Login com email/senha
   - Hash de senha (bcrypt/argon2)
   - Tokens JWT para sessão
   - Refresh tokens

2. **Autorização**
   - Roles: Admin, Usuário
   - Isolamento de dados entre usuários
   - Validação de permissões

3. **Proteção de Dados**
   - Criptografia de dados sensíveis
   - HTTPS obrigatório
   - Validação de inputs
   - Proteção contra SQL injection
   - Rate limiting

4. **Confirmações**
   - Alteração de peso/objetivos
   - Mudanças em rotinas
   - Exclusão de dados

---

### ETAPA 7: FRONTEND E UX

#### Design System

**Cores:**
- Primária: (A definir)
- Secundária: (A definir)
- Sucesso: Verde
- Aviso: Amarelo
- Erro: Vermelho
- Neutro: Cinza

**Tipografia:**
- Títulos: (A definir)
- Corpo: (A definir)
- Tamanhos: Mobile-first

**Componentes:**
- Botões
- Cards
- Formulários
- Modais
- Navegação
- Gráficos

#### Fluxo de Telas

```
Login
  ↓
Onboarding (primeiro acesso)
  ↓
Dashboard
  ↓
Treino do Dia
  ↓
Execução Exercício
  ↓
[Concluir] → Próximo Exercício
  ↓
Finalizar Treino
  ↓
Resumo do Treino
```

#### Princípios de UX

1. **Mobile-First**
   - Interface otimizada para celular
   - Touch-friendly
   - Navegação simples

2. **Clareza**
   - Mostrar apenas o necessário
   - Informações em destaque
   - Feedback imediato

3. **Eficiência**
   - Menos cliques possível
   - Ações rápidas
   - Navegação intuitiva

---

### ETAPA 8: COMPORTAMENTO DA IA

#### Regras de Comportamento

1. **Antes de Responder**
   - Verificar contexto completo
   - Validar dados disponíveis
   - Identificar inconsistências

2. **Durante a Resposta**
   - Explicar racional técnico
   - Ser objetivo e claro
   - Sugerir ajustes quando necessário

3. **Após a Resposta**
   - Registrar decisões tomadas
   - Manter histórico claro
   - Permitir feedback

#### Validações da IA

- ✅ Treinos equilibrados
- ✅ Volume adequado
- ✅ Progressão segura
- ✅ Respeito a limitações
- ✅ Tempo razoável (< 75 min)
- ❌ Evitar treinos perigosos
- ❌ Evitar desequilíbrios
- ❌ Evitar sobrecarga

---

### ETAPA 9: FORMATO DE RESPOSTA PADRÃO

#### Estrutura do Treino Gerado

```markdown
# TREINO DO DIA - [Data]

## Objetivo
[Objetivo específico do dia]

## Aquecimento
- [Atividade 1]
- [Atividade 2]

## Exercícios

### 1. [Nome do Exercício]
- Séries: X
- Repetições: Y
- Carga: Z kg
- RPE: W
- Descanso: T segundos
- [GIF/Imagem]
- **Dica técnica:** [Observação]

### 2. [Próximo exercício...]

## Tempo Estimado
XX minutos

## Dicas Finais
[Observações gerais]

## Próximo Treino
[Projeção do que virá]
```

---

### ETAPA 10: SUPOSIÇÕES E LIMITES

#### Suposições

1. Usuário tem acesso a academia equipada
2. Usuário tem conhecimento básico de execução
3. Usuário reporta dados honestamente
4. Sistema assume responsabilidade limitada

#### Limites

1. **Não inventar exercícios**
   - Apenas exercícios validados
   - Base em literatura científica

2. **Priorizar segurança**
   - Sempre sobre intensidade
   - Respeitar limitações físicas

3. **Ajustar volume**
   - Conforme experiência
   - Evitar sobrecarga

4. **Detectar fadiga**
   - Reduzir carga quando necessário
   - Sugerir descanso

5. **Evitar coincidências sem propósito**
   - Treinos com lógica clara
   - Periodização coerente

6. **Tempo máximo**
   - 75 minutos para maioria
   - Exceções justificadas

---

## 🔄 FLUXOS PRINCIPAIS

### Fluxo 1: Primeiro Acesso
```
1. Cadastro/Login
2. Onboarding (questionário)
3. Processamento de dados
4. Geração de perfil
5. Criação de primeira semana de treinos
6. Redirecionamento para dashboard
```

### Fluxo 2: Treino Diário
```
1. Acessar dashboard
2. Visualizar treino do dia
3. Iniciar treino
4. Para cada exercício:
   a. Ver instruções
   b. Ver GIF/imagem
   c. Executar
   d. Marcar como concluído
5. Finalizar treino
6. Ver resumo
```

### Fluxo 3: Atualização Semanal
```
1. Sistema solicita peso atual
2. Usuário informa peso
3. Sistema coleta feedback da semana
4. IA analisa progresso
5. IA ajusta treinos da próxima semana
6. Notificação de novos treinos
```

---

## 📊 MÉTRICAS E KPIs

### Métricas do Sistema
- Taxa de conclusão de treinos
- Tempo médio de treino
- Satisfação do usuário
- Evolução de peso/cargas
- Frequência de uso

### Métricas de IA
- Precisão das recomendações
- Taxa de ajustes necessários
- Satisfação com treinos gerados
- Progressão efetiva dos usuários

---

**Próxima Revisão:** Após definição da stack tecnológica

