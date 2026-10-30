/**
 * ONBOARDING ADAPTER SERVICE
 *
 * Repassa o que a pessoa escolheu no onboarding.
 * Objetivo e tempo não são reescritos. Lesão, problemas e objetivos
 * adicionais ajustam intensidade e a escolha do movimento.
 */

import { PerfilCompleto, TreinoOptions } from './treino-core.service';

const NIVEIS = ['Iniciante', 'Intermediário', 'Avançado'] as const;

function normalizar(valor: string): string {
  return valor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function experienciaEfetiva(perfil?: Pick<PerfilCompleto, 'experiencia' | 'problemasAnteriores'> | null): string | undefined {
  const atual = perfil?.experiencia || undefined;
  if (!atual) return undefined;
  const duros = (perfil?.problemasAnteriores || []).some((item) => normalizar(item).includes('muito duro'));
  if (!duros) return atual;
  const indice = NIVEIS.indexOf(atual as typeof NIVEIS[number]);
  if (indice <= 0) return 'Iniciante';
  return NIVEIS[indice - 1];
}

export function ajusteRpe(perfil?: Pick<PerfilCompleto, 'problemasAnteriores' | 'objetivosAdicionais'> | null): { delta: number; teto?: number } {
  const problemas = perfil?.problemasAnteriores || [];
  const objetivos = perfil?.objetivosAdicionais || [];
  const delta = problemas.some((item) => normalizar(item).includes('muito duro')) ? -1 : 0;
  const teto = objetivos.some((item) => /sono|estresse/.test(normalizar(item))) ? 7 : undefined;
  return { delta, teto };
}

export function cardioCurto(perfil?: Pick<PerfilCompleto, 'problemasAnteriores'> | null): boolean {
  return (perfil?.problemasAnteriores || []).some((item) => normalizar(item).includes('falta de tempo'));
}

export function evitarAltoImpacto(perfil?: Pick<PerfilCompleto, 'tipoCorpo'> | null): boolean {
  const tipo = normalizar(perfil?.tipoCorpo || '');
  return tipo.includes('obesidade') || tipo.includes('acima do peso') || tipo.includes('endomorfo');
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
 * A lesão não apaga o grupo do dia. O movimento que sobrecarrega a região
 * sai na hora de escolher o exercício.
 */
export function filtrarGruposPorLesoes(grupos: string[], _lesoes: string[]): string[] {
  return grupos;
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
  return {
    ...opcoesTreino,
    objetivo: perfil.objetivo || opcoesTreino.objetivo,
    experiencia: experienciaEfetiva(perfil) || opcoesTreino.experiencia,
    tempoDisponivel: perfil.tempoDisponivel || opcoesTreino.tempoDisponivel,
    localTreino: perfil.localTreino || opcoesTreino.localTreino,
    frequenciaSemanal: perfil.frequenciaSemanal || opcoesTreino.frequenciaSemanal,
    perfil
  };
}

