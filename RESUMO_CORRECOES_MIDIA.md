# Resumo das Correções - Mídias de Exercícios

## Problema Identificado

As mídias dos exercícios não estavam carregando, retornando 404 mesmo quando:
- ✅ O backend funciona localmente (200 OK)
- ✅ O arquivo existe no sistema de arquivos
- ✅ O exercício existe no banco de dados

## Causa Raiz

1. **Nginx não estava encaminhando corretamente**: A location `/api/` não tinha prioridade sobre `location /`
2. **Rota do Express não capturava corretamente**: A rota `/:exercicioId/media*` não funciona no Express
3. **Resolução de exercício falhava**: Slug não estava sendo resolvido corretamente para UUID

## Correções Implementadas

### 1. Nginx (`nginx-athletia-site.conf`)

**Antes:**
```nginx
location /api/ {
    proxy_pass http://localhost:3001;
    ...
}
```

**Depois:**
```nginx
location ^~ /api/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    ...
    # Timeouts adicionados
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

**Mudança crítica**: Adicionado `^~` para garantir prioridade absoluta sobre `location /`

### 2. Rota do Express (`backend/src/routes/exercicio-media.routes.ts`)

**Antes:**
```typescript
router.get('/:exercicioId/media.*', serveMedia);
```

**Depois:**
```typescript
// Rota específica para extensões conhecidas
router.get('/:exercicioId/media.:extension(gif|jpg|jpeg|png|webp|mp4|webm)', serveMedia);
// Fallback para qualquer outra extensão
router.get('/:exercicioId/media.:extension', serveMedia);
```

**Mudança crítica**: Removido `*` (não funciona no Express) e usado parâmetro `:extension`

### 3. Controller (`backend/src/controllers/exercicio-media.controller.ts`)

**Melhorias:**
- Usa parâmetro `extension` da rota (prioridade)
- Fallback para extração do path/URL
- Logs detalhados para diagnóstico
- Melhor tratamento de erros

### 4. Resolução de Exercício (`backend/src/utils/resolve-exercicio-id.ts`)

**Melhorias:**
- Busca primeiro pelo ID diretamente (funciona com slug ou UUID)
- Múltiplas estratégias de busca por slug
- Busca parcial por palavras do slug

### 5. Busca de Arquivo (`backend/src/services/exercicio-media.service.ts`)

**Melhorias:**
- Tenta múltiplos IDs (UUID e slug original)
- Logs detalhados mostrando quais IDs foram tentados
- Lista diretórios existentes quando não encontra

## Como Aplicar no Servidor

```bash
# 1. Aplicar configuração do Nginx
sudo cp nginx-athletia-site.conf /etc/nginx/sites-available/athletia.site
sudo nginx -t
sudo systemctl reload nginx

# 2. Rebuild e restart do backend
cd /opt/athletia/backend
npm run build
pm2 restart all

# 3. Testar
curl -I https://athletia.site/api/exercicios/crucifixo-declinado-halteres/media.gif
```

## Verificação

### Teste Local (Backend)
```bash
curl -I http://localhost:3001/api/exercicios/crucifixo-declinado-halteres/media.gif
# Esperado: HTTP/1.1 200 OK
```

### Teste via Nginx
```bash
curl -I https://athletia.site/api/exercicios/crucifixo-declinado-halteres/media.gif
# Esperado: HTTP/2 200
```

### Verificar Logs
```bash
# Logs do backend
pm2 logs athletia-backend --lines 50 | grep exercicio-media

# Logs do Nginx
sudo tail -f /var/log/nginx/athletia-error.log
```

## Ordem de Prioridade das Locations no Nginx

1. `location ^~ /media/` - Uploads diretos (prioridade absoluta)
2. `location /socket.io/` - WebSocket
3. `location ^~ /api/` - Backend API (prioridade absoluta)
4. `location ^~ /assets/` - Assets do frontend
5. `location ~* \.(extensões)$` - Arquivos estáticos
6. `location /` - Frontend SPA (catch-all)

## Troubleshooting

### Se ainda retornar 404 via Nginx:

1. **Verificar se a configuração foi aplicada:**
   ```bash
   sudo nginx -T | grep -A 10 "location.*/api/"
   ```

2. **Verificar se o backend está acessível:**
   ```bash
   curl -I http://localhost:3001/api/health
   ```

3. **Verificar logs do Nginx:**
   ```bash
   sudo tail -f /var/log/nginx/athletia-error.log
   ```

4. **Testar proxy diretamente:**
   ```bash
   curl -H "Host: athletia.site" http://localhost:3001/api/exercicios/crucifixo-declinado-halteres/media.gif
   ```

### Se o backend retornar 404:

1. **Verificar se o exercício existe:**
   ```bash
   cd /opt/athletia/backend
   npx prisma studio
   # Buscar por "crucifixo"
   ```

2. **Verificar se o arquivo existe:**
   ```bash
   ls -la /opt/athletia/backend/upload/exercicios/crucifixo-declinado-halteres/
   ```

3. **Verificar logs do backend:**
   ```bash
   pm2 logs athletia-backend | grep -i "exercicio\|media\|404"
   ```

## Status Esperado

Após aplicar todas as correções:
- ✅ Backend local: 200 OK
- ✅ Nginx HTTPS: 200 OK
- ✅ Mídias carregam no frontend
- ✅ Logs mostram requisições sendo processadas

