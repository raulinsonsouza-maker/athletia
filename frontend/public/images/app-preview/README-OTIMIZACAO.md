# Otimização da Imagem Hero (LCP)

## Problema Identificado

A imagem `/images/app-preview/treinos-screen.png` está causando problemas de performance:
- **Tamanho atual**: 1.088,5 KiB (muito grande)
- **Dimensões**: 908x1920px (maior que o necessário)
- **Formato**: PNG (não otimizado)

## Solução Recomendada

### 1. Converter para WebP
A imagem deve ser convertida para WebP, que oferece melhor compressão:
- **Economia estimada**: ~80-90% do tamanho
- **Qualidade**: Mantém qualidade visual similar

### 2. Redimensionar
A imagem deve ser redimensionada para as dimensões reais de exibição:
- **Dimensões atuais**: 908x1920px
- **Dimensões exibidas**: ~790x1404px (mobile)
- **Recomendado**: Criar versões responsivas:
  - Mobile: 400x800px (ou 800x1600px para retina)
  - Desktop: 600x1200px (ou 1200x2400px para retina)

### 3. Implementação

#### Opção A: WebP com fallback (Recomendado)
```html
<picture>
  <source srcset="/images/app-preview/treinos-screen.webp" type="image/webp">
  <img 
    src="/images/app-preview/treinos-screen.png" 
    alt="Interface do aplicativo AthletIA"
    fetchpriority="high"
    loading="eager"
    width="400"
    height="800"
  />
</picture>
```

#### Opção B: Múltiplas versões responsivas
```html
<img 
  srcset="/images/app-preview/treinos-screen-400w.webp 400w,
          /images/app-preview/treinos-screen-800w.webp 800w"
  src="/images/app-preview/treinos-screen-400w.webp"
  alt="Interface do aplicativo AthletIA"
  fetchpriority="high"
  loading="eager"
  width="400"
  height="800"
/>
```

### 4. Ferramentas para Conversão

#### Online:
- https://squoosh.app/ (Recomendado - Google)
- https://cloudconvert.com/png-to-webp

#### CLI:
```bash
# Com imagemagick
convert treinos-screen.png -quality 85 treinos-screen.webp

# Com cwebp (Google)
cwebp -q 85 treinos-screen.png -o treinos-screen.webp
```

### 5. Resultado Esperado

Após otimização:
- **Tamanho**: ~100-200 KiB (redução de 80-90%)
- **LCP**: Redução de ~8-10 segundos
- **Performance Score**: Melhoria de 20-30 pontos

## Status Atual

✅ Código otimizado com `fetchpriority="high"` e `loading="eager"`
⏳ Aguardando conversão da imagem para WebP e redimensionamento

