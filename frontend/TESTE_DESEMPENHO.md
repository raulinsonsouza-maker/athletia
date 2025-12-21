# 🚀 Guia de Teste de Desempenho

Este guia explica como testar e validar as otimizações de performance implementadas.

## 📋 Pré-requisitos

1. Node.js 18+ instalado
2. Dependências instaladas: `npm install`
3. Build de produção executado: `npm run build`

## 🧪 Testes Automatizados

### 1. Teste de Validação Local

Execute o script de teste que verifica se as otimizações foram aplicadas corretamente:

```bash
cd frontend
npm run build
npm run test:performance
```

O script verifica:
- ✅ CSS não bloqueante (media="print" + onload)
- ✅ Preloads de chunks não críticos removidos
- ✅ Preconnect e dns-prefetch configurados
- ✅ Imagem LCP otimizada (400x800)
- ✅ Code splitting funcionando

### 2. Teste Manual no Navegador

#### Chrome DevTools

1. **Abrir DevTools** (F12)
2. **Network Tab**:
   - Marcar "Disable cache"
   - Throttling: "Slow 3G" ou "Fast 3G"
   - Recarregar a página
   - Verificar ordem de carregamento dos recursos

3. **Lighthouse Tab**:
   - Clicar em "Generate report"
   - Selecionar "Performance"
   - Verificar métricas:
     - **FCP** (First Contentful Paint): deve ser < 2.5s
     - **LCP** (Largest Contentful Paint): deve ser < 2.5s
     - **TBT** (Total Blocking Time): deve ser < 200ms
     - **CLS** (Cumulative Layout Shift): deve ser < 0.1

#### Verificações Específicas

**CSS Não Bloqueante:**
```javascript
// No Console do DevTools
document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
  console.log('CSS:', link.href, 'Media:', link.media, 'Onload:', link.onload ? 'Sim' : 'Não');
});
// Todos devem ter media="all" após carregar (inicialmente media="print")
```

**Chunks Não Carregados:**
```javascript
// Verificar se chunks não críticos não foram carregados
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('admin-pages') || r.name.includes('chart-vendor'))
  .forEach(r => console.log('⚠️ Chunk não crítico carregado:', r.name));
// Não deve retornar nada na landing page
```

## 🌐 Teste com PageSpeed Insights

### Teste Online

1. Acesse: https://pagespeed.web.dev/
2. Digite a URL: `https://athletia.site/`
3. Selecione "Mobile" ou "Desktop"
4. Clique em "Analyze"

### Métricas Esperadas

Após as otimizações, você deve ver:

| Métrica | Antes | Esperado | Melhoria |
|---------|-------|----------|----------|
| **Desempenho** | 60 | 85-90+ | +40-50% |
| **FCP** | 5.7s | <2.5s | -56% |
| **LCP** | 9.7s | <2.5s | -74% |
| **TBT** | 0ms | <200ms | Mantido |
| **CLS** | 0 | <0.1 | Mantido |

### Problemas Comuns e Soluções

#### CSS ainda bloqueando
- **Causa**: Plugin não está sendo executado
- **Solução**: Verificar se `vite-plugin-css-non-blocking.ts` está no `vite.config.ts`
- **Teste**: Verificar HTML gerado em `dist/index.html`

#### Chunks não críticos ainda carregando
- **Causa**: Preload não foi removido ou há import direto
- **Solução**: 
  - Verificar se `vite-plugin-remove-preloads.ts` está ativo
  - Verificar se não há imports diretos de Admin/Chart na Landing
- **Teste**: Verificar Network tab - não deve ver `admin-pages.js` ou `chart-vendor.js`

#### Imagem LCP não otimizada
- **Causa**: Versão errada sendo carregada
- **Solução**: Verificar se `treinos-screen-400x800.webp` existe e está sendo usado
- **Teste**: Verificar Network tab - imagem deve ser ~36 KiB, não 65.9 KiB

## 📊 Análise de Resultados

### Performance Score

- **90-100**: Excelente ✅
- **75-89**: Bom ⚠️
- **50-74**: Precisa melhorar ❌
- **0-49**: Ruim ❌

### Core Web Vitals

#### FCP (First Contentful Paint)
- **Bom**: < 1.8s (mobile), < 1.0s (desktop)
- **Precisa melhorar**: 1.8s - 3.0s (mobile), 1.0s - 1.8s (desktop)
- **Ruim**: > 3.0s (mobile), > 1.8s (desktop)

#### LCP (Largest Contentful Paint)
- **Bom**: < 2.5s
- **Precisa melhorar**: 2.5s - 4.0s
- **Ruim**: > 4.0s

#### TBT (Total Blocking Time)
- **Bom**: < 200ms
- **Precisa melhorar**: 200ms - 600ms
- **Ruim**: > 600ms

#### CLS (Cumulative Layout Shift)
- **Bom**: < 0.1
- **Precisa melhorar**: 0.1 - 0.25
- **Ruim**: > 0.25

## 🔧 Troubleshooting

### Build falhando

```bash
# Limpar cache e rebuild
rm -rf node_modules/.vite
rm -rf dist
npm run build
```

### Plugins não funcionando

1. Verificar se os arquivos existem:
   - `vite-plugin-css-non-blocking.ts`
   - `vite-plugin-remove-preloads.ts`

2. Verificar imports no `vite.config.ts`

3. Verificar se não há erros de TypeScript:
   ```bash
   npm run lint
   ```

### Performance não melhorou

1. **Verificar cache**: Limpar cache do navegador e do servidor
2. **Verificar build**: Garantir que está usando build de produção
3. **Verificar plugins**: Executar `npm run test:performance`
4. **Verificar recursos**: Usar Network tab para ver o que está sendo carregado

## 📝 Checklist de Validação

Antes de considerar as otimizações completas:

- [ ] Build de produção executado sem erros
- [ ] Script `test:performance` passa todos os testes
- [ ] CSS não bloqueante verificado no HTML gerado
- [ ] Chunks não críticos não aparecem no Network tab
- [ ] Imagem LCP carrega versão 400x800 (menor)
- [ ] PageSpeed Insights mostra melhoria nas métricas
- [ ] FCP < 2.5s
- [ ] LCP < 2.5s
- [ ] Performance score > 85

## 🎯 Próximos Passos

Após validar as otimizações:

1. Fazer deploy para produção
2. Testar novamente no PageSpeed Insights em produção
3. Monitorar métricas reais dos usuários (Google Analytics, etc.)
4. Ajustar conforme necessário

## 📚 Recursos Adicionais

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Web.dev Performance](https://web.dev/performance/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Vite Build Optimization](https://vitejs.dev/guide/build.html)

