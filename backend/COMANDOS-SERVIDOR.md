# 🚀 COMANDOS PARA EXECUTAR NO SERVIDOR

## ⚠️ IMPORTANTE: Você precisa estar no diretório correto!

Os scripts estão em `backend/scripts/`, então você precisa:

```bash
cd /opt/athletia/backend
```

**DEPOIS** executar os comandos.

---

## ✅ PASSO 1: Criar Diretórios

```bash
mkdir -p /opt/athletia/backend/uploads/exercicios
chmod -R 755 /opt/athletia/backend/uploads
```

Verificar:
```bash
ls -la /opt/athletia/backend/uploads/
```

---

## ✅ PASSO 2: Validar Banco de Dados

**Opção 1: Usar JavaScript (recomendado - mais rápido)**
```bash
cd /opt/athletia/backend
node scripts/validate-media-db.js
```

**Opção 2: Usar TypeScript (se ts-node estiver instalado)**
```bash
cd /opt/athletia/backend
npx ts-node scripts/validate-media-db.ts
```

---

## ✅ PASSO 3: Rodar Migração (se necessário)

**Opção 1: Usar JavaScript (recomendado)**
```bash
cd /opt/athletia/backend
node scripts/migrate-media-urls-exec.js
```

**Opção 2: Usar TypeScript**
```bash
cd /opt/athletia/backend
npx ts-node scripts/migrate-media-urls-exec.ts
```

---

## ✅ PASSO 4: Verificar Caminho Atual

```bash
cd /opt/athletia/backend
pwd  # Deve mostrar: /opt/athletia/backend
```

---

## 🔍 VERIFICAÇÃO RÁPIDA

Verificar se os scripts existem:
```bash
cd /opt/athletia/backend
ls -la scripts/
```

Deve mostrar:
- `validate-media-db.js`
- `migrate-media-urls-exec.js`
- `ensure-upload-dirs.sh`

Se não existirem, você precisa fazer deploy do código atualizado primeiro!

---

## 📋 SEQUÊNCIA COMPLETA

```bash
# 1. Ir para o diretório backend
cd /opt/athletia/backend

# 2. Verificar se está no lugar certo
pwd
ls -la scripts/

# 3. Criar diretórios
mkdir -p /opt/athletia/backend/uploads/exercicios
chmod -R 755 /opt/athletia/backend/uploads

# 4. Validar banco
node scripts/validate-media-db.js

# 5. Rodar migração (se necessário)
node scripts/migrate-media-urls-exec.js

# 6. Verificar logs do backend
pm2 logs athletia-backend --lines 50 | grep -E "UPLOAD|MediaController"
```

