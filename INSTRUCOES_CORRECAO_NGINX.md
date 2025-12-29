# Instruções para Corrigir Nginx no Servidor

## Problema Identificado

O nginx está usando o arquivo **errado**:
- ✅ Arquivo correto: `/etc/nginx/sites-available/athletia.site` (com headers de cache)
- ❌ Arquivo ativo: `/etc/nginx/sites-enabled/athletia` (sem .site, com `Cache-Control: no-cache`)

Isso explica por que:
- Headers de cache não funcionam (está usando arquivo antigo)
- `content-type: text/html` para JS (está caindo na location `/` em vez de assets)
- Gzip funciona, mas cache não

## Solução Rápida (Script Automático)

```bash
# Executar script de correção
cd /opt/athletia
chmod +x CORRIGIR_NGINX_SERVIDOR.sh
sudo ./CORRIGIR_NGINX_SERVIDOR.sh
```

## Solução Manual (Passo a Passo)

### 1. Fazer Backup

```bash
sudo cp /etc/nginx/sites-enabled/athletia /etc/nginx/sites-enabled/athletia.old.backup
```

### 2. Remover Arquivos Antigos

```bash
# Remover arquivo antigo (sem .site)
sudo rm /etc/nginx/sites-enabled/athletia

# Remover backup antigo se existir
sudo rm /etc/nginx/sites-enabled/athletia.backup.*
```

### 3. Criar Link Simbólico Correto

```bash
# Criar link para o arquivo correto
sudo ln -sf /etc/nginx/sites-available/athletia.site /etc/nginx/sites-enabled/athletia.site
```

### 4. Verificar Conflitos

```bash
# Verificar se há outros arquivos configurando o mesmo domínio
sudo grep -r "server_name.*athletia.site" /etc/nginx/sites-enabled/
```

Se houver outros arquivos, removê-los ou comentar os blocos `server {}` conflitantes.

### 5. Testar Configuração

```bash
sudo nginx -t
```

Deve retornar: `syntax is ok` e `test is successful`

### 6. Recarregar Nginx

```bash
sudo systemctl reload nginx
```

### 7. Verificar se Está Funcionando

```bash
# Verificar headers de cache
curl -I https://athletia.site/assets/index.js | grep -i "cache\|expires\|content-type"

# Deve mostrar:
# content-type: application/javascript (não text/html!)
# Cache-Control: public, immutable, max-age=31536000
# Expires: (data futura)

# Verificar gzip
curl -H "Accept-Encoding: gzip" -I https://athletia.site/assets/index.js | grep -i "content-encoding\|vary"

# Deve mostrar:
# Content-Encoding: gzip
# Vary: Accept-Encoding
```

## Verificação Final

Após corrigir, executar:

```bash
# 1. Verificar qual arquivo está ativo
ls -la /etc/nginx/sites-enabled/ | grep athletia

# Deve mostrar apenas:
# athletia.site -> /etc/nginx/sites-available/athletia.site

# 2. Verificar headers
curl -I https://athletia.site/assets/index.js

# Deve retornar:
# HTTP/2 200
# content-type: application/javascript
# Cache-Control: public, immutable, max-age=31536000
# Expires: (data futura)

# 3. Testar no Pingdom novamente
# https://tools.pingdom.com/
```

## Resultado Esperado

Após corrigir:
- ✅ **Headers de cache**: Funcionando (Grade D → A)
- ✅ **Content-Type correto**: `application/javascript` (não `text/html`)
- ✅ **Gzip**: Já funcionando (mantém Grade A)
- ✅ **Performance**: A94 → A98-100

## Troubleshooting

### Se ainda houver conflitos:

```bash
# Ver todos os arquivos que configuram athletia.site
sudo grep -r "athletia.site" /etc/nginx/sites-enabled/

# Verificar qual está sendo usado primeiro
sudo nginx -T | grep -A 20 "server_name.*athletia.site"
```

### Se o link simbólico não funcionar:

```bash
# Verificar se o arquivo existe
ls -la /etc/nginx/sites-available/athletia.site

# Se não existir, copiar do repositório
sudo cp /opt/athletia/nginx-athletia-site.conf /etc/nginx/sites-available/athletia.site

# Criar link novamente
sudo ln -sf /etc/nginx/sites-available/athletia.site /etc/nginx/sites-enabled/athletia.site
```

