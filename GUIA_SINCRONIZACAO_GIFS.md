# 📸 Guia de Sincronização de GIFs

Este guia explica como sincronizar os GIFs dos exercícios do ambiente local para produção.

## 🔍 Diagnóstico

### 1. Verificar Status dos GIFs

Acesse o endpoint de diagnóstico (requer autenticação admin):

```bash
GET /api/admin/gifs/status
```

Este endpoint retorna:
- Total de exercícios com `gifUrl` no banco
- Quantos têm arquivo físico
- Quantos não têm arquivo físico
- Lista de problemas encontrados
- Status da estrutura de diretórios

### 2. Verificar Estrutura no Servidor

Execute o script de verificação no servidor:

```bash
ssh root@191.252.109.144
cd /opt/athletia/backend
bash scripts/verificar-estrutura-servidor.sh
```

## 🔄 Sincronização

### Opção 1: Script de Sincronização (Recomendado)

Use o script `sync-gifs.sh` na raiz do projeto:

```bash
# Dar permissão de execução (apenas primeira vez)
chmod +x sync-gifs.sh

# Executar sincronização
./sync-gifs.sh [servidor] [usuario]
# Exemplo:
./sync-gifs.sh 191.252.109.144 root
```

O script:
1. Lista todos os GIFs locais
2. Verifica conexão com servidor
3. Cria diretório remoto se necessário
4. Sincroniza usando rsync
5. Ajusta permissões
6. Reinicia backend

### Opção 2: Upload em Lote via API

Use o endpoint de bulk upload (requer autenticação admin):

```bash
POST /api/admin/gifs/bulk-upload
Content-Type: multipart/form-data

# FormData:
# - gifs: arquivos GIF (múltiplos)
# - mapping: JSON com mapeamento { "exercicioId": "nome-arquivo.gif" }
```

**Exemplo com curl:**

```bash
curl -X POST \
  http://191.252.109.144:3001/api/admin/gifs/bulk-upload \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "gifs=@exercicio1.gif" \
  -F "gifs=@exercicio2.gif" \
  -F 'mapping={"exercicio-id-1":"exercicio1.gif","exercicio-id-2":"exercicio2.gif"}'
```

## 📋 Checklist de Verificação

Após sincronização, verifique:

- [ ] Endpoint `/api/admin/gifs/status` mostra 0 problemas
- [ ] GIFs aparecem no frontend
- [ ] URLs retornam 200 (não 404)
- [ ] Permissões estão corretas (755)
- [ ] Backend foi reiniciado

## 🐛 Troubleshooting

### GIFs não aparecem após sincronização

1. **Verificar permissões:**
   ```bash
   ssh root@191.252.109.144
   ls -la /opt/athletia/backend/upload/exercicios/
   chmod -R 755 /opt/athletia/backend/upload/exercicios/
   ```

2. **Verificar se arquivos existem:**
   ```bash
   find /opt/athletia/backend/upload/exercicios -name "exercicio.gif" | wc -l
   ```

3. **Verificar logs do backend:**
   ```bash
   pm2 logs athletia-backend
   ```

4. **Testar URL diretamente:**
   ```bash
   curl http://191.252.109.144:3001/api/uploads/exercicios/{exercicioId}/exercicio.gif
   ```

### Erro de permissão

```bash
# Ajustar proprietário
sudo chown -R $USER:$USER /opt/athletia/backend/upload/exercicios/

# Ajustar permissões
chmod -R 755 /opt/athletia/backend/upload/exercicios/
```

### Arquivos não são encontrados

- Verificar se diretório existe
- Verificar se estrutura está correta: `upload/exercicios/{id}/exercicio.gif`
- Verificar se backend está rodando no diretório correto

## 📝 Estrutura Esperada

```
/opt/athletia/backend/
├── upload/
│   └── exercicios/
│       ├── {exercicio-id-1}/
│       │   └── exercicio.gif
│       ├── {exercicio-id-2}/
│       │   └── exercicio.gif
│       └── ...
```

## 🔗 URLs

- Diagnóstico: `GET /api/admin/gifs/status`
- Upload único: `POST /api/admin/exercicios/:id/gif`
- Upload em lote: `POST /api/admin/gifs/bulk-upload`
- Servir GIF: `GET /api/uploads/exercicios/:id/exercicio.gif`

