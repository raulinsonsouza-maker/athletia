# Troubleshooting Nginx - Headers de Cache e Gzip

## Problemas Identificados

- **Grade D (67) - Add Expires headers**: Headers de cache não estão funcionando
- **Grade C (78) - Compress components with gzip**: Gzip não está funcionando
- **9 requests com erro**: Possivelmente 404s ou outros erros

## Verificação Passo a Passo

### 1. Verificar se a Configuração foi Aplicada

```bash
# Verificar se o arquivo está no lugar correto
sudo cat /etc/nginx/sites-available/athletia.site | grep -A 5 "expires 1y"

# Deve mostrar:
# expires 1y;
# add_header Cache-Control "public, immutable, max-age=31536000";
```

### 2. Verificar se o Site está Habilitado

```bash
# Verificar link simbólico
ls -la /etc/nginx/sites-enabled/ | grep athletia

# Se não existir, criar:
sudo ln -s /etc/nginx/sites-available/athletia.site /etc/nginx/sites-enabled/athletia.site
```

### 3. Testar Configuração do Nginx

```bash
# Testar sintaxe
sudo nginx -t

# Se houver erros, corrigir antes de continuar
```

### 4. Verificar Headers de Cache

```bash
# Testar headers de um arquivo estático
curl -I https://athletia.site/assets/index.js

# Deve retornar:
# HTTP/1.1 200 OK
# Cache-Control: public, immutable, max-age=31536000
# Expires: (data futura, 1 ano à frente)
```

**Se não retornar os headers:**
- Verificar se a location block está correta
- Verificar se não há conflito com outras locations
- Verificar ordem das locations (assets devem vir antes de /)

### 5. Verificar Gzip

```bash
# Testar gzip
curl -H "Accept-Encoding: gzip" -I https://athletia.site/assets/index.js

# Deve retornar:
# HTTP/1.1 200 OK
# Content-Encoding: gzip
# Vary: Accept-Encoding
```

**Se não retornar Content-Encoding: gzip:**
- Verificar se `gzip on;` está dentro do bloco `server {}`
- Verificar se os tipos MIME estão corretos
- Verificar logs do nginx: `sudo tail -f /var/log/nginx/athletia-error.log`

### 6. Verificar Ordem das Locations

A ordem é CRÍTICA no nginx. Deve ser:

```nginx
# 1. Assets estáticos (JS, CSS, imagens) - MAIS ESPECÍFICO
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif|mp4|webm)$ {
    expires 1y;
    add_header Cache-Control "public, immutable, max-age=31536000";
    ...
}

# 2. HTML específico
location ~* \.html$ {
    expires 1h;
    ...
}

# 3. Location geral (SPA) - MENOS ESPECÍFICO, POR ÚLTIMO
location / {
    try_files $uri $uri/ /index.html;
    ...
}
```

### 7. Verificar Conflitos

```bash
# Verificar se há outras configurações que podem estar sobrescrevendo
grep -r "add_header" /etc/nginx/ | grep -v "#"
grep -r "expires" /etc/nginx/ | grep -v "#"
```

### 8. Verificar Logs

```bash
# Ver erros do nginx
sudo tail -50 /var/log/nginx/athletia-error.log

# Ver acessos
sudo tail -50 /var/log/nginx/athletia-access.log
```

## Soluções Comuns

### Problema: Headers não aparecem

**Causa:** Location block não está sendo aplicado ou há conflito

**Solução:**
1. Verificar ordem das locations
2. Verificar se a regex está correta
3. Testar com `curl -v` para ver todos os headers

### Problema: Gzip não funciona

**Causa 1:** Gzip não está habilitado no nível correto

**Solução:**
```nginx
# Deve estar dentro do bloco server {}
server {
    ...
    gzip on;
    gzip_vary on;
    ...
}
```

**Causa 2:** Tipos MIME não estão incluídos

**Solução:**
Verificar se `application/javascript` e `text/css` estão em `gzip_types`

**Causa 3:** Arquivo muito pequeno

**Solução:**
Verificar `gzip_min_length` (padrão: 1000 bytes)

### Problema: Requests com erro (404)

**Causa:** Recursos não existem ou paths incorretos

**Solução:**
1. Verificar se os arquivos existem no servidor
2. Verificar paths no código
3. Verificar se o build foi feito corretamente

## Comandos de Diagnóstico Completo

```bash
# 1. Verificar configuração
sudo nginx -t

# 2. Verificar se site está habilitado
ls -la /etc/nginx/sites-enabled/ | grep athletia

# 3. Verificar headers de cache
curl -I https://athletia.site/assets/index.js | grep -i "cache\|expires"

# 4. Verificar gzip
curl -H "Accept-Encoding: gzip" -I https://athletia.site/assets/index.js | grep -i "content-encoding\|vary"

# 5. Verificar tamanho comprimido vs não comprimido
curl -H "Accept-Encoding: gzip" -s https://athletia.site/assets/index.js | wc -c
curl -s https://athletia.site/assets/index.js | wc -c

# 6. Verificar logs em tempo real
sudo tail -f /var/log/nginx/athletia-access.log
sudo tail -f /var/log/nginx/athletia-error.log

# 7. Recarregar nginx após mudanças
sudo systemctl reload nginx
```

## Aplicar Correções

Se a configuração não foi aplicada:

```bash
# 1. Copiar arquivo atualizado
sudo cp nginx-athletia-site.conf /etc/nginx/sites-available/athletia.site

# 2. Verificar sintaxe
sudo nginx -t

# 3. Se OK, recarregar
sudo systemctl reload nginx

# 4. Verificar se está funcionando
curl -I https://athletia.site/assets/index.js
```

## Resultado Esperado

Após aplicar todas as correções:

```bash
$ curl -I https://athletia.site/assets/index.js
HTTP/1.1 200 OK
Server: nginx/...
Date: ...
Content-Type: application/javascript
Content-Length: ...
Last-Modified: ...
ETag: ...
Expires: ... (1 ano no futuro)
Cache-Control: public, immutable, max-age=31536000
X-Content-Type-Options: nosniff
Accept-Ranges: bytes

$ curl -H "Accept-Encoding: gzip" -I https://athletia.site/assets/index.js
HTTP/1.1 200 OK
...
Content-Encoding: gzip
Vary: Accept-Encoding
...
```

## Próximos Passos

1. Aplicar configuração do nginx no servidor
2. Verificar headers com curl
3. Testar novamente no Pingdom
4. Verificar se os erros foram resolvidos

