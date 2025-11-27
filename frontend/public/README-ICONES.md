# Gerador de Ícones AthletIA

Este diretório contém os arquivos necessários para gerar os ícones do aplicativo.

## Método 1: Usando o gerador HTML (Recomendado)

1. Abra o arquivo `generate-icons.html` no navegador
2. Clique com botão direito em cada canvas
3. Salve como PNG com o nome indicado
4. Coloque os arquivos na pasta `/public`

## Método 2: Usando Node.js (Automatizado)

1. Instale a dependência:
```bash
npm install canvas
```

2. Execute o script:
```bash
node generate-icons.js
```

## Arquivos necessários:

- `favicon.svg` ✅ (já criado)
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` (180x180)
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`
- `mstile-150x150.png` (para Windows)

## Especificações:

- **Cor de fundo**: #F9A620 (amarelo primário)
- **Cor da letra**: #000000 (preto)
- **Letra**: A (bold)
- **Bordas**: Arredondadas (22% do tamanho)

