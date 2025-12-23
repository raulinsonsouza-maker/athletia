import { prisma } from '../lib/prisma'
import { GRUPOS_ESPECIFICOS_LISTA } from './inteligencia-treinos.service'
import { buscarVisuaisAtivos, gerarSlugGrupo } from './grupo-muscular-visual.service'
import { calcularCargaExercicio } from './workout-intelligence.service'
import { gerarTreinoUnificado, PerfilCompleto, extrairGruposMuscularesDeTreino } from './treino-core.service'

/**
 * Gera treino rápido baseado nas escolhas do usuário
 * Respeita grupos musculares, duração, dificuldade e local de treino selecionados
 */
export async function gerarTreinoRapido(
  userId: string,
  data: {
    gruposMusculares: string[]
    duracao: number
    dificuldade: 'Iniciante' | 'Intermediário' | 'Avançado'
    localTreino: string
    focoMuscular?: string[]
    corpoTodo?: boolean
    data?: Date
  }
) {
  const dataTreino = data.data || new Date();
  const gruposSelecionados = data.corpoTodo 
    ? ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Quadríceps', 'Posteriores', 'Glúteos', 'Panturrilhas', 'Abdômen']
    : data.gruposMusculares || [];

  if (gruposSelecionados.length === 0) {
    throw new Error('Selecione ao menos um grupo muscular ou ative "Corpo todo"');
  }

  console.log(`[TREINO RÁPIDO] Grupos selecionados: ${gruposSelecionados.join(', ')}`);
  console.log(`[TREINO RÁPIDO] Duração: ${data.duracao}min, Dificuldade: ${data.dificuldade}, Local: ${data.localTreino}`);

  // Buscar perfil do usuário
  const perfil = await prisma.perfil.findUnique({
    where: { userId }
  });

  if (!perfil) {
    throw new Error('Perfil não encontrado. Complete o onboarding primeiro.');
  }

  // Converter perfil para formato completo
  const perfilCompleto: PerfilCompleto = {
    idade: perfil.idade,
    sexo: perfil.sexo,
    altura: perfil.altura,
    pesoAtual: perfil.pesoAtual,
    percentualGordura: perfil.percentualGordura,
    tipoCorpo: perfil.tipoCorpo,
    experiencia: perfil.experiencia,
    problemasAnteriores: perfil.problemasAnteriores || [],
    lesoes: perfil.lesoes || [],
    objetivo: perfil.objetivo,
    objetivosAdicionais: perfil.objetivosAdicionais || [],
    rpePreferido: perfil.rpePreferido,
    frequenciaSemanal: perfil.frequenciaSemanal,
    tempoDisponivel: perfil.tempoDisponivel,
    localTreino: perfil.localTreino,
    preferencias: perfil.preferencias || [],
    aguaDiaria: perfil.aguaDiaria
  };

  // Gerar treino usando motor centralizado
  const treinoGerado = await gerarTreinoUnificado({
    userId,
    data: dataTreino,
    tipo: 'RAPIDO',
    gruposSelecionados: gruposSelecionados,
    duracao: data.duracao,
    dificuldade: data.dificuldade,
    localTreino: data.localTreino,
    perfil: perfilCompleto,
    aplicarDadosOnboarding: true,
    nome: 'Treino Rápido' // Grupos são exibidos separadamente em amarelo
  });

  if (!treinoGerado) {
    throw new Error('Não foi possível gerar treino rápido.');
  }

  // Buscar treino completo do banco
  const treinoCompleto = await prisma.treino.findUnique({
    where: { id: treinoGerado.id },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    }
  });

  if (!treinoCompleto) {
    throw new Error('Erro ao buscar treino criado');
  }

  // Calcular e atualizar cargas dos exercícios de força
  const exerciciosForca = treinoCompleto.exercicios.filter(ex => 
    ex.exercicio?.grupoMuscularPrincipal !== 'Cardio' && 
    ex.exercicio?.grupoMuscularPrincipal !== 'Flexibilidade' &&
    ex.exercicio?.grupoMuscularPrincipal !== 'Alongamento'
  );

  for (const exercicioTreino of exerciciosForca) {
    if (exercicioTreino.exercicio) {
      try {
        const carga = await calcularCargaExercicio(
          userId,
          exercicioTreino.exercicio.id,
          perfil.pesoAtual || 70,
          exercicioTreino.exercicio.grupoMuscularPrincipal || '',
          data.dificuldade || 'Iniciante',
          exercicioTreino.repeticoes || '8-12'
        );

        if (carga && carga > 0) {
          await prisma.exercicioTreino.update({
            where: { id: exercicioTreino.id },
            data: { carga }
          });
        }
      } catch (error) {
        console.warn(`[TREINO RÁPIDO] Erro ao calcular carga para ${exercicioTreino.exercicio.nome}:`, error);
      }
    }
  }

  // Buscar treino atualizado com cargas
  const treinoFinal = await prisma.treino.findUnique({
    where: { id: treinoGerado.id },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    }
  });

  if (!treinoFinal) {
    throw new Error('Erro ao buscar treino final');
  }

  // Atualizar nome baseado nos grupos musculares reais dos exercícios
  // Simplificar nome para apenas "Treino Rápido" - grupos são exibidos separadamente em amarelo
  const nomeAtualizado = 'Treino Rápido';
  
  // Atualizar nome no banco se diferente
  if (nomeAtualizado !== treinoFinal.nome) {
    await prisma.treino.update({
        where: { id: treinoFinal.id },
        data: { nome: nomeAtualizado }
      });
      treinoFinal.nome = nomeAtualizado;
    }
  }

  console.log(`[TREINO RÁPIDO] Treino criado com sucesso! ID: ${treinoGerado.id}`);

  return treinoFinal;
}

type VisualItem = Awaited<ReturnType<typeof buscarVisuaisAtivos>>[number]

export async function listarGruposMuscularesDisponiveis(): Promise<{
  gruposPrincipais: Array<{ nome: string; slug: string; imagemUrl: string | null; descricao?: string | null }>
  gruposEspecificos: string[]
}> {
  // Buscar apenas grupos visuais ativos (mesma fonte do painel admin)
  const visuais = await buscarVisuaisAtivos()

  // Mapear para o formato esperado pelo frontend
  const gruposPrincipais = visuais.map((visual) => ({
    nome: visual.nome,
    slug: visual.slug,
    imagemUrl: visual.imagemUrl || null,
    descricao: visual.descricao ?? null
  }))

  return {
    gruposPrincipais,
    gruposEspecificos: GRUPOS_ESPECIFICOS_LISTA
  }
}
