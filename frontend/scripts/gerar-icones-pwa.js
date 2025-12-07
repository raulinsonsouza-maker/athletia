#!/usr/bin/env node

/**
 * Script para gerar ícones PWA a partir do favicon.svg
 * Gera ícones em diferentes tamanhos para PWA de alta qualidade
 * 
 * Requer: sharp (npm install sharp --save-dev)
 */

const fs = require('fs');
const path = require('path');

// Verificar se sharp está instalado
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Erro: sharp não está instalado.');
  console.log('📦 Instale com: npm install sharp --save-dev');
  process.exit(1);
}

const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'favicon.svg');

if (!fs.existsSync(svgPath)) {
  console.error('❌ favicon.svg não encontrado!');
  process.exit(1);
}

const sizes = [
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' }
];

async function gerarIcones() {
  console.log('🎨 Gerando ícones PWA de alta qualidade...\n');

  for (const { size, name } of sizes) {
    try {
      const outputPath = path.join(publicDir, name);
      
      await sharp(svgPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 249, g: 166, b: 32, alpha: 1 } // #F9A620
        })
        .png({ quality: 100, compressionLevel: 9 })
        .toFile(outputPath);

      console.log(`✅ ${name} (${size}x${size}) gerado com sucesso`);
    } catch (error) {
      console.error(`❌ Erro ao gerar ${name}:`, error.message);
    }
  }

  console.log('\n✨ Todos os ícones foram gerados!');
  console.log('📱 Os ícones estão prontos para PWA de alta qualidade');
}

gerarIcones().catch(console.error);

