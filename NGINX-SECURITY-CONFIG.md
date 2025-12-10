# Configurações de Segurança NGINX para AthletIA

## ⚠️ IMPORTANTE: Configurações que precisam ser aplicadas no servidor NGINX

Este arquivo contém as configurações de segurança que devem ser adicionadas ao arquivo de configuração do NGINX para melhorar SEO e Best Practices.

## 📍 Localização do arquivo de configuração

Normalmente em: `/etc/nginx/sites-available/athletia-site` ou `/etc/nginx/nginx.conf`

---

## ✅ 1. Headers de Segurança (HSTS, CSP, COOP)

Adicione estas linhas dentro do bloco `server { ... }`:

```nginx
# Strict-Transport-Security (HSTS) - Força HTTPS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Content-Security-Policy (CSP) - Proteção contra XSS
add_header Content-Security-Policy "default-src 'self' https: data: blob:; img-src 'self' https: data:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https: data:; script-src 'self' https: 'unsafe-inline' 'unsafe-eval';" always;

# Cross-Origin-Opener-Policy - Isolamento de origem
add_header Cross-Origin-Opener-Policy "same-origin" always;

# Cross-Origin-Embedder-Policy (opcional, pode quebrar alguns recursos)
# add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

---

## ✅ 2. Verificar robots.txt

Certifique-se de que o NGINX está servindo o arquivo `robots.txt` corretamente:

```nginx
# Servir robots.txt corretamente
location = /robots.txt {
    alias /opt/athletia/frontend/dist/robots.txt;
    access_log off;
    add_header Content-Type text/plain;
}
```

**OU** se estiver usando `try_files`:

```nginx
location = /robots.txt {
    root /opt/athletia/frontend/dist;
    access_log off;
    add_header Content-Type text/plain;
}
```

---

## ✅ 3. Verificar sitemap.xml

```nginx
location = /sitemap.xml {
    root /opt/athletia/frontend/dist;
    access_log off;
    add_header Content-Type application/xml;
}
```

---

## ✅ 4. Após fazer as alterações

1. Testar configuração:
```bash
sudo nginx -t
```

2. Recarregar NGINX:
```bash
sudo systemctl reload nginx
```

---

## 📝 Exemplo completo de bloco server

```nginx
server {
    listen 80;
    server_name athletia.site www.athletia.site;

    root /opt/athletia/frontend/dist;
    index index.html;

    # Headers de segurança
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self' https: data: blob:; img-src 'self' https: data:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https: data:; script-src 'self' https: 'unsafe-inline' 'unsafe-eval';" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;

    # Servir robots.txt corretamente
    location = /robots.txt {
        root /opt/athletia/frontend/dist;
        access_log off;
        add_header Content-Type text/plain;
    }

    # Servir sitemap.xml
    location = /sitemap.xml {
        root /opt/athletia/frontend/dist;
        access_log off;
        add_header Content-Type application/xml;
    }

    # Servir index.html para todas as rotas do frontend (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## ⚠️ Notas importantes

1. **CSP pode quebrar funcionalidades**: Se algo parar de funcionar após adicionar CSP, ajuste a política gradualmente
2. **HSTS só funciona com HTTPS**: Certifique-se de ter SSL configurado antes de ativar HSTS
3. **Teste sempre**: Use `nginx -t` antes de recarregar

