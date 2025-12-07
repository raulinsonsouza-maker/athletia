/**
 * Script de Validação de Treinos Gerados
 * 
 * Valida que os treinos gerados seguem a nova lógica centralizada
 */

import { prisma } from '../src/lib/prisma';

interface Estatisticas {
  totalUsuarios: number;
  usuariosComTreinos: number;
  usuariosSemTreinos: number;
  totalTreinos: number;
  treinosFuturos: number;
  treinosPassados: number;
  treinosIA: number;
  treinosManuais: number;
  mediaExerciciosPorTreino: number;
  erros: string[];
}

/**
 * Valida estrutura de um treino
 */
function validarEstruturaTreino(treino: any): string[] {
  const erros: string[] = [];

  if (!treino.nome) {
    erros.push('Treino sem nome');
  }

  if (!treino.data) {
    erros.push('Treino sem data');
  }

  if (!treino.exercicios || treino.exercicios.length === 0) {
    erros.push('Treino sem exercícios');
  } else {
    // Verificar se tem cardio, força e alongamento
    const grupos = treino.exercicios.map((ex: any) => 
      ex.exercicio?.grupoMuscularPrincipal || ''
    );
    
    const temCardio = grupos.some((g: string) => g === 'Cardio');
    const temForca = grupos.some((g: string) => 
      g !== 'Cardio' && g !== 'Alongamento' && g !== 'Flexibilidade'
    );
    const temAlongamento = grupos.some((g: string) => 
      g === 'Alongamento' || g === 'Flexibilidade'
    );

    if (treino.criadoPor === 'IA') {
      if (!temCardio) {
        erros.push('Treino IA sem cardio');
      }
      if (!temForca) {
        erros.push('Treino IA sem exercícios de força');
      }
      if (!temAlongamento) {
        erros.push('Treino IA sem alongamento');
      }
    }
  }

  return erros;
}

/**
 * Executa validação completa
 */
async function executarValidacao(): Promise<Estatisticas> {
  console.log('========================================');
  console.log('VALIDAÇÃO DE TREINOS GERADOS');
  console.log('========================================\n');

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataLimite = new Date(hoje);
  dataLimite.setDate(hoje.getDate() + 30);

  // Buscar todos os usuários ativos
  const usuarios = await prisma.user.findMany({
    where: { planoAtivo: true },
    include: {
      perfil: true
    }
  });

  const totalUsuarios = usuarios.length;
  let usuariosComTreinos = 0;
  let usuariosSemTreinos = 0;
  let totalTreinos = 0;
  let treinosFuturos = 0;
  let treinosPassados = 0;
  let treinosIA = 0;
  let treinosManuais = 0;
  let totalExercicios = 0;
  const erros: string[] = [];

  for (const usuario of usuarios) {
    const treinos = await prisma.treino.findMany({
      where: { userId: usuario.id },
      include: {
        exercicios: {
          include: { exercicio: true },
          orderBy: { ordem: 'asc' }
        }
      }
    });

    if (treinos.length === 0) {
      usuariosSemTreinos++;
      if (usuario.perfil) {
        erros.push(`Usuário ${usuario.id} (${usuario.email}) sem treinos mas com perfil`);
      }
    } else {
      usuariosComTreinos++;
      totalTreinos += treinos.length;

      for (const treino of treinos) {
        const dataTreino = new Date(treino.data);
        
        if (dataTreino >= hoje) {
          treinosFuturos++;
        } else {
          treinosPassados++;
        }

        if (treino.criadoPor === 'IA') {
          treinosIA++;
        } else {
          treinosManuais++;
        }

        totalExercicios += treino.exercicios.length;

        // Validar estrutura
        const errosTreino = validarEstruturaTreino(treino);
        if (errosTreino.length > 0) {
          erros.push(`Treino ${treino.id} (${usuario.email}): ${errosTreino.join(', ')}`);
        }
      }
    }
  }

  const mediaExerciciosPorTreino = totalTreinos > 0 
    ? (totalExercicios / totalTreinos).toFixed(2)
    : '0';

  return {
    totalUsuarios,
    usuariosComTreinos,
    usuariosSemTreinos,
    totalTreinos,
    treinosFuturos,
    treinosPassados,
    treinosIA,
    treinosManuais,
    mediaExerciciosPorTreino: parseFloat(mediaExerciciosPorTreino),
    erros
  };
}

/**
 * Exibe estatísticas
 */
function exibirEstatisticas(stats: Estatisticas) {
  console.log('========================================');
  console.log('ESTATÍSTICAS');
  console.log('========================================');
  console.log(`Total de usuários ativos: ${stats.totalUsuarios}`);
  console.log(`Usuários com treinos: ${stats.usuariosComTreinos}`);
  console.log(`Usuários sem treinos: ${stats.usuariosSemTreinos}`);
  console.log(`Total de treinos: ${stats.totalTreinos}`);
  console.log(`Treinos futuros: ${stats.treinosFuturos}`);
  console.log(`Treinos passados: ${stats.treinosPassados}`);
  console.log(`Treinos IA: ${stats.treinosIA}`);
  console.log(`Treinos manuais: ${stats.treinosManuais}`);
  console.log(`Média de exercícios por treino: ${stats.mediaExerciciosPorTreino}`);
  console.log('========================================\n');

  if (stats.erros.length > 0) {
    console.log('========================================');
    console.log('ERROS ENCONTRADOS');
    console.log('========================================');
    stats.erros.forEach((erro, index) => {
      console.log(`${index + 1}. ${erro}`);
    });
    console.log('========================================\n');
    console.log(`⚠️  Total de erros: ${stats.erros.length}`);
  } else {
    console.log('✅ Nenhum erro encontrado!');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  executarValidacao()
    .then((stats) => {
      exibirEstatisticas(stats);
      process.exit(stats.erros.length > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Erro durante validação:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

export { executarValidacao, exibirEstatisticas };

