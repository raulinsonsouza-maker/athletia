#!/bin/bash

# Script para renomear arquivos exercicio.* para media.* em produção
# Execute este script no servidor VPS

UPLOAD_DIR="/opt/athletia/backend/upload/exercicios"

echo "========================================================================"
echo "RENOMEANDO ARQUIVOS DE EXERCICIO.* PARA MEDIA.* EM PRODUÇÃO"
echo "========================================================================"
echo ""

if [ ! -d "$UPLOAD_DIR" ]; then
  echo "❌ Diretório $UPLOAD_DIR não existe!"
  exit 1
fi

echo "📁 Diretório: $UPLOAD_DIR"
echo ""

total_renomeados=0
total_erros=0

# Iterar sobre todos os diretórios de exercícios
for dir in "$UPLOAD_DIR"/*; do
  if [ -d "$dir" ]; then
    dir_name=$(basename "$dir")
    
    # Procurar por arquivos exercicio.*
    for old_file in "$dir"/exercicio.*; do
      if [ -f "$old_file" ]; then
        # Extrair extensão
        ext="${old_file##*.}"
        new_file="$dir/media.$ext"
        
        # Verificar se já existe um arquivo media.*
        if [ -f "$new_file" ]; then
          echo "⚠️  $dir_name: media.$ext já existe, pulando..."
          continue
        fi
        
        # Renomear arquivo
        if mv "$old_file" "$new_file"; then
          ((total_renomeados++))
          echo "✅ $dir_name: exercicio.$ext → media.$ext"
        else
          ((total_erros++))
          echo "❌ Erro ao renomear em $dir_name"
        fi
      fi
    done
  fi
done

echo ""
echo "========================================================================"
echo "RESUMO"
echo "========================================================================"
echo "Total de arquivos renomeados: $total_renomeados"
echo "Total de erros: $total_erros"
echo "========================================================================"
