# 🔧 Instruções para Corrigir o Problema de Upload no Servidor

## ⚠️ PROBLEMA IDENTIFICADO

O endpoint `/api/exercicios/:id/media.ext` retorna 404 porque:
- ❌ A pasta `/opt/athletia/backend/uploads/exercicios` não existe
- ❌ Caminho estava configurado errado (`upload` em vez de `uploads`)

## ✅ CORREÇÕES APLICADAS NO CÓDIGO

### 1. Caminho Corrigido
- **Arquivo**: `backend/src/utils/upload-paths.ts`
- ✅ Corrigido de `/opt/athletia/backend/upload/exercicios` → `/opt/athletia/backend/uploads/exercicios`
- ✅ Criação automática de diretório se não existir

### 2. Logs Detalhados Adicionados
- ✅ `exercicio-media.service.ts` - Logs ao buscar arquivos
- ✅ `exercicio-media.controller.ts` - Logs detalhados de cada requisição

## 🚀 PASSO A PASSO PARA CORRIGIR NO SERVIDOR

### Passo 1: Criar Estrutura de Diretórios

Execute no servidor:

```bash
# Criar diretório base
mkdir -p /opt/athletia/backend/uploads/exercicios

# Criar diretório temporário para uploads
mkdir -p /opt/athletia/backend/uploads/temp

# Dar permissões corretas
chmod -R 755 /opt/athletia/backend/uploads

# Se necessário, ajustar owner (pode precisar de sudo)
sudo chown -R root:root /opt/athletia/backend/uploads
```

### Passo 2: Verificar se Criou Corretamente

```bash
ls -la /opt/athletia/backend/uploads/
```

Deve mostrar:
```
drwxr-xr-x  root root  ... exercicios/
drwxr-xr-x  root root  ... temp/
```

### Passo 3: Fazer Deploy do Código Atualizado

```bash
cd /opt/athletia/backend
git pull  # ou seu método de deploy

# Recompilar
npm run build

# Reiniciar
pm2 restart athletia-backend
```

### Passo 4: Verificar Logs

```bash
pm2 logs athletia-backend --lines 50
```

Procure por estas mensagens:
- ✅ `[UPLOAD-PATHS] Diretório criado: /opt/athletia/backend/uploads/exercicios`
- ✅ `[INIT] Diretório de upload de exercícios configurado: ...`
- ✅ `[CONFIG] Caminho de upload de exercícios: ...`

### Passo 5: Testar Upload

1. Acesse o painel admin
2. Edite um exercício
3. Faça upload de uma mídia
4. Verifique se o arquivo foi criado:

```bash
ls -R /opt/athletia/backend/uploads/exercicios/
```

Deve mostrar algo como:
```
exercicios/
└── {uuid-do-exercicio}/
    └── media.gif
```

### Passo 6: Testar Acesso

Tente acessar diretamente no navegador:
```
https://athletia.site/api/exercicios/{uuid}/media.gif
```

## 📋 ESTRUTURA ESPERADA

```
/opt/athletia/backend/uploads/
├── exercicios/
│   └── {uuid-exercicio-1}/
│       └── media.gif
│   └── {uuid-exercicio-2}/
│       └── media.jpg
└── temp/  (temporário para uploads)
```

## 🔍 DEBUG

Se ainda não funcionar, verifique:

### 1. Permissões
```bash
ls -la /opt/athletia/backend/uploads/exercicios/
```

O processo do Node.js precisa de permissão para escrever.

### 2. Logs Detalhados
```bash
pm2 logs athletia-backend | grep -E "MediaController|MediaService|UPLOAD"
```

### 3. Verificar Variável de Ambiente (Opcional)

Se quiser usar caminho customizado, adicione no `.env`:
```env
UPLOAD_EXERCICIOS_PATH=/opt/athletia/backend/uploads/exercicios
NODE_ENV=production
```

## ✅ CHECKLIST

- [ ] Diretórios criados: `/opt/athletia/backend/uploads/exercicios`
- [ ] Permissões corretas (755)
- [ ] Código atualizado e recompilado
- [ ] Backend reiniciado
- [ ] Logs mostram caminho correto
- [ ] Upload funciona no admin
- [ ] Arquivos aparecem na pasta
- [ ] URL funciona no navegador

## 📝 NOTAS IMPORTANTES

1. **UUID vs Slug**: Os arquivos são salvos usando o **UUID** do exercício (não slug)
2. **Extensão**: O arquivo sempre se chama `media.{ext}` dentro da pasta do exercício
3. **Criação Automática**: O código agora cria os diretórios automaticamente na inicialização

## 🆘 SE AINDA NÃO FUNCIONAR

1. Verifique os logs completos:
   ```bash
   pm2 logs athletia-backend --err --lines 100
   ```

2. Teste criar um arquivo manualmente:
   ```bash
   mkdir -p /opt/athletia/backend/uploads/exercicios/teste
   echo "teste" > /opt/athletia/backend/uploads/exercicios/teste/media.gif
   ```

3. Verifique se o NGINX está bloqueando (se aplicável)

