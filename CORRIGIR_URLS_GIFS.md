# Guia para Corrigir URLs de GIFs e Imagens

## Problemas Identificados

1. **URLs de GIFs com nomes em vez de UUIDs**: Alguns exercícios têm `gifUrl` no banco usando nomes (ex: `abdominal-bicicleta`) em vez de UUIDs
2. **Imagens do banco não encontradas**: Arquivos em `/api/imagens-banco/` retornam 404
3. **Referências a CDN inexistente**: URLs apontando para `minha-cdn.com` que não existe

## Solução

### 1. Corrigir URLs de GIFs no Banco de Dados

Foi criado um endpoint para corrigir automaticamente as URLs:

```bash
# No servidor, execute via API ou cURL:
curl -X POST https://athletia.site/api/admin/gifs/corrigir-urls \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

Ou acesse via painel admin se houver interface.

**O que o endpoint faz:**
- Busca todos os exercícios com `gifUrl`
- Identifica URLs com nomes em vez de UUIDs
- Corrige para usar o UUID correto do exercício
- Remove URLs que apontam para CDN inexistente
- Remove URLs de arquivos que não existem no servidor

### 2. Verificar Estrutura de Arquivos no Servidor

Verifique se os arquivos existem no caminho correto:

```bash
# Verificar estrutura de GIFs
ls -la /opt/athletia/backend/upload/exercicios/

# Verificar se há pastas com nomes (antigas)
find /opt/athletia/backend/upload/exercicios/ -type d -name "*-*"

# Verificar se há pastas com UUIDs
find /opt/athletia/backend/upload/exercicios/ -type d | grep -E "[0-9a-f]{8}-[0-9a-f]{4}-"
```

### 3. Mover Arquivos de Pastas com Nomes para UUIDs (se necessário)

Se os arquivos estão em pastas com nomes, você pode precisar movê-los:

```bash
# Exemplo: mover de pasta com nome para pasta com UUID
# (substitua os valores pelos corretos)

# 1. Encontrar o UUID do exercício no banco
# 2. Mover o arquivo:
mv /opt/athletia/backend/upload/exercicios/abdominal-bicicleta/exercicio.gif \
   /opt/athletia/backend/upload/exercicios/{UUID_DO_EXERCICIO}/exercicio.gif
```

### 4. Verificar Imagens do Banco

As imagens do banco devem estar em `/opt/athletia/Imagens/Banco`:

```bash
# Verificar se o diretório existe
ls -la /opt/athletia/Imagens/Banco/

# Verificar se os arquivos existem
ls -la /opt/athletia/Imagens/Banco/*.jpg
```

**Arquivos esperados:**
- `treino-padrao.jpg`
- `peito.jpg`
- `costas.jpg`
- `ombros.jpg`
- `biceps.jpg`
- `triceps.jpg`
- `quadriceps.jpg`
- `posteriores.jpg`
- `panturrilhas.jpg`
- `abdomen.jpg`

Se os arquivos não existirem, você precisa:
1. Criar/copiar os arquivos para o diretório
2. Ou atualizar o código para não usar essas imagens como fallback

### 5. Limpar Referências à CDN Inexistente

O endpoint de correção já remove URLs que apontam para `minha-cdn.com`. 

Se houver referências no código, verifique:

```bash
# Buscar referências no código
grep -r "minha-cdn" backend/ frontend/
```

## Endpoint Criado

**POST `/api/admin/gifs/corrigir-urls`**

**Resposta de exemplo:**
```json
{
  "message": "Correção de URLs concluída",
  "total": 150,
  "corrigidos": 25,
  "removidos": 10,
  "semMudanca": 115,
  "detalhes": [
    {
      "id": "uuid-do-exercicio",
      "nome": "Abdominal Bicicleta",
      "gifUrlAntigo": "/api/uploads/exercicios/abdominal-bicicleta/exercicio.gif",
      "gifUrlNovo": "/api/uploads/exercicios/uuid-do-exercicio/exercicio.gif",
      "acao": "corrigido_nome_para_uuid"
    }
  ]
}
```

## Próximos Passos

1. Execute o endpoint de correção de URLs
2. Verifique se as imagens do banco existem no servidor
3. Se não existirem, crie/copie os arquivos ou remova as referências
4. Teste novamente a aplicação

## Comandos Úteis

```bash
# Verificar status atual dos GIFs
curl https://athletia.site/api/admin/gifs/status \
  -H "Authorization: Bearer SEU_TOKEN"

# Corrigir URLs
curl -X POST https://athletia.site/api/admin/gifs/corrigir-urls \
  -H "Authorization: Bearer SEU_TOKEN"

# Verificar estrutura de arquivos
ls -la /opt/athletia/backend/upload/exercicios/
ls -la /opt/athletia/Imagens/Banco/
```

