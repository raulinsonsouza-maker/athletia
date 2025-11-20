import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * Script para aplicar descrições descritivas melhoradas no banco de dados
 */
async function aplicarDescricoesDescritivas() {
  console.log('🔄 Iniciando aplicação de descrições descritivas melhoradas...\n');

  try {
    // Verificar se arquivo existe
    const arquivoPath = path.join(__dirname, 'descricoes-descritivas-melhoradas.json');
    
    if (!fs.existsSync(arquivoPath)) {
      console.error('❌ Arquivo descricoes-descritivas-melhoradas.json não encontrado!');
      console.error('   Execute primeiro: npm run melhorar-descricoes-descritivas');
      process.exit(1);
    }

    // Ler melhorias
    const melhorias = JSON.parse(fs.readFileSync(arquivoPath, 'utf-8'));
    
    console.log(`📊 Total de melhorias encontradas: ${melhorias.length}\n`);

    // Modo preview (padrão)
    const modoPreview = process.argv.includes('--preview') || !process.argv.includes('--apply');
    
    if (modoPreview) {
      console.log('👀 MODO PREVIEW - Nenhuma alteração será feita no banco\n');
      console.log('📋 PREVIEW DAS MELHORIAS:\n');
      
      melhorias.slice(0, 30).forEach((melhoria: any, index: number) => {
        console.log(`${index + 1}. "${melhoria.nome}"`);
        console.log(`   ANTES: ${melhoria.antes.substring(0, 120)}${melhoria.antes.length > 120 ? '...' : ''}`);
        console.log(`   DEPOIS: ${melhoria.depois}`);
        console.log(`   Mudança: ${melhoria.tamanhoDepois - melhoria.tamanhoAntes > 0 ? '+' : ''}${melhoria.tamanhoDepois - melhoria.tamanhoAntes} caracteres`);
        console.log('');
      });

      if (melhorias.length > 30) {
        console.log(`   ... e mais ${melhorias.length - 30} descrições serão atualizadas\n`);
      }

      console.log('\n💡 Para aplicar as mudanças, execute:');
      console.log('   npm run aplicar-descricoes-descritivas -- --apply');
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
            data: { descricao: melhoria.depois }
          });
          atualizados++;
          
          if (atualizados % 10 === 0) {
            console.log(`   ✅ ${atualizados}/${melhorias.length} descrições atualizadas...`);
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
      const tamanhoMedioAntes = melhorias.reduce((acc, m) => acc + m.tamanhoAntes, 0) / melhorias.length;
      const tamanhoMedioDepois = melhorias.reduce((acc, m) => acc + m.tamanhoDepois, 0) / melhorias.length;
      const mudancaTotal = melhorias.reduce((acc, m) => acc + (m.tamanhoDepois - m.tamanhoAntes), 0);

      console.log('📈 ESTATÍSTICAS FINAIS:');
      console.log(`   Tamanho médio ANTES: ${tamanhoMedioAntes.toFixed(0)} caracteres`);
      console.log(`   Tamanho médio DEPOIS: ${tamanhoMedioDepois.toFixed(0)} caracteres`);
      console.log(`   Mudança total: ${mudancaTotal > 0 ? '+' : ''}${mudancaTotal} caracteres`);
      console.log(`   Mudança média: ${((tamanhoMedioDepois - tamanhoMedioAntes)).toFixed(0)} caracteres por descrição`);
      console.log('');

      // Backup do arquivo original
      const backupPath = path.join(__dirname, `descricoes-descritivas-backup-${Date.now()}.json`);
      fs.copyFileSync(arquivoPath, backupPath);
      console.log(`💾 Backup salvo em: ${backupPath}`);
      console.log('');

      console.log('✅ Aplicação concluída com sucesso!');
      console.log('');
    }

  } catch (error: any) {
    console.error('❌ Erro ao aplicar descrições descritivas:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar aplicação
aplicarDescricoesDescritivas()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

