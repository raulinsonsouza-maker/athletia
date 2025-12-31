# Configuração Nginx - Location /media/

## Problema Resolvido

A configuração do Nginx estava sem a location `/media/` necessária para servir arquivos de upload diretamente do sistema de arquivos, causando erros 404 em imagens e mídias.

## Solução Implementada

### Arquivos Modificados

1. **`nginx-athletia-site.conf`** - Configuração completa e limpa com:
   - Location `/media/` com prioridade absoluta (`^~`)
   - HTTP redirecionando para HTTPS
   - Todas as locations na ordem correta
   - Certificados Let's Encrypt configurados

2. **`APLICAR_NGINX_MEDIA.sh`** - Script para aplicar a configuração no servidor

## Estrutura da Configuração

### Ordem de Prioridade das Locations

1. **`/media/`** - Serve uploads do diretório `/opt/athletia/backend/upload/`
   - Prioridade absoluta com `^~`
   - Cache de 1 ano
   - Directory listing desabilitado

2. **`/socket.io/`** - WebSocket para Socket.IO
   - Deve vir antes de `/api/`

3. **`/api/`** - Backend API
   - Proxy para `http://localhost:3001`

4. **`/assets/`** - Assets do frontend (JS, CSS compilados)

5. **`/`** - Frontend SPA (catch-all)
   - Deve vir por último

## Como Aplicar no Servidor

### Opção 1: Usar o Script (Recomendado)

```bash
# No servidor, navegue até o diretório do projeto
cd /opt/athletia

# Execute o script com sudo
sudo bash APLICAR_NGINX_MEDIA.sh
```

### Opção 2: Manual

```bash
# 1. Fazer backup do arquivo atual
sudo cp /etc/nginx/sites-available/athletia.site /etc/nginx/sites-available/athletia.site.backup.$(date +%Y%m%d_%H%M%S)

# 2. Copiar nova configuração
sudo cp nginx-athletia-site.conf /etc/nginx/sites-available/athletia.site

# 3. Criar link simbólico (se não existir)
sudo ln -sf /etc/nginx/sites-available/athletia.site /etc/nginx/sites-enabled/athletia.site

# 4. Validar configuração
sudo nginx -t

# 5. Recarregar Nginx
sudo systemctl reload nginx
```

## Verificação

### Testar Location /media/

```bash
# Testar com um arquivo real de upload
curl -I https://athletia.site/media/exercicios/stiff/media.gif

# Resultado esperado:
# HTTP/2 200
# Content-Type: image/gif
# Cache-Control: public, immutable
```

### Verificar Logs

```bash
# Ver logs de erro
sudo tail -f /var/log/nginx/athletia-error.log

# Ver logs de acesso
sudo tail -f /var/log/nginx/athletia-access.log
```

## Detalhes Técnicos

### Location /media/

```nginx
location ^~ /media/ {
    alias /opt/athletia/backend/upload/;
    access_log off;
    expires 365d;
    add_header Cache-Control "public, immutable";
    add_header X-Content-Type-Options "nosniff" always;
    autoindex off;
    try_files $uri =404;
}
```

**Características:**
- `^~` garante prioridade absoluta sobre outras locations
- `alias` aponta para diretório de uploads
- Cache de 1 ano para arquivos estáticos
- `access_log off` para reduzir logs
- `autoindex off` por segurança
- `try_files $uri =404` retorna 404 se arquivo não existir

### Certificados SSL

A configuração usa Let's Encrypt:
- Certificado: `/etc/letsencrypt/live/athletia.site/fullchain.pem`
- Chave: `/etc/letsencrypt/live/athletia.site/privkey.pem`

Se os certificados não estiverem configurados, execute:
```bash
sudo certbot --nginx -d athletia.site -d www.athletia.site
```

## Troubleshooting

### Erro: "nginx: configuration file /etc/nginx/nginx.conf test failed"

1. Verifique a sintaxe:
   ```bash
   sudo nginx -t
   ```

2. Verifique se há chaves desalinhadas ou código fora de blocos `server {}`

3. Restaure o backup se necessário:
   ```bash
   sudo cp /etc/nginx/sites-available/athletia.site.backup.* /etc/nginx/sites-available/athletia.site
   sudo nginx -t && sudo systemctl reload nginx
   ```

### Erro 404 em /media/

1. Verifique se o diretório existe:
   ```bash
   ls -la /opt/athletia/backend/upload/
   ```

2. Verifique permissões:
   ```bash
   sudo chown -R www-data:www-data /opt/athletia/backend/upload/
   sudo chmod -R 755 /opt/athletia/backend/upload/
   ```

3. Verifique se o caminho no alias está correto (deve terminar com `/`)

### Arquivo retorna HTML do frontend

Isso indica que a location `/media/` não está sendo capturada. Verifique:
1. Se a location está antes de `location /`
2. Se está usando `^~` para prioridade
3. Se não há outras locations conflitantes

## Estrutura de Diretórios Esperada

```
/opt/athletia/backend/upload/
├── exercicios/
│   └── {exercicioId}/
│       └── media.{ext}
├── grupos-musculares/
│   └── {grupoId}/
│       └── capa.{ext}
├── imagens-banco/
│   └── {arquivo}
└── imagens-sistema/
    └── {arquivo}
```

## Notas Importantes

1. **Ordem das Locations**: A ordem importa no Nginx. `/media/` deve vir antes de todas as outras locations.

2. **Prioridade `^~`**: Garante que `/media/` tenha prioridade sobre regex patterns e location `/`.

3. **Alias vs Root**: Usamos `alias` porque queremos mapear `/media/` diretamente para o diretório de uploads, não como subdiretório do root.

4. **Cache**: Arquivos de upload são cacheados por 1 ano, pois são imutáveis após upload.

5. **Segurança**: Directory listing está desabilitado para evitar exposição de estrutura de diretórios.

