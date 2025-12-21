# ============================================================================
# SCRIPT DE DEPLOY PARA PRODUÇÃO - ATHLETIA
# ============================================================================
# Este script faz o deploy completo do frontend e backend de uma vez
# Execute: .\deploy-producao.ps1
# ============================================================================

param(
    [switch]$SkipGitPull = $false,
    [switch]$SkipMigrations = $false,
    [switch]$SkipBuild = $false,
    [string]$Branch = "main"
)

# Cores para output
function Write-Step {
    param([string]$Message)
    Write-Host "`n▶ $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

# Verificar se está no diretório correto
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Error "Execute este script na raiz do projeto (onde estão as pastas backend e frontend)"
    exit 1
}

$ErrorActionPreference = "Stop"
$script:HasErrors = $false

# Função para executar comandos com tratamento de erro
function Invoke-SafeCommand {
    param(
        [string]$Command,
        [string]$WorkingDirectory = $PWD,
        [string]$ErrorMessage = "Erro ao executar comando"
    )
    
    try {
        Push-Location $WorkingDirectory
        Invoke-Expression $Command
        if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne $null) {
            throw "Comando retornou código de saída $LASTEXITCODE"
        }
        Pop-Location
        return $true
    }
    catch {
        Pop-Location
        Write-Error "$ErrorMessage`: $_"
        $script:HasErrors = $true
        return $false
    }
}

# ============================================================================
# INÍCIO DO DEPLOY
# ============================================================================

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🚀 DEPLOY ATHLETIA - PRODUÇÃO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# 1. GIT PULL
# ============================================================================

if (-not $SkipGitPull) {
    Write-Step "1/7 Atualizando código do repositório (git pull)..."
    
    # Verificar se há mudanças não commitadas
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Warning "Há mudanças não commitadas no repositório:"
        Write-Host $gitStatus -ForegroundColor Yellow
        $response = Read-Host "Deseja continuar mesmo assim? (S/N)"
        if ($response -ne "S" -and $response -ne "s") {
            Write-Error "Deploy cancelado pelo usuário"
            exit 1
        }
    }
    
    # Fazer pull
    if (Invoke-SafeCommand "git pull origin $Branch" -ErrorMessage "Erro ao fazer git pull") {
        Write-Success "Código atualizado com sucesso"
    } else {
        Write-Error "Falha ao atualizar código. Verifique sua conexão e permissões do Git."
        exit 1
    }
} else {
    Write-Warning "1/7 Pulando git pull (--SkipGitPull)"
}

# ============================================================================
# 2. BACKEND - INSTALAR DEPENDÊNCIAS
# ============================================================================

Write-Step "2/7 Instalando dependências do backend..."

if (Invoke-SafeCommand "npm install" -WorkingDirectory "backend" -ErrorMessage "Erro ao instalar dependências do backend") {
    Write-Success "Dependências do backend instaladas"
} else {
    Write-Error "Falha ao instalar dependências do backend"
    exit 1
}

# ============================================================================
# 3. BACKEND - GERAR PRISMA CLIENT
# ============================================================================

Write-Step "3/7 Gerando Prisma Client..."

if (Invoke-SafeCommand "npm run prisma:generate" -WorkingDirectory "backend" -ErrorMessage "Erro ao gerar Prisma Client") {
    Write-Success "Prisma Client gerado com sucesso"
} else {
    Write-Error "Falha ao gerar Prisma Client"
    exit 1
}

# ============================================================================
# 4. BACKEND - EXECUTAR MIGRATIONS
# ============================================================================

if (-not $SkipMigrations) {
    Write-Step "4/7 Executando migrations do banco de dados..."
    
    $response = Read-Host "Deseja executar as migrations? Isso pode alterar o banco de dados. (S/N)"
    if ($response -eq "S" -or $response -eq "s") {
        if (Invoke-SafeCommand "npm run prisma:migrate deploy" -WorkingDirectory "backend" -ErrorMessage "Erro ao executar migrations") {
            Write-Success "Migrations executadas com sucesso"
        } else {
            Write-Error "Falha ao executar migrations. Verifique a conexão com o banco de dados."
            exit 1
        }
    } else {
        Write-Warning "Migrations puladas pelo usuário"
    }
} else {
    Write-Warning "4/7 Pulando migrations (--SkipMigrations)"
}

