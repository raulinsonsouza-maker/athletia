#!/bin/bash

# Script para corrigir TODOS os erros restantes
# Execute: bash corrigir-todos-erros.sh

set -e

cd /opt/athletia/backend

echo "🔧 Corrigindo todos os erros..."

# 1. Corrigir periodizacao.service.ts
echo "📝 1/4 periodizacao.service.ts..."
node << 'PERIODFIX'
const fs = require('fs');
const file = '/opt/athletia/backend/src/services/periodizacao.service.ts';
let content = fs.readFileSync(file, 'utf8');

// Substituir função mal formatada
const correctFunction = `
/**
 * Função local para calcular parâmetros de treino (evita dependência circular)
 */
function calcularParametrosTreinoLocal(
  objetivo: string,
  experiencia: string
): { series: number; repeticoes: string; rpe: number; descanso: number } {
  let series = 3;
  let repeticoes = '10-12';
  let rpe = 7;
  let descanso = 90;

  if (objetivo === 'Força') {
    series = experiencia === 'Avançado' ? 5 : 4;
    repeticoes = '3-5';
    rpe = 8;
    descanso = 180;
  } else if (objetivo === 'Hipertrofia') {
    series = experiencia === 'Iniciante' ? 3 : 4;
    repeticoes = experiencia === 'Iniciante' ? '10-12' : '8-12';
    rpe = 7;
    descanso = 90;
  } else if (objetivo === 'Emagrecimento') {
    series = 3;
    repeticoes = '12-15';
    rpe = 6;
    descanso = 60;
  }

  return { series, repeticoes, rpe, descanso };
}`;

// Remover função mal formatada e adicionar correta
content = content.replace(/function calcularParametrosTreinoLocal[^}]+};/g, '');
content = content.replace(/calcularParametrosTreinoLocal\([^)]+\);/g, 'calcularParametrosTreinoLocal(objetivo || \'Hipertrofia\', experiencia || \'Iniciante\');');

// Adicionar função correta antes do último }
const lastBrace = content.lastIndexOf('}');
if (lastBrace > 0) {
  content = content.slice(0, lastBrace) + correctFunction + '\n' + content.slice(lastBrace);
}

fs.writeFileSync(file, content);
console.log('✅ periodizacao.service.ts corrigido');
PERIODFIX

# 2. Corrigir treino-personalizado.service.ts
echo "📝 2/4 treino-personalizado.service.ts..."
node << 'TPFIX'
const fs = require('fs');
const file = '/opt/athletia/backend/src/services/treino-personalizado.service.ts';
let content = fs.readFileSync(file, 'utf8');

// Mover declaração de updateData antes do uso
const lines = content.split('\n');
const newLines = [];
let updateDataDeclared = false;
let updateDataDeclaration = '';
let updateDataUsage = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('const updateData: any = {};')) {
    updateDataDeclaration = line;
    updateDataDeclared = true;
    continue; // Não adicionar ainda
  }
  
  if (line.includes('updateData.data = novaData;') && !updateDataDeclared) {
    // Encontrar declaração depois
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].includes('const updateData: any = {};')) {
        updateDataDeclaration = lines[j];
        // Adicionar declaração antes do uso
        newLines.push('  // Atualizar dados do treino');
        newLines.push('  ' + updateDataDeclaration);
        newLines.push('');
        newLines.push('  // Preparar data se fornecida');
        newLines.push(line);
        // Pular a declaração quando encontrá-la depois
        for (let k = j + 1; k < lines.length; k++) {
          if (!lines[k].includes('const updateData: any = {};')) {
            newLines.push(lines[k]);
          }
        }
        break;
      }
    }
    break;
  }
  
  newLines.push(line);
}

if (updateDataDeclared && updateDataUsage.length > 0) {
  content = newLines.join('\n');
}

