# 🔧 CORRIGIR URLs INVÁLIDAS

## ❌ PROBLEMA ENCONTRADO

O script de validação encontrou **2 exercícios com URLs inválidas**:

- `Abdominal Bicicleta`: `/api/exercicios/abdominal-bicicleta/media.gif`
- `Abdominal Lateral`: `/api/exercicios/abdominal-lateral/media.jpg`

**Problema**: Essas URLs estão usando o **slug** (`abdominal-bicicleta`) em vez do **UUID** do exercício.

**Padrão correto**: `/api/exercicios/{uuid}/media.{ext}`

---

## ✅ SOLUÇÃO

Execute o script de correção:

```bash
cd /opt/athletia/backend
node scripts/fix-invalid-urls.js
```

Este script vai:
1. Identificar URLs inválidas (que usam slug em vez de UUID)
2. Buscar o UUID real do exercício
3. Corrigir a URL para usar o UUID correto
4. Atualizar no banco de dados

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

Após a correção, a validação deve mostrar:

```
✅ URLs válidas: 4
❌ URLs inválidas: 0
```

---

## 🔍 O QUE O SCRIPT FAZ

1. **Identifica URLs inválidas**: URLs que começam com `/api/exercicios/` mas não usam UUID válido
2. **Resolve o identificador**: Converte slug/nome para UUID real do exercício
3. **Corrige a URL**: Substitui o slug pelo UUID correto
4. **Atualiza o banco**: Salva a URL corrigida

---

## ⚠️ IMPORTANTE

- O script **não altera** URLs que já estão corretas
- O script **preserva** a extensão do arquivo (.gif, .jpg, etc)
- O script usa o **UUID real** do exercício no banco de dados

