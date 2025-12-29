# Instruções Finais - Corrigir Conflito do Nginx

## Problema

O nginx está retornando:
- `content-type: text/html` (deveria ser `application/javascript`)
- `cache-control: no-cache` (deveria ser `public, immutable, max-age=31536000`)

E há warnings:
```
conflicting server name "athletia.site" on 0.0.0.0:80, ignored
```

Isso indica que há **múltiplos arquivos** configurando o mesmo domínio.

## Solução Completa

### Opção 1: Script Automático (Recomendado)

```bash
cd /opt/athletia
chmod +x CORRIGIR_CONFLITO_NGINX.sh
sudo ./CORRIGIR_CONFLITO_NGINX.sh
```

### Opção 2: Manual (Passo a Passo)

```bash
# 1. Ver todos os arquivos ativos
ls -la /etc/nginx/sites-enabled/ | grep athletia

# 2. Ver quais configuram athletia.site
sudo grep -l "server_name.*athletia.site" /etc/nginx/sites-enabled/*

# 3. Fazer backup
sudo cp /etc/nginx/sites-enabled/athletia /etc/nginx/sites-enabled/athletia.backup.manual

# 4. Remover TODOS os arquivos athletia de sites-enabled
sudo rm -f /etc/nginx/sites-enabled/athletia*
sudo rm -f /etc/nginx/sites-enabled/*athletia*

# 5. Atualizar arquivo correto
sudo cp /opt/athletia/nginx-athletia-site.conf /etc/nginx/sites-available/athletia.site

# 6. Criar link simbólico
sudo ln -sf /etc/nginx/sites-available/athletia.site /etc/nginx/sites-enabled/athletia.site

# 7. Verificar que só há um arquivo
ls -la /etc/nginx/sites-enabled/ | grep athletia

# Deve mostrar apenas:
# athletia.site -> /etc/nginx/sites-available/athletia.site

# 8. Testar
sudo nginx -t

# 9. Se OK, recarregar
sudo systemctl reload nginx

# 10. Verificar
curl -I https://athletia.site/assets/index.js | grep -i "cache\|expires\|content-type"
```

## Resultado Esperado

Após corrigir:

```bash
$ curl -I https://athletia.site/assets/index.js
HTTP/2 200
server: nginx/1.22.1
content-type: application/javascript  ✅
Cache-Control: public, immutable, max-age=31536000  ✅
Expires: ... (data futura)  ✅
```

E **sem warnings** ao executar `nginx -t`.

## Verificação Final

```bash
# 1. Verificar arquivos ativos (deve ter apenas 1)
ls -la /etc/nginx/sites-enabled/ | grep athletia

# 2. Verificar headers
curl -I https://athletia.site/assets/index.js

# 3. Verificar gzip
curl -H "Accept-Encoding: gzip" -I https://athletia.site/assets/index.js

# 4. Testar no Pingdom
# https://tools.pingdom.com/
```

## Se Ainda Houver Problema

Se após corrigir ainda houver problema:

```bash
# Ver configuração completa que o nginx está usando
sudo nginx -T | grep -A 30 "server_name.*athletia.site"

# Ver logs de erro
sudo tail -50 /var/log/nginx/athletia-error.log

# Ver status do nginx
sudo systemctl status nginx
```

