"""
Script para processar e estruturar conhecimento dos PDFs
"""
import json
from pathlib import Path
import re

def extrair_conceitos_chave(texto):
    """Extrai conceitos importantes do texto"""
    conceitos = {
        'terminologias': [],
        'principios': [],
        'tecnicas': [],
        'exercicios': [],
        'periodizacao': [],
        'fisiologia': []
    }
    
    # Padrões para identificar conceitos
    padroes = {
        'terminologias': [
            r'hipertrofia',
            r'RM\s*\([^)]*\)',
            r'repetição\s+máxima',
            r'RPE',
            r'fase\s+concêntrica',
            r'fase\s+excêntrica',
            r'fase\s+isométrica',
            r'fibras\s+musculares',
            r'tipo\s+I',
            r'tipo\s+II',
        ],
        'principios': [
            r'sobrecarga\s+progressiva',
            r'especificidade',
            r'individualidade',
            r'reversibilidade',
            r'periodização',
        ],
        'tecnicas': [
            r'drop\s*set',
            r'bi\s*set',
            r'tri\s*set',
            r'superset',
            r'rest\s*pause',
            r'cluster',
        ],
        'periodizacao': [
            r'ABC',
            r'ABCD',
            r'push\s*pull\s*legs',
            r'full\s*body',
            r'upper\s*lower',
            r'divisão\s+de\s+treino',
        ]
    }
    
    texto_lower = texto.lower()
    
    for categoria, lista_padroes in padroes.items():
        for padrao in lista_padroes:
            matches = re.finditer(padrao, texto_lower, re.IGNORECASE)
            for match in matches:
                contexto = texto[max(0, match.start()-100):match.end()+100]
                conceitos[categoria].append({
                    'termo': match.group(),
                    'contexto': contexto.strip()
                })
    
    return conceitos

def processar_pdfs():
    """Processa os PDFs e extrai conhecimento estruturado"""
    json_file = Path(__file__).parent / "conteudo_pdfs.json"
    
    if not json_file.exists():
        print("Arquivo JSON não encontrado. Execute extrair_pdfs.py primeiro.")
        return None
    
    with open(json_file, 'r', encoding='utf-8') as f:
        dados = json.load(f)
    
    conhecimento_estruturado = {
        'fontes': [],
        'conceitos': {
            'terminologias': [],
            'principios': [],
            'tecnicas': [],
            'exercicios': [],
            'periodizacao': [],
            'fisiologia': []
        },
        'resumos_por_capitulo': []
    }
    
    for nome_arquivo, conteudo in dados.items():
        print(f"\nProcessando: {nome_arquivo}")
        
        fonte = {
            'arquivo': nome_arquivo,
            'total_paginas': conteudo['total_paginas'],
            'capitulos': []
        }
        
        texto_completo = ""
        for pagina in conteudo['conteudo']:
            texto_completo += pagina['texto'] + "\n"
        
        # Extrair conceitos
        conceitos = extrair_conceitos_chave(texto_completo)
        for categoria, itens in conceitos.items():
            conhecimento_estruturado['conceitos'][categoria].extend(itens)
        
        # Identificar capítulos
        capitulos = re.finditer(r'CAPÍTULO\s+[O0]?(\d+)', texto_completo, re.IGNORECASE)
        for match in capitulos:
            num_cap = match.group(1)
            inicio = match.start()
            # Procurar próximo capítulo ou fim
            proximo = re.search(r'CAPÍTULO\s+[O0]?(\d+)', texto_completo[inicio+100:], re.IGNORECASE)
            fim = inicio + proximo.start() if proximo else len(texto_completo)
            
            conteudo_cap = texto_completo[inicio:fim]
            fonte['capitulos'].append({
                'numero': num_cap,
                'conteudo': conteudo_cap[:2000]  # Primeiros 2000 chars
            })
        
        conhecimento_estruturado['fontes'].append(fonte)
    
    return conhecimento_estruturado

if __name__ == "__main__":
    conhecimento = processar_pdfs()
    
    if conhecimento:
        output_file = Path(__file__).parent / "conhecimento_estruturado.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(conhecimento, f, ensure_ascii=False, indent=2)
        
        print(f"\n✓ Conhecimento estruturado salvo em: {output_file}")
        print(f"Total de fontes: {len(conhecimento['fontes'])}")
        for categoria, itens in conhecimento['conceitos'].items():
            print(f"  {categoria}: {len(itens)} itens")

