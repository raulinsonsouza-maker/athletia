# 🚀 PASSO A PASSO DE EXECUÇÃO - CORREÇÃO DEFINITIVA

Execute **NA ORDEM** no servidor:

---

## ✅ PASSO 1: Confirmar Padrão (JÁ FEITO)

Padrão oficial confirmado:
- **Caminho**: `/opt/athletia/backend/uploads/exercicios/{uuid}/media.{ext}`
- **URL**: `/api/exercicios/{uuid}/media.{ext}`

---

## ✅ PASSO 2: Criar Diretório Raiz

```bash
mkdir -p /opt/athletia/backend/uploads/exercicios
chmod -R 755 /opt/athletia/backend/uploads
```

Verificar:
```bash
ls -la /opt/athletia/backend/uploads/
```

---

## ✅ PASSO 3: Criação Automática (JÁ IMPLEMENTADO)

O código já cria diretórios automaticamente. ✅

---

## 📋 PASSO 4: Validar Banco de Dados

```bash
cd /opt/athletia/backend
npx ts-node scripts/validate-media-db.ts
```

**O que verificar no output:**
- Quantos exercícios têm formato antigo
- Quantos têm URLs inválidas
- Quantos estão sem mídia

**Se encontrar URLs no formato antigo**, vá para PASSO 5.

---

## 📋 PASSO 5: Rodar Migração (SE NECESSÁRIO)

**APENAS SE** o PASSO 4 mostrou URLs no formato antigo:

```bash
cd /opt/athletia/backend
npx ts-node scripts/migrate-media-urls-exec.ts
```

**Verificar resultado:**
- Quantos exercícios foram atualizados
- Se houve erros

**Após migração, rodar validação novamente:**
```bash
npx ts-node scripts/validate-media-db.ts
```

---

## 📋 PASSO 6: Testar Upload

1. Acessar admin panel
2. Editar um exercício
3. Fazer upload de uma mídia
4. Verificar se arquivo foi criado:

```bash
ls -R /opt/athletia/backend/uploads/exercicios/
```

**Estrutura esperada:**
```
exercicios/
└── {uuid}/
    └── media.{ext}
```

---

## 📋 PASSO 7: Testar Download

Tentar acessar no navegador:
```
https://athletia.site/api/exercicios/{uuid}/media.{ext}
```

**Deve mostrar a imagem/vídeo.**

---

## 📋 PASSO 8: Testar Fluxo de Treino

1. Gerar um treino
2. Verificar se os exercícios têm `imagemUrl` correto
3. Verificar se as imagens carregam no frontend

---

## ⚠️ PASSO 9: Remover Middleware Legado (DEPOIS DA MIGRAÇÃO)

**APENAS APÓS** tudo funcionar:

1. Remover `normalizeMediaUrls` de `admin.routes.ts`
2. Opcional: deletar `normalize-media-urls.middleware.ts`
3. Reiniciar backend

---

## 📋 PASSO 10: Limpar Diretórios Antigos (DEPOIS DA MIGRAÇÃO)

**APENAS SE:**
- ✅ Migração rodada com sucesso
- ✅ Validação mostra 0 URLs antigas
- ✅ Testes funcionando

```bash
# Fazer backup primeiro
tar -czf /opt/athletia/backup-uploads-$(date +%Y%m%d).tar.gz /opt/athletia/backend/upload/exercicios-antigo 2>/dev/null

# Verificar se pode remover
find /opt/athletia/backend/upload -name "exercicio.*" -o -name "*.gif" | head -5

# Remover (cuidado!)
# rm -rf /opt/athletia/backend/upload/exercicios-antigo
```

---

## 📊 CHECKLIST FINAL

- [ ] Diretório criado e com permissões corretas
- [ ] Banco validado (0 URLs antigas)
- [ ] Migração rodada (se necessário)
- [ ] Upload funciona
- [ ] Download funciona
- [ ] Fluxo de treino funciona
- [ ] Logs usando logger centralizado
- [ ] Middleware legado removido (opcional)
- [ ] Diretórios antigos limpos (opcional)

---

## 🔍 DEBUG

Se algo não funcionar:

1. **Verificar logs:**
   ```bash
   pm2 logs athletia-backend --lines 100 | grep -E "MediaController|MediaService|UPLOAD"
   ```

2. **Verificar diretórios:**
   ```bash
   ls -la /opt/athletia/backend/uploads/exercicios/
   ```

3. **Verificar banco:**
   ```bash
   psql -U seu_usuario -d seu_banco -c "SELECT id, nome, imagem_url FROM exercicios WHERE imagem_url IS NOT NULL LIMIT 10;"
   ```

4. **Testar endpoint manualmente:**
   ```bash
   curl -I https://athletia.site/api/exercicios/{uuid}/media.gif
   ```

