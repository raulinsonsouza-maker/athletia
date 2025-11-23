/**
 * Script para reorganizar GIFs da estrutura antiga para nova estrutura
 * e atualizar apontamentos no banco de dados
 * 
 * Estrutura antiga: upload/exercicios/{nome-exercicio}/exercicio.gif
 * Estrutura nova: upload/exercicios/{exercicioId-uuid}/exercicio.gif
 * 
 * Uso: npx ts-node backend/scripts/reorganizar-gifs-e-apontamentos.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * Normaliza nome do exercício para corresponder ao nome da pasta
 */
function normalizarNomeExercicio(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD') // Remove acentos
    .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/[^a-z0-9-]/g, '') // Remove caracteres especiais
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, ''); // Remove hífens no início/fim
}

/**
 * Mapeia variações comuns de nomes de exercícios
 */
function mapearVariacoes(nomeNormalizado: string): string[] {
  const variacoes: string[] = [nomeNormalizado];
  
  // Mapear variações comuns
  const mapeamentos: Record<string, string[]> = {
    'supino-reto': ['supino', 'supino-reto-halteres', 'supino-reto-barra'],
    'supino-inclinado': ['supino-inclinado-halteres', 'supino-inclinado-barra'],
    'supino-declinado': ['supino-declinado-halteres', 'supino-declinado-barra'],
    'agachamento': ['agachamento-livre', 'agachamento-com-barra'],
    'remada-curvada': ['remada', 'remada-com-halteres'],
    'puxada-frente': ['puxada', 'puxada-aberta'],
    'desenvolvimento': ['desenvolvimento-com-halteres', 'desenvolvimento-com-barra'],
    'elevacao-lateral': ['elevacao-lateral-com-halteres'],
    'elevacao-frontal': ['elevacao-frontal-com-halteres'],
    'rosca-direta': ['rosca', 'rosca-com-halteres'],
    'triceps-corda': ['triceps', 'triceps-na-polia'],
    'abdominal': ['abdominal-supra', 'abdominal-retro'],
    'panturrilha-em-pe': ['panturrilha', 'panturrilha-em-pe-com-barra'],
  };
  
  // Adicionar variações se existirem
  if (mapeamentos[nomeNormalizado]) {
    variacoes.push(...mapeamentos[nomeNormalizado]);
  }
  
  return variacoes;
}

/**
 * Busca arquivo GIF na estrutura antiga
 */
function buscarArquivoNaEstruturaAntiga(
  uploadDir: string,
  nomeNormalizado: string
): string | null {
  // Tentar nome exato primeiro
  const caminhoExato = path.join(uploadDir, nomeNormalizado, 'exercicio.gif');
  if (fs.existsSync(caminhoExato)) {
    return caminhoExato;
  }
  
  // Tentar variações
  const variacoes = mapearVariacoes(nomeNormalizado);
  for (const variacao of variacoes) {
    const caminhoVariacao = path.join(uploadDir, variacao, 'exercicio.gif');
    if (fs.existsSync(caminhoVariacao)) {
      return caminhoVariacao;
    }
  }
  
  // Buscar em todas as pastas (fallback)
  try {
    const pastas = fs.readdirSync(uploadDir, { withFileTypes: true });
    for (const pasta of pastas) {
      if (pasta.isDirectory()) {
        const nomePasta = pasta.name.toLowerCase();
        // Verificar se nome da pasta contém palavras-chave do exercício
        const palavrasChave = nomeNormalizado.split('-');
        const todasPalavrasPresentes = palavrasChave.every(palavra => 
          nomePasta.includes(palavra)
        );
        
        if (todasPalavrasPresentes || nomePasta.includes(nomeNormalizado)) {
          const caminhoCandidato = path.join(uploadDir, pasta.name, 'exercicio.gif');
          if (fs.existsSync(caminhoCandidato)) {
            return caminhoCandidato;
          }
        }
      }
    }
  } catch (error) {
    console.error(`Erro ao buscar na pasta ${uploadDir}:`, error);
  }
  
  return null;
}

/**
 * Reorganiza GIFs e atualiza apontamentos
 */
