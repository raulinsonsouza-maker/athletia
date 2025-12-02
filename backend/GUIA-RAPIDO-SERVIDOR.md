# ⚡ GUIA RÁPIDO - SERVIDOR

## ❌ PROBLEMA

Você estava em `/opt/athletia` mas os scripts estão em `/opt/athletia/backend/scripts/`

---

## ✅ SOLUÇÃO RÁPIDA

### 1. Ir para o diretório correto:

```bash
cd /opt/athletia/backend
```

### 2. Verificar se está no lugar certo:

```bash
pwd
# Deve mostrar: /opt/athletia/backend
```

### 3. Verificar se os scripts existem:

```bash
ls -la scripts/
```

**Deve mostrar:**
- `validate-media-db.js` ✅
- `migrate-media-urls-exec.js` ✅
- `validate-media-db.ts` (opcional)
- `migrate-media-urls-exec.ts` (opcional)

---

## 🚀 EXECUTAR COMANDOS

### Validar Banco:

```bash
cd /opt/athletia/backend
node scripts/validate-media-db.js
```

### Migrar URLs:

```bash
cd /opt/athletia/backend
node scripts/migrate-media-urls-exec.js
```

---

## 📋 SEQUÊNCIA COMPLETA

Copie e cole tudo de uma vez:

```bash
# 1. Ir para o diretório backend
cd /opt/athletia/backend

# 2. Verificar diretório
pwd

# 3. Verificar se scripts existem
ls -la scripts/validate-media-db.js scripts/migrate-media-urls-exec.js

# 4. Criar diretórios de upload
mkdir -p /opt/athletia/backend/uploads/exercicios
chmod -R 755 /opt/athletia/backend/uploads

# 5. Validar banco
node scripts/validate-media-db.js

# 6. Se houver URLs antigas, migrar
node scripts/migrate-media-urls-exec.js

# 7. Validar novamente
node scripts/validate-media-db.js
```

---

## ⚠️ SE OS SCRIPTS .JS NÃO EXISTIREM

Os scripts JavaScript foram criados agora. Você precisa:

1. **Fazer deploy do código atualizado** ou
2. **Usar os scripts TypeScript** (se ts-node estiver instalado):

```bash
cd /opt/athletia/backend
npx ts-node scripts/validate-media-db.ts
npx ts-node scripts/migrate-media-urls-exec.ts
```

---

## 🔍 DIAGNÓSTICO

Se ainda der erro, execute:

```bash
cd /opt/athletia/backend
pwd
ls -la scripts/
which node
node --version
```

E me envie o resultado.

