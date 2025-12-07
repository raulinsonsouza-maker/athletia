#!/bin/bash

# Script para configurar o agendamento automático de atualização de treinos
# Este script instala node-cron e configura o agendamento no index.ts

echo "🔧 Configurando agendamento automático de treinos..."

# 1. Instalar node-cron e tipos
echo "📦 Instalando node-cron e @types/node-cron..."
npm install node-cron @types/node-cron

if [ $? -ne 0 ]; then
  echo "❌ Erro ao instalar dependências"
  exit 1
fi

echo "✅ Dependências instaladas com sucesso!"

# 2. Verificar se o arquivo index.ts existe
if [ ! -f "src/index.ts" ]; then
  echo "❌ Arquivo src/index.ts não encontrado!"
  exit 1
fi

# 3. Verificar se já está configurado
if grep -q "atualizar-treinos-periodico" src/index.ts; then
  echo "⚠️  O agendamento já está configurado no index.ts"
  echo "📝 Verificando se está correto..."
  
  if grep -q "cron.schedule.*atualizar-treinos-periodico" src/index.ts; then
    echo "✅ Agendamento já está configurado corretamente!"
    exit 0
  else
    echo "⚠️  Configuração incompleta. Adicionando código necessário..."
  fi
else
  echo "📝 Adicionando configuração de agendamento no index.ts..."
fi

# 4. Adicionar imports (se não existirem)
if ! grep -q "import cron from 'node-cron'" src/index.ts; then
  # Encontrar a última linha de import antes das rotas
  # Adicionar após os imports existentes, antes do const app
  sed -i "/^import.*from.*express/a import cron from 'node-cron';" src/index.ts
  sed -i "/^import cron from 'node-cron'/a import { executarAtualizacaoPeriodica } from './jobs/atualizar-treinos-periodico';" src/index.ts
fi

# 5. Adicionar código do cron antes do app.listen
if ! grep -q "cron.schedule.*atualizar-treinos-periodico" src/index.ts; then
  # Encontrar a linha do app.listen e adicionar antes
  sed -i "/^app.listen/i \\
// Agendamento automático de atualização de treinos (diariamente às 2h)\\
cron.schedule('0 2 * * *', async () => {\\
  console.log('[CRON] Executando atualização periódica de treinos...');\\
  try {\\
    await executarAtualizacaoPeriodica();\\
    console.log('[CRON] Atualização periódica concluída com sucesso');\\
  } catch (error: any) {\\
    console.error('[CRON] Erro ao executar atualização periódica:', error.message);\\
  }\\
});\\
" src/index.ts
fi

echo "✅ Configuração concluída!"
echo ""
echo "📋 Resumo:"
echo "  - node-cron instalado"
echo "  - Agendamento configurado para executar diariamente às 2h da manhã"
echo "  - O job será executado automaticamente quando o servidor estiver rodando"
echo ""
echo "🚀 Para testar manualmente, execute:"
echo "   npm run atualizar-treinos-periodico"

