/**
 * ONBOARDING ADAPTER SERVICE
 * 
 * Adapta dados do onboarding para opções de treino
 * Ajusta objetivo, tempo e parâmetros baseado em perfil completo
 */

import { PerfilCompleto, TreinoOptions } from './treino-core.service';

// ============================================================================
// AJUSTES DE OBJETIVO
// ============================================================================

/**
 * Ajusta objetivo baseado em composição corporal
 */
function ajustarObjetivoPorGordura(
  objetivo: string,
  percentualGordura?: number | null,
  sexo?: string | null
): string {
  if (!percentualGordura) return objetivo;
  
  const limites = sexo === 'Feminino' 
    ? { alto: 30, baixo: 18 }
    : { alto: 20, baixo: 10 };
  
  if (percentualGordura > limites.alto && objetivo !== 'Emagrecimento') {
    return 'Emagrecimento';
  }
  
  if (percentualGordura < limites.baixo && objetivo === 'Emagrecimento') {
    return 'Hipertrofia';
  }
  
  return objetivo;
}

/**
 * Ajusta tempo baseado em tipo de corpo e objetivo
 */
function ajustarTempoPorTipoCorpo(
  tempoDisponivel?: number | null,
  tipoCorpo?: string | null,
  objetivo?: string | null
): number {
  if (!tempoDisponivel) return 60;
  
  if (tipoCorpo) {
    const tipoLower = tipoCorpo.toLowerCase();
    if (tipoLower.includes('ectomorfo') || tipoLower.includes('magro')) {
      return Math.min(90, tempoDisponivel + 10);
    } else if (tipoLower.includes('endomorfo') || tipoLower.includes('sobrepeso')) {
      return Math.max(45, tempoDisponivel);
    }
  }
  
  return tempoDisponivel;
}

// ============================================================================
// MAPEAMENTO DE LESÕES
// ============================================================================

const MAPEAMENTO_LESOES: Record<string, string[]> = {
  'Ombro': ['Ombros'],
  'ombro': ['Ombros'],
  'Ombro direito': ['Ombros'],
  'Ombro esquerdo': ['Ombros'],
  'Joelho': ['Quadríceps', 'Posteriores'],
  'joelho': ['Quadríceps', 'Posteriores'],
  'Joelho direito': ['Quadríceps', 'Posteriores'],
  'Joelho esquerdo': ['Quadríceps', 'Posteriores'],
  'Coluna': ['Costas', 'Posteriores', 'Abdômen'],
  'coluna': ['Costas', 'Posteriores', 'Abdômen'],
  'Lombar': ['Costas', 'Posteriores', 'Abdômen'],
  'lombar': ['Costas', 'Posteriores', 'Abdômen'],
  'Pulso': ['Bíceps', 'Tríceps'],
  'pulso': ['Bíceps', 'Tríceps'],
  'Cotovelo': ['Bíceps', 'Tríceps'],
  'cotovelo': ['Bíceps', 'Tríceps'],
  'Tornozelo': ['Panturrilhas', 'Quadríceps', 'Posteriores'],
  'tornozelo': ['Panturrilhas', 'Quadríceps', 'Posteriores'],
  'Pescoço': ['Ombros', 'Costas'],
  'pescoço': ['Ombros', 'Costas'],
};

/**
 * Mapeia lesões para grupos musculares que devem ser evitados
 */
export function mapearLesoesParaGrupos(lesoes: string[]): string[] {
  const gruposEvitar: string[] = [];
  
  lesoes.forEach(lesao => {
    const grupos = MAPEAMENTO_LESOES[lesao];
    if (grupos) {
      gruposEvitar.push(...grupos);
    } else {
      // Tentar match parcial
      for (const [key, grupos] of Object.entries(MAPEAMENTO_LESOES)) {
        if (lesao.toLowerCase().includes(key.toLowerCase())) {
          gruposEvitar.push(...grupos);
          break;
        }
      }
    }
  });
  
  return Array.from(new Set(gruposEvitar));
}

/**
 * Filtra grupos musculares baseado em lesões do usuário
 */
export function filtrarGruposPorLesoes(grupos: string[], lesoes: string[]): string[] {
  if (!lesoes || lesoes.length === 0) {
    return grupos;
  }
  
  const gruposEvitar = mapearLesoesParaGrupos(lesoes);
  
  if (gruposEvitar.length === 0) {
    return grupos;
  }
  
  const gruposFiltrados = grupos.filter(grupo => !gruposEvitar.includes(grupo));
  
  // Se todos os grupos foram filtrados, garantir pelo menos 2 grupos
  if (gruposFiltrados.length === 0) {
    console.log(`[WARN] Todos os grupos foram filtrados por lesões. Selecionando grupos menos críticos.`);
    const gruposPrioritarios = grupos.filter(grupo => !gruposEvitar.includes(grupo));
    return gruposPrioritarios.length >= 2 
      ? gruposPrioritarios.slice(0, 2) 
      : grupos.slice(0, Math.min(2, grupos.length));
  }
  
  if (gruposFiltrados.length < grupos.length) {
    console.log(`[INFO] Grupos filtrados por lesões: ${gruposEvitar.join(', ')}`);
    console.log(`[INFO] Grupos mantidos: ${gruposFiltrados.join(', ')}`);
  }
  
  return gruposFiltrados;
}

// ============================================================================
// APLICAÇÃO DE DADOS DO ONBOARDING
// ============================================================================

/**
 * Aplica todos os dados do onboarding nas opções de treino
 */
export function aplicarDadosOnboarding(
  perfil: PerfilCompleto,
  opcoesTreino: TreinoOptions
): TreinoOptions {
  // Ajustar objetivo baseado em percentual de gordura
  const objetivoAjustado = ajustarObjetivoPorGordura(
    perfil.objetivo || opcoesTreino.objetivo || 'Hipertrofia',
    perfil.percentualGordura,
    perfil.sexo
  );
  
  // Ajustar tempo baseado em tipo de corpo
  const tempoAjustado = ajustarTempoPorTipoCorpo(
    perfil.tempoDisponivel || opcoesTreino.tempoDisponivel,
    perfil.tipoCorpo,
    objetivoAjustado
  );
  
  return {
    ...opcoesTreino,
    objetivo: objetivoAjustado,
    experiencia: perfil.experiencia || opcoesTreino.experiencia,
    tempoDisponivel: tempoAjustado,
    localTreino: perfil.localTreino || opcoesTreino.localTreino,
    frequenciaSemanal: perfil.frequenciaSemanal || opcoesTreino.frequenciaSemanal,
    perfil
  };
}

