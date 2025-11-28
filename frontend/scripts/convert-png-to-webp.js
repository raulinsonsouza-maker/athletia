#!/usr/bin/env node

/**
 * Script para converter imagens PNG para WebP
 * Otimiza imagens do onboarding para melhor performance
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Diretório de imagens
const imagesDir = path.join(__dirname, '../public/images/onboarding');

// Mapeamento de nomes PNG para WebP (manter compatibilidade)
const nameMapping = {
  '18 aos 29.png': '18 aos 29.webp',
  '30 aos 39.png': '30 aos 39.webp',
  '40 aos 49.png': '40 aos 49.webp',
  '50+.png': '50+.webp',
  'Em_forma.png': 'Em_forma.webp',
  'Sobrepeso.png': 'Sobrepeso.webp',
  'Acima do peso.png': 'Acima do peso.webp',
  'Obesidade.png': 'Obesidade.webp',
  'Homem.png': 'Homem.webp',
  'Mulher.png': 'Mulher.webp',
  'Ficar_musculosa.png': 'Ficar_musculosa.webp',
  'Miguel.png': 'Miguel.webp',
  'Julia.png': 'Julia.webp',
  'Rodrigo.png': 'Rodrigo.webp'
};

async function convertImage(pngPath, webpPath) {
  try {
    const stats = await fs.promises.stat(pngPath);
    const originalSize = stats.size;
    
    // Converter para WebP com qualidade 85 (boa qualidade, boa compressão)
    await sharp(pngPath)
      .webp({ quality: 85, effort: 6 })
      .toFile(webpPath);
    
    const newStats = await fs.promises.stat(webpPath);
    const newSize = newStats.size;
    const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
    
    return {
      success: true,
      originalSize,
      newSize,
      reduction: parseFloat(reduction)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function updateFileReferences(oldName, newName) {
  const filesToUpdate = [
    path.join(__dirname, '../src/pages/Landing.tsx'),
    path.join(__dirname, '../src/pages/Cadastro.tsx'),
    path.join(__dirname, '../src/hooks/useOnboardingCalculations.ts')
  ];
  
  const updates = [];
  
  for (const filePath of filesToUpdate) {
    try {
      if (!fs.existsSync(filePath)) {
        continue;
      }
      
      let content = await fs.promises.readFile(filePath, 'utf-8');
      const originalContent = content;
      
      // Substituir referências PNG por WebP
      // Padrões: '/images/onboarding/...png', "images/onboarding/...png", etc.
      const patterns = [
        new RegExp(`(['"\`])/images/onboarding/${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"\`])`, 'g'),
        new RegExp(`(['"\`])images/onboarding/${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"\`])`, 'g')
      ];
      
      let changed = false;
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          content = content.replace(pattern, (match, quote1, quote2) => {
            changed = true;
            return `${quote1}/images/onboarding/${newName}${quote2}`;
          });
        }
      }
      
      if (changed) {
        await fs.promises.writeFile(filePath, content, 'utf-8');
        updates.push(filePath);
      }
    } catch (error) {
      log(`  ⚠️  Erro ao atualizar ${filePath}: ${error.message}`, 'yellow');
    }
  }
  
  return updates;
}

async function main() {
  log('\n🖼️  Convertendo imagens PNG para WebP...\n', 'cyan');
  
  if (!fs.existsSync(imagesDir)) {
    log(`❌ Diretório não encontrado: ${imagesDir}`, 'red');
    process.exit(1);
  }
  
  const files = await fs.promises.readdir(imagesDir);
  const pngFiles = files.filter(file => file.toLowerCase().endsWith('.png'));
  
  if (pngFiles.length === 0) {
    log('✅ Nenhuma imagem PNG encontrada para converter.', 'green');
    return;
  }
  
  log(`📋 Encontradas ${pngFiles.length} imagens PNG para converter\n`, 'blue');
  
  let converted = 0;
  let skipped = 0;
  let errors = 0;
  let totalOriginalSize = 0;
  let totalNewSize = 0;
  const fileUpdates = [];
  
  for (const pngFile of pngFiles) {
    const pngPath = path.join(imagesDir, pngFile);
    
    // Determinar nome do arquivo WebP
    const webpName = nameMapping[pngFile] || pngFile.replace(/\.png$/i, '.webp');
    const webpPath = path.join(imagesDir, webpName);
    
    // Verificar se WebP já existe
    if (fs.existsSync(webpPath)) {
      log(`⏭️  ${pngFile} → ${webpName} (já existe)`, 'yellow');
      skipped++;
      continue;
    }
    
    log(`🔄 Convertendo: ${pngFile} → ${webpName}...`, 'cyan');
    
    const result = await convertImage(pngPath, webpPath);
    
    if (result.success) {
      converted++;
      totalOriginalSize += result.originalSize;
      totalNewSize += result.newSize;
      
      const sizeMB = (result.originalSize / 1024 / 1024).toFixed(2);
      const newSizeMB = (result.newSize / 1024 / 1024).toFixed(2);
      
      log(`  ✅ Convertido! ${sizeMB}MB → ${newSizeMB}MB (${result.reduction > 0 ? '-' : '+'}${Math.abs(result.reduction)}%)`, 'green');
      
      // Atualizar referências nos arquivos
      const oldName = pngFile;
      const newName = webpName;
      const updatedFiles = await updateFileReferences(oldName, newName);
      
      if (updatedFiles.length > 0) {
        log(`  📝 Referências atualizadas em ${updatedFiles.length} arquivo(s)`, 'blue');
        fileUpdates.push(...updatedFiles);
      }
    } else {
      errors++;
      log(`  ❌ Erro: ${result.error}`, 'red');
    }
  }
  
  // Resumo
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 RESUMO DA CONVERSÃO', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`✅ Convertidas: ${converted}`, 'green');
  log(`⏭️  Ignoradas (já existem): ${skipped}`, 'yellow');
  log(`❌ Erros: ${errors}`, errors > 0 ? 'red' : 'green');
  
  if (converted > 0) {
    const totalOriginalMB = (totalOriginalSize / 1024 / 1024).toFixed(2);
    const totalNewMB = (totalNewSize / 1024 / 1024).toFixed(2);
    const totalReduction = ((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(1);
    const savedMB = ((totalOriginalSize - totalNewSize) / 1024 / 1024).toFixed(2);
    
    log(`\n💾 Tamanho total:`, 'blue');
    log(`   Original: ${totalOriginalMB}MB`, 'reset');
    log(`   WebP: ${totalNewMB}MB`, 'reset');
    log(`   Economia: ${savedMB}MB (${totalReduction}%)`, 'green');
  }
  
  if (fileUpdates.length > 0) {
    log(`\n📝 Arquivos atualizados: ${fileUpdates.length}`, 'blue');
    fileUpdates.forEach(file => {
      log(`   - ${path.relative(process.cwd(), file)}`, 'reset');
    });
  }
  
  log('\n✅ Conversão concluída!\n', 'green');
}

// Executar
main().catch(error => {
  log(`\n❌ Erro fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

