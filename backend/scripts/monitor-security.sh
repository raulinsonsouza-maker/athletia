#!/bin/bash

# Script de monitoramento de segurança
# Analisa logs e detecta padrões suspeitos
# Executar via cron a cada 5 minutos: */5 * * * * /caminho/para/script.sh

LOG_FILE="${LOG_FILE:-/var/log/athletia/app.log}"
ALERT_EMAIL="${ALERT_EMAIL:-admin@athletia.site}"
ALERT_THRESHOLD_AUTH_FAILED=10  # Alertar após 10 tentativas de login falhadas
ALERT_THRESHOLD_IDOR=3          # Alertar após 3 tentativas de IDOR
ALERT_THRESHOLD_RATE_LIMIT=5    # Alertar após 5 rate limits excedidos

# Verificar se arquivo de log existe
if [ ! -f "$LOG_FILE" ]; then
    echo "⚠️  Arquivo de log não encontrado: $LOG_FILE"
    exit 0
fi

# Contadores
AUTH_FAILED_COUNT=0
IDOR_COUNT=0
RATE_LIMIT_COUNT=0
ADMIN_ACCESS_COUNT=0

# Analisar últimos 5 minutos de logs
SINCE=$(date -d '5 minutes ago' '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -v-5M '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "")

if [ -z "$SINCE" ]; then
    # Fallback: analisar últimas 100 linhas
    RECENT_LOGS=$(tail -100 "$LOG_FILE")
else
    # Filtrar logs dos últimos 5 minutos (formato ISO)
    RECENT_LOGS=$(grep -E "$(date -d '5 minutes ago' '+%Y-%m-%d')" "$LOG_FILE" | tail -100)
fi

# Contar eventos de segurança
AUTH_FAILED_COUNT=$(echo "$RECENT_LOGS" | grep -c "AUTH_FAILED" || echo "0")
IDOR_COUNT=$(echo "$RECENT_LOGS" | grep -c "IDOR_ATTEMPT" || echo "0")
RATE_LIMIT_COUNT=$(echo "$RECENT_LOGS" | grep -c "RATE_LIMIT_EXCEEDED" || echo "0")
ADMIN_ACCESS_COUNT=$(echo "$RECENT_LOGS" | grep -c "ADMIN_ACTION" || echo "0")

# Verificar se há alertas
ALERTS=()

if [ "$AUTH_FAILED_COUNT" -ge "$ALERT_THRESHOLD_AUTH_FAILED" ]; then
    ALERTS+=("🔴 Múltiplas tentativas de login falhadas: $AUTH_FAILED_COUNT (limite: $ALERT_THRESHOLD_AUTH_FAILED)")
fi

if [ "$IDOR_COUNT" -ge "$ALERT_THRESHOLD_IDOR" ]; then
    ALERTS+=("🔴 Tentativas de IDOR detectadas: $IDOR_COUNT (limite: $ALERT_THRESHOLD_IDOR)")
fi

if [ "$RATE_LIMIT_COUNT" -ge "$ALERT_THRESHOLD_RATE_LIMIT" ]; then
    ALERTS+=("🟡 Rate limit excedido múltiplas vezes: $RATE_LIMIT_COUNT (limite: $ALERT_THRESHOLD_RATE_LIMIT)")
fi

# Se houver alertas, enviar notificação
if [ ${#ALERTS[@]} -gt 0 ]; then
    ALERT_MESSAGE="ALERTAS DE SEGURANÇA - Athletia
=====================================
Data: $(date)
Período: Últimos 5 minutos

Eventos Detectados:
$(printf '%s\n' "${ALERTS[@]}")

Estatísticas:
- Tentativas de login falhadas: $AUTH_FAILED_COUNT
- Tentativas de IDOR: $IDOR_COUNT
- Rate limits excedidos: $RATE_LIMIT_COUNT
- Acessos administrativos: $ADMIN_ACCESS_COUNT

Ação Recomendada:
- Verificar logs completos: $LOG_FILE
- Revisar tentativas de acesso suspeitas
- Considerar bloquear IPs se necessário
"

    # Enviar email (requer mail ou sendmail configurado)
    if command -v mail &> /dev/null; then
        echo "$ALERT_MESSAGE" | mail -s "🚨 Alertas de Segurança - Athletia" "$ALERT_EMAIL"
    elif command -v sendmail &> /dev/null; then
        echo "$ALERT_MESSAGE" | sendmail "$ALERT_EMAIL"
    else
        # Se não houver mail, apenas logar
        echo "[$(date)] ALERTAS DE SEGURANÇA:" >> /var/log/athletia-security-alerts.log
        echo "$ALERT_MESSAGE" >> /var/log/athletia-security-alerts.log
        echo "---" >> /var/log/athletia-security-alerts.log
    fi

    # Também logar no console
    echo "$ALERT_MESSAGE"
fi

# Log de resumo (sempre)
echo "[$(date)] Monitoramento: AuthFailed=$AUTH_FAILED_COUNT, IDOR=$IDOR_COUNT, RateLimit=$RATE_LIMIT_COUNT, AdminAccess=$ADMIN_ACCESS_COUNT"

