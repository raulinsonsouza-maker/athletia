/**
 * Script para testar e validar otimizações de performance
 * Executa verificações básicas nos arquivos gerados
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const distPath = join(process.cwd(), 'dist')
const indexPath = join(distPath, 'index.html')

console.log('🔍 Testando otimizações de performance...\n')

// Verificar se o build foi executado
if (!existsSync(distPath)) {
  console.error('❌ Diretório dist não encontrado. Execute "npm run build" primeiro.')
  process.exit(1)
}

if (!existsSync(indexPath)) {
  console.error('❌ index.html não encontrado no dist. Execute "npm run build" primeiro.')
  process.exit(1)
}

const html = readFileSync(indexPath, 'utf-8')

// Teste 1: CSS não bloqueante
console.log('1️⃣ Verificando CSS não bloqueante...')
const cssLinks = html.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || []
let cssNonBlockingCount = 0
let cssBlockingCount = 0

cssLinks.forEach(link => {
  if (link.includes('media="print"') && link.includes('onload=')) {
    cssNonBlockingCount++
  } else if (!link.includes('media=') || link.includes('media="all"')) {
    cssBlockingCount++
  }
})

if (cssNonBlockingCount > 0 && cssBlockingCount === 0) {
  console.log(`   ✅ ${cssNonBlockingCount} CSS link(s) não bloqueante(s)`)
} else {
  console.log(`   ⚠️  ${cssNonBlockingCount} não bloqueante, ${cssBlockingCount} bloqueante`)
  if (cssBlockingCount > 0) {
    console.log('   ⚠️  Alguns CSS ainda estão bloqueando renderização!')
  }
}

// Teste 2: Preload de chunks não críticos removidos
console.log('\n2️⃣ Verificando remoção de preloads não críticos...')
const nonCriticalChunks = ['admin-pages', 'chart-vendor', 'blog-pages', 'progresso-page']
let foundNonCritical = 0

nonCriticalChunks.forEach(chunk => {
  const regex = new RegExp(`<link[^>]*${chunk}[^>]*rel=["'](modulepreload|preload)["']`, 'gi')
  if (regex.test(html)) {
    foundNonCritical++
    console.log(`   ⚠️  Preload encontrado para chunk não crítico: ${chunk}`)
  }
})

if (foundNonCritical === 0) {
  console.log('   ✅ Nenhum preload de chunk não crítico encontrado')
} else {
  console.log(`   ⚠️  ${foundNonCritical} preload(s) de chunks não críticos ainda presentes`)
}

// Teste 3: Preconnect otimizado
console.log('\n3️⃣ Verificando preconnect e dns-prefetch...')
const hasPreconnect = html.includes('rel="preconnect"')
const hasDnsPrefetch = html.includes('rel="dns-prefetch"')
const hasOwnPreconnect = html.includes('athletia.site') && html.includes('preconnect')

if (hasPreconnect && hasDnsPrefetch && hasOwnPreconnect) {
  console.log('   ✅ Preconnect e dns-prefetch configurados corretamente')
} else {
  console.log('   ⚠️  Preconnect pode estar incompleto')
  if (!hasOwnPreconnect) {
    console.log('   ⚠️  Preconnect para domínio próprio não encontrado')
  }
}

// Teste 4: Imagem LCP otimizada
console.log('\n4️⃣ Verificando otimização da imagem LCP...')
const lcpImagePreload = html.match(/<link[^>]*treinos-screen-400x800\.webp[^>]*>/i)
const hasImagesrcset = html.includes('imagesrcset') && html.includes('400x800')

if (lcpImagePreload && hasImagesrcset) {
  console.log('   ✅ Preload da imagem LCP otimizado (400x800)')
} else {
  console.log('   ⚠️  Preload da imagem LCP pode não estar otimizado')
}

// Teste 5: Code splitting
console.log('\n5️⃣ Verificando code splitting...')
const scriptTags = html.match(/<script[^>]*src=["']([^"']+)["']/gi) || []
const hasReactVendor = scriptTags.some(tag => tag.includes('react-vendor'))
const hasRouterVendor = scriptTags.some(tag => tag.includes('router-vendor'))

if (hasReactVendor) {
  console.log('   ✅ React vendor separado em chunk próprio')
} else {
  console.log('   ⚠️  React vendor pode não estar separado')
}

// Resumo
console.log('\n' + '='.repeat(50))
console.log('📊 Resumo das Otimizações:')
console.log('='.repeat(50))
console.log(`CSS não bloqueante: ${cssNonBlockingCount > 0 ? '✅' : '❌'}`)
console.log(`Preloads não críticos removidos: ${foundNonCritical === 0 ? '✅' : '❌'}`)
console.log(`Preconnect otimizado: ${hasOwnPreconnect ? '✅' : '❌'}`)
console.log(`Imagem LCP otimizada: ${hasImagesrcset ? '✅' : '❌'}`)
console.log(`Code splitting: ${hasReactVendor ? '✅' : '❌'}`)
console.log('='.repeat(50))

if (cssNonBlockingCount > 0 && foundNonCritical === 0 && hasOwnPreconnect && hasImagesrcset) {
  console.log('\n✅ Todas as otimizações principais estão aplicadas!')
  console.log('💡 Execute o build e teste no PageSpeed Insights para validar melhorias.')
  process.exit(0)
} else {
  console.log('\n⚠️  Algumas otimizações podem não estar aplicadas corretamente.')
  console.log('💡 Revise os avisos acima e execute o build novamente.')
  process.exit(1)
}

