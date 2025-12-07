#!/usr/bin/env node

/**
 * Script para configurar o agendamento automático de atualização de treinos
 * Este script instala node-cron e configura o agendamento no index.ts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Configurando agendamento automático de treinos...\n');

// 1. Instalar node-cron e tipos
console.log('📦 Instalando node-cron e @types/node-cron...');
try {
  execSync('npm install node-cron @types/node-cron', { stdio: 'inherit' });
  console.log('✅ Dependências instaladas com sucesso!\n');
} catch (error) {
  console.error('❌ Erro ao instalar dependências');
  process.exit(1);
}

// 2. Verificar se o arquivo index.ts existe
const indexPath = path.join(__dirname, '..', 'src', 'index.ts');
if (!fs.existsSync(indexPath)) {
  console.error('❌ Arquivo src/index.ts não encontrado!');
  process.exit(1);
}

// 3. Ler conteúdo do arquivo
let content = fs.readFileSync(indexPath, 'utf8');

// 4. Verificar se já está configurado
if (content.includes('atualizar-treinos-periodico')) {
  console.log('⚠️  O agendamento já está configurado no index.ts');
  console.log('📝 Verificando se está correto...\n');
  
  if (content.includes("cron.schedule('0 2 * * *'")) {
    console.log('✅ Agendamento já está configurado corretamente!');
    process.exit(0);
  } else {
    console.log('⚠️  Configuração incompleta. Adicionando código necessário...\n');
  }
} else {
  console.log('📝 Adicionando configuração de agendamento no index.ts...\n');
}

// 5. Adicionar imports (se não existirem)
if (!content.includes("import cron from 'node-cron'")) {
  // Adicionar após os imports do express
  const expressImportRegex = /(import express from 'express';)/;
  if (expressImportRegex.test(content)) {
    content = content.replace(
      expressImportRegex,
      "$1\nimport cron from 'node-cron';"
    );
  } else {
    // Se não encontrar express, adicionar após os primeiros imports
    const firstImportMatch = content.match(/^import .+ from .+;/m);
    if (firstImportMatch) {
      content = content.replace(
        firstImportMatch[0],
        `${firstImportMatch[0]}\nimport cron from 'node-cron';`
      );
    }
  }
}

// Adicionar import do job
if (!content.includes("import { executarAtualizacaoPeriodica }")) {
  const cronImportMatch = content.match(/import cron from 'node-cron';/);
  if (cronImportMatch) {
    content = content.replace(
      cronImportMatch[0],
      `${cronImportMatch[0]}\nimport { executarAtualizacaoPeriodica } from './jobs/atualizar-treinos-periodico';`
    );
  }
}

// 6. Adicionar código do cron antes do app.listen
if (!content.includes("cron.schedule('0 2 * * *'")) {
  const cronCode = `
// Agendamento automático de atualização de treinos (diariamente às 2h)
cron.schedule('0 2 * * *', async () => {
  console.log('[CRON] Executando atualização periódica de treinos...');
  try {
    await executarAtualizacaoPeriodica();
    console.log('[CRON] Atualização periódica concluída com sucesso');
  } catch (error: any) {
    console.error('[CRON] Erro ao executar atualização periódica:', error.message);
  }
});

`;
  
  // Inserir antes do app.listen
  const appListenRegex = /(app\.listen\(PORT,)/;
  if (appListenRegex.test(content)) {
    content = content.replace(appListenRegex, `${cronCode}$1`);
  } else {
    // Se não encontrar app.listen, adicionar antes do final do arquivo
    content = content + cronCode;
  }
}

// 7. Salvar arquivo
fs.writeFileSync(indexPath, content, 'utf8');

console.log('✅ Configuração concluída!\n');
console.log('📋 Resumo:');
console.log('  - node-cron instalado');
console.log('  - Agendamento configurado para executar diariamente às 2h da manhã');
console.log('  - O job será executado automaticamente quando o servidor estiver rodando\n');
console.log('🚀 Para testar manualmente, execute:');
console.log('   npm run atualizar-treinos-periodico\n');