async function reorganizarGifsEApontamentos() {
  console.log('🔄 Iniciando reorganização de GIFs e atualização de apontamentos...\n');
  
  // Determinar diretório de upload
  const uploadDir = path.join(process.cwd(), 'upload', 'exercicios');
  
  if (!fs.existsSync(uploadDir)) {
    console.error(`❌ Diretório de upload não encontrado: ${uploadDir}`);
    console.log('💡 Certifique-se de executar o script do diretório correto');
    process.exit(1);
  }
  
  console.log(`📁 Diretório de upload: ${uploadDir}\n`);
  
  // Buscar todos os exercícios do banco
  console.log('📋 Buscando exercícios do banco de dados...');
  const exercicios = await prisma.exercicio.findMany({
    select: {
      id: true,
      nome: true,
      gifUrl: true
    },
    orderBy: {
      nome: 'asc'
    }
  });
  
  console.log(`✅ ${exercicios.length} exercícios encontrados\n`);
  
  const resultados = {
    total: exercicios.length,
    arquivosEncontrados: 0,
    arquivosCopiados: 0,
    apontamentosAtualizados: 0,
    erros: 0,
    detalhes: [] as Array<{
      exercicioId: string;
      nome: string;
      status: 'sucesso' | 'erro' | 'nao-encontrado';
      mensagem: string;
    }>
  };
  
  // Processar cada exercício
  for (const exercicio of exercicios) {
    const nomeNormalizado = normalizarNomeExercicio(exercicio.nome);
    
    try {
      // Buscar arquivo na estrutura antiga
      const arquivoAntigo = buscarArquivoNaEstruturaAntiga(uploadDir, nomeNormalizado);
      
      if (!arquivoAntigo) {
        resultados.detalhes.push({
          exercicioId: exercicio.id,
          nome: exercicio.nome,
          status: 'nao-encontrado',
          mensagem: `Arquivo não encontrado na estrutura antiga (procurou: ${nomeNormalizado})`
        });
        continue;
      }
      
      resultados.arquivosEncontrados++;
      
      // Criar diretório na estrutura nova
      const novoDiretorio = path.join(uploadDir, exercicio.id);
      if (!fs.existsSync(novoDiretorio)) {
        fs.mkdirSync(novoDiretorio, { recursive: true });
      }
      
      // Caminho do arquivo na estrutura nova
      const novoArquivo = path.join(novoDiretorio, 'exercicio.gif');
      
      // Copiar arquivo (não mover, para manter backup)
      if (!fs.existsSync(novoArquivo)) {
        fs.copyFileSync(arquivoAntigo, novoArquivo);
        resultados.arquivosCopiados++;
        console.log(`✅ ${exercicio.nome}: Copiado de ${path.basename(path.dirname(arquivoAntigo))} para ${exercicio.id}`);
      } else {
        console.log(`⏭️  ${exercicio.nome}: Arquivo já existe na estrutura nova`);
      }
      
      // Atualizar apontamento no banco
      const novaUrl = `/api/uploads/exercicios/${exercicio.id}/exercicio.gif`;
      
      if (exercicio.gifUrl !== novaUrl) {
        await prisma.exercicio.update({
          where: { id: exercicio.id },
          data: { gifUrl: novaUrl }
        });
        
        resultados.apontamentosAtualizados++;
        console.log(`   📝 Apontamento atualizado no banco`);
      } else {
        console.log(`   ✓ Apontamento já estava correto`);
      }
      
      resultados.detalhes.push({
        exercicioId: exercicio.id,
        nome: exercicio.nome,
        status: 'sucesso',
        mensagem: 'Arquivo copiado e apontamento atualizado'
      });
      
    } catch (error: any) {
      resultados.erros++;
      resultados.detalhes.push({
        exercicioId: exercicio.id,
        nome: exercicio.nome,
        status: 'erro',
        mensagem: error.message || 'Erro desconhecido'
      });
      console.error(`❌ ${exercicio.nome}: ${error.message}`);
    }
  }
  
  // Relatório final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL');
  console.log('='.repeat(60));
  console.log(`Total de exercícios: ${resultados.total}`);
  console.log(`Arquivos encontrados na estrutura antiga: ${resultados.arquivosEncontrados}`);
  console.log(`Arquivos copiados para estrutura nova: ${resultados.arquivosCopiados}`);
  console.log(`Apontamentos atualizados no banco: ${resultados.apontamentosAtualizados}`);
  console.log(`Erros: ${resultados.erros}`);
  console.log(`Não encontrados: ${resultados.total - resultados.arquivosEncontrados - resultados.erros}`);
  console.log('='.repeat(60));
  
  // Listar exercícios não encontrados
  const naoEncontrados = resultados.detalhes.filter(d => d.status === 'nao-encontrado');
  if (naoEncontrados.length > 0) {
    console.log('\n⚠️  Exercícios sem GIF correspondente:');
    naoEncontrados.forEach(d => {
      console.log(`   - ${d.nome} (${d.exercicioId})`);
    });
  }
  
  // Listar erros
  const erros = resultados.detalhes.filter(d => d.status === 'erro');
  if (erros.length > 0) {
    console.log('\n❌ Erros encontrados:');
    erros.forEach(d => {
      console.log(`   - ${d.nome}: ${d.mensagem}`);
    });
  }
  
  console.log('\n✅ Processo concluído!');
}

// Executar script
reorganizarGifsEApontamentos()
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

