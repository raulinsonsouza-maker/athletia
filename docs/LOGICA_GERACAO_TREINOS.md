# 📋 Lógica de Geração de Treinos - Documentação Completa

## 🎯 Sistema Único e Centralizado

**Arquivo:** `backend/src/services/treino-engine.service.ts`

Toda a lógica de geração de treinos está centralizada neste arquivo único.

---

## 🔄 Fluxo de Geração

### 1. **Entrada: Frequência Semanal do Onboarding**

O sistema usa **APENAS** a frequência semanal para determinar:
- Quantos treinos gerar (A, B, C, D, E, F)
- Quais grupos musculares usar em cada treino
- Distribuição dos exercícios

**Mapeamento:**
- 3 dias → Treinos A, B, C
- 4 dias → Treinos A, B, C, D
- 5 dias → Treinos A, B, C, D, E
- 6 dias → Treinos A, B, C, D, E, F

### 2. **Grupos Musculares por Split**

Os grupos são definidos **exclusivamente** pelo `SPLITS_GRUPOS` baseado na frequência:

```typescript
// Exemplo: 3 dias/semana
Treino A (índice 0): ['Peito', 'Ombros', 'Tríceps']
Treino B (índice 1): ['Costas', 'Bíceps', 'Posteriores']
Treino C (índice 2): ['Quadríceps', 'Glúteos', 'Panturrilhas', 'Abdômen']

// Exemplo: 5 dias/semana
Treino A (índice 0): ['Peito', 'Tríceps']
Treino B (índice 1): ['Costas', 'Bíceps']
Treino C (índice 2): ['Quadríceps', 'Glúteos']
Treino D (índice 3): ['Posteriores', 'Panturrilhas']
Treino E (índice 4): ['Ombros', 'Abdômen']
```

**IMPORTANTE:** Não há mais forçar grupos por letra. O sistema usa apenas o split.

### 3. **Distribuição de Exercícios**

A função `determinarExerciciosPorGrupo()` distribui exercícios de forma equilibrada:

- Calcula quantos exercícios por grupo baseado no total permitido pelo tempo
- Garante mínimo de 1 exercício por grupo
- Distribui o resto de forma equilibrada

**Exemplo:** Se temos 6 exercícios para 3 grupos:
- Grupo 1: 2 exercícios
- Grupo 2: 2 exercícios  
- Grupo 3: 2 exercícios

### 4. **Estrutura Fixa de Cada Treino**

**SEMPRE nesta ordem:**

1. **Cardio primeiro (ordem 0)**
   - Tempo variável baseado em objetivo:
     - Emagrecimento: 30 min
     - Hipertrofia: 15 min
     - Força: 5 min

2. **Exercícios de força (ordem 1, 2, 3...)**
   - Quantidade limitada pelo tempo disponível
   - Mínimo garantido: 4 exercícios (ou quantidade de grupos, o que for maior)

3. **Alongamento por último (ordem final)**
   - Tempo variável:
     - Emagrecimento: 5 min
     - Hipertrofia: 7 min
     - Força: 5 min

### 5. **Cálculo de Tempo**

**Fórmula:**
```
Tempo Total = Cardio + (Exercícios × Tempo por Exercício) + Alongamento
```

**Tempo por exercício:**
- Considera séries, descanso entre séries e tempo de transição
- Variável baseado em objetivo e experiência

**Limitação por tempo disponível:**
- Calcula máximo de exercícios permitidos
- **MAS garante mínimo necessário** mesmo se tempo não permitir
- Se usuário tem 30 min e precisa de 4 exercícios, garante os 4

### 6. **Busca de Exercícios com Fallback**

A função `buscarExerciciosComFallback()` tenta em ordem:

1. **Grupo muscular principal** (filtrado por evitados)
2. **Sinergistas** (se não encontrou suficiente)
3. **Qualquer do grupo** (sem filtro de evitados, último recurso)

Isso garante que sempre encontra exercícios, mesmo com banco limitado.

### 7. **Evitar Repetição**

- Busca histórico dos últimos 14 dias
- Inclui cardio e alongamento no histórico
- Adiciona exercícios selecionados ao `exerciciosEvitar` durante geração
- Geração sequencial (não paralela) para evitar problemas de concorrência

---

## ✅ Correções Aplicadas

### Problema 1: Sistema Duplo (SPLITS × Letra)
**Solução:** Removida função `garantirGruposCorretosPorTipo()`. Agora usa apenas `SPLITS_GRUPOS`.

### Problema 2: Tempo Fixo
**Solução:** Função `obterConfiguracaoTempo()` retorna tempo variável baseado em objetivo.

### Problema 3: Falta de Fallback
**Solução:** `buscarExerciciosComFallback()` tem 3 níveis de fallback.

### Problema 4: Concorrência
**Solução:** Geração sequencial (um treino por vez) e `exerciciosEvitar` compartilhado.

### Problema 5: Mínimo de Exercícios
**Solução:** Função `calcularMinimoExercicios()` garante mínimo mesmo com pouco tempo.

### Problema 6: Histórico Incompleto
**Solução:** `buscarHistoricoExercicios()` inclui todos os exercícios (cardio, força, alongamento).

---

## 📊 Exemplo Prático

**Usuário:**
- Frequência: 5 dias/semana
- Objetivo: Hipertrofia
- Tempo disponível: 60 min
- Experiência: Intermediário

**Geração:**

1. **Treino A** (Segunda):
   - Grupos: ['Peito', 'Tríceps']
   - Mínimo: 4 exercícios
   - Máximo permitido: ~6 exercícios
   - Distribuição: Peito (3) + Tríceps (3) = 6 exercícios
   - Cardio: 15 min
   - Alongamento: 7 min
   - **Total: 8 exercícios (1 cardio + 6 força + 1 alongamento)**

2. **Treino B** (Terça):
   - Grupos: ['Costas', 'Bíceps']
   - Similar ao Treino A

3. **Treino C** (Quarta):
   - Grupos: ['Quadríceps', 'Glúteos']
   - Similar

4. **Treino D** (Quinta):
   - Grupos: ['Posteriores', 'Panturrilhas']
   - Similar

5. **Treino E** (Sexta):
   - Grupos: ['Ombros', 'Abdômen']
   - Similar

---

## 🎯 Garantias do Sistema

1. ✅ **Sempre gera treino completo** (mínimo 4 exercícios de força)
2. ✅ **Cardio sempre primeiro** (tempo variável)
3. ✅ **Alongamento sempre por último** (tempo variável)
4. ✅ **Respeita tempo disponível** (mas garante mínimo)
5. ✅ **Evita repetição** (histórico de 14 dias)
6. ✅ **Sistema único** (não há conflito entre split e letra)
7. ✅ **Fallback inteligente** (sempre encontra exercícios)

---

## 🔍 Debug e Logs

O sistema gera logs detalhados:
- Frequência e objetivo do usuário
- Grupos selecionados para cada treino
- Quantidade de exercícios por grupo
- Tempo disponível vs tempo estimado
- Avisos quando não encontra exercícios suficientes

---

## 📝 Notas Importantes

1. **Não há mais forçar grupos por letra** - O sistema usa apenas o split baseado em frequência
2. **Tempo é variável** - Cardio e alongamento variam por objetivo
3. **Mínimo garantido** - Mesmo com pouco tempo, garante treino completo
4. **Fallback robusto** - Sempre encontra exercícios, mesmo com banco limitado
5. **Geração sequencial** - Evita problemas de concorrência

