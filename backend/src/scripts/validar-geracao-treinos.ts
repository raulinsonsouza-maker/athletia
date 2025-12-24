/**
 * SCRIPT DE VALIDAÇÃO DE GERAÇÃO DE TREINOS
 * 
 * Script para testar e validar a geração de treinos com diferentes frequências
 * e verificar se os dados do onboarding estão sendo respeitados
 * 
 * Uso: npx ts-node backend/src/scripts/validar-geracao-treinos.ts [userId]
 */

import { prisma } from '../lib/prisma';
import { regenerarTreinos30Dias, PerfilCompleto } from '../services/treino-core.service';
import {
  validarPerfilCompleto,
  validarFrequenciaSemanal,
  validarTreinosGerados,
  validarDadosOnboarding,
  validarTreinoIndividual
} from '../services/treino-validation.service';
import { distribuirDiasSemana } from '../services/split-generator.service';

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

async function limparTreinos(userId: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const deletados = await prisma.treino.deleteMany({
    where: {
      userId,
      criadoPor: 'IA',
      data: { gte: hoje }
    }
  });
  
  console.log(`🧹 ${deletados.count} treino(s) deletado(s) para teste`);
}

async function buscarUsuarioPorEmail(email: string) {
  const usuario = await prisma.user.findUnique({
    where: { email },
    include: {
      perfil: true
    }
  });
  
  return usuario;
}

function criarPerfilTeste(frequencia: number): PerfilCompleto {
  return {
    idade: 30,
    sexo: 'Masculino',
    altura: 175,
    pesoAtual: 75,
    percentualGordura: 15,
    tipoCorpo: 'Mesomorfo',
    experiencia: 'Intermediário',
    objetivo: 'Hipertrofia',
    problemasAnteriores: [],
    lesoes: [],
    objetivosAdicionais: [],
    rpePreferido: 8,
    frequenciaSemanal: frequencia,
    tempoDisponivel: 60,
    localTreino: 'Academia',
    preferencias: [],
    aguaDiaria: '2L'
  };
}

// ============================================================================
// TESTES DE VALIDAÇÃO
// ============================================================================

async function testarFrequenciaSemanal() {
  console.log('\n📊 TESTE 1: Validação de Frequência Semanal');
  console.log('='.repeat(60));
  
  const frequencias = [1, 2, 3, 4, 5, 6];
  
  for (const freq of frequencias) {
    const validacao = validarFrequenciaSemanal(freq);
    const dias = distribuirDiasSemana(freq);
    
    console.log(`\nFrequência: ${freq} dias/semana`);
    console.log(`  Dias distribuídos: [${dias.join(', ')}]`);
    console.log(`  Válido: ${validacao.valido ? '✅' : '❌'}`);
    
    if (validacao.erros.length > 0) {
      console.log(`  Erros: ${validacao.erros.join('; ')}`);
    }
    
    if (validacao.avisos.length > 0) {
      console.log(`  Avisos: ${validacao.avisos.join('; ')}`);
    }
  }
}

