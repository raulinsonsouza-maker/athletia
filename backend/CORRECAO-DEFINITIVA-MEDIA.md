# 🔧 CORREÇÃO DEFINITIVA - Sistema de Mídia

## ✅ PASSO 1: CONFIRMAR PADRÃO OFICIAL

**Padrão oficial confirmado:**

- **Caminho físico**: `/opt/athletia/backend/uploads/exercicios/{exercicioId}/media.{ext}`
- **URL pública**: `/api/exercicios/{exercicioId}/media.{ext}`
- **exercicioId**: UUID do exercício (sempre)
- **Nome do arquivo**: `media.{ext}` (sempre)

Este padrão está implementado e será mantido.

## ✅ PASSO 2: CRIAR/VALIDAR DIRETÓRIO RAIZ

**Script criado**: `backend/scripts/ensure-upload-dirs.sh`

Execute no servidor:
```bash
chmod +x /opt/athletia/backend/scripts/ensure-upload-dirs.sh
/opt/athletia/backend/scripts/ensure-upload-dirs.sh
```

Ou manualmente:
```bash
mkdir -p /opt/athletia/backend/uploads/exercicios
chmod -R 755 /opt/athletia/backend/uploads
```

## ✅ PASSO 3: CRIAÇÃO AUTOMÁTICA

✅ **JÁ IMPLEMENTADO** em `exercicio-media.service.ts`:
- `saveMediaFile()` cria diretório automaticamente com `fs.mkdirSync(exercicioPath, { recursive: true })`

## 📋 PASSO 4: RODAR MIGRAÇÃO

Script de migração está em `backend/src/utils/migrate-media-urls.ts`

**Para executar, criar script executável** (ver próximo passo)

## 📋 PASSO 5: VALIDAR BANCO

Script de validação será criado (ver próximo passo)

## 🔄 PASSO 6: REMOVER MIDDLEWARE LEGADO

**Status**: `normalizeMediaUrls` middleware ainda está sendo usado em `admin.routes.ts`

**Decisão**: Manter temporariamente até migração completa, depois remover.

## 📋 PASSO 7-10: Verificações e melhorias pendentes

