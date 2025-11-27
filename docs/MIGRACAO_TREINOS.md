# 🔄 Migração de Treinos para Motor Centralizado

Este documento explica como aplicar o novo motor centralizado (`treino-engine.service.ts`) em todos os treinos existentes na base de dados.

## 📋 O que faz a migração?

A migração regenera todos os treinos usando o **motor centralizado**, garantindo que:

- ✅ Todos os treinos seguem a mesma lógica consistente
- ✅ Treinos têm estrutura correta (cardio primeiro, força no meio, alongamento por último)
- ✅ Distribuição equilibrada de exercícios por grupo
- ✅ Tempo variável baseado em objetivo
- ✅ Respeita lesões do usuário
- ✅ Evita repetição de exercícios

## 🚀 Como executar

### Opção 1: Migrar todos os usuários (recomendado)

```bash
cd backend
npm run migrar-treinos
```

Isso irá:
- Buscar todos os usuários com perfil completo
- Regenerar treinos das próximas 4 semanas
- Apenas treinos futuros (não concluídos)

### Opção 2: Migrar apenas treinos futuros (padrão)

```bash
npm run migrar-treinos
```

### Opção 3: Migrar incluindo treinos concluídos

```bash
npm run migrar-treinos -- --incluir-concluidos
```

### Opção 4: Migrar todos os treinos (futuros e passados)

```bash
npm run migrar-treinos -- --todos --incluir-concluidos
```

### Opção 5: Migrar número específico de semanas

```bash
npm run migrar-treinos -- --semanas=8
```

### Opção 6: Migrar apenas um usuário específico

```bash
npm run migrar-treinos -- --userId=USER_ID_AQUI
```

## ⚙️ Opções disponíveis

| Flag | Descrição | Padrão |
|------|-----------|--------|
| `--todos` | Regenera todos os treinos (não apenas futuros) | `false` |
| `--incluir-concluidos` | Inclui treinos já concluídos | `false` |
| `--semanas=N` | Quantas semanas regenerar | `4` |
| `--userId=ID` | Migrar apenas um usuário específico | `Todos` |

## 📊 O que acontece durante a migração?

1. **Busca usuários**: Encontra todos os usuários com perfil completo
2. **Remove treinos antigos**: Deleta treinos IA antigos (baseado nas opções)
3. **Regenera treinos**: Usa o motor centralizado para criar novos treinos
4. **Gera relatório**: Mostra quantos treinos foram regenerados

## ⚠️ Importante

- **Backup recomendado**: Faça backup do banco antes de executar
- **Treinos concluídos**: Por padrão, treinos concluídos são preservados
- **Treinos manuais**: Treinos criados manualmente (`criadoPor: 'USUARIO'`) não são afetados
- **Templates**: Treinos de templates não são afetados

## 🔍 Verificar resultado

Após a migração, você pode verificar:

```sql
-- Ver quantos treinos foram gerados pelo motor centralizado
SELECT COUNT(*) 
FROM treinos 
WHERE criado_por = 'IA' 
AND data >= CURRENT_DATE;
```

## 🐛 Troubleshooting

### Erro: "Perfil não encontrado"
- Usuário não completou onboarding
- Solução: Complete o perfil do usuário primeiro

### Erro: "Não foi possível gerar treino"
- Verifique se o usuário tem frequência semanal definida
- Verifique se há exercícios cadastrados no banco

### Migração muito lenta
- Use `--userId=ID` para migrar um usuário por vez
- Reduza `--semanas` para menos semanas

## 📝 Exemplo de uso completo

```bash
# 1. Fazer backup do banco
pg_dump athletia > backup_antes_migracao.sql

# 2. Executar migração (apenas futuros, 4 semanas)
npm run migrar-treinos

# 3. Verificar resultado
npm run prisma:studio
```

## ✅ Checklist pós-migração

- [ ] Verificar que treinos foram regenerados
- [ ] Verificar estrutura dos treinos (cardio primeiro, alongamento último)
- [ ] Verificar distribuição de exercícios
- [ ] Testar geração de novo treino para um usuário
- [ ] Verificar logs para erros

