/**
 * SISTEMA DE IMAGENS INTELIGENTES PARA TREINOS
 * 
 * Mapeamento centralizado de imagens por grupo muscular e gênero.
 * Todas as imagens de treino devem ser obtidas através deste módulo.
 */

// ============================================================================
// MAPEAMENTO DE IMAGENS POR GRUPO MUSCULAR
// ============================================================================

interface ImagensGenero {
  masculino: string;
  feminino: string;
  neutro: string;
}

const IMAGENS_GRUPOS: Record<string, ImagensGenero> = {
  // Upper Body - Push
  'Peito': {
    masculino: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1000&q=80',
    feminino: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&w=1000&q=80',
    neutro: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1000&q=80'
  },
  'Ombros': {
    masculino: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=1000&q=80',
    feminino: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
    neutro: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=1000&q=80'
  },
  'Tríceps': {
    masculino: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?auto=format&fit=crop&w=1000&q=80',
    feminino: 'https://images.unsplash.com/photo-1609899464926-209d2d9d32e9?auto=format&fit=crop&w=1000&q=80',
    neutro: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?auto=format&fit=crop&w=1000&q=80'
  },

  // Upper Body - Pull
  'Costas': {
    masculino: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=1000&q=80',
    feminino: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=1000&q=80',
    neutro: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=1000&q=80'
  },
  'Bíceps': {
    masculino: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1000&q=80',
    feminino: 'https://images.unsplash.com/photo-1609899464926-209d2d9d32e9?auto=format&fit=crop&w=1000&q=80',
    neutro: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1000&q=80'
  },
  'Trapézio': {
    masculino: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=1000&q=80',
    feminino: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=1000&q=80',
    neutro: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=1000&q=80'
  },

  // Lower Body
  'Quadríceps': {
    masculino: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=1000&q=80',
    feminino: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1000&q=80',
    neutro: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=1000&q=80'
  },
  'Posteriores': {
    masculino: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1000&q=80',
    feminino: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1000&q=80',
    neutro: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1000&q=80'
  },
  'Glúteos': {
    masculino: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1000&q=80',
    feminino: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1000&q=80',
    neutro: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1000&q=80'
  },
  'Panturrilhas': {
    masculino: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=1000&q=80',
    feminino: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1000&q=80',
    neutro: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=1000&q=80'
  },

  // Core
  'Abdômen': {
    masculino: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=80',
    feminino: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
    neutro: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=80'
  },
  'Lombar': {
    masculino: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=80',
    feminino: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
    neutro: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=80'
  },
  'Oblíquos': {
    masculino: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=80',
    feminino: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
    neutro: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=80'
  }
};

// Imagens padrão para categorias de treino
const IMAGENS_CATEGORIAS: Record<string, ImagensGenero> = {
  'Full Body': {
    masculino: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80',
    feminino: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1000&q=80',
    neutro: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80'
  },
  'Superior': {
    masculino: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?auto=format&fit=crop&w=1000&q=80',
    feminino: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&w=1000&q=80',
    neutro: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?auto=format&fit=crop&w=1000&q=80'
  },
  'Inferior': {
    masculino: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=1000&q=80',
    feminino: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1000&q=80',
    neutro: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=1000&q=80'
  },
  'Push': {
    masculino: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1000&q=80',
    feminino: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&w=1000&q=80',
    neutro: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1000&q=80'
  },
  'Pull': {
    masculino: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=1000&q=80',
    feminino: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=1000&q=80',
    neutro: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=1000&q=80'
  },
  'Pernas': {
    masculino: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=1000&q=80',
    feminino: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1000&q=80',
    neutro: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=1000&q=80'
  },
  'Braços': {
    masculino: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1000&q=80',
    feminino: 'https://images.unsplash.com/photo-1609899464926-209d2d9d32e9?auto=format&fit=crop&w=1000&q=80',
    neutro: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1000&q=80'
  }
};

// Imagem padrão fallback
const IMAGEM_PADRAO: ImagensGenero = {
  masculino: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80',
  feminino: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1000&q=80',
  neutro: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80'
};

// ============================================================================
// FUNÇÕES DE SELEÇÃO DE IMAGEM
// ============================================================================

type Genero = 'Masculino' | 'Feminino' | 'masculino' | 'feminino' | string | null | undefined;

function normalizarGenero(genero: Genero): 'masculino' | 'feminino' | 'neutro' {
  if (!genero) return 'neutro';
  const lower = genero.toLowerCase();
  if (lower === 'masculino' || lower === 'homem' || lower === 'm') return 'masculino';
  if (lower === 'feminino' || lower === 'mulher' || lower === 'f') return 'feminino';
  return 'neutro';
}

/**
 * Obtém a imagem mais adequada para um grupo muscular específico
 */
export function obterImagemGrupo(grupo: string, genero?: Genero): string {
  const generoNorm = normalizarGenero(genero);
  const imagensGrupo = IMAGENS_GRUPOS[grupo];
  
  if (imagensGrupo) {
    return imagensGrupo[generoNorm];
  }
  
  return IMAGEM_PADRAO[generoNorm];
}

/**
 * Obtém a imagem para um treino baseado nos grupos musculares principais
 */
export function obterImagemTreino(grupos: string[], genero?: Genero): string {
  const generoNorm = normalizarGenero(genero);
  
  if (!grupos || grupos.length === 0) {
    return IMAGEM_PADRAO[generoNorm];
  }
  
  // Se tem apenas um grupo, usar imagem desse grupo
  if (grupos.length === 1) {
    return obterImagemGrupo(grupos[0], genero);
  }
  
  // Detectar categoria baseada nos grupos
  const grupoPrincipal = grupos[0];
  
  // Grupos superiores
  const gruposSuperiores = ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Trapézio'];
  const gruposInferiores = ['Quadríceps', 'Posteriores', 'Glúteos', 'Panturrilhas'];
  const gruposCore = ['Abdômen', 'Lombar', 'Oblíquos'];
  
  const temSuperior = grupos.some(g => gruposSuperiores.includes(g));
  const temInferior = grupos.some(g => gruposInferiores.includes(g));
  const temCore = grupos.some(g => gruposCore.includes(g));
  
  // Full body (tem superior e inferior)
  if (temSuperior && temInferior) {
    return IMAGENS_CATEGORIAS['Full Body'][generoNorm];
  }
  
  // Treino de pernas
  if (temInferior && !temSuperior) {
    return IMAGENS_CATEGORIAS['Inferior'][generoNorm];
  }
  
  // Treino superior
  if (temSuperior && !temInferior) {
    // Verificar se é Push (Peito, Ombros, Tríceps)
    const gruposPush = ['Peito', 'Ombros', 'Tríceps'];
    const gruposPull = ['Costas', 'Bíceps', 'Trapézio'];
    
    const ehPush = grupos.every(g => gruposPush.includes(g) || gruposCore.includes(g));
    const ehPull = grupos.every(g => gruposPull.includes(g) || gruposCore.includes(g));
    
    if (ehPush) return IMAGENS_CATEGORIAS['Push'][generoNorm];
    if (ehPull) return IMAGENS_CATEGORIAS['Pull'][generoNorm];
    
    return IMAGENS_CATEGORIAS['Superior'][generoNorm];
  }
  
  // Fallback: usar imagem do primeiro grupo
  return obterImagemGrupo(grupoPrincipal, genero);
}


