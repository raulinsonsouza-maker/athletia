# Scripts de Diagnóstico e Correção de Imagens de Exercícios

Este diretório contém scripts para diagnosticar e corrigir problemas com imagens/GIFs de exercícios.

## Scripts Disponíveis

### 1. `diagnosticar-imagens-exercicios.ts`

Script de diagnóstico que verifica:
- Quais exercícios têm URLs (`gifUrl` ou `imagemUrl`) no banco
- Se os arquivos correspondentes existem no sistema de arquivos
- Inconsistências entre IDs no banco e nomes de pastas
- Pastas órfãs (pastas sem exercício correspondente)

**Uso:**
```bash
npm run diagnosticar-imagens
```

**Saída:**
- Relatório completo de todos os exercícios
- Lista de exercícios com problemas
- Estatísticas gerais

### 2. `corrigir-imagens-exercicios.ts`

Script que corrige automaticamente:
- URLs incorretas no banco de dados
- Migração de arquivos de pastas incorretas para pastas corretas
- Limpeza de URLs quando arquivos não existem

**Uso:**
```bash
npm run corrigir-imagens
```

**Ações realizadas:**
1. Verifica cada exercício com URL no banco
2. Se o arquivo está em pasta errada, migra para pasta correta
3. Atualiza URLs no banco para usar o ID correto do exercício
4. Remove URLs do banco se arquivos não existem

## Como Usar

### Passo 1: Diagnosticar o Problema

Primeiro, execute o diagnóstico para entender a situação:

```bash
npm run diagnosticar-imagens
```

Isso mostrará:
- Quantos exercícios têm URLs
- Quantos arquivos existem
- Quais exercícios têm problemas
- Quais pastas estão órfãs

### Passo 2: Corrigir Problemas

Depois de entender o problema, execute a correção:

```bash
npm run corrigir-imagens
```

O script irá:
- Corrigir URLs incorretas
- Migrar arquivos quando necessário
- Limpar URLs inválidas

### Passo 3: Verificar Resultado

Execute o diagnóstico novamente para verificar se os problemas foram resolvidos:

```bash
npm run diagnosticar-imagens
```

## Estrutura Esperada

Os arquivos de exercícios devem estar organizados assim:

```
upload/exercicios/
  ├── {exercicio-id-1}/
  │   └── exercicio.gif (ou .jpg, .png, .mp4, etc.)
  ├── {exercicio-id-2}/
  │   └── exercicio.gif
  └── ...
```

Onde `{exercicio-id}` é o ID do exercício no banco de dados (pode ser UUID ou slug).

## Melhorias Implementadas

### Serviço de Resolução (`exercicio-media.service.ts`)

- ✅ Melhor suporte para IDs não-UUID (slugs)
- ✅ Busca no banco quando ID não é UUID
- ✅ Logging detalhado em modo desenvolvimento
- ✅ Tratamento de erros mais robusto

### Rota de Servir Arquivos (`index.ts`)

- ✅ Melhor tratamento de erros
- ✅ Logging informativo
- ✅ Fallback para placeholder quando arquivo não existe

## Troubleshooting

### Arquivos não aparecem no frontend

1. Execute o diagnóstico: `npm run diagnosticar-imagens`
2. Verifique se os arquivos existem nas pastas corretas
3. Execute a correção: `npm run corrigir-imagens`
4. Verifique os logs do backend (modo desenvolvimento mostra detalhes)

### URLs no banco estão incorretas

O script de correção detecta e corrige automaticamente URLs que:
- Usam IDs diferentes do ID do exercício
- Apontam para arquivos que não existem

### Arquivos em pastas erradas

O script de correção migra automaticamente arquivos de pastas incorretas para a pasta correta baseada no ID do exercício no banco.

## Notas

- Os scripts fazem backup antes de modificar arquivos quando possível
- Em modo produção, o logging é reduzido para evitar poluição de logs
- Os scripts são seguros para executar múltiplas vezes (idempotentes)

