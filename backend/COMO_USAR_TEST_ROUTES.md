# 🧪 Como Usar o Script de Teste de Rotas

## 📁 Arquivo Criado

O arquivo `backend/test-routes.sh` foi criado e está pronto para uso.

## 🚀 Como Enviar para a VPS

### Opção 1: Via Git (Recomendado)

```bash
# No seu computador local
cd backend
git add test-routes.sh
git commit -m "Adiciona script de teste de rotas"
git push

# Na VPS
cd /caminho/para/backend
git pull
chmod +x test-routes.sh
```

### Opção 2: Via SCP (Transferência Direta)

```bash
# Do seu computador local
scp backend/test-routes.sh usuario@servidor:/caminho/para/backend/
```

### Opção 3: Copiar e Colar Manualmente

1. Abra o arquivo `backend/test-routes.sh` no seu editor
2. Copie todo o conteúdo
3. Na VPS, crie o arquivo:
   ```bash
   nano test-routes.sh
   # Cole o conteúdo, salve (Ctrl+O, Enter, Ctrl+X)
   chmod +x test-routes.sh
   ```

## ✅ Como Executar na VPS

```bash
# 1. Navegar para o diretório do backend
cd /caminho/para/backend

# 2. Tornar executável (se ainda não for)
chmod +x test-routes.sh

# 3. Executar o script
bash test-routes.sh
# ou
./test-routes.sh
```

## 📋 O que o Script Faz

O script verifica automaticamente:

1. ✅ **Código fonte** - Se as rotas existem em `src/routes/blog.routes.ts`
2. ✅ **Código compilado** - Se as rotas foram compiladas em `dist/routes/blog.routes.js`
3. ✅ **Prisma Client** - Se o modelo `blogSettings` existe
4. ✅ **Rotas HTTP** - Se as rotas respondem corretamente no servidor

## 🎯 Saída Esperada

```
🔍 Verificando rotas do blog...

1️⃣ Verificando código fonte...
✅ Rotas encontradas no código fonte

2️⃣ Verificando código compilado...
✅ Rotas encontradas no código compilado

3️⃣ Verificando Prisma Client...
✅ Prisma Client tem blogSettings

4️⃣ Testando rotas no servidor...
✅ Rota /api/blog/configuracoes funcionando! (HTTP 200)
✅ Rota /api/blog/featured funcionando! (HTTP 200)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Diagnóstico completo!
```

## 🔧 Troubleshooting

### Erro: "Permission denied"
```bash
chmod +x test-routes.sh
```

### Erro: "bash: test-routes.sh: command not found"
```bash
bash test-routes.sh
# ou
sh test-routes.sh
```

### Script não encontra as rotas
```bash
# Verificar se está no diretório correto
pwd
# Deve mostrar: /caminho/para/backend

# Verificar se os arquivos existem
ls -la src/routes/blog.routes.ts
ls -la dist/routes/blog.routes.js
```

## 🚀 Versão Rápida (Sem Script)

Se preferir testar manualmente:

```bash
# Teste rápido
curl -i http://localhost:3001/api/blog/configuracoes
curl -i http://localhost:3001/api/blog/featured?limit=3

# Se retornar HTTP 200, está funcionando!
```



