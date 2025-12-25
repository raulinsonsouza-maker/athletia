# Script de monitoramento de segurança (PowerShell)
# Analisa logs e detecta padrões suspeitos
# Executar via Task Scheduler a cada 5 minutos

$LogFile = if ($env:LOG_FILE) { $env:LOG_FILE } else { "C:\athletia\logs\app.log" }
$AlertEmail = if ($env:ALERT_EMAIL) { $env:ALERT_EMAIL } else { "admin@athletia.site" }
$AlertThresholdAuthFailed = 10
$AlertThresholdIDOR = 3
$AlertThresholdRateLimit = 5

# Verificar se arquivo de log existe
if (-not (Test-Path $LogFile)) {
    Write-Host "⚠️  Arquivo de log não encontrado: $LogFile"
    exit 0
}

# Ler últimas 100 linhas do log
$RecentLogs = Get-Content $LogFile -Tail 100

# Contar eventos
$AuthFailedCount = ($RecentLogs | Select-String "AUTH_FAILED").Count
$IDORCount = ($RecentLogs | Select-String "IDOR_ATTEMPT").Count
$RateLimitCount = ($RecentLogs | Select-String "RATE_LIMIT_EXCEEDED").Count
$AdminAccessCount = ($RecentLogs | Select-String "ADMIN_ACTION").Count

# Verificar alertas
$Alerts = @()

if ($AuthFailedCount -ge $AlertThresholdAuthFailed) {
    $Alerts += "🔴 Múltiplas tentativas de login falhadas: $AuthFailedCount (limite: $AlertThresholdAuthFailed)"
}

if ($IDORCount -ge $AlertThresholdIDOR) {
    $Alerts += "🔴 Tentativas de IDOR detectadas: $IDORCount (limite: $AlertThresholdIDOR)"
}

if ($RateLimitCount -ge $AlertThresholdRateLimit) {
    $Alerts += "🟡 Rate limit excedido múltiplas vezes: $RateLimitCount (limite: $AlertThresholdRateLimit)"
}

# Se houver alertas, enviar notificação
if ($Alerts.Count -gt 0) {
    $AlertMessage = @"
ALERTAS DE SEGURANÇA - Athletia
=====================================
Data: $(Get-Date)
Período: Últimos 5 minutos

Eventos Detectados:
$($Alerts -join "`n")

Estatísticas:
- Tentativas de login falhadas: $AuthFailedCount
- Tentativas de IDOR: $IDORCount
- Rate limits excedidos: $RateLimitCount
- Acessos administrativos: $AdminAccessCount

Ação Recomendada:
- Verificar logs completos: $LogFile
- Revisar tentativas de acesso suspeitas
- Considerar bloquear IPs se necessário
"@

    # Salvar em arquivo de alertas
    $AlertLogFile = "C:\athletia\logs\security-alerts.log"
    Add-Content -Path $AlertLogFile -Value "[$(Get-Date)] ALERTAS DE SEGURANÇA:"
    Add-Content -Path $AlertLogFile -Value $AlertMessage
    Add-Content -Path $AlertLogFile -Value "---"

    # Tentar enviar email (requer configuração SMTP)
    try {
        Send-MailMessage -To $AlertEmail -Subject "🚨 Alertas de Segurança - Athletia" -Body $AlertMessage -From "noreply@athletia.site" -SmtpServer "localhost"
    } catch {
        Write-Host "⚠️  Não foi possível enviar email. Alertas salvos em: $AlertLogFile"
    }

    Write-Host $AlertMessage
}

# Log de resumo
Write-Host "[$(Get-Date)] Monitoramento: AuthFailed=$AuthFailedCount, IDOR=$IDORCount, RateLimit=$RateLimitCount, AdminAccess=$AdminAccessCount"