async function testarGeracaoTreinos(userId: string, frequencias: number[] = [3, 5]) {
  console.log('\n🏋️ TESTE 2: Geração e Validação de Treinos');
  console.log('='.repeat(60));
  
  for (const frequencia of frequencias) {
    console.log(`\n📅 Testando frequência: ${frequencia} dias/semana`);
    console.log('-'.repeat(60));
    
    // Limpar treinos anteriores
    await limparTreinos(userId);
    
    // Buscar perfil do usuário
    const perfilDb = await prisma.perfil.findUnique({
      where: { userId }
    });
    
    if (!perfilDb) {
      console.error(`❌ Perfil não encontrado para usuário ${userId}`);
      continue;
    }
    
    // Atualizar frequência no perfil para teste
    await prisma.perfil.update({
      where: { userId },
      data: { frequenciaSemanal: frequencia }
    });
    
    // Converter para PerfilCompleto
    const perfil: PerfilCompleto = {
      idade: perfilDb.idade,
      sexo: perfilDb.sexo,
      altura: perfilDb.altura,
      pesoAtual: perfilDb.pesoAtual,
      percentualGordura: perfilDb.percentualGordura,
      tipoCorpo: perfilDb.tipoCorpo,
      experiencia: perfilDb.experiencia,
      problemasAnteriores: perfilDb.problemasAnteriores || [],
      lesoes: perfilDb.lesoes || [],
      objetivo: perfilDb.objetivo,
      objetivosAdicionais: perfilDb.objetivosAdicionais || [],
      rpePreferido: perfilDb.rpePreferido,
      frequenciaSemanal: frequencia,
      tempoDisponivel: perfilDb.tempoDisponivel,
      localTreino: perfilDb.localTreino,
      preferencias: perfilDb.preferencias || [],
      aguaDiaria: perfilDb.aguaDiaria
    };
    
    // Validar perfil
    const validacaoPerfil = validarPerfilCompleto(perfil);
    if (!validacaoPerfil.valido) {
      console.error(`❌ Perfil inválido: ${validacaoPerfil.erros.join('; ')}`);
      continue;
    }
    
    // Gerar treinos
    try {
      console.log(`🔄 Gerando treinos...`);
      await regenerarTreinos30Dias(userId, perfil);
      
      // Validar quantidade de treinos
      const validacaoQuantidade = await validarTreinosGerados(userId, frequencia);
      
      console.log(`\n📊 Resultados:`);
      console.log(`  Total de treinos: ${validacaoQuantidade.totalTreinos}`);
      console.log(`  Treinos por semana (média): ${validacaoQuantidade.treinosPorSemana.toFixed(1)}`);
      console.log(`  Esperado: ${frequencia} treinos/semana`);
      console.log(`  Válido: ${validacaoQuantidade.valido ? '✅' : '❌'}`);
      console.log(`  Dias utilizados: [${validacaoQuantidade.diasUtilizados.join(', ')}]`);
      
      if (validacaoQuantidade.erros.length > 0) {
        console.log(`  ❌ Erros: ${validacaoQuantidade.erros.join('; ')}`);
      }
      
      if (validacaoQuantidade.avisos.length > 0) {
        console.log(`  ⚠️ Avisos: ${validacaoQuantidade.avisos.join('; ')}`);
      }
      
      // Validar dados do onboarding
      const validacaoOnboarding = await validarDadosOnboarding(userId, perfil);
      
      console.log(`\n📋 Validação de Onboarding:`);
      console.log(`  Frequência: ${validacaoOnboarding.validacoes.frequencia ? '✅' : '❌'}`);
      console.log(`  Tempo disponível: ${validacaoOnboarding.validacoes.tempoDisponivel ? '✅' : '❌'}`);
      console.log(`  Local de treino: ${validacaoOnboarding.validacoes.localTreino ? '✅' : '❌'}`);
      console.log(`  Experiência: ${validacaoOnboarding.validacoes.experiencia ? '✅' : '❌'}`);
      console.log(`  Lesões: ${validacaoOnboarding.validacoes.lesoes ? '✅' : '❌'}`);
      console.log(`  Válido geral: ${validacaoOnboarding.valido ? '✅' : '❌'}`);
      
      if (validacaoOnboarding.erros.length > 0) {
        console.log(`  ❌ Erros: ${validacaoOnboarding.erros.slice(0, 3).join('; ')}`);
        if (validacaoOnboarding.erros.length > 3) {
          console.log(`     ... e mais ${validacaoOnboarding.erros.length - 3} erro(s)`);
        }
      }
      
      if (validacaoOnboarding.avisos.length > 0) {
        console.log(`  ⚠️ Avisos: ${validacaoOnboarding.avisos.slice(0, 3).join('; ')}`);
        if (validacaoOnboarding.avisos.length > 3) {
          console.log(`     ... e mais ${validacaoOnboarding.avisos.length - 3} aviso(s)`);
        }
      }
      
    } catch (error: any) {
      console.error(`❌ Erro ao gerar treinos: ${error.message}`);
    }
  }
}

