# 📸 Guia de Reorganização de GIFs e Ajuste de Apontamentos

Este guia explica como reorganizar os GIFs da estrutura antiga para a nova estrutura e atualizar os apontamentos no banco de dados.

## 🔍 Situação

- **Arquivos transferidos:** Todos os GIFs foram transferidos via FileZilla para `/opt/athletia/backend/upload/exercicios`
- **Estrutura atual:** Pastas nomeadas pelo nome do exercício (ex: `agachamento/exercicio.gif`)
- **Estrutura esperada:** Pastas com UUID do exercício (ex: `{uuid}/exercicio.gif`)
- **Apontamentos:** Campo `gifUrl` no banco precisa ser atualizado

## 🚀 Como Executar

### Opção 1: Executar no Servidor (Recomendado)

1. **Conectar ao servidor:**
   ```bash
   ssh root@191.252.109.144
   ```

2. **Navegar para o diretório do projeto:**
   ```bash
   cd /opt/athletia/backend
   ```

3. **Executar o script:**
   ```bash
   npm run reorganizar-gifs
   ```

### Opção 2: Executar Localmente (Conectando ao Banco de Produção)

1. **Configurar variável de ambiente:**
   ```bash
   # No arquivo .env do backend, apontar para banco de produção
   DATABASE_URL="postgresql://usuario:senha@servidor:5432/athletia"
   ```

2. **Executar o script:**
   ```bash
   cd backend
   npm run reorganizar-gifs
   ```

## 📋 O que o Script Faz

1. **Busca todos os exercícios** do banco de dados
2. **Normaliza o nome** de cada exercício para corresponder ao nome da pasta antiga
3. **Procura o arquivo GIF** na estrutura antiga
4. **Copia o arquivo** para a estrutura nova (usando UUID do exercício)
5. **Atualiza o campo `gifUrl`** no banco de dados com a URL correta

## 🔧 Normalização de Nomes

O script normaliza nomes de exercícios usando:
- Conversão para lowercase
- Remoção de acentos
- Substituição de espaços por hífens
- Remoção de caracteres especiais
- Mapeamento de variações comuns

**Exemplos:**
- "Supino Reto" → "supino-reto"
- "Agachamento Livre" → "agachamento-livre"
- "Remada Curvada" → "remada-curvada"

## 📊 Relatório

O script gera um relatório completo mostrando:
- Total de exercícios processados
- Arquivos encontrados na estrutura antiga
- Arquivos copiados para estrutura nova
- Apontamentos atualizados no banco
- Exercícios sem GIF correspondente
- Erros encontrados

## ⚠️ Importante

- O script **não remove** os arquivos da estrutura antiga (mantém backup)
- O script **não sobrescreve** arquivos que já existem na estrutura nova
- O script **atualiza apenas** apontamentos que estão incorretos

## 🐛 Troubleshooting

### Erro: "Diretório de upload não encontrado"

Certifique-se de executar o script do diretório correto:
```bash
cd /opt/athletia/backend
npm run reorganizar-gifs
```

### Erro de conexão com banco

Verifique a variável `DATABASE_URL` no arquivo `.env`:
```bash
DATABASE_URL="postgresql://usuario:senha@servidor:5432/athletia"
```

### Muitos exercícios não encontrados

O script tenta várias estratégias de busca:
1. Nome exato normalizado
2. Variações conhecidas
3. Busca por palavras-chave

Se ainda assim não encontrar, verifique manualmente o nome da pasta na estrutura antiga.

## ✅ Validação Pós-Execução

Após executar o script, valide:

1. **Verificar estrutura:**
   ```bash
   ls -la /opt/athletia/backend/upload/exercicios/
   # Deve mostrar pastas com UUIDs
   ```

2. **Verificar apontamentos:**
   ```bash
   # Usar endpoint de diagnóstico
   curl http://localhost:3001/api/admin/gifs/status
   ```

3. **Testar no frontend:**
   - Acessar treino do dia
   - Verificar se GIFs aparecem corretamente

## 📝 Estrutura Esperada Após Reorganização

```
/opt/athletia/backend/upload/exercicios/
├── {uuid-exercicio-1}/
│   └── exercicio.gif
├── {uuid-exercicio-2}/
│   └── exercicio.gif
└── ...
```

## 🔗 URLs Corretas

Após reorganização, os apontamentos devem estar no formato:
```
/api/uploads/exercicios/{exercicioId}/exercicio.gif
```

Onde `{exercicioId}` é o UUID do exercício no banco de dados.

