#!/bin/bash

# Script para corrigir os erros finais
cd /opt/athletia/backend

echo "🔧 Corrigindo erros finais..."

# 1. periodizacao.service.ts - remover funções duplicadas e mal formatadas, criar uma correta
echo "📝 1/3 periodizacao.service.ts..."
node << 'PERIODFIX'
const fs = require('fs');
const file = '/opt/athletia/backend/src/services/periodizacao.service.ts';
let content = fs.readFileSync(file, 'utf8');

// Remover todas as versões da função calcularParametrosTreinoLocal
content = content.replace(/function calcularParametrosTreinoLocal[^}]+};/g, '');
content = content.replace(/function calcularParametrosTreinoLocal[^\n]+\n/g, '');

// Adicionar função correta antes do último }
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

// Encontrar último } e adicionar função antes
const lastBraceIndex = content.lastIndexOf('\n}');
if (lastBraceIndex > 0) {
  content = content.slice(0, lastBraceIndex) + correctFunction + '\n' + content.slice(lastBraceIndex);
}

fs.writeFileSync(file, content);
console.log('✅ periodizacao.service.ts corrigido');
PERIODFIX

# 2. treino-personalizado.service.ts - mover updateData e corrigir nome
echo "📝 2/3 treino-personalizado.service.ts..."
node << 'TPFIX'
const fs = require('fs');
const file = '/opt/athletia/backend/src/services/treino-personalizado.service.ts';
let content = fs.readFileSync(file, 'utf8');

// Ler linhas
const lines = content.split('\n');
const newLines = [];
let inUpdateDataSection = false;
let updateDataLine = -1;
let updateDataUsageLine = -1;

// Encontrar onde está a declaração e o uso
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const updateData: any = {};')) {
    updateDataLine = i;
  }
  if (lines[i].includes('updateData.data = novaData;')) {
    updateDataUsageLine = i;
  }
}

// Reconstruir arquivo movendo declaração antes do uso
if (updateDataLine > updateDataUsageLine && updateDataLine > 0 && updateDataUsageLine > 0) {
  for (let i = 0; i < lines.length; i++) {
    if (i === updateDataUsageLine - 1) {
      // Adicionar declaração antes do uso
      newLines.push('  // Atualizar dados do treino');
      newLines.push('  const updateData: any = {};');
      newLines.push('');
      newLines.push('  // Preparar data se fornecida');
      newLines.push(lines[i + 1]); // updateData.data = novaData;
      i++; // Pular próxima linha
    } else if (i === updateDataLine) {
      // Pular declaração antiga
      continue;
    } else {
      newLines.push(lines[i]);
    }
  }
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

# 3. treino.service.ts - corrigir propriedades duplicadas, variáveis redeclaradas e tipoTreino
echo "📝 3/3 treino.service.ts..."
node << 'TREINOFIX'
const fs = require('fs');
const file = '/opt/athletia/backend/src/services/treino.service.ts';
let content = fs.readFileSync(file, 'utf8');

// Corrigir propriedades duplicadas nome e letraTreino (linha 745-746)
// Verificar se há duplicação no mesmo objeto
content = content.replace(
  /nome: `Treino \$\{tipoTreino\}`,[\s\n]*letraTreino: tipoTreino,/g,
  'nome: `Treino ${tipoTreino}`,\n      letraTreino: tipoTreino,'
);

// Remover declarações duplicadas de nomeTreino (linhas 1004-1005)
const lines = content.split('\n');
const newLines = [];
let foundFirstNomeTreino = false;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('const nomeTreino = `Treino ${tipoTreino}') && !foundFirstNomeTreino) {
    foundFirstNomeTreino = true;
    newLines.push(line);
  } else if (line.includes('const nomeTreino = `Treino ${tipoTreino}') && foundFirstNomeTreino) {
    // Pular duplicata
    continue;
  } else {
    newLines.push(line);
  }
}
content = newLines.join('\n');

// Corrigir tipoTreino não definido na linha 1612, 1615, 1637
// Verificar contexto - parece que tipoTreino foi removido acidentalmente
const lines2 = content.split('\n');
const newLines2 = [];
for (let i = 0; i < lines2.length; i++) {
  const line = lines2[i];
  // Se linha usa tipoTreino mas não está definido antes, procurar onde deveria estar
  if ((line.includes('console.log') || line.includes('gerarTreinoABC')) && line.includes('tipoTreino') && i > 1600) {
    // Procurar para trás onde tipoTreino deveria estar definido
    let found = false;
    for (let j = i - 1; j >= 1600 && j >= i - 20; j--) {
      if (lines2[j].includes('const tipoTreino = determinarTipoTreinoABC')) {
        found = true;
        break;
      }
    }
    if (!found) {
      // Adicionar declaração antes
      for (let j = i - 1; j >= 1600; j--) {
        if (lines2[j].includes('// Determinar tipo de treino') || lines2[j].includes('determinarTipoTreinoABC')) {
          // Já existe, não fazer nada
          found = true;
          break;
        }
        if (lines2[j].includes('const tipoTreino = determinarTipoTreinoABC')) {
          found = true;
          break;
        }
      }
      if (!found && i > 0) {
        // Adicionar antes da linha que usa
        newLines2.push('        const tipoTreino = determinarTipoTreinoABC(divisao, ciclo);');
      }
    }
  }
  newLines2.push(line);
}
content = newLines2.join('\n');

fs.writeFileSync(file, content);
console.log('✅ treino.service.ts corrigido');
TREINOFIX

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

