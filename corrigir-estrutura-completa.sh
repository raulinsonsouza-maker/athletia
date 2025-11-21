#!/bin/bash

# Script para corrigir estrutura completa do treino.service.ts no servidor
# Execute no servidor: bash corrigir-estrutura-completa.sh

set -e

cd /opt/athletia/backend

echo "🔧 Verificando estrutura do arquivo..."

# Verificar contexto da linha 1008
echo "📋 Linhas 1005-1012:"
sed -n '1005,1012p' src/services/treino.service.ts

echo ""
echo "📋 Linhas 2265-2270 (final do arquivo):"
tail -10 src/services/treino.service.ts

# Contar chaves abertas e fechadas
echo ""
echo "🔍 Verificando balanceamento de chaves..."
node << 'CHECK'
const fs = require('fs');
const file = 'src/services/treino.service.ts';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

let openBraces = 0;
let closeBraces = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const open = (line.match(/{/g) || []).length;
  const close = (line.match(/}/g) || []).length;
  openBraces += open;
  closeBraces += close;
  
  if (i === 1007 || i === 2267) {
    console.log(`Linha ${i + 1}: abertas=${openBraces}, fechadas=${closeBraces}, diff=${openBraces - closeBraces}`);
  }
}

console.log(`\nTotal: abertas=${openBraces}, fechadas=${closeBraces}, diff=${openBraces - closeBraces}`);

if (openBraces > closeBraces) {
  const missing = openBraces - closeBraces;
  console.log(`\n⚠️ Faltam ${missing} chave(s) de fechamento`);
  console.log('Adicionando no final do arquivo...');
  content += '\n' + '}'.repeat(missing);
  fs.writeFileSync(file, content);
  console.log('✅ Chaves adicionadas');
} else if (openBraces < closeBraces) {
  const extra = closeBraces - openBraces;
  console.log(`\n⚠️ Há ${extra} chave(s) de fechamento extra(s)`);
}
CHECK

# Verificar se linha 1008 tem problema de contexto
echo ""
echo "🔧 Corrigindo linha 1008..."
node << 'FIX1008'
const fs = require('fs');
const file = 'src/services/treino.service.ts';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// Verificar se há algo antes da linha 1008 que não está fechado
let braceCount = 0;
let parenCount = 0;

for (let i = 0; i < 1007; i++) {
  const line = lines[i];
  braceCount += (line.match(/{/g) || []).length;
  braceCount -= (line.match(/}/g) || []).length;
  parenCount += (line.match(/\(/g) || []).length;
  parenCount -= (line.match(/\)/g) || []).length;
}

console.log(`Antes da linha 1008: chaves=${braceCount}, parênteses=${parenCount}`);

// Se há chaves não fechadas, pode ser que linha 1008 esteja dentro de um bloco que não deveria estar
if (braceCount > 0 && lines[1007] && lines[1007].trim().startsWith('const tipoTreinoDia')) {
  console.log('⚠️ Linha 1008 está dentro de um bloco não fechado');
  
  // Verificar linha anterior
  const prevLine = lines[1006];
  console.log(`Linha 1007: ${prevLine}`);
  
  // Se linha anterior não fecha nada, pode precisar fechar antes
  if (!prevLine.trim().endsWith(';') && !prevLine.trim().endsWith('}') && !prevLine.trim().endsWith(')')) {
    // Adicionar fechamento antes
    const newLines = [...lines];
    newLines.splice(1007, 0, '  }');
    content = newLines.join('\n');
    fs.writeFileSync(file, content);
    console.log('✅ Fechamento adicionado antes da linha 1008');
  }
}
FIX1008

echo ""
echo "🔨 Compilando..."
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅✅✅ BUILD SUCESSO! ✅✅✅"
  echo ""
  echo "🔄 Reiniciando PM2..."
  pm2 restart athletia-backend
  sleep 2
  echo ""
  echo "📋 Logs:"
  pm2 logs athletia-backend --lines 20 --nostream
else
  echo ""
  echo "❌ Ainda há erros. Verifique acima."
  exit 1
fi

