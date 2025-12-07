# Ícones PWA - Guia de Configuração

## Gerar Ícones de Alta Qualidade

Para gerar os ícones PNG a partir do SVG (necessário para PWA):

```bash
# 1. Instalar dependência (se ainda não tiver)
npm install sharp --save-dev

# 2. Gerar ícones
npm run gerar-icones
```

Isso irá gerar:
- `icon-192x192.png` - Para Android
- `icon-512x512.png` - Para Android (alta resolução)
- `apple-touch-icon.png` - Para iOS (180x180)
- `favicon-32x32.png` - Para navegadores
- `favicon-16x16.png` - Para navegadores

## Logo com Haltere

O novo logo (`favicon.svg`) possui:
- ✅ Fundo amarelo (#F9A620) que ocupa todo o espaço
- ✅ Haltere profissional centralizado
- ✅ Alta qualidade SVG (escalável)
- ✅ Detalhes de profundidade e brilho
- ✅ Otimizado para PWA e mobile

## Ícones de Status na Semana

Os ícones SVG para os dias da semana:
- ✅ **Check verde** - Treino concluído
- ❌ **X vermelho** - Não treinou (dia passado)
- ⏰ **Relógio amarelo** - Ainda vai treinar (futuro/hoje)

Todos os ícones são SVG de alta qualidade e se adaptam ao tamanho necessário.

