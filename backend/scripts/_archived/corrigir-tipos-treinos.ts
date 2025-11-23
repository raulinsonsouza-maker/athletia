import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Determina divisão de treino baseada na frequência semanal
 */
function determinarDivisaoTreino(frequenciaSemanal: number): string {
  if (frequenciaSemanal === 1) return 'A';
  if (frequenciaSemanal === 2) return 'A-B';
  if (frequenciaSemanal === 3) return 'A-B-C';
  if (frequenciaSemanal === 4) return 'A-B-C-D';
  if (frequenciaSemanal === 5) return 'A-B-C-D-E';
  if (frequenciaSemanal === 6) return 'A-B-C-D-E-F';
  return 'A-B-C'; // Default para 3x
}

/**
 * Determina tipo de treino baseado na divisão e ciclo
 */
function determinarTipoTreinoABC(divisao: string, ciclo: number): 'A' | 'B' | 'C' | 'D' | 'E' | 'F' {
  if (divisao === 'A') {
    return 'A';
  } else if (divisao === 'A-B') {
    const cicloMod = ciclo % 2;
    return cicloMod === 0 ? 'A' : 'B';
  } else if (divisao === 'A-B-C') {
    const cicloMod = ciclo % 3;
    if (cicloMod === 0) return 'A';
    if (cicloMod === 1) return 'B';
    return 'C';
  } else if (divisao === 'A-B-C-D') {
    const cicloMod = ciclo % 4;
    if (cicloMod === 0) return 'A';
    if (cicloMod === 1) return 'B';
    if (cicloMod === 2) return 'C';
    return 'D';
  } else if (divisao === 'A-B-C-D-E') {
    const cicloMod = ciclo % 5;
    if (cicloMod === 0) return 'A';
    if (cicloMod === 1) return 'B';
    if (cicloMod === 2) return 'C';
    if (cicloMod === 3) return 'D';
    return 'E';
  } else if (divisao === 'A-B-C-D-E-F') {
    const cicloMod = ciclo % 6;
    if (cicloMod === 0) return 'A';
    if (cicloMod === 1) return 'B';
    if (cicloMod === 2) return 'C';
    if (cicloMod === 3) return 'D';
    if (cicloMod === 4) return 'E';
    return 'F';
  }
  
  // Default: A-B-C
  const cicloMod = ciclo % 3;
  if (cicloMod === 0) return 'A';
  if (cicloMod === 1) return 'B';
  return 'C';
}

/**
 * Script para corrigir tipos de treino de todos os usuários
 */
async function corrigirTiposTreinos() {
  console.log('🔄 Iniciando correção de tipos de treino para todos os usuários...\n');

  try {
    // Buscar todos os usuários
    const usuarios = await prisma.user.findMany({
      include: {
        perfil: true
      }
    });

    console.log(`📊 Encontrados ${usuarios.length} usuários\n`);

    let totalCorrigidos = 0;
    let totalMantidos = 0;
    let totalErros = 0;

    for (const usuario of usuarios) {
      console.log(`\n👤 Processando usuário: ${usuario.nome || usuario.email} (${usuario.id})`);

      if (!usuario.perfil) {
        console.log('  ⏭️ Usuário sem perfil, pulando...');
        continue;
      }

      const frequenciaSemanal = usuario.perfil.frequenciaSemanal || 3;
      const divisao = determinarDivisaoTreino(frequenciaSemanal);
      console.log(`  📋 Frequência: ${frequenciaSemanal}x/semana → Divisão: ${divisao}`);

      // Buscar todos os treinos do usuário ordenados por data
      const treinos = await prisma.treino.findMany({
        where: {
          userId: usuario.id
        },
        include: {
          exercicios: {
            include: { exercicio: true }
          }
        },
        orderBy: { data: 'asc' }
      });

      // Filtrar apenas treinos válidos (com exercícios de força)
      const treinosValidos = treinos.filter(t => {
        const exerciciosForca = t.exercicios?.filter((ex: any) => {
          const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
          return grupo !== 'Cardio' && grupo !== 'Flexibilidade';
        }) || [];
        return exerciciosForca.length > 0;
      });

      console.log(`  📅 Total de treinos: ${treinos.length} (${treinosValidos.length} válidos)`);

      // Contar treinos passados para calcular ciclo inicial
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const treinosPassados = treinosValidos.filter(t => {
        const dataTreino = new Date(t.data);
        dataTreino.setHours(0, 0, 0, 0);
        return dataTreino.getTime() < hoje.getTime();
      });

      let ciclo = treinosPassados.length;
      console.log(`  🔄 Ciclo inicial: ${ciclo} (${treinosPassados.length} treinos passados)`);

      // Processar cada treino válido
      for (const treino of treinosValidos) {
        const tipoEsperado = determinarTipoTreinoABC(divisao, ciclo);
        const tipoAtual = treino.tipo || 'A';

        if (tipoAtual !== tipoEsperado) {
          console.log(`  ⚠️ Treino ${new Date(treino.data).toLocaleDateString('pt-BR')}: tipo incorreto (${tipoAtual} → ${tipoEsperado})`);
          
          try {
            // Atualizar tipo do treino
            await prisma.treino.update({
              where: { id: treino.id },
              data: { tipo: tipoEsperado }
            });
            
            console.log(`  ✅ Tipo corrigido para ${tipoEsperado}`);
            totalCorrigidos++;
          } catch (error: any) {
            console.error(`  ❌ Erro ao corrigir treino ${treino.id}:`, error.message);
            totalErros++;
          }
        } else {
          totalMantidos++;
        }

        // Incrementar ciclo para próximo treino
        ciclo++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA CORREÇÃO:');
    console.log('='.repeat(60));
    console.log(`✅ Treinos corrigidos: ${totalCorrigidos}`);
    console.log(`✓ Treinos já corretos: ${totalMantidos}`);
    console.log(`❌ Erros: ${totalErros}`);
    console.log('='.repeat(60));

  } catch (error: any) {
    console.error('❌ Erro ao corrigir tipos de treino:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar script
corrigirTiposTreinos()
  .then(() => {
    console.log('\n✅ Correção concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro na correção:', error);
    process.exit(1);
  });

