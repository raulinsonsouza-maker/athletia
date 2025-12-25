# Script de backup do banco de dados PostgreSQL (PowerShell)
# Mantém backups dos últimos 7 dias
# Uso: .\backup-db.ps1

# Configurações
$BackupDir = if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { "C:\athletia\backups" }
$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = "athletia_$Date.sql"
$BackupPath = Join-Path $BackupDir $BackupFile

# Criar diretório de backup se não existir
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

# Verificar se DATABASE_URL está definida
if (-not $env:DATABASE_URL) {
    Write-Host "❌ Erro: DATABASE_URL não está definida" -ForegroundColor Red
    Write-Host "Configure a variável de ambiente DATABASE_URL antes de executar o backup"
    exit 1
}

$DbUrl = $env:DATABASE_URL

# Executar backup usando pg_dump
Write-Host "🔄 Iniciando backup do banco de dados..." -ForegroundColor Cyan
Write-Host "📁 Diretório de backup: $BackupDir"
Write-Host "📄 Arquivo: $BackupFile"

try {
    # Executar pg_dump
    $process = Start-Process -FilePath "pg_dump" -ArgumentList $DbUrl -RedirectStandardOutput $BackupPath -RedirectStandardError "error.log" -NoNewWindow -Wait -PassThru
    
    if ($process.ExitCode -eq 0 -and (Test-Path $BackupPath) -and (Get-Item $BackupPath).Length -gt 0) {
        $FileSize = (Get-Item $BackupPath).Length / 1MB
        Write-Host "✅ Backup criado com sucesso!" -ForegroundColor Green
        Write-Host "📊 Tamanho: $([math]::Round($FileSize, 2)) MB"
        Write-Host "📍 Local: $BackupPath"
        
        # Comprimir backup (opcional)
        Write-Host "🗜️  Comprimindo backup..." -ForegroundColor Cyan
        try {
            $CompressedPath = "$BackupPath.gz"
            $input = [System.IO.File]::OpenRead($BackupPath)
            $output = [System.IO.File]::Create($CompressedPath)
            $gzip = New-Object System.IO.Compression.GZipStream($output, [System.IO.Compression.CompressionMode]::Compress)
            $input.CopyTo($gzip)
            $gzip.Close()
            $output.Close()
            $input.Close()
            
            $CompressedSize = (Get-Item $CompressedPath).Length / 1MB
            Write-Host "✅ Backup comprimido com sucesso!" -ForegroundColor Green
            Write-Host "📊 Tamanho comprimido: $([math]::Round($CompressedSize, 2)) MB"
            Write-Host "📍 Local: $CompressedPath"
            
            # Remover arquivo não comprimido
            Remove-Item $BackupPath
        } catch {
            Write-Host "⚠️  Aviso: Falha ao comprimir backup, mas backup SQL foi criado" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Erro ao criar backup do banco de dados" -ForegroundColor Red
        if (Test-Path "error.log") {
            Get-Content "error.log" | Write-Host -ForegroundColor Red
        }
        exit 1
    }
} catch {
    Write-Host "❌ Erro: $_" -ForegroundColor Red
    exit 1
}

# Limpar backups antigos (manter apenas últimos 7 dias)
Write-Host "🧹 Limpando backups antigos (mantendo últimos 7 dias)..." -ForegroundColor Cyan
$CutoffDate = (Get-Date).AddDays(-7)
$DeletedCount = 0

Get-ChildItem -Path $BackupDir -Filter "athletia_*.sql*" | Where-Object {
    $_.LastWriteTime -lt $CutoffDate
} | ForEach-Object {
    Write-Host "  🗑️  Removido: $($_.Name)" -ForegroundColor Yellow
    Remove-Item $_.FullName -Force
    $DeletedCount++
}

if ($DeletedCount -gt 0) {
    Write-Host "✅ $DeletedCount backup(s) antigo(s) removido(s)" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Nenhum backup antigo para remover" -ForegroundColor Gray
}

# Listar backups atuais
Write-Host ""
Write-Host "📋 Backups disponíveis (últimos 7 dias):" -ForegroundColor Cyan
Get-ChildItem -Path $BackupDir -Filter "athletia_*.sql*" | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object -First 7 | 
    ForEach-Object {
        $Size = [math]::Round($_.Length / 1MB, 2)
        Write-Host "  $($_.Name) - $Size MB - $($_.LastWriteTime)"
    }

Write-Host ""
Write-Host "✅ Processo de backup concluído!" -ForegroundColor Green

