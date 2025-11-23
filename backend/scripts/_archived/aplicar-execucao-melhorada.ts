import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * Script para aplicar execuções técnicas melhoradas no banco de dados
 */
async function aplicarExecucaoMelhorada() {
  console.log('🔄 Iniciando aplicação de execuções técnicas melhoradas...\n');

  try {
    // Verificar arquivos de melhorias
    const simplificadasPath = path.join(__dirname, 'execucoes-simplificadas.json');
    const corrigidasPath = path.join(__dirname, 'execucoes-corrigidas.json');
    
    const temSimplificadas = fs.existsSync(simplificadasPath);
    const temCorrigidas = fs.existsSync(corrigidasPath);
    
    if (!temSimplificadas && !temCorrigidas) {
      console.error('❌ Nenhum arquivo de melhorias encontrado!');
      console.error('   Execute primeiro:');
      console.error('   - npm run simplificar-execucao-tecnica');
      console.error('   - npm run corrigir-execucao-tecnica');
      process.exit(1);
    }

    // Carregar melhorias
    let simplificadas: any[] = [];
    let corrigidas: any[] = [];
    
    if (temSimplificadas) {
      simplificadas = JSON.parse(fs.readFileSync(simplificadasPath, 'utf-8'));
      console.log(`📝 Execuções simplificadas encontradas: ${simplificadas.length}`);
    }
    
    if (temCorrigidas) {
      corrigidas = JSON.parse(fs.readFileSync(corrigidasPath, 'utf-8'));
      console.log(`🔧 Execuções corrigidas encontradas: ${corrigidas.length}`);
    }
    
    // Combinar melhorias (corrigidas têm prioridade)
    const melhoriasMap = new Map<string, any>();
    
    simplificadas.forEach((item: any) => {
      melhoriasMap.set(item.id, {
        id: item.id,
        nome: item.nome,
        antes: item.antes,
        depois: item.depois,
        tipo: 'simplificada'
      });
    });
    
    corrigidas.forEach((item: any) => {
      melhoriasMap.set(item.id, {
        id: item.id,
        nome: item.nome,
        antes: item.antes,
        depois: item.depois,
        tipo: 'corrigida',
        motivo: item.motivo
      });
    });
    
    const melhorias = Array.from(melhoriasMap.values());
    
    console.log(`\n📊 Total de melhorias únicas: ${melhorias.length}\n`);

    // Modo preview (padrão)
    const modoPreview = process.argv.includes('--preview') || !process.argv.includes('--apply');
    
    if (modoPreview) {
      console.log('👀 MODO PREVIEW - Nenhuma alteração será feita no banco\n');
      console.log('📋 PREVIEW DAS MELHORIAS:\n');
      
      melhorias.slice(0, 30).forEach((melhoria: any, index: number) => {
        console.log(`${index + 1}. "${melhoria.nome}" (${melhoria.tipo})`);
        if (melhoria.motivo) {
          console.log(`   Motivo: ${melhoria.motivo}`);
        }
        console.log(`   ANTES: ${melhoria.antes.substring(0, 120)}${melhoria.antes.length > 120 ? '...' : ''}`);
        console.log(`   DEPOIS: ${melhoria.depois}`);
        console.log('');
      });

      if (melhorias.length > 30) {
        console.log(`   ... e mais ${melhorias.length - 30} execuções serão atualizadas\n`);
      }

      console.log('\n💡 Para aplicar as mudanças, execute:');
      console.log('   npm run aplicar-execucao-melhorada -- --apply');
      console.log('');

    } else {
      // Modo aplicação
      console.log('⚠️  MODO APLICAÇÃO - As alterações serão salvas no banco de dados!\n');
      
      let atualizados = 0;
      let erros = 0;
      const errosDetalhes: Array<{ nome: string; erro: string }> = [];

      // Aplicar cada melhoria
      for (const melhoria of melhorias) {
        try {
          await prisma.exercicio.update({
            where: { id: melhoria.id },
            data: { execucaoTecnica: melhoria.depois }
          });
          atualizados++;
          
          if (atualizados % 10 === 0) {
            console.log(`   ✅ ${atualizados}/${melhorias.length} execuções atualizadas...`);
          }
        } catch (error: any) {
          erros++;
          errosDetalhes.push({
            nome: melhoria.nome,
            erro: error.message
          });
          console.error(`   ❌ Erro ao atualizar "${melhoria.nome}": ${error.message}`);
        }
      }

      console.log('\n' + '='.repeat(60));
      console.log('📊 RELATÓRIO DE APLICAÇÃO');
      console.log('='.repeat(60));
      console.log(`Total de melhorias: ${melhorias.length}`);
      console.log(`✅ Atualizados com sucesso: ${atualizados}`);
      console.log(`❌ Erros: ${erros}`);
      console.log('='.repeat(60) + '\n');

      if (erros > 0) {
        console.log('⚠️  ERROS ENCONTRADOS:\n');
        errosDetalhes.forEach((item, index) => {
          console.log(`${index + 1}. "${item.nome}": ${item.erro}`);
        });
        console.log('');
      }

      // Estatísticas finais
      const simplificadasCount = melhorias.filter(m => m.tipo === 'simplificada').length;
      const corrigidasCount = melhorias.filter(m => m.tipo === 'corrigida').length;
      
      const tamanhoMedioAntes = melhorias.reduce((acc, m) => acc + m.antes.length, 0) / melhorias.length;
      const tamanhoMedioDepois = melhorias.reduce((acc, m) => acc + m.depois.length, 0) / melhorias.length;

      console.log('📈 ESTATÍSTICAS FINAIS:');
      console.log(`   Simplificadas: ${simplificadasCount}`);
      console.log(`   Corrigidas: ${corrigidasCount}`);
      console.log(`   Tamanho médio ANTES: ${tamanhoMedioAntes.toFixed(0)} caracteres`);
      console.log(`   Tamanho médio DEPOIS: ${tamanhoMedioDepois.toFixed(0)} caracteres`);
      console.log(`   Redução média: ${(tamanhoMedioAntes - tamanhoMedioDepois).toFixed(0)} caracteres`);
      console.log('');

      // Backup dos arquivos originais
      if (temSimplificadas) {
        const backupPath = path.join(__dirname, `execucoes-simplificadas-backup-${Date.now()}.json`);
        fs.copyFileSync(simplificadasPath, backupPath);
        console.log(`💾 Backup simplificadas salvo em: ${backupPath}`);
      }
      
      if (temCorrigidas) {
        const backupPath = path.join(__dirname, `execucoes-corrigidas-backup-${Date.now()}.json`);
        fs.copyFileSync(corrigidasPath, backupPath);
        console.log(`💾 Backup corrigidas salvo em: ${backupPath}`);
      }
      
      console.log('');

      console.log('✅ Aplicação concluída com sucesso!');
      console.log('');
    }

  } catch (error: any) {
    console.error('❌ Erro ao aplicar execução melhorada:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar aplicação
aplicarExecucaoMelhorada()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

