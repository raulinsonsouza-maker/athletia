# Procedimento de Backup e Restore - Athletia

## Configuração de Backups Automáticos

### Linux/macOS

1. **Tornar o script executável:**
```bash
chmod +x backend/scripts/backup-db.sh
```

2. **Configurar variável de ambiente:**
```bash
export DATABASE_URL="postgresql://usuario:senha@localhost:5432/athletia"
export BACKUP_DIR="/opt/athletia/backups"  # Opcional, padrão é /opt/athletia/backups
```

3. **Configurar cron para backup diário (executa às 2h da manhã):**
```bash
# Editar crontab
crontab -e

# Adicionar linha (ajustar caminhos conforme necessário):
0 2 * * * cd /caminho/para/athletia/backend && /usr/bin/env bash scripts/backup-db.sh >> /var/log/athletia-backup.log 2>&1
```

### Windows

1. **Executar manualmente:**
```powershell
cd backend
.\scripts\backup-db.ps1
```

2. **Configurar Task Scheduler:**
   - Abrir Task Scheduler
   - Criar nova tarefa básica
   - Nome: "Athletia Database Backup"
   - Trigger: Diariamente às 2:00
   - Ação: Iniciar programa
   - Programa: `powershell.exe`
   - Argumentos: `-ExecutionPolicy Bypass -File "C:\caminho\para\athletia\backend\scripts\backup-db.ps1"`
   - Diretório inicial: `C:\caminho\para\athletia\backend`

### Usando npm (qualquer plataforma)

```bash
# Linux/macOS
npm run backup:db

# Windows
npm run backup:db:win
```

## Localização dos Backups

- **Linux/macOS**: `/opt/athletia/backups/` (ou valor de `BACKUP_DIR`)
- **Windows**: `C:\athletia\backups\` (ou valor de `BACKUP_DIR`)

Formato dos arquivos: `athletia_YYYYMMDD_HHMMSS.sql.gz`

## Retenção

- Backups são mantidos por **7 dias**
- Backups mais antigos são automaticamente removidos
- Aproximadamente **7 backups** são mantidos (um por dia)

## Procedimento de Restore

### 1. Listar Backups Disponíveis

```bash
# Linux/macOS
ls -lh /opt/athletia/backups/

# Windows
dir C:\athletia\backups\
```

### 2. Restaurar Backup

**Importante**: Fazer backup do banco atual antes de restaurar!

```bash
# 1. Fazer backup do banco atual (segurança)
pg_dump $DATABASE_URL > backup_antes_restore_$(date +%Y%m%d).sql

# 2. Descomprimir backup (se estiver comprimido)
gunzip /opt/athletia/backups/athletia_20241220_020000.sql.gz

# 3. Restaurar backup
psql $DATABASE_URL < /opt/athletia/backups/athletia_20241220_020000.sql
```

**Windows (PowerShell):**
```powershell
# 1. Fazer backup do banco atual
pg_dump $env:DATABASE_URL > "backup_antes_restore_$(Get-Date -Format 'yyyyMMdd').sql"

# 2. Descomprimir backup (usar 7-Zip ou similar)
# Ou usar PowerShell:
$input = [System.IO.File]::OpenRead("C:\athletia\backups\athletia_20241220_020000.sql.gz")
$output = [System.IO.File]::Create("C:\athletia\backups\athletia_20241220_020000.sql")
$gzip = New-Object System.IO.Compression.GZipStream($input, [System.IO.Compression.CompressionMode]::Decompress)
$gzip.CopyTo($output)
$gzip.Close()
$output.Close()
$input.Close()

# 3. Restaurar backup
Get-Content "C:\athletia\backups\athletia_20241220_020000.sql" | psql $env:DATABASE_URL
```

### 3. Verificar Restore

```sql
-- Conectar ao banco
psql $DATABASE_URL

-- Verificar tabelas
\dt

-- Verificar contagem de registros
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "Treino";
```

## RPO e RTO

- **RPO (Recovery Point Objective)**: 24 horas
  - Backups são feitos diariamente
  - Máxima perda de dados: 24 horas

- **RTO (Recovery Time Objective)**: 4 horas
  - Tempo estimado para restaurar sistema após falha
  - Inclui: identificar problema, localizar backup, restaurar, verificar

## Teste de Restore

**Recomendação**: Testar restore mensalmente em ambiente de desenvolvimento/staging.

1. Criar banco de teste
2. Restaurar backup de produção no banco de teste
3. Verificar integridade dos dados
4. Testar funcionalidades críticas

## Troubleshooting

### Erro: "pg_dump: command not found"
- Instalar PostgreSQL client tools
- Linux: `sudo apt install postgresql-client` (Debian/Ubuntu) ou `sudo yum install postgresql` (RHEL/CentOS)
- macOS: `brew install postgresql`
- Windows: Instalar PostgreSQL completo

### Erro: "Permission denied"
- Verificar permissões do diretório de backup
- Linux: `sudo chown -R $USER:$USER /opt/athletia/backups`
- Windows: Executar PowerShell como Administrador

### Backup vazio ou corrompido
- Verificar conexão com banco de dados
- Verificar espaço em disco
- Verificar logs de erro

## Monitoramento

- Verificar logs do cron: `/var/log/athletia-backup.log` (Linux)
- Verificar se backups estão sendo criados: `ls -lh /opt/athletia/backups/`
- Configurar alertas se backup falhar (opcional)

