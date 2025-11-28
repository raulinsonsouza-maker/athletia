# Guia para Corrigir Erros do Deploy

## Problemas Identificados

1. **Vulnerabilidades npm** (3 vulnerabilities: 2 moderate, 1 high)
2. **Chunk size warning** (>500KB após minificação)
3. **Erro PM2**: `Process or Namespace athletia-frontend not found`

## Soluções

### 1. Corrigir Vulnerabilidades npm

Execute no servidor:

```bash
cd /opt/athletia/frontend
npm audit fix
```

Se houver vulnerabilidades que requerem breaking changes, você pode tentar (com cuidado):

```bash
npm audit fix --force
```

**Nota**: `--force` pode quebrar dependências. Teste após executar.

### 2. Chunk Size Warning (Já Corrigido)

O arquivo `frontend/vite.config.ts` foi atualizado com:
- Code splitting manual para separar vendors (React, Chart.js, Axios)
- Limite de aviso aumentado para 600KB

Isso reduzirá o tamanho do bundle principal e melhorará o carregamento.

### 3. Erro PM2 do Frontend

**IMPORTANTE**: O frontend NÃO precisa rodar no PM2 porque é servido como arquivos estáticos pelo NGINX.

O erro ocorre porque o script de deploy está tentando reiniciar um processo PM2 que não existe.

#### Solução A: Remover comando PM2 do script de deploy

Se você tiver um script de deploy, remova ou comente a linha que tenta reiniciar o frontend:

```bash
# REMOVER ou COMENTAR esta linha:
# pm2 restart athletia-frontend
```

#### Solução B: Verificar se o frontend está buildado corretamente

O frontend só precisa ser buildado, não precisa rodar no PM2:

```bash
cd /opt/athletia/frontend
npm run build
```

Verificar se os arquivos estão em `/opt/athletia/frontend/dist/`:

```bash
ls -la /opt/athletia/frontend/dist/
```

#### Solução C: Se realmente precisar do PM2 (não recomendado)

Se por algum motivo você quiser rodar o frontend no PM2 (não é necessário), você precisaria:

1. Criar um arquivo `ecosystem.config.js` na raiz:

```javascript
module.exports = {
  apps: [
    {
      name: 'athletia-backend',
      script: './backend/dist/index.js',
      cwd: '/opt/athletia/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      }
    }
    // Frontend NÃO precisa estar aqui - é servido pelo NGINX
  ]
}
```

2. Iniciar apenas o backend:

```bash
pm2 start ecosystem.config.js
# ou
pm2 restart athletia-backend
```

## Checklist de Deploy Correto

Após fazer as correções:

```bash
# 1. Corrigir vulnerabilidades
cd /opt/athletia/frontend
npm audit fix

# 2. Fazer build do frontend
npm run build

# 3. Verificar se os arquivos foram gerados
ls -la dist/

# 4. Verificar se o NGINX está servindo corretamente
sudo nginx -t
sudo systemctl reload nginx

# 5. Verificar status do backend (único que precisa do PM2)
pm2 list
pm2 logs athletia-backend --lines 20

# 6. Testar acesso
curl https://athletia.site/api/health
```

## Resumo

- ✅ **Frontend**: Buildado e servido pelo NGINX (não precisa PM2)
- ✅ **Backend**: Roda no PM2 como `athletia-backend`
- ✅ **Vulnerabilidades**: Corrigir com `npm audit fix`
- ✅ **Bundle size**: Já otimizado com code splitting

## Comandos Rápidos

```bash
# Deploy completo (após correções)
cd /opt/athletia/frontend
npm audit fix
npm run build

# Verificar backend
pm2 restart athletia-backend
pm2 logs athletia-backend

# Verificar NGINX
sudo nginx -t
sudo systemctl reload nginx
```

