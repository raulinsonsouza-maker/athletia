"""
Script para extrair conteúdo dos PDFs e estruturar informações
"""
import os
import sys
import json
from pathlib import Path

# Adicionar path para importar bibliotecas
sys.path.append(str(Path(__file__).parent.parent))

try:
    import PyPDF2
    HAS_PYPDF2 = True
except ImportError:
    HAS_PYPDF2 = False

try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False

def extrair_texto_pypdf2(caminho_pdf):
    """Extrai texto usando PyPDF2"""
    texto_completo = []
    try:
        with open(caminho_pdf, 'rb') as arquivo:
            leitor = PyPDF2.PdfReader(arquivo)
            for pagina_num, pagina in enumerate(leitor.pages, 1):
                texto = pagina.extract_text()
                if texto.strip():
                    texto_completo.append({
                        'pagina': pagina_num,
                        'texto': texto
                    })
    except Exception as e:
        print(f"Erro ao ler {caminho_pdf} com PyPDF2: {e}")
    return texto_completo

def extrair_texto_pdfplumber(caminho_pdf):
    """Extrai texto usando pdfplumber (mais preciso)"""
    texto_completo = []
    try:
        with pdfplumber.open(caminho_pdf) as pdf:
            for pagina_num, pagina in enumerate(pdf.pages, 1):
                texto = pagina.extract_text()
                if texto:
                    texto_completo.append({
                        'pagina': pagina_num,
                        'texto': texto
                    })
    except Exception as e:
        print(f"Erro ao ler {caminho_pdf} com pdfplumber: {e}")
    return texto_completo

def extrair_pdf(caminho_pdf):
    """Tenta extrair texto do PDF usando bibliotecas disponíveis"""
    if HAS_PDFPLUMBER:
        return extrair_texto_pdfplumber(caminho_pdf)
    elif HAS_PYPDF2:
        return extrair_texto_pypdf2(caminho_pdf)
    else:
        print("Nenhuma biblioteca de PDF disponível. Instale pdfplumber ou PyPDF2")
        return []

def processar_pdfs(pasta_conhecimento):
    """Processa todos os PDFs na pasta"""
    resultados = {}
    pasta = Path(pasta_conhecimento)
    
    if not pasta.exists():
        print(f"Pasta não encontrada: {pasta_conhecimento}")
        return resultados
    
    pdfs = list(pasta.glob("*.pdf"))
    print(f"Encontrados {len(pdfs)} PDFs")
    
    for pdf in pdfs:
        print(f"\nProcessando: {pdf.name}")
        conteudo = extrair_pdf(str(pdf))
        if conteudo:
            resultados[pdf.name] = {
                'arquivo': pdf.name,
                'total_paginas': len(conteudo),
                'conteudo': conteudo
            }
            print(f"  ✓ Extraído: {len(conteudo)} páginas")
        else:
            print(f"  ✗ Falha na extração")
    
    return resultados

if __name__ == "__main__":
    pasta_conhecimento = Path(__file__).parent.parent / "Conhecimento"
    resultados = processar_pdfs(pasta_conhecimento)
    
    # Salvar resultados em JSON
    output_file = Path(__file__).parent / "conteudo_pdfs.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(resultados, f, ensure_ascii=False, indent=2)
    
    print(f"\n✓ Conteúdo salvo em: {output_file}")
    print(f"Total de arquivos processados: {len(resultados)}")

