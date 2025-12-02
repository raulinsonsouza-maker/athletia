# Diagnóstico e Correção do Problema de Upload de Mídia

## Problema Identificado

O endpoint `/api/exercicios/:id/media.ext` retorna 404 porque:

1. **A pasta não existe no servidor**: `/opt/athletia/backend/uploads/exercicios`
2. **Caminho configurado está incorreto**: O código estava usando `/opt/athletia/backend/upload/exercicios` (sem "s")
3. **Arquivos não foram criados**: Os arquivos físicos não existem no servidor

## Correções Aplicadas

### 1. Caminho Corrigido

**Arquivo**: `backend/src/utils/upload-paths.ts`

- ✅ Corrigido caminho de `/opt/athletia/backend/upload/exercicios` para `/opt/athletia/backend/uploads/exercicios`
- ✅ Adicionada criação automática do diretório se não existir
- ✅ Adicionados logs para debug

### 2. Logs Detalhados

**Arquivos modificados**:
- `backend/src/services/exercicio-media.service.ts` - Logs ao buscar arquivos
- `backend/src/controllers/exercicio-media.controller.ts` - Logs detalhados de requisições

### 3. Script de Verificação

**Arquivo criado**: `backend/scripts/ensure-upload-dirs.sh`

Script para garantir que os diretórios existem no servidor.

## Como Corrigir no Servidor

### Passo 1: Criar Diretórios

Execute no servidor:

```bash
# Criar estrutura de diretórios
mkdir -p /opt/athletia/backend/uploads/exercicios
mkdir -p /opt/athletia/backend/uploads/temp

# Dar permissões corretas
chmod -R 755 /opt/athletia/backend/uploads
chown -R root:root /opt/athletia/backend/uploads
```

### Passo 2: Verificar Variável de Ambiente (Opcional)

Se quiser usar um caminho diferente, configure no `.env`:

```env
UPLOAD_EXERCICIOS_PATH=/opt/athletia/backend/uploads/exercicios
NODE_ENV=production
```

### Passo 3: Reiniciar Backend

```bash
cd /opt/athletia/backend
pm2 restart athletia-backend
```

### Passo 4: Verificar Logs

```bash
pm2 logs athletia-backend --lines 50
```

Procure por:
- `[INIT] Diretório de upload de exercícios configurado: ...`
- `[MediaController] Requisição: ...`
- `[MediaService] Procurando mídia: ...`

## Estrutura Esperada

```
/opt/athletia/backend/uploads/
└── exercicios/
    └── {UUID-do-exercicio}/
        └── media.{ext}
```

## Teste

1. Fazer upload de uma mídia via admin
2. Verificar se o arquivo foi criado:
   ```bash
   ls -R /opt/athletia/backend/uploads/exercicios/
   ```
3. Tentar acessar a URL:
   ```
   https://athletia.site/api/exercicios/{uuid}/media.gif
   ```

## Próximos Passos

Se ainda não funcionar, verificar:

1. **Permissões**: O processo do Node.js precisa de permissão para criar/escrever
2. **NGINX**: Se está servindo arquivos estáticos ou redirecionando para o backend
3. **UUID vs Slug**: Garantir que os arquivos estão salvos com UUID (não slug)

