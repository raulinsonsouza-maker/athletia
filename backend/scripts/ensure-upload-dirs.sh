#!/bin/bash
# Script para garantir que todos os diretórios de upload existem no servidor

echo "=== Garantindo diretórios de upload ==="

BASE_DIR="/opt/athletia/backend"

# Criar estrutura de diretórios
DIRS=(
  "$BASE_DIR/uploads"
  "$BASE_DIR/uploads/exercicios"
  "$BASE_DIR/uploads/grupos-musculares"
  "$BASE_DIR/uploads/temp"
)

for dir in "${DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    echo "Criando diretório: $dir"
    mkdir -p "$dir"
    chmod 755 "$dir"
  else
    echo "Diretório já existe: $dir"
  fi
done

# Verificar permissões
echo "=== Verificando permissões ==="
chmod -R 755 "$BASE_DIR/uploads"
chown -R root:root "$BASE_DIR/uploads" 2>/dev/null || echo "Aviso: Não foi possível alterar owner (pode precisar de sudo)"

echo "=== Estrutura de diretórios verificada ==="
ls -la "$BASE_DIR/uploads" 2>/dev/null || echo "Erro: Não foi possível listar diretório"

