# Instruções para Resolver Conflito Git e Aplicar Correção

## Problema

Há mudanças não commitadas que impedem o `git pull`.

## Solução Rápida (Script Automático)

```bash
cd /opt/athletia
chmod +x RESOLVER_GIT_E_APLICAR.sh
sudo ./RESOLVER_GIT_E_APLICAR.sh
```

## Solução Manual

### Opção 1: Salvar mudanças temporariamente (Recomendado)

```bash
# 1. Ver o que foi modificado
git status

# 2. Salvar mudanças temporariamente
git stash push -m "Mudanças locais antes do pull"

# 3. Fazer pull
git pull

# 4. Aplicar correção do nginx
sudo cp /opt/athletia/nginx-athletia-site.conf /etc/nginx/sites-available/athletia.site
sudo nginx -t
sudo systemctl reload nginx

# 5. Se precisar das mudanças depois:
git stash list    # Ver stashes salvos
git stash pop     # Restaurar último stash
```

### Opção 2: Descartar mudanças locais (Se não forem importantes)

```bash
# 1. Ver o que será descartado
git status
git diff

# 2. Descartar todas as mudanças
git reset --hard HEAD

# 3. Fazer pull
git pull

# 4. Aplicar correção do nginx
sudo cp /opt/athletia/nginx-athletia-site.conf /etc/nginx/sites-available/athletia.site
sudo nginx -t
sudo systemctl reload nginx
```

### Opção 3: Commitar mudanças locais (Se forem importantes)

```bash
# 1. Adicionar mudanças
git add .

# 2. Commitar
git commit -m "Mudanças locais antes do pull"

# 3. Fazer pull
git pull

# 4. Aplicar correção do nginx
sudo cp /opt/athletia/nginx-athletia-site.conf /etc/nginx/sites-available/athletia.site
sudo nginx -t
sudo systemctl reload nginx
```

## Após Resolver Git

Depois de fazer o pull, aplicar a correção do nginx:

```bash
# 1. Atualizar arquivo de configuração
sudo cp /opt/athletia/nginx-athletia-site.conf /etc/nginx/sites-available/athletia.site

# 2. Testar
sudo nginx -t

# 3. Recarregar
sudo systemctl reload nginx

# 4. Verificar
curl -I https://athletia.site/assets/index.js | grep -i "content-type\|cache-control\|expires"
```

## Resultado Esperado

Após aplicar:

```bash
$ curl -I https://athletia.site/assets/index.js
HTTP/2 200
content-type: application/javascript  ✅
Cache-Control: public, immutable, max-age=31536000  ✅
Expires: (data futura)  ✅
```

