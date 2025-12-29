/**
 * Script para otimizar a imagem Hero_nova.png
 * Converte para WebP e AVIF em múltiplas resoluções
 * 
 * Requisitos:
 * - sharp: npm install --save-dev sharp
 * 
 * Uso: node scripts/otimizar-hero-image.js
 */

import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const inputPath = join(__dirname, '../public/images/app-preview/Editadas/Hero_nova.png')
const outputDir = join(__dirname, '../public/images/app-preview/Editadas')

// Resoluções para gerar
const resolutions = [
  { width: 400, height: 800, suffix: '400x800' },
  { width: 665, height: 1310, suffix: '665x1310' },
  { width: 800, height: 1600, suffix: '800x1600' }
]

async function optimizeImage() {
  try {
    // Verificar se a imagem original existe
    if (!existsSync(inputPath)) {
      console.error(`❌ Imagem não encontrada: ${inputPath}`)
      console.log('Por favor, certifique-se de que Hero_nova.png existe no diretório correto.')
      process.exit(1)
    }

    console.log('🖼️  Otimizando imagem Hero_nova.png...\n')

    // Ler a imagem original
    const image = sharp(inputPath)
    const metadata = await image.metadata()
    console.log(`📐 Dimensões originais: ${metadata.width}x${metadata.height}`)
    console.log(`📦 Tamanho original: ${(metadata.size / 1024).toFixed(2)} KB\n`)

    // Gerar versões WebP
    console.log('🔄 Gerando versões WebP...')
    for (const res of resolutions) {
      const webpPath = join(outputDir, `Hero_nova-${res.suffix}.webp`)
      await image
        .clone()
        .resize(res.width, res.height, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp({ quality: 85, effort: 6 })
        .toFile(webpPath)
      
      const webpStats = await sharp(webpPath).metadata()
      console.log(`  ✓ ${res.suffix}.webp - ${(webpStats.size / 1024).toFixed(2)} KB`)
    }

    // Gerar versões AVIF
    console.log('\n🔄 Gerando versões AVIF...')
    for (const res of resolutions) {
      const avifPath = join(outputDir, `Hero_nova-${res.suffix}.avif`)
      await image
        .clone()
        .resize(res.width, res.height, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .avif({ quality: 80, effort: 4 })
        .toFile(avifPath)
      
      const avifStats = await sharp(avifPath).metadata()
      console.log(`  ✓ ${res.suffix}.avif - ${(avifStats.size / 1024).toFixed(2)} KB`)
    }

    console.log('\n✅ Otimização concluída!')
    console.log('\n📝 Arquivos gerados:')
    resolutions.forEach(res => {
      console.log(`  - Hero_nova-${res.suffix}.webp`)
      console.log(`  - Hero_nova-${res.suffix}.avif`)
    })
    console.log('\n💡 As imagens otimizadas estão prontas para uso!')

  } catch (error) {
    console.error('❌ Erro ao otimizar imagem:', error.message)
    if (error.message.includes('sharp')) {
      console.log('\n💡 Instale o sharp: npm install --save-dev sharp')
    }
    process.exit(1)
  }
}

optimizeImage()

