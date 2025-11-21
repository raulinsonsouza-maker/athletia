#!/bin/bash

# Script para corrigir todos os erros de compilação TypeScript
# Execute: bash corrigir-build.sh

set -e

echo "🔧 Corrigindo erros de compilação..."
cd /opt/athletia/backend

# Backup
echo "💾 Backup criado em /tmp/athletia-backup"
mkdir -p /tmp/athletia-backup
cp -r src /tmp/athletia-backup/src-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true

# 1. admin.controller.ts - remover frequencia, rpeMedio, observacoes, corrigir tempoEstimado
echo "📝 1/8 admin.controller.ts..."
sed -i 's/frequencia: usuario\.perfil\.frequencia,/frequenciaSemanal: usuario.perfil.frequenciaSemanal,/g' src/controllers/admin.controller.ts
sed -i '/rpeMedio: usuario\.perfil\.rpeMedio,/d' src/controllers/admin.controller.ts
sed -i '/observacoes: t\.observacoes,/d' src/controllers/admin.controller.ts
sed -i 's/t\.exercicios\.reduce((acc, ex) => acc + (ex\.exercicio\.tempoEstimado || 0), 0)/t.tempoEstimado || 0/g' src/controllers/admin.controller.ts

# 2. auth.controller.ts - corrigir JWT
echo "📝 2/8 auth.controller.ts..."
cat > /tmp/fix_auth.js << 'AUTHFIX'
const fs = require('fs');
const file = '/opt/athletia/backend/src/controllers/auth.controller.ts';
let content = fs.readFileSync(file, 'utf8');
const newFunc = `// Gerar tokens
const generateTokens = (userId: string) => {
  if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error('JWT secrets não configurados');
  }
  
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
};`;
content = content.replace(/\/\/ Gerar tokens[\s\S]*?return \{ accessToken, refreshToken \};/, newFunc);
fs.writeFileSync(file, content);
AUTHFIX
node /tmp/fix_auth.js

# 3. treino.controller.ts
echo "📝 3/8 treino.controller.ts..."
sed -i 's/gerarTreinosSemana/gerarTreinos30Dias/g' src/controllers/treino.controller.ts

# 4. periodizacao.service.ts
echo "📝 4/8 periodizacao.service.ts..."
cat > /tmp/fix_period.js << 'PERIODFIX'
const fs = require('fs');
const file = '/opt/athletia/backend/src/services/periodizacao.service.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/return calcularParametrosTreino\([^)]+\);/,
  'return calcularParametrosTreinoLocal(objetivo || \'Hipertrofia\', experiencia || \'Iniciante\');');
if (!content.includes('function calcularParametrosTreinoLocal')) {
  const func = `
function calcularParametrosTreinoLocal(objetivo: string, experiencia: string): { series: number; repeticoes: string; rpe: number; descanso: number } {
  let series = 3, repeticoes = '10-12', rpe = 7, descanso = 90;
  if (objetivo === 'Força') { series = experiencia === 'Avançado' ? 5 : 4; repeticoes = '3-5'; rpe = 8; descanso = 180; }
  else if (objetivo === 'Hipertrofia') { series = experiencia === 'Iniciante' ? 3 : 4; repeticoes = experiencia === 'Iniciante' ? '10-12' : '8-12'; }
  else if (objetivo === 'Emagrecimento') { repeticoes = '12-15'; rpe = 6; descanso = 60; }
  return { series, repeticoes, rpe, descanso };
}`;
  content = content.replace(/(\}\s*)$/, func + '\n$1');
}
fs.writeFileSync(file, content);
PERIODFIX
node /tmp/fix_period.js

# 5. template.service.ts - garantir nome
echo "📝 5/8 template.service.ts..."
if ! grep -q "nome: template.nome" src/services/template.service.ts; then
  sed -i '/tempoEstimado: template\.tempoEstimado,/a\      nome: template.nome || `Treino ${template.divisaoTreino}`,' src/services/template.service.ts
fi

# 6. treino-personalizado.service.ts
echo "📝 6/8 treino-personalizado.service.ts..."
cat > /tmp/fix_tp.js << 'TPFIX'
const fs = require('fs');
const file = '/opt/athletia/backend/src/services/treino-personalizado.service.ts';
let content = fs.readFileSync(file, 'utf8');
// Mover updateData antes
content = content.replace(/(\s+)(\/\/ Preparar data[\s\S]*?updateData\.data = novaData;\s+)(\s+)(\/\/ Atualizar[\s\S]*?const updateData: any = {};)/, '$1$4$1$2');
// Corrigir nome
content = content.replace(/nome: treinoOriginal\.nome \? `\$\{treinoOriginal\.nome\} \(Cópia\)` : undefined,/,
  "nome: treinoOriginal.nome ? `${treinoOriginal.nome} (Cópia)` : `Treino Copiado - ${novaData.toLocaleDateString('pt-BR')}`,");
fs.writeFileSync(file, content);
TPFIX
node /tmp/fix_tp.js

# 7. treino.service.ts
echo "📝 7/8 treino.service.ts..."
cat > /tmp/fix_treino.js << 'TREINOFIX'
const fs = require('fs');
const file = '/opt/athletia/backend/src/services/treino.service.ts';
let content = fs.readFileSync(file, 'utf8');
// Exportar calcularParametrosTreino
content = content.replace(/^function calcularParametrosTreino\(/, 'export function calcularParametrosTreino(');
// Corrigir carga
content = content.replace(/carga: carga > 0 \? carga : null,/g, 'carga: (carga != null && carga > 0) ? carga : null,');
// Remover duplicatas tipoTreino/nomeTreino
const lines = content.split('\n');
const newLines = [];
let foundFirst = false;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('const tipoTreino = determinarTipoTreino') && !foundFirst) {
    foundFirst = true;
    newLines.push(line);
  } else if (line.includes('const tipoTreino = determinarTipoTreino') && foundFirst) {
    continue; // Pular duplicata
  } else if (line.includes('const nomeTreino = `Treino ${tipoTreino}') && foundFirst) {
    continue; // Pular duplicata
  } else {
    newLines.push(line);
  }
}
content = newLines.join('\n');
fs.writeFileSync(file, content);
TREINOFIX
node /tmp/fix_treino.js

# 8. workout-intelligence.service.ts
echo "📝 8/8 workout-intelligence.service.ts..."
sed -i 's/\.filter(p => p\.length > 2)/.filter((p: string) => p.length > 2)/g' src/services/workout-intelligence.service.ts
sed -i 's/\.filter(p => palavras2\.includes(p))/.filter((p: string) => palavras2.includes(p))/g' src/services/workout-intelligence.service.ts

echo ""
echo "✅ Correções aplicadas! Compilando..."
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅✅✅ BUILD SUCESSO! ✅✅✅"
  echo ""
  pm2 restart athletia-backend
  sleep 2
  pm2 logs athletia-backend --lines 20 --nostream
else
  echo ""
  echo "❌ Erros restantes. Verifique acima."
  exit 1
fi
