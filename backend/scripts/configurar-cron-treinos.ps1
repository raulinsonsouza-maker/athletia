# Script PowerShell para configurar o agendamento automático de atualização de treinos
# Este script instala node-cron e configura o agendamento no index.ts

Write-Host "🔧 Configurando agendamento automático de treinos..." -ForegroundColor Cyan

# 1. Instalar node-cron e tipos
Write-Host "📦 Instalando node-cron e @types/node-cron..." -ForegroundColor Yellow
npm install node-cron @types/node-cron

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependências instaladas com sucesso!" -ForegroundColor Green

# 2. Verificar se o arquivo index.ts existe
if (-not (Test-Path "src/index.ts")) {
    Write-Host "❌ Arquivo src/index.ts não encontrado!" -ForegroundColor Red
    exit 1
}

# 3. Ler conteúdo do arquivo
$content = Get-Content "src/index.ts" -Raw

# 4. Verificar se já está configurado
if ($content -match "atualizar-treinos-periodico") {
    Write-Host "⚠️  O agendamento já está configurado no index.ts" -ForegroundColor Yellow
    Write-Host "📝 Verificando se está correto..." -ForegroundColor Yellow
    
    if ($content -match "cron\.schedule.*atualizar-treinos-periodico") {
        Write-Host "✅ Agendamento já está configurado corretamente!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "⚠️  Configuração incompleta. Adicionando código necessário..." -ForegroundColor Yellow
    }
} else {
    Write-Host "📝 Adicionando configuração de agendamento no index.ts..." -ForegroundColor Yellow
}

# 5. Adicionar imports (se não existirem)
if ($content -notmatch "import cron from 'node-cron'") {
    # Adicionar após os imports do express
    $content = $content -replace "(import express from 'express';)", "`$1`nimport cron from 'node-cron';"
    $content = $content -replace "(import cron from 'node-cron';)", "`$1`nimport { executarAtualizacaoPeriodica } from './jobs/atualizar-treinos-periodico';"
}

# 6. Adicionar código do cron antes do app.listen
if ($content -notmatch "cron\.schedule.*atualizar-treinos-periodico") {
    $cronCode = @"

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

"@
    
    # Inserir antes do app.listen
    $content = $content -replace "(app\.listen\(PORT,)", "$cronCode`n`$1"
}

# 7. Salvar arquivo
Set-Content -Path "src/index.ts" -Value $content -NoNewline

Write-Host "✅ Configuração concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resumo:" -ForegroundColor Cyan
Write-Host "  - node-cron instalado"
Write-Host "  - Agendamento configurado para executar diariamente às 2h da manhã"
Write-Host "  - O job será executado automaticamente quando o servidor estiver rodando"
Write-Host ""
Write-Host "🚀 Para testar manualmente, execute:" -ForegroundColor Yellow
Write-Host "   npm run atualizar-treinos-periodico" -ForegroundColor White

