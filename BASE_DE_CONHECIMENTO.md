# 🧠 BASE DE CONHECIMENTO - AthletIA

> **Documento Mestre** - Referência central para todo o desenvolvimento do sistema

**Última Atualização:** 2024-12-19  
**Versão:** 1.1.0  
**Status:** Sistema de Templates Implementado

---

## 📋 ÍNDICE

1. [Visão Geral do Projeto](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura)
3. [Fases de Desenvolvimento](#fases)
4. [Especificações Técnicas](#especificações)
5. [Regras de Negócio](#regras)
6. [Histórico de Implementações](#histórico)

> 📑 **Navegação:** Consulte [docs/INDICE.md](./docs/INDICE.md) para índice completo de toda documentação  
> 📚 **Conhecimento Especializado:** Consulte [docs/CONHECIMENTO_PDFS.md](./docs/CONHECIMENTO_PDFS.md) para conhecimento extraído dos PDFs

---

## 🎯 VISÃO GERAL DO PROJETO

### Nome do Sistema
**AthletIA** - Sistema Inteligente de Treinos Personalizados

### Objetivo Principal
Gerar treinos personalizados, adaptativos e cientificamente fundamentados para usuários, utilizando IA para criar rotinas baseadas em:
- Dados pessoais (peso, altura, objetivos)
- Histórico de treinos
- Evolução semanal
- Base de conhecimento especializada (livros, literatura científica)

### Funcionalidades Core
- ✅ Geração automática de treinos personalizados
- ✅ Interface responsiva para uso na academia
- ✅ Exibição de exercícios com GIFs/imagens
- ✅ Sistema de acompanhamento e evolução
- ✅ Painel administrativo multi-usuário
- ✅ Sistema de login e segurança
- ✅ Onboarding inicial com questionário
- ✅ Atualização semanal de peso e progresso

---

## 🏗️ ARQUITETURA DO SISTEMA

### Stack Tecnológico ✅
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript + Prisma
- **Banco de Dados:** PostgreSQL
- **IA/ML:** (A definir - OpenAI/LLM local)
- **Autenticação:** JWT + bcrypt + refresh tokens

### Estrutura de Diretórios
```
Academia_V1/
├── docs/                    # Documentação
│   ├── BASE_DE_CONHECIMENTO.md
│   ├── PROJETO_STATUS.md
│   ├── ESPECIFICACAO_TECNICA.md
│   └── fases/              # Documentação por fase
├── backend/                 # API e lógica de negócio
├── frontend/                # Interface do usuário
├── database/                # Scripts e schemas
├── ai/                      # Modelos e prompts de IA
└── tests/                   # Testes automatizados
```

---

## 📊 FASES DE DESENVOLVIMENTO

### **FASE 1: FUNDAÇÃO E PLANEJAMENTO** ✅
**Status:** Concluída  
**Data:** 2024-12-19

**O que foi feito:**
- Criação da base de conhecimento estruturada
- Definição da arquitetura inicial
- Estruturação das fases do projeto
- Documentação das especificações

**Próximos passos:**
- Definir stack tecnológico
- Criar estrutura de diretórios
- Configurar ambiente de desenvolvimento

---

### **FASE 2: ONBOARDING E PERFIL DO USUÁRIO** ✅
**Status:** Concluída  
**Data Início:** 2024-12-19  
**Data Conclusão:** 2024-12-19

**Objetivos:**
- ✅ Definir stack tecnológico completo
- ✅ Configurar ambiente de desenvolvimento (backend e frontend)
- ✅ Criar estrutura de banco de dados (Prisma schema)
- ✅ Implementar sistema de autenticação (JWT)
- ✅ Criar telas de login e registro
- ✅ Implementar questionário de onboarding
- ✅ Criar modelo de dados do perfil do usuário
- ✅ Validar informações coletadas
- ✅ Endpoints de perfil (GET, POST, PUT)

**Dados a Coletar:**
1. Idade
2. Sexo
3. Altura
4. Peso atual
5. Percentual de gordura (opcional)
6. Experiência (Iniciante/Intermediário/Avançado)
7. Objetivo primário (Emagrecimento/Hipertrofia/Força/Condicionamento)
8. Frequência semanal de treinos
9. Tempo disponível por dia
10. Lesões ou limitações
11. Equipamentos disponíveis
12. Preferências
13. Histórico de treinos anteriores
14. Nível de esforço preferido (RPE)

---

### **FASE 3: BASE DE CONHECIMENTO E IA** 🔄
**Status:** Em Progresso

**Objetivos:**
- ✅ Criar estrutura para armazenar conhecimento
- ✅ Implementar sistema de upload de livros/PDFs
- ✅ Extrair e processar conhecimento de PDFs
- ⏳ Normalizar dados de exercícios
- ⏳ Criar prompts para IA especializada
- ✅ Integrar literatura esportiva (2 PDFs processados)

**Conhecimento Integrado:**
- ✅ Terminologias e conceitos fundamentais
  - Hipertrofia (sarcoplasmática vs miofibrilar)
  - Vias energéticas (anaeróbia alática, anaeróbia lática, aeróbia)
  - Fibras musculares (Tipo I, Tipo IIA, Tipo IIB)
  - Neurônio motor e unidades motoras
  - Músculos agonistas, antagonistas e sinergistas
  - Fases do movimento (concêntrica, excêntrica, isométrica)
  - Repetição Máxima (RM) e Carga Máxima
  - RPE (Rate of Perceived Exertion)
  - Cadência, Intensidade, Potência
- ✅ Princípios básicos de progressão
  - Sobrecarga Progressiva
  - Especificidade
  - Individualidade
  - Reversibilidade
- ✅ Modelos de periodização
  - Linear (alto volume → alta intensidade)
  - Reversa (alta intensidade → alto volume)
  - Ondulatória (variações dentro do ciclo)
- ✅ Técnicas avançadas de treinamento
  - Drop-Set, Rest-Pause, Bi-Set, Tri-Set, Super-Set
  - Agonista-Antagonista
  - SST, FST-7, HIT, Heavy Duty
  - GVT, 8x8, 5x5, Cluster Set
  - Ponto Zero, Método 21
- ✅ Divisões de treino (A-B, A-B-C, A-B-C-D, A-B-C-D-E)
- ✅ Volume, intensidade e frequência
  - Volume mínimo: 10 séries/músculo/semana
  - Frequência mínima: 2x/semana por grupo muscular
  - Intensidade hipertrofia: 60-70% de 1RM até fadiga
- ✅ Recomendações específicas por nível de experiência
  - Iniciantes: Full Body / A-B, 2-3x/semana, sem técnicas avançadas
  - Intermediários: A-B-C, 3x/semana, técnicas básicas
  - Avançados: A-B-C-D / Push Pull Legs, 4-6x/semana, todas as técnicas

**Documentação:**
- `docs/CONHECIMENTO_PDFS.md` - Conhecimento estruturado extraído dos PDFs

**Conhecimento Detalhado - PDF "Musculação: Metodologias e Aplicabilidades":**

### Terminologias e Conceitos Fundamentais

#### Hipertrofia
- **Hipertrofia Sarcoplasmática:** "Pump" muscular, inchaço causado pelo aumento do fluxo sanguíneo durante o exercício
- **Hipertrofia Miofibrilar:** Processo real de crescimento muscular que acontece no descanso entre sessões
- O processo real ocorre a nível miofibrilar, no descanso entre as sessões de exercício
- Enfatiza importância de alimentação estruturada, periodização e boas noites de sono

#### Vias Energéticas
- **Anaeróbia Alática (ATP-CP):** Primeira via ativada, sem produção de lactato
- **Anaeróbia Lática (Glicólise):** Com produção de lactato
- **Aeróbia Oxidativa:** Produção mais lenta de energia, ativada posteriormente
- Musculação: predominância de vias anaeróbias, mas nunca 100% em uma única via
- Condição aeróbia do indivíduo está diretamente ligada à capacidade de produzir bons treinos

#### Fibras Musculares
- **Tipo I (Contração Lenta):** Característica oxidativa, menor diâmetro, contração mais lenta, maior vascularização, maior número de mitocôndrias, maior mioglobina (aspecto avermelhado)
- **Tipo IIA e IIB (Contração Rápida):** Via energética predominante glicolítica, maior diâmetro, velocidade de contração maior, menor quantidade de mitocôndrias, menor mioglobina (coloração mais clara)

#### Conceitos de Movimento
- **Músculo Agonista:** Principal responsável por produzir o movimento articular ou manter a postura
- **Músculo Antagonista:** Não resiste nem auxilia, apenas se alonga passivamente ou encurta durante o movimento
- **Músculo Sinergista:** Auxilia no movimento sem ser o principal responsável (ex: bíceps na remada baixa)
- **Fase Concêntrica:** Músculo encurtando ou contraindo (peso sendo levantado)
- **Fase Excêntrica:** Músculo desenvolvendo força enquanto se alonga de maneira controlada (peso sendo abaixado) - fase mais difícil de controlar
- **Movimento Isométrico:** Força desenvolvida sem movimento visível na articulação

#### Conceitos de Prescrição
- **Repetição Máxima (RM):** Número máximo de repetições por série com carga máxima até a fadiga
- **Carga Máxima:** Quantidade que um indivíduo consegue suportar em uma repetição completa
- **RPE (Rate of Perceived Exertion):** Método intuitivo e validado para definir carga de trabalho através da percepção subjetiva do esforço
- **Cadência:** Velocidade de execução dos movimentos - velocidade intermediária ideal para treinamento básico
- **Intensidade:** Relacionada à carga utilizada, percentual de 1RM. Mínima para hipertrofia: 60-70% de 1RM até fadiga voluntária
- **Potência:** Taxa de realização do trabalho (peso × distância vertical ÷ tempo)

### Princípios Básicos para Progressão

1. **Sobrecarga Progressiva:** Progressão de carga ao longo do treinamento para maximizar ganhos e evitar estagnação
2. **Especificidade:** Adaptações são específicas do tipo de treinamento (músculo, articulações, formas energéticas)
3. **Individualidade:** Corpo responde aos estímulos, não ao treinamento propriamente dito. Estímulos diferentes devem ser implantados
4. **Reversibilidade:** Lei do uso e desuso - perdas parciais quando treinamento é interrompido, mas recuperação é mais fácil

### Capacidades Físicas

- **Resistência:** Capacidade de resistir à fadiga em diferentes condições de tempo e intensidade
- **Velocidade:** Capacidade de realizar movimento em menor espaço de tempo (influenciada por técnica, coordenação, flexibilidade)
- **Técnica:** Conjunto de habilidades, procedimentos e conhecimentos para a prática
- **Flexibilidade:** Capacidade dos tecidos corporais de se esticar com ampla movimentação das articulações
- **Força:** Capacidade máxima de gerar tensão ou vencer uma resistência - variável mais determinante para resultados

### Modelos de Periodização

#### Periodização Linear
- Alto volume no início, baixa intensidade
- À medida que avança: volume diminui, intensidade aumenta gradualmente
- Mais próximo do que é executado inconscientemente pela maioria dos praticantes

#### Periodização Reversa
- Intensidade máxima e volume mais baixo no início
- À medida que avança: intensidade diminui, volume aumenta
- Eficiente para aumento da resistência muscular local

#### Periodização Ondulatória
- Permite variações de intensidade e volume dentro de um ciclo
- Pode usar exercícios com cargas pesadas, moderadas ou leves em rotação
- Exemplo: 3-5RM, 8-10RM e 12-15RM em rotação
- Apresentou respostas superiores ao modelo linear em estudos de 12+ semanas

### Volume de Treino

- **Cálculo:** Número total de repetições × quantidade de peso utilizada
- **Frequência Mínima:** 2x/semana por grupo muscular (evidenciado como superior a 1x/semana)
- **Volume Mínimo:** 10 séries por músculo por semana
- **Volume Ideal (Avançados):** 15-20 séries por músculo por semana
- **Estratégia:** Mesclar períodos de baixo e alto volume (ex: 10 séries → 20 séries ao longo de meses)
- **Redução:** Durante redução, queda de 65% é suficiente para manutenção dos ganhos
- **Ordem dos Exercícios:** Mesclar estímulos compostos e isolados, priorizando pontos principais

### Divisões de Treino

#### Alternado por Segmento
- Exercícios por segmento corporal (membros superiores, tronco, membros inferiores)
- Frequência: 2-3x/semana, intervalo de 24-48h entre sessões
- 8-12 exercícios, 2-3 séries de 10-12 repetições, esforços submáximos
- Pouco utilizado na prática, resultados pouco significativos

#### Divisão A-B
- **Dia A:** Membros superiores (peito, costas, ombros, braços)
- **Dia B:** Membros inferiores (quadríceps, posteriores, panturrilhas)
- Intervalo de 1-2 dias entre sessões
- Opção para iniciantes e avançados (com estrutura adequada)
- Poucos avançados utilizam devido à dificuldade de aplicar séries de alta carga/volume com tantos músculos

#### Divisão A-B-C
- Fortemente adotada por intermediários e avançados
- Maior flexibilidade para organização dos grupamentos
- Possível treinar 3x/semana com bons resultados
- Ênfase em exercícios multiarticulares, poucos monoarticulares
- Estruturas usuais:
  - A: Pernas | B: Peito, Ombro, Tríceps | C: Costas, Bíceps, Abdômen
  - Ou iniciar com Peito/Costas e terminar com Pernas

#### Divisão A-B-C-D / A-B-C-D-E
- Utilizada por praticantes avançados e atletas competitivos
- Necessita mais sessões por semana
- Permite maior fracionamento dos grupos musculares
- Possibilita aumento de carga e maior volume
- Prioriza trabalho em musculaturas mais fracas
- Aumenta tempo de recuperação entre sessões
- Exige treinos mais intensos, volumosos e experiência
- **NÃO indicada para iniciantes**
- Exemplos de estruturação:
  - A: Peito | B: Costas | C: Pernas | D: Ombros | E: Bíceps e Tríceps
  - A: Peito e Tríceps | B: Costas e Bíceps | C: Pernas | D: Ombros
  - A: Pernas | B: Costas e Bíceps | C: Peito e Tríceps | D: Pernas | E: Ombros

### Metodologias e Técnicas Avançadas

#### Séries com Múltiplas Cargas
- **Duas Cargas / Três Cargas:** Após falha, redução parcial de 50% da carga, mantendo mesmo número de repetições
- **Drop-Set:** Após falha, redução imediata de 20% da carga, repetindo até exaustão total
- Aumenta tempo sob tensão, favorece contração muscular
- Segura e eficiente para iniciantes (aumenta séries sem aumentar carga)
- Avançados podem incluir em mais exercícios/séries

#### Pirâmides
- **Crescente:** Aumento gradual da carga, diminuição de repetições
- **Decrescente:** Diminuição gradual da carga, aumento de repetições
- **Inversa:** Combinação dos dois sistemas
- Pirâmide crescente: prepara resposta neuromuscular para maiores esforços
- Pirâmide inversa: eficiente para levar músculo à exaustão

#### Séries Combinadas
- **Bi-Set:** Dois exercícios consecutivos, descanso após ambos
- **Tri-Set:** Três exercícios consecutivos, descanso após todos
- **Super-Set:** Mais de três exercícios consecutivos
- Útil para treinos rápidos, mas extremamente difícil de executar
- Preferencialmente para praticantes experientes
- Pode combinar exercícios de membros superiores e inferiores

#### Agonista-Antagonista
- Combina exercícios com características opostas de contração
- Um grupamento pode ser trabalhado mais vezes na semana
- Favorece trabalho eficiente em músculos mais fracos
- Boa alternativa para praticantes com pouca flexibilidade de horário
- Segura para iniciantes (musculatura alvo não é sinergista)

#### Metodologias Especializadas

**SST (Sarcoplasma Stimulating Training)**
- Desenvolvido por Patrick Tour
- Menos descanso, mais tempo de tensão
- Combina Rest-Pause, Drop-Set e outras técnicas
- Modo 1: 6-10 movimentos, descanso 45s → 30s → 15s → 5s, reduz carga 20%, repete
- Modo 2: 6-10 movimentos até falha, descanso 10s, até 1 repetição, reduz carga 20%
- Extremamente avançado, executar com cautela

**FST-7 (Fascial Stretch Training)**
- Desenvolvido por Hanny Rambod
- Foco no alongamento da fáscia muscular
- Aplicado no último exercício, última série do músculo-alvo
- 7 séries de 7 movimentos, intervalo de 30 segundos
- **NÃO indicado para iniciantes**
- Risco de lesões se aplicado com alto nível de intensidade

**HIT (High-Intensity Training)**
- Criado por Arthur Jones (anos 70)
- Treinos intensos, curtos e infrequentes
- Full-Body, sem intervalo entre séries
- Máximo 10 séries consecutivas
- Útil para iniciantes (com intervalo de descanso convencional)
- Avançados podem se beneficiar controlando intervalo entre treinos

**Heavy Duty**
- Sistema baseado em pouco volume e alta intensidade
- Criado por Mike Mentzer (anos 90)
- Objetivo: levar músculo ao extremo estado de exaustão
- Intervalo significativo para recuperação (até 5 dias entre grupamentos)
- Utiliza Bi-Set, Tri-Set, Super-Set
- Séries podem durar 2-3 minutos consecutivos
- **NÃO indicado para iniciantes**

**Técnicas Heavy Duty:**
- **Omni Contraction:** Falha nas três fases (concêntrica, isométrica, excêntrica) - 4-6s por fase
- **Super Slow:** 10s concêntrica, 5-10s excêntrica
- **Infitonic-Set:** Resistência na fase excêntrica com auxílio de parceiro
- **Pré-Alongamento:** Alongamento específico pré-série (muito debatido)
- **Pré-Exaustão:** Exercício isolado antes de exercício composto
- **Static-Contraction:** Travar carga na fase isométrica
- **Repetição Forçada:** 3-5 repetições forçadas após falha concêntrica
- **Rest-Pause:** Séries até falha, descanso 5-10s, repetir até não conseguir mais repetições
- **X-Rep (Repetição Parcial):** Repetições parciais após falha completa

**Métodos de Volume:**
- **GVT (German Volume Training):** 10 séries de 10 repetições, mesma carga, 50-60% de 1RM
- **8x8 (Vince Gironda):** 8 séries de 8 repetições, mesma carga, descanso 15s-1min, treinar 2x/semana, repouso 72h
- **5x5 (Stronglift):** 5 exercícios, 5 séries, exercícios compostos (Agachamento, Supino, Levantamento Terra, Desenvolvimento, Remada), 3 treinos semanais
- **Cluster Set:** Mini séries de 3-4 repetições, carga 80-90% de 1RM, descanso 10-30s entre mini séries

**Técnicas Brasileiras:**
- **Ponto Zero (Fernando Sardinha):** Pausa de 3-5s ao término da fase excêntrica (isométrica), após executa fase concêntrica. Prioriza fase excêntrica e isométrica
- **Método 21 (Rosca 21):** 21 repetições distribuídas: 7 repetições parcial inferior (até 45°), 7 repetições parcial superior (até 90°), 7 repetições completas. Aumenta tempo sob tensão

**Estrutura de Exercícios:**
- Nome
- Grupo muscular principal
- Sinergistas
- Descrição
- Execução técnica
- Erros comuns
- Imagens/GIFs
- Recomendações de carga inicial
- RPE sugerido
- Alternativas equivalentes

---

### **FASE 4: LÓGICA DE GERAÇÃO DE TREINOS** ✅
**Status:** Concluída  
**Data Início:** 2024-12-19  
**Data Conclusão:** 2024-12-19

**Objetivos:**
- ✅ Implementar algoritmos de periodização
- ✅ Criar sistema de distribuição semanal
- ✅ Modelo de dados de exercícios
- ✅ Seed de exercícios básicos (14 exercícios)
- ✅ Endpoints de geração de treinos
- ✅ Interface de treino do dia
- ✅ Sistema de conclusão de exercícios
- ✅ Desenvolver lógica de progressão automática baseada em RPE
- ✅ Sistema de alternativas de exercícios
- ✅ Histórico de treinos
- ✅ Estatísticas de progresso
- ✅ Validação avançada de treinos gerados

**Princípios Implementados:**
- ✅ Distribuição semanal compatível com objetivo
- ✅ Cálculo de carga inicial baseado em peso e experiência
- ✅ Séries e repetições por objetivo
- ✅ Tempo estimado de treino
- ✅ RPE e descanso adequados
- ✅ Filtro por nível de dificuldade
- ✅ Progressão automática semanal baseada em RPE (+5-10% carga se RPE < 7)
- ✅ Alternativas biomecânicas equivalentes
- ✅ Histórico de treinos e estatísticas
- ✅ Cálculo de progressão por grupo muscular

---

### **FASE 5: INTERFACE DO USUÁRIO** 🔄
**Status:** Em Progresso  
**Data Início:** 2024-12-19

**Objetivos:**
- ✅ Implementar telas principais
- ✅ Sistema mobile-first responsivo (parcial)
- ✅ Integração com GIFs/imagens (estrutura pronta)
- ✅ Fluxo de execução de treino
- ⏳ Criar design system completo
- ⏳ Melhorias de UX

**Telas Implementadas:**
- ✅ Login
- ✅ Registro
- ✅ Onboarding (4 passos)
- ✅ Dashboard diário
- ✅ Treino do dia
- ✅ Histórico de treinos
- ✅ Estatísticas e progresso
- ✅ Perfil e configurações
- ✅ Evolução de peso
- ✅ Registro semanal de peso

---

### **FASE 6: ACOMPANHAMENTO E EVOLUÇÃO** ✅
**Status:** Concluída  
**Data Início:** 2024-12-19  
**Data Conclusão:** 2024-12-19

**Objetivos:**
- ✅ Histórico de treinos (backend + frontend)
- ✅ Estatísticas de progresso (backend + frontend)
- ✅ Análise de progresso (volume, RPE, frequência, progressão por grupo)
- ✅ Cálculo de progressão automática
- ✅ Sistema de registro semanal de peso (backend + frontend)
- ✅ Gráficos de evolução de peso (visualização)
- ✅ Histórico completo de peso com estatísticas
- ✅ Ajustes automáticos de treino baseados em análise
- ✅ Feedback visual e correções

---

### **FASE 7: PAINEL ADMINISTRATIVO** 🔄
**Status:** Planejada

**Objetivos:**
- CRUD de usuários
- Gerenciamento de base de conhecimento
- Relatórios e analytics
- Configurações do sistema
- Simulação de treinos

---

### **FASE 8: SEGURANÇA E DEPLOY** 🔄
**Status:** Planejada

**Objetivos:**
- Implementar autenticação robusta
- Criptografia de dados sensíveis
- Testes de segurança
- Deploy e configuração de produção
- Monitoramento e logs

---

## 📐 ESPECIFICAÇÕES TÉCNICAS

### Modelo de Dados (Conceitual)

#### **Usuário**
```json
{
  "id": "uuid",
  "email": "string",
  "senha_hash": "string",
  "perfil": {
    "idade": "number",
    "sexo": "string",
    "altura": "number",
    "peso_atual": "number",
    "percentual_gordura": "number?",
    "experiencia": "string",
    "objetivo": "string",
    "frequencia_semanal": "number",
    "tempo_disponivel": "number",
    "lesoes": "array",
    "equipamentos": "array",
    "preferencias": "array",
    "rpe_preferido": "number"
  },
  "historico_pesos": [
    {
      "data": "date",
      "peso": "number"
    }
  ],
  "treinos_concluidos": "array",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### **Treino**
```json
{
  "id": "uuid",
  "usuario_id": "uuid",
  "data": "date",
  "tipo": "string",
  "exercicios": [
    {
      "exercicio_id": "uuid",
      "series": "number",
      "repeticoes": "number",
      "carga": "number",
      "rpe": "number",
      "descanso": "number",
      "concluido": "boolean",
      "observacoes": "string"
    }
  ],
  "tempo_estimado": "number",
  "concluido": "boolean"
}
```

#### **Exercício**
```json
{
  "id": "uuid",
  "nome": "string",
  "grupo_muscular_principal": "string",
  "sinergistas": "array",
  "descricao": "string",
  "execucao_tecnica": "string",
  "erros_comuns": "array",
  "imagem_url": "string",
  "gif_url": "string",
  "carga_inicial_sugerida": "number",
  "rpe_sugerido": "number",
  "alternativas": "array"
}
```

---

## 🔒 REGRAS DE NEGÓCIO

### Geração de Treinos
1. **Distribuição Semanal:**
   - **Iniciantes:** Full Body / A-B (Upper/Lower) - 2-3x/semana
   - **Intermediários:** A-B-C - 3x/semana
   - **Avançados:** A-B-C-D / Push Pull Legs - 4-6x/semana
   - **Hipertrofia:** ABC / ABCD / Push Pull Legs
   - **Emagrecimento:** Full body / Upper Lower / HIIT + Resistido
   - **Força:** Baixa variação, progressão linear (5x5, GVT)

2. **Progressão Automática:**
   - **RPE < 7 (Fácil):** +5 a 10% carga
   - **RPE 7-8 (Médio):** Manter carga
   - **RPE 9-10 (Difícil):** Reduzir 5% ou manter
   - **Lesão/dor:** Substituir exercício

3. **Volume e Frequência:**
   - **Mínimo:** 10 séries por músculo/semana
   - **Ideal:** 15-20 séries por músculo/semana (avancados)
   - **Frequência:** Mínimo 2x/semana por grupo muscular
   - **Intensidade Hipertrofia:** 60-70% de 1RM até fadiga voluntária

4. **Validações:**
   - Tempo máximo: 75 minutos
   - Volume adequado ao nível de experiência
   - Equilíbrio entre grupos musculares
   - Respeitar limitações físicas
   - Iniciantes: SEM técnicas avançadas
   - Técnica sempre precede carga

5. **Técnicas Avançadas:**
   - Apenas para intermediários/avancados
   - Aplicar apenas quando necessário (quebrar estagnação)
   - Sempre com critérios claros
   - Ver `docs/CONHECIMENTO_PDFS.md` para detalhes completos

### Segurança
- Dados sensíveis criptografados
- Isolamento de dados entre usuários
- Autenticação obrigatória
- Confirmação para alterações críticas

---

## 📝 HISTÓRICO DE IMPLEMENTAÇÕES

### 2024-12-19 - Fase 1: Fundação e Planejamento
- ✅ Criação da base de conhecimento inicial (`BASE_DE_CONHECIMENTO.md`)
- ✅ Estruturação das fases do projeto (8 fases definidas)
- ✅ Definição da arquitetura conceitual
- ✅ Documentação das especificações técnicas completas (`docs/ESPECIFICACAO_TECNICA.md`)
- ✅ Criação do sistema de acompanhamento (`PROJETO_STATUS.md`)
- ✅ Estrutura de diretórios criada (backend, frontend, database, ai, tests, docs)
- ✅ Guia rápido de referência (`docs/GUIA_RAPIDO.md`)
- ✅ Sistema de registro de decisões técnicas (`docs/DECISOES_TECNICAS.md`)
- ✅ Documentação da Fase 1 (`docs/fases/FASE_01_FUNDACAO.md`)
- ✅ Template para documentação de fases (`docs/fases/TEMPLATE_FASE.md`)
- ✅ Índice completo de documentação (`docs/INDICE.md`)
- ✅ README.md principal do projeto
- ✅ Arquivo .gitignore configurado

### 2024-12-19 - Fase 2: Onboarding e Perfil do Usuário
- ✅ Definição completa do stack tecnológico
  - Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL
  - Frontend: React + TypeScript + Vite + Tailwind CSS
  - Autenticação: JWT + bcrypt + refresh tokens
- ✅ Configuração do ambiente backend
  - Estrutura de projeto criada
  - Dependências instaladas
  - TypeScript configurado
  - Prisma schema criado
- ✅ Sistema de autenticação implementado
  - Endpoints: /register, /login, /refresh
  - Middleware de autenticação
  - Validação de dados
  - Hash de senhas com bcrypt
- ✅ Interface de login e registro
  - Tela de login responsiva
  - Tela de registro
  - Context API para gerenciamento de estado
  - Integração com backend
  - Rotas protegidas
- ✅ Sistema de onboarding completo
  - Endpoints de perfil: GET, POST, PUT /api/perfil
  - Tela de onboarding com 4 passos
  - Validação completa de dados
  - Coleta de todos os dados necessários:
    - Dados básicos (idade, sexo, altura, peso)
    - Experiência e objetivos
    - Limitações e preferências
  - Dashboard verifica se perfil está completo
  - Redirecionamento automático após registro
- ✅ Documentação técnica atualizada
  - Decisões técnicas documentadas (DEC-004, DEC-005, DEC-006)
  - READMEs criados para backend e frontend

### 2024-12-19 - Finalização do Sistema
- ✅ Registro semanal de peso
  - Endpoint POST /api/peso para registrar peso
  - Endpoint GET /api/peso/historico para histórico
  - Atualização automática do peso no perfil
  - Tela de evolução de peso com gráficos
- ✅ Tela de perfil e configurações
  - Visualização completa do perfil
  - Edição de informações pessoais
  - Registro de peso integrado
  - Visualização de configurações de treino
- ✅ Validação avançada de treinos
  - Validação de número de exercícios
  - Verificação de grupos musculares repetidos
  - Validação de nível de dificuldade
  - Verificação de equipamentos disponíveis
  - Sugestões baseadas em objetivo
- ✅ Componentes reutilizáveis
  - Componente Loading
  - Componente Toast (notificações)
  - Design system básico com classes utilitárias
- ✅ Gráficos de evolução
  - Gráfico de barras para evolução de peso
  - Estatísticas detalhadas (primeiro, último, média, variação)
  - Histórico completo com comparações
- ✅ Dashboard melhorado
  - 4 cards de acesso rápido
  - Navegação facilitada para todas as funcionalidades

### 2024-12-19 - Fase 5 e 6: Interface e Acompanhamento (Início)
- ✅ Tela de histórico de treinos
  - Visualização dos últimos 30 treinos
  - Detalhes de cada treino (exercícios, volume, status)
  - Formatação de datas e informações
- ✅ Tela de estatísticas e progresso
  - Cards de resumo (treinos, exercícios, volume, RPE médio)
  - Frequência semanal com barra de progresso
  - Progressão por grupo muscular com indicadores visuais
  - Filtro de período (7, 15, 30, 60, 90 dias)
- ✅ Dashboard melhorado
  - Cards de acesso rápido para histórico e estatísticas
  - Layout mais organizado e informativo
  - Navegação facilitada
- ✅ Integração completa frontend-backend
  - Endpoints de histórico e estatísticas integrados
  - Tratamento de erros e estados de loading
  - Experiência de usuário fluida

### 2024-12-19 - Fase 4: Lógica de Geração de Treinos (Início)
- ✅ Modelo de dados de exercícios criado
  - Modelo Exercicio no Prisma schema
  - Relacionamento com ExercicioTreino
  - Campos completos (nome, grupo muscular, sinergistas, descrição, execução técnica, erros comuns, etc.)
- ✅ Seed de exercícios básicos
  - 14 exercícios cadastrados
  - Cobertura de todos os grupos musculares principais
  - Níveis de dificuldade variados
- ✅ Lógica de periodização implementada
  - 6 tipos de divisão de treino (Full Body, A-B, A-B-C, A-B-C-D, A-B-C-D-E, Push Pull Legs)
  - Determinação automática baseada em experiência e frequência
  - Cálculo de grupos musculares do dia
  - Cálculo de séries, repetições, RPE e descanso por objetivo
  - Cálculo de carga inicial baseado em peso e experiência
  - Cálculo de tempo estimado
- ✅ Sistema de geração de treinos
  - Endpoint POST /api/treino/gerar
  - Endpoint GET /api/treino/dia
  - Endpoint POST /api/treino/exercicio/:id/concluir
  - Busca inteligente de exercícios
  - Filtro por nível de dificuldade
  - Limitação por tempo disponível
- ✅ Interface de treino do dia
  - Tela completa de treino
  - Visualização de exercícios com detalhes
  - Sistema de conclusão
  - Barra de progresso
  - Navegação entre exercícios
  - Integração com dashboard

### 2024-12-19 - Fase 3: Base de Conhecimento (Início)
- ✅ Criação de scripts para extração de PDFs (`ai/extrair_pdfs.py`, `ai/processar_conhecimento.py`)
- ✅ Extração de conteúdo de 2 PDFs especializados (209 páginas totais)
  - E-book-de-Musculacao-Tiagonutri.pdf (118 páginas)
  - periodizacao-e-tecnicas-avancadas.pdf (91 páginas)
- ✅ Processamento e estruturação do conhecimento extraído
- ✅ Criação de documento completo de conhecimento (`docs/CONHECIMENTO_PDFS.md`)
- ✅ Integração de terminologias, princípios, técnicas e metodologias
- ✅ Documentação de 12+ técnicas avançadas de treinamento
- ✅ Modelos de periodização (Linear, Reversa, Ondulatória)
- ✅ Divisões de treino detalhadas (A-B, A-B-C, A-B-C-D, etc.)
- ✅ Recomendações específicas por nível de experiência
- ✅ Princípios de volume, intensidade e frequência

### 2024-12-19 - Integração do Livro "Anatomia da Musculação" (Nick Evans)
- ✅ Adicionado conhecimento anatômico detalhado de todos os grupos musculares
- ✅ Anatomia dos Ombros:
  - **Deltóide:** Três seções (anterior, lateral, posterior) com funções específicas
  - **Manguito Rotador:** Quatro músculos (supra-espinal, infra-espinal, redondo menor, subescapular) essenciais para estabilidade
  - **Movimentos:** Flexão, extensão, abdução, adução, rotação interna e externa
- ✅ Anatomia do Tórax:
  - **Peitoral Maior:** Duas cabeças (clavicular superior, esternal inferior) com três seções funcionais (superior, média, inferior)
  - **Serrátil Anterior:** Estabilização da escápula, visível sob a margem externa do peitoral
  - **Peitoral Menor:** Músculo profundo, função menor
- ✅ Anatomia das Costas:
  - **Parte Superior:** Trapézio (fibras superiores, médias, inferiores), levantador da escápula, rombóides
  - **Parte Média:** Latíssimo do dorso (origem ampla, inserção no úmero)
  - **Parte Inferior:** Eretores da espinha (iliocostal, longuíssimo, espinhal) - pilares da força lombar
- ✅ Anatomia dos Braços:
  - **Bíceps:** Duas cabeças (curta e longa), função de flexão e supinação
  - **Braquial e Braquiorradial:** Flexores auxiliares do cotovelo
  - **Tríceps:** Três cabeças (longa, lateral, medial) - único extensor do cotovelo
  - **Antebraços:** ~20 músculos divididos em flexores e extensores
- ✅ Anatomia das Pernas:
  - **Quadríceps:** Quatro cabeças (reto femoral, vasto medial, vasto lateral, vasto intermédio)
  - **Posteriores da Coxa:** Três músculos (bíceps femoral, semimembranáceo, semitendíneo)
  - **Glúteos:** Glúteo máximo (extensão do quadril), médio e mínimo (abdução)
  - **Panturrilhas:** Gastrocnêmio (duas cabeças) e solear (profundo)
- ✅ Anatomia dos Abdominais:
  - **Parede Frontal:** Reto do abdome (abs) dividido pela linea alba
  - **Parede Lateral:** Três camadas (oblíquo externo, oblíquo interno, transverso)
  - **Serrátil Anterior:** Parte da parede lateral do tórax
- ✅ Técnicas de Enfoque Anatômico:
  - **Pegada:** Pronada, supinada, neutra - afeta recrutamento muscular
  - **Trajetória:** Determina quais fibras são enfatizadas
  - **Amplitude de Movimento:** Maximiza alongamento e contração
  - **Posição do Corpo:** Inclinação, rotação, estabilização
  - **Espaçamento das Mãos/Pés:** Afeta distribuição do esforço
- ✅ Exercícios expandidos na base de dados (100+ exercícios detalhados)

### 2024-12-19 - Estruturação de Base de Treinos Pré-Estruturados
- ✅ Criação do modelo `TreinoTemplate` no banco de dados
  - Armazena treinos pré-estruturados baseados em objetivos, nível e frequência
  - Campos: objetivo, nívelExperiencia, frequenciaSemanal, divisaoTreino, gruposMusculares
  - Suporta múltiplos templates para diferentes combinações
- ✅ Criação do modelo `TreinoTemplateExercicio`
  - Relaciona exercícios aos templates com séries, repetições, RPE, descanso
  - Campo `obrigatorio` permite flexibilidade na substituição de exercícios
- ✅ Estruturação de treinos por objetivo:
  - **Hipertrofia:** Volume médio-alto (12-20 séries/semana), 8-12 repetições, RPE 7-8
  - **Força:** Volume baixo-médio (8-15 séries/semana), 1-6 repetições, RPE 8-9
  - **Resistência:** Volume alto (15-25 séries/semana), 12-20 repetições, RPE 6-7
  - **Emagrecimento:** Volume médio-alto com circuito, 10-15 repetições, RPE 7-8
  - **Condicionamento:** Volume médio com exercícios funcionais, 8-15 repetições, RPE 6-7
- ✅ Estruturação por nível de experiência:
  - **Iniciante:** Full Body ou A-B, exercícios básicos, volume conservador
  - **Intermediário:** A-B-C, mix de compostos e isolados, volume moderado
  - **Avançado:** A-B-C-D ou Push Pull Legs, técnicas avançadas, volume alto
- ✅ Estruturação por frequência semanal:
  - **2x/semana:** Full Body completo
  - **3x/semana:** A-B-C ou Full Body alternado
  - **4x/semana:** A-B-C-D ou Push Pull Legs
  - **5-6x/semana:** Divisões específicas por grupo muscular
- ✅ Lógica de seleção de templates:
  - Sistema seleciona template mais adequado baseado em perfil do usuário
  - Adapta exercícios considerando lesões e equipamentos disponíveis
  - Substitui exercícios quando necessário usando campo `alternativas`
  - Ajusta carga baseada em peso e experiência do usuário
- ✅ Estruturação de templates por objetivo:
  - **Hipertrofia Iniciante 2x:** Full Body completo, 8 exercícios, 16 séries totais, 60min
  - **Hipertrofia Iniciante 3x:** Divisão A-B (Superiores/Inferiores), 5 exercícios por dia, 18 séries
  - **Hipertrofia Intermediário 3x:** Divisão A-B-C (Pernas/Push/Pull), 6-7 exercícios por dia, 20 séries
  - **Força Intermediário 3x:** Método 5x5, 3 exercícios compostos, 15 séries, 60min
  - **Emagrecimento Iniciante 3x:** Full Body Circuito, 6 exercícios, 18 séries, 45min, descanso 30s
- ✅ Sistema de fallback:
  - Se template não encontrado, usa método de geração dinâmica
  - Garante que sempre haverá treino disponível para o usuário
- ✅ Serviço de templates criado (`template.service.ts`):
  - `buscarTemplateAdequado()`: Encontra template baseado em objetivo/nível/frequência
  - `adaptarTemplate()`: Adapta exercícios considerando lesões e equipamentos
  - `calcularCargaInicial()`: Calcula carga baseada em peso e experiência
  - `criarTreinoDoTemplate()`: Cria treino final a partir do template adaptado
- ✅ Geração semanal completa implementada:
  - `gerarTreinos30Dias()` refatorada para usar templates exclusivamente
  - Sistema cruza objetivos do usuário com templates cadastrados na base
  - Distribuição inteligente de treinos ao longo da semana:
    - **Full Body:** Mesmo template para todos os dias
    - **A-B:** Alterna entre Superiores (A) e Inferiores (B)
    - **A-B-C:** Cicla entre Pernas (A), Push (B) e Pull (C)
  - Geração de 4 semanas completas (30 dias) baseada na frequência semanal
  - Sistema de fallback: se não encontrar templates, usa método dinâmico
  - Logs detalhados para rastreamento da geração
- ✅ Geração automática de treinos:
  - Endpoint `/treino/semana` gera treinos automaticamente se não houver nenhum
  - Validação de treinos sem exercícios e regeneração automática
  - Garantia de que todos os treinos têm exercícios associados
  - Frontend exibe lista semanal completa com todos os treinos e exercícios
- ✅ Interface de treinos semanais:
  - Lista visual de todos os treinos da semana
  - Cards informativos com progresso, tipo e tempo estimado
  - Clique em qualquer treino para ver detalhes e executar
  - Validação e tratamento de treinos sem exercícios

### 2024-12-19 - Expansão da Base de Conhecimento
- ✅ Integração completa do conhecimento do PDF "Musculação: Metodologias e Aplicabilidades"
- ✅ Adicionados conceitos fundamentais:
  - **Terminologias:** Hipertrofia (sarcoplasmática vs miofibrilar), Vias Energéticas (anaeróbia alática, anaeróbia lática, aeróbia), Fibras Musculares (Tipo I, Tipo IIA, Tipo IIB), Neurônio Motor, Músculos Agonistas/Antagonistas/Sinergistas, Fases do Movimento (Concêntrica, Excêntrica, Isométrica)
  - **Princípios Básicos:** Sobrecarga Progressiva, Especificidade, Individualidade, Reversibilidade
  - **Capacidades Físicas:** Resistência, Velocidade, Técnica, Flexibilidade, Força
  - **Periodização:** Modelos Linear, Reversa e Ondulatória detalhados
  - **Volume de Treino:** Cálculo, frequência mínima (2x/semana por grupo), distribuição semanal
  - **Divisões de Treino:** Alternado por Segmento, A-B, A-B-C, A-B-C-D, A-B-C-D-E
- ✅ Metodologias Avançadas Documentadas:
  - **Séries com Múltiplas Cargas:** Duas Cargas, Três Cargas, Drop-Set
  - **Pirâmides:** Crescente, Decrescente, Inversa
  - **Séries Combinadas:** Bi-Set, Tri-Set, Super-Set, Agonista-Antagonista
  - **Metodologias Especializadas:** SST (Sarcoplasma Stimulating Training), FST-7 (Fascial Stretch Training), HIT (High-Intensity Training), Heavy Duty
  - **Técnicas Heavy Duty:** Omni Contraction, Super Slow, Infitonic-Set, Pré-Alongamento, Pré-Exaustão, Static-Contraction, Repetição Forçada, Rest-Pause, X-Rep (Repetição Parcial)
  - **Métodos de Volume:** GVT (German Volume Training), 8x8 (Vince Gironda), 5x5 (Stronglift), Cluster Set
  - **Técnicas Brasileiras:** Ponto Zero (Fernando Sardinha), Método 21
- ✅ Exercícios expandidos na base de dados (30+ exercícios adicionais)

---

## 🔄 COMO USAR ESTA BASE

1. **Antes de implementar qualquer funcionalidade:**
   - Consulte este documento
   - Verifique a fase correspondente
   - Revise o histórico de implementações
   - Atualize após concluir

2. **Ao concluir uma tarefa:**
   - Marque como concluída na fase correspondente
   - Adicione entrada no histórico
   - Atualize status do projeto

3. **Ao fazer mudanças:**
   - Documente a mudança
   - Atualize a data de modificação
   - Mantenha o histórico limpo

---

**Próxima Revisão:** Após implementação da Fase 2

