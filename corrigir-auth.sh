#!/bin/bash

# Script para corrigir auth.controller.ts
# Execute: bash corrigir-auth.sh

cd /opt/athletia/backend

echo "🔧 Corrigindo auth.controller.ts..."

# Ler o arquivo e corrigir
node << 'AUTHFIX'
const fs = require('fs');
const file = '/opt/athletia/backend/src/controllers/auth.controller.ts';
let content = fs.readFileSync(file, 'utf8');

// Verificar se há }; solto na linha 20 ou próxima
const lines = content.split('\n');

// Procurar por problemas comuns
let fixed = false;
for (let i = 0; i < lines.length; i++) {
  // Se encontrar }; isolado após as declarações de constantes
  if (i >= 18 && i <= 22 && lines[i].trim() === '};' && !lines[i-1].includes('return')) {
    console.log(`Removendo }; solto na linha ${i+1}`);
    lines[i] = ''; // Remover linha problemática
    fixed = true;
  }
}

if (fixed) {
  content = lines.filter(l => l !== '').join('\n');
}

// Garantir que a função generateTokens está correta
const correctFunction = `// Gerar tokens
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

// Substituir a função generateTokens inteira
content = content.replace(
  /\/\/ Gerar tokens[\s\S]*?return \{ accessToken, refreshToken \};/,
  correctFunction
);

// Remover qualquer }; solto que possa ter sobrado
content = content.replace(/\n\s*\};\s*\n\s*\/\/ Gerar tokens/g, '\n// Gerar tokens');
content = content.replace(/\n\s*\};\s*\n\s*const JWT_REFRESH_EXPIRES_IN/g, '\nconst JWT_REFRESH_EXPIRES_IN');

fs.writeFileSync(file, content);
console.log('✅ auth.controller.ts corrigido');
AUTHFIX

echo ""
echo "🔨 Testando compilação..."
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅✅✅ SUCESSO! ✅✅✅"
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

