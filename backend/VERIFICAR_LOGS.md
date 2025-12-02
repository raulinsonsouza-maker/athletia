# Como Verificar os Logs do Backend

## 1. Se o backend está rodando localmente (desenvolvimento)

### Terminal onde o backend está rodando
Os logs aparecem diretamente no terminal onde você executou:
```bash
cd backend
npm run dev
```

### Ver logs em tempo real
Se você abriu um novo terminal, você pode:
- Voltar para o terminal onde o backend está rodando
- Ou verificar se há um arquivo de log (geralmente não há por padrão)

## 2. Se o backend está rodando em produção (servidor)

### Via SSH (se você tem acesso ao servidor)
```bash
# Conectar ao servidor
ssh usuario@athletia.site

# Ver logs do PM2 (se estiver usando PM2)
pm2 logs athletia-backend

# Ou ver logs do sistema
journalctl -u athletia-backend -f

# Ou ver logs do nginx (que pode mostrar erros 502)
tail -f /var/log/nginx/error.log
```

### Via Docker (se estiver usando Docker)
```bash
# Ver logs do container
docker logs -f athletia-backend

# Ou se o container tem outro nome
docker ps  # Para listar containers
docker logs -f <container-id>
```

## 3. Adicionar logs mais detalhados

Para ver mais logs, você pode:

### Opção 1: Adicionar console.log temporários
Adicione logs nos pontos críticos do código, por exemplo em `backend/src/controllers/admin.controller.ts`:

```typescript
console.log('[DEBUG] ID recebido:', id);
console.log('[DEBUG] É UUID?', isUuid);
console.log('[DEBUG] Exercício encontrado:', exercicio);
```

### Opção 2: Usar variável de ambiente para debug
O código já tem verificações `if (process.env.NODE_ENV !== 'production')` que mostram logs apenas em desenvolvimento.

## 4. Verificar logs específicos do erro 502

O erro 502 Bad Gateway geralmente significa que:
- O backend não está rodando
- O backend crashou
- O nginx não consegue se conectar ao backend

### Verificar se o backend está rodando
```bash
# No servidor
ps aux | grep node
# ou
pm2 list
# ou
systemctl status athletia-backend
```

### Verificar porta do backend
```bash
# Verificar se a porta 3001 está aberta e escutando
netstat -tulpn | grep 3001
# ou
lsof -i :3001
```

## 5. Logs mais comuns que você verá

### Em desenvolvimento (npm run dev)
- `[CONFIG] Caminho de upload de exercícios: ...`
- `[Media Route] Erro ao resolver mídia para ...`
- `[obterExercicio] Erro ao buscar no banco: ...`
- `[UploadMedia] ID recebido: ..., UUID real: ...`

### Em produção
Os mesmos logs, mas apenas se `NODE_ENV !== 'production'` (alguns logs são suprimidos)

## 6. Para debugar o problema atual

Execute o backend localmente e veja os logs em tempo real:

```bash
cd backend
npm run dev
```

Depois tente fazer a requisição que está dando erro e observe os logs no terminal.

