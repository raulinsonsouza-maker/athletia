# 🚀 Guia de Instalação e Configuração do NGINX para athletia.site

## 📋 Pré-requisitos

- NGINX instalado na VPS
- Domínio `athletia.site` apontando para o IP `191.252.109.144`
- Backend rodando na porta 3001 (localhost)
- Frontend buildado em `/opt/athletia/frontend/dist/`

## 🔧 Passo a Passo

### 1. Copiar arquivo de configuração

```bash
# Copiar o arquivo de configuração para o diretório do NGINX
sudo cp nginx-athletia-site.conf /etc/nginx/sites-available/athletia.site
```

### 2. Criar link simbólico para ativar o site

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/athletia.site /etc/nginx/sites-enabled/athletia.site

# Verificar se o link foi criado
ls -la /etc/nginx/sites-enabled/ | grep athletia
```

### 3. Verificar se o diretório do frontend existe

```bash
# Verificar se o build do frontend existe
ls -la /opt/athletia/frontend/dist/

# Se não existir, fazer o build:
cd /opt/athletia/frontend
npm run build
```

### 4. Testar configuração do NGINX

```bash
# Testar se a configuração está correta
sudo nginx -t
```

**Saída esperada:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 5. Recarregar NGINX

```bash
# Recarregar NGINX (sem downtime)
sudo systemctl reload nginx

# Ou reiniciar se necessário
sudo systemctl restart nginx
```

### 6. Verificar status do NGINX

```bash
# Verificar se o NGINX está rodando
sudo systemctl status nginx
```

### 7. Testar acesso

```bash
# Testar se o domínio está respondendo
curl -I http://athletia.site

# Ou testar localmente
curl -I http://localhost
```

**Saída esperada:**
```
HTTP/1.1 200 OK
Server: nginx/...
```

## 🔍 Verificação e Troubleshooting

### Verificar logs do NGINX

```bash
# Logs de acesso
sudo tail -f /var/log/nginx/athletia-access.log

# Logs de erro
sudo tail -f /var/log/nginx/athletia-error.log

# Logs gerais do NGINX
sudo tail -f /var/log/nginx/error.log
```

### Verificar se o backend está respondendo

```bash
# Testar backend localmente
curl http://localhost:3001/health

# Testar através do proxy
curl http://athletia.site/api/health
```

### Verificar se o frontend está sendo servido

```bash
# Verificar se o index.html existe
ls -la /opt/athletia/frontend/dist/index.html

# Testar acesso ao frontend
curl http://athletia.site/
```

### Problemas comuns

#### 1. Erro 502 Bad Gateway
- **Causa**: Backend não está rodando ou não está na porta 3001
- **Solução**: 
  ```bash
  # Verificar se o backend está rodando
  pm2 list
  
  # Verificar se está na porta correta
  netstat -tlnp | grep 3001
  ```

#### 2. Erro 404 Not Found
- **Causa**: Diretório do frontend não existe ou build não foi feito
- **Solução**:
  ```bash
  # Fazer build do frontend
  cd /opt/athletia/frontend
  npm run build
  
  # Verificar se o diretório existe
  ls -la /opt/athletia/frontend/dist/
  ```

#### 3. Erro de permissão
- **Causa**: NGINX não tem permissão para ler os arquivos
- **Solução**:
  ```bash
  # Dar permissão de leitura
  sudo chmod -R 755 /opt/athletia/frontend/dist/
  sudo chown -R www-data:www-data /opt/athletia/frontend/dist/
  ```

#### 4. DNS não propagou
- **Causa**: DNS ainda não propagou (pode levar 10-30 minutos)
- **Solução**: Aguardar ou testar diretamente pelo IP:
  ```bash
  curl -H "Host: athletia.site" http://191.252.109.144
  ```

## 🔒 Configurar SSL/HTTPS (Após DNS propagar)

### 1. Instalar Certbot

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

### 2. Obter certificado SSL

```bash
sudo certbot --nginx -d athletia.site -d www.athletia.site
```

### 3. Atualizar configuração do NGINX

Após o certbot configurar, descomentar o bloco HTTPS no arquivo de configuração:

```bash
sudo nano /etc/nginx/sites-available/athletia.site
```

Descomentar o bloco `server { listen 443 ... }` e comentar o bloco HTTP.

### 4. Recarregar NGINX

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Renovação automática

O certbot configura renovação automática, mas você pode testar:

```bash
sudo certbot renew --dry-run
```

## 📝 Atualizar Variáveis de Ambiente

### Backend

Editar `/opt/athletia/backend/.env`:

```env
FRONTEND_URL=https://athletia.site
# ou para HTTP temporário:
# FRONTEND_URL=http://athletia.site
```

Reiniciar backend:

```bash
pm2 restart athletia-backend
```

### Frontend

Editar `/opt/athletia/frontend/.env` ou `.env.production`:

```env
VITE_API_URL=https://athletia.site/api
# ou relativo (recomendado):
# VITE_API_URL=/api
```

**Importante**: Após alterar variáveis do frontend, fazer novo build:

```bash
cd /opt/athletia/frontend
npm run build
```

## ✅ Checklist Final

- [ ] Arquivo de configuração copiado para `/etc/nginx/sites-available/athletia.site`
- [ ] Link simbólico criado em `/etc/nginx/sites-enabled/`
- [ ] Configuração testada com `nginx -t`
- [ ] NGINX recarregado
- [ ] Frontend buildado em `/opt/athletia/frontend/dist/`
- [ ] Backend rodando na porta 3001
- [ ] Domínio acessível via HTTP
- [ ] SSL configurado (após DNS propagar)
- [ ] Variáveis de ambiente atualizadas
- [ ] Sistema funcionando corretamente

## 🎯 Comandos Rápidos de Referência

```bash
# Testar configuração
sudo nginx -t

# Recarregar NGINX
sudo systemctl reload nginx

# Ver logs em tempo real
sudo tail -f /var/log/nginx/athletia-error.log

# Verificar status do backend
pm2 list

# Fazer build do frontend
cd /opt/athletia/frontend && npm run build

# Testar API
curl http://athletia.site/api/health
```

## 📞 Suporte

Se encontrar problemas, verificar:
1. Logs do NGINX: `/var/log/nginx/athletia-error.log`
2. Status do backend: `pm2 logs athletia-backend`
3. Status do NGINX: `sudo systemctl status nginx`
4. DNS: `nslookup athletia.site`