async function validarTreinoEspecifico(userId: string, treinoId?: string) {
  console.log('\n🔍 TESTE 3: Validação de Treino Individual');
  console.log('='.repeat(60));
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  // Buscar um treino recente se não foi fornecido
  let treino;
  if (treinoId) {
    treino = await prisma.treino.findUnique({
      where: { id: treinoId },
      include: {
        exercicios: {
          include: { exercicio: true },
          orderBy: { ordem: 'asc' }
        }
      }
    });
  } else {
    treino = await prisma.treino.findFirst({
      where: {
        userId,
        data: { gte: hoje },
        criadoPor: 'IA'
      },
      include: {
        exercicios: {
          include: { exercicio: true },
          orderBy: { ordem: 'asc' }
        }
      },
      orderBy: { data: 'asc' }
    });
  }
  
  if (!treino) {
    console.log('❌ Nenhum treino encontrado para validação');
    return;
  }
  
  const perfilDb = await prisma.perfil.findUnique({
    where: { userId }
  });
  
  if (!perfilDb) {
    console.log('❌ Perfil não encontrado');
    return;
  }
  
  const perfil: PerfilCompleto = {
    idade: perfilDb.idade,
    sexo: perfilDb.sexo,
    altura: perfilDb.altura,
    pesoAtual: perfilDb.pesoAtual,
    percentualGordura: perfilDb.percentualGordura,
    tipoCorpo: perfilDb.tipoCorpo,
    experiencia: perfilDb.experiencia,
    problemasAnteriores: perfilDb.problemasAnteriores || [],
    lesoes: perfilDb.lesoes || [],
    objetivo: perfilDb.objetivo,
    objetivosAdicionais: perfilDb.objetivosAdicionais || [],
    rpePreferido: perfilDb.rpePreferido,
    frequenciaSemanal: perfilDb.frequenciaSemanal,
    tempoDisponivel: perfilDb.tempoDisponivel,
    localTreino: perfilDb.localTreino,
    preferencias: perfilDb.preferencias || [],
    aguaDiaria: perfilDb.aguaDiaria
  };
  
  const validacao = await validarTreinoIndividual(treino.id, perfil);
  
  console.log(`\n📋 Treino: ${treino.nome}`);
  console.log(`   Data: ${treino.data.toLocaleDateString('pt-BR')}`);
  console.log(`   Tempo estimado: ${treino.tempoEstimado}min`);
  console.log(`   Tempo disponível: ${perfil.tempoDisponivel || 'N/A'}min`);
  console.log(`   Grupos musculares: ${validacao.gruposMusculares.join(', ')}`);
  console.log(`   Válido: ${validacao.valido ? '✅' : '❌'}`);
  
  if (validacao.erros.length > 0) {
    console.log(`\n❌ Erros:`);
    validacao.erros.forEach(erro => console.log(`   - ${erro}`));
  }
  
  if (validacao.avisos.length > 0) {
    console.log(`\n⚠️ Avisos:`);
    validacao.avisos.forEach(aviso => console.log(`   - ${aviso}`));
  }
  
  if (validacao.gruposComLesoes.length > 0) {
    console.log(`\n⚠️ Grupos com lesões encontrados:`);
    validacao.gruposComLesoes.forEach(grupo => console.log(`   - ${grupo}`));
  }
  
  if (validacao.exerciciosIncompativeis.length > 0) {
    console.log(`\n⚠️ Exercícios incompatíveis:`);
    validacao.exerciciosIncompativeis.slice(0, 5).forEach(ex => console.log(`   - ${ex}`));
  }
}

// ============================================================================
// FUNÇÃO PRINCIPAL
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  
  console.log('🚀 SCRIPT DE VALIDAÇÃO DE GERAÇÃO DE TREINOS');
  console.log('='.repeat(60));
  
  if (args.length === 0) {
    console.log('\nUso: npx ts-node backend/src/scripts/validar-geracao-treinos.ts [userId|email] [opções]');
    console.log('\nOpções:');
    console.log('  --teste-frequencias: Testa apenas validação de frequências (não precisa userId)');
    console.log('  --frequencias=3,5: Especifica frequências para testar (padrão: 3,5)');
    console.log('  --treino-id=xxx: Valida um treino específico');
    console.log('\nExemplos:');
    console.log('  npx ts-node backend/src/scripts/validar-geracao-treinos.ts user-id-123');
    console.log('  npx ts-node backend/src/scripts/validar-geracao-treinos.ts user@email.com --frequencias=1,3,5');
    console.log('  npx ts-node backend/src/scripts/validar-geracao-treinos.ts --teste-frequencias');
    process.exit(1);
  }
  
  const primeiroArg = args[0];
  const opcoes: Record<string, string> = {};
  
  // Parse opções
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      opcoes[key] = value || 'true';
    }
  });
  
  // Teste apenas de frequências
  if (opcoes['teste-frequencias']) {
    await testarFrequenciaSemanal();
    await prisma.$disconnect();
    return;
  }
  
  // Buscar usuário
  let usuario;
  if (primeiroArg.includes('@')) {
    // É um email
    usuario = await buscarUsuarioPorEmail(primeiroArg);
  } else {
    // É um userId
    usuario = await prisma.user.findUnique({
      where: { id: primeiroArg },
      include: { perfil: true }
    });
  }
  
  if (!usuario) {
    console.error(`❌ Usuário não encontrado: ${primeiroArg}`);
    process.exit(1);
  }
  
  if (!usuario.perfil) {
    console.error(`❌ Usuário não possui perfil`);
    process.exit(1);
  }
  
  console.log(`\n👤 Usuário: ${usuario.nome || usuario.email}`);
  console.log(`   ID: ${usuario.id}`);
  
  // Teste 1: Validação de frequências
  await testarFrequenciaSemanal();
  
  // Teste 2: Geração e validação de treinos
  const frequenciasStr = opcoes['frequencias'] || '3,5';
  const frequencias = frequenciasStr.split(',').map(f => parseInt(f.trim())).filter(f => !isNaN(f));
  
  await testarGeracaoTreinos(usuario.id, frequencias);
  
  // Teste 3: Validação de treino específico
  if (opcoes['treino-id']) {
    await validarTreinoEspecifico(usuario.id, opcoes['treino-id']);
  } else {
    await validarTreinoEspecifico(usuario.id);
  }
  
  console.log('\n✅ Validações concluídas!');
  await prisma.$disconnect();
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}
