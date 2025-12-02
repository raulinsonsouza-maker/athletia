# ✅ SOLUÇÃO PARA URLs INVÁLIDAS

## 🔍 PROBLEMA IDENTIFICADO

O script de validação encontrou **2 exercícios** com URLs inválidas:

```
❌ Abdominal Bicicleta: /api/exercicios/abdominal-bicicleta/media.gif
❌ Abdominal Lateral: /api/exercicios/abdominal-lateral/media.jpg
```

**Problema**: Essas URLs estão usando o **slug** (`abdominal-bicicleta`) em vez do **UUID** do exercício.

---

## ✅ SOLUÇÃO CRIADA

Criei o script `fix-invalid-urls.js` que vai:

1. ✅ Identificar URLs que usam slug em vez de UUID
2. ✅ Buscar o UUID real do exercício no banco
3. ✅ Corrigir a URL para usar o UUID correto
4. ✅ Atualizar no banco de dados

---

## 🚀 EXECUTAR CORREÇÃO

```bash
cd /opt/athletia/backend
node scripts/fix-invalid-urls.js
```

---

## 📋 SEQUÊNCIA COMPLETA

```bash
# 1. Ir para o diretório backend
cd /opt/athletia/backend

# 2. Corrigir URLs inválidas
node scripts/fix-invalid-urls.js

# 3. Validar novamente para confirmar
node scripts/validate-media-db.js
```

---

## ✅ RESULTADO ESPERADO

Após a correção:

**Antes:**
- ✅ URLs válidas: 2
- ❌ URLs inválidas: 2

**Depois:**
- ✅ URLs válidas: 4
- ❌ URLs inválidas: 0

---

## 🔍 O QUE O SCRIPT FAZ

1. **Busca exercícios** com URLs que começam com `/api/exercicios/`
2. **Verifica se é UUID válido** na URL
3. **Se não for UUID**, resolve o slug/nome para UUID real
4. **Substitui o slug pelo UUID** na URL
5. **Atualiza no banco** de dados

---

## ⚠️ IMPORTANTE

- O script **não altera** URLs que já estão corretas
- O script **preserva** a extensão do arquivo (.gif, .jpg, etc)
- O script usa o **UUID real** do exercício do banco de dados

---

## 📝 EXEMPLO DE CORREÇÃO

**Antes:**
```
/api/exercicios/abdominal-bicicleta/media.gif
```

**Depois:**
```
/api/exercicios/{uuid-real-do-exercicio}/media.gif
```

Onde `{uuid-real-do-exercicio}` é o UUID real do exercício "Abdominal Bicicleta" no banco de dados.

