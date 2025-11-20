# Script para executar o sistema AthletIA
# Execute: .\executar-sistema.ps1

Write-Host "🚀 Iniciando AthletIA..." -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path "backend")) {
    Write-Host "❌ Erro: Execute este script na raiz do projeto (Academia_V1)" -ForegroundColor Red
    exit 1
}

# Verificar dependências do backend
Write-Host "📦 Verificando dependências do backend..." -ForegroundColor Yellow
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "⚠️  Instalando dependências do backend..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

# Verificar .env do backend
if (-not (Test-Path "backend\.env")) {
    Write-Host "⚠️  Criando arquivo .env do backend..." -ForegroundColor Yellow
    Copy-Item backend\env.example.txt backend\.env
    Write-Host "⚠️  IMPORTANTE: Edite backend\.env com suas configurações de banco de dados!" -ForegroundColor Red
    Write-Host "   Especialmente a DATABASE_URL com suas credenciais do PostgreSQL" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Pressione Enter após configurar o .env para continuar..." -ForegroundColor Yellow
    Read-Host
}

# Verificar dependências do frontend
Write-Host "📦 Verificando dependências do frontend..." -ForegroundColor Yellow
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "⚠️  Instalando dependências do frontend..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

# Verificar Prisma Client
Write-Host "🔧 Verificando Prisma Client..." -ForegroundColor Yellow
Set-Location backend
npm run prisma:generate
Set-Location ..

Write-Host ""
Write-Host "✅ Ambiente verificado!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  ANTES DE CONTINUAR:" -ForegroundColor Yellow
Write-Host "   1. Certifique-se de que o PostgreSQL está rodando" -ForegroundColor Yellow
Write-Host "   2. O banco 'athletia' foi criado" -ForegroundColor Yellow
Write-Host "   3. As migrations foram executadas (npm run prisma:migrate)" -ForegroundColor Yellow
Write-Host "   4. O seed foi executado (npm run prisma:seed)" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Deseja executar migrations e seed agora? (S/N)" -ForegroundColor Cyan
$resposta = Read-Host

if ($resposta -eq "S" -or $resposta -eq "s") {
    Write-Host ""
    Write-Host "🗄️  Executando migrations..." -ForegroundColor Yellow
    Set-Location backend
    npm run prisma:migrate
    Write-Host ""
    Write-Host "🌱 Executando seed..." -ForegroundColor Yellow
    npm run prisma:seed
    Set-Location ..
    Write-Host ""
    Write-Host "✅ Banco de dados configurado!" -ForegroundColor Green
    Write-Host ""
}

Write-Host "🚀 Iniciando servidores..." -ForegroundColor Cyan
Write-Host ""
Write-Host "   Backend: http://localhost:3001" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "   Pressione Ctrl+C para parar os servidores" -ForegroundColor Yellow
Write-Host ""

# Iniciar backend em background
Write-Host "🔧 Iniciando backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm run dev" -WindowStyle Normal

# Aguardar um pouco para o backend iniciar
Start-Sleep -Seconds 3

# Iniciar frontend em background
Write-Host "🎨 Iniciando frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "✅ Servidores iniciados!" -ForegroundColor Green
Write-Host ""
Write-Host "   Acesse: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