// Corrigir nome undefined
content = content.replace(
  /nome: treinoOriginal\.nome \? `\$\{treinoOriginal\.nome\} \(Cópia\)` : undefined,/g,
  "nome: treinoOriginal.nome ? `${treinoOriginal.nome} (Cópia)` : `Treino Copiado - ${novaData.toLocaleDateString('pt-BR')}`,"
);

fs.writeFileSync(file, content);
console.log('✅ treino-personalizado.service.ts corrigido');
TPFIX

# 3. Corrigir treino.service.ts
echo "📝 3/4 treino.service.ts..."
node << 'TREINOFIX'
const fs = require('fs');
const file = '/opt/athletia/backend/src/services/treino.service.ts';
let content = fs.readFileSync(file, 'utf8');

// Remover import conflitante de calcularParametrosTreino
const lines = content.split('\n');
const newLines = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Pular linha que importa calcularParametrosTreino
  if (line.includes('calcularParametrosTreino') && line.includes('import') || 
      (line.includes('calcularParametrosTreino') && line.includes(','))) {
    // Se for parte de um import múltiplo, remover apenas essa parte
    if (line.includes(',')) {
      const cleaned = line.replace(/,\s*calcularParametrosTreino,?/g, ',').replace(/calcularParametrosTreino,\s*/g, '');
      if (cleaned.trim() !== '' && !cleaned.match(/^[\s,]*$/)) {
        newLines.push(cleaned);
      }
    }
    continue;
  }
  newLines.push(line);
}
content = newLines.join('\n');

// Garantir que calcularParametrosTreino está exportado
content = content.replace(/^function calcularParametrosTreino\(/, 'export function calcularParametrosTreino(');

// Corrigir carga null
content = content.replace(/carga: carga > 0 \? carga : null,/g, 'carga: (carga != null && carga > 0) ? carga : null,');

// Remover declarações duplicadas de tipoTreino e nomeTreino
const lines2 = content.split('\n');
const newLines2 = [];
let foundFirstTipoTreino = false;
let foundFirstNomeTreino = false;

for (let i = 0; i < lines2.length; i++) {
  const line = lines2[i];
  
  if (line.includes('const tipoTreino = determinarTipoTreino') && !foundFirstTipoTreino) {
    foundFirstTipoTreino = true;
    newLines2.push(line);
  } else if (line.includes('const tipoTreino = determinarTipoTreino') && foundFirstTipoTreino) {
    // Pular duplicata
    continue;
  } else if (line.includes('const nomeTreino = `Treino ${tipoTreino}') && !foundFirstNomeTreino) {
    foundFirstNomeTreino = true;
    newLines2.push(line);
  } else if (line.includes('const nomeTreino = `Treino ${tipoTreino}') && foundFirstNomeTreino) {
    // Pular duplicata
    continue;
  } else {
    newLines2.push(line);
  }
}
content = newLines2.join('\n');

// Corrigir propriedades duplicadas nome e letraTreino (linha 746-747)
// Verificar se há duplicação
if (content.includes('nome: `Treino ${tipoTreino}`') && content.includes('letraTreino: tipoTreino')) {
  // Está correto, não fazer nada
} else {
  // Garantir que ambas existem
  content = content.replace(
    /nome: `Treino \$\{tipoTreino\}`, \/\/ Nome obrigatório do schema/,
    'nome: `Treino ${tipoTreino}`, // Nome obrigatório do schema\n      letraTreino: tipoTreino,'
  );
}

fs.writeFileSync(file, content);
console.log('✅ treino.service.ts corrigido');
TREINOFIX

# 4. Corrigir workout-intelligence.service.ts
echo "📝 4/4 workout-intelligence.service.ts..."
sed -i 's/\.filter(p => p\.length > 2)/.filter((p: string) => p.length > 2)/g' src/services/workout-intelligence.service.ts
sed -i 's/\.filter(p => palavras2\.includes(p))/.filter((p: string) => palavras2.includes(p))/g' src/services/workout-intelligence.service.ts

echo ""
echo "✅ Todas as correções aplicadas!"
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