# ============================================================================
# 5. BACKEND - BUILD
# ============================================================================

if (-not $SkipBuild) {
    Write-Step "5/7 Fazendo build do backend..."
    
    if (Invoke-SafeCommand "npm run build" -WorkingDirectory "backend" -ErrorMessage "Erro ao fazer build do backend") {
        Write-Success "Build do backend concluído"
    } else {
        Write-Error "Falha ao fazer build do backend. Verifique os erros de TypeScript acima."
        exit 1
    }
} else {
    Write-Warning "5/7 Pulando build do backend (--SkipBuild)"
}

# ============================================================================
# 6. FRONTEND - INSTALAR DEPENDÊNCIAS
# ============================================================================

Write-Step "6/7 Instalando dependências do frontend..."

if (Invoke-SafeCommand "npm install" -WorkingDirectory "frontend" -ErrorMessage "Erro ao instalar dependências do frontend") {
    Write-Success "Dependências do frontend instaladas"
} else {
    Write-Error "Falha ao instalar dependências do frontend"
    exit 1
}

# ============================================================================
# 7. FRONTEND - BUILD
# ============================================================================

if (-not $SkipBuild) {
    Write-Step "7/7 Fazendo build do frontend..."
    
    if (Invoke-SafeCommand "npm run build" -WorkingDirectory "frontend" -ErrorMessage "Erro ao fazer build do frontend") {
        Write-Success "Build do frontend concluído"
    } else {
        Write-Error "Falha ao fazer build do frontend. Verifique os erros acima."
        exit 1
    }
} else {
    Write-Warning "7/7 Pulando build do frontend (--SkipBuild)"
}

# ============================================================================
# CONCLUSÃO
# ============================================================================

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

if ($script:HasErrors) {
    Write-Warning "Alguns erros ocorreram durante o deploy. Revise os logs acima."
} else {
    Write-Success "Todos os passos foram executados com sucesso!"
}

Write-Host "`n📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. No servidor de produção (VPS), execute:" -ForegroundColor Yellow
Write-Host "     cd /opt/athletia" -ForegroundColor White
Write-Host "     git pull origin $Branch" -ForegroundColor White
Write-Host ""
Write-Host "  2. Reinicie os serviços PM2:" -ForegroundColor Yellow
Write-Host "     pm2 restart athletia-backend" -ForegroundColor White
Write-Host "     pm2 restart athletia-frontend" -ForegroundColor White
Write-Host ""
Write-Host "  3. Ou use o script de deploy do servidor:" -ForegroundColor Yellow
Write-Host "     bash deploy.sh" -ForegroundColor White
Write-Host ""
Write-Host "  4. Verifique os logs:" -ForegroundColor Yellow
Write-Host "     pm2 logs athletia-backend" -ForegroundColor White
Write-Host "     pm2 logs athletia-frontend" -ForegroundColor White
Write-Host ""
Write-Host "  5. Recarregue o Nginx (se necessário):" -ForegroundColor Yellow
Write-Host "     sudo systemctl reload nginx" -ForegroundColor White
Write-Host ""

# Verificar se PM2 está disponível (para desenvolvimento local)
$pm2Available = Get-Command pm2 -ErrorAction SilentlyContinue
if ($pm2Available) {
    Write-Host "💡 PM2 detectado localmente. Deseja reiniciar os serviços agora? (S/N)" -ForegroundColor Cyan
    $response = Read-Host
    if ($response -eq "S" -or $response -eq "s") {
        Write-Step "Reiniciando serviços PM2..."
        pm2 restart athletia-backend 2>$null
        pm2 restart athletia-frontend 2>$null
        Write-Success "Serviços reiniciados"
    }
}

Write-Host "`n✨ Deploy finalizado!" -ForegroundColor Green
Write-Host ""
