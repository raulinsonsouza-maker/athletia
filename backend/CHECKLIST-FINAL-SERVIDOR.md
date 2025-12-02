# ✅ CHECKLIST FINAL - EXECUTAR NO SERVIDOR

## 📋 PRÉ-REQUISITOS

- [ ] Código atualizado no repositório
- [ ] Acesso SSH ao servidor
- [ ] Acesso ao banco de dados

---

## 🚀 EXECUÇÃO PASSO A PASSO

### 1️⃣ CRIAR DIRETÓRIOS

```bash
mkdir -p /opt/athletia/backend/uploads/exercicios
chmod -R 755 /opt/athletia/backend/uploads
```

**Verificar:**
```bash
ls -la /opt/athletia/backend/uploads/
```

✅ **Resultado esperado**: Diretório `exercicios` criado

---

### 2️⃣ VALIDAR BANCO DE DADOS

```bash
cd /opt/athletia/backend
npx ts-node scripts/validate-media-db.ts
```

**O que verificar:**
- Quantos exercícios têm URLs no formato antigo
- Quantos têm URLs inválidas
- Quantos estão sem mídia

**Se encontrar URLs antigas**, vá para passo 3.

**Se não encontrar URLs antigas**, pule para passo 4.

---

### 3️⃣ RODAR MIGRAÇÃO (SE NECESSÁRIO)

**APENAS SE** o passo 2 mostrou URLs no formato antigo:

```bash
cd /opt/athletia/backend
npx ts-node scripts/migrate-media-urls-exec.ts
```

**Verificar resultado:**
- Quantos exercícios foram atualizados
- Se houve erros

**Após migração, validar novamente:**
```bash
npx ts-node scripts/validate-media-db.ts
```

✅ **Resultado esperado**: 0 URLs no formato antigo

---

### 4️⃣ FAZER DEPLOY DO CÓDIGO

```bash
cd /opt/athletia/backend
git pull
npm install
npm run build
pm2 restart athletia-backend
```

**Verificar logs:**
```bash
pm2 logs athletia-backend --lines 50 | grep -E "UPLOAD|MediaController|INIT"
```

✅ **Resultado esperado**: 
- `[INIT] Diretório de upload configurado: /opt/athletia/backend/uploads/exercicios`
- `[INIT] Diretório existe: SIM`

---

### 5️⃣ TESTAR UPLOAD

1. Acessar admin panel
2. Editar um exercício
3. Fazer upload de uma mídia (GIF, JPG, PNG, MP4, etc)
4. Verificar se arquivo foi criado:

```bash
ls -R /opt/athletia/backend/uploads/exercicios/
```

✅ **Resultado esperado**: 
```
exercicios/
└── {uuid-do-exercicio}/
    └── media.{ext}
```

---

### 6️⃣ TESTAR DOWNLOAD

Tentar acessar no navegador:
```
https://athletia.site/api/exercicios/{uuid}/media.{ext}
```

✅ **Resultado esperado**: Imagem/vídeo carrega corretamente

---

### 7️⃣ TESTAR FLUXO DE TREINO

1. Gerar um treino
2. Verificar se os exercícios têm `imagemUrl` correto
3. Verificar se as imagens carregam no frontend

✅ **Resultado esperado**: Todas as imagens carregam

---

### 8️⃣ REMOVER MIDDLEWARE LEGADO (DEPOIS DA MIGRAÇÃO)

**APENAS APÓS** tudo funcionar:

1. Editar `backend/src/routes/admin.routes.ts`
2. Remover linha 32: `import { normalizeMediaUrls } from '../middleware/normalize-media-urls.middleware';`
3. Remover linha 40: `router.use(normalizeMediaUrls);`
4. Recompilar e reiniciar:
   ```bash
   npm run build
   pm2 restart athletia-backend
   ```

---

### 9️⃣ LIMPAR DIRETÓRIOS ANTIGOS (DEPOIS DA MIGRAÇÃO)

**APENAS SE:**
- ✅ Migração rodada com sucesso
- ✅ Validação mostra 0 URLs antigas
- ✅ Testes funcionando
- ✅ Backup realizado

```bash
# Fazer backup primeiro
tar -czf /opt/athletia/backup-uploads-$(date +%Y%m%d).tar.gz /opt/athletia/backend/upload/exercicios-antigo 2>/dev/null

# Verificar se pode remover
find /opt/athletia/backend/upload -type d -name "*exercicios*" 2>/dev/null
```

---

## 📊 CHECKLIST FINAL

- [ ] Diretório `/opt/athletia/backend/uploads/exercicios` criado
- [ ] Permissões corretas (755)
- [ ] Banco validado (0 URLs antigas ou migração rodada)
- [ ] Código atualizado e recompilado
- [ ] Backend reiniciado
- [ ] Logs mostram caminho correto
- [ ] Upload funciona
- [ ] Download funciona
- [ ] Fluxo de treino funciona
- [ ] Middleware legado removido (opcional)

---

## 🆘 SE ALGO NÃO FUNCIONAR

### Verificar Logs:
```bash
pm2 logs athletia-backend --lines 100 | grep -E "MediaController|MediaService|UPLOAD|ERROR"
```

### Verificar Diretórios:
```bash
ls -la /opt/athletia/backend/uploads/exercicios/
find /opt/athletia/backend/uploads -type f -name "media.*" | head -5
```

### Verificar Banco:
```sql
SELECT id, nome, imagem_url 
FROM exercicios 
WHERE imagem_url IS NOT NULL 
ORDER BY id DESC 
LIMIT 10;
```

### Testar Endpoint Manualmente:
```bash
curl -I https://athletia.site/api/exercicios/{uuid}/media.gif
```

---

## ✅ SUCESSO

Se todos os testes passarem:
- ✅ Sistema de mídia funcionando 100%
- ✅ URLs padronizadas
- ✅ Logs centralizados
- ✅ Segurança implementada
- ✅ Código limpo e documentado

