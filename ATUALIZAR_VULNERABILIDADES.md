# Guia para Corrigir Vulnerabilidades do esbuild

## Problema

Vulnerabilidade no `esbuild <=0.24.2` que permite que qualquer site envie requisições ao servidor de desenvolvimento e leia as respostas.

**Severidade**: Moderate  
**CVE**: GHSA-67mh-4wv8-2f99

## Solução Recomendada (Sem Breaking Changes)

Atualize o `package.json` para usar versões seguras:

1. **Vite**: Atualizado para `^5.4.21` (última versão estável da 5.x)
2. **esbuild**: Adicionado explicitamente `^0.25.0` (versão que corrige a vulnerabilidade)

## Passos para Aplicar

### No Servidor:

```bash
cd /opt/athletia/frontend

# 1. Atualizar dependências
npm install

# 2. Verificar se a vulnerabilidade foi corrigida
npm audit

# 3. Testar o build
npm run build

# 4. Se tudo estiver OK, fazer deploy
# (os arquivos já estarão em dist/)
```

## Alternativa: Atualização Forçada (NÃO RECOMENDADO)

Se você realmente precisar usar `npm audit fix --force`, isso vai atualizar o Vite para a versão 6.x, que pode ter breaking changes:

```bash
# ⚠️ ATENÇÃO: Isso pode quebrar o projeto
npm audit fix --force
```

**Breaking changes conhecidos do Vite 6.x:**
- Requer Node.js 18+
- Mudanças na API de plugins
- Mudanças na configuração de build
- Possíveis incompatibilidades com plugins

## Verificação

Após atualizar, verifique:

```bash
# Verificar versões instaladas
npm list esbuild vite

# Verificar vulnerabilidades
npm audit

# Testar build
npm run build

# Testar servidor de desenvolvimento (se necessário)
npm run dev
```

## Por que não usar --force?

O `npm audit fix --force` pode:
- Atualizar o Vite para 6.x (breaking changes)
- Quebrar plugins e configurações existentes
- Requerer refatoração do código
- Introduzir novos bugs

A solução recomendada mantém a compatibilidade e corrige apenas a vulnerabilidade.

## Status

✅ `package.json` atualizado com versões seguras
✅ Vite 5.4.21 (compatível, sem breaking changes)
✅ esbuild 0.25.0+ (corrige a vulnerabilidade)

