# Solução Rápida - Erro do Nginx

## Erro Encontrado

```
"map" directive is not allowed here in /etc/nginx/sites-enabled/athletia.site:39
```

## Causa

A diretiva `map` não pode estar dentro de um bloco `server {}`, apenas no contexto `http {}`.

## Solução Imediata

Execute no servidor:

```bash
# 1. Atualizar arquivo de configuração (já corrigido no repositório)
sudo cp /opt/athletia/nginx-athletia-site.conf /etc/nginx/sites-available/athletia.site

# 2. Testar configuração
sudo nginx -t

# 3. Se OK, recarregar
sudo systemctl reload nginx

# 4. Verificar se funcionou
curl -I https://athletia.site/assets/index.js | grep -i "cache\|expires\|content-type"
```

## O Que Foi Corrigido

- ✅ Removida diretiva `map` do bloco `server {}`
- ✅ Substituída por configuração direta de WebSocket que funciona dentro de `server {}`
- ✅ Mantida funcionalidade de WebSocket

## Resultado Esperado

Após executar os comandos:

```bash
$ curl -I https://athletia.site/assets/index.js
HTTP/2 200
content-type: application/javascript
Cache-Control: public, immutable, max-age=31536000
Expires: (data futura)
```

## Se Ainda Houver Erro

Se o erro persistir, verificar:

```bash
# Ver linha 39 do arquivo
sudo sed -n '35,45p' /etc/nginx/sites-available/athletia.site

# Deve mostrar location /socket.io/ sem map directive
```

