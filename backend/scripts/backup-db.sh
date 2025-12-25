#!/bin/bash

# Script de backup do banco de dados PostgreSQL
# Mantém backups dos últimos 7 dias
# Uso: ./backup-db.sh

# Configurações
BACKUP_DIR="${BACKUP_DIR:-/opt/athletia/backups}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="athletia_${DATE}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Verificar se DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erro: DATABASE_URL não está definida"
    echo "Configure a variável de ambiente DATABASE_URL antes de executar o backup"
    exit 1
fi

# Extrair informações da DATABASE_URL
# Formato: postgresql://usuario:senha@host:porta/database
DB_URL="$DATABASE_URL"

# Executar backup usando pg_dump
echo "🔄 Iniciando backup do banco de dados..."
echo "📁 Diretório de backup: $BACKUP_DIR"
echo "📄 Arquivo: $BACKUP_FILE"

if pg_dump "$DB_URL" > "$BACKUP_PATH" 2>&1; then
    # Verificar se o arquivo foi criado e tem conteúdo
    if [ -f "$BACKUP_PATH" ] && [ -s "$BACKUP_PATH" ]; then
        FILE_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
        echo "✅ Backup criado com sucesso!"
        echo "📊 Tamanho: $FILE_SIZE"
        echo "📍 Local: $BACKUP_PATH"
        
        # Comprimir backup (opcional, economiza espaço)
        echo "🗜️  Comprimindo backup..."
        if gzip "$BACKUP_PATH"; then
            COMPRESSED_FILE="${BACKUP_PATH}.gz"
            COMPRESSED_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
            echo "✅ Backup comprimido com sucesso!"
            echo "📊 Tamanho comprimido: $COMPRESSED_SIZE"
            echo "📍 Local: $COMPRESSED_FILE"
        else
            echo "⚠️  Aviso: Falha ao comprimir backup, mas backup SQL foi criado"
        fi
    else
        echo "❌ Erro: Arquivo de backup criado mas está vazio ou não existe"
        exit 1
    fi
else
    echo "❌ Erro ao criar backup do banco de dados"
    exit 1
fi

# Limpar backups antigos (manter apenas últimos 7 dias)
echo "🧹 Limpando backups antigos (mantendo últimos 7 dias)..."
DELETED_COUNT=0
FIND_CMD="find $BACKUP_DIR -name 'athletia_*.sql*' -type f -mtime +7"

if [ "$(uname)" = "Linux" ]; then
    # Linux
    while IFS= read -r file; do
        if [ -n "$file" ]; then
            rm -f "$file"
            DELETED_COUNT=$((DELETED_COUNT + 1))
            echo "  🗑️  Removido: $(basename "$file")"
        fi
    done < <($FIND_CMD)
else
    # macOS/BSD
    find "$BACKUP_DIR" -name 'athletia_*.sql*' -type f -mtime +7 -exec rm -f {} \;
    DELETED_COUNT=$(find "$BACKUP_DIR" -name 'athletia_*.sql*' -type f -mtime +7 | wc -l | tr -d ' ')
fi

if [ "$DELETED_COUNT" -gt 0 ]; then
    echo "✅ $DELETED_COUNT backup(s) antigo(s) removido(s)"
else
    echo "ℹ️  Nenhum backup antigo para remover"
fi

# Listar backups atuais
echo ""
echo "📋 Backups disponíveis (últimos 7 dias):"
ls -lh "$BACKUP_DIR"/athletia_*.sql* 2>/dev/null | tail -7 || echo "  Nenhum backup encontrado"

echo ""
echo "✅ Processo de backup concluído!"

